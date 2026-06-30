#!/usr/bin/env bash
set -Eeuo pipefail

PANEL_DIR="${PANEL_DIR:-/var/www/pterodactyl}"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
STATE_FILE="$PANEL_DIR/.pahri-theme-backup"
COMPLETED=0
ALREADY_INSTALLED=0
BACKUP_DIR=""

log() { printf '\033[1;36m[PAHRI]\033[0m %s\n' "$*"; }
ok() { printf '\033[1;32m[OK]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[WARN]\033[0m %s\n' "$*"; }
die() { printf '\033[1;31m[ERROR]\033[0m %s\n' "$*" >&2; exit 1; }

[[ $EUID -eq 0 ]] || die "Jalankan pemasang sebagai root: sudo bash install.sh"
[[ -d "$PANEL_DIR" ]] || die "Folder panel tidak dijumpai: $PANEL_DIR"
[[ -f "$PANEL_DIR/artisan" ]] || die "Fail artisan tidak dijumpai. PANEL_DIR bukan pemasangan Pterodactyl yang sah."

REQUIRED_FILES=(
    "routes/admin.php"
    "resources/views/layouts/admin.blade.php"
    "resources/views/templates/wrapper.blade.php"
    "resources/views/partials/admin/settings/nav.blade.php"
)

for relative in "${REQUIRED_FILES[@]}"; do
    [[ -f "$PANEL_DIR/$relative" ]] || die "Fail diperlukan tiada: $PANEL_DIR/$relative"
done

command -v php >/dev/null 2>&1 || die "PHP tidak dijumpai."
command -v python3 >/dev/null 2>&1 || die "Python 3 diperlukan untuk patch selamat."

PHP_VERSION="$(php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;')"
php -r 'exit(version_compare(PHP_VERSION, "8.2.0", ">=") ? 0 : 1);' \
    || die "Pahri Theme untuk Pterodactyl v1.14.x memerlukan PHP 8.2 atau lebih baharu. Dikesan: $PHP_VERSION"

if grep -q "pahri-client-theme" "$PANEL_DIR/resources/views/templates/wrapper.blade.php"; then
    ALREADY_INSTALLED=1
    warn "Pahri Theme telah dipasang. Fail tema akan dikemas kini tanpa memadam logo atau wallpaper semasa."
fi

PANEL_OWNER="$(stat -c '%U:%G' "$PANEL_DIR/artisan")"
WEB_USER="${WEB_USER:-$(stat -c '%U' "$PANEL_DIR/storage")}" 
WEB_GROUP="${WEB_GROUP:-$(stat -c '%G' "$PANEL_DIR/storage")}" 

run_artisan() {
    if id "$WEB_USER" >/dev/null 2>&1 && [[ "$WEB_USER" != "root" ]]; then
        runuser -u "$WEB_USER" -- php artisan "$@"
    else
        php artisan "$@"
    fi
}

restore_from_backup() {
    [[ -n "$BACKUP_DIR" && -d "$BACKUP_DIR" ]] || return 0
    warn "Pemasangan gagal. Memulihkan fail asal..."

    for relative in "${REQUIRED_FILES[@]}"; do
        if [[ -f "$BACKUP_DIR/original/$relative" ]]; then
            install -D -m 0644 "$BACKUP_DIR/original/$relative" "$PANEL_DIR/$relative"
        fi
    done

    if [[ -f "$BACKUP_DIR/meta.env" ]]; then
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

        if [[ "${HAD_THEME:-0}" == "1" ]]; then
            rm -rf "$PANEL_DIR/public/themes/pahri"
            mkdir -p "$PANEL_DIR/public/themes"
            cp -a "$BACKUP_DIR/original/public/themes/pahri" "$PANEL_DIR/public/themes/pahri"
        else
            rm -rf "$PANEL_DIR/public/themes/pahri"
        fi
    fi

    (cd "$PANEL_DIR" && run_artisan optimize:clear >/dev/null 2>&1) || true
    warn "Rollback selesai. Semak mesej ralat di atas."
}

on_error() {
    local code=$?
    if [[ $COMPLETED -eq 0 && $ALREADY_INSTALLED -eq 0 ]]; then
        restore_from_backup
    fi
    exit "$code"
}
trap on_error ERR

