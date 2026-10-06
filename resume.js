/* ============================================================
   KHUSHI YADAV — RESUME INTERACTIONS
   Internship / Entry-Level version toggle · Print button ·
   Auto-hiding of optional sections that have no content yet.

   Vanilla JavaScript only — no libraries, no external requests.
   Every word of resume content lives in resume.html, so the
   resume stays complete and ATS-parseable even if JavaScript is
   disabled or blocked. This file only changes ORDER, VISIBILITY
   and the browser tab title.
   ============================================================ */

(function () {
  'use strict';

  /* ── Configuration ─────────────────────────────────────────
     To add a third version later, add an entry here and a matching
     button in resume.html. Nothing else needs changing. */
  var STORAGE_KEY = 'khushi-resume-variant';
  var DEFAULT_VARIANT = 'internship';

  var VARIANTS = {
    internship: {
      role: 'Aspiring AI Engineer \u00B7 Internship Candidate',
      pageTitle: 'Khushi Yadav \u2014 Resume (Internship)',
      objectiveId: 'objectiveInternship',
      /* Internship applications: the degree and current studies lead. */
      order: ['objective', 'education', 'skills', 'projects', 'learning',
              'experience', 'certifications', 'achievements', 'languages']
    },
    job: {
      role: 'Aspiring AI Engineer \u00B7 Entry-Level Candidate',
      pageTitle: 'Khushi Yadav \u2014 Resume (Entry-Level)',
      objectiveId: 'objectiveJob',
      /* Entry-level applications: skills and proof of work lead,
         the degree supports them. */
      order: ['objective', 'skills', 'projects', 'learning', 'experience',
              'education', 'certifications', 'achievements', 'languages']
    }
  };

  /* ── Tiny helpers ───────────────────────────────────────── */
  function $(selector, context) {
    return (context || document).querySelector(selector);
  }

  function $$(selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  }

  /* ── Optional sections: reveal only when they hold content ──
     Sections such as Certifications, Achievements and Languages ship
     with only an HTML comment inside plus the `hidden` attribute. The
     moment real content is pasted in, the section appears here. This
     guarantees an empty heading never reaches the PDF. */
  function sectionHasContent(section) {
    return Array.prototype.slice.call(section.children).some(function (child) {
      if (child.tagName === 'H2') return false;
      if (child.querySelector && child.querySelector('img')) return true;
      return child.textContent.replace(/\s+/g, '') !== '';
    });
  }

  function syncSectionVisibility() {
    $$('.r-section').forEach(function (section) {
      section.hidden = !sectionHasContent(section);
    });
  }

  /* ── Apply one version ──────────────────────────────────── */
  function applyVariant(name, updateUrl) {
    var key = Object.prototype.hasOwnProperty.call(VARIANTS, name) ? name : DEFAULT_VARIANT;
    var config = VARIANTS[key];

    document.documentElement.setAttribute('data-variant', key);
    document.body.classList.toggle('is-internship', key === 'internship');
    document.body.classList.toggle('is-job', key === 'job');

    var roleEl = $('#roleText');
    if (roleEl) roleEl.textContent = config.role;

    document.title = config.pageTitle;

    /* Objective — exactly one paragraph stays visible. */
    Object.keys(VARIANTS).forEach(function (other) {
      var el = document.getElementById(VARIANTS[other].objectiveId);
      if (el) el.hidden = VARIANTS[other].objectiveId !== config.objectiveId;
    });

    /* Elements that belong to only one version. */
    $$('[data-variant-only]').forEach(function (el) {
      el.hidden = el.getAttribute('data-variant-only') !== key;
    });

    /* Physical DOM re-ordering — the most print-safe way to reorder,
       because it keeps normal block flow for the page breaks. */
    var body = $('#resumeBody');
    if (body) {
      config.order.forEach(function (id) {
        var section = document.getElementById('sec-' + id);
        if (section) body.appendChild(section);
      });
      /* Safety net: never lose a section that `order` does not mention. */
      $$('.r-section', body).forEach(function (section) {
        if (config.order.indexOf(section.id.replace(/^sec-/, '')) === -1) {
          body.appendChild(section);
        }
      });
    }

    /* Tab state. */
    $$('.variant-btn').forEach(function (btn) {
      var on = btn.getAttribute('data-variant') === key;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-selected', String(on));
      btn.setAttribute('tabindex', on ? '0' : '-1');
    });

    /* Remember the choice in the URL so each version is linkable,
       and in localStorage so it survives a reload. */
    if (updateUrl) {
      try {
        var url = new URL(window.location.href);
        url.searchParams.set('v', key);
        url.hash = '';
        window.history.replaceState(null, '', url.toString());
      } catch (err) { /* very old browsers — not worth failing over */ }
    }

    try { localStorage.setItem(STORAGE_KEY, key); } catch (err) { /* private mode */ }
  }

  /* ── Which version should open first? ───────────────────────
     1. ?v=internship / ?v=job in the URL
     2. the last version viewed   3. the default */
  function initialVariant() {
    try {
      var fromUrl = new URL(window.location.href).searchParams.get('v');
      if (fromUrl && Object.prototype.hasOwnProperty.call(VARIANTS, fromUrl)) return fromUrl;
    } catch (err) { /* ignore */ }

    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved && Object.prototype.hasOwnProperty.call(VARIANTS, saved)) return saved;
    } catch (err) { /* ignore */ }

    return DEFAULT_VARIANT;
  }

  /* ── Tabs ───────────────────────────────────────────────── */
  function initTabs() {
    var buttons = $$('.variant-btn');
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyVariant(btn.getAttribute('data-variant'), true);
      });
    });

    var list = $('.variant-switch');
    if (!list) return;

    /* Left / right arrow keys move between the two tabs. */
    list.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

      var current = -1;
      buttons.forEach(function (btn, index) {
        if (btn.getAttribute('aria-selected') === 'true') current = index;
      });
      if (current === -1) return;

      var next = event.key === 'ArrowRight'
        ? (current + 1) % buttons.length
        : (current - 1 + buttons.length) % buttons.length;

      event.preventDefault();
      buttons[next].focus();
      applyVariant(buttons[next].getAttribute('data-variant'), true);
    });
  }

  /* ── Print / Save as PDF ───────────────────────────────── */
  function initPrintButton() {
    var btn = $('#printBtn');
    if (!btn) return;
    btn.addEventListener('click', function () { window.print(); });
  }

  /* ── Download PDF = direct static file ──────────────────────
     Toolbar ka "Download PDF" seedha Khushi_Yadav_Resume.pdf deta hai.
     Bagal wala "Print / Save as PDF" button WYSIWYG print flow chalata
     hai taaki screen wala variant (Internship/Job) paper par aaye. */
  function initDownloadButton() {
    var link = $('#downloadPdfBtn');
    if (!link) return;
    link.setAttribute('href', 'Khushi_Yadav_Resume.pdf');
    link.setAttribute('download', 'Khushi_Yadav_Resume.pdf');
    link.setAttribute('aria-label', 'Download resume as a PDF');
  }

  /* ── Dismissible setup note ─────────────────────────────── */
  function initNotice() {
    var notice = $('#setupNotice');
    var close = $('#noticeClose');
    if (!notice || !close) return;
    close.addEventListener('click', function () { notice.remove(); });
  }

  /* ── Open the print dialog straight away on resume.html#print ──
     This is the fallback the portfolio site uses when
     Khushi_Yadav_Resume.pdf has not been generated yet. */
  function initHashPrint() {
    if (window.location.hash !== '#print') return;
    window.addEventListener('load', function () {
      window.setTimeout(function () { window.print(); }, 400);
    });
  }

  /* ── Boot ───────────────────────────────────────────────── */
  function init() {
    syncSectionVisibility();
    initTabs();
    initPrintButton();
    initDownloadButton();
    initNotice();
    initHashPrint();
    applyVariant(initialVariant(), false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
