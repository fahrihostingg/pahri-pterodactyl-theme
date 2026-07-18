import React, { forwardRef, useEffect, useState } from 'react';
import { Form } from 'formik';
import styled, { keyframes } from 'styled-components/macro';
import FlashMessageRender from '@/components/FlashMessageRender';

const float = keyframes`
    0%, 100% { transform: translate3d(0, 0, 0) rotate(8deg); }
    50% { transform: translate3d(0, -18px, 0) rotate(15deg); }
`;

const pulse = keyframes`
    0%, 100% { opacity: .55; transform: scale(.96); }
    50% { opacity: 1; transform: scale(1.08); }
`;

type StorePlan = {
    id: string;
    name: string;
    ram_gb: number;
    price: number;
    description: string;
};

type StoreConfig = {
    store_name?: string;
    currency?: string;
    order_url?: string;
    plans?: StorePlan[];
};

const Page = styled.main`
    width: min(1380px, calc(100vw - 24px));
    min-height: calc(100vh - 24px);
    margin: 12px auto;
    position: relative;
    overflow: hidden;
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(380px, .7fr);
    border: 1px solid rgba(255,255,255,.11);
    border-radius: calc(var(--pahri-radius, 24px) * 1.25);
    background: rgba(2,6,18,.9);
    box-shadow: 0 45px 150px rgba(0,0,0,.7), inset 0 1px rgba(255,255,255,.08);

    @media (max-width: 980px) {
        grid-template-columns: 1fr;
        margin: 8px auto;
    }
`;

const Store = styled.section`
    min-height: 760px;
    padding: 46px;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background:
        radial-gradient(circle at 12% 8%, rgba(168,85,247,.32), transparent 34%),
        radial-gradient(circle at 88% 76%, rgba(34,211,238,.22), transparent 38%),
        linear-gradient(145deg, rgba(5,10,29,.84), rgba(2,6,18,.74)),
        var(--pahri-wallpaper);
    background-size: cover;
    background-position: center;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        opacity: .18;
        background-image:
            linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px);
        background-size: 42px 42px;
        mask-image: linear-gradient(to bottom, #000, transparent 92%);
        pointer-events: none;
    }

    @media (max-width: 980px) {
        min-height: auto;
        padding: 32px 24px 38px;
    }
`;

const Brand = styled.div`
    position: relative;
    z-index: 3;
    display: flex;
    align-items: center;
    gap: 13px;
`;

const Logo = styled.span`
    width: 56px;
    height: 56px;
    border: 1px solid rgba(255,255,255,.14);
    border-radius: 18px;
    background: var(--pahri-logo) center / 76% no-repeat, linear-gradient(135deg,rgba(255,255,255,.13),rgba(255,255,255,.025));
    box-shadow: 0 18px 48px rgba(0,0,0,.35), 0 0 35px rgba(168,85,247,.3);
`;

const BrandText = styled.div`
    strong { display:block; color:#fff; font-size:17px; font-weight:900; letter-spacing:-.04em; }
    span { display:block; margin-top:4px; color:rgba(226,232,240,.46); font-size:8px; font-weight:850; letter-spacing:.17em; text-transform:uppercase; }
`;

const Hero = styled.div`
    position: relative;
    z-index: 3;
    margin: 48px 0 28px;

    small {
        display:inline-flex;
        align-items:center;
        gap:7px;
        padding:8px 11px;
        border:1px solid rgba(255,255,255,.1);
        border-radius:999px;
        color:#cffafe;
        background:rgba(34,211,238,.07);
        font-size:9px;
        font-weight:900;
        letter-spacing:.14em;
        text-transform:uppercase;
    }

    small::before { content:''; width:7px; height:7px; border-radius:50%; background:#22c55e; box-shadow:0 0 14px #22c55e; animation:${pulse} 1.8s ease-in-out infinite; }
    h1 { max-width:820px; margin:18px 0 14px; color:#fff; font-size:clamp(46px,6vw,88px); line-height:.9; letter-spacing:-.075em; }
    h1 span { color:transparent; background:linear-gradient(100deg,#fff,#ddd6fe 42%,#67e8f9); background-clip:text; -webkit-background-clip:text; }
    p { max-width:680px; margin:0; color:rgba(226,232,240,.56); font-size:14px; line-height:1.8; }
`;

const Plans = styled.div`
    position:relative;
    z-index:3;
    display:grid;
    grid-template-columns:repeat(3,minmax(0,1fr));
    gap:12px;

    @media(max-width:760px){grid-template-columns:1fr;}
`;

const Plan = styled.a`
    min-height:190px;
    padding:18px;
    position:relative;
    overflow:hidden;
    display:flex;
    flex-direction:column;
    border:1px solid rgba(255,255,255,.09);
    border-radius:20px;
    color:#fff;
    background:rgba(5,9,24,.68);
    box-shadow:0 18px 55px rgba(0,0,0,.26),inset 0 1px rgba(255,255,255,.05);
    text-decoration:none!important;
    backdrop-filter:blur(18px);
    transition:.22s ease;

    &:hover { color:#fff; transform:translateY(-5px); border-color:rgba(168,85,247,.48); box-shadow:0 30px 75px rgba(0,0,0,.42),0 0 30px rgba(168,85,247,.13); }
    &::after { content:''; position:absolute; width:110px; height:110px; right:-55px; top:-55px; border-radius:50%; background:rgba(168,85,247,.15); filter:blur(16px); }
    small { color:#67e8f9; font-size:8px; font-weight:900; letter-spacing:.13em; text-transform:uppercase; }
    strong { margin-top:10px; color:#fff; font-size:18px; font-weight:850; letter-spacing:-.035em; }
    p { margin:7px 0 15px; color:rgba(226,232,240,.45); font-size:10px; line-height:1.55; }
    b { margin-top:auto; color:#fff; font-size:20px; }
    em { margin-top:8px; color:#c4b5fd; font-size:9px; font-style:normal; font-weight:800; letter-spacing:.07em; text-transform:uppercase; }
`;

