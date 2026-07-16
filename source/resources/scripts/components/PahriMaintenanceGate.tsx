import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components/macro';

type MaintenanceConfig = { enabled: boolean; title?: string; message?: string; badge?: string };
type SecurityDrillConfig = { enabled: boolean; title?: string; message?: string; badge?: string; terminal?: string };
type RuntimeConfig = { maintenance?: MaintenanceConfig; security_drill?: SecurityDrillConfig };
type Props = { authenticated: boolean; canBypass: boolean; children: React.ReactNode };

const pulse = keyframes`0%,100%{transform:scale(.94);opacity:.58}50%{transform:scale(1.08);opacity:1}`;
const glitch = keyframes`0%,100%{transform:translate(0,0);filter:hue-rotate(0deg)}20%{transform:translate(-1px,1px)}40%{transform:translate(1px,-1px)}60%{transform:translate(-2px,0);filter:hue-rotate(25deg)}80%{transform:translate(2px,1px)}`;
const tear = keyframes`0%,100%{clip-path:inset(0 0 0 0);transform:translateX(0)}12%{clip-path:inset(12% 0 74% 0);transform:translateX(-7px)}28%{clip-path:inset(62% 0 18% 0);transform:translateX(8px)}44%{clip-path:inset(31% 0 51% 0);transform:translateX(-4px)}70%{clip-path:inset(78% 0 8% 0);transform:translateX(6px)}}`;
const scan = keyframes`from{transform:translateY(-100vh)}to{transform:translateY(100vh)}`;
const flicker = keyframes`0%,100%{opacity:.86}10%{opacity:.55}11%{opacity:.92}34%{opacity:.72}35%{opacity:.96}58%{opacity:.61}59%{opacity:.88}`;

const Wrap = styled.main<{ $danger?: boolean }>`
    min-height:100vh;padding:34px 18px;display:grid;place-items:center;
    background:radial-gradient(circle at 20% 10%,${p=>p.$danger?'rgba(244,63,94,.22)':'color-mix(in srgb, var(--pahri-accent) 22%, transparent)'},transparent 38%),radial-gradient(circle at 90% 85%,color-mix(in srgb,var(--pahri-accent-secondary) 18%,transparent),transparent 42%);
`;
const Card = styled.section<{ $danger?: boolean }>`
    width:min(820px,100%);padding:clamp(30px,6vw,58px);position:relative;overflow:hidden;border:1px solid ${p=>p.$danger?'rgba(244,63,94,.26)':'rgba(255,255,255,.12)'};border-radius:calc(var(--pahri-radius,24px)*1.35);color:#fff;background:radial-gradient(circle at 20% 0%,${p=>p.$danger?'rgba(244,63,94,.22)':'color-mix(in srgb, var(--pahri-accent) 28%, transparent)'},transparent 38%),radial-gradient(circle at 100% 100%,color-mix(in srgb,var(--pahri-accent-secondary) 24%,transparent),transparent 42%),linear-gradient(145deg,rgba(5,9,24,.96),rgba(2,6,18,.93));box-shadow:0 55px 160px rgba(0,0,0,.66),0 0 80px ${p=>p.$danger?'rgba(244,63,94,.18)':'color-mix(in srgb, var(--pahri-accent) 12%, transparent)'},inset 0 1px rgba(255,255,255,.08);backdrop-filter:blur(var(--pahri-blur,24px)) saturate(160%);text-align:center;
    &::before{content:'';position:absolute;inset:0;opacity:${p=>p.$danger?'.25':'.18'};background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:34px 34px;mask-image:radial-gradient(circle at 50% 22%,#000,transparent 82%);pointer-events:none}
`;
const Logo = styled.div<{ $danger?: boolean }>`width:82px;height:82px;margin:0 auto 22px;position:relative;z-index:2;border:1px solid rgba(255,255,255,.14);border-radius:calc(var(--pahri-radius,24px)*.88);background-image:var(--pahri-logo),linear-gradient(135deg,rgba(255,255,255,.16),rgba(255,255,255,.03));background-size:72%,cover;background-repeat:no-repeat;background-position:center;box-shadow:0 25px 72px rgba(0,0,0,.42),0 0 48px ${p=>p.$danger?'rgba(244,63,94,.58)':'color-mix(in srgb, var(--pahri-accent) 44%, transparent)'},inset 0 1px rgba(255,255,255,.08);animation:${p=>p.$danger?glitch:pulse} ${p=>p.$danger?'1.1s':'2.4s'} ease-in-out infinite;animation-play-state:var(--pahri-animation-state)`;
const Badge = styled.span<{ $danger?: boolean }>`position:relative;z-index:2;display:inline-flex;align-items:center;gap:7px;padding:8px 11px;border:1px solid ${p=>p.$danger?'rgba(244,63,94,.34)':'rgba(245,158,11,.25)'};border-radius:999px;color:${p=>p.$danger?'#fecdd3':'#fde68a'};background:${p=>p.$danger?'rgba(244,63,94,.1)':'rgba(245,158,11,.08)'};font-size:9px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;&::before{content:'';width:7px;height:7px;border-radius:50%;background:${p=>p.$danger?'#f43f5e':'#f59e0b'};box-shadow:0 0 16px currentColor}`;
const Title = styled.h1<{ $danger?: boolean }>`position:relative;z-index:2;margin:20px 0 12px;color:#fff;font-size:clamp(34px,6vw,62px);line-height:.95;letter-spacing:-.065em;animation:${p=>p.$danger?glitch:'none'} 1.4s steps(2,end) infinite`;
const Message = styled.p`max-width:590px;margin:0 auto;position:relative;z-index:2;color:rgba(226,232,240,.62);font-size:14px;line-height:1.9;white-space:pre-wrap`;
const Terminal = styled.pre`max-width:650px;margin:26px auto 0;padding:18px;position:relative;z-index:2;overflow:auto;border:1px solid rgba(34,197,94,.18);border-radius:16px;color:#86efac;background:rgba(0,0,0,.42);box-shadow:inset 0 1px rgba(255,255,255,.04);text-align:left;font:800 11px/1.7 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap`;
const Footer = styled.div`margin-top:28px;position:relative;z-index:2;color:rgba(226,232,240,.32);font-size:9px;font-weight:850;letter-spacing:.13em;text-transform:uppercase`;

