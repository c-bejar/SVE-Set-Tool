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
  cardElement.draggable = false;
  cardElement.dataset.cardInfo = JSON.stringify(cardData);

  return cardElement;
}

function createOption(optionName) {
  const option = document.createElement("option");
  option.text = optionName;
  return option;
}

function handleRadioClick(e) {
  const type = e.target.id;
  Array.from(deckContainer.children).forEach((div) => {
    if (div.className == type) {
      div.style.display = "inline";
      switch (type) {
        case "leader":
          cardTotal.textContent = "1";
          cardCount.textContent = leaderContainer.children.length;
          break;
        case "main":
          cardTotal.textContent = "50";
          cardCount.textContent = mainContainer.children.length;
          break;
        case "evolve":
          cardTotal.textContent = "10(20)";
          cardCount.textContent = evolveContainer.children.length;
          break;
      }
    } else {
      div.style.display = "none";
    }
  });
}

function removeCard(data) {
  data.srcElement.remove();
  cardCount.textContent--;
}

function addCard(data) {
  const currentView = document.querySelector('input[name="deck"]:checked');
  const newCardData = JSON.parse(data.srcElement.dataset.cardInfo);
  switch (currentView.id) {
    case "leader":
      if (newCardData.type != "Leader") {
        return;
      }
      while (leaderContainer.firstChild) {
        cardCount.textContent--;
        leaderContainer.removeChild(leaderContainer.firstChild);
      }
      const leaderCard = createCard(newCardData, 2);
      leaderContainer.appendChild(leaderCard);
      leaderCard.addEventListener("click", removeCard);
      break;
    case "main":
      if (newCardData.type == "Leader") {
        return;
      }
      const mainCard = createCard(newCardData, 1);
      mainContainer.appendChild(mainCard);
      mainCard.addEventListener("click", removeCard);
      break;
    case "evolve":
      if (!newCardData.type.includes("Evolve")) {
        return;
      }
      const evolveCard = createCard(newCardData, 3);
      evolveContainer.appendChild(evolveCard);
      evolveCard.addEventListener("click", removeCard);
      break;
    default:
      return;
  }
  cardCount.textContent++;
}

function getTotalCards(typeToReturn) {
  switch (typeToReturn) {
    case 1:
      return leaderContainer.children.length;
    case 2:
      return mainContainer.children.length;
    case 3:
      return evolveContainer.children.length;
    default:
      return 0;
  }
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
document.addEventListener("mouseover", function (e) {
  const element = document.elementFromPoint(e.clientX, e.clientY);
  if (element.className == "card") {
    const image = cardPreviewR.querySelector("img");
    image.src = element.src;
    image.className = "preview";
    cardPreviewR.style.visibility = "visible";
    cardPreviewL.style.visibility = "hidden";
  } else if (["deck-card", "evolve-card"].includes(element.className)) {
    const image = cardPreviewL.querySelector("img");
    image.src = element.src;
    image.className = "preview";
    cardPreviewR.style.visibility = "hidden";
    cardPreviewL.style.visibility = "visible";
  } else {
    cardPreviewR.style.visibility = "hidden";
    cardPreviewL.style.visibility = "hidden";
  }
});

loadedCards.then((cards) => {
  cards.forEach((card) => {
    cardSets.add(card.set);
    universes.add(card.universe);
    if (card.type.includes("Token")) {
      return;
    }
    const cardElement = createCard(card);
    cardContainer.appendChild(cardElement);
    cardElement.addEventListener("click", addCard);
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
