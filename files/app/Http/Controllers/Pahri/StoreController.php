<?php

namespace Pterodactyl\Http\Controllers\Pahri;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\View\View;
use Pterodactyl\Http\Controllers\Controller;
use Throwable;

class StoreController extends Controller
{
    private const OWNER_USER_ID = 1;

    public function index(): View
    {
        return view('pahri.store', [
            'store' => $this->storeConfig(),
            'features' => $this->featureHub(),
        ]);
    }

    public function checkout(Request $request): View|RedirectResponse
    {
        $validated = $request->validate([
            'plan' => ['required', 'string', 'max:80'],
            'buyer_name' => ['required', 'string', 'max:80'],
            'buyer_email' => ['required', 'email', 'max:160'],
            'buyer_whatsapp' => ['nullable', 'string', 'max:40'],
        ]);

        $store = $this->storeConfig();
        $plan = $this->findPlan($store, $validated['plan']);
        if (!$plan) return redirect('/')->with('pahri_error', 'Plan tidak dijumpai.');

        $order = [
            'id' => 'PHR-' . strtoupper(Str::random(9)),
            'plan_id' => $plan['id'],
            'plan_name' => $plan['name'],
            'ram_gb' => (int) $plan['ram_gb'],
            'amount' => (int) $plan['price'],
            'currency' => $store['currency'] ?? 'IDR',
            'status' => 'pending_payment',
            'buyer' => [
                'name' => $validated['buyer_name'],
                'email' => $validated['buyer_email'],
                'whatsapp' => $validated['buyer_whatsapp'] ?? '',
            ],
            'panel_account' => null,
            'payment' => $this->createQrisPayment([
                'id' => 'pending',
                'plan_name' => $plan['name'],
                'ram_gb' => (int) $plan['ram_gb'],
                'amount' => (int) $plan['price'],
                'currency' => $store['currency'] ?? 'IDR',
                'buyer' => $validated,
            ], $store),
            'created_at' => now()->toIso8601String(),
            'updated_at' => now()->toIso8601String(),
        ];
        $order['payment']['order_id'] = $order['id'];
        $this->saveOrder($order);

        return view('pahri.checkout', ['store' => $store, 'order' => $order]);
    }

    public function order(string $id): View
    {
        $order = $this->getOrder($id);
        abort_unless($order, 404);
        return view('pahri.checkout', ['store' => $this->storeConfig(), 'order' => $order]);
    }

    public function saveAccount(Request $request, string $id): RedirectResponse
    {
        $validated = $request->validate([
            'panel_username' => ['required', 'string', 'min:3', 'max:32', 'regex:/^[a-zA-Z0-9_.-]+$/'],
            'panel_email' => ['required', 'email', 'max:160'],
        ]);
        $order = $this->getOrder($id);
        abort_unless($order, 404);
        $order['panel_account'] = [
            'username' => $validated['panel_username'],
            'email' => $validated['panel_email'],
            'password_method' => 'owner_create_or_reset_link',
            'saved_at' => now()->toIso8601String(),
        ];
        $order['status'] = 'pending_provision';
        $order['updated_at'] = now()->toIso8601String();
        $this->saveOrder($order);
        return redirect('/order/' . urlencode($id))->with('pahri_success', 'Maklumat akaun dihantar. Owner akan aktifkan panel dan password/reset link.');
    }

    public function owner(Request $request): View
    {
        abort_unless((int) ($request->user()?->id ?? 0) === self::OWNER_USER_ID, 403);
        return view('pahri.owner', [
            'store' => $this->storeConfig(),
            'secrets' => $this->secretStatus(),
            'orders' => array_values(array_reverse($this->orders())),
            'features' => $this->featureHub(),
        ]);
    }

