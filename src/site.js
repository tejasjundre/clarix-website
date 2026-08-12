import "./styles.css";
import { animate, inView, stagger } from "motion";

const currentPath = window.location.pathname;
const currentFile = currentPath.endsWith("/")
  ? "index.html"
  : currentPath.split("/").pop() || "index.html";
const isHomePage = currentFile === "index.html";
const storagePrefix = "clarix";

const navSections = [
  { id: "home", label: "Home" },
  { id: "what-we-do", label: "What We Do" },
  { id: "features", label: "Features" },
  { id: "why-clarix", label: "Why Clarix" },
  { id: "careers", label: "Careers", href: "careers.html" },
  { id: "contact", label: "Contact" },
];

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const sectionHref = (id) => (isHomePage ? `#${id}` : `index.html#${id}`);

const navHref = (section) => section.href || sectionHref(section.id);

const readStorage = (key) => {
  try {
    return window.localStorage.getItem(`${storagePrefix}:${key}`);
  } catch {
    return null;
  }
};

const writeStorage = (key, value) => {
  try {
    window.localStorage.setItem(`${storagePrefix}:${key}`, value);
  } catch {}
};

const removeStorage = (key) => {
  try {
    window.localStorage.removeItem(`${storagePrefix}:${key}`);
  } catch {}
};

const renderBrand = (variant = "") => `
  <img
    class="${`brand-logo ${variant}`.trim()}"
    src="/clarix-logo.png"
    alt="Clarix Digitech logo"
  />
`;

const renderHeader = () => {
  const header = document.querySelector("[data-site-header]");
  if (!header) {
    return;
  }

  const links = navSections
    .map(
      (section) => `
        <a
          class="nav-link${section.href === currentFile ? " is-active" : ""}"
          href="${navHref(section)}"
          ${section.href ? "" : `data-nav-target="${section.id}"`}
        >
          ${section.label}
        </a>
      `
    )
    .join("");

  header.className = "site-header";
  header.innerHTML = `
    <div class="header-frame">
      <div class="shell header-shell">
        <a class="brand" href="${sectionHref("home")}" aria-label="Clarix Digitech home">
          ${renderBrand("brand-logo-header")}
        </a>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-label="Toggle menu" data-menu-toggle>
          <span></span>
          <span></span>
        </button>
        <div class="nav-wrap" data-nav-wrap>
          <nav class="site-nav" aria-label="Primary">
            ${links}
          </nav>
          <div class="nav-cta">
            <button class="btn btn-outline-info theme-toggle" type="button" aria-pressed="false" aria-label="Switch to light theme" data-theme-toggle>
              <span class="theme-toggle-icon" aria-hidden="true"></span>
              <span class="visually-hidden" data-theme-label>Switch to light theme</span>
            </button>
            <a class="button button-primary" href="${sectionHref("contact")}" data-contact-target="school">Early Access</a>
          </div>
        </div>
      </div>
    </div>
  `;
};

const renderFooter = () => {
  const footer = document.querySelector("[data-site-footer]");
  if (!footer) {
    return;
  }

  const links = navSections.map((section) => `<a href="${navHref(section)}">${section.label}</a>`).join("");

  footer.className = "site-footer";
  footer.innerHTML = `
    <canvas class="particle-canvas particle-canvas-footer" data-particles="footer" aria-hidden="true"></canvas>
    <div class="shell footer-shell">
      <div class="footer-column footer-brand">
        <a class="brand footer-brand-link" href="${sectionHref("home")}" aria-label="Clarix Digitech home">
          ${renderBrand("brand-logo-footer")}
        </a>
        <p>Build Smarter. Manage Better.</p>
      </div>
      <div class="footer-column footer-nav">
        <p class="footer-label">Navigation</p>
        <div class="footer-links">
          ${links}
        </div>
      </div>
      <div class="footer-column footer-social">
        <p class="footer-label">Connect</p>
        <div class="social-links">
          <a href="${sectionHref("contact")}" aria-label="Open contact form">Enquiry</a>
          <a href="https://clarixdigitech.com" aria-label="Visit Clarix website" target="_blank" rel="noreferrer">Website</a>
          <a href="${sectionHref("contact")}" aria-label="Open contact section">Form</a>
        </div>
      </div>
    </div>
    <div class="shell footer-bottom">
      <span>Clarix Digitech Private Limited | Registered in Maharashtra, India | MSME Registered | GST Compliant</span>
    </div>
  `;
};

