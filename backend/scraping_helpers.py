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

# Helper function to process image URLs (no image downloads, just ensure correct URLs)
def process_image_url(img_url, base_url="https://www.indiabix.com"):
    # If the URL is relative (starts with '/'), prepend the base URL
    if img_url.startswith('/'):
        return base_url + img_url
    # Otherwise, return the full URL as is (NO quiz_set_id should be added)
    return img_url

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

def process_question_with_square_root(html_content):
    # Handle the square root format by replacing <span class='root'><span class='symbol'>X</span></span> with √(X)
    root_pattern = re.compile(r"<span class=['\"]root['\"]><span class=['\"]symbol['\"]>(.*?)</span></span>")
    processed_content = re.sub(root_pattern, r"√(\1)", html_content)

    return processed_content

# Helper function to process questions
def process_question(base_url, url_number, question_counter, quiz_set_id):
    if not base_url.startswith('https://'):
        base_url = 'https://' + base_url
    url = base_url + str(url_number).zfill(6)  # Format the URL number to ensure it's padded with zeros if necessary
    MAX_RETRIES = 10
    backoff_time = 3  # Time to wait before retrying in case of failure

    # Retry mechanism for robust scraping
    for attempt in range(MAX_RETRIES):
        try:
            time.sleep(backoff_time * attempt)
            page = requests.get(url, headers={'User-Agent': choice(config.headers_list)}, verify=False)
            page.raise_for_status()
            break
        except requests.RequestException as request_exception:
            print(f'Error occurred for {url}, waiting for {backoff_time * attempt} seconds before retrying...')
            if attempt == MAX_RETRIES - 1:
                print(f"Failed to fetch {url} after {MAX_RETRIES} attempts. Error: {request_exception}")
                return question_counter
            continue

    soup = BeautifulSoup(page.content, 'html.parser')
    questions = soup.find_all('div', class_='bix-div-container')

    for question in questions:
        try:
            # Initialize variables with defaults to avoid undefined errors
            question_text = 'Question not found.'
            answer = 'Answer not found.'
            explanation = 'Explanation not found.'
            discussion_link = 'Discussion link not found.'

            # Extract question text
            q_text_elem = question.find('div', class_='bix-td-qtxt')
            if q_text_elem:
                question_text = str(q_text_elem).strip()

            # Process question text for square root symbols if any
            question_text = process_question_with_square_root(question_text)

            # Extract options and process images within options
            options_elems = question.find_all('div', class_='bix-td-option-val')
            options_processed = []

            for option_elem in options_elems:
                option_text = option_elem.text.strip()

                # Process option images if any
                img_tags = option_elem.find_all('img')
                for img_tag in img_tags:
                    img_url = img_tag['src']
                    if img_url.startswith('/'):
                        img_url = f"https://www.indiabix.com{img_url}"  # Adjust base URL for relative paths
                    option_text += f'<br><img src="{img_url}" alt="Option Image" style="display: inline-block; width: auto; height: auto;">'

                # Process square root symbols in options as well
                option_text = process_question_with_square_root(option_text)

                options_processed.append(option_text)

            # Extract the correct answer
            answer_elem = question.find('input', class_='jq-hdnakq')
            if answer_elem:
                answer = f"Option {answer_elem['value'].upper()}"

            # Extract explanation and discussion link
            explanation_elem = question.find('div', class_='bix-ans-description')
            if explanation_elem:
                explanation = str(explanation_elem).strip()
                explanation = process_question_with_square_root(explanation)  # Process square root in explanation

            discussion_link_elem = question.find('a', class_='discuss')
            if discussion_link_elem:
                discussion_link = discussion_link_elem['href']

            # Ensure `quiz_set_id` is properly passed when creating the question
            if quiz_set_id is None:
                raise ValueError(f"`quiz_set_id` is missing for question {question_counter}")

            # Log the processed question details
            print(f"Processed Question {question_counter}:")
            print(f"Text: {question_text}")
            print(f"Options: \n{options_processed}")
            print(f"Answer: {answer}")
            print(f"Explanation: {explanation}")
            print(f"Discussion Link: {discussion_link}")
            print("----------------------------------------------------")

            # Create the new question and add it to the session
            new_question = Question(
                text=question_text,
                options=options_processed,
                answer=answer,
                url=url,
                explanation=explanation,
                discussion_link=discussion_link,
                quiz_set_id=quiz_set_id,  # Ensure this is passed correctly
                order=question_counter
            )
            db.session.add(new_question)
            question_counter += 1

        except Exception as e:
            print(f"Error occurred while processing question: {e}")

    db.session.commit()
    return question_counter

