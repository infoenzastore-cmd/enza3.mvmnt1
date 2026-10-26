const seed = [
  ['Happy Gut Goli', 'Food', 18, 'A spiced botanical bite for a mindful pantry.', 'Energized', 'happy-gut-goli'],
  ['Evening Unwind Herbal Tea', 'Food', 16, 'A loose leaf blend for a slower evening.', 'Rested', 'evening-unwind-tea'],
  ['Cleanergizer Water Restorer', 'Lifestyle', 39, 'A reusable object for your daily water ritual.', 'Grounded', 'cleanergizer'],
  ['Organic Super Seeds Butter', 'Food', 14, 'A richly textured spread for everyday nourishment.', 'Energized', 'super-seeds-butter'],
  ['Orange Berry Victoria Cake', 'Food', 22, 'A bright, celebratory cake for sharing.', 'Energized', 'orange-berry-cake'],
  ['Organic Raw Khandsari Sugar', 'Food', 12, 'A traditional pantry sweetener with a warm character.', 'Grounded', 'khandsari-sugar'],
  ['Protein Balls', 'Food', 15, 'Seven grain sweet bites for an easy pause.', 'Energized', 'protein-balls'],
  ['Primal Helix Tensor Clasps', 'Lifestyle', 26, 'Sculptural copper details for a personal ritual.', 'Grounded', 'tensor-clasps'],
  ['Clara Dress · Tulip Print', 'Fashion', 68, 'An expressive silhouette with a soft floral note.', 'Energized', 'clara-dress'],
  ['Blair Vest Top · Black', 'Fashion', 52, 'A versatile layer with considered lines.', 'Grounded', 'blair-vest'],
  ['Macrame Storage Baskets · Set of 3', 'Home', 42, 'Handcrafted texture to bring order to a room.', 'Grounded', 'macrame-baskets'],
  ['Organic Homemade Hair Oil', 'Lifestyle', 19, 'A botanical addition to a quiet care routine.', 'Rested', 'hair-oil'],
  ['Fenugreek Nettle Ginger Hair Pack', 'Lifestyle', 17, 'An herbal blend for your hair care ritual.', 'Rested', 'hair-pack'],
  ['Urli Soy Wax Candle', 'Home', 24, 'A warm glow for the spaces where you slow down.', 'Rested', 'urli-candle']
];
const products = seed.map(([name, category, price, description, mood, image], index) => ({
  id: index + 1, name, category, price, description, mood,
  image: `./assets/products/${image}.jpg`
}));
const byId = new Map(products.map(product => [product.id, product]));
const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
const $ = selector => document.querySelector(selector);
let activeFilter = 'all';
let activeSearch = '';
let activeMood = '';
let lastFocus = null;
let toastTimer;
let cart = {};

try {
  const saved = JSON.parse(localStorage.getItem('enza-prototype-cart-v2') || '{}');
  if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
    for (const [key, value] of Object.entries(saved)) {
      const id = Number(key);
      if (byId.has(id) && Number.isInteger(value) && value > 0 && value <= 99) cart[id] = value;
    }
  }
} catch { cart = {}; }

function persistCart() {
  try { localStorage.setItem('enza-prototype-cart-v2', JSON.stringify(cart)); } catch { /* private mode may block storage */ }
}

function showToast(message) {
  const node = $('#toast');
  node.textContent = message;
  node.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('visible'), 2600);
}

