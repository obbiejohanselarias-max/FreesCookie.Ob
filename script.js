/* ==========================================
   FREES COOKIE — JAVASCRIPT GLOBAL
   ========================================== */

// ── Navbar: scroll effect ──
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }
});

// ── Hamburger menu ──
document.addEventListener('DOMContentLoaded', () => {

  const hamburger = document.querySelector('.hamburger');
  const navLinks  = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
      }
    });
  }

  // ── Carrusel principal (hero) ──
  initHeroCarousel();

  // ── Fade-up al hacer scroll ──
  initFadeUp();

  // ── Carrito de compras ──
  initCart();

  // ── Sub-nav tabs ──
  initSubNav();

  // ── Búsqueda de productos ──
  initSearch();

  // ── Formulario de registro ──
  initRegisterForm();

  // ── Carrusel horizontal ──
  initHCarousel();

  // ── Contadores animados ──
  initCounters();
});

// ==========================================
// CARRUSEL HERO
// ==========================================
function initHeroCarousel() {
  const track = document.querySelector('.carousel-track');
  if (!track) return;

  const slides = track.querySelectorAll('.carousel-slide');
  const dots   = document.querySelectorAll('.carousel-dots span');
  const prev   = document.querySelector('.carousel-prev');
  const next   = document.querySelector('.carousel-next');
  let current  = 0;
  let timer;

  function goTo(n) {
    current = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function auto() {
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  if (prev) prev.addEventListener('click', () => { clearInterval(timer); goTo(current - 1); auto(); });
  if (next) next.addEventListener('click', () => { clearInterval(timer); goTo(current + 1); auto(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { clearInterval(timer); goTo(i); auto(); }));

  // Touch swipe
  let startX = 0;
  const hero = document.querySelector('.hero-carousel');
  if (hero) {
    hero.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    hero.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) { clearInterval(timer); goTo(current + (dx < 0 ? 1 : -1)); auto(); }
    });
  }

  goTo(0);
  auto();
}

// ==========================================
// FADE UP SCROLL
// ==========================================
function initFadeUp() {
  const els = document.querySelectorAll('.fade-up');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
}

// ==========================================
// CARRITO
// ==========================================
const cart = { items: [], total: 0 };

function initCart() {
  // Botones añadir al carrito
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-cart-btn') || e.target.closest('.add-cart-btn')) {
      const btn  = e.target.classList.contains('add-cart-btn') ? e.target : e.target.closest('.add-cart-btn');
      const card = btn.closest('.product-card');
      if (!card) return;
      const name  = card.querySelector('h4')?.textContent || 'Producto';
      const priceText = card.querySelector('.price')?.textContent || 'RD$0';
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));

      addToCart(name, price);
      btn.textContent = '✓ Añadido';
      btn.style.background = '#81C784';
      setTimeout(() => {
        btn.textContent = 'Añadir al carrito';
        btn.style.background = '';
      }, 1500);
    }
  });

  updateCartBadge();
}

function addToCart(name, price) {
  const existing = cart.items.find(i => i.name === name);
  if (existing) { existing.qty++; }
  else { cart.items.push({ name, price, qty: 1 }); }
  cart.total += price;

  // Guardar en localStorage
  try { localStorage.setItem('freescookie_cart', JSON.stringify(cart)); } catch(e) {}

  updateCartBadge();
  renderMiniCart();
  showCartToast(name);
}

function updateCartBadge() {
  const badge = document.querySelector('.cart-badge');
  if (badge) badge.textContent = cart.items.reduce((a, i) => a + i.qty, 0);
}

