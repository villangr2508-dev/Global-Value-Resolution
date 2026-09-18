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
  document.getElementById('year').textContent = new Date().getFullYear();
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  document.getElementById('contactForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = `Consulta GVR Consulting - ${data.get('empresa')}`;
    const body = `Nombre: ${data.get('nombre')}\nEmpresa: ${data.get('empresa')}\nCorreo: ${data.get('correo')}\nTeléfono: ${data.get('telefono') || 'No proporcionado'}\n\nNecesidad:\n${data.get('necesidad')}`;
    window.location.href = `mailto:info@gvrconsulting.com.mx?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
});


document.addEventListener('DOMContentLoaded', () => {
  const endpoint = 'https://gvr-asistente.villangr2508.workers.dev/chat';
  const toggle = document.getElementById('chatToggle');
  const panel = document.getElementById('chatPanel');
  const close = document.getElementById('chatClose');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  const messagesBox = document.getElementById('chatMessages');
  const history = [];

  const setOpen = open => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) setTimeout(() => input.focus(), 50);
  };
  const addMessage = (text, role, extraClass = '') => {
    const item = document.createElement('div');
    item.className = ['chat-message', role, extraClass].filter(Boolean).join(' ');
    item.textContent = text;
    messagesBox.appendChild(item);
    messagesBox.scrollTop = messagesBox.scrollHeight;
    return item;
  };

  toggle?.addEventListener('click', () => setOpen(panel.hidden));
  close?.addEventListener('click', () => setOpen(false));
  input?.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  form?.addEventListener('submit', async event => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    history.push({ role: 'user', content: text });
    input.value = '';
    const submit = form.querySelector('button');
    submit.disabled = true;
    const typing = addMessage('Escribiendo…', 'assistant', 'typing');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-10) })
      });
      const data = await response.json();
      if (!response.ok || !data.reply) throw new Error(data.error || 'Respuesta no disponible');
      typing.remove();
      addMessage(data.reply, 'assistant');
      history.push({ role: 'assistant', content: data.reply });
    } catch (error) {
      typing.textContent = 'No pude responder en este momento. También puedes escribirnos por WhatsApp o a info@gvrconsulting.com.mx.';
      typing.classList.remove('typing');
    } finally {
      submit.disabled = false;
      input.focus();
    }
  });
});
