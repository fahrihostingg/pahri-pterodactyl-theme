#!/usr/bin/env python3
from __future__ import annotations

import argparse
import os
from pathlib import Path


def write(path: Path, text: str) -> None:
    temp = path.with_suffix(path.suffix + '.pahri-v2')
    temp.write_text(text, encoding='utf-8')
    os.replace(temp, path)


def inject(text: str, anchor: str, addition: str, marker: str, label: str) -> str:
    if marker in text:
        return text
    if anchor not in text:
        raise SystemExit(f'[ERROR] Anchor Pahri Nova tidak dijumpai dalam {label}.')
    return text.replace(anchor, anchor + addition, 1)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--panel', required=True)
    args = parser.parse_args()
    panel = Path(args.panel).resolve()

    wrapper = panel / 'resources/views/templates/wrapper.blade.php'
    admin = panel / 'resources/views/layouts/admin.blade.php'
    if not wrapper.is_file() or not admin.is_file():
        raise SystemExit('[ERROR] Layout Pterodactyl tidak lengkap.')

    wrapper_text = wrapper.read_text(encoding='utf-8')
    admin_text = admin.read_text(encoding='utf-8')

    client_assets = '''
        <link rel="stylesheet" href="/themes/pahri/nova-client-shell.css?v={{ @filemtime(public_path('themes/pahri/nova-client-shell.css')) ?: 1 }}">
        <link rel="stylesheet" href="/themes/pahri/nova-client-surfaces.css?v={{ @filemtime(public_path('themes/pahri/nova-client-surfaces.css')) ?: 1 }}">
        <link rel="stylesheet" href="/themes/pahri/nova-client-controls.css?v={{ @filemtime(public_path('themes/pahri/nova-client-controls.css')) ?: 1 }}">
        <script defer src="/themes/pahri/brand.js?v={{ @filemtime(public_path('themes/pahri/brand.js')) ?: 1 }}"></script>'''
    wrapper_text = inject(
        wrapper_text,
        "        @include('layouts.scripts')",
        client_assets,
        'nova-client-shell.css',
        str(wrapper),
    )

    admin_anchor = "            <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css\">"
    admin_assets = '''
            <link rel="stylesheet" href="/themes/pahri/nova-admin-header.css?v={{ @filemtime(public_path('themes/pahri/nova-admin-header.css')) ?: 1 }}">
            <link rel="stylesheet" href="/themes/pahri/nova-admin-sidebar.css?v={{ @filemtime(public_path('themes/pahri/nova-admin-sidebar.css')) ?: 1 }}">
            <link rel="stylesheet" href="/themes/pahri/nova-admin-content.css?v={{ @filemtime(public_path('themes/pahri/nova-admin-content.css')) ?: 1 }}">
            <link rel="stylesheet" href="/themes/pahri/nova-admin-controls.css?v={{ @filemtime(public_path('themes/pahri/nova-admin-controls.css')) ?: 1 }}">
            <link rel="stylesheet" href="/themes/pahri/nova-admin-footer.css?v={{ @filemtime(public_path('themes/pahri/nova-admin-footer.css')) ?: 1 }}">
            <script defer src="/themes/pahri/brand.js?v={{ @filemtime(public_path('themes/pahri/brand.js')) ?: 1 }}"></script>'''
    admin_text = inject(admin_text, admin_anchor, admin_assets, 'nova-admin-header.css', str(admin))

    old_footer = 'Copyright &copy; 2015 - {{ date(\'Y\') }} <a href="https://pterodactyl.io/">Pterodactyl Software</a>.'
    new_footer = '<span class="pahri-footer-brand">Pahri Panel &copy; {{ date(\'Y\') }} &mdash; Built by Pahri</span><!-- PAHRI NOVA FOOTER -->'
    if 'PAHRI NOVA FOOTER' not in admin_text:
        if old_footer not in admin_text:
            raise SystemExit('[ERROR] Footer asal tidak dijumpai. Patch dihentikan.')
        admin_text = admin_text.replace(old_footer, new_footer, 1)

    write(wrapper, wrapper_text)
    write(admin, admin_text)
    print('[OK] Pahri Nova full reskin berjaya dipatch.')


if __name__ == '__main__':
    main()
