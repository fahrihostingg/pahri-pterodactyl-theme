import styled from 'styled-components/macro';

const SubNavigation = styled.div`
    width: min(1180px, calc(100% - 30px));
    margin: 15px auto 0;
    overflow-x: auto;
    border: 1px solid rgba(255,255,255,.09);
    border-radius: calc(var(--pahri-radius, 24px) * .76);
    background: rgba(5,9,23,calc(var(--pahri-glass-opacity,.78) * .74));
    box-shadow: 0 20px 62px rgba(0,0,0,.31), inset 0 1px rgba(255,255,255,.05);
    backdrop-filter: blur(var(--pahri-blur, 24px)) saturate(155%);

    & > div {
        min-width: max-content;
        padding: 7px;
        display: flex;
        align-items: center;
        gap: 5px;
    }

    & > div > a,
    & > div > div {
        min-height: 41px;
        padding: 0 14px;
        position: relative;
        display: inline-flex;
        align-items: center;
        border: 1px solid transparent;
        border-radius: calc(var(--pahri-radius, 24px) * .52);
        color: rgba(226,232,240,.5);
        font-size: 10px;
        font-weight: 760;
        letter-spacing: .015em;
        text-decoration: none;
        white-space: nowrap;
        transition: .21s ease;
    }

    & > div > a::after {
        content: '';
        position: absolute;
        left: 26%;
        right: 26%;
        bottom: 5px;
        height: 2px;
        border-radius: 999px;
        opacity: 0;
        background: linear-gradient(90deg, var(--pahri-accent), var(--pahri-accent-secondary));
        box-shadow: 0 0 12px var(--pahri-accent);
        transition: .2s ease;
    }

    & > div > a:hover,
    & > div > a.active {
        color: #fff;
        border-color: rgba(255,255,255,.09);
        background: linear-gradient(135deg, color-mix(in srgb, var(--pahri-accent) 20%, transparent), color-mix(in srgb, var(--pahri-accent-secondary) 10%, transparent));
        box-shadow: inset 0 1px rgba(255,255,255,.055), 0 10px 28px rgba(0,0,0,.24);
        transform: translateY(-1px);
    }

    & > div > a:hover::after,
    & > div > a.active::after { opacity: 1; }
`;

export default SubNavigation;
