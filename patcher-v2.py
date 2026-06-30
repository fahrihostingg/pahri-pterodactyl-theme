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
        raise SystemExit(f'[ERROR] Anchor Pahri Thema New tidak dijumpai dalam {label}.')
    return text.replace(anchor, anchor + addition, 1)


def replace_known(text: str, candidates: list[str], replacement: str, marker: str, label: str) -> str:
    if marker in text:
        return text
    for candidate in candidates:
        if candidate in text:
            return text.replace(candidate, replacement, 1)
    raise SystemExit(f'[ERROR] Branding sasaran tidak dijumpai dalam {label}.')


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

    wrapper_text = wrapper_text.replace('/themes/pahri/brand.js', '/themes/pahri/thema-new.js')
    admin_text = admin_text.replace('/themes/pahri/brand.js', '/themes/pahri/thema-new.js')
    wrapper_text = wrapper_text.replace('<title>Pahri Panel</title>', '<title>Pahri Thema New</title>')
    wrapper_text = wrapper_text.replace('<title>Pahri Aurelia</title>', '<title>Pahri Thema New</title>')
    admin_text = admin_text.replace("<title>Pahri Panel - @yield('title')</title>", "<title>Pahri Thema New - @yield('title')</title>")
    admin_text = admin_text.replace("<title>Pahri Aurelia - @yield('title')</title>", "<title>Pahri Thema New - @yield('title')</title>")
    admin_text = admin_text.replace('<span class="pahri-admin-logo-text">Pahri Panel</span>', '<span class="pahri-admin-logo-text">Pahri Thema New</span>')
    admin_text = admin_text.replace('<span class="pahri-admin-logo-text">Pahri Aurelia</span>', '<span class="pahri-admin-logo-text">Pahri Thema New</span>')
    admin_text = admin_text.replace('Pahri Panel &copy;', 'Pahri Thema New &copy;')
    admin_text = admin_text.replace('Pahri Aurelia &copy;', 'Pahri Thema New &copy;')

    client_assets = '''
        <link rel="stylesheet" href="/themes/pahri/nova-client-shell.css?v={{ @filemtime(public_path('themes/pahri/nova-client-shell.css')) ?: 1 }}">
        <link rel="stylesheet" href="/themes/pahri/nova-client-surfaces.css?v={{ @filemtime(public_path('themes/pahri/nova-client-surfaces.css')) ?: 1 }}">
        <link rel="stylesheet" href="/themes/pahri/nova-client-controls.css?v={{ @filemtime(public_path('themes/pahri/nova-client-controls.css')) ?: 1 }}">
        <script defer src="/themes/pahri/thema-new.js?v={{ @filemtime(public_path('themes/pahri/thema-new.js')) ?: 1 }}"></script>'''
    wrapper_text = inject(
        wrapper_text,
        "        @include('layouts.scripts')",
        client_assets,
        'nova-client-shell.css',
        str(wrapper),
    )

    wrapper_text = replace_known(
        wrapper_text,
        [
            "        <title>{{ config('app.name', 'Pterodactyl') }}</title>",
            '        <title>Pahri Panel</title>',
            '        <title>Pahri Aurelia</title>',
            '        <title>Pahri Thema New</title>',
        ],
        "        <title>Pahri Thema New</title><!-- PAHRI THEMA NEW CLIENT TITLE -->",
        'PAHRI THEMA NEW CLIENT TITLE',
        str(wrapper),
    )

    admin_anchor = "            <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css\">"
    admin_assets = '''
            <link rel="stylesheet" href="/themes/pahri/nova-admin-header.css?v={{ @filemtime(public_path('themes/pahri/nova-admin-header.css')) ?: 1 }}">
            <link rel="stylesheet" href="/themes/pahri/nova-admin-sidebar.css?v={{ @filemtime(public_path('themes/pahri/nova-admin-sidebar.css')) ?: 1 }}">
            <link rel="stylesheet" href="/themes/pahri/nova-admin-content.css?v={{ @filemtime(public_path('themes/pahri/nova-admin-content.css')) ?: 1 }}">
            <link rel="stylesheet" href="/themes/pahri/nova-admin-controls.css?v={{ @filemtime(public_path('themes/pahri/nova-admin-controls.css')) ?: 1 }}">
            <link rel="stylesheet" href="/themes/pahri/nova-admin-footer.css?v={{ @filemtime(public_path('themes/pahri/nova-admin-footer.css')) ?: 1 }}">
            <script defer src="/themes/pahri/thema-new.js?v={{ @filemtime(public_path('themes/pahri/thema-new.js')) ?: 1 }}"></script>'''
    admin_text = inject(admin_text, admin_anchor, admin_assets, 'nova-admin-header.css', str(admin))

    admin_text = replace_known(
        admin_text,
        [
            "        <title>{{ config('app.name', 'Pterodactyl') }} - @yield('title')</title>",
            "        <title>Pahri Panel - @yield('title')</title>",
            "        <title>Pahri Aurelia - @yield('title')</title>",
            "        <title>Pahri Thema New - @yield('title')</title>",
        ],
        "        <title>Pahri Thema New - @yield('title')</title><!-- PAHRI THEMA NEW ADMIN TITLE -->",
        'PAHRI THEMA NEW ADMIN TITLE',
        str(admin),
    )

    admin_text = replace_known(
        admin_text,
        [
            "                    <span class=\"pahri-admin-logo-text\">{{ config('app.name', 'Pterodactyl') }}</span>",
            '                    <span class="pahri-admin-logo-text">Pahri Panel</span>',
            '                    <span class="pahri-admin-logo-text">Pahri Aurelia</span>',
            '                    <span class="pahri-admin-logo-text">Pahri Thema New</span>',
        ],
        '                    <span class="pahri-admin-logo-text">Pahri Thema New</span><!-- PAHRI THEMA NEW BRAND -->',
        'PAHRI THEMA NEW BRAND',
        str(admin),
    )

    old_footer = 'Copyright &copy; 2015 - {{ date(\'Y\') }} <a href="https://pterodactyl.io/">Pterodactyl Software</a>.'
    new_footer = '<span class="pahri-footer-brand">Pahri Thema New &copy; {{ date(\'Y\') }} &mdash; Nexus Engine by Pahri</span><!-- PAHRI THEMA NEW FOOTER -->'
    admin_text = replace_known(
        admin_text,
        [
            old_footer,
            '<span class="pahri-footer-brand">Pahri Panel &copy; {{ date(\'Y\') }} &mdash; Built by Pahri</span>',
            '<span class="pahri-footer-brand">Pahri Aurelia &copy; {{ date(\'Y\') }} &mdash; Built by Pahri</span>',
            '<span class="pahri-footer-brand">Pahri Thema New &copy; {{ date(\'Y\') }} &mdash; Built by Pahri</span>',
            '<span class="pahri-footer-brand">Pahri Thema New &copy; {{ date(\'Y\') }} &mdash; Nexus Engine by Pahri</span>',
        ],
        new_footer,
        'PAHRI THEMA NEW FOOTER',
        str(admin),
    )

    write(wrapper, wrapper_text)
    write(admin, admin_text)
    print('[OK] Pahri Thema New full reskin berjaya dipatch.')


if __name__ == '__main__':
    main()
