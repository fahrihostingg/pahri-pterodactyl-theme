# Pahri Luxury 3D Theme

Tema source-level untuk **Pterodactyl Panel v1.14.x**. Versi 3.0.0 mengganti UI asal pada login, dashboard, navigation, server cards, page shell, server tabs dan admin panel dengan reka bentuk mewah, glassmorphism dan animasi 3D.

## Apa yang berubah

- Login split-layout premium dengan scene 3D bergerak.
- Navbar client Pahri yang dibina terus dalam React.
- Dashboard luxury dengan hero 3D dan live server collection.
- Kad server baharu dengan status, CPU, RAM, disk dan allocation.
- Semua halaman server menggunakan workspace dan sub-navigation Pahri.
- Admin panel diubah kepada header, sidebar, card, table dan control gaya mewah.
- Branding dan footer asal pada paparan diganti dengan Pahri Panel.
- Logo, wallpaper, warna dan animasi masih boleh diedit melalui admin.
- Backup Blade, controller, aset dan source React dibuat sebelum pemasangan.
- Installer membina frontend production menggunakan Node.js 22 atau 24.
- Auto-restore source sebelumnya jika production build gagal.
- Uninstall memulihkan source asal dan membina semula frontend asal.

## Keperluan

- Pterodactyl Panel v1.14.x.
- Struktur yang diuji: v1.14.1.
- PHP 8.2 atau lebih baharu.
- Python 3.
- Node.js 22 atau 24.
- Yarn Classic. Installer cuba menyediakannya melalui Corepack jika belum tersedia.
- Sekurang-kurangnya 4 GB RAM disyorkan untuk production build.

## Install daripada GitHub

```bash
curl -fsSL https://raw.githubusercontent.com/fahrihostingg/pahri-pterodactyl-theme/main/install.sh | sudo bash
```

Jika sudah login sebagai root:

```bash
curl -fsSL https://raw.githubusercontent.com/fahrihostingg/pahri-pterodactyl-theme/main/install.sh | bash
```

Lokasi panel selain `/var/www/pterodactyl`:

```bash
curl -fsSL https://raw.githubusercontent.com/fahrihostingg/pahri-pterodactyl-theme/main/install.sh \
  | sudo env PANEL_DIR=/lokasi/panel bash
```

Installer menjalankan tiga peringkat:

1. Memasang editor logo, wallpaper dan warna.
2. Memasang full reskin untuk admin dan Blade shell.
3. Mengganti komponen React dan menjalankan `yarn build:production`.

Output berjaya akan mengandungi:

```text
[OK] Pahri Elegant Theme berjaya dipasang.
[OK] Pahri Nova full reskin aktif.
[OK] Pahri Luxury 3D source theme berjaya dibina dan diaktifkan.
```

## Editor tema

```text
Admin Panel → Settings → Pahri Theme
```

URL:

```text
https://domain-panel.com/admin/settings/appearance
```

Admin boleh menukar:

- Logo panel.
- Wallpaper.
- Warna utama.
- Warna kedua.
- Animasi ambient.

## Update

Jalankan semula arahan install:

```bash
curl -fsSL https://raw.githubusercontent.com/fahrihostingg/pahri-pterodactyl-theme/main/install.sh | sudo bash
```

Backup source asal tidak ditimpa semasa update.

## Uninstall dan rollback penuh

```bash
curl -fsSL https://raw.githubusercontent.com/fahrihostingg/pahri-pterodactyl-theme/main/uninstall.sh | sudo bash
```

Rollback akan:

- Memulihkan komponen React asal.
- Menjalankan production build asal.
- Memulihkan Blade, route dan controller asal.
- Membuang aset Pahri.
- Membersihkan cache Laravel.

## Backup

Backup Blade dan tema:

```text
/var/www/pterodactyl/.pahri-theme-backups/
```

Backup source React asal:

```text
/var/www/pterodactyl/.pahri-source-backups/
```

## Jika paparan lama masih dicache

```bash
cd /var/www/pterodactyl
php artisan optimize:clear
```

Kemudian lakukan hard refresh pada browser:

```text
Ctrl + Shift + R
```

Jika menggunakan Cloudflare Proxy, purge cache domain panel selepas production build selesai.

## Nota sebelum update Pterodactyl

Uninstall tema terlebih dahulu, update Pterodactyl, kemudian pasang versi tema yang telah disahkan serasi dengan versi panel baharu.