# Function to process PinoyBix questions
def process_pinoybix_question(url, question_counter, quiz_set_id, db, Question):
    # Ensure the URL starts with https://
    if not url.startswith('https://'):
        url = 'https://' + url

    MAX_RETRIES = 10
    backoff_time = 3

    for attempt in range(MAX_RETRIES):
        try:
            time.sleep(backoff_time * attempt)
            # Send the HTTP request to get the content of the Pinoybix page
            response = requests.get(url, headers={'User-Agent': choice(config.headers_list)}, verify=False)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, 'html.parser')

            # Iterate over all paragraphs and look for the question pattern
            paragraphs = soup.find_all('p')
            for p in paragraphs:
                # Skip instructional text
                if 'Choose the letter of the best answer in each questions.' in p.get_text():
                    continue

                # Look for the question pattern (e.g., "1.")
                que_match = re.match(r'^(\d+)\.', p.text)
                if que_match:
                    # Extract and clean the question
                    question_html = str(p)
                    question_html = re.sub(r'^<p>\d+\.', '<p>', question_html)  # Remove question number from HTML

                    soup_question = BeautifulSoup(question_html, 'html.parser')

                    # Handle image URLs directly (no downloading needed)
                    img_tag = p.find('img')
                    if not img_tag:
                        next_p = p.find_next_sibling('p')
                        img_tag = next_p.find('img') if next_p else None

                    # If an image is found, make sure the URL is complete and update the HTML
                    if img_tag and 'src' in img_tag.attrs:
                        img_url = img_tag['src']
                        if img_url.startswith('/'):
                            img_url = f'https://www.pinoybix.org{img_url}'
                        # Add the image to the question HTML
                        question_html += f'<br><img src="{img_url}" alt="Question Image" style="display: inline-block; width: auto; height: auto;">'

                    question_text = question_html  # Updated question HTML with image

                    choices = []
                    key_answer = ''

                    # Process the choices and find the answer
                    next_p = p.find_next_sibling()
                    while next_p:
                        if next_p.name == 'p' and re.match(r'^[A-Da-d][\).]', next_p.text):
                            # Clean up choice text
                            choice_html = str(next_p)
                            choice_html = re.sub(r'^<p>[A-Da-d][\).]\s*', '<p>', choice_html)
                            choices.append(choice_html)
                        elif 'Answer:' in next_p.text:
                            # Extract the answer
                            answer_match = re.search(r'Option ([A-D])', next_p.text)
                            if answer_match:
                                key_answer = 'Option ' + answer_match.group(1)
                            break
                        next_p = next_p.find_next_sibling()

                    # If no answer is found in the sibling, handle the case
                    if not key_answer and 'Answer:' in next_p.get_text():
                        answer_match = re.search(r'Option ([A-D])', next_p.get_text())
                        if answer_match:
                            key_answer = 'Option ' + answer_match.group(1)

                    # Log the processed question details for debugging
                    print(f"Processed Question {question_counter}:")
                    print(f"Text: {question_text}")
                    print(f"Options: {choices}")
                    print(f"Answer: {key_answer}")
                    print("----------------------------------------------------")

                    # Create a new question entry and add it to the database
                    new_question = Question(
                        text=question_text,
                        options=choices,
                        answer=key_answer,
                        quiz_set_id=quiz_set_id,
                        url=url,
                        explanation="No explanation available.",
                        discussion_link="No discussion link available",
                        order=question_counter  # Set the order field
                    )
                    db.session.add(new_question)
                    question_counter += 1  # Increment the global counter here

            # Commit the changes to the database
            db.session.commit()
            return question_counter  # Return the updated question_counter

        except requests.RequestException as request_exception:
            print(f'Error occurred for {url}, waiting for {backoff_time * attempt} secs before retrying...')
            if attempt == MAX_RETRIES - 1:
                print(f"Error fetching {url} after {MAX_RETRIES} attempts, Error: {request_exception}")
                return question_counter  # Return the current question_counter even on failure
            continue
        except Exception as err:
            print(f'An error occurred: {err}')
            return question_counter  # Return the current question_counter in case of any other errors

