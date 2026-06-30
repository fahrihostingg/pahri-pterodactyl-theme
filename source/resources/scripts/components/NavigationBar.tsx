import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBolt,
    faCogs,
    faLayerGroup,
    faSearch,
    faServer,
    faSignOutAlt,
    faTimes,
    faUserCircle,
} from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import styled from 'styled-components/macro';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Avatar from '@/components/Avatar';

const Shell = styled.header`
    width: min(1240px, calc(100% - 30px));
    height: 76px;
    margin: 14px auto 0;
    padding: 9px 12px;
    position: sticky;
    top: 12px;
    z-index: 900;
    display: flex;
    align-items: center;
    gap: 14px;
    border: 1px solid rgba(255,255,255,.105);
    border-radius: var(--pahri-radius, 24px);
    background: rgba(4,8,22,var(--pahri-glass-opacity,.78));
    box-shadow: 0 25px 90px rgba(0,0,0,.44), inset 0 1px rgba(255,255,255,.075), 0 0 0 1px rgba(139,92,246,.025);
    backdrop-filter: blur(var(--pahri-blur, 24px)) saturate(165%);

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: -1;
        border-radius: inherit;
        opacity: .58;
        background: linear-gradient(112deg, color-mix(in srgb, var(--pahri-accent) 9%, transparent), transparent 38%, color-mix(in srgb, var(--pahri-accent-secondary) 7%, transparent));
        pointer-events: none;
    }

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
    width: 50px;
    height: 50px;
    flex: 0 0 50px;
    border: 1px solid rgba(255,255,255,.13);
    border-radius: calc(var(--pahri-radius, 24px) * .68);
    background-image: var(--pahri-logo), linear-gradient(135deg, rgba(255,255,255,.15), rgba(255,255,255,.025));
    background-size: 76%, cover;
    background-repeat: no-repeat;
    background-position: center;
    box-shadow: 0 18px 48px rgba(0,0,0,.34), 0 0 34px color-mix(in srgb, var(--pahri-accent) 44%, transparent), inset 0 1px rgba(255,255,255,.08);
    transform: perspective(400px) rotateX(5deg) rotateY(-7deg);
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
        font-weight: 880;
        letter-spacing: -.035em;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    small {
        margin-top: 3px;
        color: rgba(226,232,240,.42);
        font-size: 8px;
        font-weight: 850;
        letter-spacing: .17em;
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
        border-radius: calc(var(--pahri-radius, 24px) * .54);
        color: rgba(226,232,240,.56);
        font-size: 11px;
        font-weight: 760;
        text-decoration: none !important;
        transition: .22s ease;
    }

    a:hover,
    a.active {
        color: #fff;
        border-color: rgba(255,255,255,.095);
        background: linear-gradient(135deg, color-mix(in srgb, var(--pahri-accent) 20%, transparent), color-mix(in srgb, var(--pahri-accent-secondary) 11%, transparent));
        box-shadow: inset 0 1px rgba(255,255,255,.06), 0 10px 28px rgba(0,0,0,.2);
        transform: translateY(-1px);
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
        border-radius: calc(var(--pahri-radius, 24px) * .54);
        color: rgba(226,232,240,.62);
        background: rgba(255,255,255,.035);
        transition: .2s ease;
    }

    & > a:hover,
    & > button:hover {
        color: #fff;
        border-color: color-mix(in srgb, var(--pahri-accent) 42%, rgba(255,255,255,.08));
        background: color-mix(in srgb, var(--pahri-accent) 13%, rgba(255,255,255,.03));
        transform: translateY(-2px);
        box-shadow: 0 12px 30px rgba(0,0,0,.28);
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

    @media (max-width: 1060px) { display: none; }
`;

const ShortcutButton = styled.button`
    width: auto !important;
    padding: 0 10px !important;
    gap: 7px;

    span {
        color: rgba(226,232,240,.42);
        font-size: 9px;
        font-weight: 850;
        letter-spacing: .08em;
    }

    kbd {
        padding: 3px 5px;
        border: 1px solid rgba(255,255,255,.09);
        border-radius: 6px;
        color: rgba(255,255,255,.7);
        background: rgba(0,0,0,.24);
        font: 800 8px/1 system-ui, sans-serif;
    }

    @media (max-width: 930px) {
        width: 42px !important;
        padding: 0 !important;
        span, kbd { display: none; }
    }
`;

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    z-index: 5000;
    padding: 12vh 18px 40px;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    background: rgba(1,3,12,.68);
    backdrop-filter: blur(20px) saturate(135%);
`;

const Palette = styled.div`
    width: min(650px, 100%);
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.12);
    border-radius: var(--pahri-radius, 24px);
    background: rgba(5,9,24,.94);
    box-shadow: 0 45px 140px rgba(0,0,0,.68), 0 0 65px color-mix(in srgb, var(--pahri-accent) 12%, transparent), inset 0 1px rgba(255,255,255,.08);
`;

const PaletteHeader = styled.div`
    padding: 14px;
    display: flex;
    align-items: center;
    gap: 11px;
    border-bottom: 1px solid rgba(255,255,255,.075);

    svg { color: var(--pahri-accent-secondary); }

    input {
        min-width: 0;
        flex: 1;
        padding: 10px 2px;
        border: 0;
        outline: none;
        color: #fff;
        background: transparent;
        font-size: 15px;
    }

    input::placeholder { color: rgba(226,232,240,.32); }

    button {
        width: 34px;
        height: 34px;
        border: 1px solid rgba(255,255,255,.07);
        border-radius: 10px;
        color: rgba(255,255,255,.48);
        background: rgba(255,255,255,.035);
    }
