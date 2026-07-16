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
        ['Version 4.0 • by Pahri', 'Version 6.3 • by Pahri'],
        ['Version 5.0 • by Pahri', 'Version 6.3 • by Pahri'],
        ['Version 6.0 • by Pahri', 'Version 6.3 • by Pahri'],
        ['Version 6.1 • by Pahri', 'Version 6.3 • by Pahri'],
        ['Version 6.2 • by Pahri', 'Version 6.3 • by Pahri'],
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

    const fetchConfig = async () => {
        try {
            const response = await fetch('/themes/pahri/settings.json?studio=' + Date.now(), { cache: 'no-store' });
            if (response.ok) return await response.json();
        } catch (error) {}
        return {};
    };

    const injectDockStudio = async () => {
        if (!location.pathname.includes('/admin/settings/appearance')) return;
        if (document.getElementById('pahri-dock-studio')) return;

        const target = document.getElementById('pahri-links');
        if (!target) return;

        const config = await fetchConfig();
        const dock = Object.assign({
            active: false,
            support_label: 'Support',
            support_url: '/account',
            spotlight_title: 'Nexus Dock Active',
            spotlight_message: 'Quick actions, live time, support and custom links are ready from one floating dock.'
        }, config.dock || {});
        const maintenance = Object.assign({
            enabled: false,
            badge: 'Maintenance Mode',
            title: 'Panel sedang maintenance',
            message: 'Panel sedang dikemas kini oleh admin. Sila cuba semula sebentar lagi.'
        }, config.maintenance || {});
        const drill = Object.assign({
            enabled: false,
            badge: 'Visual Breach Simulation',
            title: 'Interface Corrupted Simulation',
            message: 'User masih boleh akses panel, tapi tema akan nampak hancur/glitch seperti sedang diganggu. Ini hanya simulasi visual.',
            terminal: '[VISUAL SIMULATION MODE]\n> interface distortion enabled\n> client access remains open\n> UI integrity: unstable\n> admin bypass: user id 1\n> no real exploit executed'
        }, config.security_drill || {});

        const studio = document.createElement('div');
        studio.id = 'pahri-dock-studio';
        studio.className = 'callout callout-info';
        studio.innerHTML = `
            <h4><i class="fa fa-shield"></i> Maintenance Guard</h4>
            <p>Kalau ON, user biasa dikunci pada halaman maintenance. Hanya user ID 1 boleh bypass dan akses panel.</p>
            <div class="checkbox pahri-checkbox">
                <label>
                    <input type="hidden" name="maintenance_enabled" value="0">
                    <input class="pahri-checkbox-input" type="checkbox" name="maintenance_enabled" value="1" ${maintenance.enabled ? 'checked' : ''}>
                    <span class="pahri-checkbox-ui" aria-hidden="true"></span>
                    <span class="pahri-checkbox-label">Aktifkan maintenance mode — hanya user ID 1 boleh akses</span>
                </label>
            </div>
            <div class="row">
                <div class="form-group col-md-4">
                    <label>Maintenance Badge</label>
                    <input type="text" name="maintenance_badge" class="form-control" maxlength="40" value="${escapeHtml(maintenance.badge)}" placeholder="Maintenance Mode">
                </div>
                <div class="form-group col-md-8">
                    <label>Maintenance Title</label>
                    <input type="text" name="maintenance_title" class="form-control" maxlength="120" value="${escapeHtml(maintenance.title)}" placeholder="Panel sedang maintenance">
                </div>
            </div>
            <div class="form-group">
                <label>Maintenance Message</label>
                <textarea name="maintenance_message" class="form-control" rows="3" maxlength="1000" placeholder="Mesej untuk user biasa...">${escapeHtml(maintenance.message)}</textarea>
            </div>
            <hr style="border-color: rgba(255,255,255,.12);">
            <h4><i class="fa fa-terminal"></i> Security Drill / Fake Hacking Theme</h4>
            <p>Mode ini tidak block user. User/client masih boleh akses panel, tetapi tema akan nampak rosak, glitch, terminal, red alert dan macam kena hack. Ini visual simulation sahaja.</p>
            <div class="checkbox pahri-checkbox">
                <label>
                    <input type="hidden" name="security_drill_enabled" value="0">
                    <input class="pahri-checkbox-input" type="checkbox" name="security_drill_enabled" value="1" ${drill.enabled ? 'checked' : ''}>
                    <span class="pahri-checkbox-ui" aria-hidden="true"></span>
                    <span class="pahri-checkbox-label">Aktifkan tema hancur / fake hacking visual</span>
                </label>
            </div>
            <div class="row">
                <div class="form-group col-md-4">
                    <label>Hack Badge</label>
                    <input type="text" name="security_drill_badge" class="form-control" maxlength="40" value="${escapeHtml(drill.badge)}">
                </div>
                <div class="form-group col-md-8">
                    <label>Hack Title</label>
                    <input type="text" name="security_drill_title" class="form-control" maxlength="120" value="${escapeHtml(drill.title)}">
                </div>
            </div>
            <div class="form-group">
                <label>Hack Message</label>
                <textarea name="security_drill_message" class="form-control" rows="3" maxlength="1000">${escapeHtml(drill.message)}</textarea>
            </div>
            <div class="form-group">
                <label>Terminal Text</label>
                <textarea name="security_drill_terminal" class="form-control" rows="5" maxlength="1500">${escapeHtml(drill.terminal)}</textarea>
            </div>
            <hr style="border-color: rgba(255,255,255,.12);">
            <h4><i class="fa fa-rocket"></i> Nexus Dock Studio</h4>
            <p>Kawal floating dock bawah panel, support bubble dan spotlight card. Dock masih boleh dimatikan kalau panel blank.</p>
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
                    <input type="text" name="dock_spotlight_message" class="form-control" maxlength="220" value="${escapeHtml(dock_spotlight_message)}">
                </div>
            </div>`;

        studio.innerHTML = studio.innerHTML.replace('value="undefined"', 'value="' + escapeHtml(dock.spotlight_message) + '"');
        target.insertBefore(studio, target.firstElementChild);
    };

    const boot = () => { syncBrand(); injectDockStudio(); };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
    else boot();

    window.setTimeout(boot, 500);
    window.setTimeout(syncBrand, 1400);
    window.setTimeout(syncBrand, 3200);
})();
