#!/usr/bin/env python3
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

# IMPORTANT: keep public middleware strings only. Do not reference optional PHP classes here.
# Some Pterodactyl installs do not import RequireTwoFactorAuthentication in routes/base.php,
# and a ::class reference can make every route return 500 during Laravel boot.
PUBLIC_MIDDLEWARE = "['auth']"
STORE = "\\Pterodactyl\\Http\\Controllers\\Pahri\\StoreController::class"


def fail(message: str) -> None:
    print(f"[ERROR] {message}", file=sys.stderr)
    raise SystemExit(1)


def atomic_write(path: Path, content: str) -> None:
    tmp = path.with_suffix(path.suffix + '.pahri-tmp')
    tmp.write_text(content, encoding='utf-8')
    os.replace(tmp, path)


def normalize_broken_middleware(text: str) -> str:
    replacements = [
        "['auth', RequireTwoFactorAuthentication::class]",
        "['auth', \\Pterodactyl\\Http\\Middleware\\RequireTwoFactorAuthentication::class]",
        "['auth', Pterodactyl\\Http\\Middleware\\RequireTwoFactorAuthentication::class]",
    ]
    for item in replacements:
        text = text.replace(item, PUBLIC_MIDDLEWARE)
    return text


def patch_base_routes(text: str) -> str:
    text = normalize_broken_middleware(text)

    legacy_public = "Route::get('/', fn () => view('pahri.store'))\n    ->withoutMiddleware(" + PUBLIC_MIDDLEWARE + ")\n    ->name('pahri.store.index');"
    if legacy_public in text:
        text = text.replace(legacy_public, '__PAHRI_STORE_ROUTES__')

    legacy_block = "Route::get('/dashboard', [Base\\IndexController::class, 'index'])->name('index');\n__PAHRI_STORE_ROUTES__"
    if legacy_block in text:
        text = text.replace(legacy_block, '__PAHRI_ROOT_BLOCK__')

    text = text.replace("Route::get('/', [Base\\IndexController::class, 'index'])->name('index')->fallback();", '__PAHRI_ROOT_BLOCK__')

    if 'Pahri\\StoreController' in text:
        # Repair older Pahri route blocks in place without adding duplicate routes.
        if "Route::get('/checkout', [\\Pterodactyl\\Http\\Controllers\\Pahri\\StoreController::class, 'checkoutIndex'])" not in text:
            text = text.replace(
                "Route::post('/checkout', [\\Pterodactyl\\Http\\Controllers\\Pahri\\StoreController::class, 'checkout'])",
                "Route::get('/checkout', [\\Pterodactyl\\Http\\Controllers\\Pahri\\StoreController::class, 'checkoutIndex'])\n    ->withoutMiddleware(" + PUBLIC_MIDDLEWARE + ")\n    ->name('pahri.checkout.index');\nRoute::post('/checkout', [\\Pterodactyl\\Http\\Controllers\\Pahri\\StoreController::class, 'checkout'])",
                1,
            )
        if "Route::post('/owner/order/{id}'" not in text:
            text = text.replace(
                "Route::post('/owner', [\\Pterodactyl\\Http\\Controllers\\Pahri\\StoreController::class, 'updateOwner'])\n    ->name('pahri.owner.update');",
                "Route::post('/owner', [\\Pterodactyl\\Http\\Controllers\\Pahri\\StoreController::class, 'updateOwner'])\n    ->name('pahri.owner.update');\nRoute::post('/owner/order/{id}', [\\Pterodactyl\\Http\\Controllers\\Pahri\\StoreController::class, 'updateOrder'])\n    ->name('pahri.owner.order.update');",
                1,
            )
        return normalize_broken_middleware(text)

    block = f"""Route::get('/dashboard', [Base\\IndexController::class, 'index'])->name('index');
Route::get('/', [{STORE}, 'index'])
    ->withoutMiddleware({PUBLIC_MIDDLEWARE})
    ->name('pahri.store.index');
Route::get('/checkout', [{STORE}, 'checkoutIndex'])
    ->withoutMiddleware({PUBLIC_MIDDLEWARE})
    ->name('pahri.checkout.index');
Route::post('/checkout', [{STORE}, 'checkout'])
    ->withoutMiddleware({PUBLIC_MIDDLEWARE})
    ->name('pahri.checkout');
Route::get('/order/{{id}}', [{STORE}, 'order'])
    ->withoutMiddleware({PUBLIC_MIDDLEWARE})
    ->name('pahri.order');
Route::post('/order/{{id}}/account', [{STORE}, 'saveAccount'])
    ->withoutMiddleware({PUBLIC_MIDDLEWARE})
    ->name('pahri.order.account');
Route::get('/owner', [{STORE}, 'owner'])
    ->name('pahri.owner');
Route::post('/owner', [{STORE}, 'updateOwner'])
    ->name('pahri.owner.update');
Route::post('/owner/order/{{id}}', [{STORE}, 'updateOrder'])
    ->name('pahri.owner.order.update');"""

    if '__PAHRI_ROOT_BLOCK__' not in text:
        fail('Route root asal Pterodactyl tidak dijumpai dalam routes/base.php.')
    return text.replace('__PAHRI_ROOT_BLOCK__', block, 1)


