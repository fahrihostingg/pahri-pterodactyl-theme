import React, { lazy } from 'react';
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
import styled, { keyframes } from 'styled-components/macro';

const DashboardRouter = lazy(() => import(/* webpackChunkName: "dashboard" */ '@/routers/DashboardRouter'));
const ServerRouter = lazy(() => import(/* webpackChunkName: "server" */ '@/routers/ServerRouter'));
const AuthenticationRouter = lazy(() => import(/* webpackChunkName: "auth" */ '@/routers/AuthenticationRouter'));

const float = keyframes`
    0%, 100% { transform: translate3d(0,0,0) rotate(22deg) scale(1); }
    50% { transform: translate3d(22px,-34px,0) rotate(38deg) scale(1.08); }
`;

const Scene = styled.div`
    position: fixed;
    inset: 0;
    z-index: -50;
    overflow: hidden;
    pointer-events: none;
    background:
        radial-gradient(circle at 15% 8%, color-mix(in srgb, var(--pahri-accent) 26%, transparent), transparent 31%),
        radial-gradient(circle at 88% 22%, color-mix(in srgb, var(--pahri-accent-secondary) 20%, transparent), transparent 36%),
        linear-gradient(145deg, rgba(2,6,23,.94), rgba(6,11,28,.83)),
        var(--pahri-wallpaper);
    background-size: cover;
    background-position: center;
    background-attachment: fixed;

    &::after {
        content: '';
        position: absolute;
        inset: 0;
        opacity: .16;
        background-image: linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
        background-size: 42px 42px;
        mask-image: linear-gradient(to bottom, #000, transparent 90%);
    }
`;

const Shape = styled.span<{ $size: number; $top: string; $left: string; $delay: string }>`
    position: absolute;
    top: ${props => props.$top};
    left: ${props => props.$left};
    width: ${props => props.$size}px;
    height: ${props => props.$size}px;
    border: 1px solid rgba(255,255,255,.07);
    border-radius: 28px;
    background: linear-gradient(135deg, rgba(255,255,255,.045), rgba(255,255,255,.012));
    box-shadow: inset 0 1px rgba(255,255,255,.055), 0 30px 80px rgba(0,0,0,.16);
    transform: rotate(22deg);
    animation: ${float} 15s ease-in-out infinite;
    animation-delay: ${props => props.$delay};
    animation-play-state: var(--pahri-animation-state);
    backdrop-filter: blur(8px);
`;

const Application = styled.div`
    min-height: 100vh;
    position: relative;
    isolation: isolate;
`;

interface ExtendedWindow extends Window {
    SiteConfiguration?: SiteSettings;
    PterodactylUser?: {
        uuid: string;
        username: string;
        email: string;
        root_admin: boolean;
        use_totp: boolean;
        language: string;
        updated_at: string;
        created_at: string;
    };
}

setupInterceptors(history);

const App = () => {
    const { PterodactylUser, SiteConfiguration } = window as ExtendedWindow;

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

    if (!store.getState().settings.data) {
        store.getActions().settings.setSettings(SiteConfiguration!);
    }

    return (
        <>
            <GlobalStylesheet />
            <Scene aria-hidden={'true'}>
                <Shape $size={180} $top={'8%'} $left={'78%'} $delay={'-2s'} />
                <Shape $size={110} $top={'64%'} $left={'7%'} $delay={'-7s'} />
                <Shape $size={70} $top={'44%'} $left={'58%'} $delay={'-11s'} />
            </Scene>
            <StoreProvider store={store}>
                <ProgressBar />
                <Application>
                    <Router history={history}>
                        <Switch>
                            <Route path={'/auth'}>
                                <Spinner.Suspense><AuthenticationRouter /></Spinner.Suspense>
                            </Route>
                            <AuthenticatedRoute path={'/server/:id'}>
                                <Spinner.Suspense>
                                    <ServerContext.Provider><ServerRouter /></ServerContext.Provider>
                                </Spinner.Suspense>
                            </AuthenticatedRoute>
                            <AuthenticatedRoute path={'/'}>
                                <Spinner.Suspense><DashboardRouter /></Spinner.Suspense>
                            </AuthenticatedRoute>
                            <Route path={'*'}><NotFound /></Route>
                        </Switch>
                    </Router>
                </Application>
            </StoreProvider>
        </>
    );
};

export default hot(App);
