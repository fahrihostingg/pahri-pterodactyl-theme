import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components/macro';

type MaintenanceConfig = {
    enabled: boolean;
    title?: string;
    message?: string;
    badge?: string;
};

type RuntimeConfig = {
    maintenance?: MaintenanceConfig;
};

type Props = {
    authenticated: boolean;
    rootAdmin: boolean;
    children: React.ReactNode;
};

const pulse = keyframes`
    0%, 100% { transform: scale(.94); opacity: .58; }
    50% { transform: scale(1.08); opacity: 1; }
`;

const Wrap = styled.main`
    min-height: 100vh;
    padding: 34px 18px;
    display: grid;
    place-items: center;
`;

const Card = styled.section`
    width: min(760px, 100%);
    padding: clamp(30px, 6vw, 58px);
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.12);
    border-radius: calc(var(--pahri-radius, 24px) * 1.35);
    color: #fff;
    background:
        radial-gradient(circle at 20% 0%, color-mix(in srgb, var(--pahri-accent) 28%, transparent), transparent 38%),
        radial-gradient(circle at 100% 100%, color-mix(in srgb, var(--pahri-accent-secondary) 24%, transparent), transparent 42%),
        linear-gradient(145deg, rgba(5,9,24,.96), rgba(2,6,18,.93));
    box-shadow: 0 55px 160px rgba(0,0,0,.66), 0 0 80px color-mix(in srgb, var(--pahri-accent) 12%, transparent), inset 0 1px rgba(255,255,255,.08);
    backdrop-filter: blur(var(--pahri-blur, 24px)) saturate(160%);
    text-align: center;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        opacity: .18;
        background-image: linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
        background-size: 34px 34px;
        mask-image: radial-gradient(circle at 50% 22%, #000, transparent 82%);
        pointer-events: none;
    }
`;

const Logo = styled.div`
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
    box-shadow: 0 25px 72px rgba(0,0,0,.42), 0 0 48px color-mix(in srgb, var(--pahri-accent) 44%, transparent), inset 0 1px rgba(255,255,255,.08);
    animation: ${pulse} 2.4s ease-in-out infinite;
    animation-play-state: var(--pahri-animation-state);
`;

const Badge = styled.span`
    position: relative;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 11px;
    border: 1px solid rgba(245,158,11,.25);
    border-radius: 999px;
    color: #fde68a;
    background: rgba(245,158,11,.08);
    font-size: 9px;
    font-weight: 900;
    letter-spacing: .14em;
    text-transform: uppercase;

    &::before {
        content: '';
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #f59e0b;
        box-shadow: 0 0 16px #f59e0b;
    }
`;

const Title = styled.h1`
    position: relative;
    z-index: 2;
    margin: 20px 0 12px;
    color: #fff;
    font-size: clamp(34px, 6vw, 62px);
    line-height: .95;
    letter-spacing: -.065em;
`;

const Message = styled.p`
    max-width: 580px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
    color: rgba(226,232,240,.62);
    font-size: 14px;
    line-height: 1.9;
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

export default ({ authenticated, rootAdmin, children }: Props) => {
    const [maintenance, setMaintenance] = useState<MaintenanceConfig | null>(null);

    useEffect(() => {
        fetch(`/themes/pahri/settings.json?maintenance=${Date.now()}`, { cache: 'no-store' })
            .then(response => response.ok ? response.json() : Promise.reject(new Error('Maintenance config unavailable')))
            .then((config: RuntimeConfig) => setMaintenance(config.maintenance || null))
            .catch(() => setMaintenance(null));
    }, []);

    if (!authenticated || rootAdmin || !maintenance?.enabled) {
        return <>{children}</>;
    }

    return (
        <Wrap>
            <Card>
                <Logo />
                <Badge>{maintenance.badge || 'Maintenance Mode'}</Badge>
                <Title>{maintenance.title || 'Panel sedang maintenance'}</Title>
                <Message>{maintenance.message || 'Panel sedang dikemas kini oleh admin. Sila cuba semula sebentar lagi.'}</Message>
                <Footer>Only root admin can access while maintenance is active</Footer>
            </Card>
        </Wrap>
    );
};
