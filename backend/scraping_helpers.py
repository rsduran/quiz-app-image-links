# scraping_helpers.py

import requests
from bs4 import BeautifulSoup, Tag
from urllib.parse import urljoin
import os
import re
from random import choice
import time
from app_init import db
from models import Question  # Changed from relative to absolute import
import config  # Changed from relative to absolute import
from config import img_type_directory  # Changed from relative to absolute import
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Helper functions
def download_image(img_url, path, name):
    full_path = os.path.join('./static/assets/images/background', path)
    if not os.path.exists(full_path):
        os.makedirs(full_path)

    try:
        response = requests.get(img_url, stream=True, verify=False)
        if response.status_code == 200:
            with open(os.path.join(full_path, name), 'wb') as out_file:
                out_file.write(response.content)
            return True
        else:
            print(f"Failed to download image: {img_url} - HTTP Status Code: {response.status_code}")
            return False
    except Exception as e:
        print(f"Exception occurred during image download: {e}")
        return False

def fetch_discussion_comments(discussion_link):
    comments = []
    # Split the URL at the last dash before "#comments"
    base_url = discussion_link.split("#")[0]
    page_number = 1

    while True:
        if page_number == 1:
            page_url = discussion_link  # Use original link for the first page
        else:
            # Correctly construct the URL for subsequent pages
            page_url = f"{base_url}-{page_number}#comments"

        print(f"Fetching comments from URL: {page_url}")

        response = requests.get(page_url, headers={'User-Agent': choice(config.headers_list)}, verify=False)

        if response.status_code != 200:
            print(f"Failed to fetch page: {page_url}")
            break

        soup = BeautifulSoup(response.content, 'html.parser')

        # Determine the total number of pages from the first page
        if page_number == 1:
            discussion_info = soup.find('div', class_='left-box').get_text(strip=True)
            if "Page" in discussion_info:
                total_pages = int(discussion_info.split('Page')[1].split('of')[1].split('.')[0].strip())
            else:
                total_pages = 1
            print(f"Total number of discussion pages: {total_pages}")

        comment_divs = soup.find_all('div', class_='bix-sun-discussion')
        print(f"Found {len(comment_divs)} comment divs on page {page_number}")

        for div in comment_divs:
            user_details = div.find('div', class_='user-details')
            user_content = div.find('div', class_='user-content')
            if user_details and user_content:
                # Extract inner HTML content directly
                comment_inner_html = ''.join(str(child) for child in user_content.contents)
                comment_text = f"{user_details.get_text(strip=True)}: {comment_inner_html}"
                comments.append(comment_text)
                print(f"Extracted comment: {comment_text}")
            else:
                print("No user details or content found in this div")

        page_number += 1
        if page_number > total_pages:
            break

    if not comments:
        print("No comments were extracted")
    return '\n'.join(comments)

