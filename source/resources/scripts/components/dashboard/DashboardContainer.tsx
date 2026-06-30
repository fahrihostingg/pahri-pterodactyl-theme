import React, { useEffect, useState } from 'react';
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
import styled from 'styled-components/macro';

const Hero = styled.section`
    min-height: 265px;
    margin-bottom: 24px;
    padding: 34px;
    position: relative;
    overflow: hidden;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 30px;
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 28px;
    background:
        radial-gradient(circle at 82% 22%, color-mix(in srgb, var(--pahri-accent-secondary) 28%, transparent), transparent 36%),
        radial-gradient(circle at 12% 88%, color-mix(in srgb, var(--pahri-accent) 28%, transparent), transparent 38%),
        linear-gradient(145deg, rgba(8,14,36,.9), rgba(3,7,20,.78));
    box-shadow: 0 30px 90px rgba(0,0,0,.42), inset 0 1px rgba(255,255,255,.07);
    backdrop-filter: blur(24px);

    &::after {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: .18;
        background-image: linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
        background-size: 38px 38px;
        mask-image: linear-gradient(90deg, #000, transparent 82%);
    }

    @media (max-width: 760px) { grid-template-columns: 1fr; padding: 26px; }
`;

const HeroCopy = styled.div`
    position: relative;
    z-index: 2;

    small {
        display: inline-flex;
        padding: 7px 10px;
        border: 1px solid rgba(255,255,255,.09);
        border-radius: 999px;
        color: #c4b5fd;
        background: rgba(139,92,246,.09);
        font-size: 9px;
        font-weight: 900;
        letter-spacing: .14em;
        text-transform: uppercase;
    }

    h2 {
        margin: 17px 0 10px;
        color: #fff;
        font-size: clamp(32px, 5vw, 58px);
        line-height: .98;
        letter-spacing: -.06em;
    }

    p {
        max-width: 650px;
        margin: 0;
        color: rgba(226,232,240,.55);
        font-size: 14px;
        line-height: 1.75;
    }
`;

const Orb = styled.div`
    width: 190px;
    height: 190px;
    position: relative;
    z-index: 2;
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 48px;
    background:
        linear-gradient(135deg, rgba(255,255,255,.11), rgba(255,255,255,.015)),
        var(--pahri-logo) center / 58% no-repeat;
    box-shadow: inset 0 1px rgba(255,255,255,.08), 0 28px 80px rgba(0,0,0,.4), 0 0 55px color-mix(in srgb, var(--pahri-accent) 25%, transparent);
    transform: perspective(800px) rotateX(9deg) rotateY(-14deg);
    backdrop-filter: blur(18px);

    &::before,
    &::after {
        content: '';
        position: absolute;
        border: 1px solid rgba(255,255,255,.1);
        border-radius: 24px;
        background: rgba(255,255,255,.025);
    }
    &::before { inset: -18px 23px 23px -18px; z-index: -1; }
    &::after { inset: 23px -18px -18px 23px; z-index: -2; }

    @media (max-width: 760px) { display: none; }
`;

const Toolbar = styled.div`
    margin-bottom: 17px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;

    h3 { margin: 0; color: #fff; font-size: 18px; font-weight: 820; letter-spacing: -.03em; }
    p { margin: 4px 0 0; color: rgba(226,232,240,.4); font-size: 10px; letter-spacing: .08em; text-transform: uppercase; }
`;

const AdminToggle = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 13px;
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
    padding: 58px 24px;
    border: 1px dashed rgba(255,255,255,.11);
    border-radius: 22px;
    color: rgba(226,232,240,.45);
    background: rgba(5,9,23,.4);
    text-align: center;
`;

export default () => {
    const { search } = useLocation();
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');
    const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const uuid = useStoreState((state) => state.user.data!.uuid);
    const username = useStoreState((state) => state.user.data!.username);
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(`${uuid}:show_all_servers`, false);

    const { data: servers, error } = useSWR<PaginatedResult<Server>>(
        ['/api/client/servers', showOnlyAdmin && rootAdmin, page],
        () => getServers({ page, type: showOnlyAdmin && rootAdmin ? 'admin' : undefined })
    );

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

    return (
        <PageContentBlock title={'Control Center'} showFlashKey={'dashboard'}>
            <Hero>
                <HeroCopy>
                    <small>Welcome back, {username}</small>
                    <h2>Your infrastructure,<br />elevated.</h2>
                    <p>Monitor resources, open consoles and manage every workload from one premium Pahri workspace.</p>
                </HeroCopy>
                <Orb aria-hidden={'true'} />
            </Hero>
            <Toolbar>
                <div><h3>Server Collection</h3><p>{servers ? `${servers.pagination.total} connected instances` : 'Loading instances'}</p></div>
                {rootAdmin && (
                    <AdminToggle>
                        <span>{showOnlyAdmin ? 'All servers' : 'My servers'}</span>
                        <Switch name={'show_all_servers'} defaultChecked={showOnlyAdmin} onChange={() => setShowOnlyAdmin(s => !s)} />
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
