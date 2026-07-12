import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faCogs, faExternalLinkAlt, faHome, faLifeRing, faServer, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components/macro';

type RuntimeConfig = {
    quick_links?: Array<{ label: string; url: string }>;
    dock?: {
        active?: boolean;
        support_label?: string;
        support_url?: string;
        spotlight_title?: string;
        spotlight_message?: string;
    };
};

type Props = {
    authenticated: boolean;
    rootAdmin: boolean;
};

const rise = keyframes`
    from { opacity: 0; transform: translate3d(-50%, 24px, 0) scale(.96); }
    to { opacity: 1; transform: translate3d(-50%, 0, 0) scale(1); }
`;

const glow = keyframes`
    0%, 100% { opacity: .42; transform: scale(.92); }
    50% { opacity: .86; transform: scale(1.08); }
`;

const DockWrap = styled.div`
    position: fixed;
    left: 50%;
    bottom: 18px;
    z-index: 1700;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px;
    border: 1px solid rgba(255,255,255,.11);
    border-radius: 999px;
    background: rgba(4,8,22,calc(var(--pahri-glass-opacity,.78) * .92));
    box-shadow: 0 28px 90px rgba(0,0,0,.52), 0 0 55px color-mix(in srgb,var(--pahri-accent) 16%,transparent), inset 0 1px rgba(255,255,255,.08);
    backdrop-filter: blur(var(--pahri-blur,24px)) saturate(170%);
    animation: ${rise} .42s ease both;

    &::before {
        content: '';
        position: absolute;
        inset: -16px;
        z-index: -1;
        border-radius: inherit;
        background: radial-gradient(circle, color-mix(in srgb,var(--pahri-accent) 18%,transparent), transparent 70%);
        filter: blur(18px);
        animation: ${glow} var(--pahri-motion-duration,18s) ease-in-out infinite;
        animation-play-state: var(--pahri-animation-state);
    }

    @media (max-width: 760px) {
        left: 10px;
        right: 10px;
        bottom: 10px;
        transform: none;
        justify-content: center;
        overflow-x: auto;
        animation: none;
    }
`;

const dockLinkStyles = `
    min-width: 46px;
    height: 46px;
    padding: 0 13px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid rgba(255,255,255,.085);
    border-radius: 999px;
    color: rgba(226,232,240,.68);
    background: rgba(255,255,255,.04);
    text-decoration: none !important;
    transition: .2s ease;

    span {
        max-width: 120px;
        overflow: hidden;
        font-size: 9px;
        font-weight: 850;
        letter-spacing: .07em;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-transform: uppercase;
    }

    &:hover {
        color: #fff;
        border-color: color-mix(in srgb,var(--pahri-accent) 44%,rgba(255,255,255,.1));
        background: linear-gradient(135deg,color-mix(in srgb,var(--pahri-accent) 22%,transparent),color-mix(in srgb,var(--pahri-accent-secondary) 12%,transparent));
        transform: translateY(-4px) scale(1.04);
        box-shadow: 0 14px 38px rgba(0,0,0,.32), 0 0 26px color-mix(in srgb,var(--pahri-accent) 18%,transparent);
    }

    @media (max-width: 880px) {
        span { display: none; }
    }
`;

const DockLink = styled.a`${dockLinkStyles}`;
const InternalLink = styled(Link)`${dockLinkStyles}`;

const Clock = styled.div`
    min-width: 88px;
    height: 46px;
    padding: 0 13px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border: 1px solid rgba(255,255,255,.085);
    border-radius: 999px;
    background: rgba(2,6,23,.44);

    strong { color: #fff; font-size: 12px; font-weight: 870; line-height: 1; }
    small { margin-top: 4px; color: rgba(226,232,240,.36); font-size: 7px; font-weight: 850; letter-spacing: .12em; text-transform: uppercase; }
    @media (max-width: 600px) { display: none; }
`;

