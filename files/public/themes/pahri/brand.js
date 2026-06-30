(() => {
    'use strict';

    const BRAND = 'Pahri Panel';
    const TAGLINE = 'Next Generation Game Control';

    function link(label, href) {
        const item = document.createElement('a');
        item.href = href;
        item.textContent = label;
        if (location.pathname === href || (href !== '/' && location.pathname.startsWith(href))) {
            item.classList.add('is-active');
        }
        return item;
    }

    function mountBar() {
        if (location.pathname.startsWith('/admin') || document.querySelector('.pahri-product-bar')) return;

        const bar = document.createElement('header');
        bar.className = 'pahri-product-bar';

        const logo = document.createElement('a');
        logo.className = 'pahri-product-logo';
        logo.href = '/';
        logo.setAttribute('aria-label', BRAND);

        const copy = document.createElement('div');
        copy.className = 'pahri-product-copy';

        const name = document.createElement('span');
        name.className = 'pahri-product-name';
        name.textContent = BRAND;

        const tagline = document.createElement('span');
        tagline.className = 'pahri-product-tagline';
        tagline.textContent = TAGLINE;
        copy.append(name, tagline);

        const nav = document.createElement('nav');
        nav.className = 'pahri-product-nav';
        nav.append(link('Dashboard', '/'), link('Account', '/account'));

        if (window.PterodactylUser && window.PterodactylUser.root_admin) {
            nav.append(link('Admin', '/admin'));
        }

        const status = document.createElement('span');
        status.className = 'pahri-live-chip';
        status.textContent = 'SYSTEM ONLINE';

        bar.append(logo, copy, nav, status);
        document.body.appendChild(bar);
    }

    function removeOriginalBrand() {
        document.querySelectorAll('[alt*="Pterodactyl"], [title*="Pterodactyl"], [aria-label*="Pterodactyl"]').forEach(element => {
            element.classList.add('pahri-original-brand');
        });

        document.querySelectorAll('#app a').forEach(anchor => {
            if (!anchor.querySelector('svg') || anchor.textContent.trim()) return;
            const rect = anchor.getBoundingClientRect();
            if (rect.top < 170 && rect.width >= 38 && rect.height >= 28) {
                anchor.classList.add('pahri-original-brand');
            }
        });

        document.querySelectorAll('body *').forEach(element => {
            if (element.children.length > 0) return;
            if (element.textContent.trim().toLowerCase() === 'pterodactyl') {
                element.textContent = BRAND;
            }
        });
    }

    function applyBrand() {
        document.title = BRAND + ' — Control Center';
        const adminName = document.querySelector('.pahri-admin-logo-text');
        if (adminName) adminName.textContent = BRAND;
        removeOriginalBrand();
    }

    function boot() {
        mountBar();
        applyBrand();
        window.setTimeout(applyBrand, 600);
        window.setTimeout(applyBrand, 1600);
        window.setTimeout(applyBrand, 3200);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }
})();
