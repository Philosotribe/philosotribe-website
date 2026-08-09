const imageCreditsList = document.querySelector("[data-image-credits]");

function createCreditLink(url, text) {
  if (!url) {
    return document.createTextNode(text);
  }

  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = text;
  return link;
}

function createCreditCard(credit) {
  const card = document.createElement("article");
  const title = document.createElement("h3");
  const meta = document.createElement("p");
  const source = document.createElement("p");

  card.className = "credit-card";
  title.textContent = credit.plant || "Image credit";
  meta.className = "credit-meta";
  source.className = "credit-source";

  meta.append(
    document.createTextNode("Image by "),
    document.createTextNode(credit.author || "unknown author"),
    document.createTextNode(" · "),
    createCreditLink(credit.licenseUrl, credit.license || "License not listed")
  );

  source.append(createCreditLink(credit.sourceUrl, credit.commonsTitle || "Source image"));
  card.append(title, meta, source);

  return card;
}

if (imageCreditsList) {
  fetch(window.philosotribeAssetUrl ? window.philosotribeAssetUrl("assets/img/plants/credits.json") : "assets/img/plants/credits.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Unable to load image credits.");
      }

      return response.json();
    })
    .then((credits) => {
      const validCredits = Array.isArray(credits) ? credits : [];
      imageCreditsList.replaceChildren(
        ...(validCredits.length
          ? validCredits.map(createCreditCard)
          : [document.createTextNode("No image credits are listed yet.")])
      );
    })
    .catch(() => {
      const fallback = document.createElement("p");
      fallback.className = "care-empty";
      fallback.textContent = "Image credits could not be loaded. Check assets/img/plants/credits.json.";
      imageCreditsList.replaceChildren(fallback);
    });
}
