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
        ['Version 4.0 • by Pahri', 'Version 6.0 • by Pahri'],
        ['Version 5.0 • by Pahri', 'Version 6.0 • by Pahri'],
    ]);

    const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (char) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;'
    })[char]);

    const syncBrand = () => {
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

    const injectDockStudio = async () => {
        if (!location.pathname.includes('/admin/settings/appearance')) return;
        if (document.getElementById('pahri-dock-studio')) return;

        const target = document.getElementById('pahri-links');
        if (!target) return;

        let config = {};
        try {
            const response = await fetch('/themes/pahri/settings.json?studio=' + Date.now(), { cache: 'no-store' });
            if (response.ok) config = await response.json();
        } catch (error) {
            config = {};
        }

        const dock = Object.assign({
            active: true,
            support_label: 'Support',
            support_url: '/account',
            spotlight_title: 'Nexus Dock Active',
            spotlight_message: 'Quick actions, live time, support and custom links are ready from one floating dock.'
        }, config.dock || {});

        const studio = document.createElement('div');
        studio.id = 'pahri-dock-studio';
        studio.className = 'callout callout-info';
        studio.innerHTML = `
            <h4><i class="fa fa-rocket"></i> Nexus Dock Studio</h4>
            <p>Kawal floating dock bawah panel, support bubble dan spotlight card. Semua input ini disimpan bersama tetapan tema.</p>
            <div class="checkbox pahri-checkbox">
                <label>
                    <input type="hidden" name="dock_active" value="0">
                    <input class="pahri-checkbox-input" type="checkbox" name="dock_active" value="1" ${dock.active ? 'checked' : ''}>
                    <span class="pahri-checkbox-ui" aria-hidden="true"></span>
                    <span class="pahri-checkbox-label">Aktifkan floating Nexus Dock</span>
                </label>
            </div>
            <div class="row">
                <div class="form-group col-md-5">
                    <label>Support Bubble Label</label>
                    <input type="text" name="dock_support_label" class="form-control" maxlength="32" value="${escapeHtml(dock.support_label)}" placeholder="Support">
                </div>
                <div class="form-group col-md-7">
                    <label>Support Bubble URL</label>
                    <input type="text" name="dock_support_url" class="form-control" maxlength="500" value="${escapeHtml(dock.support_url)}" placeholder="/account atau https://wa.me/...">
                </div>
            </div>
            <div class="row">
                <div class="form-group col-md-5">
                    <label>Spotlight Title</label>
                    <input type="text" name="dock_spotlight_title" class="form-control" maxlength="80" value="${escapeHtml(dock.spotlight_title)}">
                </div>
                <div class="form-group col-md-7">
                    <label>Spotlight Message</label>
                    <input type="text" name="dock_spotlight_message" class="form-control" maxlength="220" value="${escapeHtml(dock.spotlight_message)}">
                </div>
            </div>`;

        target.insertBefore(studio, target.firstElementChild);
    };

    const boot = () => {
        syncBrand();
        injectDockStudio();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }

    window.setTimeout(boot, 500);
    window.setTimeout(syncBrand, 1400);
    window.setTimeout(syncBrand, 3200);
})();
