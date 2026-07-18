import React, { forwardRef } from 'react';
import { Form } from 'formik';
import styled, { keyframes } from 'styled-components/macro';
import FlashMessageRender from '@/components/FlashMessageRender';

const glow = keyframes`
    0%, 100% { opacity: .36; transform: translate3d(0,0,0) scale(.98); }
    50% { opacity: .8; transform: translate3d(10px,-10px,0) scale(1.05); }
`;

const Page = styled.main`
    min-height: 100vh;
    padding: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    background:
        radial-gradient(circle at 14% 12%, color-mix(in srgb, var(--pahri-accent) 32%, transparent), transparent 34%),
        radial-gradient(circle at 86% 82%, color-mix(in srgb, var(--pahri-accent-secondary) 26%, transparent), transparent 38%),
        linear-gradient(145deg, #020617, #050816 62%, #020617);

    &::before {
        content: '';
        position: fixed;
        inset: 0;
        opacity: .16;
        background-image:
            linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
        background-size: 42px 42px;
        mask-image: radial-gradient(circle at 50% 50%, #000, transparent 78%);
    }
`;

const Card = styled.section`
    width: min(980px, 100%);
    min-height: 620px;
    position: relative;
    overflow: hidden;
    display: grid;
    grid-template-columns: minmax(0, .9fr) minmax(360px, .7fr);
    border: 1px solid rgba(255,255,255,.11);
    border-radius: calc(var(--pahri-radius, 24px) * 1.15);
    background: rgba(5, 9, 24, .88);
    box-shadow: 0 42px 130px rgba(0,0,0,.68), inset 0 1px rgba(255,255,255,.08);
    backdrop-filter: blur(var(--pahri-blur, 24px)) saturate(150%);

    @media (max-width: 880px) { grid-template-columns: 1fr; }
`;

const BrandSide = styled.div`
    padding: 42px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background:
        radial-gradient(circle at 20% 8%, color-mix(in srgb, var(--pahri-accent) 24%, transparent), transparent 35%),
        linear-gradient(155deg, rgba(255,255,255,.06), rgba(255,255,255,.015));

    &::after {
        content: '';
        position: absolute;
        width: 220px;
        height: 220px;
        right: -90px;
        bottom: -80px;
        border-radius: 48px;
        border: 1px solid rgba(255,255,255,.12);
        background: linear-gradient(135deg, color-mix(in srgb, var(--pahri-accent) 22%, transparent), color-mix(in srgb, var(--pahri-accent-secondary) 10%, transparent));
        box-shadow: 0 30px 90px rgba(0,0,0,.28);
        transform: rotate(18deg);
        animation: ${glow} 8s ease-in-out infinite;
    }

    @media (max-width: 880px) { min-height: 250px; }
`;

const Brand = styled.div`
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 14px;

    span {
        width: 58px;
        height: 58px;
        border: 1px solid rgba(255,255,255,.14);
        border-radius: 18px;
        background: var(--pahri-logo) center / 76% no-repeat, linear-gradient(135deg,rgba(255,255,255,.13),rgba(255,255,255,.025));
        box-shadow: 0 18px 48px rgba(0,0,0,.35), 0 0 35px color-mix(in srgb, var(--pahri-accent) 32%, transparent);
    }

    strong { display: block; color: #fff; font-size: 20px; font-weight: 900; letter-spacing: -.045em; }
    small { display: block; margin-top: 4px; color: rgba(226,232,240,.46); font-size: 8px; font-weight: 850; letter-spacing: .17em; text-transform: uppercase; }
`;

const Hero = styled.div`
    position: relative;
    z-index: 2;

    h1 { max-width: 520px; margin: 0; color: #fff; font-size: clamp(42px, 6vw, 70px); line-height: .92; letter-spacing: -.075em; }
    h1 span { color: transparent; background: linear-gradient(100deg,#fff,#ddd6fe 42%,#67e8f9); background-clip: text; -webkit-background-clip: text; }
    p { max-width: 480px; margin: 18px 0 0; color: rgba(226,232,240,.55); font-size: 13px; line-height: 1.75; }
`;

const FormSide = styled.aside`
    padding: 54px 42px;
    display: flex;
    align-items: center;
    background: rgba(2,6,18,.72);

    @media (max-width: 880px) { padding: 38px 24px 44px; }
`;

const Inner = styled.div`
    width: 100%;
    max-width: 430px;
    margin: 0 auto;

    h2 { margin: 0 0 8px; color: #fff; font-size: 32px; font-weight: 900; letter-spacing: -.055em; }
    > p { margin: 0 0 28px; color: rgba(226,232,240,.44); font-size: 12px; line-height: 1.7; }
    form > div { padding: 0 !important; background: transparent !important; box-shadow: none !important; }
    label { color: rgba(241,245,249,.72) !important; }
    input { min-height: 54px !important; color: #fff !important; border: 1px solid rgba(255,255,255,.11) !important; border-radius: 15px !important; background: rgba(2,6,23,.68) !important; box-shadow: inset 0 1px rgba(255,255,255,.04) !important; }
    input:focus { border-color: var(--pahri-accent) !important; box-shadow: 0 0 0 4px color-mix(in srgb, var(--pahri-accent) 18%, transparent) !important; }
    button[type='submit'] { width: 100%; min-height: 54px; border-radius: 15px !important; background: linear-gradient(135deg,var(--pahri-accent),var(--pahri-accent-secondary)) !important; box-shadow: 0 20px 48px color-mix(in srgb, var(--pahri-accent) 28%, transparent) !important; }
`;

const Trust = styled.div`
    margin-top: 24px;
    padding-top: 18px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    border-top: 1px solid rgba(255,255,255,.06);

    span { padding: 9px 6px; border: 1px solid rgba(255,255,255,.06); border-radius: 11px; color: rgba(226,232,240,.38); background: rgba(255,255,255,.025); font-size: 8px; font-weight: 800; text-align: center; letter-spacing: .06em; text-transform: uppercase; }
`;

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & { title?: string };

export default forwardRef<HTMLFormElement, Props>(({ title, ...props }, ref) => (
    <Page>
        <Card>
            <BrandSide>
                <Brand><span /><div><strong>Pahri Thema New</strong><small>Nexus Panel Login</small></div></Brand>
                <Hero>
                    <h1>Masuk ke<br /><span>control center.</span></h1>
                    <p>Login khas untuk owner dan client panel. Halaman store awam berada di domain utama, manakala halaman ini fokus untuk akses akaun sahaja.</p>
                </Hero>
            </BrandSide>
            <FormSide>
                <Inner>
                    <h2>{title || 'Login Pahri'}</h2>
                    <p>Masukkan akaun untuk membuka dashboard, server dan pengurusan panel.</p>
                    <FlashMessageRender css={undefined} />
                    <Form {...props} ref={ref}>{props.children}</Form>
                    <Trust><span>Secure</span><span>Owner Ready</span><span>Nexus UI</span></Trust>
                </Inner>
            </FormSide>
        </Card>
    </Page>
));