const initMenu = () => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector("[data-menu-toggle]");
  const navWrap = document.querySelector("[data-nav-wrap]");

  if (!header || !toggle || !navWrap) {
    return;
  }

  const closeMenu = () => {
    header.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const next = header.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(next));
  });

  navWrap.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 960) {
      closeMenu();
    }
  });
};

const initThemeToggle = () => {
  const toggle = document.querySelector("[data-theme-toggle]");
  const label = document.querySelector("[data-theme-label]");
  const storedTheme = readStorage("theme");
  const initialTheme = storedTheme === "light" ? "light" : "dark";

  const applyTheme = (theme) => {
    document.body.dataset.theme = theme;
    writeStorage("theme", theme);

    if (toggle) {
      toggle.setAttribute("aria-pressed", String(theme === "light"));
      toggle.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
    }

    if (label) {
      label.textContent = theme === "light" ? "Switch to dark theme" : "Switch to light theme";
    }
  };

  applyTheme(initialTheme);

  toggle?.addEventListener("click", () => {
    const nextTheme = document.body.dataset.theme === "light" ? "dark" : "light";
    applyTheme(nextTheme);
  });
};

const initActiveSections = () => {
  if (!isHomePage) {
    return;
  }

  const sections = navSections
    .map((section) => document.getElementById(section.id))
    .filter(Boolean);
  const links = [...document.querySelectorAll("[data-nav-target]")];

  const activate = (id) => {
    links.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.navTarget === id);
    });
  };

  activate("home");

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

      if (visible?.target.id) {
        activate(visible.target.id);
      }
    },
    { threshold: [0.2, 0.45, 0.7], rootMargin: "-20% 0px -30% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
};

const initRevealMotion = () => {
  const revealGroups = [...document.querySelectorAll("[data-reveal-group]")];
  if (!revealGroups.length) {
    return;
  }

  if (prefersReducedMotion()) {
    revealGroups.forEach((group) => {
      group.querySelectorAll("[data-reveal]").forEach((item) => {
        item.style.opacity = "1";
        item.style.transform = "none";
      });
    });
    return;
  }

  revealGroups.forEach((group) => {
    const items = [...group.querySelectorAll("[data-reveal]")];
    items.forEach((item) => {
      item.style.opacity = "0";
      item.style.transform = "translateY(34px)";
    });

    let hasAnimated = false;

    inView(
      group,
      () => {
        if (hasAnimated || !items.length) {
          return;
        }

        hasAnimated = true;
        animate(
          items,
          { opacity: [0, 1], transform: ["translateY(34px)", "translateY(0px)"] },
          {
            duration: 0.8,
            delay: stagger(0.08),
            easing: [0.16, 1, 0.3, 1],
          }
        );
      },
      { amount: 0.18 }
    );
  });
};

const initHeroParallax = () => {
  const stage = document.querySelector("[data-hero-stage]");
  if (!stage || prefersReducedMotion() || window.innerWidth < 768) {
    return;
  }

  let frame = 0;

  const update = (x, y) => {
    stage.style.setProperty("--hero-tilt-x", `${y * -7}deg`);
    stage.style.setProperty("--hero-tilt-y", `${x * 9}deg`);
    stage.style.setProperty("--hero-shift-x", `${x * 24}px`);
    stage.style.setProperty("--hero-shift-y", `${y * 20}px`);
  };

  update(0, 0);

  stage.addEventListener("pointermove", (event) => {
    const rect = stage.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

    cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => update(x, y));
  });

  stage.addEventListener("pointerleave", () => {
    cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => update(0, 0));
  });
};

