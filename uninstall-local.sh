#!/usr/bin/env bash
set -Eeuo pipefail

PANEL_DIR="${PANEL_DIR:-/var/www/pterodactyl}"
STATE_FILE="$PANEL_DIR/.pahri-theme-backup"

log() { printf '\033[1;36m[PAHRI]\033[0m %s\n' "$*"; }
ok() { printf '\033[1;32m[OK]\033[0m %s\n' "$*"; }
die() { printf '\033[1;31m[ERROR]\033[0m %s\n' "$*" >&2; exit 1; }

[[ $EUID -eq 0 ]] || die "Jalankan sebagai root: sudo bash uninstall.sh"
[[ -f "$STATE_FILE" ]] || die "Fail backup state tidak dijumpai: $STATE_FILE"

BACKUP_DIR="$(head -n 1 "$STATE_FILE")"
[[ -d "$BACKUP_DIR/original" ]] || die "Folder backup tidak sah: $BACKUP_DIR"

REQUIRED_FILES=(
    "routes/admin.php"
    "resources/views/layouts/admin.blade.php"
    "resources/views/templates/wrapper.blade.php"
    "resources/views/partials/admin/settings/nav.blade.php"
)

log "Memulihkan fail panel asal..."
for relative in "${REQUIRED_FILES[@]}"; do
    [[ -f "$BACKUP_DIR/original/$relative" ]] || die "Backup fail tiada: $relative"
    install -D -m 0644 "$BACKUP_DIR/original/$relative" "$PANEL_DIR/$relative"
done

# shellcheck disable=SC1090
source "$BACKUP_DIR/meta.env"

if [[ "${HAD_CONTROLLER:-0}" == "1" ]]; then
    install -D -m 0644 "$BACKUP_DIR/original/app/Http/Controllers/Admin/Settings/AppearanceController.php" \
        "$PANEL_DIR/app/Http/Controllers/Admin/Settings/AppearanceController.php"
else
    rm -f "$PANEL_DIR/app/Http/Controllers/Admin/Settings/AppearanceController.php"
fi

if [[ "${HAD_VIEW:-0}" == "1" ]]; then
    install -D -m 0644 "$BACKUP_DIR/original/resources/views/admin/settings/appearance.blade.php" \
        "$PANEL_DIR/resources/views/admin/settings/appearance.blade.php"
else
    rm -f "$PANEL_DIR/resources/views/admin/settings/appearance.blade.php"
fi

rm -rf "$PANEL_DIR/public/themes/pahri"
if [[ "${HAD_THEME:-0}" == "1" ]]; then
    mkdir -p "$PANEL_DIR/public/themes"
    cp -a "$BACKUP_DIR/original/public/themes/pahri" "$PANEL_DIR/public/themes/pahri"
fi

WEB_USER="${WEB_USER:-$(stat -c '%U' "$PANEL_DIR/storage")}" 
if id "$WEB_USER" >/dev/null 2>&1 && [[ "$WEB_USER" != "root" ]]; then
    (cd "$PANEL_DIR" && runuser -u "$WEB_USER" -- php artisan optimize:clear)
else
    (cd "$PANEL_DIR" && php artisan optimize:clear)
fi

rm -f "$STATE_FILE"
ok "Pahri Theme telah dibuang dan panel dipulihkan daripada backup."
printf 'Backup masih disimpan di: %s\n' "$BACKUP_DIR"