const Floating = styled.span`
    position:absolute;
    width:140px;
    height:140px;
    right:8%;
    top:13%;
    z-index:1;
    border:1px solid rgba(255,255,255,.09);
    border-radius:34px;
    background:linear-gradient(135deg,rgba(168,85,247,.16),rgba(34,211,238,.06));
    box-shadow:0 25px 70px rgba(0,0,0,.25);
    animation:${float} 9s ease-in-out infinite;
    pointer-events:none;
`;

const LoginPanel = styled.aside`
    min-height:760px;
    padding:54px 42px;
    position:relative;
    display:flex;
    align-items:center;
    background:linear-gradient(160deg,rgba(8,13,31,.98),rgba(2,6,18,.96));

    @media(max-width:980px){min-height:auto;padding:42px 24px 50px;}
`;

const LoginInner = styled.div`
    width:100%;
    max-width:430px;
    margin:0 auto;

    h2 { margin:0 0 8px; color:#fff; font-size:32px; font-weight:900; letter-spacing:-.055em; }
    > p { margin:0 0 28px; color:rgba(226,232,240,.44); font-size:12px; line-height:1.7; }
    form > div { padding:0!important; background:transparent!important; box-shadow:none!important; }
    label { color:rgba(241,245,249,.72)!important; }
    input { min-height:54px!important; color:#fff!important; border:1px solid rgba(255,255,255,.11)!important; border-radius:15px!important; background:rgba(2,6,23,.68)!important; box-shadow:inset 0 1px rgba(255,255,255,.04)!important; }
    input:focus { border-color:var(--pahri-accent)!important; box-shadow:0 0 0 4px rgba(168,85,247,.16)!important; }
    button[type='submit'] { width:100%; min-height:54px; border-radius:15px!important; background:linear-gradient(135deg,var(--pahri-accent),var(--pahri-accent-secondary))!important; box-shadow:0 20px 48px rgba(168,85,247,.28)!important; }
`;

const Trust = styled.div`
    margin-top:24px;
    padding-top:18px;
    display:grid;
    grid-template-columns:repeat(3,1fr);
    gap:8px;
    border-top:1px solid rgba(255,255,255,.06);

    span { padding:9px 6px; border:1px solid rgba(255,255,255,.06); border-radius:11px; color:rgba(226,232,240,.38); background:rgba(255,255,255,.025); font-size:8px; font-weight:800; text-align:center; letter-spacing:.06em; text-transform:uppercase; }
`;

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & { title?: string };

const fallbackPlans: StorePlan[] = [
    { id:'starter-1gb', name:'Starter Panel', ram_gb:1, price:5000, description:'Sesuai untuk bot ringan dan testing.' },
    { id:'prime-4gb', name:'Prime Panel', ram_gb:4, price:15000, description:'Pilihan seimbang untuk bot aktif.' },
    { id:'ultra-8gb', name:'Ultra Panel', ram_gb:8, price:30000, description:'Untuk workload berat dan premium.' },
];

export default forwardRef<HTMLFormElement, Props>(({ title, ...props }, ref) => {
    const [store, setStore] = useState<StoreConfig>({ store_name:'Pahri Panel Store', currency:'IDR', plans:fallbackPlans });

    useEffect(() => {
        fetch(`/themes/pahri/store.json?v=${Date.now()}`, { cache:'no-store' })
            .then(response => response.ok ? response.json() : Promise.reject(new Error('Store config unavailable')))
            .then((config: StoreConfig) => setStore({ ...config, plans:Array.isArray(config.plans) && config.plans.length ? config.plans : fallbackPlans }))
            .catch(() => undefined);
    }, []);

    const currency = store.currency || 'IDR';
    const orderUrl = store.order_url || '#pahri-login';

    return (
        <Page>
            <Store>
                <Floating aria-hidden={'true'} />
                <Brand><Logo /><BrandText><strong>{store.store_name || 'Pahri Panel Store'}</strong><span>Premium Panel & Cloud Store</span></BrandText></Brand>
                <Hero>
                    <small>Instant panel plans</small>
                    <h1>Beli panel.<br/><span>Deploy lebih pantas.</span></h1>
                    <p>Pilih RAM yang sesuai, masuk ke akaun dan teruskan pembelian melalui sistem order Pahri. Semua plan dibina untuk bot, aplikasi dan workload digital.</p>
                </Hero>
                <Plans>
                    {(store.plans || fallbackPlans).slice(0,3).map(plan => (
                        <Plan key={plan.id} href={`${orderUrl}${orderUrl.includes('?') ? '&' : '?'}plan=${encodeURIComponent(plan.id)}`}>
                            <small>{plan.ram_gb} GB RAM</small>
                            <strong>{plan.name}</strong>
                            <p>{plan.description}</p>
                            <b>{currency} {Number(plan.price).toLocaleString('id-ID')}</b>
                            <em>Beli plan →</em>
                        </Plan>
                    ))}
                </Plans>
            </Store>
            <LoginPanel id={'pahri-login'}>
                <LoginInner>
                    <h2>{title || 'Masuk ke Pahri'}</h2>
                    <p>Login untuk membuka dashboard, mengurus server dan meneruskan pembelian panel.</p>
                    <FlashMessageRender css={undefined} />
                    <Form {...props} ref={ref}>{props.children}</Form>
                    <Trust><span>QRIS Ready</span><span>Secure Login</span><span>Instant Setup</span></Trust>
                </LoginInner>
            </LoginPanel>
        </Page>
    );
});