def process_question(base_url, url_number, question_counter, quiz_set_id):
    global question_data
    # Check if URL starts with https://
    if not base_url.startswith('https://'):
        base_url = 'https://' + base_url
    url = base_url + str(url_number).zfill(6)
    MAX_RETRIES = 10
    backoff_time = 3  

    for attempt in range(MAX_RETRIES):
        try:
            time.sleep(backoff_time * attempt) 
            page = requests.get(url, headers={'User-Agent': choice(config.headers_list)}, verify=False)
            page.raise_for_status()
            break
        except requests.RequestException as request_exception:
            print(f'Error occurred for {url}, waiting for {backoff_time * attempt} secs before retrying.....')
            if attempt == MAX_RETRIES - 1: 
                print(f"Error fetching {url} after {MAX_RETRIES} attempts, Error: {request_exception}")
                return question_counter 
            continue   
        except Exception as err:
            print(f'An error occurred: {err}')
            return
    else:
        return

    soup = BeautifulSoup(page.content, 'html.parser')
    questions = soup.find_all('div', class_='bix-div-container')

    for question in questions:
        question_dict = {}  # Initialize question_dict here
        try:
            q_text_elem = question.find('div', class_='bix-td-qtxt')
            options_elems = question.find_all('div', class_='bix-td-option-val')
            answer_elem = question.find('input', class_='jq-hdnakq')

            explanation_elem = question.find('div', class_='bix-ans-description')
            discussion_link_elem = question.find('a', class_='discuss')

            explanation = str(explanation_elem).strip() if explanation_elem else 'Explanation not found.'
            discussion_link = discussion_link_elem['href'] if discussion_link_elem else 'Discussion link not found.'

            question_text = str(q_text_elem).strip() if q_text_elem else 'Question not found.'
            # Process the question text to replace <span class="root"> tags
            root_span_in_question = re.search('<span class="root">(.*?)</span>', question_text)
            if root_span_in_question:
                question_text = re.sub(root_span_in_question.group(), f'√({root_span_in_question.group(1).strip()})', question_text)

            answer = answer_elem['value'].upper() if answer_elem else 'Answer not found.'
            if answer not in ['A', 'B', 'C', 'D']:
                raise ValueError('Invalid answer.')
            answer = f"Option {answer}" if answer != 'Answer not found.' else answer

            img_count = {'within': 1, 'after': 1, 'explanation': 1}         
            img_elems = q_text_elem.find_all('img')

            for img_elem in img_elems:
                img_url = urljoin(url, img_elem['src'])
                img_data = str(img_elem.previous) if img_elem.previous else ""
                img_data = re.sub(r'\s+', '', img_data)

                name_type = 'after' if '<br/>' in img_data else 'within'
                placeholder = f'(image)q{question_counter}_{name_type}_{img_count[name_type]}(image)'
                question_text = question_text.replace(str(img_elem), placeholder)

                name = f'q{question_counter}_{name_type}_{img_count[name_type]}.png'
                folder_path = img_type_directory[name_type]

                download_image(img_url, folder_path, name)  
                img_count[name_type] += 1

            img_elems = explanation_elem.find_all('img')

            for img_elem in img_elems:
                img_url = urljoin(url, img_elem['src'])
                name = f'q{question_counter}_explanation_{img_count["explanation"]}.png'
                folder_path = img_type_directory['explanation']

                placeholder = f'(image)q{question_counter}_explanation_{img_count["explanation"]}(image)'
                explanation = explanation.replace(str(img_elem), placeholder)
                
                download_image(img_url, folder_path, name)
                img_count["explanation"] += 1

            options_processed = []
            for i, option_elem in enumerate(options_elems):
                flex_wrap_div = option_elem.find('div', class_='flex-wrap')
                if flex_wrap_div:
                    img_options = flex_wrap_div.find_all('img')
                    option_img_count = 1

                    for img_option in img_options:
                        img_url = urljoin(url, img_option['src'])
                        option_name = chr(ord('A') + i)
                        name = f'q{question_counter}_option{option_name}_{option_img_count}.png'
                        folder_path = img_type_directory["option"]

                        placeholder = f'<img src="/static/assets/images/background/Option/{name}" alt="{name}" style="display: inline-block; width: auto; height: auto;">'
                        flex_wrap_div = BeautifulSoup(flex_wrap_div.decode().replace(str(img_option), placeholder), 'html.parser')

                        download_image(img_url, folder_path, name)
                        option_img_count += 1

                    option_text = flex_wrap_div.decode_contents().strip()
                else:
                    option_text = option_elem.text.strip()

                # Process each option text to replace <span class="root"> tags
                root_span_in_option = re.search('<span class="root">(.*?)</span>', option_text)
                if root_span_in_option:
                    option_text = re.sub(root_span_in_option.group(), f'√({root_span_in_option.group(1).strip()})', option_text)

                options_processed.append(option_text)

            if discussion_link != 'Discussion link not found.':
                discussion_comments = fetch_discussion_comments(discussion_link)
                print(f"Discussion Comments for Question {question_counter}: {discussion_comments}")  # Debugging
                question_dict['discussion_comments'] = discussion_comments
            else:
                question_dict['discussion_comments'] = ''

            print(f"Processed Question {question_counter}:")
            print(f"Text: {question_text}")
            print("Options: \n{}".format('\n'.join(options_processed)))
            print(f"Answer: {answer}")
            print(f"URL: {url}")
            print(f"Explanation: {explanation}")
            print(f"Discussion Link: {discussion_link}")
            print(f"Image Placeholder: {placeholder if img_elems else 'No Image'}")
            print("----------------------------------------------------")

            question_dict = {
                'text': question_text,
                'options': options_processed,
                'answer': answer,
                'url': url,
                'explanation': explanation,
                'discussion_link': discussion_link,
                'discussion_comments': question_dict['discussion_comments']
            }

            if question_dict:
                new_question = Question(
                    text=question_dict['text'],
                    options=question_dict['options'],
                    answer=question_dict['answer'],
                    url=question_dict['url'],
                    explanation=question_dict['explanation'],
                    discussion_link=question_dict['discussion_link'],
                    discussion_comments=question_dict['discussion_comments'],
                    quiz_set_id=quiz_set_id
                )
                db.session.add(new_question)
            
            question_counter += 1

        except Exception as e:
            print(f"Error occurred while processing question: {e}")

    db.session.commit()

    return question_counter

