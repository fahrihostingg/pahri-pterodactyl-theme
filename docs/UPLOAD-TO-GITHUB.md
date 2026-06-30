# Upload Pahri Theme ke GitHub

## Kaedah web GitHub

1. Login GitHub menggunakan akaun `fahrihostingg`.
2. Tekan **New repository**.
3. Nama repo: `pahri-pterodactyl-theme`.
4. Pilih **Public**.
5. Jangan tandakan pilihan tambah README, license atau `.gitignore`.
6. Tekan **Create repository**.
7. Extract fail ZIP yang diberikan.
8. Pada repo baru, tekan **uploading an existing file**.
9. Drag semua fail dan folder daripada pakej ke ruangan upload.
10. Commit ke branch `main`.

Pastikan struktur repo bermula seperti ini:

```text
.github/
docs/
files/
scripts/
install.sh
uninstall.sh
update.sh
patcher.py
README.md
VERSION
theme.json
```

## Kaedah Git pada komputer

```bash
git init
git branch -M main
git remote add origin https://github.com/fahrihostingg/pahri-pterodactyl-theme.git
git add .
git commit -m "Initial release Pahri Elegant Theme"
git push -u origin main
```

## Uji URL raw

Selepas push, buka atau jalankan:

```bash
curl -I https://raw.githubusercontent.com/fahrihostingg/pahri-pterodactyl-theme/main/install.sh
```

Status sepatutnya `200 OK`.

## Install pada VPS

```bash
curl -fsSL https://raw.githubusercontent.com/fahrihostingg/pahri-pterodactyl-theme/main/install.sh | sudo bash
```

## Buat release

Workflow GitHub akan membina ZIP release secara automatik apabila tag `v*` dipush:

```bash
git tag v1.0.0
git push origin v1.0.0
```