    public function updateOwner(Request $request): RedirectResponse
    {
        abort_unless((int) ($request->user()?->id ?? 0) === self::OWNER_USER_ID, 403);
        $validated = $request->validate([
            'store_name' => ['required', 'string', 'max:80'],
            'tagline' => ['nullable', 'string', 'max:160'],
            'currency' => ['required', 'in:IDR,MYR,USD'],
            'whatsapp' => ['nullable', 'string', 'max:40'],
            'qris_endpoint' => ['required', 'url', 'max:500'],
            'qris_merchant_id' => ['nullable', 'string', 'max:120'],
            'qris_api_key' => ['nullable', 'string', 'max:2000'],
            'qris_clear_key' => ['nullable', 'boolean'],
            'plan_name.*' => ['required', 'string', 'max:80'],
            'plan_ram.*' => ['required', 'integer', 'min:1', 'max:128'],
            'plan_price.*' => ['required', 'integer', 'min:0', 'max:999999999'],
            'plan_desc.*' => ['nullable', 'string', 'max:220'],
        ]);
        $plans = [];
        foreach ($validated['plan_name'] as $index => $name) {
            $plans[] = [
                'id' => Str::slug($name . '-' . ($validated['plan_ram'][$index] ?? 1) . 'gb'),
                'name' => $name,
                'ram_gb' => (int) $validated['plan_ram'][$index],
                'price' => (int) $validated['plan_price'][$index],
                'description' => trim((string) ($validated['plan_desc'][$index] ?? '')),
            ];
        }
        $store = array_merge($this->defaultStore(), $this->storeConfig(), [
            'enabled' => true,
            'store_name' => $validated['store_name'],
            'tagline' => trim((string) ($validated['tagline'] ?? '')),
            'currency' => $validated['currency'],
            'whatsapp' => trim((string) ($validated['whatsapp'] ?? '')),
            'qris_provider' => 'qris.zakki.store',
            'qris_endpoint' => $validated['qris_endpoint'],
            'qris_merchant_id' => trim((string) ($validated['qris_merchant_id'] ?? '')),
            'qris_status' => 'owner_configured',
            'plans' => array_slice($plans, 0, 12),
            'updated_at' => now()->toIso8601String(),
        ]);
        $this->writeStore($store);
        $this->writeSecrets($validated);
        return redirect('/owner')->with('pahri_success', 'Store, plan dan QRIS berjaya dikemas kini.');
    }

    private function createQrisPayment(array $order, array $store): array
    {
        $secrets = $this->secrets();
        $endpoint = trim((string) ($secrets['qris_endpoint'] ?? $store['qris_endpoint'] ?? ''));
        $apiKey = trim((string) ($secrets['qris_api_key'] ?? ''));
        $payment = ['provider' => 'qris.zakki.store', 'status' => 'not_configured', 'reference' => null, 'qr_string' => null, 'qr_image' => null, 'payment_url' => null, 'raw' => null, 'error' => null];
        if ($endpoint === '' || $apiKey === '') {
            $payment['error'] = 'Owner belum set QRIS API key.';
            return $payment;
        }
        try {
            $payload = [
                'api_key' => $apiKey, 'apikey' => $apiKey, 'token' => $apiKey,
                'merchant_id' => $secrets['qris_merchant_id'] ?? $store['qris_merchant_id'] ?? '',
                'order_id' => $order['id'], 'reference' => $order['id'],
                'amount' => $order['amount'], 'nominal' => $order['amount'], 'currency' => $order['currency'],
                'customer_name' => $order['buyer']['buyer_name'] ?? $order['buyer']['name'] ?? '',
                'customer_email' => $order['buyer']['buyer_email'] ?? $order['buyer']['email'] ?? '',
                'description' => $order['plan_name'] . ' ' . $order['ram_gb'] . 'GB RAM',
                'callback_url' => url('/api/pahri/qris/callback'),
                'return_url' => url('/order/' . $order['id']),
            ];
            $response = Http::timeout(25)->asForm()->post($endpoint, $payload);
            $data = $response->json();
            if (!is_array($data)) $data = ['body' => $response->body(), 'status' => $response->status()];
            $payment['status'] = $response->successful() ? 'pending' : 'api_error';
            $payment['reference'] = $data['reference'] ?? $data['trxid'] ?? $data['transaction_id'] ?? $data['id'] ?? $order['id'];
            $payment['qr_string'] = $data['qr_string'] ?? $data['qris'] ?? $data['qr'] ?? data_get($data, 'data.qr_string') ?? data_get($data, 'data.qris');
            $payment['qr_image'] = $data['qr_image'] ?? $data['qr_url'] ?? data_get($data, 'data.qr_image') ?? data_get($data, 'data.qr_url');
            $payment['payment_url'] = $data['payment_url'] ?? $data['url'] ?? data_get($data, 'data.payment_url') ?? data_get($data, 'data.url');
            $payment['raw'] = $data;
            $payment['error'] = $response->successful() ? null : 'QRIS API HTTP ' . $response->status();
        } catch (Throwable $e) {
            $payment['status'] = 'api_error';
            $payment['error'] = $e->getMessage();
        }
        return $payment;
    }

