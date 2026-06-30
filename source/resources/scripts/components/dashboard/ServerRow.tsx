import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faEthernet, faHdd, faMemory, faMicrochip, faServer } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerPowerState, ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import styled from 'styled-components/macro';

const Card = styled(Link)<{ $status?: ServerPowerState }>`
    min-height: 238px;
    padding: 22px;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(255,255,255,.095);
    border-radius: 23px;
    color: #fff;
    text-decoration: none !important;
    background:
        radial-gradient(circle at 92% 5%, color-mix(in srgb, var(--pahri-accent-secondary) 16%, transparent), transparent 34%),
        linear-gradient(145deg, rgba(8,14,34,.9), rgba(4,8,22,.76));
    box-shadow: 0 22px 68px rgba(0,0,0,.34), inset 0 1px rgba(255,255,255,.055);
    backdrop-filter: blur(20px);
    transition: transform .22s ease, border-color .22s ease, box-shadow .22s ease;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: ${({ $status }) =>
            !$status || $status === 'offline'
                ? 'linear-gradient(90deg, #ef4444, #fb7185)'
                : $status === 'running'
                ? 'linear-gradient(90deg, #22c55e, #2dd4bf)'
                : 'linear-gradient(90deg, #f59e0b, #facc15)'};
        box-shadow: 0 0 18px ${({ $status }) => ($status === 'running' ? '#22c55e' : $status === 'offline' ? '#ef4444' : '#f59e0b')};
    }

    &::after {
        content: '';
        position: absolute;
        width: 150px;
        height: 150px;
        right: -72px;
        bottom: -75px;
        border: 1px solid rgba(255,255,255,.06);
        border-radius: 40px;
        transform: rotate(32deg);
        background: rgba(255,255,255,.02);
    }

    &:hover {
        color: #fff;
        transform: translateY(-5px) rotateX(1deg);
        border-color: color-mix(in srgb, var(--pahri-accent) 42%, rgba(255,255,255,.1));
        box-shadow: 0 34px 88px rgba(0,0,0,.48), 0 0 38px color-mix(in srgb, var(--pahri-accent) 14%, transparent);
    }
`;

const Header = styled.div`
    position: relative;
    z-index: 2;
    display: flex;
    align-items: flex-start;
    gap: 13px;
`;

const ServerIcon = styled.span`
    width: 48px;
    height: 48px;
    flex: 0 0 48px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 15px;
    color: #fff;
    background: linear-gradient(135deg, color-mix(in srgb, var(--pahri-accent) 28%, transparent), color-mix(in srgb, var(--pahri-accent-secondary) 16%, transparent));
    box-shadow: inset 0 1px rgba(255,255,255,.08), 0 12px 30px rgba(0,0,0,.25);
`;

const Name = styled.div`
    min-width: 0;
    flex: 1;

    h4 {
        margin: 1px 0 4px;
        overflow: hidden;
        color: #fff;
        font-size: 17px;
        font-weight: 820;
        letter-spacing: -.03em;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    p {
        margin: 0;
        overflow: hidden;
        color: rgba(226,232,240,.43);
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
        box-shadow: 0 0 11px currentColor;
    }
`;

const Address = styled.div`
    margin-top: 19px;
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 8px;
    color: rgba(226,232,240,.5);
    font-size: 11px;

    svg { color: var(--pahri-accent-secondary); }
`;

const Metrics = styled.div`
    margin-top: auto;
    padding-top: 18px;
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
`;

const Metric = styled.div`
    padding: 10px;
    border: 1px solid rgba(255,255,255,.065);
    border-radius: 13px;
    background: rgba(255,255,255,.025);

    span {
        display: flex;
        align-items: center;
        gap: 6px;
        color: rgba(226,232,240,.38);
        font-size: 8px;
        font-weight: 850;
        letter-spacing: .08em;
        text-transform: uppercase;
    }

    strong {
        display: block;
        margin-top: 6px;
        overflow: hidden;
        color: rgba(255,255,255,.88);
        font-size: 11px;
        font-weight: 760;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`;

const Enter = styled.span`
    position: absolute;
    right: 18px;
    bottom: 18px;
    z-index: 3;
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 11px;
    color: rgba(255,255,255,.55);
    background: rgba(5,9,23,.62);
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

    const allocation = server.allocations.find(item => item.isDefault);
    const cpu = stats ? `${stats.cpuUsagePercent.toFixed(1)}%` : '--';
    const memory = stats ? bytesToString(stats.memoryUsageInBytes) : '--';
    const disk = stats ? bytesToString(stats.diskUsageInBytes) : '--';
    const memoryLimit = server.limits.memory ? bytesToString(mbToBytes(server.limits.memory)) : 'Unlimited';
    const diskLimit = server.limits.disk ? bytesToString(mbToBytes(server.limits.disk)) : 'Unlimited';
    const status: ServerPowerState = suspended ? 'offline' : stats?.status || 'offline';

    return (
        <Card to={`/server/${server.id}`} className={className} $status={status}>
            <Header>
                <ServerIcon><FontAwesomeIcon icon={faServer} /></ServerIcon>
                <Name><h4>{server.name}</h4><p>{server.description || 'Premium managed server instance'}</p></Name>
                <State $status={status}>{suspended ? 'Suspended' : status}</State>
            </Header>
            <Address>
                <FontAwesomeIcon icon={faEthernet} />
                <span>{allocation ? `${allocation.alias || ip(allocation.ip)}:${allocation.port}` : 'No primary allocation'}</span>
            </Address>
            <Metrics>
                <Metric><span><FontAwesomeIcon icon={faMicrochip} /> CPU</span><strong>{cpu}</strong></Metric>
                <Metric><span><FontAwesomeIcon icon={faMemory} /> Memory</span><strong>{memory} / {memoryLimit}</strong></Metric>
                <Metric><span><FontAwesomeIcon icon={faHdd} /> Disk</span><strong>{disk} / {diskLimit}</strong></Metric>
            </Metrics>
            <Enter><FontAwesomeIcon icon={faArrowRight} /></Enter>
        </Card>
    );
};
