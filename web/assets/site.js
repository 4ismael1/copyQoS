(function () {
  const STORAGE_KEY = "copydc_legal_lang";
  const SUPPORTED = ["en", "es"];

  const common = {
    en: {
      brand: "CopyDC Legal Center",
      nav_home: "Home",
      nav_terms: "Terms",
      nav_privacy: "Privacy",
      lang_label: "Language",
      footer_note: "Public legal pages for CopyDC.",
    },
    es: {
      brand: "Centro Legal CopyDC",
      nav_home: "Inicio",
      nav_terms: "Terminos",
      nav_privacy: "Privacidad",
      lang_label: "Idioma",
      footer_note: "Paginas legales publicas para CopyDC.",
    },
  };

  function getQueryLang() {
    const queryLang = new URLSearchParams(window.location.search).get("lang");
    return SUPPORTED.includes(queryLang) ? queryLang : null;
  }

  function detectLanguage() {
    const fromQuery = getQueryLang();
    if (fromQuery) {
      return fromQuery;
    }

    const fromStorage = localStorage.getItem(STORAGE_KEY);
    if (SUPPORTED.includes(fromStorage)) {
      return fromStorage;
    }

    return "en";
  }

  function localizeLinks(lang) {
    const nodes = document.querySelectorAll("[data-localized-link]");
    nodes.forEach((node) => {
      const href = node.getAttribute("href");
      if (!href || href.startsWith("#")) {
        return;
      }

      const absolute = new URL(href, window.location.href);
      if (lang === "en") {
        absolute.searchParams.delete("lang");
      } else {
        absolute.searchParams.set("lang", lang);
      }

      node.setAttribute("href", absolute.pathname + absolute.search + absolute.hash);
    });
  }

  function updateUrl(lang) {
    const next = new URL(window.location.href);
    if (lang === "en") {
      next.searchParams.delete("lang");
    } else {
      next.searchParams.set("lang", lang);
    }
    window.history.replaceState({}, "", next.pathname + next.search + next.hash);
  }

  function applyDictionary(dict) {
    if (dict.meta_title) {
      document.title = dict.meta_title;
    }

    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const key = node.getAttribute("data-i18n");
      if (Object.prototype.hasOwnProperty.call(dict, key)) {
        node.textContent = dict[key];
      }
    });
  }

  function setupReveal() {
    const nodes = document.querySelectorAll(".reveal");
    if (!nodes.length) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.14,
      },
    );

    nodes.forEach((node, index) => {
      node.style.transitionDelay = `${Math.min(index * 60, 220)}ms`;
      observer.observe(node);
    });
  }

  function mergeDictionary(page, lang) {
    return {
      ...common[lang],
      ...(page[lang] || {}),
    };
  }

  function init(pageDictionary) {
    const selector = document.getElementById("lang-select");
    const initialLang = detectLanguage();

    function render(lang, options) {
      const opts = {
        persist: true,
        updateQuery: true,
        ...options,
      };

      const safeLang = SUPPORTED.includes(lang) ? lang : "en";
      const dict = mergeDictionary(pageDictionary, safeLang);
      document.documentElement.lang = safeLang;
      document.body.dataset.lang = safeLang;
      applyDictionary(dict);
      localizeLinks(safeLang);

      if (selector) {
        selector.value = safeLang;
      }

      if (opts.persist) {
        localStorage.setItem(STORAGE_KEY, safeLang);
      }

      if (opts.updateQuery) {
        updateUrl(safeLang);
      }
    }

    if (selector) {
      selector.addEventListener("change", (event) => {
        render(event.target.value, { persist: true, updateQuery: true });
      });
    }

    render(initialLang, { persist: false, updateQuery: true });
    setupReveal();
  }

  window.CopyLegal = {
    init,
  };
})();
