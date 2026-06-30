#!/usr/bin/env python3
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path


def fail(message: str) -> None:
    print(f"[ERROR] {message}", file=sys.stderr)
    raise SystemExit(1)


def atomic_write(path: Path, content: str) -> None:
    temporary = path.with_suffix(path.suffix + ".pahri-tmp")
    temporary.write_text(content, encoding="utf-8")
    os.replace(temporary, path)


def main() -> None:
    parser = argparse.ArgumentParser(description="Patch Pterodactyl v1.14.x for Pahri Thema New")
    parser.add_argument("--panel", required=True, help="Pterodactyl panel directory")
    args = parser.parse_args()

    panel = Path(args.panel).resolve()

    files = {
        "routes": panel / "routes/admin.php",
        "admin_layout": panel / "resources/views/layouts/admin.blade.php",
        "wrapper": panel / "resources/views/templates/wrapper.blade.php",
        "settings_nav": panel / "resources/views/partials/admin/settings/nav.blade.php",
    }

    for label, path in files.items():
        if not path.is_file():
            fail(f"Fail sasaran tidak dijumpai ({label}): {path}")

    original = {label: path.read_text(encoding="utf-8") for label, path in files.items()}
    source = dict(original)

    # Migrate visible labels from older Pahri releases.
    source["settings_nav"] = source["settings_nav"].replace("> Pahri Theme</a>", "> Pahri Thema New</a>")
    source["settings_nav"] = source["settings_nav"].replace("> Pahri Aurelia</a>", "> Pahri Thema New</a>")
    source["admin_layout"] = source["admin_layout"].replace("<span>Pahri Theme</span>", "<span>Pahri Thema New</span>")
    source["admin_layout"] = source["admin_layout"].replace("<span>Pahri Aurelia</span>", "<span>Pahri Thema New</span>")
    source["wrapper"] = source["wrapper"].replace('aria-label="Pahri Panel"', 'aria-label="Pahri Thema New"')
    source["wrapper"] = source["wrapper"].replace('aria-label="Pahri Aurelia"', 'aria-label="Pahri Thema New"')

    transforms: dict[str, list[tuple[str, str, str]]] = {
        "routes": [
            (
                "Route::get('/advanced', [Admin\\Settings\\AdvancedController::class, 'index'])->name('admin.settings.advanced');",
                "Route::get('/advanced', [Admin\\Settings\\AdvancedController::class, 'index'])->name('admin.settings.advanced');\n"
                "    Route::get('/appearance', [Admin\\Settings\\AppearanceController::class, 'index'])->name('admin.settings.appearance');",
                "admin.settings.appearance",
            ),
            (
                "Route::patch('/advanced', [Admin\\Settings\\AdvancedController::class, 'update']);",
                "Route::patch('/advanced', [Admin\\Settings\\AdvancedController::class, 'update']);\n"
                "    Route::patch('/appearance', [Admin\\Settings\\AppearanceController::class, 'update'])->name('admin.settings.appearance.update');",
                "admin.settings.appearance.update",
            ),
        ],
        "settings_nav": [
            (
                "                    <li @if($activeTab === 'advanced')class=\"active\"@endif><a href=\"{{ route('admin.settings.advanced') }}\">Advanced</a></li>",
                "                    <li @if($activeTab === 'advanced')class=\"active\"@endif><a href=\"{{ route('admin.settings.advanced') }}\">Advanced</a></li>\n"
                "                    <li @if($activeTab === 'appearance')class=\"active\"@endif><a href=\"{{ route('admin.settings.appearance') }}\"><i class=\"fa fa-diamond\"></i> Pahri Thema New</a></li>",
                "$activeTab === 'appearance'",
            ),
        ],
        "wrapper": [
            (
                "        @yield('assets')",
                "        @yield('assets')\n\n"
                "        <link rel=\"stylesheet\" href=\"/themes/pahri/custom.css?v={{ @filemtime(public_path('themes/pahri/custom.css')) ?: 1 }}\">\n"
                "        <link rel=\"stylesheet\" href=\"/themes/pahri/client.css?v={{ @filemtime(public_path('themes/pahri/client.css')) ?: 1 }}\">",
                "/themes/pahri/client.css",
            ),
            (
                "    <body class=\"{{ $css['body'] ?? 'bg-neutral-50' }}\">",
                "    <body class=\"{{ $css['body'] ?? 'bg-neutral-50' }} pahri-client-theme\">\n"
                "        <div class=\"pahri-theme-bg\" aria-hidden=\"true\">\n"
                "            <span class=\"pahri-orb pahri-orb-one\"></span>\n"
                "            <span class=\"pahri-orb pahri-orb-two\"></span>\n"
                "        </div>\n"
                "        <a class=\"pahri-floating-logo\" href=\"{{ route('index') }}\" aria-label=\"Pahri Thema New\"></a>\n"
                "        <div class=\"pahri-watermark\" aria-hidden=\"true\">by Pahri</div>",
                "pahri-client-theme",
            ),
        ],
        "admin_layout": [
            (
                "            {!! Theme::css('css/pterodactyl.css?t={cache-version}') !!}",
                "            {!! Theme::css('css/pterodactyl.css?t={cache-version}') !!}\n"
                "            <link rel=\"stylesheet\" href=\"/themes/pahri/custom.css?v={{ @filemtime(public_path('themes/pahri/custom.css')) ?: 1 }}\">\n"
                "            <link rel=\"stylesheet\" href=\"/themes/pahri/admin.css?v={{ @filemtime(public_path('themes/pahri/admin.css')) ?: 1 }}\">",
                "/themes/pahri/admin.css",
            ),
            (
                "    <body class=\"hold-transition skin-blue fixed sidebar-mini\">",
                "    <body class=\"hold-transition skin-blue fixed sidebar-mini pahri-admin-theme\">",
                "pahri-admin-theme",
            ),
            (
                "                    <span>{{ config('app.name', 'Pterodactyl') }}</span>",
                "                    <span class=\"pahri-admin-logo-mark\" aria-hidden=\"true\"></span>\n"
                "                    <span class=\"pahri-admin-logo-text\">{{ config('app.name', 'Pterodactyl') }}</span>",
                "pahri-admin-logo-mark",
            ),
            (
                "                        <li class=\"{{ ! starts_with(Route::currentRouteName(), 'admin.settings') ?: 'active' }}\">\n"
                "                            <a href=\"{{ route('admin.settings')}}\">\n"
                "                                <i class=\"fa fa-wrench\"></i> <span>Settings</span>\n"
                "                            </a>\n"
                "                        </li>",
                "                        <li class=\"{{ ! starts_with(Route::currentRouteName(), 'admin.settings') ?: 'active' }}\">\n"
                "                            <a href=\"{{ route('admin.settings')}}\">\n"
                "                                <i class=\"fa fa-wrench\"></i> <span>Settings</span>\n"
                "                            </a>\n"
                "                        </li>\n"
                "                        <li class=\"{{ Route::currentRouteName() !== 'admin.settings.appearance' ?: 'active' }}\">\n"
                "                            <a href=\"{{ route('admin.settings.appearance') }}\">\n"
                "                                <i class=\"fa fa-diamond\"></i> <span>Pahri Thema New</span>\n"
                "                            </a>\n"
                "                        </li>",
                "admin.settings.appearance') }}",
            ),
            (
                "        <div class=\"wrapper\">",
                "        <div class=\"pahri-admin-bg\" aria-hidden=\"true\"></div>\n"
                "        <div class=\"wrapper\">",
                "pahri-admin-bg",
            ),
            (
                "        @show\n    </body>",
                "        @show\n        <div class=\"pahri-admin-watermark\" aria-hidden=\"true\">by Pahri</div>\n    </body>",
                "pahri-admin-watermark",
            ),
        ],
    }

    for label, items in transforms.items():
        text = source[label]
        for old, _new, installed_marker in items:
            if installed_marker in text:
                continue
            if old not in text:
                fail(
                    f"Struktur {files[label]} tidak sepadan dengan Pterodactyl v1.14.x bersih. "
                    "Pemasangan dihentikan sebelum sebarang patch ditulis."
                )

    output = dict(source)

    for label, items in transforms.items():
        text = output[label]
        for old, new, installed_marker in items:
            if installed_marker in text:
                continue
            text = text.replace(old, new, 1)
        output[label] = text

    changed = False
    for label, content in output.items():
        if content != original[label]:
            atomic_write(files[label], content)
            print(f"[PATCH] {files[label]}")
            changed = True

    if not changed:
        print("[OK] Pahri Thema New sudah dipatch. Tiada perubahan diperlukan.")
        return

    print("[OK] Semua patch Pahri Thema New berjaya digunakan.")


if __name__ == "__main__":
    main()
