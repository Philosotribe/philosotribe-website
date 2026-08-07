// Refresh local static images with the current site version. This catches logos and
// page artwork that may have been loaded from an older browser cache before main.js ran.
if (window.philosotribeAssetUrl) {
  document.querySelectorAll("img[src]").forEach((image) => {
    const src = image.getAttribute("src");
    if (!src || /^(?:data:|blob:|https?:\/\/|\/\/)/i.test(src)) {
      return;
    }

    const versionedSrc = window.philosotribeAssetUrl(src);
    if (versionedSrc !== src) {
      image.setAttribute("src", versionedSrc);
    }
  });
}

const navToggle = document.querySelector("[data-nav-toggle]");
const siteMenu = document.querySelector("[data-site-menu]");
const dropdowns = document.querySelectorAll("[data-dropdown]");

if (navToggle && siteMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteMenu.classList.toggle("open");
    document.body.classList.toggle("menu-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

dropdowns.forEach((dropdown) => {
  const trigger = dropdown.querySelector("[data-dropdown-trigger]");

  if (!trigger) {
    return;
  }

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = dropdown.classList.toggle("open");
    trigger.setAttribute("aria-expanded", String(isOpen));
  });
});

document.addEventListener("click", (event) => {
  dropdowns.forEach((dropdown) => {
    if (!dropdown.contains(event.target)) {
      dropdown.classList.remove("open");
      const trigger = dropdown.querySelector("[data-dropdown-trigger]");
      trigger?.setAttribute("aria-expanded", "false");
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  dropdowns.forEach((dropdown) => {
    dropdown.classList.remove("open");
    const trigger = dropdown.querySelector("[data-dropdown-trigger]");
    trigger?.setAttribute("aria-expanded", "false");
  });

  if (siteMenu && navToggle) {
    siteMenu.classList.remove("open");
    document.body.classList.remove("menu-open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});