`;

const PaletteList = styled.div`
    max-height: 410px;
    padding: 8px;
    overflow-y: auto;
`;

const Command = styled.button`
    width: 100%;
    padding: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    border: 1px solid transparent;
    border-radius: calc(var(--pahri-radius, 24px) * .58);
    color: rgba(241,245,249,.74);
    background: transparent;
    text-align: left;
    transition: .18s ease;

    &:hover,
    &:focus {
        color: #fff;
        border-color: rgba(255,255,255,.085);
        outline: none;
        background: linear-gradient(135deg, color-mix(in srgb, var(--pahri-accent) 17%, transparent), color-mix(in srgb, var(--pahri-accent-secondary) 8%, transparent));
        transform: translateX(2px);
    }

    & > span:first-of-type {
        width: 38px;
        height: 38px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(255,255,255,.08);
        border-radius: 12px;
        color: #fff;
        background: rgba(255,255,255,.035);
    }

    strong { display: block; font-size: 12px; font-weight: 780; }
    small { display: block; margin-top: 3px; color: rgba(226,232,240,.37); font-size: 9px; letter-spacing: .06em; }
`;

const Empty = styled.div`
    padding: 35px 20px;
    color: rgba(226,232,240,.38);
    font-size: 11px;
    text-align: center;
`;

export default () => {
    const history = useHistory();
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [query, setQuery] = useState('');

    const onTriggerLogout = () => {
        setPaletteOpen(false);
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    const commands = useMemo(
        () => [
            { label: 'Dashboard', description: 'Buka pusat kawalan utama', icon: faLayerGroup, run: () => history.push('/') },
            { label: 'Server Collection', description: 'Lihat semua server yang tersedia', icon: faServer, run: () => history.push('/') },
            { label: 'Account Settings', description: 'Keselamatan dan tetapan akaun', icon: faUserCircle, run: () => history.push('/account') },
            ...(rootAdmin
                ? [{ label: 'Admin Control', description: 'Buka pentadbiran sistem', icon: faCogs, run: () => { window.location.href = '/admin'; } }]
                : []),
            { label: 'Sign Out', description: 'Tamatkan sesi Pahri dengan selamat', icon: faSignOutAlt, run: onTriggerLogout },
        ],
        [history, rootAdmin]
    );

    const filteredCommands = commands.filter(command =>
        `${command.label} ${command.description}`.toLowerCase().includes(query.toLowerCase())
    );

    const runCommand = (command: typeof commands[number]) => {
        setPaletteOpen(false);
        setQuery('');
        command.run();
    };

    useEffect(() => {
        const listener = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                setPaletteOpen(open => !open);
            }
            if (event.key === 'Escape') setPaletteOpen(false);
        };

        window.addEventListener('keydown', listener);
        return () => window.removeEventListener('keydown', listener);
    }, []);

    return (
        <>
            <Shell>
                <SpinnerOverlay visible={isLoggingOut} />
                <Brand to={'/'}>
                    <Logo />
                    <BrandCopy><strong>Pahri Aurelia</strong><small>Luxury Spatial Control</small></BrandCopy>
                </Brand>
                <Center>
                    <NavLink to={'/'} exact><FontAwesomeIcon icon={faLayerGroup} /><span>Dashboard</span></NavLink>
                    <NavLink to={'/'}><FontAwesomeIcon icon={faServer} /><span>Servers</span></NavLink>
                    {rootAdmin && <a href={'/admin'}><FontAwesomeIcon icon={faCogs} /><span>Admin</span></a>}
                </Center>
                <Live>AURELIA ONLINE</Live>
                <Actions>
                    <ShortcutButton onClick={() => setPaletteOpen(true)} aria-label={'Open command palette'}>
                        <FontAwesomeIcon icon={faBolt} /><span>Quick Actions</span><kbd>Ctrl K</kbd>
                    </ShortcutButton>
                    <SearchContainer />
                    <Tooltip placement={'bottom'} content={'Account Settings'}>
                        <NavLink to={'/account'}><span className={'flex items-center w-5 h-5'}><Avatar.User /></span></NavLink>
                    </Tooltip>
                    <Tooltip placement={'bottom'} content={'Sign Out'}>
                        <button onClick={onTriggerLogout}><FontAwesomeIcon icon={faSignOutAlt} /></button>
                    </Tooltip>
                </Actions>
            </Shell>

            {paletteOpen && (
                <Overlay onMouseDown={event => event.target === event.currentTarget && setPaletteOpen(false)}>
                    <Palette role={'dialog'} aria-modal={'true'} aria-label={'Pahri command palette'}>
                        <PaletteHeader>
                            <FontAwesomeIcon icon={faSearch} />
                            <input
                                autoFocus
                                value={query}
                                onChange={event => setQuery(event.target.value)}
                                placeholder={'Search commands, pages and actions...'}
                            />
                            <button onClick={() => setPaletteOpen(false)} aria-label={'Close'}><FontAwesomeIcon icon={faTimes} /></button>
                        </PaletteHeader>
                        <PaletteList>
                            {filteredCommands.length > 0
                                ? filteredCommands.map(command => (
                                    <Command key={command.label} onClick={() => runCommand(command)}>
                                        <span><FontAwesomeIcon icon={command.icon} /></span>
                                        <span><strong>{command.label}</strong><small>{command.description}</small></span>
                                    </Command>
                                ))
                                : <Empty>No matching Aurelia action found.</Empty>}
                        </PaletteList>
                    </Palette>
                </Overlay>
            )}
        </>
    );
};
