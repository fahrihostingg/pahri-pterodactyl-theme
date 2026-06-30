import React, { forwardRef } from 'react';
import { Form } from 'formik';
import styled, { keyframes } from 'styled-components/macro';
import FlashMessageRender from '@/components/FlashMessageRender';

const drift = keyframes`
    0%, 100% { transform: translate3d(0, 0, 0) rotateX(58deg) rotateZ(38deg); }
    50% { transform: translate3d(0, -18px, 0) rotateX(66deg) rotateZ(48deg); }
`;

const pulse = keyframes`
    0%, 100% { opacity: .45; transform: scale(.94); }
    50% { opacity: 1; transform: scale(1.08); }
`;

const Root = styled.div`
    width: min(1180px, calc(100vw - 32px));
    min-height: 690px;
    margin: 32px auto;
    display: grid;
    grid-template-columns: minmax(0, 1.12fr) minmax(360px, .88fr);
    overflow: hidden;
    position: relative;
    border: 1px solid rgba(255, 255, 255, .11);
    border-radius: 34px;
    background: rgba(4, 8, 22, .76);
    box-shadow: 0 45px 130px rgba(0, 0, 0, .62), inset 0 1px rgba(255, 255, 255, .08);
    backdrop-filter: blur(28px) saturate(150%);

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: linear-gradient(135deg, rgba(255, 255, 255, .05), transparent 38%, rgba(255, 255, 255, .02));
    }

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
        min-height: auto;
        margin: 14px auto;
        border-radius: 25px;
    }
`;

const Visual = styled.section`
    min-height: 690px;
    padding: 58px;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background:
        radial-gradient(circle at 18% 18%, color-mix(in srgb, var(--pahri-accent) 35%, transparent), transparent 35%),
        radial-gradient(circle at 82% 74%, color-mix(in srgb, var(--pahri-accent-secondary) 24%, transparent), transparent 38%),
        linear-gradient(145deg, rgba(7, 12, 32, .92), rgba(3, 7, 20, .72)),
        var(--pahri-wallpaper);
    background-size: cover;
    background-position: center;

    &::after {
        content: '';
        position: absolute;
        inset: 0;
        opacity: .22;
        background-image:
            linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
        background-size: 44px 44px;
        mask-image: linear-gradient(to bottom, #000, transparent 84%);
    }

    @media (max-width: 900px) {
        min-height: 350px;
        padding: 34px;
    }
`;

const Brand = styled.div`
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 14px;
`;

const Logo = styled.div`
    width: 58px;
    height: 58px;
    border: 1px solid rgba(255,255,255,.14);
    border-radius: 19px;
    background-image: var(--pahri-logo), linear-gradient(135deg, rgba(255,255,255,.13), rgba(255,255,255,.025));
    background-size: 76%, cover;
    background-repeat: no-repeat;
    background-position: center;
    box-shadow: 0 20px 55px rgba(0,0,0,.4), 0 0 34px color-mix(in srgb, var(--pahri-accent) 44%, transparent);
    backdrop-filter: blur(16px);
`;

const Product = styled.div`
    color: #fff;

    strong { display: block; font-size: 17px; letter-spacing: -.025em; }
    span { display: block; margin-top: 3px; color: rgba(226,232,240,.52); font-size: 9px; font-weight: 800; letter-spacing: .15em; text-transform: uppercase; }
`;

const Hero = styled.div`
    position: relative;
    z-index: 2;
    max-width: 570px;

    small {
        display: inline-flex;
        padding: 8px 11px;
        border: 1px solid rgba(255,255,255,.11);
        border-radius: 999px;
        color: #a5f3fc;
        background: rgba(6,182,212,.08);
        font-size: 9px;
        font-weight: 900;
        letter-spacing: .15em;
        text-transform: uppercase;
    }

    h1 {
        margin: 18px 0 12px;
        color: #fff;
        font-size: clamp(42px, 5vw, 76px);
        line-height: .95;
        letter-spacing: -.065em;
        text-wrap: balance;
    }

    p {
        max-width: 500px;
        margin: 0;
        color: rgba(226,232,240,.62);
        font-size: 15px;
        line-height: 1.8;
    }
`;

const Scene = styled.div`
    position: absolute;
    inset: 0;
    pointer-events: none;
    perspective: 900px;
`;

