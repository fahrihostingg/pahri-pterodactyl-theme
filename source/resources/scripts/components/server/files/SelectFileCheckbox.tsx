import React from 'react';
import { ServerContext } from '@/state/server';
import styled from 'styled-components/macro';

export const FileActionCheckbox = styled.input`
    && {
        width: 20px;
        height: 20px;
        min-width: 20px;
        cursor: pointer;
        accent-color: #22c55e;
        border-radius: 999px;
        filter: drop-shadow(0 7px 14px rgba(0,0,0,.25));
    }
`;

const Wrapper = styled.label`
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 35;
    width: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
`;

const HiddenInput = styled.input`
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
`;

const Indicator = styled.span<{ $checked: boolean }>`
    width: 25px;
    height: 25px;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 2px solid ${props => (props.$checked ? '#22c55e' : 'rgba(255,255,255,.88)')};
    border-radius: 999px;
    background: ${props => (props.$checked ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'rgba(255,255,255,.95)')};
    box-shadow: ${props => props.$checked
        ? '0 0 0 4px rgba(34,197,94,.18), 0 9px 24px rgba(34,197,94,.38)'
        : '0 8px 20px rgba(0,0,0,.28), inset 0 1px rgba(255,255,255,.65)'};
    transform: ${props => (props.$checked ? 'scale(1.06)' : 'scale(.92)')};
    transition: transform .16s ease, border-color .16s ease, background .16s ease, box-shadow .16s ease;

    &::before {
        content: '✓';
        color: #fff;
        opacity: ${props => (props.$checked ? 1 : 0)};
        font: 900 16px/1 Arial, sans-serif;
        text-shadow: 0 1px 3px rgba(0,0,0,.32);
        transform: ${props => (props.$checked ? 'scale(1)' : 'scale(.45)')};
        transition: opacity .14s ease, transform .14s ease;
    }

    &::after {
        content: '';
        position: absolute;
        inset: -9px;
        border-radius: 999px;
        border: 1px solid ${props => (props.$checked ? 'rgba(34,197,94,.35)' : 'rgba(255,255,255,.09)')};
        opacity: ${props => (props.$checked ? 1 : .35)};
        pointer-events: none;
    }

    ${Wrapper}:hover & {
        transform: scale(1.12);
        border-color: ${props => (props.$checked ? '#22c55e' : '#ffffff')};
        box-shadow: ${props => props.$checked
            ? '0 0 0 5px rgba(34,197,94,.2), 0 12px 30px rgba(34,197,94,.42)'
            : '0 0 0 4px rgba(255,255,255,.12), 0 10px 26px rgba(0,0,0,.35)'};
    }
`;

export default ({ name }: { name: string }) => {
    const isChecked = ServerContext.useStoreState((state) => state.files.selectedFiles.indexOf(name) >= 0);
    const appendSelectedFile = ServerContext.useStoreActions((actions) => actions.files.appendSelectedFile);
    const removeSelectedFile = ServerContext.useStoreActions((actions) => actions.files.removeSelectedFile);

    const toggle = (checked: boolean) => {
        if (checked) appendSelectedFile(name);
        else removeSelectedFile(name);
    };

    return (
        <Wrapper title={isChecked ? 'Selected' : 'Select file'} aria-label={isChecked ? `${name} selected` : `Select ${name}`}>
            <HiddenInput
                name={'selectedFiles'}
                value={name}
                checked={isChecked}
                type={'checkbox'}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => toggle(event.currentTarget.checked)}
            />
            <Indicator $checked={isChecked} aria-hidden={'true'} />
        </Wrapper>
    );
};
