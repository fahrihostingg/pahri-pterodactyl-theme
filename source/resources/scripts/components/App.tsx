import React, { lazy, useEffect } from 'react';
import { hot } from 'react-hot-loader/root';
import { Route, Router, Switch } from 'react-router-dom';
import { StoreProvider } from 'easy-peasy';
import { store } from '@/state';
import { SiteSettings } from '@/state/settings';
import ProgressBar from '@/components/elements/ProgressBar';
import { NotFound } from '@/components/elements/ScreenBlock';
import GlobalStylesheet from '@/assets/css/GlobalStylesheet';
import { history } from '@/components/history';
import { setupInterceptors } from '@/api/interceptors';
import AuthenticatedRoute from '@/components/elements/AuthenticatedRoute';
import { ServerContext } from '@/state/server';
import '@/assets/tailwind.css';
import Spinner from '@/components/elements/Spinner';
import PahriBroadcast from '@/components/PahriBroadcast';
import PahriMaintenanceGate from '@/components/PahriMaintenanceGate';
import styled, { keyframes } from 'styled-components/macro';

const DashboardRouter = lazy(() => import(/* webpackChunkName: "dashboard" */ '@/routers/DashboardRouter'));
const ServerRouter = lazy(() => import(/* webpackChunkName: "server" */ '@/routers/ServerRouter'));
const AuthenticationRouter = lazy(() => import(/* webpackChunkName: "auth" */ '@/routers/AuthenticationRouter'));

const float = keyframes`
    0%, 100% { transform: translate3d(0,0,0) rotateX(56deg) rotateZ(24deg) scale(1); }
    50% { transform: translate3d(34px,-46px,0) rotateX(64deg) rotateZ(44deg) scale(1.1); }
`;
const aurora = keyframes`
    0%, 100% { transform: translate3d(-4%, -2%, 0) rotate(-8deg) scale(1); opacity: .46; }
    50% { transform: translate3d(5%, 4%, 0) rotate(8deg) scale(1.12); opacity: .72; }
`;
const particleRise = keyframes`
    0% { transform: translate3d(0, 40px, 0) scale(.65); opacity: 0; }
    15% { opacity: .6; }
    85% { opacity: .24; }
    100% { transform: translate3d(24px, -115vh, 0) scale(1.15); opacity: 0; }
`;
const scan = keyframes`
    from { transform: translateY(-100%); }
    to { transform: translateY(100vh); }
`;

const Scene = styled.div`
    position: fixed;
    inset: 0;
    z-index: -50;
    overflow: hidden;
    pointer-events: none;
    background:
        radial-gradient(circle at 15% 8%, color-mix(in srgb, var(--pahri-accent) 28%, transparent), transparent 31%),
        radial-gradient(circle at 88% 22%, color-mix(in srgb, var(--pahri-accent-secondary) 22%, transparent), transparent 36%),
        linear-gradient(145deg, rgba(1,4,15,.96), rgba(6,11,28,.86)),
        var(--pahri-wallpaper);
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    &::before { content: ''; position: absolute; inset: 0; opacity: .2; background-image: linear-gradient(rgba(255,255,255,.026) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.026) 1px, transparent 1px); background-size: 44px 44px; mask-image: radial-gradient(circle at 50% 35%, #000 10%, transparent 78%); }
    &::after { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 160px; opacity: .08; background: linear-gradient(to bottom, transparent, rgba(255,255,255,.26), transparent); animation: ${scan} calc(var(--pahri-motion-duration, 18s) * 1.7) linear infinite; animation-play-state: var(--pahri-animation-state); }
`;
const Aurora = styled.span<{ $primary?: boolean }>`
    position: absolute; width: 72vw; height: 42vw; min-width: 760px; min-height: 420px; border-radius: 50%; filter: blur(100px);
    background: ${props => props.$primary ? 'radial-gradient(ellipse, color-mix(in srgb, var(--pahri-accent) 34%, transparent), transparent 68%)' : 'radial-gradient(ellipse, color-mix(in srgb, var(--pahri-accent-secondary) 27%, transparent), transparent 70%)'};
    animation: ${aurora} var(--pahri-motion-duration, 18s) ease-in-out infinite; animation-delay: ${props => (props.$primary ? '-4s' : '-12s')}; animation-play-state: var(--pahri-animation-state);
    ${props => props.$primary ? 'top: -18vw; left: -12vw;' : 'right: -18vw; bottom: -20vw; transform: rotate(180deg);'}
`;
const CursorAura = styled.span`
    position: absolute; width: 520px; height: 520px; left: calc(var(--pahri-cursor-x, 50vw) - 260px); top: calc(var(--pahri-cursor-y, 40vh) - 260px); border-radius: 50%; opacity: .22; filter: blur(36px); background: radial-gradient(circle, color-mix(in srgb, var(--pahri-accent) 24%, transparent), transparent 67%); transition: left .16s ease-out, top .16s ease-out;
`;
const Shape = styled.span<{ $size: number; $top: string; $left: string; $delay: string }>`
    position: absolute; top: ${props => props.$top}; left: ${props => props.$left}; width: ${props => props.$size}px; height: ${props => props.$size}px; border: 1px solid rgba(255,255,255,.08); border-radius: calc(var(--pahri-radius, 24px) * 1.15); background: linear-gradient(135deg, rgba(255,255,255,.07), rgba(255,255,255,.012)), radial-gradient(circle at 20% 10%, color-mix(in srgb, var(--pahri-accent) 18%, transparent), transparent 48%); box-shadow: inset 0 1px rgba(255,255,255,.07), 0 35px 90px rgba(0,0,0,.22); transform-style: preserve-3d; animation: ${float} var(--pahri-motion-duration, 18s) ease-in-out infinite; animation-delay: ${props => props.$delay}; animation-play-state: var(--pahri-animation-state); backdrop-filter: blur(10px);
`;
const Particle = styled.i<{ $left: number; $delay: number; $duration: number; $size: number }>`
    display: var(--pahri-particles-display, block); position: absolute; left: ${props => props.$left}%; bottom: -20px; width: ${props => props.$size}px; height: ${props => props.$size}px; border-radius: 50%; background: ${props => (props.$left % 2 ? 'var(--pahri-accent)' : 'var(--pahri-accent-secondary)')}; box-shadow: 0 0 13px currentColor; opacity: 0; animation: ${particleRise} ${props => props.$duration}s linear infinite; animation-delay: -${props => props.$delay}s; animation-play-state: var(--pahri-animation-state);
`;
const Grain = styled.span`
    position: absolute; inset: -80px; opacity: .045; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.7'/%3E%3C/svg%3E"); transform: rotate(7deg);
`;
const Application = styled.div`
    min-height: 100vh; position: relative; isolation: isolate;
`;
const particles = Array.from({ length: 26 }, (_, index) => ({ left: (index * 37 + 11) % 100, delay: (index * 1.73) % 18, duration: 14 + (index % 7) * 2.2, size: 1 + (index % 3) }));