function renderProducts() {
  const list = products.filter(product =>
    (activeFilter === 'all' || product.category === activeFilter) &&
    (!activeMood || product.mood === activeMood) &&
    `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(activeSearch)
  );
  $('#product-grid').innerHTML = list.map(product => `
    <article class="product-card">
      <div class="product-image"><img src="${product.image}" alt="Concept render of ${product.name}" loading="lazy"><span class="product-tag">Concept edit</span><button class="add-button" type="button" data-add="${product.id}" aria-label="Add ${product.name} to concept bag">+</button></div>
      <div class="product-meta"><div><span class="product-category">${product.category}</span><h3 class="product-name">${product.name}</h3></div><span class="product-price">${money(product.price)}</span></div>
      <p class="product-description">${product.description}</p>
    </article>`).join('');
  $('#empty-state').hidden = list.length > 0;
}

function cartEntries() {
  return Object.entries(cart).map(([id, quantity]) => ({ product: byId.get(Number(id)), quantity })).filter(entry => entry.product);
}

function renderCart() {
  const entries = cartEntries();
  const count = entries.reduce((sum, entry) => sum + entry.quantity, 0);
  const total = entries.reduce((sum, entry) => sum + entry.product.price * entry.quantity, 0);
  $('#bag-count').textContent = count;
  $('#drawer-count').textContent = `(${count})`;
  $('#subtotal').textContent = money(total);
  $('#review-button').disabled = count === 0;
  $('#cart-items').innerHTML = entries.length ? entries.map(({ product, quantity }) => `
    <div class="cart-item"><img src="${product.image}" alt="" loading="lazy"><div><h3>${product.name}</h3><p>${product.category} · Concept product</p><div class="cart-item-bottom"><div class="quantity"><button type="button" data-quantity="${product.id}" data-change="-1" aria-label="Remove one ${product.name}">−</button><span>${quantity}</span><button type="button" data-quantity="${product.id}" data-change="1" aria-label="Add one ${product.name}">+</button></div><strong>${money(product.price * quantity)}</strong></div></div></div>`).join('') : '<div class="cart-empty"><span>✳</span><h3>Your edit starts here.</h3><p>Explore the concept collection and save what catches your eye.</p></div>';
  return { entries, count, total };
}

function setCart(id, next) {
  if (!byId.has(id)) return;
  if (next <= 0) delete cart[id]; else cart[id] = Math.min(next, 99);
  persistCart();
  renderCart();
}

function openCart() {
  lastFocus = document.activeElement;
  $('#overlay').hidden = false;
  $('#cart-drawer').hidden = false;
  document.body.classList.add('locked');
  $('.close-cart').focus();
}

function closeAll() {
  $('#overlay').hidden = true;
  $('#cart-drawer').hidden = true;
  $('#review-modal').hidden = true;
  document.body.classList.remove('locked');
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
}

function openReview() {
  const { entries, count, total } = renderCart();
  if (!count) return;
  $('#review-lines').innerHTML = entries.map(({ product, quantity }) => `<div class="review-line"><span>${quantity} × ${product.name}</span><strong>${money(product.price * quantity)}</strong></div>`).join('');
  $('#review-total').textContent = money(total);
  $('#cart-drawer').hidden = true;
  $('#review-modal').hidden = false;
  $('.review-header .close-review').focus();
}

document.addEventListener('click', event => {
  const add = event.target.closest('[data-add]');
  if (add) {
    const id = Number(add.dataset.add);
    setCart(id, (cart[id] || 0) + 1);
    showToast(`${byId.get(id).name} added to your concept bag`);
  }
  const quantity = event.target.closest('[data-quantity]');
  if (quantity) {
    const id = Number(quantity.dataset.quantity);
    setCart(id, (cart[id] || 0) + Number(quantity.dataset.change));
  }
  if (event.target.closest('.cart-trigger')) openCart();
  if (event.target.closest('.close-cart, .close-review') || event.target === $('#overlay')) closeAll();
  if (event.target.closest('#review-button')) openReview();
  const filter = event.target.closest('[data-filter]');
  if (filter) {
    activeFilter = filter.dataset.filter;
    activeMood = '';
    document.querySelectorAll('.mood').forEach(node => node.classList.remove('active'));
    $('#mood-result').textContent = 'Choose a feeling to see a suggested edit.';
    document.querySelectorAll('.filter').forEach(node => {
      const isActive = node === filter;
      node.classList.toggle('active', isActive);
      node.setAttribute('aria-pressed', String(isActive));
    });
    renderProducts();
  }
  const mood = event.target.closest('[data-mood]');
  if (mood) {
    const chosen = mood.dataset.mood;
    document.querySelectorAll('.mood').forEach(node => node.classList.toggle('active', node === mood));
    const picks = products.filter(product => product.mood === chosen).slice(0, 3).map(product => product.name);
    $('#mood-result').textContent = `Your ${chosen.toLowerCase()} edit: ${picks.join(', ')}. The collection above is now tailored to your choice.`;
    activeFilter = 'all';
    activeSearch = '';
    activeMood = chosen;
    $('#product-search').value = '';
    document.querySelectorAll('.filter').forEach(node => {
      const isActive = node.dataset.filter === 'all';
      node.classList.toggle('active', isActive);
      node.setAttribute('aria-pressed', String(isActive));
    });
    renderProducts();
    $('#shop').scrollIntoView({ behavior: 'smooth' });
  }
});

$('#product-search').addEventListener('input', event => { activeSearch = event.target.value.trim().toLowerCase(); renderProducts(); });
$('#clear-search').addEventListener('click', () => { $('#product-search').value = ''; activeSearch = ''; activeMood = ''; document.querySelector('[data-filter="all"]').click(); });
$('.search-trigger').addEventListener('click', () => { $('#shop').scrollIntoView({ behavior: 'smooth' }); $('#product-search').focus({ preventScroll: true }); });
$('.menu-trigger').addEventListener('click', event => { const expanded = event.currentTarget.getAttribute('aria-expanded') === 'true'; event.currentTarget.setAttribute('aria-expanded', String(!expanded)); $('#mobile-nav').hidden = expanded; });
document.querySelectorAll('.mobile-nav a').forEach(link => link.addEventListener('click', () => { $('#mobile-nav').hidden = true; $('.menu-trigger').setAttribute('aria-expanded', 'false'); }));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeAll();
  if (event.key !== 'Tab') return;
  const dialog = !$('#review-modal').hidden ? $('#review-modal') : !$('#cart-drawer').hidden ? $('#cart-drawer') : null;
  if (!dialog) return;
  const focusable = [...dialog.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled)')].filter(node => !node.hidden);
  if (!focusable.length) return;
  const first = focusable[0], last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

renderProducts();
renderCart();
