function createCard(cardData, toDeck = false) {
  const cardElement = document.createElement("img");
  cardElement.src = cardData.image_url;
  cardElement.alt = cardData.name;
  if (toDeck) {
    cardElement.className = "deck-card";
  } else {
    cardElement.className = "card";
  }
  cardElement.loading = "lazy";

  return cardElement;
}

function createOption(setName) {
  const option = document.createElement("option");
  option.text = setName;
  return option;
}

async function loadCards() {
  try {
    const response = await fetch("cards.json");
    if (!response.ok) throw new Error("Unable to fetch cards.");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error loading cards:", error);
    return null;
  }
}

const cardContainer = document.querySelector(".card-container");
const deckContainer = document.querySelector(".deck-container");
const setContainer = document.querySelector('select[name="Card Set"]');
const loadedCards = loadCards();
let cardSets = new Set();

loadedCards.then((cards) => {
  cards.map((card, index) => {
    cardSets.add(card.set);
    if (index < 50) {
      deckContainer.appendChild(createCard(card, true));
    }
    cardContainer.appendChild(createCard(card));
  });
  cardSets.forEach((cardSet) => {
    setContainer.appendChild(createOption(cardSet));
  });
});
