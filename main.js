function createCard(cardData) {
  const cardElement = document.createElement("img");
  cardElement.src = cardData.image_url;
  cardElement.alt = cardData.name;
  cardElement.className = "card";

  return cardElement;
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
const loadedCards = loadCards();

loadedCards.then((cards) => {
  cards.map((card, index) => {
    cardContainer.appendChild(createCard(card));
  });
});
