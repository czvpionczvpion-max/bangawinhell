document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  let currentLang = localStorage.getItem('bangawin-lang') || 'pl';

  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('bangawin-lang', lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('.lang-toggle button').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      const translation = translations[lang]?.[key];
      if (translation !== undefined) {
        if (translation.includes('<')) {
          el.innerHTML = translation;
        } else {
          el.textContent = translation;
        }
      }
    });
  }

  document.querySelectorAll('.lang-toggle button').forEach((btn) => {
    btn.addEventListener('click', function () {
      setLanguage(this.dataset.lang);
    });
  });

  setLanguage(currentLang);

  document.querySelectorAll('.btn-scroll, .nav-links a, a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const navHeight = document.querySelector('.nav')?.offsetHeight || 0;
          const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 16;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');

        entry.target.querySelectorAll('.reveal-stagger').forEach((child, i) => {
          child.style.transitionDelay = `${i * 70}ms`;
          child.classList.add('is-visible');
        });

        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  );

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  document.querySelectorAll('.reveal-stagger').forEach((el) => {
    if (!el.closest('.reveal')) {
      revealObserver.observe(el);
    }
  });

  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const toast = document.querySelector('.toast');
  let toastTimer;

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
    }
    return legacyCopy(text);
  }

  function legacyCopy(text) {
    return new Promise((resolve, reject) => {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      ok ? resolve() : reject();
    });
  }

  document.querySelectorAll('[data-copy]').forEach((el) => {
    el.addEventListener('click', () => {
      copyText(el.dataset.copy).then(() => {
        document.querySelectorAll('[data-copy]').forEach((other) => other.classList.remove('is-copied'));
        el.classList.add('is-copied');

        const label = el.querySelector('.copy-text');
        if (label) label.textContent = translations[currentLang]?.copied || 'OK';

        if (toast) toast.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
          el.classList.remove('is-copied');
          if (label) label.textContent = translations[currentLang]?.copyBtn || '';
          if (toast) toast.classList.remove('is-visible');
        }, 2200);
      });
    });
  });

  const heroFrame = document.querySelector('.hero-frame');
  const canTilt =
    window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 901px)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (heroFrame && canTilt) {
    heroFrame.addEventListener('pointermove', (e) => {
      const rect = heroFrame.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      heroFrame.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 8}deg) scale(1.02)`;
    });
    heroFrame.addEventListener('pointerleave', () => {
      heroFrame.style.transform = '';
    });
  }

  const yearSpan = document.querySelector('.footer-legal p:last-child');
  if (yearSpan) {
    yearSpan.innerHTML = yearSpan.innerHTML.replace('2026', String(new Date().getFullYear()));
  }
});
