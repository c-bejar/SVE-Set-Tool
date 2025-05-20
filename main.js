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
      sortCards();
      break;
    case "main":
      if (newCardData.type == "Leader" || newCardData.type.includes("Evolve")) {
        return;
      }
      const mainCard = createCard(newCardData, 1);
      mainContainer.appendChild(mainCard);
      mainCard.addEventListener("click", removeCard);
      sortCards();
      break;
    case "evolve":
      if (!newCardData.type.includes("Evolve")) {
        return;
      }
      const evolveCard = createCard(newCardData, 3);
      evolveContainer.appendChild(evolveCard);
      evolveCard.addEventListener("click", removeCard);
      sortCards();
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

function grabDeckText() {
  const cards = deckContainer.querySelectorAll("img");
  let clipboard = "";
  let uniqueCards = new Map();

  cards.forEach((card) => {
    const cardInfo = JSON.parse(card.dataset.cardInfo);
    if (uniqueCards.has(cardInfo.set_number)) {
      uniqueCards.set(cardInfo.set_number, {
        ...uniqueCards.get(cardInfo.set_number),
        count: uniqueCards.get(cardInfo.set_number).count + 1,
      });
    } else {
      uniqueCards.set(cardInfo.set_number, {
        name: cardInfo.name,
        count: 1,
        url: card.src,
        type: cardInfo.type,
      });
    }
  });

  uniqueCards.forEach((data) => {
    clipboard += `${data.count} ([${data.name}]) ${data.url}`;
    if (data.type.includes("Evolve")) {
      clipboard += " [!]";
    }
    clipboard += "\n";
  });

  return clipboard;
}

function sortCards() {
  function sortContainer(container) {
    Array.from(container.children)
      .sort((a, b) => {
        const dataA = JSON.parse(a.dataset.cardInfo);
        const dataB = JSON.parse(b.dataset.cardInfo);
        const typeComparison = dataA.type.localeCompare(dataB.type);
        if (typeComparison == 0) {
          return dataA.name.localeCompare(dataB.name);
        }

        return typeComparison;
      })
      .forEach((child) => {
        container.appendChild(child);
      });
  }
  sortContainer(mainContainer);
  sortContainer(evolveContainer);
}

function updateDisplayedCards(filteredCards) {
  Array.from(document.querySelectorAll(".card")).forEach((card) => {
    if (filteredCards.includes(card)) {
      card.style.display = "inline";
    } else {
      card.style.display = "none";
    }
  });
}

function filterCards() {
  const cardNameInput = document.querySelector('input[name="card-name"]');
  const formatSelect = document.querySelector('select[name="Format"]');
  const classSelect = document.querySelector('select[name="Class"]');
  const universeSelect = document.querySelector("#universeContainer");
  const setSelect = document.querySelector("#setContainer");
  const costSelect = document.querySelector('select[name="Cost"]');
  const typeSelect = document.querySelector('select[name="Card Type"]');
  const keywordsInput = document.querySelector('input[name="keywords"]');

  const allCards = Array.from(document.querySelectorAll(".card"));

  let filteredCards = allCards.filter((card) => {
    const cardInfo = JSON.parse(card.dataset.cardInfo);

    if (
      !cardInfo.name.toLowerCase().includes(cardNameInput.value.toLowerCase())
    ) {
      return false;
    }

    if (
      !(
        (formatSelect.value === "Gloryfinder" &&
          cardInfo.format === "Gloryfinder") ||
        (formatSelect.value === "Standard" &&
          cardInfo.format !== "Gloryfinder") ||
        formatSelect.value === "All"
      )
    ) {
      return false;
    }

    return true;
  });

  updateDisplayedCards(filteredCards);
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

//------------------------------------------------------------------------

copyButton.addEventListener("click", function (e) {
  navigator.clipboard.writeText(grabDeckText()).then(() => {
    console.log("Wrote to clipboard");
  });
});
document.querySelectorAll("select").forEach((select) => {
  select.addEventListener("change", filterCards);
});
document.querySelectorAll('input[type="textbox"]').forEach((input) => {
  input.addEventListener("input", filterCards);
});
document.querySelectorAll('input[type="radio"]').forEach((radio) => {
  radio.addEventListener("click", handleRadioClick);
});
document.addEventListener("mousemove", function (e) {
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
