const cardContainer = document.querySelector(".card-container");

function createCard(cardData) {
  const cardElement = document.createElement("div");
  cardElement.className = "card";

  cardElement.innerHTML = `
    <img src="${cardData.image_url}" alt="${cardData.name}" width="125">
  `;

  return cardElement;
}

async function loadCards() {
  try {
    const response = await fetch("cards.json");
    if (!response.ok) throw new Error("unable to fetch cards.json");
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error loading cards: ", error);
    return null;
  }
}

const loadedCards = loadCards();

loadedCards.then((cards) => {
  cards.forEach((card) => {
    cardContainer.appendChild(createCard(card));
  });
});
