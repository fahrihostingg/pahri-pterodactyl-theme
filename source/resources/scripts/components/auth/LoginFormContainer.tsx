import React, { forwardRef } from 'react';
import { Form } from 'formik';
import styled, { keyframes } from 'styled-components/macro';
import FlashMessageRender from '@/components/FlashMessageRender';

const orbit = keyframes`
    from { transform: rotateX(68deg) rotateZ(0deg); }
    to { transform: rotateX(68deg) rotateZ(360deg); }
`;

const drift = keyframes`
    0%, 100% { transform: translate3d(0, 0, 0) rotateX(58deg) rotateZ(34deg); }
    50% { transform: translate3d(18px, -25px, 0) rotateX(66deg) rotateZ(49deg); }
`;

const pulse = keyframes`
    0%, 100% { opacity: .48; transform: scale(.94); }
    50% { opacity: 1; transform: scale(1.08); }
`;

const Root = styled.div`
    width: min(1280px, calc(100vw - 28px));
    min-height: 760px;
    margin: 24px auto;
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(390px, .75fr);
    overflow: hidden;
    position: relative;
    border: 1px solid rgba(255,255,255,.115);
    border-radius: calc(var(--pahri-radius, 24px) * 1.42);
    background: rgba(4,8,22,var(--pahri-glass-opacity,.78));
    box-shadow: 0 55px 160px rgba(0,0,0,.68), 0 0 80px color-mix(in srgb, var(--pahri-accent) 8%, transparent), inset 0 1px rgba(255,255,255,.085);
    backdrop-filter: blur(var(--pahri-blur, 24px)) saturate(165%);

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 4;
        border-radius: inherit;
        pointer-events: none;
        background: linear-gradient(135deg, rgba(255,255,255,.055), transparent 35%, rgba(255,255,255,.018));
    }

    @media (max-width: 980px) {
        grid-template-columns: 1fr;
        min-height: auto;
        margin: 12px auto;
        border-radius: 26px;
    }
`;

const Visual = styled.section`
    min-height: 760px;
    padding: 46px;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background:
        radial-gradient(circle at 18% 16%, color-mix(in srgb, var(--pahri-accent) 38%, transparent), transparent 35%),
        radial-gradient(circle at 84% 76%, color-mix(in srgb, var(--pahri-accent-secondary) 28%, transparent), transparent 40%),
        linear-gradient(145deg, rgba(7,12,32,.88), rgba(3,7,20,.72)),
        var(--pahri-wallpaper);
    background-size: cover;
    background-position: center;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        opacity: .24;
        background-image:
            linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
        background-size: 44px 44px;
        mask-image: linear-gradient(to bottom, #000, transparent 88%);
    }

    &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent 72%, rgba(2,6,23,.62));
    }

    @media (max-width: 980px) {
        min-height: auto;
        padding: 34px;
    }
`;

const Brand = styled.div`
    position: relative;
    z-index: 5;
    display: flex;
    align-items: center;
    gap: 14px;
`;

const Logo = styled.div`
    width: 60px;
    height: 60px;
    border: 1px solid rgba(255,255,255,.145);
    border-radius: calc(var(--pahri-radius, 24px) * .82);
    background-image: var(--pahri-logo), linear-gradient(135deg, rgba(255,255,255,.15), rgba(255,255,255,.025));
    background-size: 76%, cover;
    background-repeat: no-repeat;
    background-position: center;
    box-shadow: 0 22px 62px rgba(0,0,0,.42), 0 0 38px color-mix(in srgb, var(--pahri-accent) 46%, transparent), inset 0 1px rgba(255,255,255,.08);
    transform: perspective(500px) rotateX(7deg) rotateY(-9deg);
`;

const Product = styled.div`
    color: #fff;
    strong { display: block; font-size: 18px; font-weight: 880; letter-spacing: -.035em; }
    span { display: block; margin-top: 4px; color: rgba(226,232,240,.48); font-size: 8px; font-weight: 850; letter-spacing: .18em; text-transform: uppercase; }
`;

const Hero = styled.div`
    position: relative;
    z-index: 5;
    max-width: 680px;
    margin-top: 34px;

    small {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 8px 11px;
        border: 1px solid rgba(255,255,255,.11);
        border-radius: 999px;
        color: #cffafe;
        background: color-mix(in srgb, var(--pahri-accent-secondary) 9%, transparent);
        font-size: 9px;
        font-weight: 900;
        letter-spacing: .15em;
        text-transform: uppercase;
    }

    small::before {
        content: '';
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--pahri-accent-secondary);
        box-shadow: 0 0 14px var(--pahri-accent-secondary);
    }

    h1 {
        margin: 18px 0 13px;
        color: #fff;
        font-size: clamp(44px, 5.3vw, 78px);
        line-height: .92;
        letter-spacing: -.072em;
        text-wrap: balance;
    }

    h1 span {
        color: transparent;
        background: linear-gradient(100deg, #fff, #fde68a 35%, #67e8f9);
        background-clip: text;
        -webkit-background-clip: text;
    }

    p {
        max-width: 600px;
        margin: 0;
        color: rgba(226,232,240,.62);
        font-size: 14px;
        line-height: 1.85;
    }
`;

