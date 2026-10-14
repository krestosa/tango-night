/* NOCHE DE TANGO | progressive enhancement, no framework or dependencies */
(() => {
  "use strict";
  const data = window.NOCHE_TANGO_CONFIG || {};
  const q = (selector, base = document) => base.querySelector(selector);
  const qa = (selector, base = document) => [...base.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Booking destination is always the actual SushiClub reservation entry point.
  const safeUrl = (value) => {
    if (typeof value !== "string") return null;
    try {
      const u = new URL(value);
      return u.protocol === "https:" ? u.href : null;
    } catch { return null; }
  };
  const bookingUrl = safeUrl(data.reservationUrl) || "https://www.sushiclub.com.ar/shop_reservas.php";
  qa("[data-reservation-link]").forEach((a) => { a.href = bookingUrl; });

  // Interruptible mobile menu, with focus semantics and reduced-motion support.
  const menuToggle = q("[data-menu-toggle]");
  const mobileNavigation = q("#mobile-navigation");
  let menuAnimation = null;
  if (mobileNavigation) mobileNavigation.inert = true;

  const setMenuOpen = (open, immediate = false) => {
    if (!menuToggle || !mobileNavigation) return;
    menuAnimation?.cancel();
    menuAnimation = null;
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    mobileNavigation.setAttribute("aria-hidden", String(!open));
    mobileNavigation.inert = !open;
    document.body.classList.toggle("menu-open", open);

    if (open) {
      mobileNavigation.hidden = false;
      if (!immediate && !reducedMotion && mobileNavigation.animate) {
        menuAnimation = mobileNavigation.animate(
          [{ opacity: 0, transform: "translate3d(0, -14px, 0)" },
           { opacity: 1, transform: "translate3d(0, 0, 0)" }],
          { duration: 240, easing: "cubic-bezier(.32, .72, 0, 1)" }
        );
      }
    } else if (!immediate && !reducedMotion && !mobileNavigation.hidden && mobileNavigation.animate) {
      const closing = mobileNavigation.animate(
        [{ opacity: 1, transform: "translate3d(0, 0, 0)" },
         { opacity: 0, transform: "translate3d(0, -10px, 0)" }],
        { duration: 160, easing: "cubic-bezier(.22, 1, .36, 1)" }
      );
      menuAnimation = closing;
      closing.onfinish = () => {
        if (menuToggle.getAttribute("aria-expanded") === "false") mobileNavigation.hidden = true;
        if (menuAnimation === closing) menuAnimation = null;
      };
    } else {
      mobileNavigation.hidden = true;
    }
  };

  menuToggle?.addEventListener("click", () => {
    setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
  });
  qa("a", mobileNavigation || document).forEach((link) =>
    link.addEventListener("click", () => setMenuOpen(false))
  );
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle?.getAttribute("aria-expanded") === "true") {
      setMenuOpen(false, true);
      menuToggle.focus();
    }
  });
  window.matchMedia("(min-width: 761px)").addEventListener("change", (event) => {
    if (event.matches) setMenuOpen(false, true);
  });

  // Render confirmed events only; never guess venues, dates or performance formats.
  const eventsRoot = q("[data-events]");
  const events = Array.isArray(data.events) ? data.events : [];
  if (eventsRoot) {
    if (!events.length) {
      const block = document.createElement("div");
      block.className = "events__empty";
      const title = document.createElement("strong");
      title.textContent = "La próxima función te espera.";
      const p = document.createElement("p");
      p.textContent = "Consultá fechas, locales adheridos y modalidad del espectáculo en el canal oficial de reservas.";
      block.append(title, p);
      eventsRoot.replaceChildren(block);
    } else {
      const frag = document.createDocumentFragment();
      for (const item of events) {
        if (!item || typeof item !== "object" || !item.venue || !item.date || !["minimal", "essential"].includes(item.format)) continue;
        const wrap = document.createElement("article");
        wrap.className = "event-item";
        const date = document.createElement("span");
        date.className = "event-item__date";
        date.textContent = String(item.date) + (item.time ? " · " + String(item.time) : "");
        const name = document.createElement("h3");
        name.className = "event-item__name";
        name.textContent = String(item.venue);
        const detail = document.createElement("p");
        detail.className = "event-item__details";
        detail.textContent = item.format === "minimal" ? "MINIMAL · MÚSICA EN VIVO · SIN BAILE" : "ESSENTIAL · MÚSICA Y DANZA EN VIVO";
        const book = document.createElement("a");
        book.className = "event-item__book";
        book.href = safeUrl(item.bookingUrl) || bookingUrl;
        book.target = "_blank";
        book.rel = "noopener noreferrer";
        book.textContent = "RESERVAR ESTA FECHA ↗";
        wrap.append(date, name, detail, book);
        frag.append(wrap);
      }
      if (frag.childNodes.length) eventsRoot.replaceChildren(frag);
    }
  }

  // One FAQ expanded at a time; native details preserves keyboard semantics.
  const faqs = qa(".faq");
  faqs.forEach((faq) => faq.addEventListener("toggle", () => {
    if (faq.open) faqs.forEach((other) => { if (other !== faq) other.open = false; });
  }));

  // Viewport reveals with a transparent fallback when observers are unavailable.
  if (!reducedMotion && "IntersectionObserver" in window) {
    document.documentElement.classList.add("js-motion");
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible", "is-in-view");
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.08, rootMargin: "0px 0px 30px 0px" });
    qa(".reveal, .interlude, .final-cta").forEach((el) => observer.observe(el));
  }

})();
