<?php

namespace Pterodactyl\Http\Controllers\Admin\Settings;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\File;
use Illuminate\View\View;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;
use RuntimeException;

class AppearanceController extends Controller
{
    private const THEME_DIRECTORY = 'themes/pahri';

    public function __construct(private AlertsMessageBag $alert)
    {
    }

    public function index(): View
    {
        return view('admin.settings.appearance', [
            'settings' => $this->readSettings(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'accent' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'accent_secondary' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'animation' => ['nullable', 'boolean'],
            'logo' => ['nullable', 'file', 'mimetypes:image/png,image/jpeg,image/webp', 'max:4096'],
            'wallpaper' => ['nullable', 'file', 'mimetypes:image/png,image/jpeg,image/webp', 'max:12288'],
        ]);

        $settings = array_merge($this->defaults(), $this->readSettings(), [
            'accent' => strtolower($validated['accent']),
            'accent_secondary' => strtolower($validated['accent_secondary']),
            'animation' => $request->boolean('animation'),
        ]);

        File::ensureDirectoryExists($this->themePath('uploads'), 0755, true);

        if ($request->hasFile('logo')) {
            $settings['logo'] = $this->storeImage($request->file('logo'), 'logo', $settings['logo'] ?? null);
        }

        if ($request->hasFile('wallpaper')) {
            $settings['wallpaper'] = $this->storeImage($request->file('wallpaper'), 'wallpaper', $settings['wallpaper'] ?? null);
        }

        $this->writeSettings($settings);
        $this->writeCustomCss($settings);

        $this->alert->success('Pahri Theme berjaya dikemas kini. Logo dan wallpaper baharu telah digunakan.')->flash();

        return redirect()->route('admin.settings.appearance');
    }

    private function defaults(): array
    {
        return [
            'accent' => '#8b5cf6',
            'accent_secondary' => '#06b6d4',
            'animation' => true,
            'logo' => '/themes/pahri/default-logo.svg',
            'wallpaper' => '/themes/pahri/default-wallpaper.svg',
        ];
    }

    private function readSettings(): array
    {
        $path = $this->themePath('settings.json');

        if (!File::exists($path)) {
            return $this->defaults();
        }

        $decoded = json_decode((string) File::get($path), true);

        return is_array($decoded) ? array_merge($this->defaults(), $decoded) : $this->defaults();
    }

    private function writeSettings(array $settings): void
    {
        $path = $this->themePath('settings.json');
        $temporary = $path . '.tmp';
        $json = json_encode($settings, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);

        File::put($temporary, $json . PHP_EOL, true);

        if (!@rename($temporary, $path)) {
            @unlink($temporary);
            throw new RuntimeException('Tidak dapat menyimpan settings.json untuk Pahri Theme. Semak permission folder public/themes/pahri.');
        }
    }

    private function writeCustomCss(array $settings): void
    {
        $accent = $settings['accent'];
        $secondary = $settings['accent_secondary'];
        $logo = $this->cssUrl($settings['logo']);
        $wallpaper = $this->cssUrl($settings['wallpaper']);
        $playState = $settings['animation'] ? 'running' : 'paused';

        $css = <<<CSS
:root {
    --pahri-accent: {$accent};
    --pahri-accent-secondary: {$secondary};
    --pahri-logo: url("{$logo}");
    --pahri-wallpaper: url("{$wallpaper}");
    --pahri-animation-state: {$playState};
}
CSS;

        File::put($this->themePath('custom.css'), $css . PHP_EOL, true);
    }

    private function storeImage($file, string $prefix, ?string $previousPath): string
    {
        $mime = (string) $file->getMimeType();
        $extensions = [
            'image/png' => 'png',
            'image/jpeg' => 'jpg',
            'image/webp' => 'webp',
        ];

        if (!isset($extensions[$mime])) {
            throw new RuntimeException('Format gambar tidak disokong. Gunakan PNG, JPG, atau WEBP.');
        }

        $name = sprintf('%s-%s.%s', $prefix, bin2hex(random_bytes(8)), $extensions[$mime]);
        $destination = $this->themePath('uploads');
        $file->move($destination, $name);

        $this->deletePreviousUpload($previousPath);

        return '/themes/pahri/uploads/' . $name;
    }

    private function deletePreviousUpload(?string $path): void
    {
        if (!$path || !str_starts_with($path, '/themes/pahri/uploads/')) {
            return;
        }

        $filename = basename($path);
        $fullPath = $this->themePath('uploads/' . $filename);

        if (File::exists($fullPath)) {
            File::delete($fullPath);
        }
    }

    private function cssUrl(string $path): string
    {
        return str_replace(['\\', '"', "\n", "\r"], ['/', '\\"', '', ''], $path);
    }

    private function themePath(string $path = ''): string
    {
        return public_path(self::THEME_DIRECTORY . ($path !== '' ? '/' . ltrim($path, '/') : ''));
    }
}
