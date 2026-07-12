# Pahri Thema New 6.0

Tema source-level premium untuk **Pterodactyl Panel v1.14.x**. Versi 6.0 menukar pengalaman panel kepada Nexus Spatial OS dengan visual estetik, glassmorphism, aurora, animasi 3D, Broadcast Center, Nexus Command Engine dan floating Nexus Dock.

## Ciri utama

- Login cinematic dengan orbital rings, aurora dan objek 3D.
- Cursor light, volumetric grid, grain dan star particles.
- Navbar adaptive gaya spatial operating system.
- Nexus Command Engine melalui `Ctrl + K`.
- Floating Nexus Dock bawah panel dengan Home, Servers, Account, Admin dan Quick Links.
- Support action bubble yang URL dan label boleh dikawal dari Admin.
- Spotlight information card untuk mesej pendek di client panel.
- Dashboard executive dengan live clock, timezone, role, security dan jumlah server.
- Kad server holografik yang condong mengikut cursor.
- Live CPU, RAM, disk, allocation dan resource progress bars.
- Semua console, files, database, backup, network dan settings menggunakan shell Nexus.
- Admin panel full reskin: header, sidebar, cards, tables, forms dan modals.
- Checkbox Admin jelas: OFF putih kosong, ON hijau dengan tanda ✓.
- Responsive untuk desktop, tablet dan telefon.
- Tiada library WebGL berat.

## Broadcast Center

Admin boleh menghantar pengumuman global tanpa migration database.

- Aktif atau matikan dari Admin.
- Floating banner atau cinematic modal.
- Audience: semua pengguna, root admin sahaja atau client sahaja.
- Jadual mula dan tamat.
- Info, success, warning atau critical.
- CTA button dengan link dalaman atau luar.
- Pilihan pengguna boleh tutup atau wajib kekal.
- Dismiss disimpan mengikut revision broadcast.

## Nexus Dock Studio

Dalam tab **Quick Links & Status**, Admin boleh kawal:

- Floating Nexus Dock ON/OFF.
- Support Bubble label.
- Support Bubble URL.
- Spotlight title.
- Spotlight message.
- Quick Links yang terus muncul dalam dock dan `Ctrl + K`.

## Visual Lab

Buka:

```text
Admin Panel → Settings → Pahri Thema New
```

Admin boleh mengubah:

- Logo panel.
- Wallpaper cinematic.
- Visual preset: Obsidian, Aurora, Imperial, Emerald, Royal, Neon, Ice atau Custom.
- Warna utama dan kedua.
- Glass opacity.
- Glass blur.
- Corner radius seluruh UI.
- Motion intensity.
- Animasi aurora dan 3D.
- Star particles.
- Navbar status label.
- Broadcast Center.
- Quick Links.
- Nexus Dock Studio.

## Install atau update

```bash
curl -fsSL https://raw.githubusercontent.com/fahrihostingg/pahri-pterodactyl-theme/main/install.sh | bash
```

Installer menjalankan tiga peringkat:

1. Memasang Visual Lab, Broadcast Center, Quick Links dan Nexus Dock Studio.
2. Memasang full reskin Blade dan admin shell.
3. Mengganti komponen React dan menjalankan `yarn build:production`.

Output akhir berjaya:

```text
[OK] Pahri Thema New full reskin aktif.
[OK] Pahri Thema New 6.0 berjaya dibina dan diaktifkan.
[OK] Pahri Thema New 6.0.0 berjaya dipasang sepenuhnya.
```

## Selepas update

```bash
cd /var/www/pterodactyl
php artisan optimize:clear
php artisan view:clear
```

Kemudian tekan `Ctrl + Shift + R`. Jika menggunakan Cloudflare Proxy, purge cache domain panel selepas production build selesai.

## Uninstall dan rollback penuh

```bash
curl -fsSL https://raw.githubusercontent.com/fahrihostingg/pahri-pterodactyl-theme/main/uninstall.sh | sudo bash
```

Rollback akan memulihkan source asal, membuang `PahriBroadcast.tsx` dan `PahriNexusDock.tsx`, build semula frontend asal, memulihkan Blade, route dan controller asal, serta membersihkan cache Laravel.
