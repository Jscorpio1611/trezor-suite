import React from 'react';
import styled from 'styled-components';
import { Truncate } from '@trezor/components';
import { FiatValue, FormattedCryptoAmount } from '@suite-components';
import { Network } from '@wallet-types';

const OutputWrapper = styled.div`
    display: flex;
    padding: 0 20px 0 0;
    margin-top: 37px;
    &:first-child {
        margin-top: 0;
    }
`;

const OutputHeadline = styled.div`
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 6px;
    color: ${props => props.theme.TYPE_DARK_GREY};
    word-break: break-word;
`;

const OutputValue = styled.div`
    font-size: 14px;
    color: ${props => props.theme.TYPE_LIGHT_GREY};
    font-weight: 500;

    display: flex;
    flex-wrap: wrap;
`;

const OutputLeft = styled.div`
    display: flex;
    width: 50px;
    justify-content: center;
    flex-direction: column;
`;

const OutputRight = styled.div`
    flex: 1;
    text-align: left;
`;

const OutputValueWrapper = styled.div`
    display: inline-block;
    overflow: hidden;
    word-break: break-word;
`;

const DotSeparatorWrapper = styled.div`
    margin: 7px 7px 0;
    width: 8px;
    display: inline-flex;
    align-items: center;
    flex-direction: column;
`;

const DotSeparator = styled.div`
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: ${props => props.theme.TYPE_LIGHT_GREY};
`;

export type Props = {
    indicator?: any;
    label: React.ReactNode;
    value: string;
    cryptoSymbol?: string;
    fiatSymbol: Network['symbol'];
    hasExpansion?: boolean;
    fiatVisible?: boolean;
};

const OutputElement = ({
    indicator,
    label,
    value,
    cryptoSymbol,
    fiatSymbol,
    hasExpansion = false,
    fiatVisible = false,
}: Props) => {
    const TruncateWrapper = ({
        condition,
        children,
    }: {
        condition: boolean;
        children: React.ReactNode;
    }): any => {
        return condition ? <Truncate>{children}</Truncate> : children;
    };

    return (
        <OutputWrapper>
            <OutputLeft>{indicator}</OutputLeft>
            <OutputRight>
                <OutputHeadline>
                    <Truncate>{label}</Truncate>
                </OutputHeadline>
                <OutputValue>
                    <TruncateWrapper condition={hasExpansion}>
                        <>
                            <OutputValueWrapper>
                                <FormattedCryptoAmount
                                    disableHiddenPlaceholder
                                    value={value}
                                    symbol={cryptoSymbol}
                                />
                            </OutputValueWrapper>
                            {fiatVisible && (
                                <>
                                    <DotSeparatorWrapper>
                                        <DotSeparator />
                                    </DotSeparatorWrapper>
                                    <OutputValueWrapper>
                                        <FiatValue
                                            disableHiddenPlaceholder
                                            amount={value}
                                            symbol={fiatSymbol}
                                        />
                                    </OutputValueWrapper>
                                </>
                            )}
                        </>
                    </TruncateWrapper>
                </OutputValue>
            </OutputRight>
        </OutputWrapper>
    );
};

export default OutputElement;
