#!/usr/bin/env bash
set -Eeuo pipefail

PANEL_DIR="${PANEL_DIR:-/var/www/pterodactyl}"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
ASSET_DIR="$PACKAGE_DIR/files/public/themes/pahri"
TARGET_DIR="$PANEL_DIR/public/themes/pahri"

log() { printf '\033[1;35m[PAHRI THEMA NEW]\033[0m %s\n' "$*"; }
die() { printf '\033[1;31m[ERROR]\033[0m %s\n' "$*" >&2; exit 1; }

[[ $EUID -eq 0 ]] || die "Jalankan sebagai root."
[[ -f "$PANEL_DIR/artisan" ]] || die "Pterodactyl tidak dijumpai di $PANEL_DIR"
command -v python3 >/dev/null 2>&1 || die "Python 3 diperlukan."

ASSETS=(
    brand.js
    thema-new.js
    nova-client-shell.css
    nova-client-surfaces.css
    nova-client-controls.css
    nova-admin-header.css
    nova-admin-sidebar.css
    nova-admin-content.css
    nova-admin-controls.css
    nova-admin-footer.css
)

for asset in "${ASSETS[@]}"; do
    [[ -f "$ASSET_DIR/$asset" ]] || die "Aset pakej tiada: $asset"
done
[[ -f "$PACKAGE_DIR/patcher-v2.py" ]] || die "patcher-v2.py tiada."

log "Memasang modul Nexus full reskin..."
mkdir -p "$TARGET_DIR"
for asset in "${ASSETS[@]}"; do
    install -m 0644 "$ASSET_DIR/$asset" "$TARGET_DIR/$asset"
done

python3 "$PACKAGE_DIR/patcher-v2.py" --panel "$PANEL_DIR"
php -l "$PANEL_DIR/resources/views/layouts/admin.blade.php" >/dev/null
php -l "$PANEL_DIR/resources/views/templates/wrapper.blade.php" >/dev/null

PANEL_OWNER="$(stat -c '%U:%G' "$PANEL_DIR/artisan")"
WEB_USER="${WEB_USER:-$(stat -c '%U' "$PANEL_DIR/storage")}"
WEB_GROUP="${WEB_GROUP:-$(stat -c '%G' "$PANEL_DIR/storage")}"
chown "$PANEL_OWNER" "$PANEL_DIR/resources/views/layouts/admin.blade.php" "$PANEL_DIR/resources/views/templates/wrapper.blade.php"
chown -R "$WEB_USER:$WEB_GROUP" "$TARGET_DIR"
find "$TARGET_DIR" -type d -exec chmod 0775 {} +
find "$TARGET_DIR" -type f -exec chmod 0664 {} +

log "Membersihkan cache..."
cd "$PANEL_DIR"
php artisan optimize:clear >/dev/null
printf '\033[1;32m[OK]\033[0m Pahri Thema New full reskin aktif.\n'
