const plantCareList = document.querySelector("[data-plant-care-list]");
const plantCareFilter = document.querySelector("[data-plant-care-filter]");
const plantCareSearch = document.querySelector("[data-plant-care-search]");
const plantCareCycleButtons = document.querySelectorAll("[data-plant-care-cycle]");
const plantCareResultCount = document.querySelector("[data-plant-care-results]");

let activeLifeCycle = "all";

function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  element.textContent = text;
  return element;
}

function createCareDetail(term, detail) {
  const wrapper = document.createElement("div");
  const dt = createTextElement("dt", "", term);
  const dd = createTextElement("dd", "", detail);

  wrapper.append(dt, dd);
  return wrapper;
}

function normalizeValue(value) {
  return String(value || "").trim().toLowerCase();
}

function getItemSlug(item) {
  return normalizeValue(item.name || "plant")
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getCareDetails(item) {
  if (Array.isArray(item.careDetails) && item.careDetails.length) {
    return item.careDetails
      .filter((detail) => detail && detail.term && detail.detail)
      .map((detail) => createCareDetail(detail.term, detail.detail));
  }

  return [
    createCareDetail("Light", item.light || "Add light instructions."),
    createCareDetail("Water", item.water || "Add watering instructions."),
    createCareDetail("Soil", item.soil || "Add soil instructions."),
    createCareDetail("Notes", item.notes || "Add extra care notes.")
  ];
}

function createHarvestMeta(item) {
  if (!item.harvestTime) {
    return null;
  }

  const meta = document.createElement("p");
  const label = document.createElement("strong");

  meta.className = "harvest-time";
  label.textContent = `${item.harvestLabel || "Days till harvest"}: `;

  meta.append(label, document.createTextNode(item.harvestTime));
  return meta;
}

function createCareGuide(item) {
  const article = document.createElement("article");
  const header = document.createElement("div");
  const headerCopy = document.createElement("div");
  const titleRow = document.createElement("div");
  const title = createTextElement("h3", "", item.name || "Plant name");
  const anchorLink = createTextElement("a", "care-anchor-link", "Direct link");
  const details = document.createElement("dl");
  const harvestMeta = createHarvestMeta(item);
  const slug = getItemSlug(item);

  article.className = "care-guide";
  article.id = slug;
  article.tabIndex = -1;
  header.className = "care-guide-header";
  headerCopy.className = "care-guide-copy";
  titleRow.className = "care-title-row";
  anchorLink.href = `#${slug}`;
  anchorLink.setAttribute("aria-label", `Direct link to ${item.name || "this plant"} care`);
  details.className = "care-details";

  if (item.image) {
    const image = document.createElement("img");
    image.className = "care-guide-image";
    image.src = window.philosotribeAssetUrl ? window.philosotribeAssetUrl(item.image) : item.image;
    image.alt = item.imageAlt || `${item.name || "Plant"} reference image`;
    image.loading = "lazy";
    image.decoding = "async";
    header.append(image);
  }

  titleRow.append(title, anchorLink);

  headerCopy.append(
    createTextElement("p", "card-kicker", `${item.label || "Plant care"} · ${item.lifeCycle || "Annual"}`),
    titleRow,
    createTextElement("p", "", item.description || "Add a short description for this plant.")
  );

  if (harvestMeta) {
    headerCopy.append(harvestMeta);
  }

  header.append(headerCopy);

  details.append(...getCareDetails(item));

  article.append(header, details);
  return article;
}

function getItemLabel(item) {
  return (item.label || "Plant care").trim() || "Plant care";
}

function getItemLifeCycle(item) {
  return (item.lifeCycle || "Annual").trim() || "Annual";
}

function createFilterOption(value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  return option;
}

function getUniqueLabels(items) {
  return [...new Set(items.map(getItemLabel))].sort((a, b) => a.localeCompare(b));
}

function populatePlantCareFilter(items) {
  if (!plantCareFilter) {
    return;
  }

  const labels = getUniqueLabels(items);

  plantCareFilter.replaceChildren(
    createFilterOption("all", "All labels"),
    ...labels.map((label) => createFilterOption(label, label))
  );
}

function getFilteredItems(items) {
  const selectedLabel = plantCareFilter?.value || "all";
  const searchTerm = normalizeValue(plantCareSearch?.value || "");

  return items.filter((item) => {
    const labelMatches = selectedLabel === "all" || getItemLabel(item) === selectedLabel;
    const cycleMatches = activeLifeCycle === "all" || getItemLifeCycle(item) === activeLifeCycle;
    const searchMatches =
      !searchTerm ||
      normalizeValue(`${item.name} ${item.label} ${item.description}`).includes(searchTerm);

    return labelMatches && cycleMatches && searchMatches;
  });
}

function updateResultCount(visibleCount, totalCount) {
  if (!plantCareResultCount) {
    return;
  }

  const noun = visibleCount === 1 ? "plant" : "plants";
  plantCareResultCount.textContent =
    visibleCount === totalCount
      ? `Showing all ${totalCount} plants.`
      : `Showing ${visibleCount} of ${totalCount} ${noun}.`;
}

function setActiveLifeCycle(value) {
  activeLifeCycle = value;

  plantCareCycleButtons.forEach((button) => {
    const isActive = button.dataset.plantCareCycle === activeLifeCycle;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function scrollToHashTarget() {
  const targetId = decodeURIComponent(window.location.hash.replace("#", ""));

  if (!targetId) {
    return;
  }

  const target = document.getElementById(targetId);

  if (!target) {
    return;
  }

  target.scrollIntoView({ block: "start" });
  target.focus({ preventScroll: true });
}

function renderCareGuides(items) {
  const filteredItems = getFilteredItems(items);
  updateResultCount(filteredItems.length, items.length);

  plantCareList.replaceChildren(
    ...(filteredItems.length
      ? filteredItems.map(createCareGuide)
      : [createTextElement("p", "care-empty", "No plant care sheets match those filters.")])
  );

  window.requestAnimationFrame(scrollToHashTarget);
}

if (plantCareList) {
  const plantCareItems = Array.isArray(window.plantCareItems) ? window.plantCareItems : [];
  setActiveLifeCycle("all");
  populatePlantCareFilter(plantCareItems);
  renderCareGuides(plantCareItems);
  plantCareFilter?.addEventListener("change", () => renderCareGuides(plantCareItems));
  plantCareSearch?.addEventListener("input", () => renderCareGuides(plantCareItems));
  plantCareCycleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveLifeCycle(button.dataset.plantCareCycle || "all");
      renderCareGuides(plantCareItems);
    });
  });
  window.addEventListener("hashchange", scrollToHashTarget);
}