const HackShell = styled.div`
    min-height:100vh;position:relative;overflow-x:hidden;
    &::before{content:'';position:fixed;inset:0;z-index:4700;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(255,0,64,.08) 0 1px,transparent 1px 5px),linear-gradient(120deg,rgba(244,63,94,.14),transparent 38%,rgba(34,197,94,.08));mix-blend-mode:screen;animation:${flicker} 1.45s steps(2,end) infinite}
    &::after{content:'';position:fixed;left:0;right:0;top:-20vh;height:35vh;z-index:4701;pointer-events:none;background:linear-gradient(to bottom,transparent,rgba(255,255,255,.18),rgba(244,63,94,.15),transparent);animation:${scan} 3.8s linear infinite;opacity:.48}
    header,nav,main,section,article,footer,.box,.card,[class*='Container'],[class*='Content']{animation:${glitch} 2.4s steps(2,end) infinite!important;filter:contrast(1.14) saturate(1.35) hue-rotate(-12deg)}
    button,a,input,select,textarea{filter:hue-rotate(90deg) contrast(1.08)}
    img,svg{filter:hue-rotate(140deg) contrast(1.35) saturate(1.6)}
`;
const HackOverlay = styled.div`
    position:fixed;inset:0;z-index:4800;pointer-events:none;color:#fecdd3;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
`;
const HackBanner = styled.div`
    position:absolute;left:18px;right:18px;top:18px;padding:12px 14px;border:1px solid rgba(244,63,94,.38);border-radius:14px;background:rgba(20,0,10,.72);box-shadow:0 18px 60px rgba(244,63,94,.18);backdrop-filter:blur(16px);font-size:11px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;animation:${tear} 1.6s steps(2,end) infinite;
`;
const HackTerminal = styled.pre`
    position:absolute;right:18px;bottom:24px;width:min(430px,calc(100vw - 36px));max-height:230px;overflow:hidden;margin:0;padding:16px;border:1px solid rgba(34,197,94,.24);border-radius:16px;color:#86efac;background:rgba(0,0,0,.78);box-shadow:0 24px 80px rgba(0,0,0,.55),inset 0 1px rgba(255,255,255,.04);font:800 11px/1.65 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;
`;
const BrokenTag = styled.div<{ $top:string; $left:string; $rotate:string }>`
    position:absolute;top:${p=>p.$top};left:${p=>p.$left};padding:8px 10px;border:1px solid rgba(244,63,94,.28);border-radius:10px;color:#fff;background:rgba(244,63,94,.14);box-shadow:0 0 35px rgba(244,63,94,.12);font-size:9px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;transform:rotate(${p=>p.$rotate});animation:${glitch} 1.2s steps(2,end) infinite;
`;
const Crack = styled.div<{ $top:string; $left:string; $w:string; $rotate:string }>`
    position:absolute;top:${p=>p.$top};left:${p=>p.$left};width:${p=>p.$w};height:2px;background:linear-gradient(90deg,transparent,#f43f5e,#22c55e,transparent);box-shadow:0 0 18px #f43f5e;transform:rotate(${p=>p.$rotate});opacity:.72;
`;

