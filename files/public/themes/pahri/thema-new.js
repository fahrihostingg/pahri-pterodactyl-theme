(() => {
    'use strict';

    const brand = 'Pahri Thema New';
    const versionLabel = 'Version 6.6.0 • by Pahri';
    const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' })[char]);

    const walkText = () => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach((node) => {
            const value = node.nodeValue || '';
            if (value.includes('Pterodactyl')) node.nodeValue = value.replace(/Pterodactyl/g, brand);
            if (value.includes('Pahri Aurelia')) node.nodeValue = value.replace(/Pahri Aurelia/g, brand);
            if (value.includes('Pahri Panel')) node.nodeValue = value.replace(/Pahri Panel/g, brand);
            if (value.includes('Login to Continue')) node.nodeValue = value.replace(/Login to Continue/g, 'Masuk ke Pahri Control Center');
        });
    };

    const fetchConfig = async () => {
        try {
            const response = await fetch('/themes/pahri/settings.json?runtime=' + Date.now(), { cache: 'no-store' });
            if (response.ok) return await response.json();
        } catch (error) {}
        return {};
    };

    const syncBrand = () => {
        document.title = document.title.includes('Store') ? document.title : brand;
        const label = document.querySelector('.pahri-admin-logo-text');
        if (label) label.textContent = brand;
        walkText();
    };

    const injectRuntimeChrome = async () => {
        if (document.getElementById('pahri-runtime-chrome')) return;
        if (location.pathname.startsWith('/admin')) return;
        const config = await fetchConfig();
        const dock = Object.assign({
            active: true,
            support_label: 'Support',
            support_url: '/account',
            spotlight_title: 'Pahri Runtime Active',
            spotlight_message: 'Tema Pahri sedang berjalan dalam clean runtime mode tanpa bergantung pada React source build.'
        }, config.dock || {});
        const root = document.createElement('div');
        root.id = 'pahri-runtime-chrome';
        root.innerHTML = `
            <div class="pahri-nexus-badge">${escapeHtml(brand)} • clean runtime mode</div>
            <nav class="pahri-nexus-dock" aria-label="Pahri quick navigation">
                <a href="/"><b>⌂</b><span>Store</span></a>
                <a href="/dashboard"><b>▦</b><span>Dashboard</span></a>
                <a href="/account"><b>◉</b><span>Account</span></a>
                <a href="/auth/login"><b>↪</b><span>Login</span></a>
            </nav>
            <a class="pahri-support-bubble" href="${escapeHtml(dock.support_url)}">${escapeHtml(dock.support_label || 'Support')}</a>
            <div class="pahri-spotlight"><strong>${escapeHtml(dock.spotlight_title)}</strong><span>${escapeHtml(dock.spotlight_message)}</span></div>`;
        if (dock.active !== false) document.body.appendChild(root);
    };

    const enhanceLogin = () => {
        if (!location.pathname.startsWith('/auth/login')) return;
        document.body.classList.add('pahri-login-runtime');
        if (document.getElementById('pahri-login-hero')) return;
        const app = document.getElementById('app');
        if (!app) return;
        const hero = document.createElement('section');
        hero.id = 'pahri-login-hero';
        hero.className = 'pahri-login-hero';
        hero.innerHTML = `
            <div class="pahri-login-hero-card">
                <span class="pahri-login-pill">Secure Client Login</span>
                <h1>Pahri Control Center</h1>
                <p>Login akaun panel kekal di sini. Halaman utama domain kini ialah website store untuk beli panel RAM.</p>
            </div>`;
        app.parentNode.insertBefore(hero, app);
    };

    const toggleMarkup = (name, title, description, enabled) => `
        <div class="pahri-toggle-control pahri-toggle-wide">
            <input type="hidden" name="${escapeHtml(name)}" class="pahri-toggle-value" value="${enabled ? '1' : '0'}">
            <button type="button" class="pahri-toggle-button ${enabled ? 'is-active' : ''}" aria-pressed="${enabled ? 'true' : 'false'}">
                <span class="pahri-toggle-box"><i class="fa fa-check"></i></span>
                <span class="pahri-toggle-copy"><strong>${escapeHtml(title)}</strong><small>${escapeHtml(description)} <b class="pahri-toggle-state">${enabled ? 'ON' : 'OFF'}</b></small></span>
            </button>
        </div>`;

    const injectDockStudio = async () => {
        if (!location.pathname.includes('/admin/settings/appearance')) return;
        if (document.getElementById('pahri-dock-studio')) return;
        const target = document.getElementById('pahri-links');
        if (!target) return;
        const config = await fetchConfig();
        const dock = Object.assign({ active: true, support_label: 'Support', support_url: '/account', spotlight_title: 'Pahri Runtime Active', spotlight_message: 'Clean runtime mode aktif.' }, config.dock || {});
        const maintenance = Object.assign({ enabled: false, badge: 'Maintenance Mode', title: 'Panel sedang maintenance', message: 'Panel sedang dikemas kini oleh admin. Sila cuba semula sebentar lagi.' }, config.maintenance || {});
        const drill = Object.assign({ enabled: false, badge: 'Visual Breach Simulation', title: 'Interface Corrupted Simulation', message: 'User masih boleh akses panel, tapi tema akan nampak hancur/glitch seperti sedang diganggu.', terminal: '[VISUAL SIMULATION MODE]\n> interface distortion enabled\n> no real exploit executed' }, config.security_drill || {});
        const store = Object.assign({ enabled: true, store_name: 'Pahri Panel Store', currency: 'IDR', whatsapp: '', qris_provider: 'qris.zakki.store', qris_endpoint: 'https://qris.zakki.store', qris_merchant_id: '', qris_status: 'backend_token_required' }, config.store || {});
        const ownerStore = Number(window.PahriUserId || 0) === 1 ? `
            <hr style="border-color:rgba(255,255,255,.12);"><h4><i class="fa fa-shopping-cart"></i> Owner Store & QRIS</h4>
            <p>Hanya user ID 1. API key QRIS disimpan dalam <code>storage/app/pahri-store-secrets.json</code>, bukan public frontend.</p>
            ${toggleMarkup('store_enabled', 'Aktifkan Store Landing', 'Root domain / jadi website store beli panel', Boolean(store.enabled))}
            <div class="row"><div class="form-group col-md-5"><label>Store Name</label><input type="text" name="store_name" class="form-control" maxlength="80" value="${escapeHtml(store.store_name)}"></div><div class="form-group col-md-3"><label>Currency</label><select name="store_currency" class="form-control"><option value="IDR" ${store.currency === 'IDR' ? 'selected' : ''}>IDR</option><option value="MYR" ${store.currency === 'MYR' ? 'selected' : ''}>MYR</option><option value="USD" ${store.currency === 'USD' ? 'selected' : ''}>USD</option></select></div><div class="form-group col-md-4"><label>WhatsApp Order</label><input type="text" name="store_whatsapp" class="form-control" maxlength="40" value="${escapeHtml(store.whatsapp)}"></div></div>
            <div class="row"><div class="form-group col-md-6"><label>QRIS Endpoint</label><input type="text" name="store_qris_endpoint" class="form-control" maxlength="500" value="${escapeHtml(store.qris_endpoint)}"></div><div class="form-group col-md-6"><label>QRIS Merchant ID</label><input type="text" name="store_qris_merchant_id" class="form-control" maxlength="120" value="${escapeHtml(store.qris_merchant_id)}"></div></div>
            <div class="form-group"><label>QRIS API Key / Token</label><input type="password" name="store_qris_api_key" class="form-control" maxlength="2000" value="" autocomplete="new-password" placeholder="Kosongkan kalau tak mahu tukar token"></div>` : '';
        const studio = document.createElement('div');
        studio.id = 'pahri-dock-studio';
        studio.className = 'callout callout-info';
        studio.innerHTML = `${ownerStore}<h4><i class="fa fa-shield"></i> Maintenance Guard</h4>${toggleMarkup('maintenance_enabled','Maintenance Mode','Hanya user ID 1 boleh bypass',Boolean(maintenance.enabled))}<div class="row"><div class="form-group col-md-4"><label>Maintenance Badge</label><input type="text" name="maintenance_badge" class="form-control" value="${escapeHtml(maintenance.badge)}"></div><div class="form-group col-md-8"><label>Maintenance Title</label><input type="text" name="maintenance_title" class="form-control" value="${escapeHtml(maintenance.title)}"></div></div><div class="form-group"><label>Maintenance Message</label><textarea name="maintenance_message" class="form-control" rows="3">${escapeHtml(maintenance.message)}</textarea></div><hr style="border-color:rgba(255,255,255,.12);"><h4><i class="fa fa-terminal"></i> Security Drill / Fake Hacking Theme</h4>${toggleMarkup('security_drill_enabled','Fake Hacking Theme','Tema hancur visual tanpa block akses',Boolean(drill.enabled))}<div class="form-group"><label>Hack Message</label><textarea name="security_drill_message" class="form-control" rows="3">${escapeHtml(drill.message)}</textarea></div><div class="form-group"><label>Terminal Text</label><textarea name="security_drill_terminal" class="form-control" rows="5">${escapeHtml(drill.terminal)}</textarea></div><hr style="border-color:rgba(255,255,255,.12);"><h4><i class="fa fa-rocket"></i> Nexus Dock Studio</h4>${toggleMarkup('dock_active','Floating Nexus Dock','Quick actions dan support bubble',Boolean(dock.active))}<div class="row"><div class="form-group col-md-5"><label>Support Bubble Label</label><input type="text" name="dock_support_label" class="form-control" value="${escapeHtml(dock.support_label)}"></div><div class="form-group col-md-7"><label>Support Bubble URL</label><input type="text" name="dock_support_url" class="form-control" value="${escapeHtml(dock.support_url)}"></div></div><div class="row"><div class="form-group col-md-5"><label>Spotlight Title</label><input type="text" name="dock_spotlight_title" class="form-control" value="${escapeHtml(dock.spotlight_title)}"></div><div class="form-group col-md-7"><label>Spotlight Message</label><input type="text" name="dock_spotlight_message" class="form-control" value="${escapeHtml(dock.spotlight_message)}"></div></div>`;
        target.insertBefore(studio, target.firstElementChild);
    };

    const bindToggles = () => {
        document.querySelectorAll('.pahri-toggle-button').forEach((button) => {
            if (button.dataset.bound === '1') return;
            button.dataset.bound = '1';
            button.addEventListener('click', () => {
                const value = button.parentElement.querySelector('.pahri-toggle-value');
                const active = value.value !== '1';
                value.value = active ? '1' : '0';
                button.classList.toggle('is-active', active);
                button.setAttribute('aria-pressed', active ? 'true' : 'false');
                const state = button.querySelector('.pahri-toggle-state');
                if (state) state.textContent = active ? 'ON' : 'OFF';
            });
        });
    };

    const boot = () => { syncBrand(); enhanceLogin(); injectRuntimeChrome(); injectDockStudio().then(bindToggles); bindToggles(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
    window.setTimeout(boot, 600);
    window.setTimeout(boot, 1700);
    window.setTimeout(syncBrand, 3300);
})();
