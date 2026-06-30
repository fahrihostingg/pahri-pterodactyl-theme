#!/usr/bin/env bash
set -Eeuo pipefail

PANEL_DIR="${PANEL_DIR:-/var/www/pterodactyl}"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
SOURCE_DIR="$PACKAGE_DIR/source"
STATE_FILE="$PANEL_DIR/.pahri-source-backup"
RUN_BACKUP=""
ORIGINAL_BACKUP=""
COMPLETED=0

log() { printf '\033[1;35m[PAHRI SOURCE]\033[0m %s\n' "$*"; }
ok() { printf '\033[1;32m[OK]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[WARN]\033[0m %s\n' "$*"; }
die() { printf '\033[1;31m[ERROR]\033[0m %s\n' "$*" >&2; exit 1; }

FILES=(
    "resources/scripts/components/App.tsx"
    "resources/scripts/components/NavigationBar.tsx"
    "resources/scripts/components/auth/LoginContainer.tsx"
    "resources/scripts/components/auth/LoginFormContainer.tsx"
    "resources/scripts/components/dashboard/DashboardContainer.tsx"
    "resources/scripts/components/dashboard/ServerRow.tsx"
    "resources/scripts/components/elements/PageContentBlock.tsx"
    "resources/scripts/components/elements/SubNavigation.tsx"
    "resources/scripts/routers/AuthenticationRouter.tsx"
)

[[ $EUID -eq 0 ]] || die "Jalankan pemasang sebagai root."
[[ -f "$PANEL_DIR/artisan" ]] || die "Pterodactyl tidak dijumpai di $PANEL_DIR"
[[ -f "$PANEL_DIR/package.json" ]] || die "package.json panel tidak dijumpai."
[[ -f "$PANEL_DIR/yarn.lock" ]] || die "yarn.lock panel tidak dijumpai."

for relative in "${FILES[@]}"; do
    [[ -f "$PANEL_DIR/$relative" ]] || die "Source panel tiada: $relative"
    [[ -f "$SOURCE_DIR/$relative" ]] || die "Source tema tiada: $relative"
done

command -v node >/dev/null 2>&1 || die "Node.js diperlukan. Pasang Node.js 22 atau 24."
NODE_MAJOR="$(node -p "Number(process.versions.node.split('.')[0])")"
(( NODE_MAJOR >= 22 )) || die "Node.js 22 atau lebih baharu diperlukan. Dikesan: $(node -v)"

ensure_yarn() {
    if command -v yarn >/dev/null 2>&1; then
        return
    fi
    if command -v corepack >/dev/null 2>&1; then
        corepack enable
        corepack prepare yarn@1.22.22 --activate
    elif command -v npm >/dev/null 2>&1; then
        npm install --global yarn@1.22.22
    else
        die "Yarn tidak dijumpai dan tidak boleh dipasang secara automatik."
    fi
    command -v yarn >/dev/null 2>&1 || die "Yarn gagal disediakan."
}

copy_files() {
    local from="$1"
    local to="$2"
    for relative in "${FILES[@]}"; do
        install -D -m 0644 "$from/$relative" "$to/$relative"
    done
}

build_panel() {
    cd "$PANEL_DIR"
    export NODE_OPTIONS="${NODE_OPTIONS:-} --max_old_space_size=4096"
    yarn install --frozen-lockfile --network-timeout 600000
    yarn build:production
    php artisan optimize:clear >/dev/null
}

restore_run_backup() {
    [[ -n "$RUN_BACKUP" && -d "$RUN_BACKUP" ]] || return 0
    warn "Build gagal. Memulihkan source sebelum pemasangan..."
    copy_files "$RUN_BACKUP" "$PANEL_DIR"
    (build_panel) || warn "Source dipulihkan tetapi rebuild asal gagal. Jalankan yarn build:production secara manual."
}

on_error() {
    local code=$?
    if [[ $COMPLETED -eq 0 ]]; then
        restore_run_backup
    fi
    exit "$code"
}
trap on_error ERR

ensure_yarn

RUN_BACKUP="$PANEL_DIR/.pahri-source-run-backups/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$RUN_BACKUP"
copy_files "$PANEL_DIR" "$RUN_BACKUP"

if [[ ! -f "$STATE_FILE" ]]; then
    ORIGINAL_BACKUP="$PANEL_DIR/.pahri-source-backups/$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$ORIGINAL_BACKUP"
    copy_files "$PANEL_DIR" "$ORIGINAL_BACKUP"
    printf '%s\n' "$ORIGINAL_BACKUP" > "$STATE_FILE"
    log "Backup source asal: $ORIGINAL_BACKUP"
else
    ORIGINAL_BACKUP="$(head -n 1 "$STATE_FILE")"
    warn "Source theme telah dipasang. Mengemas kini tanpa menimpa backup asal."
fi

log "Menyalin komponen Pahri Luxury 3D..."
copy_files "$SOURCE_DIR" "$PANEL_DIR"

log "Membina frontend production dengan Node $(node -v) dan Yarn $(yarn --version)..."
build_panel

PANEL_OWNER="$(stat -c '%U:%G' "$PANEL_DIR/artisan")"
chown -R "$PANEL_OWNER" "$PANEL_DIR/public/assets"
for relative in "${FILES[@]}"; do
    chown "$PANEL_OWNER" "$PANEL_DIR/$relative"
done

COMPLETED=1
trap - ERR
ok "Pahri Luxury 3D source theme berjaya dibina dan diaktifkan."
printf 'Backup asal: %s\n' "$ORIGINAL_BACKUP"
