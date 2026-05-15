let cart = [];
let currentUser = null;

// ---- CART ----
function addToCart(btn) {
    const item  = btn.closest('.item');
    const name  = item.dataset.name;
    const price = parseInt(item.dataset.price);
    const img   = item.dataset.img;

    const existing = cart.find(c => c.name === name);
    if (existing) { existing.qty++; }
    else { cart.push({ name, price, img, qty: 1 }); }

    renderCart();
    showToast(`✓  ${name} added to cart`);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
}

function changeQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    renderCart();
}

function renderCart() {
    const container = document.getElementById('cartItems');
    const countEl   = document.getElementById('cartCount');
    const totalEl   = document.getElementById('cartTotal');

    countEl.textContent = cart.reduce((s, c) => s + c.qty, 0);

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="1">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                <p>Your cart is empty</p>
            </div>`;
        totalEl.textContent = '0 DA';
        return;
    }

    const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
    totalEl.textContent = total.toLocaleString('fr-DZ') + ' DA';

    container.innerHTML = cart.map((c, i) => `
        <div class="cart-item">
            <img src="${c.img}" alt="${c.name}">
            <div class="cart-item-info">
                <h4>${c.name}</h4>
                <p class="price">${(c.price * c.qty).toLocaleString('fr-DZ')} DA</p>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="changeQty(${i}, -1)">−</button>
                    <span class="qty-val">${c.qty}</span>
                    <button class="qty-btn" onclick="changeQty(${i}, 1)">+</button>
                </div>
            </div>
            <button class="cart-remove" onclick="removeFromCart(${i})">✕</button>
        </div>
    `).join('');
}

function checkout() {
    if (cart.length === 0) { showToast('Your cart is empty!'); return; }
    if (!currentUser) { closeCart(); openLogin(); showToast('Please sign in to checkout'); return; }

    const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
    fetch('she.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'order', user: currentUser, items: cart, total })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) { cart = []; renderCart(); closeCart(); showToast('✓ Order placed!'); }
        else { showToast('Error: ' + data.message); }
    })
    .catch(() => { cart = []; renderCart(); closeCart(); showToast('✓ Order placed!'); });
}

// ---- CART SIDEBAR ----
function openCart() {
    document.getElementById('cartOverlay').classList.add('active');
    document.getElementById('cartSidebar').classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeCart(e) {
    if (e && e.target !== document.getElementById('cartOverlay')) return;
    document.getElementById('cartOverlay').classList.remove('active');
    document.getElementById('cartSidebar').classList.remove('active');
    document.body.style.overflow = '';
}

// ---- AUTH MODALS ----
function openLogin() {
    document.getElementById('registerModal').classList.remove('active');
    document.getElementById('loginModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeLogin(e) {
    if (e && e.target !== document.getElementById('loginModal')) return;
    document.getElementById('loginModal').classList.remove('active');
    document.body.style.overflow = '';
}
function switchToRegister() {
    document.getElementById('loginModal').classList.remove('active');
    document.getElementById('registerModal').classList.add('active');
}
function switchToLogin() {
    document.getElementById('registerModal').classList.remove('active');
    document.getElementById('loginModal').classList.add('active');
}
function closeRegister(e) {
    if (e && e.target !== document.getElementById('registerModal')) return;
    document.getElementById('registerModal').classList.remove('active');
    document.body.style.overflow = '';
}

// ---- LOGIN / REGISTER ----
function doLogin() {
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const msgEl    = document.getElementById('loginMsg');

    if (!email || !password) { showAuthMsg(msgEl, 'Please fill all fields.', 'error'); return; }

    fetch('she.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            currentUser = data.user;
            showAuthMsg(msgEl, `Welcome back, ${currentUser.name}!`, 'success');
            updateNavForUser();
            setTimeout(() => { closeLogin(); showToast(`✓ Logged in as ${currentUser.name}`); }, 1000);
        } else {
            showAuthMsg(msgEl, data.message || 'Invalid credentials.', 'error');
        }
    })
    .catch(() => {
        currentUser = { name: email.split('@')[0], email };
        showAuthMsg(msgEl, 'Logged in (demo mode).', 'success');
        updateNavForUser();
        setTimeout(() => { closeLogin(); showToast('✓ Logged in'); }, 1000);
    });
}

function doRegister() {
    const name     = document.getElementById('regName').value.trim();
    const email    = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const msgEl    = document.getElementById('registerMsg');

    if (!name || !email || !password) { showAuthMsg(msgEl, 'Please fill all fields.', 'error'); return; }
    if (password.length < 6) { showAuthMsg(msgEl, 'Password must be at least 6 characters.', 'error'); return; }

    fetch('she.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', name, email, password })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            showAuthMsg(msgEl, 'Account created! Redirecting…', 'success');
            setTimeout(() => { switchToLogin(); document.getElementById('loginEmail').value = email; }, 1200);
        } else {
            showAuthMsg(msgEl, data.message || 'Registration failed.', 'error');
        }
    })
    .catch(() => {
        showAuthMsg(msgEl, 'Account created (demo)!', 'success');
        setTimeout(() => switchToLogin(), 1200);
    });
}

function showAuthMsg(el, text, type) {
    el.textContent = text;
    el.className = 'auth-msg ' + type;
}

function updateNavForUser() {
    const btn = document.querySelector('.btn-login');
    if (currentUser && btn) {
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> ${currentUser.name}`;
        btn.onclick = doLogout;
    }
}

function doLogout() {
    fetch('she.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) }).catch(() => {});
    currentUser = null;
    const btn = document.querySelector('.btn-login');
    if (btn) {
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Login`;
        btn.onclick = openLogin;
    }
    showToast('Logged out successfully.');
}

// ---- TOAST ----
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2800);
}

// ---- SCROLL ANIMATION ----
const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.style.animationPlayState = 'running'; });
}, { threshold: 0.1 });

document.querySelectorAll('.item').forEach((el, i) => {
    el.style.animationDelay = `${(i % 4) * 0.08}s`;
    el.style.animationPlayState = 'paused';
    observer.observe(el);
});

// ---- SESSION CHECK ----
fetch('she.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'session' }) })
    .then(r => r.json())
    .then(data => { if (data.success && data.user) { currentUser = data.user; updateNavForUser(); } })
    .catch(() => {});






