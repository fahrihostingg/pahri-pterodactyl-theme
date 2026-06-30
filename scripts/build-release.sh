#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="$(tr -d '[:space:]' < "$ROOT_DIR/VERSION")"
[[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+([.-][A-Za-z0-9.-]+)?$ ]] || {
    echo "VERSION tidak sah: $VERSION" >&2
    exit 1
}

NAME="pahri-pterodactyl-theme-v${VERSION}"
DIST_DIR="$ROOT_DIR/dist"
STAGE_DIR="$(mktemp -d -t pahri-release.XXXXXX)"
trap 'rm -rf "$STAGE_DIR"' EXIT

command -v zip >/dev/null 2>&1 || { echo "zip diperlukan." >&2; exit 1; }
command -v sha256sum >/dev/null 2>&1 || { echo "sha256sum diperlukan." >&2; exit 1; }

rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR" "$STAGE_DIR/$NAME"

(
    cd "$ROOT_DIR"
    find . -mindepth 1 -maxdepth 1 \
        ! -name '.git' \
        ! -name 'dist' \
        -exec cp -a {} "$STAGE_DIR/$NAME/" \;
)

find "$STAGE_DIR/$NAME" -type d -name '__pycache__' -prune -exec rm -rf {} +
find "$STAGE_DIR/$NAME" -type f -name '*.pyc' -delete

(
    cd "$STAGE_DIR"
    zip -qr "$DIST_DIR/$NAME.zip" "$NAME"
)

(
    cd "$DIST_DIR"
    sha256sum "$NAME.zip" > "$NAME.zip.sha256"
)

printf 'Release dibina:\n%s\n%s\n' \
    "$DIST_DIR/$NAME.zip" \
    "$DIST_DIR/$NAME.zip.sha256"