const Cube = styled.span<{ $size: number; $top: string; $left: string; $delay: string }>`
    position: absolute;
    top: ${props => props.$top};
    left: ${props => props.$left};
    width: ${props => props.$size}px;
    height: ${props => props.$size}px;
    border: 1px solid rgba(255,255,255,.13);
    border-radius: 20px;
    background: linear-gradient(135deg, rgba(139,92,246,.2), rgba(6,182,212,.08));
    box-shadow: inset 0 1px rgba(255,255,255,.08), 0 24px 60px rgba(0,0,0,.25);
    transform-style: preserve-3d;
    animation: ${drift} 8s ease-in-out infinite;
    animation-delay: ${props => props.$delay};
    animation-play-state: var(--pahri-animation-state);
    backdrop-filter: blur(12px);
`;

const Status = styled.div`
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 9px;
    color: rgba(226,232,240,.62);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .12em;
    text-transform: uppercase;

    &::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #22c55e;
        box-shadow: 0 0 17px #22c55e;
        animation: ${pulse} 1.8s ease-in-out infinite;
        animation-play-state: var(--pahri-animation-state);
    }
`;

const Panel = styled.section`
    padding: 64px 52px;
    position: relative;
    display: flex;
    align-items: center;
    background: linear-gradient(160deg, rgba(8,13,31,.96), rgba(3,7,18,.9));

    @media (max-width: 900px) { padding: 38px 28px 44px; }
`;

const FormArea = styled.div`
    width: 100%;
    max-width: 430px;
    margin: 0 auto;

    h2 {
        margin: 0 0 7px;
        color: #fff;
        font-size: 30px;
        font-weight: 850;
        letter-spacing: -.045em;
    }

    .pahri-auth-subtitle {
        margin: 0 0 28px;
        color: rgba(226,232,240,.48);
        font-size: 13px;
        line-height: 1.6;
    }

    form > div {
        padding: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
    }

    label { color: rgba(241,245,249,.74) !important; }
    input {
        min-height: 52px !important;
        color: #fff !important;
        border: 1px solid rgba(255,255,255,.11) !important;
        border-radius: 14px !important;
        background: rgba(2,6,23,.6) !important;
        box-shadow: inset 0 1px rgba(255,255,255,.035) !important;
    }
    input:focus {
        border-color: var(--pahri-accent) !important;
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--pahri-accent) 18%, transparent) !important;
    }
    button[type='submit'] {
        width: 100%;
        min-height: 52px;
        border-radius: 14px !important;
        background: linear-gradient(135deg, var(--pahri-accent), var(--pahri-accent-secondary)) !important;
        box-shadow: 0 18px 42px color-mix(in srgb, var(--pahri-accent) 30%, transparent) !important;
    }
`;

const Foot = styled.p`
    margin: 24px 0 0;
    color: rgba(226,232,240,.34);
    font-size: 10px;
    text-align: center;
    letter-spacing: .1em;
    text-transform: uppercase;
`;

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
};

export default forwardRef<HTMLFormElement, Props>(({ title, ...props }, ref) => (
    <Root>
        <Visual>
            <Scene aria-hidden={'true'}>
                <Cube $size={150} $top={'10%'} $left={'62%'} $delay={'-1s'} />
                <Cube $size={92} $top={'66%'} $left={'72%'} $delay={'-4s'} />
                <Cube $size={58} $top={'48%'} $left={'18%'} $delay={'-6s'} />
            </Scene>
            <Brand>
                <Logo />
                <Product><strong>Pahri Panel</strong><span>Luxury Server Control</span></Product>
            </Brand>
            <Hero>
                <small>Private Cloud Experience</small>
                <h1>Power without limits.</h1>
                <p>A premium control environment engineered for speed, security and total command over every server.</p>
            </Hero>
            <Status>All core systems operational</Status>
        </Visual>
        <Panel>
            <FormArea>
                <h2>{title || 'Secure Access'}</h2>
                <p className={'pahri-auth-subtitle'}>Masuk ke pusat kawalan Pahri menggunakan akaun anda.</p>
                <FlashMessageRender css={undefined} />
                <Form {...props} ref={ref}>{props.children}</Form>
                <Foot>&copy; {new Date().getFullYear()} Pahri Panel &mdash; by Pahri</Foot>
            </FormArea>
        </Panel>
    </Root>
));