if [[ $ALREADY_INSTALLED -eq 0 ]]; then
    BACKUP_DIR="$PANEL_DIR/.pahri-theme-backups/$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR/original"

    log "Membuat backup di $BACKUP_DIR"
    for relative in "${REQUIRED_FILES[@]}"; do
        install -D -m 0644 "$PANEL_DIR/$relative" "$BACKUP_DIR/original/$relative"
    done

    HAD_CONTROLLER=0
    HAD_VIEW=0
    HAD_THEME=0

    if [[ -f "$PANEL_DIR/app/Http/Controllers/Admin/Settings/AppearanceController.php" ]]; then
        HAD_CONTROLLER=1
        install -D -m 0644 "$PANEL_DIR/app/Http/Controllers/Admin/Settings/AppearanceController.php" \
            "$BACKUP_DIR/original/app/Http/Controllers/Admin/Settings/AppearanceController.php"
    fi

    if [[ -f "$PANEL_DIR/resources/views/admin/settings/appearance.blade.php" ]]; then
        HAD_VIEW=1
        install -D -m 0644 "$PANEL_DIR/resources/views/admin/settings/appearance.blade.php" \
            "$BACKUP_DIR/original/resources/views/admin/settings/appearance.blade.php"
    fi

    if [[ -d "$PANEL_DIR/public/themes/pahri" ]]; then
        HAD_THEME=1
        mkdir -p "$BACKUP_DIR/original/public/themes"
        cp -a "$PANEL_DIR/public/themes/pahri" "$BACKUP_DIR/original/public/themes/pahri"
    fi

    cat > "$BACKUP_DIR/meta.env" <<META
HAD_CONTROLLER=$HAD_CONTROLLER
HAD_VIEW=$HAD_VIEW
HAD_THEME=$HAD_THEME
META

    printf '%s\n' "$BACKUP_DIR" > "$STATE_FILE"
fi

log "Memasang controller dan halaman admin..."
install -D -m 0644 "$PACKAGE_DIR/files/app/Http/Controllers/Admin/Settings/AppearanceController.php" \
    "$PANEL_DIR/app/Http/Controllers/Admin/Settings/AppearanceController.php"
install -D -m 0644 "$PACKAGE_DIR/files/resources/views/admin/settings/appearance.blade.php" \
    "$PANEL_DIR/resources/views/admin/settings/appearance.blade.php"

log "Memasang aset Pahri Theme..."
mkdir -p "$PANEL_DIR/public/themes/pahri/uploads"
for asset in client.css admin.css default-logo.svg default-wallpaper.svg; do
    install -m 0644 "$PACKAGE_DIR/files/public/themes/pahri/$asset" "$PANEL_DIR/public/themes/pahri/$asset"
done

if [[ ! -f "$PANEL_DIR/public/themes/pahri/settings.json" ]]; then
    install -m 0664 "$PACKAGE_DIR/files/public/themes/pahri/settings.json" "$PANEL_DIR/public/themes/pahri/settings.json"
fi
if [[ ! -f "$PANEL_DIR/public/themes/pahri/custom.css" ]]; then
    install -m 0664 "$PACKAGE_DIR/files/public/themes/pahri/custom.css" "$PANEL_DIR/public/themes/pahri/custom.css"
fi

log "Menggunakan patch idempotent..."
python3 "$PACKAGE_DIR/patcher.py" --panel "$PANEL_DIR"

log "Menyemak sintaks PHP..."
php -l "$PANEL_DIR/app/Http/Controllers/Admin/Settings/AppearanceController.php" >/dev/null
php -l "$PANEL_DIR/routes/admin.php" >/dev/null

chown "$PANEL_OWNER" \
    "$PANEL_DIR/app/Http/Controllers/Admin/Settings/AppearanceController.php" \
    "$PANEL_DIR/resources/views/admin/settings/appearance.blade.php" \
    "$PANEL_DIR/routes/admin.php" \
    "$PANEL_DIR/resources/views/layouts/admin.blade.php" \
    "$PANEL_DIR/resources/views/templates/wrapper.blade.php" \
    "$PANEL_DIR/resources/views/partials/admin/settings/nav.blade.php"

chown -R "$WEB_USER:$WEB_GROUP" "$PANEL_DIR/public/themes/pahri"
find "$PANEL_DIR/public/themes/pahri" -type d -exec chmod 0775 {} +
find "$PANEL_DIR/public/themes/pahri" -type f -exec chmod 0664 {} +

log "Membersihkan cache Laravel..."
(
    cd "$PANEL_DIR"
    run_artisan optimize:clear
    run_artisan route:list --path=admin/settings/appearance --no-ansi | grep -q "admin.settings.appearance"
)

if id "$WEB_USER" >/dev/null 2>&1 && [[ "$WEB_USER" != "root" ]]; then
    runuser -u "$WEB_USER" -- test -w "$PANEL_DIR/public/themes/pahri/settings.json" \
        || die "settings.json tidak boleh ditulis oleh web user $WEB_USER."
    runuser -u "$WEB_USER" -- test -w "$PANEL_DIR/public/themes/pahri/uploads" \
        || die "Folder uploads tidak boleh ditulis oleh web user $WEB_USER."
fi

COMPLETED=1
trap - ERR
ok "Pahri Elegant Theme berjaya dipasang."
printf '\nBuka: Admin Panel > Settings > Pahri Theme\n'
printf 'URL:   /admin/settings/appearance\n'
printf 'PHP:   %s | Web user: %s:%s\n' "$PHP_VERSION" "$WEB_USER" "$WEB_GROUP"
if [[ -n "$BACKUP_DIR" ]]; then
    printf 'Backup: %s\n' "$BACKUP_DIR"
fi
