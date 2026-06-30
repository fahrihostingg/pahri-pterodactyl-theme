import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faEthernet, faHdd, faMemory, faMicrochip, faServer } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerPowerState, ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import styled from 'styled-components/macro';

const Card = styled(Link)<{ $status?: ServerPowerState }>`
    min-height: 260px;
    padding: 22px;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(255,255,255,.1);
    border-radius: var(--pahri-radius, 24px);
    color: #fff;
    text-decoration: none !important;
    background:
        radial-gradient(circle at var(--card-x, 82%) var(--card-y, 12%), color-mix(in srgb, var(--pahri-accent-secondary) 18%, transparent), transparent 34%),
        radial-gradient(circle at 6% 100%, color-mix(in srgb, var(--pahri-accent) 12%, transparent), transparent 42%),
        linear-gradient(145deg, rgba(8,14,34,var(--pahri-glass-opacity,.78)), rgba(4,8,22,.82));
    box-shadow: 0 25px 78px rgba(0,0,0,.38), inset 0 1px rgba(255,255,255,.06);
    backdrop-filter: blur(var(--pahri-blur, 24px)) saturate(155%);
    transform: perspective(1000px) rotateX(var(--card-rx, 0deg)) rotateY(var(--card-ry, 0deg)) translateY(0);
    transform-style: preserve-3d;
    transition: transform .18s ease-out, border-color .22s ease, box-shadow .22s ease;
    will-change: transform;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        z-index: 5;
        background: ${({ $status }) =>
            !$status || $status === 'offline'
                ? 'linear-gradient(90deg, #ef4444, #fb7185)'
                : $status === 'running'
                ? 'linear-gradient(90deg, #22c55e, #2dd4bf)'
                : 'linear-gradient(90deg, #f59e0b, #facc15)'};
        box-shadow: 0 0 20px ${({ $status }) => ($status === 'running' ? '#22c55e' : $status === 'offline' ? '#ef4444' : '#f59e0b')};
    }

    &::after {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 1;
        border-radius: inherit;
        opacity: var(--card-glare, 0);
        background: radial-gradient(circle at var(--card-x, 50%) var(--card-y, 50%), rgba(255,255,255,.19), transparent 24%);
        transition: opacity .18s ease;
        pointer-events: none;
    }

    &:hover {
        color: #fff;
        border-color: color-mix(in srgb, var(--pahri-accent) 45%, rgba(255,255,255,.1));
        box-shadow: 0 42px 105px rgba(0,0,0,.55), 0 0 44px color-mix(in srgb, var(--pahri-accent) 15%, transparent), inset 0 1px rgba(255,255,255,.08);
    }
`;

const CornerShape = styled.span`
    position: absolute;
    width: 165px;
    height: 165px;
    right: -78px;
    bottom: -82px;
    z-index: 0;
    border: 1px solid rgba(255,255,255,.065);
    border-radius: calc(var(--pahri-radius, 24px) * 1.6);
    transform: rotate(34deg) translateZ(-15px);
    background: linear-gradient(135deg, rgba(255,255,255,.035), transparent);
`;

const Header = styled.div`
    position: relative;
    z-index: 3;
    display: flex;
    align-items: flex-start;
    gap: 13px;
    transform: translateZ(34px);
`;

const ServerIcon = styled.span`
    width: 50px;
    height: 50px;
    flex: 0 0 50px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255,255,255,.105);
    border-radius: calc(var(--pahri-radius, 24px) * .64);
    color: #fff;
    background: linear-gradient(135deg, color-mix(in srgb, var(--pahri-accent) 30%, transparent), color-mix(in srgb, var(--pahri-accent-secondary) 17%, transparent));
    box-shadow: inset 0 1px rgba(255,255,255,.085), 0 14px 34px rgba(0,0,0,.28), 0 0 25px color-mix(in srgb, var(--pahri-accent) 16%, transparent);
`;

const Name = styled.div`
    min-width: 0;
    flex: 1;

    h4 {
        margin: 1px 0 4px;
        overflow: hidden;
        color: #fff;
        font-size: 17px;
        font-weight: 840;
        letter-spacing: -.035em;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    p {
        margin: 0;
        overflow: hidden;
        color: rgba(226,232,240,.42);
        font-size: 11px;
        line-height: 1.5;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`;

const State = styled.span<{ $status?: ServerPowerState }>`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 9px;
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 999px;
    color: ${({ $status }) => ($status === 'running' ? '#86efac' : $status === 'offline' ? '#fda4af' : '#fde68a')};
    background: rgba(255,255,255,.035);
    font-size: 8px;
    font-weight: 900;
    letter-spacing: .09em;
    text-transform: uppercase;

    &::before {
        content: '';
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: ${({ $status }) => ($status === 'running' ? '#22c55e' : $status === 'offline' ? '#ef4444' : '#f59e0b')};
        box-shadow: 0 0 12px currentColor;
    }
`;

const Address = styled.div`
    margin-top: 20px;
    position: relative;
    z-index: 3;
    display: flex;
    align-items: center;
    gap: 8px;
    color: rgba(226,232,240,.48);
    font-size: 11px;
    transform: translateZ(24px);

    svg { color: var(--pahri-accent-secondary); }
`;

const Metrics = styled.div`
    margin-top: auto;
    padding-top: 20px;
    position: relative;
    z-index: 3;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    transform: translateZ(22px);
`;