def main() -> None:
    parser = argparse.ArgumentParser(description='Patch Pterodactyl v1.14.x for Pahri Thema New')
    parser.add_argument('--panel', required=True)
    args = parser.parse_args()
    panel = Path(args.panel).resolve()

    files = {
        'routes': panel / 'routes/admin.php',
        'base_routes': panel / 'routes/base.php',
        'admin_layout': panel / 'resources/views/layouts/admin.blade.php',
        'wrapper': panel / 'resources/views/templates/wrapper.blade.php',
        'settings_nav': panel / 'resources/views/partials/admin/settings/nav.blade.php',
    }
    for label, path in files.items():
        if not path.is_file():
            fail(f'Fail sasaran tidak dijumpai ({label}): {path}')

    original = {label: path.read_text(encoding='utf-8') for label, path in files.items()}
    source = dict(original)
    source['base_routes'] = patch_base_routes(source['base_routes'])
    source['settings_nav'] = source['settings_nav'].replace('> Pahri Theme</a>', '> Pahri Thema New</a>').replace('> Pahri Aurelia</a>', '> Pahri Thema New</a>')
    source['admin_layout'] = source['admin_layout'].replace('<span>Pahri Theme</span>', '<span>Pahri Thema New</span>').replace('<span>Pahri Aurelia</span>', '<span>Pahri Thema New</span>')
    source['wrapper'] = source['wrapper'].replace('aria-label="Pahri Panel"', 'aria-label="Pahri Thema New"').replace('aria-label="Pahri Aurelia"', 'aria-label="Pahri Thema New"')

    transforms = {
        'routes': [
            ("Route::get('/advanced', [Admin\\Settings\\AdvancedController::class, 'index'])->name('admin.settings.advanced');", "Route::get('/advanced', [Admin\\Settings\\AdvancedController::class, 'index'])->name('admin.settings.advanced');\n    Route::get('/appearance', [Admin\\Settings\\AppearanceController::class, 'index'])->name('admin.settings.appearance');", 'admin.settings.appearance'),
            ("Route::patch('/advanced', [Admin\\Settings\\AdvancedController::class, 'update']);", "Route::patch('/advanced', [Admin\\Settings\\AdvancedController::class, 'update']);\n    Route::patch('/appearance', [Admin\\Settings\\AppearanceController::class, 'update'])->name('admin.settings.appearance.update');", 'admin.settings.appearance.update'),
        ],
        'settings_nav': [
            ("                    <li @if($activeTab === 'advanced')class=\"active\"@endif><a href=\"{{ route('admin.settings.advanced') }}\">Advanced</a></li>", "                    <li @if($activeTab === 'advanced')class=\"active\"@endif><a href=\"{{ route('admin.settings.advanced') }}\">Advanced</a></li>\n                    <li @if($activeTab === 'appearance')class=\"active\"@endif><a href=\"{{ route('admin.settings.appearance') }}\"><i class=\"fa fa-diamond\"></i> Pahri Thema New</a></li>", "$activeTab === 'appearance'"),
        ],
        'wrapper': [
            ("        @yield('assets')", "        @yield('assets')\n\n        <link rel=\"stylesheet\" href=\"/themes/pahri/custom.css?v={{ @filemtime(public_path('themes/pahri/custom.css')) ?: 1 }}\">\n        <link rel=\"stylesheet\" href=\"/themes/pahri/client.css?v={{ @filemtime(public_path('themes/pahri/client.css')) ?: 1 }}\">", '/themes/pahri/client.css'),
            ("    <body class=\"{{ $css['body'] ?? 'bg-neutral-50' }}\">", "    <body class=\"{{ $css['body'] ?? 'bg-neutral-50' }} pahri-client-theme\">\n        <div class=\"pahri-theme-bg\" aria-hidden=\"true\"><span class=\"pahri-orb pahri-orb-one\"></span><span class=\"pahri-orb pahri-orb-two\"></span></div>\n        <a class=\"pahri-floating-logo\" href=\"/\" aria-label=\"Pahri Thema New\"></a>\n        <div class=\"pahri-watermark\" aria-hidden=\"true\">by Pahri</div>", 'pahri-client-theme'),
        ],
        'admin_layout': [
            ("            {!! Theme::css('css/pterodactyl.css?t={cache-version}') !!}", "            {!! Theme::css('css/pterodactyl.css?t={cache-version}') !!}\n            <link rel=\"stylesheet\" href=\"/themes/pahri/custom.css?v={{ @filemtime(public_path('themes/pahri/custom.css')) ?: 1 }}\">\n            <link rel=\"stylesheet\" href=\"/themes/pahri/admin.css?v={{ @filemtime(public_path('themes/pahri/admin.css')) ?: 1 }}\">", '/themes/pahri/admin.css'),
            ("    <body class=\"hold-transition skin-blue fixed sidebar-mini\">", "    <body class=\"hold-transition skin-blue fixed sidebar-mini pahri-admin-theme\">", 'pahri-admin-theme'),
            ("                    <span>{{ config('app.name', 'Pterodactyl') }}</span>", "                    <span class=\"pahri-admin-logo-mark\" aria-hidden=\"true\"></span>\n                    <span class=\"pahri-admin-logo-text\">{{ config('app.name', 'Pterodactyl') }}</span>", 'pahri-admin-logo-mark'),
            ("                        <li class=\"{{ ! starts_with(Route::currentRouteName(), 'admin.settings') ?: 'active' }}\">\n                            <a href=\"{{ route('admin.settings')}}\">\n                                <i class=\"fa fa-wrench\"></i> <span>Settings</span>\n                            </a>\n                        </li>", "                        <li class=\"{{ ! starts_with(Route::currentRouteName(), 'admin.settings') ?: 'active' }}\">\n                            <a href=\"{{ route('admin.settings')}}\">\n                                <i class=\"fa fa-wrench\"></i> <span>Settings</span>\n                            </a>\n                        </li>\n                        <li class=\"{{ Route::currentRouteName() !== 'admin.settings.appearance' ?: 'active' }}\"><a href=\"{{ route('admin.settings.appearance') }}\"><i class=\"fa fa-diamond\"></i> <span>Pahri Thema New</span></a></li>\n                        <li class=\"{{ Route::currentRouteName() !== 'pahri.owner' ?: 'active' }}\"><a href=\"/owner\"><i class=\"fa fa-shopping-cart\"></i> <span>Owner Store</span></a></li>", 'pahri.owner'),
            ("        <div class=\"wrapper\">", "        <div class=\"pahri-admin-bg\" aria-hidden=\"true\"></div>\n        <div class=\"wrapper\">", 'pahri-admin-bg'),
            ("        @show\n    </body>", "        @show\n        <div class=\"pahri-admin-watermark\" aria-hidden=\"true\">by Pahri</div>\n    </body>", 'pahri-admin-watermark'),
        ],
    }

    for label, items in transforms.items():
        text = source[label]
        for old, _new, marker in items:
            if marker in text:
                continue
            if old not in text:
                fail(f'Struktur {files[label]} tidak sepadan. Pemasangan dihentikan sebelum patch ditulis.')

    output = dict(source)
    for label, items in transforms.items():
        text = output[label]
        for old, new, marker in items:
            if marker not in text:
                text = text.replace(old, new, 1)
        output[label] = text

    changed = False
    for label, content in output.items():
        if content != original[label]:
            atomic_write(files[label], content)
            print(f'[PATCH] {files[label]}')
            changed = True
    print('[OK] Semua patch Pahri Thema New berjaya digunakan.' if changed else '[OK] Pahri Thema New sudah dipatch. Tiada perubahan diperlukan.')


if __name__ == '__main__':
    main()
