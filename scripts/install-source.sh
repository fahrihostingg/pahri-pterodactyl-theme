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

REPLACE_FILES=(
    "resources/scripts/components/App.tsx"
    "resources/scripts/components/NavigationBar.tsx"
    "resources/scripts/components/auth/LoginContainer.tsx"
    "resources/scripts/components/auth/LoginFormContainer.tsx"
    "resources/scripts/components/dashboard/DashboardContainer.tsx"
    "resources/scripts/components/dashboard/ServerRow.tsx"
    "resources/scripts/components/elements/PageContentBlock.tsx"
    "resources/scripts/components/elements/SubNavigation.tsx"
    "resources/scripts/components/server/files/SelectFileCheckbox.tsx"
    "resources/scripts/routers/AuthenticationRouter.tsx"
)

EXTRA_FILES=(
    "resources/scripts/components/PahriBroadcast.tsx"
    "resources/scripts/components/PahriMaintenanceGate.tsx"
    "resources/scripts/components/PahriNexusDock.tsx"
)

ALL_FILES=("${REPLACE_FILES[@]}" "${EXTRA_FILES[@]}")

[[ $EUID -eq 0 ]] || die "Jalankan pemasang sebagai root."
[[ -f "$PANEL_DIR/artisan" ]] || die "Pterodactyl tidak dijumpai di $PANEL_DIR"
[[ -f "$PANEL_DIR/package.json" ]] || die "package.json panel tidak dijumpai."
[[ -f "$PANEL_DIR/yarn.lock" ]] || die "yarn.lock panel tidak dijumpai."

for relative in "${REPLACE_FILES[@]}"; do
    [[ -f "$PANEL_DIR/$relative" ]] || die "Source panel tiada: $relative"
done

for relative in "${ALL_FILES[@]}"; do
    [[ -f "$SOURCE_DIR/$relative" ]] || die "Source tema tiada: $relative"
done

ensure_node() {
    local current_major=0
    if command -v node >/dev/null 2>&1; then
        current_major="$(node -p "Number(process.versions.node.split('.')[0])" 2>/dev/null || echo 0)"
        if (( current_major >= 22 )); then
            log "Node.js sedia ada dikesan: $(node -v)"
            return
        fi
        warn "Node.js $(node -v) terlalu lama. Menaik taraf ke Node.js 24..."
    else
        log "Node.js belum dipasang. Memasang Node.js 24 secara automatik..."
    fi

    command -v apt-get >/dev/null 2>&1 || die "Auto-install Node.js hanya disokong pada Ubuntu/Debian. Pasang Node.js 22 atau 24 secara manual."
    export DEBIAN_FRONTEND=noninteractive
    apt-get update
    apt-get install -y ca-certificates curl gnupg

    local setup_file
    setup_file="$(mktemp -t nodesource-setup.XXXXXX.sh)"
    curl --fail --location --silent --show-error --retry 3 --retry-delay 2 --connect-timeout 20 https://deb.nodesource.com/setup_24.x --output "$setup_file"
    [[ -s "$setup_file" ]] || die "Skrip pemasangan NodeSource kosong."
    bash "$setup_file"
    rm -f "$setup_file"

    apt-get install -y nodejs
    hash -r
    command -v node >/dev/null 2>&1 || die "Node.js gagal dipasang."
    current_major="$(node -p "Number(process.versions.node.split('.')[0])")"
    (( current_major >= 22 )) || die "Versi Node.js selepas pemasangan masih tidak sesuai: $(node -v)"
    ok "Node.js $(node -v) berjaya dipasang."
}

ensure_yarn() {
    if command -v yarn >/dev/null 2>&1; then
        log "Yarn sedia ada dikesan: $(yarn --version)"
        return
    fi

    log "Menyediakan Yarn Classic 1.22.22..."
    if command -v corepack >/dev/null 2>&1; then
        corepack enable || true
        corepack prepare yarn@1.22.22 --activate || true
    fi
    if ! command -v yarn >/dev/null 2>&1; then
        command -v npm >/dev/null 2>&1 || die "npm tidak dijumpai selepas pemasangan Node.js."
        npm install --global yarn@1.22.22
        hash -r
    fi
    command -v yarn >/dev/null 2>&1 || die "Yarn gagal disediakan."
    ok "Yarn $(yarn --version) berjaya disediakan."
}

