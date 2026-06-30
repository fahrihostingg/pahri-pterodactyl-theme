# Pahri Aurelia 4.0

Tema source-level premium untuk **Pterodactyl Panel v1.14.x**. Aurelia menggantikan paparan asal pada login, dashboard, navigation, server cards, page shell, server tabs dan admin panel dengan UI spatial, glassmorphism, aurora dan animasi 3D.

## Ciri Aurelia 4.0

- Login cinematic split-layout dengan orbital rings dan objek 3D.
- Aurora berlapis, cursor light, volumetric grid, grain dan star particles.
- Navbar adaptive gaya operating system.
- Command Palette melalui `Ctrl + K` untuk navigasi dan quick actions.
- Dashboard executive control room dengan live clock, timezone, role, security dan total instance.
- Interactive holographic server cards yang condong mengikut cursor.
- Live CPU, RAM, disk, allocation dan resource progress bars.
- Semua console, files, database, backup, network dan settings menggunakan Aurelia workspace.
- Admin panel menggunakan Aurelia header, sidebar, tables, cards, controls dan modals.
- Branding asal pada paparan diganti dengan Pahri Aurelia.
- Responsive untuk desktop, tablet dan telefon.
- Tidak menggunakan library WebGL atau 3D berat.

## Aurelia Visual Engine

Buka:

```text
Admin Panel → Settings → Pahri Theme
```

Admin boleh mengubah:

- Logo panel.
- Wallpaper cinematic.
- Warna aurora utama dan kedua.
- Glass opacity.
- Glass blur.
- Corner radius seluruh UI.
- Motion intensity.
- Animasi aurora dan 3D.
- Star particles dan ambient dust.

## Keperluan

- Pterodactyl Panel v1.14.x.
- Struktur yang diuji: v1.14.1.
- PHP 8.2 atau lebih baharu.
- Python 3.
- Ubuntu atau Debian untuk auto-install Node.js.
- Sekurang-kurangnya 4 GB RAM disyorkan untuk production build.

Installer akan memasang Node.js 24 dan Yarn Classic secara automatik apabila belum tersedia.

## Install atau update

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

1. Memasang Aurelia Visual Engine dan editor admin.
2. Memasang full reskin untuk admin dan Blade shell.
3. Mengganti komponen React dan menjalankan `yarn build:production`.

Output berjaya:

```text
[OK] Pahri Elegant Theme berjaya dipasang.
[OK] Pahri Nova full reskin aktif.
[OK] Pahri Luxury 3D source theme berjaya dibina dan diaktifkan.
```

Arahan install yang sama berfungsi sebagai update. Backup source asal tidak ditimpa.

## Selepas update

```bash
cd /var/www/pterodactyl
php artisan optimize:clear
```

Kemudian lakukan hard refresh:

```text
Ctrl + Shift + R
```

Jika menggunakan Cloudflare Proxy, purge cache domain panel selepas production build selesai.

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

## Keserasian dan keselamatan

- TypeScript diperiksa terhadap source rasmi Pterodactyl v1.14.1.
- Frontend production dibina dengan Node.js 24.
- Tiada password, API key atau data pengguna disimpan oleh tema.
- Installer membuat backup dan memulihkan source sebelumnya jika build gagal.

## Nota sebelum update Pterodactyl

Uninstall tema terlebih dahulu, update Pterodactyl, kemudian pasang versi Aurelia yang telah disahkan serasi dengan versi panel baharu.
