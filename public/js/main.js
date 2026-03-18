// ── Shared JS utilities ──

// Auth helpers
async function getUser() {
  const res = await fetch('/auth/me');
  return res.json();
}

async function logout() {
  const res = await fetch('/auth/logout', { method: 'POST' });
  const data = await res.json();
  if (data.success) window.location.href = data.redirect;
}

// Navbar init
async function initNav(activePage) {
  const user = await getUser();
  const actionsEl = document.getElementById('nav-actions');
  const linksEl = document.getElementById('nav-links');

  if (user.loggedIn) {
    if (actionsEl) {
      actionsEl.innerHTML = `
        <span style="font-size:0.8125rem;color:var(--text2);margin-right:0.25rem">Hi, ${user.name.split(' ')[0]}</span>
        <button class="btn-nav btn-nav-ghost" onclick="logout()">Logout</button>
      `;
    }
    if (linksEl) {
      linksEl.innerHTML = `
        <li><a href="/dashboard" ${activePage==='dashboard'?'class="active"':''}>Dashboard</a></li>
        <li><a href="/predict" ${activePage==='predict'?'class="active"':''}>Predict</a></li>
        <li><a href="/history" ${activePage==='history'?'class="active"':''}>History</a></li>
        <li><a href="/about" ${activePage==='about'?'class="active"':''}>About</a></li>
      `;
    }
  } else {
    if (actionsEl) {
      actionsEl.innerHTML = `
        <a href="/login" class="btn-nav btn-nav-ghost">Login</a>
        <a href="/register" class="btn-nav btn-nav-primary">Get Started</a>
      `;
    }
    if (linksEl) {
      linksEl.innerHTML = `
        <li><a href="/" ${activePage==='home'?'class="active"':''}>Home</a></li>
        <li><a href="/about" ${activePage==='about'?'class="active"':''}>About</a></li>
      `;
    }
  }
}

// Hamburger menu
function initHamburger() {
  const ham = document.getElementById('hamburger');
  const links = document.getElementById('nav-links');
  if (ham && links) {
    ham.addEventListener('click', () => links.classList.toggle('open'));
  }
}

// Show alert
function showAlert(el, msg, type = 'error') {
  el.textContent = msg;
  el.className = `alert alert-${type} show`;
  setTimeout(() => el.classList.remove('show'), 5000);
}

// Format date
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Badge HTML
function riskBadge(level) {
  const map = { Low: 'badge-low', Moderate: 'badge-moderate', High: 'badge-high' };
  return `<span class="badge ${map[level]||''}">${level}</span>`;
}