const StoreGrid = styled.div`
    position: relative;
    z-index: 5;
    margin-top: 28px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;

    @media (max-width: 1180px) { grid-template-columns: 1fr; }
`;

const Plan = styled.div`
    padding: 15px;
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.11);
    border-radius: calc(var(--pahri-radius, 24px) * .7);
    background: rgba(5,9,23,.58);
    box-shadow: inset 0 1px rgba(255,255,255,.06), 0 16px 45px rgba(0,0,0,.24);
    backdrop-filter: blur(var(--pahri-blur, 24px));

    &::before {
        content: '';
        position: absolute;
        width: 90px;
        height: 90px;
        right: -50px;
        top: -52px;
        border-radius: 50%;
        background: color-mix(in srgb, var(--pahri-accent) 18%, transparent);
        filter: blur(18px);
    }

    strong { display:block; position:relative; color:#fff; font-size:16px; font-weight:850; letter-spacing:-.035em; }
    span { display:block; position:relative; margin-top:6px; color:#fde68a; font-size:20px; font-weight:900; letter-spacing:-.04em; }
    small { display:block; position:relative; margin-top:4px; color:rgba(226,232,240,.48); font-size:9px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; }
`;

const FeatureStrip = styled.div`
    position: relative;
    z-index: 5;
    margin-top: 14px;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;

    @media (max-width: 760px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
`;

const Feature = styled.div`
    padding: 10px;
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 13px;
    color: rgba(241,245,249,.78);
    background: rgba(255,255,255,.035);
    font-size: 10px;
    font-weight: 800;
    text-align: center;
`;

const Scene = styled.div`
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    perspective: 1000px;
`;

const Cube = styled.span<{ $size: number; $top: string; $left: string; $delay: string }>`
    position: absolute;
    top: ${props => props.$top};
    left: ${props => props.$left};
    width: ${props => props.$size}px;
    height: ${props => props.$size}px;
    border: 1px solid rgba(255,255,255,.12);
    border-radius: calc(var(--pahri-radius, 24px) * .95);
    background: linear-gradient(135deg, color-mix(in srgb, var(--pahri-accent) 22%, transparent), color-mix(in srgb, var(--pahri-accent-secondary) 8%, transparent));
    box-shadow: inset 0 1px rgba(255,255,255,.08), 0 28px 70px rgba(0,0,0,.28);
    transform-style: preserve-3d;
    animation: ${drift} calc(var(--pahri-motion-duration, 18s) * .56) ease-in-out infinite;
    animation-delay: ${props => props.$delay};
    animation-play-state: var(--pahri-animation-state);
    backdrop-filter: blur(12px);
`;

const Orbital = styled.div`
    width: 250px;
    height: 250px;
    position: absolute;
    right: 8%;
    top: 22%;
    display: grid;
    place-items: center;
    @media (max-width: 1100px) { opacity: .56; transform: scale(.78); right: 1%; }
`;

const Ring = styled.span<{ $size: number; $reverse?: boolean }>`
    position: absolute;
    width: ${props => props.$size}px;
    height: ${props => props.$size}px;
    border: 1px solid ${props => (props.$reverse ? 'color-mix(in srgb, var(--pahri-accent-secondary) 45%, transparent)' : 'color-mix(in srgb, var(--pahri-accent) 45%, transparent)')};
    border-radius: 50%;
    box-shadow: 0 0 28px color-mix(in srgb, var(--pahri-accent) 10%, transparent);
    animation: ${orbit} ${props => (props.$reverse ? '12s' : '18s')} linear infinite ${props => (props.$reverse ? 'reverse' : 'normal')};
    animation-play-state: var(--pahri-animation-state);

    &::before {
        content: '';
        position: absolute;
        top: -4px;
        left: 50%;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: ${props => (props.$reverse ? 'var(--pahri-accent-secondary)' : 'var(--pahri-accent)')};
        box-shadow: 0 0 16px currentColor;
    }
`;

const Status = styled.div`
    position: relative;
    z-index: 5;
    display: flex;
    align-items: center;
    gap: 9px;
    color: rgba(226,232,240,.58);
    font-size: 9px;
    font-weight: 850;
    letter-spacing: .14em;
    text-transform: uppercase;

    &::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #22c55e;
        box-shadow: 0 0 17px #22c55e;
        animation: ${pulse} 1.8s ease-in-out infinite;
        animation-play-state: var(--pahri-animation-state);
    }
`;

