(() => {
    'use strict';

    const brand = 'Pahri Thema New';

    const sync = () => {
        const label = document.querySelector('.pahri-admin-logo-text');
        if (label) label.textContent = brand;
        if (!document.title.includes(brand)) document.title = brand + ' — Nexus Control';
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', sync, { once: true });
    } else {
        sync();
    }

    window.setTimeout(sync, 800);
    window.setTimeout(sync, 2200);
})();