const initTiltCards = () => {
  if (prefersReducedMotion() || window.innerWidth < 768) {
    return;
  }

  document.querySelectorAll("[data-tilt]").forEach((card) => {
    let frame = 0;

    const reset = () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.style.setProperty("--glow-x", "50%");
      card.style.setProperty("--glow-y", "50%");
    };

    reset();

    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

      cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        card.style.setProperty("--tilt-x", `${x * 7}deg`);
        card.style.setProperty("--tilt-y", `${y * -7}deg`);
        card.style.setProperty("--glow-x", `${50 + x * 18}%`);
        card.style.setProperty("--glow-y", `${50 + y * 18}%`);
      });
    });

    card.addEventListener("pointerleave", () => {
      cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(reset);
    });
  });
};

const initCounters = () => {
  const counters = [...document.querySelectorAll("[data-count]")];
  if (!counters.length) {
    return;
  }

  const formatter = new Intl.NumberFormat("en-IN");

  const renderValue = (node, value) => {
    const prefix = node.dataset.prefix || "";
    const suffix = node.dataset.suffix || "";
    node.textContent = `${prefix}${formatter.format(value)}${suffix}`;
  };

  counters.forEach((counter) => renderValue(counter, 0));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.target.dataset.counted === "true") {
          return;
        }

        entry.target.dataset.counted = "true";

        const end = Number(entry.target.dataset.count || "0");
        const duration = 1400;
        const startTime = performance.now();

        const tick = (time) => {
          const progress = clamp((time - startTime) / duration, 0, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          renderValue(entry.target, Math.round(end * eased));

          if (progress < 1) {
            window.requestAnimationFrame(tick);
          } else {
            renderValue(entry.target, end);
          }
        };

        window.requestAnimationFrame(tick);
      });
    },
    { threshold: 0.45 }
  );

  counters.forEach((counter) => observer.observe(counter));
};

const initHorizontalScroll = () => {
  const section = document.querySelector("[data-horizontal-section]");
  const sticky = document.querySelector("[data-horizontal-sticky]");
  const track = document.querySelector("[data-horizontal-track]");

  if (!section || !sticky || !track) {
    return;
  }

  const sync = () => {
    if (window.innerWidth < 768) {
      section.style.height = "auto";
      track.style.transform = "none";
      return;
    }

    const distance = Math.max(track.scrollWidth - sticky.clientWidth, 0);
    section.style.height = `${window.innerHeight + distance + 180}px`;

    const rect = section.getBoundingClientRect();
    const progress = clamp(-rect.top / (section.offsetHeight - window.innerHeight), 0, 1);
    track.style.transform = `translate3d(${-distance * progress}px, 0, 0)`;
    section.style.setProperty("--feature-progress", String(progress));
  };

  let ticking = false;

  const requestSync = () => {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(() => {
      sync();
      ticking = false;
    });
  };

  sync();
  window.addEventListener("scroll", requestSync, { passive: true });
  window.addEventListener("resize", requestSync);
};

