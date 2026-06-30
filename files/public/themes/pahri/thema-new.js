(() => {
    'use strict';

    const brand = 'Pahri Thema New';
    const replacements = new Map([
        ['Pahri Aurelia', brand],
        ['Pahri Panel', brand],
        ['AURELIA ONLINE', 'NEXUS ONLINE'],
        ['Aurelia Control', 'Nexus Control'],
        ['Luxury Spatial Control', 'Nexus Spatial Operating Theme'],
        ['All Aurelia core systems operational', 'All Nexus core systems operational'],
        ['Version 4.0 • by Pahri', 'Version 5.0 • by Pahri'],
    ]);

    const sync = () => {
        const label = document.querySelector('.pahri-admin-logo-text');
        if (label) label.textContent = brand;
        if (!document.title.includes(brand)) document.title = brand + ' — Nexus Control';

        document.querySelectorAll('body *').forEach((element) => {
            if (element.children.length > 0) return;
            const current = element.textContent.trim();
            const next = replacements.get(current);
            if (next) element.textContent = next;
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', sync, { once: true });
    } else {
        sync();
    }

    window.setTimeout(sync, 500);
    window.setTimeout(sync, 1400);
    window.setTimeout(sync, 3200);
})();
