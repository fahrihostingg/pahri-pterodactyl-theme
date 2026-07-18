@php
    $configPath = public_path('themes/pahri/store.json');
    $store = [];
    if (is_file($configPath)) {
        $decoded = json_decode((string) file_get_contents($configPath), true);
        if (is_array($decoded)) {
            $store = $decoded;
        }
    }
    $plans = $store['plans'] ?? [
        ['id' => 'starter-1gb', 'name' => 'Starter Panel', 'ram_gb' => 1, 'price' => 5000, 'description' => 'Untuk bot ringan dan testing.'],
        ['id' => 'prime-4gb', 'name' => 'Prime Panel', 'ram_gb' => 4, 'price' => 15000, 'description' => 'Plan paling seimbang untuk bot aktif.'],
        ['id' => 'ultra-8gb', 'name' => 'Ultra Panel', 'ram_gb' => 8, 'price' => 30000, 'description' => 'Untuk workload berat dan premium user.'],
    ];
    $currency = $store['currency'] ?? 'IDR';
    $storeName = $store['store_name'] ?? 'Pahri Panel Store';
    $qrisProvider = $store['qris_provider'] ?? 'qris.zakki.store';
    $orderUrl = $store['order_url'] ?? '/auth/login';
    $logo = '/themes/pahri/default-logo.svg';
@endphp
<!doctype html>
<html lang="ms">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $storeName }} — Beli Panel RAM</title>
    <link rel="stylesheet" href="/themes/pahri/custom.css?v={{ @filemtime(public_path('themes/pahri/custom.css')) ?: 1 }}">
    <style>
        :root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;min-height:100vh;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;color:#fff;background:#020617;overflow-x:hidden}body:before{content:"";position:fixed;inset:0;z-index:-3;background:radial-gradient(circle at 14% 10%,color-mix(in srgb,var(--pahri-accent,#a855f7) 32%,transparent),transparent 34%),radial-gradient(circle at 86% 72%,color-mix(in srgb,var(--pahri-accent-secondary,#22d3ee) 24%,transparent),transparent 38%),linear-gradient(145deg,#020617,#070b1f 58%,#020617)}body:after{content:"";position:fixed;inset:0;z-index:-2;opacity:.15;background-image:linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);background-size:44px 44px;mask-image:radial-gradient(circle at 50% 35%,#000,transparent 82%)}a{color:inherit;text-decoration:none}.wrap{width:min(1240px,calc(100% - 32px));margin:0 auto}.nav{height:82px;display:flex;align-items:center;justify-content:space-between;gap:16px}.brand{display:flex;align-items:center;gap:13px}.logo{width:52px;height:52px;border:1px solid rgba(255,255,255,.14);border-radius:17px;background:url('{{ $logo }}') center/76% no-repeat,linear-gradient(135deg,rgba(255,255,255,.14),rgba(255,255,255,.025));box-shadow:0 0 36px color-mix(in srgb,var(--pahri-accent,#a855f7) 34%,transparent)}.brand strong{display:block;font-size:17px;font-weight:900;letter-spacing:-.04em}.brand span{display:block;margin-top:4px;color:rgba(226,232,240,.45);font-size:8px;font-weight:850;letter-spacing:.16em;text-transform:uppercase}.navlinks{display:flex;align-items:center;gap:8px}.navlinks a{padding:11px 14px;border:1px solid rgba(255,255,255,.08);border-radius:999px;color:rgba(226,232,240,.72);background:rgba(255,255,255,.035);font-size:11px;font-weight:800}.navlinks a.primary{color:#fff;background:linear-gradient(135deg,var(--pahri-accent,#a855f7),var(--pahri-accent-secondary,#22d3ee));box-shadow:0 14px 40px color-mix(in srgb,var(--pahri-accent,#a855f7) 24%,transparent)}.hero{min-height:calc(100vh - 82px);display:grid;grid-template-columns:minmax(0,1.05fr) minmax(360px,.95fr);gap:22px;align-items:center;padding:42px 0 70px}.copy{position:relative;padding:36px 0}.pill{display:inline-flex;align-items:center;gap:8px;padding:9px 12px;border:1px solid rgba(255,255,255,.1);border-radius:999px;color:#cffafe;background:rgba(34,211,238,.07);font-size:9px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}.pill:before{content:"";width:7px;height:7px;border-radius:50%;background:#22c55e;box-shadow:0 0 15px #22c55e}.copy h1{max-width:780px;margin:20px 0 18px;font-size:clamp(48px,7vw,96px);line-height:.88;letter-spacing:-.08em}.copy h1 span{color:transparent;background:linear-gradient(100deg,#fff,#ddd6fe 42%,#67e8f9);-webkit-background-clip:text;background-clip:text}.copy p{max-width:650px;margin:0;color:rgba(226,232,240,.58);font-size:15px;line-height:1.8}.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:30px}.stat{padding:14px;border:1px solid rgba(255,255,255,.08);border-radius:18px;background:rgba(255,255,255,.035);backdrop-filter:blur(16px)}.stat strong{display:block;font-size:20px}.stat span{display:block;margin-top:4px;color:rgba(226,232,240,.38);font-size:8px;font-weight:850;letter-spacing:.1em;text-transform:uppercase}.panel{padding:18px;border:1px solid rgba(255,255,255,.1);border-radius:30px;background:rgba(5,9,24,.74);box-shadow:0 35px 120px rgba(0,0,0,.55),inset 0 1px rgba(255,255,255,.07);backdrop-filter:blur(26px)}.panel-head{display:flex;align-items:center;justify-content:space-between;padding:8px 8px 18px}.panel-head strong{font-size:18px}.panel-head span{padding:7px 10px;border-radius:999px;color:#86efac;background:rgba(34,197,94,.1);font-size:8px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}.plans{display:grid;gap:12px}.plan{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;padding:18px;border:1px solid rgba(255,255,255,.08);border-radius:22px;background:linear-gradient(135deg,rgba(255,255,255,.055),rgba(255,255,255,.02));transition:.2s ease}.plan:hover{transform:translateY(-3px);border-color:color-mix(in srgb,var(--pahri-accent,#a855f7) 52%,rgba(255,255,255,.08));box-shadow:0 20px 60px rgba(0,0,0,.35)}.plan small{color:#67e8f9;font-size:8px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}.plan h3{margin:7px 0 6px;font-size:22px;letter-spacing:-.04em}.plan p{margin:0;color:rgba(226,232,240,.45);font-size:11px;line-height:1.55}.price{text-align:right}.price b{display:block;font-size:22px}.price a{display:inline-flex;margin-top:10px;padding:10px 13px;border-radius:14px;background:linear-gradient(135deg,var(--pahri-accent,#a855f7),var(--pahri-accent-secondary,#22d3ee));font-size:10px;font-weight:900;text-transform:uppercase}.qris{margin-top:14px;padding:15px;border:1px solid rgba(34,211,238,.18);border-radius:20px;background:rgba(34,211,238,.06);color:rgba(226,232,240,.62);font-size:11px;line-height:1.65}.footer{padding:28px 0 40px;color:rgba(226,232,240,.32);font-size:10px;text-align:center}@media(max-width:900px){.hero{grid-template-columns:1fr}.stats{grid-template-columns:repeat(2,1fr)}.nav{height:auto;padding:18px 0;align-items:flex-start}.navlinks{flex-wrap:wrap;justify-content:flex-end}.plan{grid-template-columns:1fr}.price{text-align:left}}
    </style>