const initParticles = () => {
  const canvases = [...document.querySelectorAll("[data-particles]")];
  if (!canvases.length) {
    return;
  }

  canvases.forEach((canvas) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const kind = canvas.dataset.particles || "hero";
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = 0;
    let height = 0;
    let particles = [];
    let raf = 0;

    const particleColors = () => {
      const styles = getComputedStyle(document.body);
      return {
        fill: styles.getPropertyValue(kind === "hero" ? "--particle-hero-fill" : "--particle-footer-fill").trim(),
        shadow: styles.getPropertyValue(kind === "hero" ? "--particle-hero-shadow" : "--particle-footer-shadow").trim(),
        lineRgb: styles.getPropertyValue("--particle-line-rgb").trim(),
      };
    };

    const particleCount = () => {
      if (window.innerWidth < 768) {
        return kind === "hero" ? 12 : 8;
      }
      return kind === "hero" ? 28 : 18;
    };

    const reset = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles = Array.from({ length: particleCount() }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (kind === "hero" ? 0.18 : 0.12),
        vy: (Math.random() - 0.5) * (kind === "hero" ? 0.18 : 0.12),
        size: Math.random() * 2 + 1,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const colors = particleColors();

      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index];

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -20) particle.x = width + 20;
        if (particle.x > width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = height + 20;
        if (particle.y > height + 20) particle.y = -20;

        ctx.beginPath();
        ctx.fillStyle = colors.fill;
        ctx.shadowBlur = kind === "hero" ? 12 : 8;
        ctx.shadowColor = colors.shadow;
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;

      if (kind === "hero") {
        for (let left = 0; left < particles.length; left += 1) {
          for (let right = left + 1; right < particles.length; right += 1) {
            const first = particles[left];
            const second = particles[right];
            const dx = first.x - second.x;
            const dy = first.y - second.y;
            const distance = Math.hypot(dx, dy);

            if (distance < 120) {
              ctx.beginPath();
              ctx.strokeStyle = `rgba(${colors.lineRgb}, ${0.16 - distance / 900})`;
              ctx.lineWidth = 1;
              ctx.moveTo(first.x, first.y);
              ctx.lineTo(second.x, second.y);
              ctx.stroke();
            }
          }
        }
      }

      if (!prefersReducedMotion()) {
        raf = window.requestAnimationFrame(draw);
      }
    };

    reset();
    draw();

    window.addEventListener("resize", () => {
      cancelAnimationFrame(raf);
      reset();
      draw();
    });
  });
};

const initContactTabs = () => {
  const root = document.querySelector("[data-contact-tabs]");
  if (!root) {
    return;
  }

  const tabs = [...root.querySelectorAll("[data-tab]")];
  const panels = [...root.querySelectorAll("[data-panel]")];

  const show = (name, persist = true) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.tab === name;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });

    panels.forEach((panel) => {
      const active = panel.dataset.panel === name;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });

    if (persist) {
      writeStorage("preferred-tab", name);
    }
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => show(tab.dataset.tab || "school"));
  });

  const storedTab = readStorage("preferred-tab");
  const initialTab = tabs.some((tab) => tab.dataset.tab === storedTab) ? storedTab : tabs[0]?.dataset.tab || "school";
  show(initialTab, false);
};

const initIntentChips = () => {
  document.querySelectorAll("[data-intent-group]").forEach((group) => {
    const hiddenInput = group.querySelector('input[type="hidden"]');
    const buttons = [...group.querySelectorAll("[data-intent]")];

    if (!hiddenInput || !buttons.length) {
      return;
    }

    const activate = (value) => {
      hiddenInput.value = value;
      buttons.forEach((button) => {
        button.classList.toggle("is-active", button.dataset.intent === value);
      });
      hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
    };

    activate(hiddenInput.value || buttons[0].dataset.intent || "");

    buttons.forEach((button) => {
      button.addEventListener("click", () => activate(button.dataset.intent || ""));
    });
  });
};

const initContactShortcuts = () => {
  document.querySelectorAll("[data-contact-target]").forEach((link) => {
    link.addEventListener("click", () => {
      const target = link.dataset.contactTarget || "school";
      writeStorage("preferred-tab", target);

      const tabsRoot = document.querySelector("[data-contact-tabs]");
      if (!tabsRoot) {
        return;
      }

      const tab = tabsRoot.querySelector(`[data-tab="${target}"]`);
      tab?.click();
    });
  });
};

const getDraftKey = (form) => {
  const type = form.dataset.formType || form.id || currentFile;
  return `draft:${type}`;
};