const Metric = styled.div<{ $progress: number }>`
    min-width: 0;
    padding: 11px;
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.068);
    border-radius: calc(var(--pahri-radius, 24px) * .56);
    background: rgba(255,255,255,.026);

    &::after {
        content: '';
        position: absolute;
        left: 0;
        right: ${({ $progress }) => 100 - Math.max(0, Math.min(100, $progress))}%;
        bottom: 0;
        height: 2px;
        background: linear-gradient(90deg, var(--pahri-accent), var(--pahri-accent-secondary));
        box-shadow: 0 0 12px var(--pahri-accent);
    }

    span {
        display: flex;
        align-items: center;
        gap: 6px;
        color: rgba(226,232,240,.36);
        font-size: 8px;
        font-weight: 850;
        letter-spacing: .08em;
        text-transform: uppercase;
    }

    strong {
        display: block;
        margin-top: 7px;
        overflow: hidden;
        color: rgba(255,255,255,.9);
        font-size: 10px;
        font-weight: 770;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`;

const Enter = styled.span`
    position: absolute;
    right: 18px;
    bottom: 18px;
    z-index: 4;
    width: 35px;
    height: 35px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255,255,255,.085);
    border-radius: calc(var(--pahri-radius, 24px) * .46);
    color: rgba(255,255,255,.56);
    background: rgba(5,9,23,.68);
    box-shadow: 0 12px 30px rgba(0,0,0,.24);
    transform: translateZ(42px);
`;

type Timer = ReturnType<typeof setInterval>;

export default ({ server, className }: { server: Server; className?: string }) => {
    const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
    const [stats, setStats] = useState<ServerStats | null>(null);
    const suspended = stats?.isSuspended || server.status === 'suspended';

    const getStats = () => getServerResourceUsage(server.uuid).then(setStats).catch(() => undefined);

    useEffect(() => {
        if (suspended || server.isNodeUnderMaintenance) return;
        getStats().then(() => {
            interval.current = setInterval(() => getStats(), 30000);
        });
        return () => interval.current && clearInterval(interval.current);
    }, [suspended, server.isNodeUnderMaintenance]);

    const onMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const rotateY = ((x / rect.width) - .5) * 8;
        const rotateX = ((y / rect.height) - .5) * -7;
        event.currentTarget.style.setProperty('--card-x', `${(x / rect.width) * 100}%`);
        event.currentTarget.style.setProperty('--card-y', `${(y / rect.height) * 100}%`);
        event.currentTarget.style.setProperty('--card-rx', `${rotateX}deg`);
        event.currentTarget.style.setProperty('--card-ry', `${rotateY}deg`);
        event.currentTarget.style.setProperty('--card-glare', '1');
    };

    const onLeave = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.currentTarget.style.setProperty('--card-rx', '0deg');
        event.currentTarget.style.setProperty('--card-ry', '0deg');
        event.currentTarget.style.setProperty('--card-glare', '0');
    };

    const allocation = server.allocations.find(item => item.isDefault);
    const cpu = stats ? `${stats.cpuUsagePercent.toFixed(1)}%` : '--';
    const memory = stats ? bytesToString(stats.memoryUsageInBytes) : '--';
    const disk = stats ? bytesToString(stats.diskUsageInBytes) : '--';
    const memoryLimitBytes = server.limits.memory ? mbToBytes(server.limits.memory) : 0;
    const diskLimitBytes = server.limits.disk ? mbToBytes(server.limits.disk) : 0;
    const memoryLimit = memoryLimitBytes ? bytesToString(memoryLimitBytes) : 'Unlimited';
    const diskLimit = diskLimitBytes ? bytesToString(diskLimitBytes) : 'Unlimited';
    const cpuProgress = stats ? Math.min(100, stats.cpuUsagePercent) : 0;
    const memoryProgress = stats && memoryLimitBytes ? (stats.memoryUsageInBytes / memoryLimitBytes) * 100 : 0;
    const diskProgress = stats && diskLimitBytes ? (stats.diskUsageInBytes / diskLimitBytes) * 100 : 0;
    const status: ServerPowerState = suspended ? 'offline' : stats?.status || 'offline';

    return (
        <Card
            to={`/server/${server.id}`}
            className={className}
            $status={status}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
        >
            <CornerShape />
            <Header>
                <ServerIcon><FontAwesomeIcon icon={faServer} /></ServerIcon>
                <Name><h4>{server.name}</h4><p>{server.description || 'Aurelia managed server instance'}</p></Name>
                <State $status={status}>{suspended ? 'Suspended' : status}</State>
            </Header>
            <Address>
                <FontAwesomeIcon icon={faEthernet} />
                <span>{allocation ? `${allocation.alias || ip(allocation.ip)}:${allocation.port}` : 'No primary allocation'}</span>
            </Address>
            <Metrics>
                <Metric $progress={cpuProgress}><span><FontAwesomeIcon icon={faMicrochip} /> CPU</span><strong>{cpu}</strong></Metric>
                <Metric $progress={memoryProgress}><span><FontAwesomeIcon icon={faMemory} /> Memory</span><strong>{memory} / {memoryLimit}</strong></Metric>
                <Metric $progress={diskProgress}><span><FontAwesomeIcon icon={faHdd} /> Disk</span><strong>{disk} / {diskLimit}</strong></Metric>
            </Metrics>
            <Enter><FontAwesomeIcon icon={faArrowRight} /></Enter>
        </Card>
    );
};