</head>
<body>
    <nav class="wrap nav">
        <a class="brand" href="/">
            <span class="logo"></span>
            <span><strong>{{ $storeName }}</strong><span>Premium Panel Store</span></span>
        </a>
        <div class="navlinks">
            <a href="#plans">Plan RAM</a>
            <a href="/auth/login">Login Panel</a>
            <a class="primary" href="#plans">Beli Sekarang</a>
        </div>
    </nav>

    <main class="wrap hero">
        <section class="copy">
            <span class="pill">QRIS ready • {{ $qrisProvider }}</span>
            <h1>Beli panel.<br><span>Deploy bot lebih pantas.</span></h1>
            <p>Pilih plan RAM, teruskan order dan login ke panel. Website store ini berada di halaman utama domain, manakala halaman login tetap khas untuk akses akaun panel.</p>
            <div class="stats">
                <div class="stat"><strong>150+</strong><span>Fitur Panel</span></div>
                <div class="stat"><strong>24/7</strong><span>Online Ready</span></div>
                <div class="stat"><strong>QRIS</strong><span>Payment Ready</span></div>
                <div class="stat"><strong>RAM</strong><span>Auto Plan</span></div>
            </div>
        </section>

        <section class="panel" id="plans">
            <div class="panel-head"><strong>Panel RAM Plans</strong><span>Store Online</span></div>
            <div class="plans">
                @foreach(array_slice($plans, 0, 6) as $plan)
                    @php
                        $id = $plan['id'] ?? Str::slug($plan['name'] ?? 'panel');
                        $href = $orderUrl . (str_contains($orderUrl, '?') ? '&' : '?') . 'plan=' . urlencode($id);
                    @endphp
                    <article class="plan">
                        <div>
                            <small>{{ $plan['ram_gb'] ?? '?' }} GB RAM</small>
                            <h3>{{ $plan['name'] ?? 'Panel Plan' }}</h3>
                            <p>{{ $plan['description'] ?? 'Plan panel premium by Pahri.' }}</p>
                        </div>
                        <div class="price">
                            <b>{{ $currency }} {{ number_format((int) ($plan['price'] ?? 0), 0, ',', '.') }}</b>
                            <a href="{{ $href }}">Order</a>
                        </div>
                    </article>
                @endforeach
            </div>
            <div class="qris">Payment provider disediakan untuk {{ $qrisProvider }}. Token/API key dikawal owner ID 1 dari Admin supaya credential tidak bocor ke browser.</div>
        </section>
    </main>

    <footer class="wrap footer">Pahri Thema New Store • by Pahri</footer>
</body>
</html>
