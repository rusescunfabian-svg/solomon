(function () {
  'use strict';

  const WA_NUM = '393395998469';
  const WA_MSG_DEFAULT = 'Ciao%20Solomon%2C%20ho%20bisogno%20di%20soccorso%20stradale%20a%20Brescia.%20Potete%20intervenire%3F';
  let leafletLoader = null;


  /* ══ Cookie Banner ══ */
  const cookieBanner = document.getElementById('cookieBanner');
  const cookieOk = document.getElementById('cookieOk');
  if (cookieBanner && cookieOk) {
    try {
      if (!localStorage.getItem('cookie_ok')) {
        // Small delay so page loads first
        setTimeout(() => { cookieBanner.hidden = false; }, 800);
      }
    } catch(e) { setTimeout(() => { cookieBanner.hidden = false; }, 800); }
    cookieOk.addEventListener('click', () => {
      cookieBanner.hidden = true;
      try { localStorage.setItem('cookie_ok', '1'); } catch(e) {}
    });
  }


  /* ══ Hero Geo Card ══ */
  const hgBtn      = document.getElementById('heroGeoBtn');
  const hgInit     = document.getElementById('heroGeoInit');
  const hgLoading  = document.getElementById('heroGeoLoading');
  const hgFound    = document.getElementById('heroGeoFound');
  const hgAddr     = document.getElementById('heroGeoAddr');
  const hgCoords   = document.getElementById('heroGeoCoords');
  const hgWaBtn    = document.getElementById('heroGeoWaBtn');
  const hgRetry    = document.getElementById('heroGeoRetry');

  const WA_HERO = '393395998469';

  function hgBuildWa(lat, lng, addr, city) {
    const mapsLink = 'https://www.google.com/maps?q=' + lat.toFixed(6) + ',' + lng.toFixed(6);
    const lines = [
      'Ho bisogno di soccorso stradale urgente!',
      '',
      addr ? 'Posizione: ' + addr : '',
      city ? 'Citta: ' + city : '',
      'Mappa GPS: ' + mapsLink,
      'Coordinate: ' + lat.toFixed(5) + ', ' + lng.toFixed(5),
      '',
      'Potete intervenire?'
    ].filter(Boolean).join('\n');
    return 'https://wa.me/' + WA_HERO + '?text=' + encodeURIComponent(lines);
  }

  function hgShow(state) {
    // state: 'init' | 'loading' | 'found'
    if (hgInit)    hgInit.hidden    = (state !== 'init');
    if (hgLoading) hgLoading.hidden = (state !== 'loading');
    if (hgFound)   hgFound.hidden   = (state !== 'found');
  }

  function hgLocate() {
    if (!navigator.geolocation) {
      hgShow('init'); return;
    }
    hgShow('loading');
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = pos.coords.accuracy;
        // Immediate WA link with raw coords
        if (hgWaBtn) hgWaBtn.href = hgBuildWa(lat, lng, '', '');
        // Show coords immediately
        if (hgCoords) hgCoords.textContent = lat.toFixed(5) + ', ' + lng.toFixed(5) + (acc ? ' ±' + Math.round(acc) + 'm' : '');
        if (hgAddr) hgAddr.textContent = 'Caricamento indirizzo…';
        hgShow('found');
        // Reverse geocode
        fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng + '&accept-language=it&zoom=18', {
          headers: { Accept: 'application/json' }
        })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (!data) return;
          const a = data.address || {};
          const road = [a.road, a.house_number].filter(Boolean).join(' ');
          const city = a.city || a.town || a.village || a.municipality || '';
          const addr = [road, city].filter(Boolean).join(', ');
          if (hgAddr) hgAddr.textContent = addr || data.display_name?.split(',').slice(0,3).join(',') || '';
          if (hgWaBtn) hgWaBtn.href = hgBuildWa(lat, lng, addr, city);
        })
        .catch(() => {
          if (hgAddr) hgAddr.textContent = 'Posizione rilevata';
        });
      },
      () => { hgShow('init'); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  if (hgBtn)      hgBtn.addEventListener('click', hgLocate);
  if (hgRetry)    hgRetry.addEventListener('click', hgLocate);

  /* ══ Privacy Modal ══ */
  const privacyModal = document.getElementById('privacyModal');
  const modalClose = document.getElementById('modalClose');
  const modalCloseBottom = document.getElementById('modalCloseBottom');
  if (privacyModal) {
    // Close on X button
    if (modalClose) modalClose.addEventListener('click', () => { privacyModal.hidden = true; document.body.style.overflow = ''; });
    if (modalCloseBottom) modalCloseBottom.addEventListener('click', () => { privacyModal.hidden = true; document.body.style.overflow = ''; });
    // Close on overlay click
    privacyModal.addEventListener('click', (e) => {
      if (e.target === privacyModal) { privacyModal.hidden = true; document.body.style.overflow = ''; }
    });
    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !privacyModal.hidden) { privacyModal.hidden = true; document.body.style.overflow = ''; }
    });
    // Lock scroll when open
    const observer = new MutationObserver(() => {
      document.body.style.overflow = privacyModal.hidden ? '' : 'hidden';
    });
    observer.observe(privacyModal, { attributes: true, attributeFilter: ['hidden'] });
  }

  /* ══ Header Apple-style: trasparente su hero, opaco su scroll ══ */
  const header = document.getElementById('header');
  if (header) {
    const heroEl = document.getElementById('home');
    let heroThreshold = window.innerHeight * 0.08;
    const refreshHeroThreshold = () => {
      heroThreshold = (heroEl ? heroEl.clientHeight : window.innerHeight) * 0.08;
    };
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > heroThreshold);
    };
    refreshHeroThreshold();
    window.addEventListener('resize', refreshHeroThreshold, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══ Hamburger ══ */
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      nav.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
    });
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        nav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ══ Nav active ══ */
  const navLinks = document.querySelectorAll('.nav a');
  const sections = document.querySelectorAll('section[id]');
  if (navLinks.length && sections.length) {
    const navObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
      });
    }, { threshold: 0.35, rootMargin: '-20% 0px -55% 0px' });
    sections.forEach(s => navObs.observe(s));
  }

  /* ══ Scroll reveal ══ */
  const animEls = document.querySelectorAll('[data-animate]');
  if (animEls.length) {
    const revObs = new IntersectionObserver(entries => {
      entries.forEach((e, i) => {
        if (!e.isIntersecting) return;
        setTimeout(() => e.target.classList.add('is-visible'), i * 55);
        revObs.unobserve(e.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });
    animEls.forEach(el => revObs.observe(el));
  }

  /* ══ Counters ══ */
  document.querySelectorAll('.hero-stat-num[data-count]').forEach(el => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const target = parseInt(el.dataset.count, 10);
        const t0 = performance.now();
        const dur = 1500;
        const tick = now => {
          const p = Math.min((now - t0) / dur, 1);
          el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        };
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    obs.observe(el);
  });

  /* ══ Hero parallax ══ */
  const hero = document.getElementById('home');
  const heroBg = document.getElementById('heroBg');
  if (hero && heroBg && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let ticking = false;
    const updateP = () => {
      const r = hero.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight)
        heroBg.style.setProperty('--hero-parallax', (-r.top * 0.18) + 'px');
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(updateP); } }, { passive: true });
    updateP();
  }

  /* ══ Gallery – mobile swipe dots ══ */
  const track = document.getElementById('galleryTrack');
  const dotsWrap = document.getElementById('galleryDots');
  if (track && dotsWrap) {
    const slides = track.querySelectorAll('.gallery-slide');
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Foto ' + (i + 1));
      dot.addEventListener('click', () => slides[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' }));
      dotsWrap.appendChild(dot);
    });
    const dots = dotsWrap.querySelectorAll('.gallery-dot');
    let st;
    track.addEventListener('scroll', () => {
      clearTimeout(st);
      st = setTimeout(() => {
        const tl = track.getBoundingClientRect().left;
        let ci = 0, md = Infinity;
        slides.forEach((s, i) => { const d = Math.abs(s.getBoundingClientRect().left - tl); if (d < md) { md = d; ci = i; } });
        dots.forEach((d, i) => d.classList.toggle('active', i === ci));
      }, 50);
    }, { passive: true });
    let isDown = false, sx, sl;
    track.addEventListener('mousedown', e => { isDown = true; sx = e.pageX - track.offsetLeft; sl = track.scrollLeft; });
    track.addEventListener('mouseleave', () => { isDown = false; });
    track.addEventListener('mouseup', () => { isDown = false; });
    track.addEventListener('mousemove', e => { if (!isDown) return; e.preventDefault(); track.scrollLeft = sl - (e.pageX - track.offsetLeft - sx) * 1.2; });
  }

  /* ══ Gallery – desktop lightbox ══ */
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbClose = document.getElementById('lightboxClose');
  if (lightbox && lbImg) {
    // Desktop gallery items
    document.querySelectorAll('.gd-item, .gallery-slide').forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (!img) return;
        lbImg.src = img.dataset.full || img.currentSrc || img.src;
        lbImg.alt = img.alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });
    const close = () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => lbImg.removeAttribute('src'), 300);
    };
    if (lbClose) lbClose.addEventListener('click', close);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  /* ══ GEOLOCALIZZATORE PREMIUM ══ */
  const geoMapEl    = document.getElementById('geoMap');
  const geoLocateBtn= document.getElementById('geoLocateBtn');
  const geoLocateTxt= document.getElementById('geoLocateBtnText');
  const geoStepFind = document.getElementById('geoStepFind');
  const geoStepRes  = document.getElementById('geoStepResult');
  const geoStepSend = document.getElementById('geoStepSend');
  const geoAddressBox=document.getElementById('geoAddressBox');
  const geoAddress  = document.getElementById('geoAddress');
  const geoCoords   = document.getElementById('geoCoords');
  const geoAccuracy = document.getElementById('geoAccuracy');
  const geoWaBtn    = document.getElementById('geoWhatsAppBtn');
  const geoMapsBtn  = document.getElementById('geoMapsBtn');
  const geoCopyBtn  = document.getElementById('geoCopyBtn');
  const geoRetryBtn = document.getElementById('geoRetryBtn');
  const geoMapOverlay=document.getElementById('geoMapOverlay');

  const BRESCIA = [45.5416, 10.2118];
  let geoMap = null, userMarker = null, accCircle = null, currentPos = null;

  function loadLeafletAssets() {
    if (window.L) return Promise.resolve(window.L);
    if (leafletLoader) return leafletLoader;

    leafletLoader = new Promise((resolve, reject) => {
      if (!document.querySelector('link[data-leaflet]')) {
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        css.crossOrigin = '';
        css.dataset.leaflet = 'true';
        document.head.appendChild(css);
      }

      const existing = document.querySelector('script[data-leaflet]');
      if (existing) {
        existing.addEventListener('load', () => resolve(window.L), { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.crossOrigin = '';
      script.defer = true;
      script.dataset.leaflet = 'true';
      script.onload = () => resolve(window.L);
      script.onerror = reject;
      document.body.appendChild(script);
    });

    return leafletLoader;
  }

  function fmtCoords(lat, lng) { return lat.toFixed(5) + ', ' + lng.toFixed(5); }
  function mapsUrl(lat, lng)   { return 'https://www.google.com/maps?q=' + lat + ',' + lng; }

  function buildWaUrl(lat, lng, addr) {
    const mapsLink = mapsUrl(lat, lng);
    const msg = [
      'Ciao Solomon, ho bisogno di soccorso stradale!',
      '',
      addr ? 'Posizione: ' + addr : '',
      'Mappa GPS: ' + mapsLink,
      'Coordinate: ' + fmtCoords(lat, lng),
      '',
      'Potete intervenire?'
    ].filter(Boolean).join('\n');
    return 'https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent(msg);
  }

  function showFound(lat, lng, accuracy) {
    currentPos = { lat, lng, accuracy };

    // Coords + accuracy
    if (geoCoords) geoCoords.textContent = fmtCoords(lat, lng);
    if (geoAccuracy && accuracy) geoAccuracy.textContent = '±' + Math.round(accuracy) + 'm';

    // Map
    if (geoMap) {
      if (userMarker) geoMap.removeLayer(userMarker);
      if (accCircle)  geoMap.removeLayer(accCircle);
      userMarker = L.marker([lat, lng], {
        interactive: false,
        keyboard: false,
        icon: L.divIcon({ className: 'geo-marker-user-wrap', html: '<span class="geo-marker-user"></span>', iconSize: [18, 18], iconAnchor: [9, 9] })
      }).addTo(geoMap);
      if (accuracy) {
        accCircle = L.circle([lat, lng], { radius: accuracy, color: '#ffb400', fillColor: '#ffb400', fillOpacity: .12, weight: 1 }).addTo(geoMap);
      }
      geoMap.setView([lat, lng], accuracy && accuracy < 100 ? 16 : 14, { animate: true });
      setTimeout(() => geoMap.invalidateSize(), 200);
    }
    // Hide overlay
    if (geoMapOverlay) geoMapOverlay.classList.add('hidden');

    // Show result + send steps
    if (geoStepRes) geoStepRes.hidden = false;
    if (geoStepSend) geoStepSend.hidden = false;

    // Set WA + Maps links immediately with coords
    if (geoWaBtn) geoWaBtn.href = buildWaUrl(lat, lng, '');
    if (geoMapsBtn) geoMapsBtn.href = mapsUrl(lat, lng);

    // Reverse geocode
    fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng + '&accept-language=it&zoom=18', { headers: { Accept: 'application/json' } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const addr = data?.display_name || '';
        if (geoAddress) geoAddress.textContent = addr || 'Indirizzo non disponibile';
        // Update WA URL with address
        if (geoWaBtn) geoWaBtn.href = buildWaUrl(lat, lng, addr);
      })
      .catch(() => {
        if (geoAddress) geoAddress.textContent = 'Indirizzo non disponibile';
      });
  }

  function showError() {
    if (geoStepRes) geoStepRes.hidden = true;
    if (geoStepSend) geoStepSend.hidden = true;
    if (geoMapOverlay) geoMapOverlay.classList.remove('hidden');
  }

  function setLocateBtnLoading(loading) {
    if (!geoLocateBtn) return;
    geoLocateBtn.disabled = loading;
    if (geoLocateTxt) {
      geoLocateTxt.textContent = loading ? 'Rilevamento in corso…' : (currentPos ? 'Aggiorna posizione' : 'Trovami adesso');
    }
    const icon = geoLocateBtn.querySelector('i');
    if (icon) {
      icon.className = loading ? 'fas fa-spinner fa-spin' : 'fas fa-location-crosshairs';
    }
  }

  function locateUser() {
    if (!navigator.geolocation) {
      showError();
      return;
    }
    setLocateBtnLoading(true);

    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocateBtnLoading(false);
        showFound(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
      },
      err => {
        setLocateBtnLoading(false);
        showError();
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  function initMap() {
    if (!geoMapEl || typeof L === 'undefined' || geoMap) return;
    geoMap = L.map(geoMapEl, { scrollWheelZoom: false, zoomControl: true }).setView(BRESCIA, 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(geoMap);
    L.marker(BRESCIA, {
      interactive: false,
      keyboard: false,
      icon: L.divIcon({ className: 'geo-marker-base-wrap', html: '<span class="geo-marker-base"></span>', iconSize: [12, 12], iconAnchor: [6, 6] })
    }).addTo(geoMap).bindPopup('<strong>Solomon Car Assistance</strong><br>Soccorso Stradale Brescia 24/7');
    setTimeout(() => geoMap.invalidateSize(), 100);
    if (currentPos) showFound(currentPos.lat, currentPos.lng, currentPos.accuracy);
  }

  if (geoMapEl) {
    const ensureGeoMap = () => loadLeafletAssets().then(() => { initMap(); }).catch(() => {});

    if (geoLocateBtn) geoLocateBtn.addEventListener('click', () => {
      ensureGeoMap();
      locateUser();
    });
    if (geoRetryBtn)  geoRetryBtn.addEventListener('click', () => {
      ensureGeoMap();
      locateUser();
    });

    if (geoCopyBtn) {
      geoCopyBtn.addEventListener('click', async () => {
        if (!currentPos) return;
        const addr = geoAddress?.textContent || '';
        const text = [addr, fmtCoords(currentPos.lat, currentPos.lng), mapsUrl(currentPos.lat, currentPos.lng)].filter(Boolean).join('\n');
        try {
          await navigator.clipboard.writeText(text);
          const orig = geoCopyBtn.innerHTML;
          geoCopyBtn.innerHTML = '<i class="fas fa-check"></i> Copiato!';
          setTimeout(() => { geoCopyBtn.innerHTML = orig; }, 2000);
        } catch {
          geoCopyBtn.textContent = 'Errore copia';
        }
      });
    }

    // Invalidate map when section enters viewport
    const geoSec = document.getElementById('posizione');
    if (geoSec) {
      const geoObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          ensureGeoMap().then(() => setTimeout(() => geoMap?.invalidateSize(), 150));
          geoObserver.disconnect();
        });
      }, { threshold: 0.2 });
      geoObserver.observe(geoSec);
    }
  }

})();
