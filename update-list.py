import re
import json
import requests
from bs4 import BeautifulSoup as bs

#TODO: ADD SUPPORT FOR UNIVERSE CARDS

BASE_URL = "https://en.shadowverse-evolve.com"
FILTER = "/cards/searchresults/?&view=text&sort=new&page="
current_page = 1
url = BASE_URL + FILTER + str(current_page)

def main():
    global url, current_page

    response = requests.get(url)
    # max_page = find_max_page(response)

    while True:
        soup = bs(response.text, 'html.parser') # all html
        cards = soup.find('ul', class_='cardlist-Result_List') # ul of all cards in page
        sets = cards.find_all('p', class_='number') # Card Set
        names = cards.find_all('p', class_='ttl') # Card Name
        types = cards.find_all('div', class_='status') # Card Type
        costs = cards.find_all('span', class_='status-Item-Cost') # Card Cost
        powers = cards.find_all('span', class_='status-Item-Power') # Card Attack
        hps = cards.find_all('span', class_='status-Item-Hp') # Card Defense
        abilities = cards.find_all('div', class_='detail') # Card Abilities
        info = cards.find_all('a') # link to expanded info on card | To find Class Type
        
        for i in range(len(names)):
            image = cards.find('img', src=re.compile(sets[i].text))
            card_info = get_card_info(info[i]['href'])
            print(get_card_ability(abilities[i]))
            card_data = {
                "name": names[i].text,
                "format": card_info['format'],
                "class": card_info['class'],
                "type": types[i].find('span').text,
                "set": card_info['set'],
                "cost": costs[i].text[4:],
                "attack": powers[i].text[6:],
                "defense": hps[i].text[7:],
                "ability": get_card_ability(abilities[i]),
                "illustrator": card_info['illustrator'],
                "set_number": sets[i].text,
                "image_url": BASE_URL + image['src']
            }
            break
            

        #---------------------------
        current_page += 1
        if current_page > 1: break
        url = BASE_URL + FILTER + str(current_page)
        response = requests.get(url)

def get_card_ability(ability):
    text = re.sub(r'<img[^>]*>', 
                  lambda m: m.group()
                  .split('alt="')[1]
                  .split('"')[0],
                  str(ability))
    text = re.sub(r'<[^>]*>', '', text)

    return text[1:-1]

# Get card format, class, card set, and illustrator from card url
def get_card_info(filter):
    response = requests.get(BASE_URL + filter)
    soup = bs(response.text, 'html.parser')
    card_info = soup.find('div', class_='txt-Inner')
    div_info = card_info.find_all('dl')

    card_format = div_info[0].text[7:-1]
    card_class = div_info[1].text[5:]
    card_set = div_info[5].text[8:]
    card_illustrator = card_info.find_all('span', class_='heading')[-1].text

    return {"format": card_format,
            "class": card_class,
            "set": card_set,
            "illustrator": card_illustrator}

# Find max pages within html | Site doesn't use traditional pages; uses scroll to reveal
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