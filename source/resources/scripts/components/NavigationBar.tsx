import * as React from 'react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCogs, faLayerGroup, faSignOutAlt, faServer } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import styled from 'styled-components/macro';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Avatar from '@/components/Avatar';

const Shell = styled.header`
    width: min(1220px, calc(100% - 30px));
    height: 74px;
    margin: 14px auto 0;
    padding: 9px 12px;
    position: sticky;
    top: 12px;
    z-index: 900;
    display: flex;
    align-items: center;
    gap: 14px;
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 23px;
    background: rgba(4,8,22,.72);
    box-shadow: 0 22px 70px rgba(0,0,0,.38), inset 0 1px rgba(255,255,255,.07);
    backdrop-filter: blur(26px) saturate(150%);

    @media (max-width: 700px) {
        width: calc(100% - 16px);
        height: 64px;
        top: 8px;
        margin-top: 8px;
        border-radius: 19px;
    }
`;

const Brand = styled(Link)`
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 12px;
    color: #fff;
    text-decoration: none !important;
`;

const Logo = styled.span`
    width: 48px;
    height: 48px;
    flex: 0 0 48px;
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 16px;
    background-image: var(--pahri-logo), linear-gradient(135deg, rgba(255,255,255,.14), rgba(255,255,255,.025));
    background-size: 76%, cover;
    background-repeat: no-repeat;
    background-position: center;
    box-shadow: 0 16px 42px rgba(0,0,0,.3), 0 0 30px color-mix(in srgb, var(--pahri-accent) 42%, transparent);
`;

const BrandCopy = styled.span`
    min-width: 0;
    display: flex;
    flex-direction: column;

    strong {
        max-width: 220px;
        overflow: hidden;
        color: #fff;
        font-size: 15px;
        font-weight: 850;
        letter-spacing: -.03em;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    small {
        margin-top: 3px;
        color: rgba(226,232,240,.43);
        font-size: 8px;
        font-weight: 850;
        letter-spacing: .15em;
        text-transform: uppercase;
    }

    @media (max-width: 580px) { display: none; }
`;

const Center = styled.nav`
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 6px;

    a {
        height: 42px;
        padding: 0 13px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: 1px solid transparent;
        border-radius: 13px;
        color: rgba(226,232,240,.58);
        font-size: 11px;
        font-weight: 760;
        text-decoration: none !important;
        transition: .2s ease;
    }

    a:hover,
    a.active {
        color: #fff;
        border-color: rgba(255,255,255,.09);
        background: linear-gradient(135deg, color-mix(in srgb, var(--pahri-accent) 18%, transparent), color-mix(in srgb, var(--pahri-accent-secondary) 10%, transparent));
        box-shadow: inset 0 1px rgba(255,255,255,.05);
    }

    @media (max-width: 820px) {
        a span { display: none; }
        a { width: 42px; padding: 0; justify-content: center; }
    }
`;

const Actions = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;

    & > a,
    & > button,
    & > div {
        width: 42px;
        height: 42px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(255,255,255,.08);
        border-radius: 13px;
        color: rgba(226,232,240,.64);
        background: rgba(255,255,255,.035);
        transition: .2s ease;
    }

    & > a:hover,
    & > button:hover {
        color: #fff;
        border-color: color-mix(in srgb, var(--pahri-accent) 40%, rgba(255,255,255,.08));
        background: rgba(139,92,246,.13);
        transform: translateY(-1px);
    }

    button { cursor: pointer; }
`;

const Live = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 10px;
    border: 1px solid rgba(34,197,94,.18);
    border-radius: 999px;
    color: #86efac;
    background: rgba(34,197,94,.07);
    font-size: 8px;
    font-weight: 900;
    letter-spacing: .1em;

    &::before {
        content: '';
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #22c55e;
        box-shadow: 0 0 14px #22c55e;
    }

    @media (max-width: 1020px) { display: none; }
`;

export default () => {
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    return (
        <Shell>
            <SpinnerOverlay visible={isLoggingOut} />
            <Brand to={'/'}>
                <Logo />
                <BrandCopy><strong>Pahri Panel</strong><small>Luxury Control Center</small></BrandCopy>
            </Brand>
            <Center>
                <NavLink to={'/'} exact><FontAwesomeIcon icon={faLayerGroup} /><span>Dashboard</span></NavLink>
                <NavLink to={'/'}><FontAwesomeIcon icon={faServer} /><span>Servers</span></NavLink>
                {rootAdmin && <a href={'/admin'}><FontAwesomeIcon icon={faCogs} /><span>Admin</span></a>}
            </Center>
            <Live>SYSTEM ONLINE</Live>
            <Actions>
                <SearchContainer />
                <Tooltip placement={'bottom'} content={'Account Settings'}>
                    <NavLink to={'/account'}><span className={'flex items-center w-5 h-5'}><Avatar.User /></span></NavLink>
                </Tooltip>
                <Tooltip placement={'bottom'} content={'Sign Out'}>
                    <button onClick={onTriggerLogout}><FontAwesomeIcon icon={faSignOutAlt} /></button>
                </Tooltip>
            </Actions>
        </Shell>
    );
};
