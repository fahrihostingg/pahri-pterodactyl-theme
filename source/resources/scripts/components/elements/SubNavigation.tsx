import styled from 'styled-components/macro';

const SubNavigation = styled.div`
    width: min(1180px, calc(100% - 30px));
    margin: 14px auto 0;
    overflow-x: auto;
    border: 1px solid rgba(255,255,255,.085);
    border-radius: 18px;
    background: rgba(5,9,23,.62);
    box-shadow: 0 16px 48px rgba(0,0,0,.28), inset 0 1px rgba(255,255,255,.045);
    backdrop-filter: blur(20px) saturate(145%);

    & > div {
        min-width: max-content;
        padding: 7px;
        display: flex;
        align-items: center;
        gap: 5px;
    }

    & > div > a,
    & > div > div {
        min-height: 40px;
        padding: 0 13px;
        display: inline-flex;
        align-items: center;
        border: 1px solid transparent;
        border-radius: 12px;
        color: rgba(226,232,240,.52);
        font-size: 11px;
        font-weight: 720;
        text-decoration: none;
        white-space: nowrap;
        transition: .2s ease;
    }

    & > div > a:hover,
    & > div > a.active {
        color: #fff;
        border-color: rgba(255,255,255,.09);
        background: linear-gradient(135deg, color-mix(in srgb, var(--pahri-accent) 20%, transparent), color-mix(in srgb, var(--pahri-accent-secondary) 10%, transparent));
        box-shadow: inset 0 1px rgba(255,255,255,.05), 0 8px 24px rgba(0,0,0,.22);
    }
`;

export default SubNavigation;
