(() => {
    'use strict';

    const BRAND = 'Pahri Aurelia';

    function removeOriginalBrand() {
        document.querySelectorAll('[alt*="Pterodactyl"], [title*="Pterodactyl"], [aria-label*="Pterodactyl"]').forEach(element => {
            element.classList.add('pahri-original-brand');
        });

        document.querySelectorAll('body *').forEach(element => {
            if (element.children.length > 0) return;
            if (element.textContent.trim().toLowerCase() === 'pterodactyl') {
                element.textContent = BRAND;
            }
        });
    }

    function applyBrand() {
        if (!document.title.includes('Pahri')) document.title = BRAND + ' — Spatial Control';
        const adminName = document.querySelector('.pahri-admin-logo-text');
        if (adminName) adminName.textContent = BRAND;
        removeOriginalBrand();
    }

    function boot() {
        applyBrand();
        window.setTimeout(applyBrand, 700);
        window.setTimeout(applyBrand, 1800);
        window.setTimeout(applyBrand, 3400);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }
})();
