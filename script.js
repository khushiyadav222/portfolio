/* ═══════════════════════════════════════════════════════════════
   KHUSHI YADAV — PORTFOLIO INTERACTIONS
   Smooth Scroll · Custom Cursor · Particles · Reveals · EmailJS
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Theme Toggle (Light/Dark Mode) ──────────────────────── */
  function initThemeToggle() {
    const toggle = $('#themeToggle');
    if (!toggle) return;

    // Load saved theme preference
    const savedTheme = localStorage.getItem('khushi-theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
      toggle.setAttribute('aria-pressed', 'true');
    }

    toggle.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light-mode');
      localStorage.setItem('khushi-theme', isLight ? 'light' : 'dark');
      toggle.setAttribute('aria-pressed', String(isLight));
    });
  }

  /* ── Typing Animation for Hero Role ──────────────────────── */
  function initTypingAnimation() {
    const typedEl = $('#typedText');
    if (!typedEl) return;

    const words = ['AI Engineer', 'ML Enthusiast', 'Python Explorer', 'Tech Learner', 'Future Innovator'];
    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function type() {
      const currentWord = words[wordIndex];

      if (deleting) {
        charIndex--;
      } else {
        charIndex++;
      }

      typedEl.textContent = currentWord.substring(0, charIndex);

      let speed = deleting ? 50 : 100;

      if (!deleting && charIndex === currentWord.length) {
        speed = 1800;
        deleting = true;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        speed = 400;
      }

      setTimeout(type, speed);
    }

    type();
  }

  /* ── Utility ─────────────────────────────────────────────── */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 1024;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ── Page ready — no loader, hero reveals naturally ───────── */
  function markLoaded() {
    // Small natural delay so the hero lines animate subtly after first paint.
    // The page itself is NEVER blocked — content is visible immediately.
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.body.classList.add('loaded');
      }, 120);
    });
  }

  if (prefersReducedMotion) {
    document.body.classList.add('loaded');
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', markLoaded);
    } else {
      markLoaded();
    }
  }

  /* ── Lenis Smooth Scroll ─────────────────────────────────── */
  let lenis = null;

  function initLenis() {
    if (prefersReducedMotion || typeof window.Lenis === 'undefined') return;

    lenis = new window.Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    // Connect Lenis to requestAnimationFrame
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync GSAP ScrollTrigger with Lenis
    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', window.ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }

  // Smooth anchor scrolling through Lenis
  function initAnchorScroll() {
    const links = $$('a[href^="#"]');

    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const target = $(targetId);
        if (!target) return;

        e.preventDefault();
        closeMobileMenu();

        if (lenis) {
          lenis.scrollTo(target, { offset: -70, duration: 1.4 });
        } else {
          const top = target.getBoundingClientRect().top + window.pageYOffset - 70;
          window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }
      });
    });
  }

  /* ── Navbar: hide on scroll down / show on scroll up ──────── */
  function initNavbar() {
    const nav = $('#navbar');
    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateNav() {
      const currentY = window.scrollY;

      if (currentY > 60) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }

      if (currentY > lastScrollY && currentY > 160 && !document.body.classList.contains('menu-open')) {
        nav.classList.add('hidden');
      } else {
        nav.classList.remove('hidden');
      }

      lastScrollY = currentY;
      ticking = false;
    }

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(updateNav);
          ticking = true;
        }
      },
      { passive: true }
    );

    updateNav();
  }

  /* ── Active section indicator ────────────────────────────── */
  function initActiveSection() {
    const sections = $$('section[id]');
    const links = $$('.nav-link');

    if (!sections.length || !links.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute('id');
          links.forEach((link) => {
            const isActive = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('active', isActive);
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );

    sections.forEach((section) => observer.observe(section));

    // On initial load, ensure Home is active
    if (window.scrollY < 200) {
      links.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === '#home');
      });
    }
  }

  /* ── Mobile menu ──────────────────────────────────────────── */
  const navToggle = $('#navToggle');
  const navLinks = $('#navLinks');
  const navOverlay = $('#navOverlay');

  function openMobileMenu() {
    if (!navToggle) return;
    navToggle.classList.add('open');
    navLinks.classList.add('open');
    navOverlay.classList.add('visible');
    document.body.classList.add('menu-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
  }

  function closeMobileMenu() {
    if (!navToggle) return;
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
    navOverlay.classList.remove('visible');
    document.body.classList.remove('menu-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Toggle menu');
  }

  function initMobileMenu() {
    if (!navToggle) return;

    navToggle.addEventListener('click', () => {
      if (navToggle.classList.contains('open')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    navOverlay.addEventListener('click', closeMobileMenu);

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileMenu();
    });

    // Close on resize back to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024) closeMobileMenu();
    });
  }

  /* ── Scroll progress bar ──────────────────────────────────── */
  function initScrollProgress() {
    const bar = $('.scroll-progress span');
    if (!bar) return;

    function update() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = `${progress}%`;
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ── Premium Cinematic 3D Background (Three.js) ───────────── */
  function init3DBackground() {
    const canvas = $('#particles');
    if (!canvas) return;
    if (prefersReducedMotion) return;
    if (typeof window.THREE === 'undefined') return;

    // ── Performance tier ──
    const isLowTier = window.innerWidth < 640 || isTouchDevice;
    const isMidTier = window.innerWidth < 1024;
    const particleCount = isLowTier ? 100 : isMidTier ? 250 : 500;
    const shapeCount = isLowTier ? 0 : isMidTier ? 1 : 3;
    const glowCount = isLowTier ? 4 : isMidTier ? 8 : 16;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, isLowTier ? 1 : 1.5);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 150);
    camera.position.set(0, 0, 32);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: !isLowTier,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(pixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // ══════════ LIGHTING ══════════
    const ambientLight = new THREE.AmbientLight(0x1a1408, 0.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xf4d58d, 1.0);
    keyLight.position.set(6, 8, 10);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xd4af37, 0.4);
    rimLight.position.set(-5, -2, -4);
    scene.add(rimLight);

    // ══════════ SHAPES GROUP ══════════
    const shapeGroup = new THREE.Group();
    scene.add(shapeGroup);

    const goldColor = 0xd4af37;
    const lightGoldColor = 0xf4d58d;

    const shapes = [];

    if (shapeCount >= 1) {
      // Torus knot — thin, elegant, slowly rotating
      const knotMat = new THREE.MeshStandardMaterial({
        color: goldColor,
        metalness: 0.85,
        roughness: 0.25,
        emissive: 0x3a2a08,
        emissiveIntensity: 0.1,
        transparent: true,
        opacity: 0.2,
        wireframe: false,
      });
      const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(3.8, 0.5, 48, 8, 2, 3), knotMat);
      knot.position.set(14, 0, -18);
      knot.rotation.set(0.5, 0.2, 0);
      knot.userData = { rotSpeed: 0.0008, rotSpeedY: 0.0004, floatAmp: 0.4, floatSpeed: 0.15 };
      shapeGroup.add(knot);
      shapes.push(knot);
    }

    if (shapeCount >= 2) {
      // Small octahedron — floating gem-like
      const octMat = new THREE.MeshStandardMaterial({
        color: lightGoldColor,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x5a3a08,
        emissiveIntensity: 0.08,
        transparent: true,
        opacity: 0.18,
        wireframe: true,
      });
      const oct = new THREE.Mesh(new THREE.OctahedronGeometry(2.5, 0), octMat);
      oct.position.set(-12, 3, -20);
      oct.rotation.set(0.8, 0.4, 0.2);
      oct.userData = { rotSpeed: 0.0005, rotSpeedY: 0.0007, floatAmp: 0.5, floatSpeed: 0.12 };
      shapeGroup.add(oct);
      shapes.push(oct);
    }

    if (shapeCount >= 3) {
      // Dodecahedron wireframe — intricate, subtle
      const dodMat = new THREE.MeshBasicMaterial({
        color: goldColor,
        wireframe: true,
        transparent: true,
        opacity: 0.1,
      });
      const dod = new THREE.Mesh(new THREE.DodecahedronGeometry(3.0, 0), dodMat);
      dod.position.set(8, -5, -22);
      dod.rotation.set(0.3, 1.0, 0.6);
      dod.userData = { rotSpeed: 0.0003, rotSpeedY: 0.0009, floatAmp: 0.3, floatSpeed: 0.1 };
      shapeGroup.add(dod);
      shapes.push(dod);
    }

    // ══════════ GOLD PARTICLES ══════════
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    const particleData = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 100;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 50 - 5;
      particleSizes[i] = 0.03 + Math.random() * 0.06;
      particleData.push({
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        phaseZ: Math.random() * Math.PI * 2,
        ampX: 0.2 + Math.random() * 0.4,
        ampY: 0.2 + Math.random() * 0.4,
        ampZ: 0.1 + Math.random() * 0.3,
        speed: 0.08 + Math.random() * 0.12,
        baseX: particlePositions[i * 3],
        baseY: particlePositions[i * 3 + 1],
        baseZ: particlePositions[i * 3 + 2],
      });
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

    const particleMat = new THREE.PointsMaterial({
      color: goldColor,
      size: 0.06,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ══════════ GOLD GLOW SPRITES ══════════
    const glowPositions = new Float32Array(glowCount * 3);
    const glowSizes = new Float32Array(glowCount);
    const glowData = [];

    for (let i = 0; i < glowCount; i++) {
      glowPositions[i * 3] = (Math.random() - 0.5) * 80;
      glowPositions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      glowPositions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 5;
      glowSizes[i] = 0.4 + Math.random() * 0.8;
      glowData.push({
        phase: Math.random() * Math.PI * 2,
        speed: 0.2 + Math.random() * 0.3,
        baseX: glowPositions[i * 3],
        baseY: glowPositions[i * 3 + 1],
        baseZ: glowPositions[i * 3 + 2],
        driftAmp: 0.5 + Math.random() * 1.0,
      });
    }

    const glowGeo = new THREE.BufferGeometry();
    glowGeo.setAttribute('position', new THREE.BufferAttribute(glowPositions, 3));
    glowGeo.setAttribute('size', new THREE.BufferAttribute(glowSizes, 1));

    const glowMat = new THREE.PointsMaterial({
      color: 0xffd700,
      size: 0.6,
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const glows = new THREE.Points(glowGeo, glowMat);
    scene.add(glows);

    // ══════════ CAMERA AUTO-ORBIT + SCROLL ══════════
    let orbitAngle = 0;
    let scrollOffset = 0;
    let targetScrollOffset = 0;

    window.addEventListener(
      'scroll',
      () => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        targetScrollOffset = maxScroll > 0 ? (window.scrollY / maxScroll) * 5 : 0;
      },
      { passive: true }
    );

    // ══════════ LIGHT MODE ADAPTATION ══════════
    function updateTheme() {
      const isLight = document.body.classList.contains('light-mode');
      const themeColor = isLight ? 0xb8860b : goldColor;
      const themeOpacity = isLight ? 0.3 : 0.45;
      const themeGlowOpacity = isLight ? 0.06 : 0.1;

      particleMat.color.setHex(themeColor);
      particleMat.opacity = themeOpacity;
      glowMat.color.setHex(isLight ? 0xb8860b : 0xffd700);
      glowMat.opacity = themeGlowOpacity;

      shapes.forEach((shape) => {
        if (shape.material) {
          shape.material.color.setHex(isLight ? 0xb8860b : goldColor);
          shape.material.opacity = isLight ? 0.12 : shape.material.userData?.origOpacity || 0.2;
        }
      });
    }

    // Store original opacities
    shapes.forEach((s) => {
      if (s.material) {
        s.material.userData = s.material.userData || {};
        s.material.userData.origOpacity = s.material.opacity;
      }
    });

    // Watch for theme changes
    const themeObserver = new MutationObserver(() => updateTheme());
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    // ══════════ ANIMATION LOOP ══════════
    let time = 0;

    function animate() {
      requestAnimationFrame(animate);
      time += 0.003;

      // Auto-orbit — extremely slow (1 full rotation ~ 120s)
      orbitAngle += 0.0009;

      // Smooth scroll offset
      scrollOffset += (targetScrollOffset - scrollOffset) * 0.03;

      // Camera orbits in a gentle arc
      const radius = 32 + scrollOffset;
      const camX = Math.sin(orbitAngle) * radius * 0.35;
      const camZ = 32 + Math.cos(orbitAngle) * radius * 0.15 - scrollOffset * 0.5;
      camera.position.x = camX;
      camera.position.y = Math.sin(orbitAngle * 0.6) * 1.2;
      camera.position.z = camZ;
      camera.lookAt(0, 0, -5);

      // Shapes — slow float + rotation
      shapes.forEach((shape, idx) => {
        const ud = shape.userData;
        shape.rotation.x += ud.rotSpeed;
        shape.rotation.y += ud.rotSpeedY || ud.rotSpeed;
        shape.position.y = (shape.userData.baseY || 0) + Math.sin(time * ud.floatSpeed + idx * 1.5) * ud.floatAmp;
      });

      // Particles — slow sine-wave drift
      const posAttr = particleGeo.attributes.position;
      for (let i = 0; i < particleCount; i++) {
        const d = particleData[i];
        const t = time * d.speed;
        posAttr.setX(i, d.baseX + Math.sin(t + d.phaseX) * d.ampX);
        posAttr.setY(i, d.baseY + Math.sin(t * 0.8 + d.phaseY) * d.ampY);
        posAttr.setZ(i, d.baseZ + Math.sin(t * 0.6 + d.phaseZ) * d.ampZ);
      }
      posAttr.needsUpdate = true;

      // Glow sprites — slow drift + pulse
      const glowPosAttr = glowGeo.attributes.position;
      for (let i = 0; i < glowCount; i++) {
        const d = glowData[i];
        const t = time * 0.15;
        glowPosAttr.setX(i, d.baseX + Math.sin(t + d.phase) * d.driftAmp);
        glowPosAttr.setY(i, d.baseY + Math.cos(t * 0.7 + d.phase) * d.driftAmp * 0.6);
        glowPosAttr.setZ(i, d.baseZ + Math.sin(t * 0.5 + d.phase * 1.5) * d.driftAmp * 0.3);
      }
      glowPosAttr.needsUpdate = true;

      glows.material.opacity = (document.body.classList.contains('light-mode') ? 0.06 : 0.1) + Math.sin(time * 0.4) * 0.03;

      renderer.render(scene, camera);
    }

    // ── Resize ──
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
  }

  /* ── Professional Neural Network Background (Why AI) ──────── */
  function initWhyAIBackground() {
    const canvas = $('#whyaiCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let nodes = [];
    let rafId = null;
    let running = false;
    let lastTime = 0;

    const isLowTier = window.innerWidth < 640;
    const nodeCount = isLowTier ? 42 : window.innerWidth < 1024 ? 70 : 110;

    const GOLD = { r: 212, g: 175, b: 55 };
    const GOLD_SOFT = { r: 244, g: 213, b: 141 };
    const LINK_RADIUS = isLowTier ? 140 : 170;
    const MOUSE_RADIUS = 140;

    let mouse = { x: -9999, y: -9999 };

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      createNodes();
    }

    function createNodes() {
      nodes = [];
      const count = nodeCount;
      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        nodes.push({
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          baseR: 1 + Math.random() * 2.2,
          phase: Math.random() * Math.PI * 2,
          speed: 0.3 + Math.random() * 0.6,
          gold: Math.random() > 0.8,
        });
      }
    }

    function getTheme() {
      return document.body.classList.contains('light-mode');
    }

    function draw(timestamp) {
      if (!running) return;

      const dt = lastTime ? Math.min((timestamp - lastTime) / 16.667, 2.5) : 1;
      lastTime = timestamp;

      ctx.clearRect(0, 0, width, height);

      const isLight = getTheme();
      const linkAlpha = isLight ? 0.12 : 0.16;
      const linkGradient = isLight ? '184,134,11' : '212,175,55';
      const coreAlpha = isLight ? 0.5 : 0.7;
      const nodeColor = isLight ? '184,134,11' : '212,175,55';
      const nodeColorSoft = isLight ? '138,109,31' : '244,213,141';

      // ── Move nodes ──
      const time = timestamp / 1000;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        n.x += n.vx * dt;
        n.y += n.vy * dt;

        // Gentle sine-wave drift
        n.x += Math.sin(time * n.speed + n.phase) * 0.06 * dt;
        n.y += Math.cos(time * n.speed * 0.8 + n.phase * 1.3) * 0.05 * dt;

        // Soft mouse repulsion
        const mdx = n.x - mouse.x;
        const mdy = n.y - mouse.y;
        const md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < MOUSE_RADIUS && md > 0.001) {
          const force = (MOUSE_RADIUS - md) / MOUSE_RADIUS;
          n.x += (mdx / md) * force * 1.4 * dt;
          n.y += (mdy / md) * force * 1.4 * dt;
        }

        // Wrap around edges
        if (n.x < -20) n.x = width + 20;
        if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20;
        if (n.y > height + 20) n.y = -20;
      }

      // ── Draw links ──
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          const maxDist = LINK_RADIUS;

          if (distSq < maxDist * maxDist) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / maxDist) * linkAlpha;
            ctx.strokeStyle = `rgba(${linkGradient},${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // ── Draw nodes ──
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const pulse = 0.6 + 0.4 * Math.sin(time * 1.2 + n.phase);

        if (n.gold) {
          // Bright core node with glow
          const glowR = n.baseR * 4.2 * pulse;
          const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
          grad.addColorStop(0, `rgba(${nodeColor},${(0.22 * pulse).toFixed(3)})`);
          grad.addColorStop(1, `rgba(${nodeColor},0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(${nodeColorSoft},${(coreAlpha * pulse).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.baseR * 1.6, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = `rgba(${nodeColor},${(0.4 * pulse).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.baseR * pulse, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafId = requestAnimationFrame(draw);
    }

    function start() {
      if (running) return;
      if (prefersReducedMotion) return;
      running = true;
      lastTime = 0;
      rafId = requestAnimationFrame(draw);
    }

    function stop() {
      running = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      ctx.clearRect(0, 0, width, height);
    }

    // Mouse interaction — repel nodes gently anywhere on screen
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', (e) => {
      if (!e.relatedTarget) {
        mouse.x = -9999;
        mouse.y = -9999;
      }
    });

    // Theme changes
    const themeObserver = new MutationObserver(() => {
      if (running) lastTime = 0;
    });
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    window.addEventListener('resize', resize);
    resize();

    // Always run — fills the entire viewport, all the time
    start();
  }

  /* ── Reveal on scroll (IntersectionObserver) ──────────────── */
  function initReveals() {
    const revealEls = $$('.reveal');
    const staggerEls = $$('.reveal-stagger');

    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      revealEls.forEach((el) => el.classList.add('in-view'));
      staggerEls.forEach((el) => el.classList.add('in-view'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');

            // Skill cards also need .in-view for progress bars
            if (entry.target.classList.contains('skill-card')) {
              const level = parseInt(entry.target.dataset.level || '0', 10);
              entry.target.style.setProperty('--level', level);
              const progressBar = entry.target.querySelector('.skill-progress span');
              if (progressBar) {
                progressBar.style.width = `${level}%`;
              }
            }

            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    revealEls.forEach((el) => observer.observe(el));
    staggerEls.forEach((el) => observer.observe(el));
  }

  /* ── Animated counters ────────────────────────────────────── */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target || '0', 10);
    const pad = parseInt(el.dataset.pad || '0', 10);
    const duration = prefersReducedMotion ? 0 : 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart
      const value = Math.round(eased * target);
      el.textContent = String(value).padStart(pad, '0');

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    if (prefersReducedMotion) {
      el.textContent = String(target).padStart(pad, '0');
      return;
    }

    requestAnimationFrame(tick);
  }

  function initCounters() {
    const counters = $$('.stat-num[data-target]');

    if (!('IntersectionObserver' in window)) {
      counters.forEach((el) => animateCounter(el));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((el) => observer.observe(el));
  }

  /* ── Button ripple effect ─────────────────────────────────── */
  function initRipples() {
    const buttons = $$('.btn');

    buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        btn.appendChild(ripple);

        ripple.addEventListener('animationend', () => ripple.remove());
      });
    });
  }

  /* ── Social links popup ───────────────────────────────────── */
  function initSocialPopup() {
    const hub = $('#socialHub');
    const popup = $('#socialPopup');
    const closeBtn = $('#socialPopupClose');
    const overlay = $('#socialPopupOverlay');

    if (!hub || !popup) return;

    function openPopup() {
      popup.classList.add('open');
      popup.setAttribute('aria-hidden', 'false');
      hub.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closePopup() {
      popup.classList.remove('open');
      popup.setAttribute('aria-hidden', 'true');
      hub.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    hub.addEventListener('click', openPopup);

    if (closeBtn) closeBtn.addEventListener('click', closePopup);
    if (overlay) overlay.addEventListener('click', closePopup);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePopup();
    });
  }

  /* ── Resume download (hero button) + resume page link (navbar) ── */
  function initResumeButton() {
    const downloadBtn = $('#downloadResume');
    const viewBtn = $('#navResume');

    // Navbar "Resume" always opens the resume page in a new tab.
    if (viewBtn) {
      viewBtn.setAttribute('href', 'resume.html');
      viewBtn.setAttribute('target', '_blank');
      viewBtn.setAttribute('rel', 'noopener');
      viewBtn.setAttribute('aria-label', "Open Khushi Yadav's resume page");
    }

    if (!downloadBtn) return;

    const RESUME_PDF = 'Khushi_Yadav_Resume.pdf';

    /* Direct file download + alag "View Resume" link. Dono option
       saath me rehte hain taaki user turant PDF le sake ya page khol sake. */
    downloadBtn.setAttribute('href', RESUME_PDF);
    downloadBtn.setAttribute('download', 'Khushi_Yadav_Resume.pdf');
    downloadBtn.setAttribute('aria-label', "Download Khushi Yadav's resume as a PDF");
  }

  /* ── Magnetic buttons ─────────────────────────────────────── */
  function initMagneticButtons() {
    if (prefersReducedMotion || isTouchDevice) return;

    const buttons = $$('.btn');
    if (!buttons.length) return;

    buttons.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.2}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ── Profile card 3D tilt ─────────────────────────────────── */
  function initProfileTilt() {
    if (prefersReducedMotion || isTouchDevice) return;

    const card = $('.profile-card');
    if (!card) return;

    const maxTilt = 10;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;

      card.style.transform = `rotateY(${px * maxTilt}deg) rotateX(${-py * maxTilt}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  }

  /* ── GSAP animatons (subtle parallax / progression) ───────── */
  function initGSAP() {
    if (prefersReducedMotion || typeof window.gsap === 'undefined') return;

    // Register ScrollTrigger if available
    if (window.ScrollTrigger) {
      gsap.registerPlugin(window.ScrollTrigger);

      // Subtle parallax on hero visual
      const heroRight = $('.hero-right');
      const heroTitle = $('.hero-title');

      if (heroRight) {
        gsap.to(heroRight, {
          y: -40,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        });
      }

      if (heroTitle) {
        gsap.to(heroTitle, {
          y: 60,
          opacity: 0.35,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: '60% top',
            scrub: 1,
          },
        });
      }

      // Aurora background subtle parallax
      const aurora = $('.bg-aurora');
      if (aurora) {
        gsap.to(aurora, {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.5,
          },
        });
      }

      // Section head subtle parallax
      $$('.section-head').forEach((head) => {
        gsap.fromTo(
          head,
          { y: 30, opacity: 0.6 },
          {
            y: 0,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: head,
              start: 'top 85%',
              end: 'top 55%',
              scrub: 0.8,
            },
          }
        );
      });
    }
  }

  /* ── EmailJS Contact Form ─────────────────────────────────── */
  function initContactForm() {
    const form = $('#contactForm');
    if (!form) return;

    const status = $('#formStatus');
    const sendBtn = $('#sendBtn');
    const btnLabel = $('.btn-label', sendBtn);

    // ══════════════════════════════════════════════════════════
    // ⚠️ EMAILJS CONFIGURATION — REPLACE WITH YOUR CREDENTIALS
    // 1. Create account at https://www.emailjs.com
    // 2. Connect your email service
    // 3. Create a template
    // 4. Copy your Public Key / Service ID / Template ID below
    // ══════════════════════════════════════════════════════════
    const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
    const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
    const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

    const handleValidationError = (input) => {
      const group = input.closest('.form-group');
      const errorEl = group ? group.querySelector('.form-error') : null;
      input.classList.add('has-error');
      if (errorEl) errorEl.textContent = 'This field is required.';
    };

    const clearError = (input) => {
      const group = input.closest('.form-group');
      const errorEl = group ? group.querySelector('.form-error') : null;
      input.classList.remove('has-error');
      if (errorEl) errorEl.textContent = '';
    };

    const inputs = $$('input, textarea', form);
    inputs.forEach((input) => {
      input.addEventListener('input', () => {
        if (input.classList.contains('has-error')) clearError(input);
      });
      input.addEventListener('blur', () => {
        if (input.hasAttribute('required') && !input.value.trim()) {
          handleValidationError(input);
        } else if (input.type === 'email' && input.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
          input.classList.add('has-error');
          const group = input.closest('.form-group');
          const errorEl = group ? group.querySelector('.form-error') : null;
          if (errorEl) errorEl.textContent = 'Please enter a valid email address.';
        }
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validate
      let valid = true;
      inputs.forEach((input) => {
        if (input.hasAttribute('required') && !input.value.trim()) {
          handleValidationError(input);
          valid = false;
        }
        if (input.type === 'email' && input.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
          input.classList.add('has-error');
          valid = false;
        }
      });

      if (!valid) {
        status.textContent = 'Please fill in all required fields correctly.';
        status.classList.add('error');
        status.classList.remove('success');
        return;
      }

      // Check if EmailJS is configured
      if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
        status.textContent = 'EmailJS is not configured yet. Please add your keys in script.js.';
        status.classList.add('error');
        status.classList.remove('success');
        return;
      }

      // Sending state
      sendBtn.classList.add('btn-loading');
      btnLabel.textContent = 'Sending...';
      status.textContent = '';
      status.classList.remove('success', 'error');

      try {
        // Initialize EmailJS
        if (window.emailjs) {
          emailjs.init(EMAILJS_PUBLIC_KEY);
        }

        const formData = {
          from_name: form.name.value.trim(),
          from_email: form.email.value.trim(),
          subject: form.subject.value.trim(),
          message: form.message.value.trim(),
        };

        const response = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, formData);

        if (response && (response.status === 200 || response.status === 0)) {
          status.textContent = 'Message sent successfully! I\'ll get back to you soon.';
          status.classList.add('success');
          status.classList.remove('error');
          form.reset();
        } else {
          throw new Error('Unexpected response');
        }
      } catch (err) {
        status.textContent = 'Something went wrong. Please try again or email me directly.';
        status.classList.add('error');
        status.classList.remove('success');
      } finally {
        sendBtn.classList.remove('btn-loading');
        btnLabel.textContent = 'Send Message';
      }
    });
  }

  /* ── Keyboard accessibility: close menu on nav link focus out ── */
  function initMenuFocus() {
    if (!navLinks) return;

    navLinks.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileMenu();
    });
  }

  /* ── GSAP hero line reveal fallback (if CSS animations disabled) ── */
  function ensureHeroVisible() {
    // If for some reason the body.loaded class never applies (JS error above),
    // force hero lines visible after a safety timeout so content is never hidden.
    setTimeout(() => {
      if (!document.body.classList.contains('loaded')) {
        document.body.classList.add('loaded');
      }
    }, 1800);
  }

  /* ── Init all ─────────────────────────────────────────────── */
    function init() {
    initThemeToggle();
    initTypingAnimation();
    initLenis();
    initNavbar();
    initActiveSection();
    initMobileMenu();
    initScrollProgress();
    init3DBackground();
    initWhyAIBackground();
    initReveals();
    initCounters();
    initRipples();
    initResumeButton();
    initSocialPopup();
    initMagneticButtons();
    initProfileTilt();
    initGSAP();
    initContactForm();
    initAnchorScroll();
    initMenuFocus();
    ensureHeroVisible();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();