const Panel = styled.section`
    padding: 66px 52px;
    position: relative;
    z-index: 5;
    display: flex;
    align-items: center;
    background: linear-gradient(160deg, rgba(8,13,31,.97), rgba(2,6,18,.94));

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        opacity: .08;
        background: radial-gradient(circle at 100% 0, var(--pahri-accent), transparent 42%);
        pointer-events: none;
    }

    @media (max-width: 920px) { padding: 40px 28px 46px; }
`;

const FormArea = styled.div`
    width: 100%;
    max-width: 430px;
    margin: 0 auto;
    position: relative;
    z-index: 2;

    h2 { margin: 0 0 7px; color: #fff; font-size: 31px; font-weight: 880; letter-spacing: -.05em; }
    .pahri-auth-subtitle { margin: 0 0 30px; color: rgba(226,232,240,.45); font-size: 13px; line-height: 1.65; }
    form > div { padding: 0 !important; background: transparent !important; box-shadow: none !important; }
    label { color: rgba(241,245,249,.72) !important; }

    input {
        min-height: 54px !important;
        color: #fff !important;
        border: 1px solid rgba(255,255,255,.11) !important;
        border-radius: calc(var(--pahri-radius, 24px) * .62) !important;
        background: rgba(2,6,23,.64) !important;
        box-shadow: inset 0 1px rgba(255,255,255,.04) !important;
        backdrop-filter: blur(var(--pahri-blur, 24px));
    }

    input:focus {
        border-color: var(--pahri-accent) !important;
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--pahri-accent) 18%, transparent), 0 16px 42px rgba(0,0,0,.24) !important;
    }

    button[type='submit'] {
        width: 100%;
        min-height: 54px;
        border-radius: calc(var(--pahri-radius, 24px) * .62) !important;
        background: linear-gradient(135deg, var(--pahri-accent), var(--pahri-accent-secondary)) !important;
        box-shadow: 0 20px 48px color-mix(in srgb, var(--pahri-accent) 32%, transparent) !important;
    }
`;

const Foot = styled.p`
    margin: 26px 0 0;
    color: rgba(226,232,240,.3);
    font-size: 9px;
    text-align: center;
    letter-spacing: .13em;
    text-transform: uppercase;
`;

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
};

const features = ['150+ fitur', 'QRIS ready', 'Auto order flow', 'Panel RAM plans'];

export default forwardRef<HTMLFormElement, Props>(({ title, ...props }, ref) => (
    <Root>
        <Visual>
            <Scene aria-hidden={'true'}>
                <Cube $size={160} $top={'8%'} $left={'57%'} $delay={'-1s'} />
                <Cube $size={96} $top={'68%'} $left={'73%'} $delay={'-5s'} />
                <Cube $size={62} $top={'50%'} $left={'14%'} $delay={'-9s'} />
                <Orbital><Ring $size={238} /><Ring $size={172} $reverse /></Orbital>
            </Scene>
            <Brand>
                <Logo />
                <Product><strong>Pahri Panel Store</strong><span>Nexus Storefront + Control Panel</span></Product>
            </Brand>
            <Hero>
                <small>Automated Panel Store</small>
                <h1>Beli panel ikut RAM,<br /><span>urus semua dari satu tempat.</span></h1>
                <p>Landing pertama kini bergaya store: pilih plan RAM, sambung payment QRIS, aktifkan broadcast, maintenance, fake hacking visual, quick links dan feature hub tanpa rosakkan panel.</p>
            </Hero>
            <StoreGrid>
                <Plan><strong>Starter Panel</strong><span>1 GB RAM</span><small>Untuk bot ringan</small></Plan>
                <Plan><strong>Prime Panel</strong><span>4 GB RAM</span><small>Best seller</small></Plan>
                <Plan><strong>Ultra Panel</strong><span>8 GB RAM</span><small>High performance</small></Plan>
            </StoreGrid>
            <FeatureStrip>{features.map(item => <Feature key={item}>{item}</Feature>)}</FeatureStrip>
            <Status>QRIS integration bridge ready • token set from backend only</Status>
        </Visual>
        <Panel>
            <FormArea>
                <h2>{title || 'Secure Access'}</h2>
                <p className={'pahri-auth-subtitle'}>Login admin untuk aktifkan store, QRIS, maintenance, broadcast dan 150+ feature hub.</p>
                <FlashMessageRender css={undefined} />
                <Form {...props} ref={ref}>{props.children}</Form>
                <Foot>&copy; {new Date().getFullYear()} Pahri Thema New Store &mdash; Crafted by Pahri</Foot>
            </FormArea>
        </Panel>
    </Root>
));