# Function to process Examveda questions
def process_examveda_question(base_url, start_page, end_page, question_counter, quiz_set_id, db, Question):
    if not base_url.startswith('https://'):
        base_url = 'https://' + base_url

    MAX_RETRIES = 10
    backoff_time = 3

    # Process each page in the specified range (start_page to end_page)
    for page_num in range(int(start_page), int(end_page) + 1):
        url = f"{base_url}?page={page_num}"  # Adjust URL to include the page number

        for attempt in range(MAX_RETRIES):
            try:
                time.sleep(backoff_time * attempt)
                response = requests.get(url, headers={'User-Agent': choice(config.headers_list)}, verify=False)
                response.raise_for_status()

                soup = BeautifulSoup(response.content, 'html.parser')
                questions = soup.find_all('article', class_='question')

                # Ensure that questions are processed in the same order they appear on the page
                for question in questions:
                    q_text_elem = question.find('div', class_='question-main')
                    if not q_text_elem:
                        continue

                    # Extract the question text
                    question_html = str(q_text_elem)
                    question_html = re.sub(r'\$\s+', r'$ ', question_html)  # Handle special characters
                    question_html = re.sub(r'\$\$(.*?)\$\$', r'<span class="mathjax">\1</span>', question_html)

                    # Process images directly from the source, no local downloads or placeholders
                    img_elems = q_text_elem.find_all('img')

                    # Replace relative image paths with full URLs
                    for img_elem in img_elems:
                        img_url = img_elem['src']
                        if img_url.startswith('/'):
                            img_url = urljoin(url, img_url)
                        # Replace the img tag's source with the correct URL (only if relative)
                        img_elem['src'] = img_url

                    # Reconvert the modified HTML
                    question_html = str(q_text_elem)  # This ensures images aren't duplicated

                    # Extract options and explanation
                    options_html = []
                    option_blocks = question.find_all('p')
                    for block in option_blocks:
                        labels = block.find_all('label')
                        if len(labels) > 1:
                            option_html = str(labels[1])
                            options_html.append(option_html)

                    # Extract the correct answer
                    answer_elem = question.find('strong')
                    answer = answer_elem.text.strip() if answer_elem else 'Answer not found.'
                    explanation_elem = answer_elem.find_next_sibling('div') if answer_elem else None
                    explanation = explanation_elem.get_text(strip=True) if explanation_elem else 'No explanation available.'

                    # Extract the discussion link
                    discussion_link_elem = question.find('a', text='Discuss in Board')
                    discussion_link = discussion_link_elem['href'] if discussion_link_elem else 'Discussion link not found.'

                    # Log processed question details
                    print(f"Processed Question {question_counter}:")
                    print(f"Text: {question_html}")
                    print(f"Options: \n{options_html}")
                    print(f"Answer: {answer}")
                    print(f"URL: {url}")
                    print(f"Explanation: {explanation}")
                    print(f"Discussion Link: {discussion_link}")
                    print("----------------------------------------------------")

                    # Store question in the database
                    new_question = Question(
                        text=question_html,
                        options=options_html,
                        answer=answer,
                        explanation=explanation,
                        url=url,
                        discussion_link=discussion_link,
                        quiz_set_id=quiz_set_id,
                        order=question_counter  # Set the order field
                    )
                    db.session.add(new_question)

                    question_counter += 1  # Ensure the question counter increments sequentially

                db.session.commit()  # Commit after processing each page
                break  # Break retry loop if successful

            except requests.RequestException as request_exception:
                print(f'Error occurred for {url}, waiting for {backoff_time * attempt} secs before retrying...')
                if attempt == MAX_RETRIES - 1:
                    print(f"Error fetching {url} after {MAX_RETRIES} attempts, Error: {request_exception}")
                continue
            except Exception as e:
                print(f"Error occurred while processing page {page_num}: {e}")
                break

    return question_counter  # Return the updated question counter

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
                    explanation="No explanation available.",
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