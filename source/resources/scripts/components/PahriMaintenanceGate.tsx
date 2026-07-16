import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components/macro';

type MaintenanceConfig = {
    enabled: boolean;
    title?: string;
    message?: string;
    badge?: string;
};

type SecurityDrillConfig = {
    enabled: boolean;
    title?: string;
    message?: string;
    badge?: string;
    terminal?: string;
};

type RuntimeConfig = {
    maintenance?: MaintenanceConfig;
    security_drill?: SecurityDrillConfig;
};

type Props = {
    authenticated: boolean;
    canBypass: boolean;
    children: React.ReactNode;
};

const pulse = keyframes`
    0%, 100% { transform: scale(.94); opacity: .58; }
    50% { transform: scale(1.08); opacity: 1; }
`;

const glitch = keyframes`
    0%, 100% { transform: translate(0,0); filter: hue-rotate(0deg); }
    20% { transform: translate(-1px,1px); }
    40% { transform: translate(1px,-1px); }
    60% { transform: translate(-2px,0); filter: hue-rotate(25deg); }
    80% { transform: translate(2px,1px); }
`;

const Wrap = styled.main<{ $danger?: boolean }>`
    min-height: 100vh;
    padding: 34px 18px;
    display: grid;
    place-items: center;
    background:
        radial-gradient(circle at 20% 10%, ${props => props.$danger ? 'rgba(244,63,94,.22)' : 'color-mix(in srgb, var(--pahri-accent) 22%, transparent)'}, transparent 38%),
        radial-gradient(circle at 90% 85%, color-mix(in srgb, var(--pahri-accent-secondary) 18%, transparent), transparent 42%);
`;

const Card = styled.section<{ $danger?: boolean }>`
    width: min(820px, 100%);
    padding: clamp(30px, 6vw, 58px);
    position: relative;
    overflow: hidden;
    border: 1px solid ${props => props.$danger ? 'rgba(244,63,94,.26)' : 'rgba(255,255,255,.12)'};
    border-radius: calc(var(--pahri-radius, 24px) * 1.35);
    color: #fff;
    background:
        radial-gradient(circle at 20% 0%, ${props => props.$danger ? 'rgba(244,63,94,.22)' : 'color-mix(in srgb, var(--pahri-accent) 28%, transparent)'}, transparent 38%),
        radial-gradient(circle at 100% 100%, color-mix(in srgb, var(--pahri-accent-secondary) 24%, transparent), transparent 42%),
        linear-gradient(145deg, rgba(5,9,24,.96), rgba(2,6,18,.93));
    box-shadow: 0 55px 160px rgba(0,0,0,.66), 0 0 80px ${props => props.$danger ? 'rgba(244,63,94,.18)' : 'color-mix(in srgb, var(--pahri-accent) 12%, transparent)'}, inset 0 1px rgba(255,255,255,.08);
    backdrop-filter: blur(var(--pahri-blur, 24px)) saturate(160%);
    text-align: center;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        opacity: ${props => props.$danger ? '.25' : '.18'};
        background-image:
            linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
        background-size: 34px 34px;
        mask-image: radial-gradient(circle at 50% 22%, #000, transparent 82%);
        pointer-events: none;
    }
`;

const Logo = styled.div<{ $danger?: boolean }>`
    width: 82px;
    height: 82px;
    margin: 0 auto 22px;
    position: relative;
    z-index: 2;
    border: 1px solid rgba(255,255,255,.14);
    border-radius: calc(var(--pahri-radius, 24px) * .88);
    background-image: var(--pahri-logo), linear-gradient(135deg, rgba(255,255,255,.16), rgba(255,255,255,.03));
    background-size: 72%, cover;
    background-repeat: no-repeat;
    background-position: center;
    box-shadow: 0 25px 72px rgba(0,0,0,.42), 0 0 48px ${props => props.$danger ? 'rgba(244,63,94,.58)' : 'color-mix(in srgb, var(--pahri-accent) 44%, transparent)'}, inset 0 1px rgba(255,255,255,.08);
    animation: ${props => props.$danger ? glitch : pulse} ${props => props.$danger ? '1.1s' : '2.4s'} ease-in-out infinite;
    animation-play-state: var(--pahri-animation-state);
`;

const Badge = styled.span<{ $danger?: boolean }>`
    position: relative;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 11px;
    border: 1px solid ${props => props.$danger ? 'rgba(244,63,94,.34)' : 'rgba(245,158,11,.25)'};
    border-radius: 999px;
    color: ${props => props.$danger ? '#fecdd3' : '#fde68a'};
    background: ${props => props.$danger ? 'rgba(244,63,94,.1)' : 'rgba(245,158,11,.08)'};
    font-size: 9px;
    font-weight: 900;
    letter-spacing: .14em;
    text-transform: uppercase;

    &::before {
        content: '';
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: ${props => props.$danger ? '#f43f5e' : '#f59e0b'};
        box-shadow: 0 0 16px currentColor;
    }
`;

const Title = styled.h1<{ $danger?: boolean }>`
    position: relative;
    z-index: 2;
    margin: 20px 0 12px;
    color: #fff;
    font-size: clamp(34px, 6vw, 62px);
    line-height: .95;
    letter-spacing: -.065em;
    animation: ${props => props.$danger ? glitch : 'none'} 1.4s steps(2,end) infinite;
`;

const Message = styled.p`
    max-width: 590px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
    color: rgba(226,232,240,.62);
    font-size: 14px;
    line-height: 1.9;
    white-space: pre-wrap;
`;

const Terminal = styled.pre`
    max-width: 650px;
    margin: 26px auto 0;
    padding: 18px;
    position: relative;
    z-index: 2;
    overflow: auto;
    border: 1px solid rgba(34,197,94,.18);
    border-radius: 16px;
    color: #86efac;
    background: rgba(0,0,0,.42);
    box-shadow: inset 0 1px rgba(255,255,255,.04);
    text-align: left;
    font: 800 11px/1.7 ui-monospace, SFMono-Regular, Menlo, monospace;
    white-space: pre-wrap;
`;

const Footer = styled.div`
    margin-top: 28px;
    position: relative;
    z-index: 2;
    color: rgba(226,232,240,.32);
    font-size: 9px;
    font-weight: 850;
    letter-spacing: .13em;
    text-transform: uppercase;
`;

export default ({ authenticated, canBypass, children }: Props) => {
    const [config, setConfig] = useState<RuntimeConfig | null>(null);

    useEffect(() => {
        fetch(`/themes/pahri/settings.json?maintenance=${Date.now()}`, { cache: 'no-store' })
            .then(response => response.ok ? response.json() : Promise.reject(new Error('Maintenance config unavailable')))
            .then((runtime: RuntimeConfig) => setConfig(runtime))
            .catch(() => setConfig(null));
    }, []);

    if (!authenticated || canBypass) return <>{children}</>;

    const drill = config?.security_drill;
    if (drill?.enabled) {
        return (
            <Wrap $danger>
                <Card $danger>
                    <Logo $danger />
                    <Badge $danger>{drill.badge || 'Security Drill'}</Badge>
                    <Title $danger>{drill.title || 'Security Lockdown Simulation'}</Title>
                    <Message>{drill.message || 'Panel sedang berada dalam mod simulasi keselamatan. Ini bukan serangan sebenar.'}</Message>
                    <Terminal>{drill.terminal || '[SIMULATION MODE]\n> scanning interface...\n> locking client access...\n> root user id 1 bypass enabled...\n> system guarded by Pahri Thema New'}</Terminal>
                    <Footer>Security drill simulation • only user ID 1 can bypass</Footer>
                </Card>
            </Wrap>
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
