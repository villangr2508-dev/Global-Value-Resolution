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
    window.location.href = `mailto:guillermo.villanueva@gvrconsulting.com.mx?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
});