const defaultHackTerminal = '[VISUAL SIMULATION MODE]\n> interface distortion enabled\n> client access remains open\n> UI integrity: unstable\n> admin bypass: user id 1\n> no real exploit executed';

export default ({ authenticated, canBypass, children }: Props) => {
    const [config, setConfig] = useState<RuntimeConfig | null>(null);

    useEffect(() => {
        fetch(`/themes/pahri/settings.json?maintenance=${Date.now()}`, { cache:'no-store' })
            .then(response => response.ok ? response.json() : Promise.reject(new Error('Theme guard config unavailable')))
            .then((runtime: RuntimeConfig) => setConfig(runtime))
            .catch(() => setConfig(null));
    }, []);

    useEffect(() => {
        const active = Boolean(authenticated && !canBypass && config?.security_drill?.enabled);
        document.body.classList.toggle('pahri-hack-simulation-active', active);
        return () => document.body.classList.remove('pahri-hack-simulation-active');
    }, [authenticated, canBypass, config?.security_drill?.enabled]);

    if (!authenticated || canBypass) return <>{children}</>;

    const drill = config?.security_drill;
    if (drill?.enabled) {
        const terminal = drill.terminal || defaultHackTerminal;
        return (
            <HackShell>
                {children}
                <HackOverlay aria-hidden={'true'}>
                    <HackBanner>{drill.badge || 'Security Drill'} — {drill.title || 'Interface compromised simulation'} • user access still enabled</HackBanner>
                    <BrokenTag $top={'20%'} $left={'7%'} $rotate={'-7deg'}>UI BREACH</BrokenTag>
                    <BrokenTag $top={'38%'} $left={'72%'} $rotate={'5deg'}>THEME CORRUPTED</BrokenTag>
                    <BrokenTag $top={'68%'} $left={'14%'} $rotate={'3deg'}>NEXUS GLITCH</BrokenTag>
                    <Crack $top={'30%'} $left={'18%'} $w={'42vw'} $rotate={'-9deg'} />
                    <Crack $top={'58%'} $left={'48%'} $w={'35vw'} $rotate={'13deg'} />
                    <Crack $top={'78%'} $left={'5%'} $w={'48vw'} $rotate={'4deg'} />
                    <HackTerminal>{terminal}</HackTerminal>
                </HackOverlay>
            </HackShell>
        );
    }

    const maintenance = config?.maintenance;
    if (maintenance?.enabled) {
        return (
            <Wrap>
                <Card>
                    <Logo />
                    <Badge>{maintenance.badge || 'Maintenance Mode'}</Badge>
                    <Title>{maintenance.title || 'Panel sedang maintenance'}</Title>
                    <Message>{maintenance.message || 'Panel sedang dikemas kini oleh admin. Sila cuba semula sebentar lagi.'}</Message>
                    <Footer>Only user ID 1 can access while maintenance is active</Footer>
                </Card>
            </Wrap>
        );
    }

    return <>{children}</>;
};