const Support = styled.a`
    position: fixed;
    right: 18px;
    bottom: 92px;
    z-index: 1699;
    min-width: 54px;
    height: 54px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 999px;
    color: #fff;
    background: linear-gradient(135deg,var(--pahri-accent),var(--pahri-accent-secondary));
    box-shadow: 0 24px 70px rgba(0,0,0,.45), 0 0 38px color-mix(in srgb,var(--pahri-accent) 35%,transparent);
    text-decoration: none !important;
    transition: .22s ease;

    span { font-size: 10px; font-weight: 880; letter-spacing: .08em; text-transform: uppercase; }
    &:hover { color: #fff; transform: translateY(-4px) scale(1.03); filter: brightness(1.08); }

    @media (max-width: 760px) {
        right: 10px;
        bottom: 78px;
        height: 48px;
        min-width: 48px;
        padding: 0 13px;
        span { display: none; }
    }
`;

const Spotlight = styled.div`
    position: fixed;
    left: 18px;
    bottom: 92px;
    z-index: 1699;
    width: min(320px, calc(100vw - 36px));
    padding: 16px;
    border: 1px solid rgba(255,255,255,.105);
    border-radius: calc(var(--pahri-radius,24px) * .86);
    background: rgba(5,9,23,calc(var(--pahri-glass-opacity,.78) * .9));
    box-shadow: 0 24px 70px rgba(0,0,0,.42), inset 0 1px rgba(255,255,255,.065);
    backdrop-filter: blur(var(--pahri-blur,24px)) saturate(160%);

    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 14px;
        bottom: 14px;
        width: 3px;
        border-radius: 999px;
        background: linear-gradient(var(--pahri-accent),var(--pahri-accent-secondary));
        box-shadow: 0 0 16px var(--pahri-accent);
    }

    strong { display: block; color: #fff; font-size: 12px; font-weight: 860; letter-spacing: -.02em; }
    p { margin: 6px 0 0; color: rgba(226,232,240,.48); font-size: 10px; line-height: 1.6; }
    @media (max-width: 900px) { display: none; }
`;

const isSafeUrl = (url: string) => /^(https?:\/\/|\/)[^\s]+$/.test(url);

export default ({ authenticated, rootAdmin }: Props) => {
    const [runtime, setRuntime] = useState<RuntimeConfig>({});
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        fetch(`/themes/pahri/settings.json?dock=${Date.now()}`, { cache: 'no-store' })
            .then(response => response.ok ? response.json() : Promise.reject(new Error('Runtime unavailable')))
            .then((config: RuntimeConfig) => setRuntime(config || {}))
            .catch(() => setRuntime({}));
    }, []);

    useEffect(() => {
        const timer = window.setInterval(() => setTime(new Date()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    if (!authenticated || runtime.dock?.active === false) return null;

    const supportUrl = runtime.dock?.support_url && isSafeUrl(runtime.dock.support_url) ? runtime.dock.support_url : '/account';
    const supportLabel = runtime.dock?.support_label || 'Support';
    const spotlightTitle = runtime.dock?.spotlight_title || 'Nexus Dock Active';
    const spotlightMessage = runtime.dock?.spotlight_message || 'Quick actions, live time, support and custom links are ready from one floating dock.';
    const customLinks = Array.isArray(runtime.quick_links)
        ? runtime.quick_links.filter(link => link.label && isSafeUrl(link.url)).slice(0, 3)
        : [];

    return (
        <>
            <Spotlight>
                <strong>{spotlightTitle}</strong>
                <p>{spotlightMessage}</p>
            </Spotlight>
            <Support href={supportUrl}>
                <FontAwesomeIcon icon={faLifeRing} />
                <span>{supportLabel}</span>
            </Support>
            <DockWrap>
                <InternalLink to={'/'}><FontAwesomeIcon icon={faHome} /><span>Home</span></InternalLink>
                <InternalLink to={'/'}><FontAwesomeIcon icon={faServer} /><span>Servers</span></InternalLink>
                <InternalLink to={'/account'}><FontAwesomeIcon icon={faUserCircle} /><span>Account</span></InternalLink>
                {rootAdmin && <DockLink href={'/admin'}><FontAwesomeIcon icon={faCogs} /><span>Admin</span></DockLink>}
                {customLinks.map(link => (
                    <DockLink key={`${link.label}:${link.url}`} href={link.url}><FontAwesomeIcon icon={faExternalLinkAlt} /><span>{link.label}</span></DockLink>
                ))}
                <Clock><strong>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong><small><FontAwesomeIcon icon={faBolt} /> Nexus</small></Clock>
            </DockWrap>
        </>
    );
};
