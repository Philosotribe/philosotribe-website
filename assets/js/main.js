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

// First-visit newsletter invitation. Once dismissed (including by clicking the
// backdrop, pressing Escape, choosing Not now, or following the sign-up link),
// it stays dismissed for this browser and is not reset by normal site updates.
(() => {
  const dismissalKey = "philosotribe-newsletter-popup-dismissed";
  const cookieName = "philosotribe_newsletter_popup_dismissed";
  const assetRoot = window.PHILOSOTRIBE_ASSET_ROOT || "";
  const path = window.location.pathname.replace(/\/+$/, "/");
  const isSignupPage = /\/sign-up\/?$/i.test(path) || /\/sign-up\/index\.html$/i.test(path);
  const isErrorPage = document.title.startsWith("Page Not Found");

  const wasDismissed = () => {
    try {
      if (window.localStorage.getItem(dismissalKey) === "1") {
        return true;
      }
    } catch (_) {
      // Fall through to the cookie check.
    }

    return document.cookie
      .split(";")
      .map((part) => part.trim())
      .some((part) => part === `${cookieName}=1`);
  };

  const rememberDismissal = () => {
    try {
      window.localStorage.setItem(dismissalKey, "1");
    } catch (_) {
      // The long-lived cookie below is a fallback when localStorage is blocked.
    }

    document.cookie = `${cookieName}=1; Max-Age=315360000; Path=/; SameSite=Lax`;
  };

  // The dedicated sign-up page should never show a sign-up invitation. Visiting
  // it also counts as having seen the invitation so it won't appear after leaving.
  if (isSignupPage) {
    rememberDismissal();
    return;
  }

  if (isErrorPage || wasDismissed()) {
    return;
  }

  const popup = document.createElement("div");
  popup.className = "newsletter-popup";
  popup.setAttribute("data-newsletter-popup", "");
  popup.innerHTML = `
    <section
      class="newsletter-popup-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-popup-title"
      aria-describedby="newsletter-popup-description"
    >
      <button class="newsletter-popup-close" type="button" aria-label="Close newsletter invitation" data-newsletter-dismiss>&times;</button>
      <p class="eyebrow">A note from Philosotribe</p>
      <h2 id="newsletter-popup-title">Want to shop with us again?</h2>
      <p class="newsletter-popup-copy" id="newsletter-popup-description">
        Join the Philosotribe newsletter for plant-sale dates, merchant-day updates, and notes about what we're making and growing next. I promise they will only be like three times a year!
      </p>
      <p class="newsletter-popup-perk">
        <strong>Subscriber perk:</strong> your welcome email will include a discount, and future update emails will include subscriber discounts too.
      </p>
      <div class="newsletter-popup-actions">
        <a class="button button-primary" href="${assetRoot}sign-up/" data-newsletter-signup>Join the newsletter</a>
        <button class="newsletter-popup-skip" type="button" data-newsletter-dismiss>Not now</button>
      </div>
      <p class="newsletter-popup-fineprint">Close this once and we won't ask again on this browser.</p>
    </section>
  `;

  const panel = popup.querySelector(".newsletter-popup-panel");
  const closeButton = popup.querySelector(".newsletter-popup-close");
  const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const previousFocus = document.activeElement;
  let closed = false;

  const closePopup = () => {
    if (closed) {
      return;
    }

    closed = true;
    rememberDismissal();
    popup.classList.remove("is-visible");
    document.body.classList.remove("newsletter-popup-open");

    window.setTimeout(() => {
      popup.remove();
      if (previousFocus instanceof HTMLElement && document.contains(previousFocus)) {
        previousFocus.focus({ preventScroll: true });
      }
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 190);
  };

  popup.addEventListener("click", (event) => {
    if (event.target === popup || event.target.closest("[data-newsletter-dismiss]")) {
      closePopup();
    }
  });

  popup.querySelector("[data-newsletter-signup]")?.addEventListener("click", rememberDismissal);

  popup.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closePopup();
      return;
    }

    if (event.key !== "Tab" || !panel) {
      return;
    }

    const focusable = [...panel.querySelectorAll(focusableSelector)].filter((element) => element.offsetParent !== null);
    if (!focusable.length) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.body.append(popup);
  document.body.classList.add("newsletter-popup-open");

  window.setTimeout(() => {
    popup.classList.add("is-visible");
    closeButton?.focus({ preventScroll: true });
  }, 450);
})();
