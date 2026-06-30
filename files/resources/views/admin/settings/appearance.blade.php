@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'appearance'])

@section('title')
    Pahri Aurelia
@endsection

@section('content-header')
    <h1>Pahri Aurelia<small>Luxury visual engine untuk keseluruhan panel.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.settings') }}">Settings</a></li>
        <li class="active">Pahri Aurelia</li>
    </ol>
@endsection

@section('content')
    @yield('settings::nav')

    <form action="{{ route('admin.settings.appearance.update') }}" method="POST" enctype="multipart/form-data">
        @csrf
        @method('PATCH')

        <div class="row">
            <div class="col-md-8">
                <div class="box box-primary pahri-settings-box">
                    <div class="box-header with-border">
                        <h3 class="box-title"><i class="fa fa-diamond"></i> Aurelia Visual Engine</h3>
                    </div>

                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-6">
                                <label for="pahri-logo"><i class="fa fa-image"></i> Logo Panel</label>
                                <input id="pahri-logo" type="file" name="logo" class="form-control" accept="image/png,image/jpeg,image/webp">
                                <p class="help-block">PNG, JPG atau WEBP. Maksimum 4 MB. Gunakan logo transparan untuk hasil terbaik.</p>
                            </div>

                            <div class="form-group col-md-6">
                                <label for="pahri-wallpaper"><i class="fa fa-picture-o"></i> Wallpaper Cinematic</label>
                                <input id="pahri-wallpaper" type="file" name="wallpaper" class="form-control" accept="image/png,image/jpeg,image/webp">
                                <p class="help-block">PNG, JPG atau WEBP. Maksimum 12 MB. Cadangan sekurang-kurangnya 1920 × 1080 px.</p>
                            </div>
                        </div>

                        <hr style="border-color: rgba(255,255,255,.08);">

                        <div class="row">
                            <div class="form-group col-sm-6">
                                <label for="pahri-accent">Aurora Utama</label>
                                <input id="pahri-accent" type="color" name="accent" class="form-control pahri-color-input" value="{{ old('accent', $settings['accent']) }}" required>
                            </div>
                            <div class="form-group col-sm-6">
                                <label for="pahri-accent-secondary">Aurora Kedua</label>
                                <input id="pahri-accent-secondary" type="color" name="accent_secondary" class="form-control pahri-color-input" value="{{ old('accent_secondary', $settings['accent_secondary']) }}" required>
                            </div>
                        </div>

                        <div class="row">
                            <div class="form-group col-sm-6">
                                <label for="pahri-opacity">Glass Opacity <span class="pull-right text-muted" data-value-for="pahri-opacity">{{ old('surface_opacity', $settings['surface_opacity']) }}%</span></label>
                                <input id="pahri-opacity" type="range" name="surface_opacity" class="form-control" min="55" max="95" value="{{ old('surface_opacity', $settings['surface_opacity']) }}" required>
                                <p class="help-block">Lebih rendah nampak lebih transparent, lebih tinggi nampak lebih solid.</p>
                            </div>
                            <div class="form-group col-sm-6">
                                <label for="pahri-blur">Glass Blur <span class="pull-right text-muted" data-value-for="pahri-blur">{{ old('blur', $settings['blur']) }}px</span></label>
                                <input id="pahri-blur" type="range" name="blur" class="form-control" min="8" max="40" value="{{ old('blur', $settings['blur']) }}" required>
                                <p class="help-block">Mengawal kekuatan blur pada navbar, kad dan modal.</p>
                            </div>
                        </div>

                        <div class="row">
                            <div class="form-group col-sm-6">
                                <label for="pahri-radius">Corner Radius <span class="pull-right text-muted" data-value-for="pahri-radius">{{ old('radius', $settings['radius']) }}px</span></label>
                                <input id="pahri-radius" type="range" name="radius" class="form-control" min="12" max="34" value="{{ old('radius', $settings['radius']) }}" required>
                                <p class="help-block">Mengawal bentuk sudut untuk keseluruhan UI.</p>
                            </div>
                            <div class="form-group col-sm-6">
                                <label for="pahri-motion">Motion Intensity <span class="pull-right text-muted" data-value-for="pahri-motion">{{ old('motion', $settings['motion']) }}%</span></label>
                                <input id="pahri-motion" type="range" name="motion" class="form-control" min="50" max="180" value="{{ old('motion', $settings['motion']) }}" required>
                                <p class="help-block">50% perlahan dan tenang, 180% lebih aktif dan futuristik.</p>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-sm-6">
                                <div class="checkbox">
                                    <label>
                                        <input type="hidden" name="animation" value="0">
                                        <input type="checkbox" name="animation" value="1" @checked(old('animation', $settings['animation']))>
                                        Aktifkan animasi aurora, 3D dan glow
                                    </label>
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="checkbox">
                                    <label>
                                        <input type="hidden" name="particles" value="0">
                                        <input type="checkbox" name="particles" value="1" @checked(old('particles', $settings['particles']))>
                                        Aktifkan star particles dan ambient dust
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="box-footer">
                        <span class="text-muted"><i class="fa fa-bolt"></i> Perubahan digunakan selepas simpan dan refresh panel.</span>
                        <button type="submit" class="btn btn-primary pull-right">
                            <i class="fa fa-magic"></i> Apply Aurelia Theme
                        </button>
                    </div>
                </div>
            </div>

            <div class="col-md-4">
                <div class="box pahri-preview-box">
                    <div class="box-header with-border">
                        <h3 class="box-title"><i class="fa fa-eye"></i> Live Visual Preview</h3>
                    </div>
                    <div class="box-body">
                        <div class="pahri-admin-preview" style="background-image: radial-gradient(circle at 20% 10%, {{ $settings['accent'] }}66, transparent 36%), radial-gradient(circle at 90% 80%, {{ $settings['accent_secondary'] }}55, transparent 38%), linear-gradient(rgba(3, 7, 18, .45), rgba(3, 7, 18, .9)), url('{{ $settings['wallpaper'] }}?v={{ @filemtime(public_path(ltrim($settings['wallpaper'], '/'))) ?: 1 }}'); border-radius: {{ $settings['radius'] }}px; backdrop-filter: blur({{ $settings['blur'] }}px);">
                            <div style="position:absolute;inset:18px;border:1px solid rgba(255,255,255,.12);border-radius:18px;transform:perspective(500px) rotateX(4deg) rotateY(-5deg);background:rgba(5,9,23,.{{ min(95, max(55, $settings['surface_opacity'])) }});box-shadow:0 30px 70px rgba(0,0,0,.42), inset 0 1px rgba(255,255,255,.08);"></div>
                            <img src="{{ $settings['logo'] }}?v={{ @filemtime(public_path(ltrim($settings['logo'], '/'))) ?: 1 }}" alt="Pahri logo preview" style="position:relative;z-index:2;">
                            <strong style="position:relative;z-index:2;">Pahri Aurelia</strong>
                            <span style="position:relative;z-index:2;">Luxury 3D Control Environment</span>
                            <small style="position:relative;z-index:2;">Version 4.0 • by Pahri</small>
                        </div>
                    </div>
                </div>

                <div class="callout callout-info">
                    <h4><i class="fa fa-shield"></i> Safe Visual Engine</h4>
                    <p>Tetapan disimpan dalam <code>public/themes/pahri/settings.json</code>. Tiada password, API key atau data pengguna disimpan oleh tema.</p>
                </div>

                <div class="callout callout-success">
                    <h4><i class="fa fa-keyboard-o"></i> Command Palette</h4>
                    <p>Selepas update, tekan <code>Ctrl + K</code> pada client panel untuk membuka navigasi pantas.</p>
                </div>
            </div>
        </div>
    </form>

    <script>
        document.querySelectorAll('input[type="range"]').forEach(function (input) {
            var output = document.querySelector('[data-value-for="' + input.id + '"]');
            if (!output) return;
            var suffix = input.id === 'pahri-opacity' || input.id === 'pahri-motion' ? '%' : 'px';
            input.addEventListener('input', function () { output.textContent = input.value + suffix; });
        });
    </script>
@endsection
