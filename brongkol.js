document.addEventListener('DOMContentLoaded', () => {

  /* ---------- tahun footer otomatis ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- header solid saat scroll ---------- */
  const header = document.getElementById('siteHeader');
  const homeSection = document.getElementById('home');

  function updateHeaderState() {
    const homeHeight = homeSection ? homeSection.offsetHeight : 0;
    if (window.scrollY > homeHeight - 90) {
      header.classList.add('solid');
    } else {
      header.classList.remove('solid');
    }
  }
  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });

  /* ---------- menu hamburger (HP & tablet) ---------- */
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileNav = document.getElementById('mobileNav');

  function closeMobileNav() {
    if (!hamburgerBtn || !mobileNav) return;
    hamburgerBtn.classList.remove('open');
    mobileNav.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburgerBtn && mobileNav) {
    hamburgerBtn.addEventListener('click', () => {
      const willOpen = !mobileNav.classList.contains('open');
      hamburgerBtn.classList.toggle('open', willOpen);
      mobileNav.classList.toggle('open', willOpen);
      hamburgerBtn.setAttribute('aria-expanded', String(willOpen));
      document.body.style.overflow = willOpen ? 'hidden' : '';
    });

    mobileNav.querySelectorAll('[data-nav-mobile]').forEach(link => {
      link.addEventListener('click', closeMobileNav);
    });

    // tutup otomatis jika layar diputar/diperbesar ke ukuran desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 960) closeMobileNav();
    });
  }

  /* ---------- scrollspy ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('[data-nav], [data-nav-mobile]');

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(section => spyObserver.observe(section));

  /* ---------- reveal on scroll + STAGGER ---------- */
  const revealTargets = document.querySelectorAll(
    '.section-eyebrow, .section-title, .section-subtitle, .sejarah-grid, .vm-grid, .orgchart, .stat-grid, .chart-card, .potensi-card, .fasilitas-card, .seni-card, .kontak-grid, .batas-card, .lembaga-grid, .pamong-grid, .balai-card'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        target.classList.add('in-view');
        revealObserver.unobserve(target);

        const gridParents = ['potensi-grid', 'fasilitas-grid', 'seni-list', 'batas-grid', 'pamong-grid'];
        if (gridParents.some(cls => target.classList.contains(cls))) {
          const children = target.children;
          Array.from(children).forEach((child, i) => {
            child.style.transitionDelay = `${i * 0.1}s`;
          });
        }
      }
    });
  }, { threshold: 0.12 });

  revealTargets.forEach(el => revealObserver.observe(el));

  /* ---------- counter angka demografi ---------- */
  const counters = document.querySelectorAll('.stat-number');

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    const duration = 1400;
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString('id-ID');
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach(el => counterObserver.observe(el));

  /* ---------- PARALLAX HERO IMAGE ---------- */
  const heroImgs = document.querySelectorAll('.hero-slide img');
  if (heroImgs.length) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      heroImgs.forEach(img => {
        img.style.transform = `scale(${1.05 + scrolled * 0.0005})`;
      });
    }, { passive: true });
  }

  /* ---------- AUTO SLIDE HERO ---------- */
  const heroSlides = document.querySelectorAll('.hero-slide');
  if (heroSlides.length > 1) {
    let currentSlide = 0;
    const slideInterval = 5000; // 5 detik

    function nextSlide() {
      heroSlides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % heroSlides.length;
      heroSlides[currentSlide].classList.add('active');
    }

    setInterval(nextSlide, slideInterval);
  }

  /* ---------- BACK TO TOP ---------- */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 600) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* =========================================
     CHART.JS – DEMOGRAFI (DIPERBARUI)
     ========================================= */
  if (typeof Chart !== 'undefined') {

    Chart.defaults.font.family = "'Poppins', sans-serif";

    function renderLegend(containerId, items) {
      const el = document.getElementById(containerId);
      if (!el) return;
      el.innerHTML = items.map(item => `
        <span class="chart-legend-item">
          <span class="chart-legend-swatch" style="background:${item.color}"></span>${item.label}
        </span>
      `).join('');
    }

    function makeDoughnut(canvasId, dataItems) {
      const ctx = document.getElementById(canvasId);
      if (!ctx) return;
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: dataItems.map(d => d.label),
          datasets: [{
            data: dataItems.map(d => d.value),
            backgroundColor: dataItems.map(d => d.color),
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed}%` },
              titleFont: { weight: '600' },
              bodyFont: { family: 'Poppins' }
            }
          },
          cutout: '60%'
        }
      });
    }

    const religionData = [
      { label: 'Islam', value: 100, color: '#5dbbcf' }
    ];
    makeDoughnut('religionChart', religionData);
    renderLegend('religionLegend', religionData);

    const educationData = [
      { label: 'D4/S1', value: 1, color: '#7fd1d1' },
      { label: 'D1', value: 0.3, color: '#a0d0d0' },
      { label: 'SLTA', value: 7, color: '#389296' },
      { label: 'SLTP', value: 22, color: '#599E9F' },
      { label: 'Tamat SD', value: 46, color: '#83aeb6' },
      { label: 'Belum Sekolah', value: 24, color: '#b4d6d6' }
    ];
    makeDoughnut('educationChart', educationData);
    renderLegend('educationLegend', educationData);

    const occupationData = [
      { label: 'Petani', value: 45, color: '#08434a' },
      { label: 'Belum Bekerja', value: 26, color: '#6cb5c1' },
      { label: 'Karyawan Swasta', value: 8, color: '#199187' },
      { label: 'Buruh', value: 7, color: '#a1dbd9' },
      { label: 'Wiraswasta', value: 7, color: '#dff2ed' },
      { label: 'Buruh Tani', value: 5, color: '#c0dcd3' },
      { label: 'PNS', value: 1, color: '#e3ba8c' },
      { label: 'Pensiunan', value: 0.3, color: '#f6dab9' },
      { label: 'Nelayan', value: 0.3, color: '#f1cfc1' },
      { label: 'Perangkat Desa', value: 0.3, color: '#f4dfd1' },
      { label: 'Karyawan Honorer', value: 0.3, color: '#fdf5ed' },
      { label: 'Juru Masak', value: 0.3, color: '#fff8f2' },
      { label: 'Pembantu RT', value: 0.3, color: '#f7f0e9' }
    ];
    makeDoughnut('occupationChart', occupationData);
    renderLegend('occupationLegend', occupationData);

  } // end Chart check

});