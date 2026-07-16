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
        ['Version 4.0 • by Pahri', 'Version 6.3.1 • by Pahri'],
        ['Version 5.0 • by Pahri', 'Version 6.3.1 • by Pahri'],
        ['Version 6.0 • by Pahri', 'Version 6.3.1 • by Pahri'],
        ['Version 6.1 • by Pahri', 'Version 6.3.1 • by Pahri'],
        ['Version 6.2 • by Pahri', 'Version 6.3.1 • by Pahri'],
        ['Version 6.3 • by Pahri', 'Version 6.3.1 • by Pahri'],
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

    const upgradeToggle = (container) => {
        if (!(container instanceof HTMLElement) || container.dataset.pahriToggleReady === '1') return;

        const checkbox = container.querySelector('input[type="checkbox"]');
        if (!(checkbox instanceof HTMLInputElement) || !checkbox.name) return;

        const name = checkbox.name;
        const active = checkbox.checked;
        const textElement = container.querySelector('.pahri-checkbox-label');
        const label = textElement ? textElement.textContent.trim() : name.replace(/_/g, ' ');

        const hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = name;
        hidden.value = active ? '1' : '0';

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'pahri-single-toggle';
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
        button.setAttribute('aria-label', label);

        const indicator = document.createElement('span');
        indicator.className = 'pahri-single-toggle-indicator';
        indicator.setAttribute('aria-hidden', 'true');

        const check = document.createElement('span');
        check.className = 'pahri-single-toggle-check';
        check.textContent = '✓';
        indicator.appendChild(check);

        const copy = document.createElement('span');
        copy.className = 'pahri-single-toggle-copy';

        const title = document.createElement('strong');
        title.textContent = label;

        const status = document.createElement('small');
        status.className = 'pahri-single-toggle-status';

        copy.appendChild(title);
        copy.appendChild(status);
        button.appendChild(indicator);
        button.appendChild(copy);

        const sync = (enabled) => {
            hidden.value = enabled ? '1' : '0';
            button.setAttribute('aria-pressed', enabled ? 'true' : 'false');
            status.textContent = enabled ? 'ON' : 'OFF';
        };

        button.addEventListener('click', () => {
            sync(button.getAttribute('aria-pressed') !== 'true');
        });

        container.dataset.pahriToggleReady = '1';
        container.className = 'pahri-toggle-field';
        container.replaceChildren(hidden, button);
        sync(active);
    };

    const upgradeAllToggles = (root = document) => {
        root.querySelectorAll('.pahri-checkbox').forEach(upgradeToggle);
    };

    const watchNewToggles = () => {
        if (!document.body || document.body.dataset.pahriToggleObserver === '1') return;
        document.body.dataset.pahriToggleObserver = '1';

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (!(node instanceof HTMLElement)) return;
                    if (node.matches('.pahri-checkbox')) upgradeToggle(node);
                    upgradeAllToggles(node);
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
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
            <div class="pahri-checkbox"><input type="checkbox" name="maintenance_enabled" ${maintenance.enabled ? 'checked' : ''}><span class="pahri-checkbox-label">Aktifkan maintenance mode — hanya user ID 1 boleh akses</span></div>
            <div class="row"><div class="form-group col-md-4"><label>Maintenance Badge</label><input type="text" name="maintenance_badge" class="form-control" maxlength="40" value="${escapeHtml(maintenance.badge)}" placeholder="Maintenance Mode"></div><div class="form-group col-md-8"><label>Maintenance Title</label><input type="text" name="maintenance_title" class="form-control" maxlength="120" value="${escapeHtml(maintenance.title)}" placeholder="Panel sedang maintenance"></div></div>
            <div class="form-group"><label>Maintenance Message</label><textarea name="maintenance_message" class="form-control" rows="3" maxlength="1000" placeholder="Mesej untuk user biasa...">${escapeHtml(maintenance.message)}</textarea></div>
            <hr style="border-color: rgba(255,255,255,.12);">
            <h4><i class="fa fa-terminal"></i> Security Drill / Fake Hacking Theme</h4>
            <p>Mode ini tidak block user. User/client masih boleh akses panel, tetapi tema akan nampak rosak, glitch, terminal, red alert dan macam kena hack. Ini visual simulation sahaja.</p>
            <div class="pahri-checkbox"><input type="checkbox" name="security_drill_enabled" ${drill.enabled ? 'checked' : ''}><span class="pahri-checkbox-label">Aktifkan tema hancur / fake hacking visual</span></div>
            <div class="row"><div class="form-group col-md-4"><label>Hack Badge</label><input type="text" name="security_drill_badge" class="form-control" maxlength="40" value="${escapeHtml(drill.badge)}"></div><div class="form-group col-md-8"><label>Hack Title</label><input type="text" name="security_drill_title" class="form-control" maxlength="120" value="${escapeHtml(drill.title)}"></div></div>
            <div class="form-group"><label>Hack Message</label><textarea name="security_drill_message" class="form-control" rows="3" maxlength="1000">${escapeHtml(drill.message)}</textarea></div>
            <div class="form-group"><label>Terminal Text</label><textarea name="security_drill_terminal" class="form-control" rows="5" maxlength="1500">${escapeHtml(drill.terminal)}</textarea></div>
            <hr style="border-color: rgba(255,255,255,.12);">
            <h4><i class="fa fa-rocket"></i> Nexus Dock Studio</h4>
            <p>Kawal floating dock bawah panel, support bubble dan spotlight card. Dock masih boleh dimatikan kalau panel blank.</p>
            <div class="pahri-checkbox"><input type="checkbox" name="dock_active" ${dock.active ? 'checked' : ''}><span class="pahri-checkbox-label">Aktifkan floating Nexus Dock</span></div>
            <div class="row"><div class="form-group col-md-5"><label>Support Bubble Label</label><input type="text" name="dock_support_label" class="form-control" maxlength="32" value="${escapeHtml(dock.support_label)}" placeholder="Support"></div><div class="form-group col-md-7"><label>Support Bubble URL</label><input type="text" name="dock_support_url" class="form-control" maxlength="500" value="${escapeHtml(dock.support_url)}" placeholder="/account atau https://wa.me/..."></div></div>
            <div class="row"><div class="form-group col-md-5"><label>Spotlight Title</label><input type="text" name="dock_spotlight_title" class="form-control" maxlength="80" value="${escapeHtml(dock.spotlight_title)}"></div><div class="form-group col-md-7"><label>Spotlight Message</label><input type="text" name="dock_spotlight_message" class="form-control" maxlength="220" value="${escapeHtml(dock.spotlight_message)}"></div></div>`;

        target.insertBefore(studio, target.firstElementChild);
        upgradeAllToggles(studio);
    };

    const boot = () => {
        syncBrand();
        upgradeAllToggles();
        watchNewToggles();
        injectDockStudio();
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
    else boot();

    window.setTimeout(boot, 500);
    window.setTimeout(upgradeAllToggles, 1200);
    window.setTimeout(syncBrand, 1400);
    window.setTimeout(syncBrand, 3200);
})();
