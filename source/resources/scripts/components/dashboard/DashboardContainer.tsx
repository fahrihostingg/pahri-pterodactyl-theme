import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faGlobeAsia, faServer, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { Server } from '@/api/server/getServer';
import getServers from '@/api/getServers';
import ServerRow from '@/components/dashboard/ServerRow';
import Spinner from '@/components/elements/Spinner';
import PageContentBlock from '@/components/elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from 'easy-peasy';
import { usePersistedState } from '@/plugins/usePersistedState';
import Switch from '@/components/elements/Switch';
import useSWR from 'swr';
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import { useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components/macro';

const rotate = keyframes`
    from { transform: rotateX(66deg) rotateZ(0deg); }
    to { transform: rotateX(66deg) rotateZ(360deg); }
`;

const breathe = keyframes`
    0%, 100% { transform: scale(.94); opacity: .62; }
    50% { transform: scale(1.08); opacity: 1; }
`;

const Hero = styled.section`
    min-height: 320px;
    margin-bottom: 18px;
    padding: 38px;
    position: relative;
    overflow: hidden;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 300px;
    align-items: center;
    gap: 30px;
    border: 1px solid rgba(255,255,255,.105);
    border-radius: calc(var(--pahri-radius, 24px) * 1.2);
    background:
        radial-gradient(circle at 83% 22%, color-mix(in srgb, var(--pahri-accent-secondary) 28%, transparent), transparent 35%),
        radial-gradient(circle at 12% 88%, color-mix(in srgb, var(--pahri-accent) 30%, transparent), transparent 38%),
        linear-gradient(145deg, rgba(8,14,36,var(--pahri-glass-opacity,.78)), rgba(3,7,20,.84));
    box-shadow: 0 38px 110px rgba(0,0,0,.48), inset 0 1px rgba(255,255,255,.075);
    backdrop-filter: blur(var(--pahri-blur, 24px)) saturate(160%);

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: .2;
        background-image:
            linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px);
        background-size: 38px 38px;
        mask-image: linear-gradient(90deg, #000, transparent 86%);
    }

    &::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        box-shadow: inset 0 0 90px color-mix(in srgb, var(--pahri-accent) 5%, transparent);
    }

    @media (max-width: 880px) { grid-template-columns: 1fr; min-height: 270px; padding: 28px; }
`;

const HeroCopy = styled.div`
    position: relative;
    z-index: 2;

    small {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 8px 11px;
        border: 1px solid rgba(255,255,255,.095);
        border-radius: 999px;
        color: #ddd6fe;
        background: color-mix(in srgb, var(--pahri-accent) 10%, transparent);
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

    h2 {
        margin: 19px 0 12px;
        color: #fff;
        font-size: clamp(38px, 5.3vw, 66px);
        line-height: .93;
        letter-spacing: -.068em;
        text-wrap: balance;
    }

    h2 span {
        color: transparent;
        background: linear-gradient(100deg, #fff 5%, #ddd6fe 40%, #67e8f9 88%);
        background-clip: text;
        -webkit-background-clip: text;
    }

    p {
        max-width: 660px;
        margin: 0;
        color: rgba(226,232,240,.54);
        font-size: 14px;
        line-height: 1.8;
    }
`;

const Hologram = styled.div`
    width: 245px;
    height: 245px;
    margin: auto;
    position: relative;
    z-index: 2;
    display: grid;
    place-items: center;
    perspective: 900px;

    @media (max-width: 880px) { display: none; }
`;

const Core = styled.div`
    width: 112px;
    height: 112px;
    position: relative;
    z-index: 4;
    border: 1px solid rgba(255,255,255,.14);
    border-radius: calc(var(--pahri-radius, 24px) * 1.25);
    background:
        var(--pahri-logo) center / 62% no-repeat,
        linear-gradient(135deg, rgba(255,255,255,.14), rgba(255,255,255,.02));
    box-shadow: inset 0 1px rgba(255,255,255,.09), 0 34px 90px rgba(0,0,0,.48), 0 0 55px color-mix(in srgb, var(--pahri-accent) 34%, transparent);
    transform: rotateX(8deg) rotateY(-13deg);
    animation: ${breathe} calc(var(--pahri-motion-duration, 18s) * .32) ease-in-out infinite;
    animation-play-state: var(--pahri-animation-state);
`;

const Ring = styled.span<{ $size: number; $reverse?: boolean }>`
    position: absolute;
    width: ${props => props.$size}px;
    height: ${props => props.$size}px;
    border: 1px solid ${props => (props.$reverse ? 'color-mix(in srgb, var(--pahri-accent-secondary) 42%, transparent)' : 'color-mix(in srgb, var(--pahri-accent) 42%, transparent)')};
    border-radius: 50%;
    box-shadow: 0 0 35px ${props => (props.$reverse ? 'color-mix(in srgb, var(--pahri-accent-secondary) 12%, transparent)' : 'color-mix(in srgb, var(--pahri-accent) 12%, transparent)')};
    animation: ${rotate} ${props => (props.$reverse ? '13s' : '18s')} linear infinite ${props => (props.$reverse ? 'reverse' : 'normal')};
    animation-play-state: var(--pahri-animation-state);

    &::before,
    &::after {
        content: '';
        position: absolute;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: ${props => (props.$reverse ? 'var(--pahri-accent-secondary)' : 'var(--pahri-accent)')};
        box-shadow: 0 0 16px currentColor;
    }
    &::before { top: -4px; left: 50%; }
    &::after { bottom: -4px; left: 22%; }
`;

const StatGrid = styled.section`
    margin: 0 0 25px;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;

    @media (max-width: 900px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    @media (max-width: 520px) { grid-template-columns: 1fr; }
`;

const StatCard = styled.div`
    min-height: 112px;
    padding: 16px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    gap: 13px;
    border: 1px solid rgba(255,255,255,.085);
    border-radius: calc(var(--pahri-radius, 24px) * .82);
    background: rgba(5,9,23,calc(var(--pahri-glass-opacity,.78) * .72));
    box-shadow: 0 18px 55px rgba(0,0,0,.27), inset 0 1px rgba(255,255,255,.045);
    backdrop-filter: blur(var(--pahri-blur, 24px));

    &::after {
        content: '';
        position: absolute;
        width: 90px;
        height: 90px;
        right: -40px;
        top: -44px;
        border-radius: 50%;
        background: color-mix(in srgb, var(--pahri-accent) 17%, transparent);
        filter: blur(18px);
    }
`;

const StatIcon = styled.span`
    width: 45px;
    height: 45px;
    flex: 0 0 45px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255,255,255,.085);
    border-radius: 14px;
    color: #fff;
    background: linear-gradient(135deg, color-mix(in srgb, var(--pahri-accent) 24%, transparent), color-mix(in srgb, var(--pahri-accent-secondary) 13%, transparent));
    box-shadow: inset 0 1px rgba(255,255,255,.07), 0 12px 30px rgba(0,0,0,.22);
`;

const StatCopy = styled.div`
    min-width: 0;
    position: relative;
    z-index: 2;

    small { display: block; color: rgba(226,232,240,.35); font-size: 8px; font-weight: 850; letter-spacing: .12em; text-transform: uppercase; }
    strong { display: block; margin-top: 7px; overflow: hidden; color: #fff; font-size: 17px; font-weight: 830; letter-spacing: -.025em; text-overflow: ellipsis; white-space: nowrap; }
    span { display: block; margin-top: 3px; color: rgba(226,232,240,.38); font-size: 9px; }
`;

const Toolbar = styled.div`
    margin-bottom: 17px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;

    h3 { margin: 0; color: #fff; font-size: 19px; font-weight: 840; letter-spacing: -.035em; }
    p { margin: 4px 0 0; color: rgba(226,232,240,.38); font-size: 9px; letter-spacing: .1em; text-transform: uppercase; }
`;

const AdminToggle = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border: 1px solid rgba(255,255,255,.08);
    border-radius: calc(var(--pahri-radius, 24px) * .54);
    background: rgba(5,9,23,.48);
    color: rgba(226,232,240,.55);
    font-size: 9px;
    font-weight: 800;
    letter-spacing: .1em;
    text-transform: uppercase;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;

    @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const Empty = styled.div`
    padding: 62px 24px;
    border: 1px dashed rgba(255,255,255,.11);
    border-radius: var(--pahri-radius, 24px);
    color: rgba(226,232,240,.44);
    background: rgba(5,9,23,.4);
    text-align: center;
`;

export default () => {
    const { search } = useLocation();
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');
    const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);
    const [now, setNow] = useState(new Date());
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const uuid = useStoreState(state => state.user.data!.uuid);
    const username = useStoreState(state => state.user.data!.username);
    const rootAdmin = useStoreState(state => state.user.data!.rootAdmin);
    const useTotp = useStoreState(state => state.user.data!.useTotp);
    const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(`${uuid}:show_all_servers`, false);

    const { data: servers, error } = useSWR<PaginatedResult<Server>>(
        ['/api/client/servers', showOnlyAdmin && rootAdmin, page],
        () => getServers({ page, type: showOnlyAdmin && rootAdmin ? 'admin' : undefined })
    );

    useEffect(() => {
        const timer = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(timer);
    }, []);
    useEffect(() => setPage(1), [showOnlyAdmin]);
    useEffect(() => {
        if (servers && servers.pagination.currentPage > 1 && !servers.items.length) setPage(1);
    }, [servers?.pagination.currentPage]);
    useEffect(() => {
        window.history.replaceState(null, document.title, `/${page <= 1 ? '' : `?page=${page}`}`);
    }, [page]);
    useEffect(() => {
        if (error) clearAndAddHttpError({ key: 'dashboard', error });
        if (!error) clearFlashes('dashboard');
    }, [error]);

    const hour = now.getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local timezone';

    return (
        <PageContentBlock title={'Aurelia Control'} showFlashKey={'dashboard'}>
            <Hero>
                <HeroCopy>
                    <small>{greeting}, {username}</small>
                    <h2>Command your world<br /><span>with absolute clarity.</span></h2>
                    <p>A spatial control environment for monitoring resources, opening consoles and managing every workload with precision.</p>
                </HeroCopy>
                <Hologram aria-hidden={'true'}>
                    <Ring $size={220} />
                    <Ring $size={168} $reverse />
                    <Core />
                </Hologram>
            </Hero>

            <StatGrid>
                <StatCard>
                    <StatIcon><FontAwesomeIcon icon={faServer} /></StatIcon>
                    <StatCopy><small>Instances</small><strong>{servers ? servers.pagination.total : '—'}</strong><span>Connected to workspace</span></StatCopy>
                </StatCard>
                <StatCard>
                    <StatIcon><FontAwesomeIcon icon={faShieldAlt} /></StatIcon>
                    <StatCopy><small>Security</small><strong>{useTotp ? '2FA Protected' : 'Standard'}</strong><span>Encrypted account session</span></StatCopy>
                </StatCard>
                <StatCard>
                    <StatIcon><FontAwesomeIcon icon={faClock} /></StatIcon>
                    <StatCopy><small>Local Time</small><strong>{time}</strong><span>Live synchronized clock</span></StatCopy>
                </StatCard>
                <StatCard>
                    <StatIcon><FontAwesomeIcon icon={faGlobeAsia} /></StatIcon>
                    <StatCopy><small>Workspace</small><strong>{rootAdmin ? 'Root Admin' : 'Client'}</strong><span>{timezone}</span></StatCopy>
                </StatCard>
            </StatGrid>

            <Toolbar>
                <div><h3>Server Collection</h3><p>{servers ? `${servers.pagination.total} connected instances` : 'Loading instances'}</p></div>
                {rootAdmin && (
                    <AdminToggle>
                        <span>{showOnlyAdmin ? 'All servers' : 'My servers'}</span>
                        <Switch name={'show_all_servers'} defaultChecked={showOnlyAdmin} onChange={() => setShowOnlyAdmin(state => !state)} />
                    </AdminToggle>
                )}
            </Toolbar>

            {!servers ? (
                <Spinner centered size={'large'} />
            ) : (
                <Pagination data={servers} onPageSelect={setPage}>
                    {({ items }) => items.length > 0 ? (
                        <Grid>{items.map(server => <ServerRow key={server.uuid} server={server} />)}</Grid>
                    ) : (
                        <Empty>{showOnlyAdmin ? 'No additional servers are available.' : 'No servers are assigned to this account yet.'}</Empty>
                    )}
                </Pagination>
            )}
        </PageContentBlock>
    );
};
