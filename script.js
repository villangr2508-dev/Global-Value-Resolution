document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.main-nav');
  menuButton?.addEventListener('click', () => {
    const open = navigation.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    navigation.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  }));

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const backToTop = document.getElementById('backToTop');
  const updateBackToTop = () => backToTop?.classList.toggle('is-visible', window.scrollY > 500);
  window.addEventListener('scroll', updateBackToTop, { passive: true });
  backToTop?.addEventListener('click', event => {
    event.preventDefault();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
  updateBackToTop();

  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }), { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

  document.getElementById('contactForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const clean = value => String(value ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, 1000);
    const nombre = clean(data.get('nombre')).slice(0, 120);
    const empresa = clean(data.get('empresa')).slice(0, 120);
    const correo = clean(data.get('correo')).slice(0, 254);
    const telefono = clean(data.get('telefono')).slice(0, 40);
    const necesidad = clean(data.get('necesidad'));
    const subject = `Consulta GVR Consulting - ${empresa}`;
    const body = `Nombre: ${nombre}\nEmpresa: ${empresa}\nCorreo: ${correo}\nTeléfono: ${telefono || 'No proporcionado'}\n\nNecesidad:\n${necesidad}`;
    window.location.href = `mailto:info@gvrconsulting.com.mx?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const endpoint = 'https://gvr-asistente.villangr2508.workers.dev/chat';
  const MAX_MESSAGE_LENGTH = 800;
  const MAX_HISTORY = 10;
  const REQUEST_TIMEOUT_MS = 20000;
  const MIN_REQUEST_INTERVAL_MS = 1200;

  const toggle = document.getElementById('chatToggle');
  const panel = document.getElementById('chatPanel');
  const close = document.getElementById('chatClose');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  const messagesBox = document.getElementById('chatMessages');
  const history = [];
  let lastRequestAt = 0;

  if (!toggle || !panel || !form || !input || !messagesBox) return;

  const setOpen = open => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) setTimeout(() => input.focus(), 50);
  };

  const addMessage = (text, role, extraClass = '') => {
    const item = document.createElement('div');
    item.className = ['chat-message', role, extraClass].filter(Boolean).join(' ');
    // Never render assistant/user content as HTML.
    item.textContent = String(text ?? '');
    messagesBox.appendChild(item);
    messagesBox.scrollTop = messagesBox.scrollHeight;
    return item;
  };

  toggle.addEventListener('click', () => setOpen(panel.hidden));
  close?.addEventListener('click', () => setOpen(false));
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const text = input.value.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!text) return;

    const now = Date.now();
    if (now - lastRequestAt < MIN_REQUEST_INTERVAL_MS) return;
    lastRequestAt = now;

    addMessage(text, 'user');
    history.push({ role: 'user', content: text });
    if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);
    input.value = '';

    const submit = form.querySelector('button[type="submit"]');
    if (submit) submit.disabled = true;
    const typing = addMessage('Escribiendo…', 'assistant', 'typing');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-store',
        referrerPolicy: 'strict-origin-when-cross-origin',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ messages: history.slice(-MAX_HISTORY) }),
        signal: controller.signal
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) throw new Error('Respuesta inválida');
      const data = await response.json();
      if (!response.ok || typeof data.reply !== 'string' || !data.reply.trim()) {
        throw new Error('Respuesta no disponible');
      }

      typing.remove();
      const reply = data.reply.trim().slice(0, 5000);
      addMessage(reply, 'assistant');
      history.push({ role: 'assistant', content: reply });
      if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);
    } catch (error) {
      typing.textContent = error?.name === 'AbortError'
        ? 'La respuesta tardó demasiado. Intenta nuevamente en unos segundos.'
        : 'No pude responder en este momento. También puedes escribirnos por WhatsApp o a info@gvrconsulting.com.mx.';
      typing.classList.remove('typing');
    } finally {
      clearTimeout(timeout);
      if (submit) submit.disabled = false;
      input.focus();
    }
  });
});

// Busuanzi stores the cumulative page-view count remotely for the canonical domain.
// Count only production loads; local previews must not change the public total.
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.hostname !== 'gvrconsulting.com.mx') return;
  const counter = document.getElementById('visitCounter');
  const value = document.getElementById('visitCount');
  if (!counter || !value) return;

  const cacheKey = 'gvr-site-pageviews';
  const showCount = count => {
    value.textContent = new Intl.NumberFormat('es-MX').format(count);
    counter.removeAttribute('title');
  };
  let cachedCount;
  try {
    cachedCount = Number(localStorage.getItem(cacheKey));
    if (Number.isSafeInteger(cachedCount) && cachedCount > 0) {
      showCount(cachedCount);
      counter.title = 'Último total disponible; actualizando.';
    }
  } catch {}

  const callback = `gvrVisitCount_${Math.random().toString(36).slice(2)}`;
  const script = document.createElement('script');
  let timeout;
  const cleanup = () => {
    clearTimeout(timeout);
    script.remove();
    // A delayed JSONP response may still arrive after the timeout.
    window[callback] = () => {};
  };
  const unavailable = () => {
    if (!Number.isSafeInteger(cachedCount) || cachedCount <= 0) {
      value.textContent = 'no disponible';
      counter.title = 'El servicio de visitas no respondió. Intenta más tarde.';
    }
    cleanup();
  };
  window[callback] = data => {
    if (Number.isSafeInteger(data?.site_pv) && data.site_pv > 0) {
      showCount(data.site_pv);
      try { localStorage.setItem(cacheKey, String(data.site_pv)); } catch {}
      cleanup();
    } else {
      unavailable();
    }
  };
  script.src = `https://busuanzi.ibruce.info/busuanzi?jsonpCallback=${callback}`;
  script.async = true;
  // Preserve the existing counter's canonical domain and cumulative total.
  script.referrerPolicy = 'origin';
  script.onerror = unavailable;
  timeout = setTimeout(unavailable, 25000);
  document.head.appendChild(script);
});

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('supportPortalToggle');
  const wrap = document.getElementById('supportPortalWrap');
  const frame = document.getElementById('supportPortalFrame');
  if (!toggle || !wrap || !frame) return;
  toggle.addEventListener('click', () => {
    const open = wrap.hidden;
    if (open && !frame.getAttribute('src')) frame.src = frame.dataset.src;
    wrap.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Ocultar portal' : 'Abrir portal aquí';
  });
});
