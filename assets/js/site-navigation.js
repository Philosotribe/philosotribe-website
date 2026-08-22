(() => {
  const assetRoot = window.PHILOSOTRIBE_ASSET_ROOT || "";
  const local = (path) => `${assetRoot}${path}`;

  const route = (() => {
    const pathname = window.location.pathname.replace(/\\/g, "/");

    if (/\/sign-up\/(?:index\.html)?$/i.test(pathname)) return "signup";
    if (/\/plants\.html$/i.test(pathname)) return "plants";
    if (/\/plant-care\.html$/i.test(pathname)) return "plant-care";
    if (/\/pot-rebate\.html$/i.test(pathname)) return "pot-rebate";
    if (/\/crafts\.html$/i.test(pathname)) return "crafts";
    if (/\/calendar\.html$/i.test(pathname)) return "calendar";
    if (/\/about\.html$/i.test(pathname)) return "about";
    if (/\/contact\.html$/i.test(pathname)) return "contact";
    if (/\/credits\.html$/i.test(pathname)) return "credits";
    if (/\/404\.html$/i.test(pathname)) return "404";
    return "home";
  })();

  const isPlantRoute = ["plants", "plant-care", "pot-rebate"].includes(route);
  const isMoreRoute = ["contact", "credits"].includes(route);

  const currentAttrs = (key) => route === key ? ' active" aria-current="page' : '';
  const dropdownCurrentClass = (active) => active ? " active" : "";

  const header = document.querySelector("[data-site-header]");
  if (header) {
    header.innerHTML = `
      <nav class="nav-shell" aria-label="Main navigation">
        <a class="brand" href="${local("index.html")}" aria-label="Philosotribe home">
          <span class="brand-mark" aria-hidden="true"><img src="${local("assets/img/PhilosotribeIcon.png")}" alt=""></span>
          <span class="brand-text">Philosotribe</span>
        </a>

        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-menu" data-nav-toggle>
          <span class="nav-toggle-line"></span>
          <span class="nav-toggle-line"></span>
          <span class="nav-toggle-line"></span>
          <span class="sr-only">Menu</span>
        </button>

        <div class="site-menu" id="site-menu" data-site-menu>
          <div class="dropdown nav-primary-group${dropdownCurrentClass(isPlantRoute)}" data-dropdown>
            <button class="nav-link dropdown-trigger${dropdownCurrentClass(isPlantRoute)}" type="button" aria-expanded="false" aria-controls="plants-menu" data-dropdown-trigger>
              Plants
              <span class="chevron" aria-hidden="true"></span>
            </button>
            <div class="dropdown-menu dropdown-menu-start" id="plants-menu" data-dropdown-menu>
              <a class="${route === "plants" ? "active" : ""}" ${route === "plants" ? 'aria-current="page"' : ""} href="${local("plants.html")}">Our Plants</a>
              <a class="${route === "plant-care" ? "active" : ""}" ${route === "plant-care" ? 'aria-current="page"' : ""} href="${local("plant-care.html")}">Plant Care Guide</a>
              <a class="${route === "pot-rebate" ? "active" : ""}" ${route === "pot-rebate" ? 'aria-current="page"' : ""} href="${local("pot-rebate.html")}">Pot Rebate Program</a>
            </div>
          </div>

          <a class="nav-link${route === "crafts" ? " active" : ""}" ${route === "crafts" ? 'aria-current="page"' : ""} href="${local("crafts.html")}">Crafts</a>
          <a class="nav-link${route === "calendar" ? " active" : ""}" ${route === "calendar" ? 'aria-current="page"' : ""} href="${local("calendar.html")}">Find Us</a>
          <a class="nav-link${route === "about" ? " active" : ""}" ${route === "about" ? 'aria-current="page"' : ""} href="${local("about.html")}">About</a>

          <div class="dropdown dropdown-align-right nav-primary-group${dropdownCurrentClass(isMoreRoute)}" data-dropdown>
            <button class="nav-link dropdown-trigger${dropdownCurrentClass(isMoreRoute)}" type="button" aria-expanded="false" aria-controls="more-menu" data-dropdown-trigger>
              More
              <span class="chevron" aria-hidden="true"></span>
            </button>
            <div class="dropdown-menu" id="more-menu" data-dropdown-menu>
              <a class="${route === "contact" ? "active" : ""}" ${route === "contact" ? 'aria-current="page"' : ""} href="${local("contact.html")}">Contact Us</a>
              <a href="https://www.etsy.com/shop/Philosotribe" target="_blank" rel="noreferrer">Etsy Store <span aria-hidden="true">↗</span></a>
              <a class="${route === "credits" ? "active" : ""}" ${route === "credits" ? 'aria-current="page"' : ""} href="${local("credits.html")}">Image Credits</a>
            </div>
          </div>

          <a class="nav-link nav-cta${route === "signup" ? " active" : ""}" ${route === "signup" ? 'aria-current="page"' : ""} href="${local("sign-up/")}">Sign Up</a>
        </div>
      </nav>
    `;
  }

  const footer = document.querySelector("[data-site-footer]");
  if (footer) {
    footer.innerHTML = `
      <div class="footer-inner footer-inner-grid">
        <div class="footer-intro">
          <a class="footer-brand" href="${local("index.html")}">Philosotribe</a>
          <p>Hands-on family learning through plants, crafts, and small business practice.</p>
        </div>

        <nav class="footer-nav-groups" aria-label="Footer navigation">
          <div class="footer-link-group">
            <p class="footer-heading">Plants</p>
            <a href="${local("plants.html")}">Our Plants</a>
            <a href="${local("plant-care.html")}">Plant Care</a>
            <a href="${local("pot-rebate.html")}">Pot Rebate</a>
          </div>

          <div class="footer-link-group">
            <p class="footer-heading">Philosotribe</p>
            <a href="${local("about.html")}">About Us</a>
            <a href="${local("calendar.html")}">Find Us</a>
            <a href="${local("contact.html")}">Contact</a>
            <a href="${local("sign-up/")}">Newsletter</a>
          </div>

          <div class="footer-link-group">
            <p class="footer-heading">Shop &amp; Info</p>
            <a href="${local("crafts.html")}">Crafts</a>
            <a href="https://www.etsy.com/shop/Philosotribe" target="_blank" rel="noreferrer">Etsy Store <span aria-hidden="true">↗</span></a>
            <a href="${local("credits.html")}">Image Credits</a>
          </div>
        </nav>
      </div>
    `;
  }

  // Apply the current cache-busting version to the dynamically rendered logo.
  if (window.philosotribeAssetUrl) {
    document.querySelectorAll("[data-site-header] img[src]").forEach((image) => {
      image.setAttribute("src", window.philosotribeAssetUrl(image.getAttribute("src")));
    });
  }
})();
