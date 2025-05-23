function createCard(cardData, toDeck = 0) {
  const cardElement = document.createElement("img");

  cardElement.onload = function () {
    loadImageWhenVisible(cardElement);

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
  };

  cardElement.src = "assets/card_back.png";
  cardElement.dataset.src = cardData.image_url;
  cardElement.alt = cardData.name;

  return cardElement;
}

function loadImageWhenVisible(img) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        img.src = img.dataset.src;
        observer.unobserve(entry.target);
      }
    });
  });
  observer.observe(img);
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
  const newCardData = JSON.parse(data.dataset.cardInfo);

  if (newCardData.type === "Leader") {
    const leaderInput = document.querySelector('input[id="leader"]');
    leaderInput.click();
  } else if (newCardData.type.includes("Evolve")) {
    const evolveInput = document.querySelector('input[id="evolve"]');
    evolveInput.click();
  } else {
    const mainInput = document.querySelector('input[id="main"]');
    mainInput.click();
  }

  cardCount.textContent++;
  const currentView = document.querySelector('input[name="deck"]:checked');
  switch (currentView.id) {
    case "leader":
      // Limits total to 1 card
      while (leaderContainer.firstChild) {
        leaderContainer.removeChild(leaderContainer.firstChild);
      }
      const leaderCard = createCard(newCardData, 2);
      leaderContainer.appendChild(leaderCard);
      leaderCard.addEventListener("click", removeCard);
      break;
    case "main":
      // limit to 51 (50 + glory card)
      if (mainContainer.children.length >= 51) {
        return;
      }
      const mainCard = createCard(newCardData, 1);
      mainContainer.appendChild(mainCard);
      mainCard.addEventListener("click", removeCard);
      sortCards();
      break;
    case "evolve":
      if (evolveContainer.children.length >= 20) {
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
  const keywordsInput = document.querySelector('input[name="keywords"]');
  const classSelect = document.querySelector('select[name="Class"]');
  const typeSelect = document.querySelector('select[name="Card Type"]');
  const formatSelect = document.querySelector('select[name="Format"]');
  const costSelect = document.querySelector('select[name="Cost"]');
  const atkSelect = document.querySelector('select[name="Attack"]');
  const defSelect = document.querySelector('select[name="Defense"]');
  const universeSelect = document.querySelector("#universeContainer");
  const setSelect = document.querySelector("#setContainer");

  const allCards = Array.from(document.querySelectorAll(".card"));

  let filteredCards = allCards.filter((card) => {
    const cardInfo = JSON.parse(card.dataset.cardInfo);

    if (
      !cardInfo.name.toLowerCase().includes(cardNameInput.value.toLowerCase())
    ) {
      return false;
    }

    if (
      !cardInfo.ability
        .toLowerCase()
        .includes(keywordsInput.value.toLowerCase())
    ) {
      return false;
    }

    if (
      !(classSelect.value === cardInfo.class || classSelect.value === "All")
    ) {
      return false;
    }

    if (
      !(
        typeSelect.value === cardInfo.type ||
        (typeSelect.value === "Evolved" && cardInfo.type.includes("Evolve")) ||
        typeSelect.value === "All"
      )
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

    if (
      !(
        cardInfo.cost === costSelect.value ||
        (costSelect.value === "8+" && parseInt(cardInfo.cost) >= 8) ||
        costSelect.value === "All"
      )
    ) {
      return false;
    }

    if (
      !(
        cardInfo.attack === atkSelect.value ||
        (atkSelect.value === "10+" && cardInfo.attack >= 10) ||
        atkSelect.value === "Any"
      )
    ) {
      return false;
    }

    if (
      !(
        cardInfo.defense === defSelect.value ||
        (defSelect.value === "10+" && cardInfo.defense >= 10) ||
        defSelect.value === "Any"
      )
    ) {
      return false;
    }

    if (
      !(
        universeSelect.value === cardInfo.universe ||
        universeSelect.value === "Unspecified"
      )
    ) {
      return false;
    }

    if (
      !(setSelect.value === cardInfo.set || setSelect.value === "Unspecified")
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
let tokens = new Map();
let cardSets = new Set();
let universes = new Set();

//------------------------------------------------------------------------

copyButton.addEventListener("click", function (e) {
  const text = grabDeckText();
  try {
    navigator.clipboard.writeText(text).then(() => {
      console.log("Wrote to clipboard");
    });
  } catch (err) {
    console.error("Error: ", err);

    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
    } catch (fallbackErr) {
      console.error("Error: ", fallbackErr);
    }
    document.body.removeChild(textArea);
  }
});
tokenButton.addEventListener("click", function (e) {
  let clip = "0 ([_]) .\n";
  tokens.forEach((token) => {
    clip += `1 ([${token.name}]) ${token.url}\n`;
  });
  navigator.clipboard.writeText(clip).then(() => {
    console.log("Wrote tokens to clipboard");
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
  if (element.className == "card" && element.complete) {
    const image = cardPreviewR.querySelector("img");
    image.src = element.src;
    image.className = "preview";
    cardPreviewR.style.visibility = "visible";
    cardPreviewL.style.visibility = "hidden";
  } else if (
    ["deck-card", "evolve-card"].includes(element.className) &&
    element.complete
  ) {
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
    if (card.type.includes("Evolution")) {
      return;
    }
    if (card.type.includes("Token")) {
      tokens.set(card.set_number, {
        name: card.name,
        url: card.image_url,
      });
      return;
    }
    cardSets.add(card.set);
    universes.add(card.universe);
    const cardElement = createCard(card);
    cardContainer.appendChild(cardElement);
    cardElement.addEventListener("click", function () {
      if (cardElement.complete) addCard(cardElement);
    });
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