def process_pinoybix_question(url, question_counter, quiz_set_id, db, Question):
    if not url.startswith('https://'):
        url = 'https://' + url
    
    MAX_RETRIES = 10
    backoff_time = 3

    for attempt in range(MAX_RETRIES):
        try:
            time.sleep(backoff_time * attempt)
            response = requests.get(url, headers={'User-Agent': choice(config.headers_list)}, verify=False)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')

            folder_path = 'PinoybixAfter'
            if not os.path.exists('./static/assets/images/background/' + folder_path):
                os.makedirs('./static/assets/images/background/' + folder_path)

            paragraphs = soup.find_all('p')
            for p in paragraphs:
                if 'Choose the letter of the best answer in each questions.' in p.get_text():
                    continue

                que_match = re.match(r'^(\d+)\.', p.text)
                if que_match:
                    question_html = str(p)
                    question_html = re.sub(r'^<p>\d+\.', '<p>', question_html)

                    soup_question = BeautifulSoup(question_html, 'html.parser')
                    for img_tag in soup_question.find_all(['img', 'a']):
                        img_tag.decompose()
                    question_text = str(soup_question)

                    choices = []
                    key_answer = ''
                    placeholder = 'No Image'

                    img_tag = p.find('img')
                    if not img_tag:
                        next_p = p.find_next_sibling('p')
                        img_tag = next_p.find('img') if next_p else None

                    if img_tag and 'src' in img_tag.attrs:
                        img_url = img_tag['src']
                        name = f'pinoybix_q{question_counter}_after_1.png'
                        download_success = download_image(img_url, folder_path, name)
                        if download_success:
                            placeholder = f'<br/>(image)pinoybix_q{question_counter}_after_1(image)'
                            question_text += placeholder

                    next_p = p.find_next_sibling()
                    while next_p:
                        if next_p.name == 'p':
                            if not next_p.text.startswith("View Answer:") and not next_p.text.startswith("Solution:"):
                                choice_match = re.match(r'^[A-Da-d][\).]', next_p.text)
                                if choice_match:
                                    choice_html = str(next_p)
                                    choice_html = re.sub(r'^<p>[A-Da-d][\).]\s*', '<p>', choice_html)
                                    choices.append(choice_html)
                                elif 'Answer:' in next_p.text:
                                    answer_match = re.search(r'Option ([A-D])', next_p.text)
                                    if answer_match:
                                        key_answer = 'Option ' + answer_match.group(1)
                                    break
                        elif next_p.name == 'div' and 'wp_shortcodes_toggle' in next_p.get('class', []):
                            answer_div = next_p.find('div', class_='togglec clearfix')
                            if answer_div:
                                answer_match = re.search(r'Option ([A-D])', answer_div.get_text())
                                if answer_match:
                                    key_answer = 'Option ' + answer_match.group(1)
                            break
                        next_p = next_p.find_next_sibling()

                    print(f"Processed Question {question_counter}:")
                    print(f"Text: {question_text}")
                    print(f"Options: {choices}")
                    print(f"Answer: {key_answer}")
                    print(f"Image Placeholder: {placeholder}")
                    print("----------------------------------------------------")

                    new_question = Question(
                        text=question_text,
                        options=choices,
                        answer=key_answer,
                        quiz_set_id=quiz_set_id,
                        url=url,
                        explanation="No explanation available",
                        discussion_link="No discussion link available"
                    )
                    db.session.add(new_question)
                    question_counter += 1

            db.session.commit()
            return question_counter

        except requests.RequestException as request_exception:
            print(f'Error occurred for {url}, waiting for {backoff_time * attempt} secs before retrying.....')
            if attempt == MAX_RETRIES - 1: 
                print(f"Error fetching {url} after {MAX_RETRIES} attempts, Error: {request_exception}")
                return question_counter
            continue
        except Exception as err:
            print(f'An error occurred: {err}')
            return question_counter