const initDraftPersistence = () => {
  document.querySelectorAll("[data-contact-form]").forEach((form) => {
    const status = form.querySelector("[data-form-status]");
    const saved = readStorage(getDraftKey(form));

    if (saved) {
      try {
        const values = JSON.parse(saved);
        Object.entries(values).forEach(([name, value]) => {
          const field = form.querySelector(`[name="${name}"]`);
          if (!field || typeof value !== "string") {
            return;
          }

          if ("value" in field) {
            field.value = value;
          }
        });

        if (status) {
          status.textContent = "Draft restored on this device.";
          status.classList.add("is-saved");
        }
      } catch {}
    }

    const persist = () => {
      const values = {};
      form.querySelectorAll("input, textarea, select").forEach((field) => {
        if (!field.name || field.type === "file") {
          return;
        }

        values[field.name] = field.value;
      });

      writeStorage(getDraftKey(form), JSON.stringify(values));

      if (status) {
        status.textContent = "Draft saved on this device.";
        status.classList.add("is-saved");
      }
    };

    form.querySelectorAll("input, textarea, select").forEach((field) => {
      if (field.type === "file") {
        return;
      }

      field.addEventListener("input", persist);
      field.addEventListener("change", persist);
    });
  });
};

const initFaqAccordions = () => {
  document.querySelectorAll("[data-faq-toggle]").forEach((trigger) => {
    const item = trigger.closest(".faq-item");
    const panel = item?.querySelector("[data-faq-panel]");

    if (!item || !panel) {
      return;
    }

    trigger.addEventListener("click", () => {
      const next = trigger.getAttribute("aria-expanded") !== "true";
      trigger.setAttribute("aria-expanded", String(next));
      item.classList.toggle("is-open", next);
      panel.hidden = !next;
    });
  });
};

const formSuccess = {
  school:
    "Your early access enquiry has been submitted. We will review your school context and reply with the right next step.",
  investor:
    "Your investor enquiry has been submitted. We will come back with a focused response aligned to your interest.",
  student:
    "Your internship enquiry has been submitted. We will review your profile and get back with fit and next steps.",
  contact:
    "Your enquiry has been submitted. We will review it and get back with the right next step.",
};

const initContactForms = () => {
  document.querySelectorAll("[data-contact-form]").forEach((form) => {
    const status = form.querySelector("[data-form-status]");
    const feedback = form.querySelector("[data-form-feedback]");
    const feedbackText = form.querySelector("[data-form-feedback-text]");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const fields = {};

      for (const [name, value] of formData.entries()) {
        if (!value) {
          continue;
        }

        if (value instanceof File) {
          continue;
        }

        fields[name] = String(value).trim();
      }

      const type = form.dataset.formType || "contact";

      if (status) {
        status.classList.remove("is-saved", "is-error");
        status.textContent = "Submitting your enquiry securely...";
      }

      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
      }

      try {
        const response = await fetch("/api/enquiries", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type,
            fields,
            source: {
              page: currentFile,
              path: window.location.pathname,
            },
          }),
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok || result.ok === false) {
          throw new Error(result.message || "We could not submit the enquiry right now.");
        }

        if (feedback && feedbackText) {
          feedback.hidden = false;
          feedbackText.textContent = `${formSuccess[type] || formSuccess.contact} Reference: ${result.id}.`;
        }

        if (status) {
          status.classList.remove("is-saved", "is-error");
          status.textContent =
            result.delivery === "saved"
              ? "Submitted and stored on the server. Email notifications need SMTP setup."
              : "Submitted successfully.";
        }

        removeStorage(getDraftKey(form));
        form.reset();
      } catch (error) {
        if (status) {
          status.classList.add("is-error");
          status.textContent = error.message || "We could not submit the enquiry right now.";
        }
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
        }
      }
    });
  });
};

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
  initThemeToggle();
  initMenu();
  initActiveSections();
  initRevealMotion();
  initHeroParallax();
  initTiltCards();
  initCounters();
  initHorizontalScroll();
  initParticles();
  initContactTabs();
  initContactShortcuts();
  initDraftPersistence();
  initIntentChips();
  initFaqAccordions();
  initContactForms();
});
