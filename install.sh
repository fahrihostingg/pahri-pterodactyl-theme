#!/usr/bin/env bash
set -Eeuo pipefail

THEME_REPO="${PAHRI_THEME_REPO:-fahrihostingg/pahri-pterodactyl-theme}"
THEME_REF="${PAHRI_THEME_REF:-main}"
ARCHIVE_URL="${PAHRI_THEME_ARCHIVE_URL:-https://codeload.github.com/${THEME_REPO}/tar.gz/${THEME_REF}}"
PANEL_DIR="${PANEL_DIR:-/var/www/pterodactyl}"
SELF_DIR=""
if [[ -n "${BASH_SOURCE[0]:-}" ]]; then SELF_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" 2>/dev/null && pwd || true)"; fi
TEMP_DIR=""

log(){ printf '\033[1;36m[PAHRI GITHUB]\033[0m %s\n' "$*"; }
ok(){ printf '\033[1;32m[OK]\033[0m %s\n' "$*"; }
warn(){ printf '\033[1;33m[WARN]\033[0m %s\n' "$*"; }
die(){ printf '\033[1;31m[ERROR]\033[0m %s\n' "$*" >&2; exit 1; }
cleanup(){ [[ -z "$TEMP_DIR" ]] || rm -rf "$TEMP_DIR"; }
trap cleanup EXIT

run_local_installer(){
    local root="$1"
    [[ -f "$root/scripts/install-local.sh" ]] || die "scripts/install-local.sh tidak dijumpai."
    [[ -f "$root/scripts/install-v2.sh" ]] || die "scripts/install-v2.sh tidak dijumpai."
    [[ -d "$root/files" ]] || die "Folder files tidak dijumpai dalam pakej tema."
    [[ -f "$root/files/app/Http/Controllers/Pahri/StoreController.php" ]] || die "StoreController tidak dijumpai."
    [[ -f "$root/files/resources/views/pahri/store.blade.php" ]] || die "Store view tidak dijumpai."
    [[ -f "$root/files/public/themes/pahri/thema-new.js" ]] || die "Runtime Pahri Thema New tidak dijumpai."

    if [[ "${PAHRI_CLEAN_INSTALL:-0}" == "1" ]]; then
        warn "Clean install aktif: membuang state Pahri lama dan memasang tema baru tanpa guna backup lama."
        rm -f "$PANEL_DIR/.pahri-theme-backup" "$PANEL_DIR/.pahri-source-backup"
        rm -rf "$PANEL_DIR/public/themes/pahri"
        rm -rf "$PANEL_DIR/storage/framework/views"/* 2>/dev/null || true
    fi

    bash "$root/scripts/install-local.sh"
    bash "$root/scripts/install-v2.sh"

    if [[ "${PAHRI_ENABLE_SOURCE_BUILD:-0}" == "1" ]]; then
        [[ -f "$root/scripts/install-source.sh" && -d "$root/source" ]] || die "Source build diminta tetapi source/install-source tiada."
        bash "$root/scripts/install-source.sh"
    else
        warn "Source React build dilangkau. Tema penuh/store/owner dipasang melalui Laravel Blade + CSS + JS runtime."
    fi

    local version="6.7.0"
    [[ -f "$root/VERSION" ]] && version="$(tr -d '[:space:]' < "$root/VERSION")"
    printf '\n'
    ok "Pahri Thema New ${version} berjaya dipasang."
    printf 'Root Store:      /\n'
    printf 'Checkout:        /checkout\n'
    printf 'Order status:    /order/{id}\n'
    printf 'Owner Center:    /owner  (user ID 1 sahaja)\n'
    printf 'Dashboard:       /dashboard\n'
    printf 'Login:           /auth/login\n'
    printf 'Admin Studio:    /admin/settings/appearance\n'
}

if [[ -n "$SELF_DIR" && -f "$SELF_DIR/scripts/install-local.sh" && -d "$SELF_DIR/files" ]]; then run_local_installer "$SELF_DIR"; exit $?; fi
[[ "$THEME_REPO" =~ ^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$ ]] || die "PAHRI_THEME_REPO tidak sah. Gunakan format owner/repository."
[[ "$THEME_REF" =~ ^[A-Za-z0-9._/-]+$ ]] || die "PAHRI_THEME_REF tidak sah."
command -v tar >/dev/null 2>&1 || die "Perintah tar diperlukan."
TEMP_DIR="$(mktemp -d -t pahri-theme.XXXXXX)"
mkdir -p "$TEMP_DIR/source"
ARCHIVE_FILE="$TEMP_DIR/theme.tar.gz"
log "Memuat turun ${THEME_REPO}@${THEME_REF} daripada GitHub..."
if command -v curl >/dev/null 2>&1; then curl --fail --location --silent --show-error --retry 3 --retry-delay 2 --connect-timeout 15 "$ARCHIVE_URL" --output "$ARCHIVE_FILE"; elif command -v wget >/dev/null 2>&1; then wget --quiet --tries=3 --timeout=30 "$ARCHIVE_URL" -O "$ARCHIVE_FILE"; else die "curl atau wget diperlukan."; fi
[[ -s "$ARCHIVE_FILE" ]] || die "Arkib GitHub kosong atau gagal dimuat turun."
tar -xzf "$ARCHIVE_FILE" -C "$TEMP_DIR/source"
SOURCE_DIR="$(find "$TEMP_DIR/source" -mindepth 1 -maxdepth 1 -type d -print -quit)"
[[ -n "$SOURCE_DIR" ]] || die "Struktur arkib GitHub tidak sah."
run_local_installer "$SOURCE_DIR"
