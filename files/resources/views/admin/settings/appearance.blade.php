@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'appearance'])

@php
    $broadcast = $settings['broadcast'] ?? [];
    $quickLinks = array_values($settings['quick_links'] ?? []);
    $startsAt = !empty($broadcast['starts_at']) ? \Carbon\Carbon::parse($broadcast['starts_at'])->format('Y-m-d\TH:i') : '';
    $endsAt = !empty($broadcast['ends_at']) ? \Carbon\Carbon::parse($broadcast['ends_at'])->format('Y-m-d\TH:i') : '';
    $animationEnabled = (bool) old('animation', $settings['animation'] ?? true);
    $particlesEnabled = (bool) old('particles', $settings['particles'] ?? true);
    $broadcastEnabled = (bool) old('broadcast_active', $broadcast['active'] ?? false);
    $dismissibleEnabled = (bool) old('broadcast_dismissible', $broadcast['dismissible'] ?? true);
@endphp

@section('title')
    Pahri Thema New
@endsection

@section('content-header')
    <h1>Pahri Thema New<small>Visual OS, Broadcast Center dan Nexus control engine.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.settings') }}">Settings</a></li>
        <li class="active">Pahri Thema New</li>
    </ol>
@endsection

@section('content')
    @yield('settings::nav')

    <form action="{{ route('admin.settings.appearance.update') }}" method="POST" enctype="multipart/form-data">
        @csrf
        @method('PATCH')

        <div class="row">
            <div class="col-md-8">
                <div class="nav-tabs-custom">
                    <ul class="nav nav-tabs">
                        <li class="active"><a href="#pahri-visual" data-toggle="tab"><i class="fa fa-diamond"></i> Visual Lab</a></li>
                        <li><a href="#pahri-broadcast" data-toggle="tab"><i class="fa fa-bullhorn"></i> Broadcast Center</a></li>
                        <li><a href="#pahri-links" data-toggle="tab"><i class="fa fa-bolt"></i> Quick Links & Status</a></li>
                    </ul>

                    <div class="tab-content">
                        <div class="tab-pane active" id="pahri-visual">
                            <div class="row">
                                <div class="form-group col-md-6">
                                    <label for="pahri-logo"><i class="fa fa-image"></i> Logo Panel</label>
                                    <input id="pahri-logo" type="file" name="logo" class="form-control" accept="image/png,image/jpeg,image/webp">
                                    <p class="help-block">PNG, JPG atau WEBP. Maksimum 4 MB. Logo transparan memberi hasil terbaik.</p>
                                </div>

                                <div class="form-group col-md-6">
                                    <label for="pahri-wallpaper"><i class="fa fa-picture-o"></i> Wallpaper Cinematic</label>
                                    <input id="pahri-wallpaper" type="file" name="wallpaper" class="form-control" accept="image/png,image/jpeg,image/webp">
                                    <p class="help-block">PNG, JPG atau WEBP. Maksimum 12 MB. Cadangan 1920 × 1080 atau lebih besar.</p>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="pahri-preset">Visual Preset</label>
                                <select id="pahri-preset" name="preset" class="form-control" required>
                                    <option value="obsidian" @selected(old('preset', $settings['preset']) === 'obsidian')>Obsidian Nexus — ungu/cyan gelap</option>
                                    <option value="aurora" @selected(old('preset', $settings['preset']) === 'aurora')>Aurora Prism — biru/pink elektrik</option>
                                    <option value="imperial" @selected(old('preset', $settings['preset']) === 'imperial')>Imperial Gold — emas/merah premium</option>
                                    <option value="emerald" @selected(old('preset', $settings['preset']) === 'emerald')>Emerald Matrix — hijau/teal futuristik</option>
                                    <option value="custom" @selected(old('preset', $settings['preset']) === 'custom')>Custom — warna manual</option>
                                </select>
                            </div>

                            <div class="row">
                                <div class="form-group col-sm-6">
                                    <label for="pahri-accent">Warna Utama</label>
                                    <input id="pahri-accent" type="color" name="accent" class="form-control pahri-color-input" value="{{ old('accent', $settings['accent']) }}" required>
                                </div>
                                <div class="form-group col-sm-6">
                                    <label for="pahri-accent-secondary">Warna Kedua</label>
                                    <input id="pahri-accent-secondary" type="color" name="accent_secondary" class="form-control pahri-color-input" value="{{ old('accent_secondary', $settings['accent_secondary']) }}" required>
                                </div>
                            </div>

                            <div class="row">
                                <div class="form-group col-sm-6">
                                    <label for="pahri-opacity">Glass Opacity <span class="pull-right text-muted" data-value-for="pahri-opacity">{{ old('surface_opacity', $settings['surface_opacity']) }}%</span></label>
                                    <input id="pahri-opacity" type="range" name="surface_opacity" class="form-control" min="55" max="95" value="{{ old('surface_opacity', $settings['surface_opacity']) }}" required>
                                </div>
                                <div class="form-group col-sm-6">
                                    <label for="pahri-blur">Glass Blur <span class="pull-right text-muted" data-value-for="pahri-blur">{{ old('blur', $settings['blur']) }}px</span></label>
                                    <input id="pahri-blur" type="range" name="blur" class="form-control" min="8" max="40" value="{{ old('blur', $settings['blur']) }}" required>
                                </div>
                            </div>

                            <div class="row">
                                <div class="form-group col-sm-6">
                                    <label for="pahri-radius">Corner Radius <span class="pull-right text-muted" data-value-for="pahri-radius">{{ old('radius', $settings['radius']) }}px</span></label>
                                    <input id="pahri-radius" type="range" name="radius" class="form-control" min="12" max="34" value="{{ old('radius', $settings['radius']) }}" required>
                                </div>
                                <div class="form-group col-sm-6">
                                    <label for="pahri-motion">Motion Intensity <span class="pull-right text-muted" data-value-for="pahri-motion">{{ old('motion', $settings['motion']) }}%</span></label>
                                    <input id="pahri-motion" type="range" name="motion" class="form-control" min="50" max="180" value="{{ old('motion', $settings['motion']) }}" required>
                                </div>
                            </div>

                            <div class="row pahri-toggle-grid">
                                <div class="col-sm-6">
                                    <div class="pahri-toggle-control">
                                        <input type="hidden" name="animation" class="pahri-toggle-value" value="{{ $animationEnabled ? '1' : '0' }}">
                                        <button type="button" class="pahri-toggle-button {{ $animationEnabled ? 'is-active' : '' }}" aria-pressed="{{ $animationEnabled ? 'true' : 'false' }}">
                                            <span class="pahri-toggle-box"><i class="fa fa-check"></i></span>
                                            <span class="pahri-toggle-copy"><strong>Animasi Aurora & 3D</strong><small>Glow dan pergerakan visual <b class="pahri-toggle-state">{{ $animationEnabled ? 'ON' : 'OFF' }}</b></small></span>
                                        </button>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="pahri-toggle-control">
                                        <input type="hidden" name="particles" class="pahri-toggle-value" value="{{ $particlesEnabled ? '1' : '0' }}">
                                        <button type="button" class="pahri-toggle-button {{ $particlesEnabled ? 'is-active' : '' }}" aria-pressed="{{ $particlesEnabled ? 'true' : 'false' }}">
                                            <span class="pahri-toggle-box"><i class="fa fa-check"></i></span>
                                            <span class="pahri-toggle-copy"><strong>Star Particles</strong><small>Ambient dust dan bintang <b class="pahri-toggle-state">{{ $particlesEnabled ? 'ON' : 'OFF' }}</b></small></span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="tab-pane" id="pahri-broadcast">
                            <div class="callout callout-info">
                                <h4><i class="fa fa-bullhorn"></i> Global Broadcast</h4>
                                <p>Hantar pengumuman kepada semua pengguna, admin sahaja atau client sahaja.</p>
                            </div>

                            <div class="pahri-toggle-control pahri-toggle-wide">
                                <input type="hidden" name="broadcast_active" class="pahri-toggle-value" value="{{ $broadcastEnabled ? '1' : '0' }}">
                                <button type="button" class="pahri-toggle-button {{ $broadcastEnabled ? 'is-active' : '' }}" aria-pressed="{{ $broadcastEnabled ? 'true' : 'false' }}">
                                    <span class="pahri-toggle-box"><i class="fa fa-check"></i></span>
                                    <span class="pahri-toggle-copy"><strong>Aktifkan Broadcast</strong><small>Paparkan pengumuman kepada audience pilihan <b class="pahri-toggle-state">{{ $broadcastEnabled ? 'ON' : 'OFF' }}</b></small></span>
                                </button>
                            </div>

                            <div class="row">
                                <div class="form-group col-md-7">
                                    <label for="broadcast-title">Tajuk Broadcast</label>
                                    <input id="broadcast-title" type="text" name="broadcast_title" class="form-control" maxlength="120" value="{{ old('broadcast_title', $broadcast['title'] ?? '') }}" placeholder="Contoh: Maintenance Selesai">
                                </div>
                                <div class="form-group col-md-5">
                                    <label for="broadcast-type">Jenis</label>
                                    <select id="broadcast-type" name="broadcast_type" class="form-control" required>
                                        @foreach(['info' => 'Info', 'success' => 'Success', 'warning' => 'Warning', 'danger' => 'Critical'] as $value => $label)
                                            <option value="{{ $value }}" @selected(old('broadcast_type', $broadcast['type'] ?? 'info') === $value)>{{ $label }}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="broadcast-message">Mesej</label>
                                <textarea id="broadcast-message" name="broadcast_message" class="form-control" rows="5" maxlength="1200" placeholder="Tulis pengumuman untuk pengguna...">{{ old('broadcast_message', $broadcast['message'] ?? '') }}</textarea>
                            </div>

                            <div class="row">
                                <div class="form-group col-md-4">
                                    <label for="broadcast-mode">Paparan</label>
                                    <select id="broadcast-mode" name="broadcast_mode" class="form-control" required>
                                        <option value="banner" @selected(old('broadcast_mode', $broadcast['mode'] ?? 'banner') === 'banner')>Floating Banner</option>
                                        <option value="modal" @selected(old('broadcast_mode', $broadcast['mode'] ?? 'banner') === 'modal')>Cinematic Modal</option>
                                    </select>
                                </div>
                                <div class="form-group col-md-4">
                                    <label for="broadcast-audience">Audience</label>
                                    <select id="broadcast-audience" name="broadcast_audience" class="form-control" required>
                                        <option value="all" @selected(old('broadcast_audience', $broadcast['audience'] ?? 'all') === 'all')>Semua pengguna</option>
                                        <option value="admins" @selected(old('broadcast_audience', $broadcast['audience'] ?? 'all') === 'admins')>Root Admin sahaja</option>
                                        <option value="clients" @selected(old('broadcast_audience', $broadcast['audience'] ?? 'all') === 'clients')>Client sahaja</option>
                                    </select>
                                </div>
                                <div class="form-group col-md-4">
                                    <label>Dismiss Control</label>
                                    <div class="pahri-toggle-control pahri-toggle-compact">
                                        <input type="hidden" name="broadcast_dismissible" class="pahri-toggle-value" value="{{ $dismissibleEnabled ? '1' : '0' }}">
                                        <button type="button" class="pahri-toggle-button {{ $dismissibleEnabled ? 'is-active' : '' }}" aria-pressed="{{ $dismissibleEnabled ? 'true' : 'false' }}">
                                            <span class="pahri-toggle-box"><i class="fa fa-check"></i></span>
                                            <span class="pahri-toggle-copy"><strong>Boleh Ditutup</strong><small><b class="pahri-toggle-state">{{ $dismissibleEnabled ? 'ON' : 'OFF' }}</b></small></span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="form-group col-md-6">
                                    <label for="broadcast-starts">Mula Pada</label>
                                    <input id="broadcast-starts" type="datetime-local" name="broadcast_starts_at" class="form-control" value="{{ old('broadcast_starts_at', $startsAt) }}">
                                    <p class="help-block">Kosongkan untuk bermula serta-merta.</p>
                                </div>
                                <div class="form-group col-md-6">
                                    <label for="broadcast-ends">Tamat Pada</label>
                                    <input id="broadcast-ends" type="datetime-local" name="broadcast_ends_at" class="form-control" value="{{ old('broadcast_ends_at', $endsAt) }}">
                                    <p class="help-block">Kosongkan untuk tiada tarikh tamat.</p>
                                </div>
                            </div>

                            <div class="row">
                                <div class="form-group col-md-5">
                                    <label for="broadcast-button-text">Teks Butang CTA</label>
                                    <input id="broadcast-button-text" type="text" name="broadcast_button_text" class="form-control" maxlength="40" value="{{ old('broadcast_button_text', $broadcast['button_text'] ?? '') }}" placeholder="Contoh: Baca Selanjutnya">
                                </div>
                                <div class="form-group col-md-7">
                                    <label for="broadcast-button-url">URL Butang</label>
                                    <input id="broadcast-button-url" type="text" name="broadcast_button_url" class="form-control" maxlength="500" value="{{ old('broadcast_button_url', $broadcast['button_url'] ?? '') }}" placeholder="/account atau https://domain.com/info">
                                </div>
                            </div>
                        </div>

                        <div class="tab-pane" id="pahri-links">
                            <div class="form-group">
                                <label for="pahri-status-label">Navbar Status Label</label>
                                <input id="pahri-status-label" type="text" name="status_label" class="form-control" maxlength="36" value="{{ old('status_label', $settings['status_label']) }}" required>
                                <p class="help-block">Contoh: NEXUS ONLINE, SYSTEM STABLE, PREMIUM NETWORK.</p>
                            </div>

                            <div class="callout callout-success">
                                <h4><i class="fa fa-keyboard-o"></i> Quick Links dalam Ctrl + K</h4>
                                <p>Tambah sehingga tiga pautan khas untuk Nexus Command Engine.</p>
                            </div>

                            @for($index = 0; $index < 3; $index++)
                                <div class="row">
                                    <div class="form-group col-md-5">
                                        <label>Quick Link {{ $index + 1 }} — Label</label>
                                        <input type="text" name="quick_link_label_{{ $index + 1 }}" class="form-control" maxlength="40" value="{{ old('quick_link_label_' . ($index + 1), $quickLinks[$index]['label'] ?? '') }}" placeholder="Contoh: Support WhatsApp">
                                    </div>
                                    <div class="form-group col-md-7">
                                        <label>Quick Link {{ $index + 1 }} — URL</label>
                                        <input type="text" name="quick_link_url_{{ $index + 1 }}" class="form-control" maxlength="500" value="{{ old('quick_link_url_' . ($index + 1), $quickLinks[$index]['url'] ?? '') }}" placeholder="https://... atau /account">
                                    </div>
                                </div>
                            @endfor
                        </div>
                    </div>

                    <div class="box-footer">
                        <span class="text-muted"><i class="fa fa-shield"></i> Setiap fitur menggunakan satu toggle sahaja.</span>
                        <button type="submit" class="btn btn-primary pull-right"><i class="fa fa-magic"></i> Apply Pahri Thema New</button>
                    </div>
                </div>
            </div>

            <div class="col-md-4">
                <div class="box pahri-preview-box">
                    <div class="box-header with-border"><h3 class="box-title"><i class="fa fa-eye"></i> Spatial Preview</h3></div>
                    <div class="box-body">
                        <div id="pahri-live-preview" class="pahri-admin-preview" style="background-image: radial-gradient(circle at 20% 10%, {{ $settings['accent'] }}66, transparent 36%), radial-gradient(circle at 90% 80%, {{ $settings['accent_secondary'] }}55, transparent 38%), linear-gradient(rgba(3, 7, 18, .45), rgba(3, 7, 18, .9)), url('{{ $settings['wallpaper'] }}?v={{ @filemtime(public_path(ltrim($settings['wallpaper'], '/'))) ?: 1 }}'); border-radius: {{ $settings['radius'] }}px; backdrop-filter: blur({{ $settings['blur'] }}px);">
                            <div class="pahri-preview-grid"></div>
                            <img src="{{ $settings['logo'] }}?v={{ @filemtime(public_path(ltrim($settings['logo'], '/'))) ?: 1 }}" alt="Pahri logo preview" style="position:relative;z-index:2;">
                            <strong style="position:relative;z-index:2;">Pahri Thema New</strong>
                            <span style="position:relative;z-index:2;">Nexus Spatial Operating Theme</span>
                            <small style="position:relative;z-index:2;">Version 6.3.1 • by Pahri</small>
                        </div>
                    </div>
                </div>

                <div class="box">
                    <div class="box-header with-border"><h3 class="box-title"><i class="fa fa-cubes"></i> Engine Modules</h3></div>
                    <div class="box-body">
                        <ul class="list-unstyled" style="line-height:2;">
                            <li><i class="fa fa-check text-green"></i> Single-button toggles</li>
                            <li><i class="fa fa-check text-green"></i> Broadcast Center</li>
                            <li><i class="fa fa-check text-green"></i> Maintenance Guard</li>
                            <li><i class="fa fa-check text-green"></i> Fake Hacking Theme</li>
                            <li><i class="fa fa-check text-green"></i> Nexus Dock Studio</li>
                            <li><i class="fa fa-check text-green"></i> Runtime status & quick links</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </form>

    <style>
        .pahri-preview-grid{position:absolute;inset:0;opacity:.18;background-image:linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px);background-size:28px 28px;mask-image:linear-gradient(to bottom,#000,transparent)}
        .nav-tabs-custom>.tab-content{background:transparent!important;padding:20px}
        .pahri-toggle-grid{margin-top:6px}
        .pahri-toggle-control{width:100%;margin:10px 0}
        .pahri-toggle-value{display:none!important}
        .pahri-toggle-button{width:100%;min-height:66px;padding:11px 13px;display:flex;align-items:center;gap:12px;border:1px solid rgba(255,255,255,.12);border-radius:16px;color:#f8fafc;background:rgba(2,6,23,.62);box-shadow:inset 0 1px rgba(255,255,255,.045),0 13px 32px rgba(0,0,0,.24);text-align:left;cursor:pointer;transition:.2s ease}
        .pahri-toggle-button:hover{border-color:rgba(255,255,255,.25);transform:translateY(-1px);box-shadow:inset 0 1px rgba(255,255,255,.06),0 18px 42px rgba(0,0,0,.3)}
        .pahri-toggle-box{width:28px;height:28px;flex:0 0 28px;display:flex;align-items:center;justify-content:center;border:2px solid #fff;border-radius:9px;color:transparent;background:transparent;box-shadow:0 7px 18px rgba(0,0,0,.3);transition:.2s ease}
        .pahri-toggle-box i{font-size:15px;opacity:0;transform:scale(.5);transition:.18s ease}
        .pahri-toggle-copy{min-width:0;display:flex;flex-direction:column}
        .pahri-toggle-copy strong{font-size:12px;font-weight:850;color:#fff}
        .pahri-toggle-copy small{margin-top:4px;color:rgba(226,232,240,.48);font-size:9px;line-height:1.35}
        .pahri-toggle-state{margin-left:5px;color:#fff;font-weight:900;letter-spacing:.08em}
        .pahri-toggle-button.is-active{border-color:rgba(34,197,94,.42);background:linear-gradient(135deg,rgba(34,197,94,.14),rgba(5,9,23,.72));box-shadow:0 0 0 3px rgba(34,197,94,.08),0 16px 40px rgba(34,197,94,.13),inset 0 1px rgba(255,255,255,.06)}
        .pahri-toggle-button.is-active .pahri-toggle-box{border-color:#22c55e;background:#22c55e;color:#fff;box-shadow:0 0 0 3px rgba(34,197,94,.16),0 8px 24px rgba(34,197,94,.34)}
        .pahri-toggle-button.is-active .pahri-toggle-box i{opacity:1;transform:scale(1)}
        .pahri-toggle-button.is-active .pahri-toggle-state{color:#86efac}
        .pahri-toggle-compact .pahri-toggle-button{min-height:44px;padding:7px 10px}
        .pahri-toggle-compact .pahri-toggle-box{width:24px;height:24px;flex-basis:24px;border-radius:7px}
        .pahri-toggle-wide{max-width:520px;margin-bottom:20px}
    </style>

    <script>
        (function () {
            var presets = {
                obsidian: ['#a855f7', '#22d3ee'],
                aurora: ['#2563eb', '#ec4899'],
                imperial: ['#f59e0b', '#ef4444'],
                emerald: ['#10b981', '#14b8a6']
            };
            var preset = document.getElementById('pahri-preset');
            var accent = document.getElementById('pahri-accent');
            var secondary = document.getElementById('pahri-accent-secondary');
            var preview = document.getElementById('pahri-live-preview');

            function updatePreview() {
                if (!preview) return;
                preview.style.borderRadius = document.getElementById('pahri-radius').value + 'px';
                preview.style.backdropFilter = 'blur(' + document.getElementById('pahri-blur').value + 'px)';
                preview.style.boxShadow = '0 30px 80px rgba(0,0,0,.45),0 0 50px ' + accent.value + '33,inset 0 1px rgba(255,255,255,.08)';
            }

            document.addEventListener('click', function (event) {
                var button = event.target.closest ? event.target.closest('.pahri-toggle-button') : null;
                if (!button) return;
                event.preventDefault();
                var control = button.closest('.pahri-toggle-control');
                var input = control ? control.querySelector('.pahri-toggle-value') : null;
                var state = button.querySelector('.pahri-toggle-state');
                var active = button.getAttribute('aria-pressed') !== 'true';
                button.setAttribute('aria-pressed', active ? 'true' : 'false');
                button.classList.toggle('is-active', active);
                if (input) input.value = active ? '1' : '0';
                if (state) state.textContent = active ? 'ON' : 'OFF';
            });

            if (preset) preset.addEventListener('change', function () {
                if (presets[preset.value]) {
                    accent.value = presets[preset.value][0];
                    secondary.value = presets[preset.value][1];
                    updatePreview();
                }
            });

            [accent, secondary].forEach(function (input) {
                if (input) input.addEventListener('input', function () {
                    if (preset) preset.value = 'custom';
                    updatePreview();
                });
            });

            document.querySelectorAll('input[type="range"]').forEach(function (input) {
                var output = document.querySelector('[data-value-for="' + input.id + '"]');
                var suffix = input.id === 'pahri-opacity' || input.id === 'pahri-motion' ? '%' : 'px';
                input.addEventListener('input', function () {
                    if (output) output.textContent = input.value + suffix;
                    updatePreview();
                });
            });
        })();
    </script>
@endsection
