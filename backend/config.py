# config.py

import ssl
import warnings
import requests
import urllib3

# Constants and initializations
ssl._create_default_https_context = ssl._create_unverified_context
warnings.filterwarnings("ignore", category=urllib3.exceptions.InsecureRequestWarning)
session = requests.Session()
question_counter = 1

# Dictionary for image types
img_type_directory = {
    "within": "Within",
    "after": "After",
    "option": "Option",
    "explanation": "Explanation",  
    "pinoybix_after": "PinoybixAfter" 
}

# List of User-Agent strings
headers_list = [
    "Mozilla/5.0 (Windows NT 6.2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36"
]