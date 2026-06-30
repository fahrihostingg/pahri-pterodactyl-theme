import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components/macro';

const appear = keyframes`
    from { opacity: 0; transform: translate3d(0, 22px, 0) scale(.97); }
    to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
`;

type NoticeType = 'info' | 'success' | 'warning' | 'danger';

type Notice = {
    active: boolean;
    title: string;
    message: string;
    type: NoticeType;
    mode: 'banner' | 'modal';
    audience: 'all' | 'admins' | 'clients';
    dismissible: boolean;
    starts_at?: string | null;
    ends_at?: string | null;
    button_text?: string;
    button_url?: string;
    revision?: string;
};

type RuntimeConfig = {
    broadcast?: Notice;
};

type Props = {
    authenticated: boolean;
    rootAdmin: boolean;
};

const colour = (type: NoticeType, alpha: number) => {
    const rgb = type === 'success' ? '34,197,94' : type === 'warning' ? '245,158,11' : type === 'danger' ? '244,63,94' : '34,211,238';
    return `rgba(${rgb},${alpha})`;
};

const Layer = styled.div<{ $modal: boolean }>`
    position: fixed;
    inset: 0;
    z-index: 4900;
    padding: ${props => (props.$modal ? '9vh 18px 32px' : '0 18px 18px')};
    display: flex;
    align-items: ${props => (props.$modal ? 'flex-start' : 'flex-end')};
    justify-content: center;
    pointer-events: ${props => (props.$modal ? 'auto' : 'none')};
    background: ${props => (props.$modal ? 'rgba(1,3,12,.72)' : 'transparent')};
    backdrop-filter: ${props => (props.$modal ? 'blur(20px) saturate(140%)' : 'none')};
`;

const Card = styled.section<{ $type: NoticeType; $modal: boolean }>`
    width: ${props => (props.$modal ? 'min(690px, 100%)' : 'min(1120px, 100%)')};
    max-height: 78vh;
    padding: ${props => (props.$modal ? '28px' : '17px 18px')};
    position: relative;
    overflow: auto;
    display: grid;
    grid-template-columns: auto minmax(0,1fr) auto;
    align-items: center;
    gap: 15px;
    border: 1px solid ${props => colour(props.$type, .3)};
    border-radius: calc(var(--pahri-radius,24px) * ${props => (props.$modal ? '1.05' : '.78')});
    color: #fff;
    background:
        radial-gradient(circle at 8% 0%, ${props => colour(props.$type, .18)}, transparent 38%),
        linear-gradient(145deg, rgba(5,9,24,.96), rgba(2,6,18,.94));
    box-shadow: 0 40px 120px rgba(0,0,0,.58), 0 0 55px ${props => colour(props.$type, .12)}, inset 0 1px rgba(255,255,255,.08);
    backdrop-filter: blur(var(--pahri-blur,24px)) saturate(160%);
    pointer-events: auto;
    animation: ${appear} .34s ease both;

    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: ${props => (props.$modal ? '22px' : '12px')};
        bottom: ${props => (props.$modal ? '22px' : '12px')};
        width: 3px;
        border-radius: 999px;
        background: ${props => colour(props.$type, 1)};
        box-shadow: 0 0 18px ${props => colour(props.$type, .75)};
    }

    @media (max-width: 640px) {
        grid-template-columns: auto minmax(0,1fr);
        padding: 17px;
    }
`;

const Icon = styled.span<{ $type: NoticeType }>`
    width: 48px;
    height: 48px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid ${props => colour(props.$type, .28)};
    border-radius: 15px;
    color: ${props => colour(props.$type, 1)};
    background: ${props => colour(props.$type, .09)};
    box-shadow: inset 0 1px rgba(255,255,255,.05), 0 12px 28px rgba(0,0,0,.2);
    font-size: 18px;
    font-weight: 900;
`;

const Copy = styled.div`
    min-width: 0;

    strong { display: block; color: #fff; font-size: 14px; font-weight: 860; letter-spacing: -.02em; }
    p { margin: 5px 0 0; color: rgba(226,232,240,.58); font-size: 11px; line-height: 1.65; white-space: pre-wrap; }
`;

const Actions = styled.div`
    display: flex;
    align-items: center;
    gap: 7px;

    a,
    button {
        min-height: 38px;
        padding: 0 12px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(255,255,255,.09);
        border-radius: calc(var(--pahri-radius,24px) * .48);
        color: rgba(255,255,255,.76);
        background: rgba(255,255,255,.045);
        font-size: 9px;
        font-weight: 850;
        letter-spacing: .07em;
        text-decoration: none;
        text-transform: uppercase;
        transition: .18s ease;
    }

    a { color: #fff; background: linear-gradient(135deg,var(--pahri-accent),var(--pahri-accent-secondary)); }
    a:hover, button:hover { color: #fff; transform: translateY(-1px); filter: brightness(1.08); }

    @media (max-width: 640px) { grid-column: 1 / -1; justify-content: flex-end; }
`;

export default ({ authenticated, rootAdmin }: Props) => {
    const [notice, setNotice] = useState<Notice | null>(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        fetch(`/themes/pahri/settings.json?runtime=${Date.now()}`, { cache: 'no-store' })
            .then(response => response.ok ? response.json() : Promise.reject(new Error('Runtime config unavailable')))
            .then((config: RuntimeConfig) => {
                const next = config.broadcast || null;
                setNotice(next);
                const revision = next?.revision || 'default';
                setDismissed(window.localStorage.getItem(`pahri-broadcast:${revision}`) === 'dismissed');
            })
            .catch(() => setNotice(null));
    }, []);

    if (!notice?.active || (!notice.title && !notice.message) || dismissed) return null;

    const now = Date.now();
    const startsAt = notice.starts_at ? new Date(notice.starts_at).getTime() : null;
    const endsAt = notice.ends_at ? new Date(notice.ends_at).getTime() : null;
    const audienceMatches = notice.audience === 'all'
        || (notice.audience === 'admins' && authenticated && rootAdmin)
        || (notice.audience === 'clients' && authenticated && !rootAdmin);

    if (!audienceMatches) return null;
    if (startsAt && !Number.isNaN(startsAt) && now < startsAt) return null;
    if (endsAt && !Number.isNaN(endsAt) && now > endsAt) return null;

    const dismiss = () => {
        const revision = notice.revision || 'default';
        window.localStorage.setItem(`pahri-broadcast:${revision}`, 'dismissed');
        setDismissed(true);
    };

    const symbol = notice.type === 'danger' ? '!' : notice.type === 'warning' ? '△' : notice.type === 'success' ? '✓' : 'i';

    return (
        <Layer $modal={notice.mode === 'modal'}>
            <Card $type={notice.type} $modal={notice.mode === 'modal'} role={notice.mode === 'modal' ? 'dialog' : 'status'} aria-live={'polite'}>
                <Icon $type={notice.type}>{symbol}</Icon>
                <Copy>
                    <strong>{notice.title || 'Pahri Broadcast'}</strong>
                    {notice.message && <p>{notice.message}</p>}
                </Copy>
                <Actions>
                    {notice.button_text && notice.button_url && <a href={notice.button_url}>{notice.button_text}</a>}
                    {notice.dismissible && <button type={'button'} onClick={dismiss}>Dismiss</button>}
                </Actions>
            </Card>
        </Layer>
    );
};
