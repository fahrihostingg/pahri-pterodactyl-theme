import React, { useEffect } from 'react';
import ContentContainer from '@/components/elements/ContentContainer';
import { CSSTransition } from 'react-transition-group';
import FlashMessageRender from '@/components/FlashMessageRender';
import styled from 'styled-components/macro';

export interface PageContentBlockProps {
    title?: string;
    className?: string;
    showFlashKey?: string;
}

const Page = styled.div`
    position: relative;
    min-height: calc(100vh - 100px);
    padding: 14px 0 30px;
`;

const Header = styled.div`
    width: min(1200px, calc(100% - 30px));
    margin: 22px auto 10px;
    padding: 18px 20px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    border: 1px solid rgba(255,255,255,.075);
    border-radius: calc(var(--pahri-radius, 24px) * .82);
    background: rgba(5,9,23,calc(var(--pahri-glass-opacity,.78) * .55));
    box-shadow: 0 18px 58px rgba(0,0,0,.25), inset 0 1px rgba(255,255,255,.045);
    backdrop-filter: blur(var(--pahri-blur, 24px)) saturate(145%);

    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 18px;
        bottom: 18px;
        width: 3px;
        border-radius: 999px;
        background: linear-gradient(var(--pahri-accent), var(--pahri-accent-secondary));
        box-shadow: 0 0 18px var(--pahri-accent);
    }

    &::after {
        content: '';
        position: absolute;
        width: 180px;
        height: 180px;
        right: -80px;
        top: -120px;
        border-radius: 50%;
        background: color-mix(in srgb, var(--pahri-accent) 14%, transparent);
        filter: blur(28px);
    }

    h1 {
        margin: 0;
        color: #fff;
        font-size: clamp(26px, 3vw, 41px);
        font-weight: 890;
        line-height: 1;
        letter-spacing: -.058em;
    }

    p {
        margin: 8px 0 0;
        color: rgba(226,232,240,.42);
        font-size: 9px;
        font-weight: 820;
        letter-spacing: .14em;
        text-transform: uppercase;
    }
`;

const Badge = styled.span`
    position: relative;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 11px;
    border: 1px solid rgba(255,255,255,.09);
    border-radius: 999px;
    color: rgba(226,232,240,.52);
    background: rgba(5,9,23,.55);
    font-size: 8px;
    font-weight: 880;
    letter-spacing: .13em;
    text-transform: uppercase;
    backdrop-filter: blur(14px);

    &::before {
        content: '';
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--pahri-accent), var(--pahri-accent-secondary));
        box-shadow: 0 0 14px var(--pahri-accent);
    }

    @media (max-width: 640px) { display: none; }
`;

const Body = styled(ContentContainer)`
    margin-top: 20px;
    margin-bottom: 28px;
`;

const Footer = styled.footer`
    width: min(1200px, calc(100% - 30px));
    margin: 20px auto 0;
    padding: 20px 4px 2px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid rgba(255,255,255,.055);
    color: rgba(226,232,240,.27);
    font-size: 8px;
    font-weight: 850;
    letter-spacing: .14em;
    text-transform: uppercase;

    strong { color: rgba(255,255,255,.5); }
`;

const PageContentBlock: React.FC<PageContentBlockProps> = ({ title, showFlashKey, className, children }) => {
    useEffect(() => {
        document.title = title ? `${title} — Pahri Aurelia` : 'Pahri Aurelia';
    }, [title]);

    return (
        <CSSTransition timeout={260} classNames={'fade'} appear in>
            <Page className={className}>
                {title && (
                    <Header>
                        <div><h1>{title}</h1><p>Aurelia spatial infrastructure workspace</p></div>
                        <Badge>Protected environment</Badge>
                    </Header>
                )}
                <Body>
                    {showFlashKey && <FlashMessageRender byKey={showFlashKey} />}
                    {children}
                </Body>
                <Footer><span><strong>Pahri Aurelia</strong> / Spatial Control Environment</span><span>Version 4.0 • by Pahri</span></Footer>
            </Page>
        </CSSTransition>
    );
};

export default PageContentBlock;
