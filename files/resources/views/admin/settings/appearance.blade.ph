@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'appearance'])

@section('title')
    Pahri Theme
@endsection

@section('content-header')
    <h1>Pahri Theme<small>Edit logo, wallpaper, warna dan animasi panel.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.settings') }}">Settings</a></li>
        <li class="active">Pahri Theme</li>
    </ol>
@endsection

@section('content')
    @yield('settings::nav')

    <form action="{{ route('admin.settings.appearance.update') }}" method="POST" enctype="multipart/form-data">
        @csrf
        @method('PATCH')

        <div class="row">
            <div class="col-md-7">
                <div class="box box-primary pahri-settings-box">
                    <div class="box-header with-border">
                        <h3 class="box-title"><i class="fa fa-paint-brush"></i> Appearance Editor</h3>
                    </div>

                    <div class="box-body">
                        <div class="form-group">
                            <label for="pahri-logo">Logo Panel</label>
                            <input id="pahri-logo" type="file" name="logo" class="form-control" accept="image/png,image/jpeg,image/webp">
                            <p class="help-block">PNG, JPG atau WEBP. Maksimum 4 MB. Cadangan: 512 × 512 px dengan latar transparan.</p>
                        </div>

                        <div class="form-group">
                            <label for="pahri-wallpaper">Wallpaper Panel</label>
                            <input id="pahri-wallpaper" type="file" name="wallpaper" class="form-control" accept="image/png,image/jpeg,image/webp">
                            <p class="help-block">PNG, JPG atau WEBP. Maksimum 12 MB. Cadangan: 1920 × 1080 px atau lebih besar.</p>
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

                        <div class="checkbox">
                            <label>
                                <input type="hidden" name="animation" value="0">
                                <input type="checkbox" name="animation" value="1" @checked(old('animation', $settings['animation']))>
                                Aktifkan animasi ambient dan glow
                            </label>
                        </div>
                    </div>

                    <div class="box-footer">
                        <button type="submit" class="btn btn-primary pull-right">
                            <i class="fa fa-save"></i> Simpan Pahri Theme
                        </button>
                    </div>
                </div>
            </div>

            <div class="col-md-5">
                <div class="box pahri-preview-box">
                    <div class="box-header with-border">
                        <h3 class="box-title"><i class="fa fa-eye"></i> Preview Semasa</h3>
                    </div>
                    <div class="box-body">
                        <div class="pahri-admin-preview" style="background-image: linear-gradient(rgba(3, 7, 18, .52), rgba(3, 7, 18, .88)), url('{{ $settings['wallpaper'] }}?v={{ @filemtime(public_path(ltrim($settings['wallpaper'], '/'))) ?: 1 }}');">
                            <img src="{{ $settings['logo'] }}?v={{ @filemtime(public_path(ltrim($settings['logo'], '/'))) ?: 1 }}" alt="Pahri logo preview">
                            <strong>{{ config('app.name', 'Pterodactyl') }}</strong>
                            <span>Elegant Control Panel</span>
                            <small>by Pahri</small>
                        </div>
                    </div>
                </div>

                <div class="callout callout-info">
                    <h4><i class="fa fa-shield"></i> Selamat untuk update</h4>
                    <p>Fail gambar disimpan dalam <code>public/themes/pahri/uploads</code>. Tiada API key atau password disimpan oleh tema.</p>
                </div>
            </div>
        </div>
    </form>
@endsection
