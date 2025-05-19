function createCard(cardData, toDeck = 0) {
  const cardElement = document.createElement("img");
  cardElement.src = cardData.image_url;
  cardElement.alt = cardData.name;
  if (toDeck == 1) {
    cardElement.className = "deck-card";
  } else if (toDeck == 2) {
    cardElement.className = "leader-card";
  } else if (toDeck == 3) {
    cardElement.className = "evolve-card";
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

function handleRadioClick(e) {
  const type = e.target.id;
  console.log(mainContainer.children);
  Array.from(deckContainer.children).forEach((div) => {
    if (div.className == type) {
      div.style.display = "inline";
    } else {
      div.style.display = "none";
    }
  });
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
const leaderContainer = document.querySelector(".leader");
const mainContainer = document.querySelector(".main");
const evolveContainer = document.querySelector(".evolve");
const loadedCards = loadCards();
let cardSets = new Set();
let universes = new Set();

document.querySelectorAll('input[type="radio"]').forEach((radio) => {
  radio.addEventListener("click", handleRadioClick);
});

loadedCards.then((cards) => {
  cards.map((card, index) => {
    cardSets.add(card.set);
    universes.add(card.universe);
    if (index < 1) {
      leaderContainer.appendChild(createCard(card, 2));
    }
    if (index < 10) {
      evolveContainer.appendChild(createCard(card, 3));
    }
    if (index < 50) {
      mainContainer.appendChild(createCard(card, 1));
    }
    cardContainer.appendChild(createCard(card));
  });
  universes.forEach((universe) => {
    if (universe == "") {
      return;
    }
    universeContainer.appendChild(createOption(universe));
  });
  cardSets.forEach((cardSet) => {
    setContainer.appendChild(createOption(cardSet));
  });
});