function showCartToast(name) {
  let toast = document.getElementById('cart-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cart-toast';
    toast.style.cssText = `
      position:fixed; bottom:28px; right:28px; z-index:9000;
      background:#1A3A5C; color:#fff; border-radius:12px;
      padding:14px 22px; font-family:'Nunito',sans-serif; font-size:0.9rem;
      box-shadow:0 8px 32px rgba(0,0,0,0.2); display:flex; align-items:center;
      gap:10px; transform:translateY(80px); opacity:0; transition:all 0.35s;
    `;
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span style="font-size:1.2rem">🛒</span> <strong>${name}</strong> añadido al carrito`;
  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity   = '1';
  });
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.transform = 'translateY(80px)';
    toast.style.opacity   = '0';
  }, 2800);
}

function renderMiniCart() {
  const container = document.getElementById('mini-cart-items');
  const totalEl   = document.getElementById('mini-cart-total');
  if (!container) return;

  container.innerHTML = '';
  if (cart.items.length === 0) {
    container.innerHTML = '<p style="color:rgba(255,255,255,0.5);font-size:0.85rem">Carrito vacío</p>';
  } else {
    cart.items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `<span>${item.name} × ${item.qty}</span><span>RD$${(item.price * item.qty).toFixed(0)}</span>`;
      container.appendChild(div);
    });
  }
  if (totalEl) totalEl.textContent = `RD$${cart.total.toFixed(0)}`;
}

// Cargar carrito guardado
try {
  const saved = localStorage.getItem('freescookie_cart');
  if (saved) {
    const parsed = JSON.parse(saved);
    if (parsed.items) { Object.assign(cart, parsed); }
  }
} catch(e) {}

// ==========================================
// SUB-NAV TABS
// ==========================================
function initSubNav() {
  const subLinks = document.querySelectorAll('.sub-nav a, .cat-btn');
  subLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const parent = link.closest('.sub-nav, .products-sub-nav');
      if (parent) {
        parent.querySelectorAll('a, button').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
      // Scroll suave a sección
      const target = link.dataset.target;
      if (target) {
        e.preventDefault();
        const section = document.getElementById(target);
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      // Filtrar productos
      if (link.dataset.filter) {
        filterProducts(link.dataset.filter);
      }
    });
  });
}

// ==========================================
// BÚSQUEDA
// ==========================================
function initSearch() {
  const input = document.getElementById('product-search');
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    document.querySelectorAll('.product-card').forEach(card => {
      const name = card.querySelector('h4')?.textContent.toLowerCase() || '';
      card.style.display = name.includes(q) ? '' : 'none';
    });
  });
}

function filterProducts(cat) {
  document.querySelectorAll('.product-card').forEach(card => {
    const c = card.dataset.cat || '';
    card.style.display = (cat === 'todos' || c === cat) ? '' : 'none';
  });
}

// ==========================================
// CARRUSEL HORIZONTAL AUTO
// ==========================================
function initHCarousel() {
  // Ya manejado por CSS animation, pero pausamos en hover
  document.querySelectorAll('.h-carousel').forEach(c => {
    // Duplicar items para loop continuo
    const items = Array.from(c.children);
    items.forEach(item => c.appendChild(item.cloneNode(true)));
  });
}

// ==========================================
// CONTADORES ANIMADOS
// ==========================================
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el    = entry.target;
        const end   = parseInt(el.dataset.count, 10);
        const dur   = 2000;
        const step  = end / (dur / 16);
        let current = 0;
        const interval = setInterval(() => {
          current += step;
          if (current >= end) { current = end; clearInterval(interval); }
          el.textContent = Math.floor(current).toLocaleString() + (el.dataset.suffix || '');
        }, 16);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
}

// ==========================================
// FORMULARIO DE REGISTRO
// ==========================================
function initRegisterForm() {
  const form  = document.getElementById('register-form');
  const modal = document.getElementById('video-modal');
  const close = document.getElementById('modal-close');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Validación básica
    const campos = form.querySelectorAll('input[required], select[required]');
    let valid = true;
    campos.forEach(campo => {
      if (!campo.value.trim()) {
        campo.style.borderColor = '#E8899A';
        valid = false;
      } else {
        campo.style.borderColor = '';
      }
    });
    if (!valid) return;

    // Guardar en localStorage
    const data = {
      nombre: form.nombre?.value,
      apellido: form.apellido?.value,
      email: form.email?.value,
      fecha: new Date().toISOString()
    };
    try { localStorage.setItem('freescookie_user', JSON.stringify(data)); } catch(e) {}

    // Mostrar modal de video
    if (modal) {
      modal.classList.add('show');
      renderMiniCart(); // actualizar carrito en registro
    }
  });

  if (close) close.addEventListener('click', () => modal?.classList.remove('show'));
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });
}

// ==========================================
// ACTIVE NAV LINK según página
// ==========================================
(function markActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('#navbar .nav-links a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href && page.includes(href.replace('.html',''))) {
      a.classList.add('active');
    }
  });
})();

// ==========================================
// SMOOTH HASH SCROLL
// ==========================================
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (a) {
    e.preventDefault();
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});