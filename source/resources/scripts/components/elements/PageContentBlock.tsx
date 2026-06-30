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
    padding: 12px 0 28px;
`;

const Header = styled.div`
    width: min(1200px, calc(100% - 30px));
    margin: 20px auto 8px;
    padding: 0 2px;
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 16px;

    h1 {
        margin: 0;
        color: #fff;
        font-size: clamp(25px, 3vw, 40px);
        font-weight: 880;
        line-height: 1;
        letter-spacing: -.055em;
    }

    p {
        margin: 8px 0 0;
        color: rgba(226,232,240,.48);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: .11em;
        text-transform: uppercase;
    }
`;

const Badge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 11px;
    border: 1px solid rgba(255,255,255,.09);
    border-radius: 999px;
    color: rgba(226,232,240,.55);
    background: rgba(5,9,23,.45);
    font-size: 9px;
    font-weight: 850;
    letter-spacing: .11em;
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
    margin-top: 18px;
    margin-bottom: 26px;
`;

const Footer = styled.footer`
    width: min(1200px, calc(100% - 30px));
    margin: 18px auto 0;
    padding: 18px 4px 2px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid rgba(255,255,255,.06);
    color: rgba(226,232,240,.3);
    font-size: 9px;
    font-weight: 800;
    letter-spacing: .12em;
    text-transform: uppercase;

    strong { color: rgba(255,255,255,.48); }
`;

const PageContentBlock: React.FC<PageContentBlockProps> = ({ title, showFlashKey, className, children }) => {
    useEffect(() => {
        document.title = title ? `${title} — Pahri Panel` : 'Pahri Panel';
    }, [title]);

    return (
        <CSSTransition timeout={240} classNames={'fade'} appear in>
            <Page className={className}>
                {title && (
                    <Header>
                        <div><h1>{title}</h1><p>Luxury infrastructure workspace</p></div>
                        <Badge>Protected session</Badge>
                    </Header>
                )}
                <Body>
                    {showFlashKey && <FlashMessageRender byKey={showFlashKey} />}
                    {children}
                </Body>
                <Footer><span><strong>Pahri Panel</strong> / Control Environment</span><span>by Pahri</span></Footer>
            </Page>
        </CSSTransition>
    );
};

export default PageContentBlock;
