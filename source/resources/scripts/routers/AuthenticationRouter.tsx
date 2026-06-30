import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import LoginContainer from '@/components/auth/LoginContainer';
import ForgotPasswordContainer from '@/components/auth/ForgotPasswordContainer';
import ResetPasswordContainer from '@/components/auth/ResetPasswordContainer';
import LoginCheckpointContainer from '@/components/auth/LoginCheckpointContainer';
import { NotFound } from '@/components/elements/ScreenBlock';
import { useHistory, useLocation } from 'react-router';
import styled from 'styled-components/macro';

const AuthRoot = styled.main`
    min-height: 100vh;
    padding: 1px 0;
    position: relative;
    overflow-x: hidden;

    &::before,
    &::after {
        content: '';
        position: fixed;
        z-index: -1;
        width: 34rem;
        height: 34rem;
        border-radius: 50%;
        filter: blur(110px);
        opacity: .18;
        pointer-events: none;
    }

    &::before { top: -14rem; left: -10rem; background: var(--pahri-accent); }
    &::after { right: -12rem; bottom: -16rem; background: var(--pahri-accent-secondary); }
`;

export default () => {
    const history = useHistory();
    const location = useLocation();
    const { path } = useRouteMatch();

    return (
        <AuthRoot>
            <Switch location={location}>
                <Route path={`${path}/login`} component={LoginContainer} exact />
                <Route path={`${path}/login/checkpoint`} component={LoginCheckpointContainer} />
                <Route path={`${path}/password`} component={ForgotPasswordContainer} exact />
                <Route path={`${path}/password/reset/:token`} component={ResetPasswordContainer} />
                <Route path={`${path}/checkpoint`} />
                <Route path={'*'}>
                    <NotFound onBack={() => history.push('/auth/login')} />
                </Route>
            </Switch>
        </AuthRoot>
    );
};