    private function defaultStore(): array
    {
        return [
            'enabled' => true, 'store_name' => 'Pahri Panel Store', 'tagline' => 'Beli panel ikut RAM secara automatik.', 'currency' => 'IDR', 'whatsapp' => '',
            'qris_provider' => 'qris.zakki.store', 'qris_endpoint' => 'https://qris.zakki.store', 'qris_merchant_id' => '', 'qris_status' => 'backend_token_required',
            'plans' => [
                ['id' => 'starter-1gb', 'name' => 'Starter Panel', 'ram_gb' => 1, 'price' => 5000, 'description' => 'Untuk bot ringan dan testing.'],
                ['id' => 'prime-4gb', 'name' => 'Prime Panel', 'ram_gb' => 4, 'price' => 15000, 'description' => 'Plan seimbang untuk bot aktif.'],
                ['id' => 'ultra-8gb', 'name' => 'Ultra Panel', 'ram_gb' => 8, 'price' => 30000, 'description' => 'Untuk workload berat dan premium user.'],
            ],
        ];
    }

    private function storeConfig(): array { $path = public_path('themes/pahri/store.json'); if (!File::exists($path)) return $this->defaultStore(); $decoded = json_decode((string) File::get($path), true); return array_merge($this->defaultStore(), is_array($decoded) ? $decoded : []); }
    private function featureHub(): array { $path = public_path('themes/pahri/features-150.json'); if (!File::exists($path)) return ['total' => 150, 'items' => []]; $decoded = json_decode((string) File::get($path), true); return is_array($decoded) ? $decoded : ['total' => 150, 'items' => []]; }
    private function findPlan(array $store, string $id): ?array { foreach (($store['plans'] ?? []) as $plan) if (($plan['id'] ?? '') === $id) return $plan; return null; }
    private function orders(): array { $path = storage_path('app/pahri-store-orders.json'); if (!File::exists($path)) return []; $decoded = json_decode((string) File::get($path), true); return is_array($decoded) ? $decoded : []; }
    private function getOrder(string $id): ?array { foreach ($this->orders() as $order) if (($order['id'] ?? '') === $id) return $order; return null; }
    private function saveOrder(array $order): void { $orders = $this->orders(); $found = false; foreach ($orders as $i => $old) if (($old['id'] ?? '') === $order['id']) { $orders[$i] = $order; $found = true; break; } if (!$found) $orders[] = $order; File::put(storage_path('app/pahri-store-orders.json'), json_encode($orders, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR) . PHP_EOL, true); @chmod(storage_path('app/pahri-store-orders.json'), 0640); }
    private function writeStore(array $store): void { unset($store['qris_api_key']); File::ensureDirectoryExists(public_path('themes/pahri'), 0775, true); File::put(public_path('themes/pahri/store.json'), json_encode($store, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR) . PHP_EOL, true); }
    private function secrets(): array { $path = storage_path('app/pahri-store-secrets.json'); if (!File::exists($path)) return []; $decoded = json_decode((string) File::get($path), true); return is_array($decoded) ? $decoded : []; }
    private function secretStatus(): array { $s = $this->secrets(); return ['has_api_key' => !empty($s['qris_api_key']), 'updated_at' => $s['updated_at'] ?? null]; }
    private function writeSecrets(array $validated): void { $s = $this->secrets(); if (!empty($validated['qris_clear_key'])) unset($s['qris_api_key']); if (!empty($validated['qris_api_key'])) $s['qris_api_key'] = $validated['qris_api_key']; $s['qris_endpoint'] = $validated['qris_endpoint']; $s['qris_merchant_id'] = $validated['qris_merchant_id'] ?? ''; $s['updated_at'] = now()->toIso8601String(); File::put(storage_path('app/pahri-store-secrets.json'), json_encode($s, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR) . PHP_EOL, true); @chmod(storage_path('app/pahri-store-secrets.json'), 0640); }
}
