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

  const questionPanels = qa(".questions--panels .blind");
  if (questionPanels.length) {
    const switches = questionPanels.map((panel) => q(".blind-switch", panel));
    let activationId = 0;
    let cancelPendingReveal = null;
    const activateQuestion = (index, focus = false) => {
      q(".questions--panels .blinds-stack")?.classList.toggle("is-keyboard", focus);
      const selectedPanel = questionPanels[index];
      if (selectedPanel.classList.contains("is-active")) {
        if (focus) switches[index].focus();
        return;
      }
      if (cancelPendingReveal) cancelPendingReveal();
      const currentActivation = ++activationId;
      questionPanels.forEach((panel, i) => {
        const active = i === index;
        panel.classList.remove("is-content-ready");
        panel.classList.toggle("is-active", active);
        switches[i].setAttribute("aria-expanded", String(active));
        q(".blind-detail", panel).hidden = !active;
      });
      const vertical = focus || window.matchMedia("(max-width:960px), (prefers-reduced-motion:reduce)").matches;
      if (vertical) {
        selectedPanel.classList.add("is-content-ready");
      } else {
        let timeoutId = 0;
        const cleanup = () => {
          selectedPanel.removeEventListener("transitionend", onEnd);
          window.clearTimeout(timeoutId);
          if (cancelPendingReveal === cleanup) cancelPendingReveal = null;
        };
        const reveal = () => {
          cleanup();
          if (activationId === currentActivation && selectedPanel.classList.contains("is-active")) {
            selectedPanel.classList.add("is-content-ready");
          }
        };
        const onEnd = (event) => {
          if (event.target === selectedPanel && event.propertyName === "flex-grow") reveal();
        };
        selectedPanel.addEventListener("transitionend", onEnd);
        timeoutId = window.setTimeout(reveal, 300);
        cancelPendingReveal = cleanup;
      }
      if (focus) switches[index].focus();
    };
    switches.forEach((button, index) => {
      button.addEventListener("click", (event) => activateQuestion(index, event.detail === 0));
      button.addEventListener("keydown", (event) => {
        const keys = ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"];
        if (!keys.includes(event.key)) return;
        event.preventDefault();
        const next = event.key === "Home" ? 0
          : event.key === "End" ? switches.length - 1
          : (index + (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1) + switches.length) % switches.length;
        activateQuestion(next, true);
      });
    });
  }

  const entranceText = qa([
    "#interlude .scene__credit",
    "#formatos .format-card__tag",
    "#formatos .format-card__body h3",
    "#formatos .format-card__body > p",
    "#formatos .format-card__features span",
    "#menu .rc-intro h2",
    "#menu .rc-price__amount",
    "#menu .rc-price__label",
    "#menu .rc-course__heading h3",
    "#menu .rc-choice",
    "#menu .rc-dishes p",
    "#menu .rc-drinks__base",
    "#menu .rc-drinks__extra-content",
    "#reservas .reservations-cartelera__row h3",
    "#reservas .reservations-cartelera__row p",
    "#informacion .blinds-head h2",
    ".campaign-footer__bottom p"
  ].join(","));
  if (!reducedMotion && "IntersectionObserver" in window) {
    entranceText.forEach((el) => el.classList.add("text-appear"));
  }
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
    qa(".reveal, .text-appear, .interlude, .final-cta").forEach((el) => observer.observe(el));
  }
  const dock = q(".reservation-dock");
  const finalReserveButton = q(".final-cta .button");
  if (dock && finalReserveButton) {
    let dockFrame = 0;
    const updateDock = () => {
      dockFrame = 0;
      const dockStyle = window.getComputedStyle(dock);
      const dockBottom = parseFloat(dockStyle.bottom) || 0;
      const offset = Math.max(80, dock.offsetHeight + dockBottom + 16);
      const buttonTop = finalReserveButton.getBoundingClientRect().top;
      dock.classList.toggle("is-hidden", buttonTop <= window.innerHeight - offset);
    };
    const scheduleDockUpdate = () => {
      if (dockFrame) return;
      dockFrame = window.requestAnimationFrame(updateDock);
    };
    window.addEventListener("scroll", scheduleDockUpdate, { passive: true });
    window.addEventListener("resize", scheduleDockUpdate, { passive: true });
    updateDock();
    const activateDock = () => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          updateDock();
          dock.classList.add("is-ready");
        });
      });
    };
    if (document.readyState === "complete") activateDock();
    else window.addEventListener("pageshow", activateDock, { once: true });
  }

  // Menu Recorrido: native anchor fallback with active-section tracking.
  // Bound exclusively to #menu; other landing sections retain their behavior.
  const recorrido = q("#menu.menu-recorrido");
  if (recorrido) {
    const links = qa("[data-rc-link]", recorrido);
    const courses = qa("[data-rc-part]", recorrido);
    const navScroller = q(".rc-links", recorrido);
    let activeCourseIndex = -1;
    const ensureActiveLinkVisible = (index) => {
      if (!navScroller || navScroller.scrollWidth <= navScroller.clientWidth + 1) return;
      const bounds = navScroller.getBoundingClientRect();
      const linkBounds = links[index].getBoundingClientRect();
      const inset = 8;
      let delta = 0;
      if (linkBounds.left < bounds.left + inset) delta = linkBounds.left - bounds.left - inset;
      else if (linkBounds.right > bounds.right - inset) delta = linkBounds.right - bounds.right + inset;
      if (Math.abs(delta) > 1) {
        navScroller.scrollBy({ left: delta, behavior: reducedMotion ? "instant" : "smooth" });
      }
    };
    const setCurrentCourse = (index) => {
      if (activeCourseIndex !== index) {
        activeCourseIndex = index;
        links.forEach((link, i) => {
          if (i === index) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
        ensureActiveLinkVisible(index);
      }
    };
    const syncCurrentCourse = () => {
      const threshold = Math.min(window.innerHeight * .4, parseFloat(window.getComputedStyle(courses[0]).scrollMarginTop) + 68);
      let current = 0;
      courses.forEach((course, index) => {
        if (course.getBoundingClientRect().top <= threshold) current = index;
      });
      setCurrentCourse(current);
    };
    let courseFrame = 0;
    const scheduleCourseSync = () => {
      if (courseFrame) return;
      courseFrame = window.requestAnimationFrame(() => {
        courseFrame = 0;
        syncCurrentCourse();
      });
    };
    links.forEach((link, index) => link.addEventListener("click", (event) => {
      const course = courses[index];
      if (!course) return;
      event.preventDefault();
      ensureActiveLinkVisible(index);
      setCurrentCourse(index);
      course.scrollIntoView({ block: "start", behavior: reducedMotion ? "instant" : "smooth" });
    }));
    window.addEventListener("scroll", scheduleCourseSync, { passive: true });
    window.addEventListener("resize", scheduleCourseSync, { passive: true });
    syncCurrentCourse();
  }



})();
