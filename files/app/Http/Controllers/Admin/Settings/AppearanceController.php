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
            'preset' => ['required', 'in:obsidian,aurora,imperial,emerald,royal,neon,ice,custom'],
            'accent' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'accent_secondary' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'surface_opacity' => ['required', 'integer', 'between:55,95'],
            'blur' => ['required', 'integer', 'between:8,40'],
            'radius' => ['required', 'integer', 'between:12,34'],
            'motion' => ['required', 'integer', 'between:50,180'],
            'animation' => ['nullable', 'boolean'],
            'particles' => ['nullable', 'boolean'],
            'status_label' => ['required', 'string', 'max:36'],
            'logo' => ['nullable', 'file', 'mimetypes:image/png,image/jpeg,image/webp', 'max:4096'],
            'wallpaper' => ['nullable', 'file', 'mimetypes:image/png,image/jpeg,image/webp', 'max:12288'],

            'broadcast_active' => ['nullable', 'boolean'],
            'broadcast_title' => ['nullable', 'string', 'max:120'],
            'broadcast_message' => ['nullable', 'string', 'max:1200'],
            'broadcast_type' => ['required', 'in:info,success,warning,danger'],
            'broadcast_mode' => ['required', 'in:banner,modal'],
            'broadcast_audience' => ['required', 'in:all,admins,clients'],
            'broadcast_dismissible' => ['nullable', 'boolean'],
            'broadcast_starts_at' => ['nullable', 'date'],
            'broadcast_ends_at' => ['nullable', 'date', 'after:broadcast_starts_at'],
            'broadcast_button_text' => ['nullable', 'string', 'max:40'],
            'broadcast_button_url' => ['nullable', 'string', 'max:500', 'regex:/^(https?:\/\/|\/)[^\s]+$/'],

            'dock_active' => ['nullable', 'boolean'],
            'dock_support_label' => ['nullable', 'string', 'max:32'],
            'dock_support_url' => ['nullable', 'string', 'max:500', 'regex:/^(https?:\/\/|\/)[^\s]+$/'],
            'dock_spotlight_title' => ['nullable', 'string', 'max:80'],
            'dock_spotlight_message' => ['nullable', 'string', 'max:220'],

            'maintenance_enabled' => ['nullable', 'boolean'],
            'maintenance_badge' => ['nullable', 'string', 'max:40'],
            'maintenance_title' => ['nullable', 'string', 'max:120'],
            'maintenance_message' => ['nullable', 'string', 'max:1000'],

            'quick_link_label_1' => ['nullable', 'string', 'max:40'],
            'quick_link_url_1' => ['nullable', 'string', 'max:500', 'regex:/^(https?:\/\/|\/)[^\s]+$/'],
            'quick_link_label_2' => ['nullable', 'string', 'max:40'],
            'quick_link_url_2' => ['nullable', 'string', 'max:500', 'regex:/^(https?:\/\/|\/)[^\s]+$/'],
            'quick_link_label_3' => ['nullable', 'string', 'max:40'],
            'quick_link_url_3' => ['nullable', 'string', 'max:500', 'regex:/^(https?:\/\/|\/)[^\s]+$/'],
        ]);

        $settings = array_merge($this->defaults(), $this->readSettings(), [
            'theme_name' => 'Pahri Thema New',
            'theme_version' => '6.1.0',
            'preset' => $validated['preset'],
            'accent' => strtolower($validated['accent']),
            'accent_secondary' => strtolower($validated['accent_secondary']),
            'surface_opacity' => (int) $validated['surface_opacity'],
            'blur' => (int) $validated['blur'],
            'radius' => (int) $validated['radius'],
            'motion' => (int) $validated['motion'],
            'animation' => $request->boolean('animation'),
            'particles' => $request->boolean('particles'),
            'status_label' => trim($validated['status_label']),
            'broadcast' => [
                'active' => $request->boolean('broadcast_active'),
                'title' => trim((string) ($validated['broadcast_title'] ?? '')),
                'message' => trim((string) ($validated['broadcast_message'] ?? '')),
                'type' => $validated['broadcast_type'],
                'mode' => $validated['broadcast_mode'],
                'audience' => $validated['broadcast_audience'],
                'dismissible' => $request->boolean('broadcast_dismissible'),
                'starts_at' => $validated['broadcast_starts_at'] ?? null,
                'ends_at' => $validated['broadcast_ends_at'] ?? null,
                'button_text' => trim((string) ($validated['broadcast_button_text'] ?? '')),
                'button_url' => trim((string) ($validated['broadcast_button_url'] ?? '')),
                'revision' => hash('sha256', implode('|', [
                    (string) ($validated['broadcast_title'] ?? ''),
                    (string) ($validated['broadcast_message'] ?? ''),
                    $validated['broadcast_type'],
                    $validated['broadcast_mode'],
                    $validated['broadcast_audience'],
                    (string) ($validated['broadcast_starts_at'] ?? ''),
                    (string) ($validated['broadcast_ends_at'] ?? ''),
                ])),
            ],
            'dock' => [
                'active' => $request->boolean('dock_active'),
                'support_label' => trim((string) ($validated['dock_support_label'] ?? 'Support')),
                'support_url' => trim((string) ($validated['dock_support_url'] ?? '/account')),
                'spotlight_title' => trim((string) ($validated['dock_spotlight_title'] ?? 'Nexus Dock Active')),
                'spotlight_message' => trim((string) ($validated['dock_spotlight_message'] ?? 'Quick actions, live time, support and custom links are ready.')),
            ],
            'maintenance' => [
                'enabled' => $request->boolean('maintenance_enabled'),
                'badge' => trim((string) ($validated['maintenance_badge'] ?? 'Maintenance Mode')),
                'title' => trim((string) ($validated['maintenance_title'] ?? 'Panel sedang maintenance')),
                'message' => trim((string) ($validated['maintenance_message'] ?? 'Panel sedang dikemas kini oleh admin. Sila cuba semula sebentar lagi.')),
            ],
            'quick_links' => $this->quickLinks($validated),
            'updated_at' => now()->toIso8601String(),
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

        $this->alert->success('Pahri Thema New 6.1 berjaya dikemas kini. Maintenance Mode, Broadcast Center dan Visual Lab telah digunakan.')->flash();

        return redirect()->route('admin.settings.appearance');
    }

    private function defaults(): array
    {
        return [
            'theme_name' => 'Pahri Thema New',
            'theme_version' => '6.1.0',
            'preset' => 'obsidian',
            'accent' => '#a855f7',
            'accent_secondary' => '#22d3ee',
            'surface_opacity' => 78,
            'blur' => 26,
            'radius' => 24,
            'motion' => 100,
            'animation' => true,
            'particles' => true,
            'status_label' => 'NEXUS ONLINE',
            'logo' => '/themes/pahri/default-logo.svg',
            'wallpaper' => '/themes/pahri/default-wallpaper.svg',
            'broadcast' => [
                'active' => false,
                'title' => '',
                'message' => '',
                'type' => 'info',
                'mode' => 'banner',
                'audience' => 'all',
                'dismissible' => true,
                'starts_at' => null,
                'ends_at' => null,
                'button_text' => '',
                'button_url' => '',
                'revision' => 'initial',
            ],
            'dock' => [
                'active' => false,
                'support_label' => 'Support',
                'support_url' => '/account',
                'spotlight_title' => 'Nexus Dock Active',
                'spotlight_message' => 'Quick actions, live time, support and custom links are ready from one floating dock.',
            ],
            'maintenance' => [
                'enabled' => false,
                'badge' => 'Maintenance Mode',
                'title' => 'Panel sedang maintenance',
                'message' => 'Panel sedang dikemas kini oleh admin. Sila cuba semula sebentar lagi.',
            ],
            'quick_links' => [],
            'updated_at' => null,
        ];
    }

    private function readSettings(): array
    {
        $path = $this->themePath('settings.json');

        if (!File::exists($path)) {
            return $this->defaults();
        }

        $decoded = json_decode((string) File::get($path), true);

        if (!is_array($decoded)) {
            return $this->defaults();
        }

        $defaults = $this->defaults();
        $settings = array_merge($defaults, $decoded);
        $settings['broadcast'] = array_merge($defaults['broadcast'], is_array($decoded['broadcast'] ?? null) ? $decoded['broadcast'] : []);
        $settings['dock'] = array_merge($defaults['dock'], is_array($decoded['dock'] ?? null) ? $decoded['dock'] : []);
        $settings['maintenance'] = array_merge($defaults['maintenance'], is_array($decoded['maintenance'] ?? null) ? $decoded['maintenance'] : []);
        $settings['quick_links'] = is_array($decoded['quick_links'] ?? null) ? $decoded['quick_links'] : [];

        return $settings;
    }

    private function quickLinks(array $validated): array
    {
        $links = [];

        for ($index = 1; $index <= 3; $index++) {
            $label = trim((string) ($validated['quick_link_label_' . $index] ?? ''));
            $url = trim((string) ($validated['quick_link_url_' . $index] ?? ''));

            if ($label !== '' && $url !== '') {
                $links[] = ['label' => $label, 'url' => $url];
            }
        }

        return $links;
    }

    private function writeSettings(array $settings): void
    {
        $path = $this->themePath('settings.json');
        $temporary = $path . '.tmp';
        $json = json_encode($settings, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);

        File::put($temporary, $json . PHP_EOL, true);

        if (!@rename($temporary, $path)) {
            @unlink($temporary);
            throw new RuntimeException('Tidak dapat menyimpan settings.json untuk Pahri Thema New. Semak permission folder public/themes/pahri.');
        }
    }

    private function writeCustomCss(array $settings): void
    {
        $accent = $settings['accent'];
        $secondary = $settings['accent_secondary'];
        $logo = $this->cssUrl($settings['logo']);
        $wallpaper = $this->cssUrl($settings['wallpaper']);
        $playState = $settings['animation'] ? 'running' : 'paused';
        $particleDisplay = $settings['particles'] ? 'block' : 'none';
        $opacity = number_format(((int) $settings['surface_opacity']) / 100, 2, '.', '');
        $blur = (int) $settings['blur'];
        $radius = (int) $settings['radius'];
        $motion = max(50, min(180, (int) $settings['motion']));
        $motionDuration = number_format(max(8, min(30, 18 / ($motion / 100))), 2, '.', '');

        $css = <<<CSS
:root {
    --pahri-accent: {$accent};
    --pahri-accent-secondary: {$secondary};
    --pahri-logo: url("{$logo}");
    --pahri-wallpaper: url("{$wallpaper}");
    --pahri-animation-state: {$playState};
    --pahri-particles-display: {$particleDisplay};
    --pahri-glass-opacity: {$opacity};
    --pahri-blur: {$blur}px;
    --pahri-radius: {$radius}px;
    --pahri-motion-duration: {$motionDuration}s;
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
