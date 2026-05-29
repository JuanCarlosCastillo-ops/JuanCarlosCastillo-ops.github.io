const BRAND = {
  name: 'TEOD CONTROL',
  phoneDisplay: '096 739 3585',
  phoneIntl: '593967393585'
};

const qs = (sel, parent = document) => parent.querySelector(sel);
const qsa = (sel, parent = document) => [...parent.querySelectorAll(sel)];
const encode = (text) => encodeURIComponent(text);
const wa = (message) => `https://wa.me/${BRAND.phoneIntl}?text=${encode(message)}`;

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initReveal();
  initServices();
  initWizard();
  initQuoteForm();
  initCalculator();
  initTilt();
  initTheme();
  qs('[data-year]').textContent = new Date().getFullYear();
});

function initHeader() {
  const header = qs('[data-header]');
  const toggle = qs('[data-nav-toggle]');
  const links = qsa('[data-nav-links] a');
  const update = () => header.classList.toggle('scrolled', window.scrollY > 8);
  update();
  window.addEventListener('scroll', update, { passive: true });
  toggle?.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  links.forEach(link => link.addEventListener('click', () => {
    document.body.classList.remove('nav-open');
    toggle?.setAttribute('aria-expanded', 'false');
  }));
}

function initReveal() {
  const items = qsa('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(item => item.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(item => observer.observe(item));
}

function initServices() {
  const chips = qsa('[data-filter]');
  const cards = qsa('.service-card[data-category]');
  chips.forEach(chip => chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const filter = chip.dataset.filter;
    cards.forEach(card => {
      const match = filter === 'all' || card.dataset.category.includes(filter);
      card.classList.toggle('is-hidden', !match);
    });
  }));

  qsa('[data-service-link]').forEach(link => {
    link.addEventListener('click', () => {
      const select = qs('[data-quote-form] select[name="service"]');
      if (select) select.value = link.dataset.serviceLink;
    });
  });
}

function initWizard() {
  const form = qs('[data-wizard]');
  if (!form) return;
  const steps = qsa('[data-step]', form);
  const progress = qs('[data-progress-bar]', form);
  const prev = qs('[data-prev]', form);
  const next = qs('[data-next]', form);
  const waLink = qs('[data-wizard-wa]', form);
  let index = 0;

  const render = () => {
    steps.forEach((step, i) => step.classList.toggle('active', i === index));
    progress.style.width = `${((index + 1) / steps.length) * 100}%`;
    prev.style.visibility = index === 0 ? 'hidden' : 'visible';
    next.classList.toggle('hidden', index === steps.length - 1);
    waLink.classList.toggle('hidden', index !== steps.length - 1);
    if (index === steps.length - 1) waLink.href = wa(buildWizardMessage(form));
  };

  next.addEventListener('click', () => { index = Math.min(index + 1, steps.length - 1); render(); });
  prev.addEventListener('click', () => { index = Math.max(index - 1, 0); render(); });
  form.addEventListener('input', () => { if (index === steps.length - 1) waLink.href = wa(buildWizardMessage(form)); });
  render();
}

function buildWizardMessage(form) {
  const data = new FormData(form);
  return `Hola ${BRAND.name}. Quiero una revisión técnica.\n\n` +
    `Necesidad: ${data.get('need')}\n` +
    `Urgencia: ${data.get('urgency')}\n` +
    `Equipo: ${data.get('equipment')}\n` +
    `Síntoma: ${data.get('symptom') || 'Lo explico por mensaje y puedo enviar fotos/videos.'}\n\n` +
    `¿Me ayudas a revisar el caso?`;
}

function initQuoteForm() {
  const form = qs('[data-quote-form]');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const msg = `Hola ${BRAND.name}. Quiero cotizar un trabajo técnico.\n\n` +
      `Nombre: ${data.get('name') || 'No indicado'}\n` +
      `Servicio: ${data.get('service')}\n` +
      `Ubicación: ${data.get('location') || 'No indicada'}\n` +
      `Detalle: ${data.get('details') || 'Necesito explicar el caso y enviar fotos/videos.'}\n\n` +
      `Quedo atento para coordinar la revisión.`;
    window.open(wa(msg), '_blank', 'noopener');
  });
}

function initCalculator() {
  const form = qs('[data-calculator]');
  if (!form) return;
  const output = qs('[data-calculator-output]', form);
  const render = () => {
    const hours = Number(form.elements.hours.value || 0);
    const cost = Number(form.elements.cost.value || 0);
    const total = Math.max(0, hours * cost);
    output.value = `Parada estimada: $${total.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    output.textContent = output.value;
  };
  form.addEventListener('input', render);
  render();
}

function initTilt() {
  const el = qs('[data-tilt]');
  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  el.addEventListener('pointermove', (event) => {
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `rotateY(${x * 9}deg) rotateX(${-y * 9}deg)`;
  });
  el.addEventListener('pointerleave', () => { el.style.transform = ''; });
}

function initTheme() {
  const toggle = qs('[data-theme-toggle]');
  const stored = localStorage.getItem('teod-theme');
  if (stored) document.documentElement.dataset.theme = stored;
  toggle?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('teod-theme', next);
  });
}