def process_examveda_question(base_url, start_page, end_page, question_counter, quiz_set_id, db, Question):
    if not base_url.startswith('https://'):
        base_url = 'https://' + base_url

    MAX_RETRIES = 10
    backoff_time = 3

    for page_num in range(start_page, end_page + 1):
        # Adjusting the URL to accommodate the new format with &page=
        url = f"{base_url}&page={page_num}"

        for attempt in range(MAX_RETRIES):
            try:
                time.sleep(backoff_time * attempt)
                response = requests.get(url, headers={'User-Agent': choice(config.headers_list)}, verify=False)
                response.raise_for_status()

                soup = BeautifulSoup(response.content, 'html.parser')
                questions = soup.find_all('article', class_='question')

                for question in questions:
                    q_text_elem = question.find('div', class_='question-main')
                    if not q_text_elem:
                        continue

                    question_html = str(q_text_elem)
                    question_html = re.sub(r'\$\s+', r'$ ', question_html)
                    question_html = re.sub(r'\$\$(.*?)\$\$', r'<span class="mathjax">\1</span>', question_html)
                    img_elems = q_text_elem.find_all('img')

                    for img_elem in img_elems:
                        img_url = urljoin(url, img_elem['src'])
                        img_extension = os.path.splitext(img_url)[1]
                        placeholder = f'(image)examveda_q{question_counter}_main(image)'
                        question_html = question_html.replace(str(img_elem), placeholder)

                        folder_path = 'ExamvedaMain'
                        if not os.path.exists('./static/assets/images/background/' + folder_path):
                            os.makedirs('./static/assets/images/background/' + folder_path)

                        img_name = f'examveda_q{question_counter}_main{img_extension}'
                        download_image(img_url, folder_path, img_name)

                    options_html = []
                    option_blocks = question.find_all('p')
                    for block in option_blocks:
                        labels = block.find_all('label')
                        if len(labels) > 1:
                            option_html = str(labels[1])
                            options_html.append(option_html)

                    answer_elem = question.find('strong')
                    answer = answer_elem.text.strip() if answer_elem else 'Answer not found.'
                    explanation_elem = answer_elem.find_next_sibling('div') if answer_elem else None
                    explanation = explanation_elem.get_text(strip=True) if explanation_elem else 'No explanation available.'

                    discussion_link_elem = question.find('a', text='Discuss in Board')
                    discussion_link = discussion_link_elem['href'] if discussion_link_elem else 'Discussion link not found.'

                    print(f"Processed Question {question_counter}:")
                    print(f"Text: {question_html}")
                    print("Options: \n{}".format('\n'.join(options_html)))
                    print(f"Answer: {answer}")
                    print(f"URL: {url}")
                    print(f"Explanation: {explanation}")
                    print(f"Discussion Link: {discussion_link}")
                    print("----------------------------------------------------")

                    new_question = Question(
                        text=question_html,
                        options=options_html,
                        answer=answer,
                        explanation=explanation,
                        url=url,
                        discussion_link=discussion_link,
                        quiz_set_id=quiz_set_id
                    )
                    db.session.add(new_question)
                    question_counter += 1

                db.session.commit()
                break

            except requests.RequestException as request_exception:
                print(f'Error occurred for {url}, waiting for {backoff_time * attempt} secs before retrying.....')
                if attempt == MAX_RETRIES - 1: 
                    print(f"Error fetching {url} after {MAX_RETRIES} attempts, Error: {request_exception}")
                continue
            except Exception as e:
                print(f"Error occurred while processing page {page_num}: {e}")
                break

    return question_counter