copy_theme_files() {
    local from="$1"
    local to="$2"
    for relative in "${ALL_FILES[@]}"; do
        [[ -f "$from/$relative" ]] || continue
        install -D -m 0644 "$from/$relative" "$to/$relative"
    done
}

backup_current_files() {
    local target="$1"
    mkdir -p "$target"
    for relative in "${REPLACE_FILES[@]}"; do
        install -D -m 0644 "$PANEL_DIR/$relative" "$target/$relative"
    done
    for relative in "${EXTRA_FILES[@]}"; do
        [[ -f "$PANEL_DIR/$relative" ]] && install -D -m 0644 "$PANEL_DIR/$relative" "$target/$relative"
    done
}

verify_theme_source() {
    grep -q "Pahri Thema New" "$PANEL_DIR/resources/scripts/components/auth/LoginFormContainer.tsx" \
        || die "Repair gagal: LoginFormContainer masih bukan Pahri Thema New."
    grep -q "PahriNexusDock" "$PANEL_DIR/resources/scripts/components/App.tsx" \
        || die "Repair gagal: App.tsx belum memuatkan Nexus Dock."
    grep -q "FileActionCheckbox" "$PANEL_DIR/resources/scripts/components/server/files/SelectFileCheckbox.tsx" \
        || die "Repair gagal: File manager checkbox belum lengkap."
    ok "Source React Pahri disahkan terpasang."
}

build_panel() {
    cd "$PANEL_DIR"
    export NODE_OPTIONS="${NODE_OPTIONS:-} --max_old_space_size=4096"
    yarn install --frozen-lockfile --network-timeout 600000
    rm -rf public/assets/*
    yarn build:production
    php artisan optimize:clear >/dev/null
}

restore_run_backup() {
    [[ -n "$RUN_BACKUP" && -d "$RUN_BACKUP" ]] || return 0
    warn "Build gagal. Memulihkan source sebelum pemasangan..."
    for relative in "${REPLACE_FILES[@]}"; do
        install -D -m 0644 "$RUN_BACKUP/$relative" "$PANEL_DIR/$relative"
    done
    for relative in "${EXTRA_FILES[@]}"; do
        [[ -f "$RUN_BACKUP/$relative" ]] && install -D -m 0644 "$RUN_BACKUP/$relative" "$PANEL_DIR/$relative" || rm -f "$PANEL_DIR/$relative"
    done
    (build_panel) || warn "Source dipulihkan tetapi rebuild asal gagal. Jalankan yarn build:production secara manual."
}

on_error() {
    local code=$?
    [[ $COMPLETED -eq 0 ]] && restore_run_backup
    exit "$code"
}
trap on_error ERR

ensure_node
ensure_yarn

RUN_BACKUP="$PANEL_DIR/.pahri-source-run-backups/$(date +%Y%m%d-%H%M%S)"
backup_current_files "$RUN_BACKUP"

if [[ ! -f "$STATE_FILE" ]]; then
    ORIGINAL_BACKUP="$PANEL_DIR/.pahri-source-backups/$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$ORIGINAL_BACKUP"
    for relative in "${REPLACE_FILES[@]}"; do
        install -D -m 0644 "$PANEL_DIR/$relative" "$ORIGINAL_BACKUP/$relative"
    done
    printf '%s\n' "$ORIGINAL_BACKUP" > "$STATE_FILE"
    log "Backup source asal: $ORIGINAL_BACKUP"
else
    ORIGINAL_BACKUP="$(head -n 1 "$STATE_FILE")"
    warn "Source theme telah dipasang. Mengemas kini tanpa menimpa backup asal."
fi

log "Repair penuh: menyalin semula semua komponen Pahri Thema New..."
copy_theme_files "$SOURCE_DIR" "$PANEL_DIR"
verify_theme_source

log "Membina frontend production bersih dengan Node $(node -v) dan Yarn $(yarn --version)..."
build_panel

PANEL_OWNER="$(stat -c '%U:%G' "$PANEL_DIR/artisan")"
chown -R "$PANEL_OWNER" "$PANEL_DIR/public/assets"
for relative in "${ALL_FILES[@]}"; do
    chown "$PANEL_OWNER" "$PANEL_DIR/$relative"
done

COMPLETED=1
trap - ERR
ok "Pahri Thema New repair/full source berjaya dibina dan diaktifkan."
printf 'Backup asal: %s\n' "$ORIGINAL_BACKUP"
