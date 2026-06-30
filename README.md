# Pahri Elegant Theme

Tema custom untuk **Pterodactyl Panel v1.14.x** dengan UI elegant, glassmorphism, animasi, wallpaper, logo custom dan watermark **by Pahri**.

## Fungsi utama

- Tema gelap elegant untuk client dan admin panel.
- Animasi ambient, glow dan glass effect.
- Watermark `by Pahri`.
- Butang **Pahri Theme** pada admin panel.
- Upload logo dan wallpaper daripada admin.
- Edit dua warna utama tema.
- Hidup atau matikan animasi.
- Backup automatik sebelum patch.
- Pemasangan semula tidak menggandakan route, butang atau CSS.
- Rollback daripada backup asal.
- Tidak perlu upload pakej secara manual ke VPS.

## Repo GitHub yang disyorkan

Gunakan nama repo ini supaya arahan default terus berfungsi:

```text
fahrihostingg/pahri-pterodactyl-theme
```

Repo perlu **Public** untuk pemasangan menggunakan `curl` tanpa token GitHub.

## Cara upload ke GitHub

1. Buat repo baru bernama `pahri-pterodactyl-theme`.
2. Jangan tambah README atau `.gitignore` daripada GitHub kerana semuanya sudah disediakan.
3. Extract ZIP repo ini pada komputer.
4. Upload **semua kandungan di dalam folder**, bukan folder luarnya sahaja.
5. Pastikan `install.sh`, `uninstall.sh`, `scripts`, `files`, `.github` dan `patcher.py` berada di root repo.
6. Commit ke branch `main`.

Panduan lebih terperinci ada di [`docs/UPLOAD-TO-GITHUB.md`](docs/UPLOAD-TO-GITHUB.md).

## Install terus daripada GitHub

Jalankan pada VPS panel:

```bash
curl -fsSL https://raw.githubusercontent.com/fahrihostingg/pahri-pterodactyl-theme/main/install.sh | sudo bash
```

Lokasi panel selain `/var/www/pterodactyl`:

```bash
curl -fsSL https://raw.githubusercontent.com/fahrihostingg/pahri-pterodactyl-theme/main/install.sh \
  | sudo env PANEL_DIR=/lokasi/panel bash
```

Selepas berjaya:

```text
Admin Panel → Settings → Pahri Theme
```

URL terus:

```text
https://domain-panel.com/admin/settings/appearance
```

## Update tema

Arahan install yang sama juga berfungsi sebagai update:

```bash
curl -fsSL https://raw.githubusercontent.com/fahrihostingg/pahri-pterodactyl-theme/main/install.sh | sudo bash
```

Logo, wallpaper, warna dan tetapan semasa tidak dipadam ketika update.

## Uninstall dan rollback

```bash
curl -fsSL https://raw.githubusercontent.com/fahrihostingg/pahri-pterodactyl-theme/main/uninstall.sh | sudo bash
```

Panel custom path:

```bash
curl -fsSL https://raw.githubusercontent.com/fahrihostingg/pahri-pterodactyl-theme/main/uninstall.sh \
  | sudo env PANEL_DIR=/lokasi/panel bash
```

## Jika guna nama repo lain

Gantikan URL raw dan beritahu installer nama repo sebenar:

```bash
curl -fsSL https://raw.githubusercontent.com/OWNER/REPO/main/install.sh \
  | sudo env PAHRI_THEME_REPO=OWNER/REPO bash
```

## Pasang daripada tag tertentu

Contoh menggunakan tag `v1.0.0`:

```bash
curl -fsSL https://raw.githubusercontent.com/fahrihostingg/pahri-pterodactyl-theme/v1.0.0/install.sh \
  | sudo env PAHRI_THEME_REF=v1.0.0 bash
```

## Keserasian

- Sasaran: Pterodactyl Panel `v1.14.x`.
- Struktur diuji: `v1.14.1`.
- PHP minimum: `8.2`.
- Python 3 diperlukan untuk patch fail secara selamat.
- Panel yang sudah diubah oleh tema lain mungkin tidak sepadan. Installer akan berhenti sebelum patch ditulis jika anchor fail tidak ditemui.

## Fail yang dipatch

- `routes/admin.php`
- `resources/views/layouts/admin.blade.php`
- `resources/views/templates/wrapper.blade.php`
- `resources/views/partials/admin/settings/nav.blade.php`

Fail asal disimpan dalam:

```text
/var/www/pterodactyl/.pahri-theme-backups/
```

## Pemeriksaan selepas install

```bash
cd /var/www/pterodactyl
php artisan route:list --path=admin/settings/appearance
php artisan optimize:clear
```

Semak log Laravel:

```bash
tail -n 100 /var/www/pterodactyl/storage/logs/laravel-$(date +%F).log
```

## Nota penting sebelum update Pterodactyl

Buang tema terlebih dahulu, update panel, kemudian pasang semula hanya selepas versi tema disahkan serasi dengan versi panel baharu.