def process_examprimer_question(url, question_counter, quiz_set_id, db, Question):
    if not url.startswith('https://'):
        url = 'https://' + url

    MAX_RETRIES = 10
    backoff_time = 3
    driver = None  # Declare driver outside the try block

    for attempt in range(MAX_RETRIES):
        try:
            time.sleep(backoff_time * attempt)
            options = Options()
            options.add_argument("--headless")  # Enable headless mode
            options.add_argument("start-maximized")  # Start maximized for better performance in headless mode

            driver = webdriver.Chrome(options=options)
            driver.get(url)

            WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, "butCheck")))
            check_answers_button = driver.find_element(By.ID, "butCheck")
            check_answers_button.click()

            WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, "question")))
            questions = driver.find_elements(By.CLASS_NAME, "question")

            for question in questions:
                full_text = question.text.strip()
                lines = full_text.split('\n')
                question_text = '\n'.join(lines[1:-4]).strip()
                options = lines[-4:]

                options_elements = question.find_elements(By.CLASS_NAME, "answer")
                correct_answer_index = None

                for i, option_element in enumerate(options_elements):
                    if "lightgreen" in option_element.get_attribute("style"):
                        correct_answer_index = i
                        break

                correct_option = 'Option ' + chr(correct_answer_index + 65) if correct_answer_index is not None else "No correct answer found"

                # Print details instead of writing to a file
                print(f"Processed Question {question_counter}:")
                print(f"Text: {question_text}")
                print("Options: \n{}".format('\n'.join(options)))
                print(f"Answer: {correct_option}")
                print(f"URL: {url}")
                print("Explanation: No explanation available.")
                print("Discussion Link: Discussion link not found.")
                print("----------------------------------------------------")

                # Create a new Question object and add it to the session
                new_question = Question(
                    text=question_text,
                    options=options,
                    answer=correct_option,
                    explanation="No explanation available",
                    url=url,
                    discussion_link="Discussion link not found.",
                    quiz_set_id=quiz_set_id
                )
                db.session.add(new_question)
                question_counter += 1

        except requests.RequestException as request_exception:
            print(f'Error occurred for {url}, waiting for {backoff_time * attempt} secs before retrying.....')
            if attempt == MAX_RETRIES - 1:
                print(f"Error fetching {url} after {MAX_RETRIES} attempts, Error: {request_exception}")
        except Exception as e:
            print(f'An unexpected error occurred: {e}')
        finally:
            if driver:
                driver.quit()  # Quit the driver if it's initialized

        if attempt == MAX_RETRIES - 1:
            return question_counter  # Return from the function if all retries fail

    return question_counter