interface ExtendedWindow extends Window {
    SiteConfiguration?: SiteSettings;
    PterodactylUser?: { uuid: string; username: string; email: string; root_admin: boolean; use_totp: boolean; language: string; updated_at: string; created_at: string };
    PahriUserId?: number;
}

setupInterceptors(history);

const App = () => {
    const { PterodactylUser, SiteConfiguration, PahriUserId } = window as ExtendedWindow;
    const canBypassMaintenance = Number(PahriUserId || 0) === 1;

    useEffect(() => {
        let frame = 0;
        const onMove = (event: MouseEvent) => {
            window.cancelAnimationFrame(frame);
            frame = window.requestAnimationFrame(() => {
                document.documentElement.style.setProperty('--pahri-cursor-x', `${event.clientX}px`);
                document.documentElement.style.setProperty('--pahri-cursor-y', `${event.clientY}px`);
            });
        };
        window.addEventListener('mousemove', onMove, { passive: true });
        return () => { window.cancelAnimationFrame(frame); window.removeEventListener('mousemove', onMove); };
    }, []);

    if (PterodactylUser && !store.getState().user.data) {
        store.getActions().user.setUserData({
            uuid: PterodactylUser.uuid,
            username: PterodactylUser.username,
            email: PterodactylUser.email,
            language: PterodactylUser.language,
            rootAdmin: PterodactylUser.root_admin,
            useTotp: PterodactylUser.use_totp,
            createdAt: new Date(PterodactylUser.created_at),
            updatedAt: new Date(PterodactylUser.updated_at),
        });
    }

    if (!store.getState().settings.data) store.getActions().settings.setSettings(SiteConfiguration!);

    return (
        <>
            <GlobalStylesheet />
            <Scene aria-hidden={'true'}>
                <Aurora $primary /><Aurora /><CursorAura />
                <Shape $size={210} $top={'7%'} $left={'78%'} $delay={'-2s'} />
                <Shape $size={128} $top={'64%'} $left={'6%'} $delay={'-8s'} />
                <Shape $size={78} $top={'42%'} $left={'59%'} $delay={'-13s'} />
                {particles.map((particle, index) => <Particle key={index} $left={particle.left} $delay={particle.delay} $duration={particle.duration} $size={particle.size} />)}
                <Grain />
            </Scene>
            <StoreProvider store={store}>
                <ProgressBar />
                <PahriMaintenanceGate authenticated={Boolean(PterodactylUser)} canBypass={canBypassMaintenance}>
                    <Application>
                        <Router history={history}>
                            <Switch>
                                <Route path={'/auth'}><Spinner.Suspense><AuthenticationRouter /></Spinner.Suspense></Route>
                                <AuthenticatedRoute path={'/server/:id'}>
                                    <Spinner.Suspense><ServerContext.Provider><ServerRouter /></ServerContext.Provider></Spinner.Suspense>
                                </AuthenticatedRoute>
                                <AuthenticatedRoute path={'/'}><Spinner.Suspense><DashboardRouter /></Spinner.Suspense></AuthenticatedRoute>
                                <Route path={'*'}><NotFound /></Route>
                            </Switch>
                        </Router>
                    </Application>
                </PahriMaintenanceGate>
            </StoreProvider>
            <PahriBroadcast authenticated={Boolean(PterodactylUser)} rootAdmin={Boolean(PterodactylUser?.root_admin)} />
        </>
    );
};

export default hot(App);
