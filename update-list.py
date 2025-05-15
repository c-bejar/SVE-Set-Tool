import os
import re
import requests
from bs4 import BeautifulSoup as bs

BASE_URL = "https://en.shadowverse-evolve.com"
FILTER = "/cards/searchresults/?&view=text&sort=new&page="
current_page = 1
url = BASE_URL + FILTER + str(current_page)

def main():
    global url, current_page

    response = requests.get(url)
    max_page = find_max_page(response)

    finishExecution = False
    while True:
        soup = bs(response.text, 'html.parser')
        cards = soup.find('ul', class_='cardlist-Result_List')
        numbers = cards.find_all('p', class_='number')
        names = cards.find_all('p', class_='ttl')
        for i in range(len(names)):
            print(f"Card Name: {names[i].text}")
            print(f"Card Set: {numbers[i].text}")

            image = cards.find('img', src=re.compile(numbers[i].text))
            print(f"Image URL: {BASE_URL + image['src']}")

            if download_image(BASE_URL + image['src'], 
                              f"{names[i].text} [{numbers[i].text}]") != -1:
                add_to_list(numbers[i].text)

        #---------------------------
        current_page += 1
        if current_page > max_page: break
        url = BASE_URL + FILTER + str(current_page)
        response = requests.get(url)

def add_to_list(set):
    with open("cardlist.txt", 'r') as f:
        existing_lines = f.readlines()

        if set + '\n' not in existing_lines:
            with open("cardlist.txt", 'a')as w:
                w.write(set + '\n')
        


def download_image(url, filename):
    if os.path.exists(f"Cards/{filename}.png"):
        print(f"File {filename}.png already exists. Stopping Execution...")
        return -1
    response = requests.get(url)
    if response.status_code == 200:
        with open(f"Cards/{filename}.png", 'wb') as f:
            f.write(response.content)
        print("Image saved successfully")
    else:
        print(f"Failed to download image. Status code: {response.status_code}")
    return 1

def find_max_page(response):
    soup = bs(response.text, 'html.parser')
    pattern = r'var\smax_page\s*=\s*(\d+)*;'
    match = re.search(pattern, soup.prettify())

    if match:
        max_page = int(match.group(1))
        print(f"found max_page: {max_page}\n")
        return max_page
    else:
        print("No max_page found")
        return 1

if __name__ == "__main__":
    main()