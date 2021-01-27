import React from 'react';
import styled from 'styled-components';
import BigNumber from 'bignumber.js';
import { variables } from '@trezor/components';
import { Translation } from '@suite-components';
import { formatNetworkAmount, formatAmount, isTestnet } from '@wallet-utils/accountUtils';
import { BTC_LOCKTIME_VALUE } from '@wallet-constants/sendForm';
import { Network } from '@wallet-types';
import { TokenInfo } from 'trezor-connect';
import Indicator, { Props as IndicatorProps } from './Indicator';
import OutputElement from './OutputElement';

const ROW_PADDING = '16px 14px';

const Left = styled.div`
    padding: ${ROW_PADDING};
    display: flex;
    align-items: center;
    flex: 1 1 auto;
    min-width: 0;
`;

const Right = styled.div`
    padding: ${ROW_PADDING};
    display: flex;
    align-items: center;
    flex: 0 0 auto;
`;

const Amounts = styled.div`
    display: flex;
    flex-direction: column;
    font-variant-numeric: tabular-nums;
`;

const Coin = styled.div<{ bold?: boolean }>`
    display: flex;
    font-weight: ${props =>
        props.bold ? variables.FONT_WEIGHT.DEMI_BOLD : variables.FONT_WEIGHT.MEDIUM};
    font-size: ${variables.FONT_SIZE.NORMAL};
    color: ${props => props.theme.TYPE_DARK_GREY};
    align-items: center;
`;

const Symbol = styled.div`
    text-transform: uppercase;
    padding-left: 4px;
`;

const Fiat = styled.div`
    text-align: right;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    font-size: ${variables.FONT_SIZE.SMALL};
    color: ${props => props.theme.TYPE_LIGHT_GREY};
    margin-top: 4px;
`;

export type OutputProps =
    | {
          type: 'regular';
          label: string;
          value: string;
          token?: TokenInfo;
      }
    | {
          type: 'opreturn' | 'data' | 'locktime' | 'fee' | 'destination-tag' | 'txid';
          label?: undefined;
          value: string;
          token?: undefined;
      };

export type Props = OutputProps & {
    state: IndicatorProps['state'];
    symbol: Network['symbol'];
};

export { Left, Right, Coin, Symbol, Fiat, Amounts };

const Output = ({ type, state, label, value, symbol, token }: Props) => {
    let outputLabel: React.ReactNode = label;

    if (type === 'opreturn') {
        outputLabel = <Translation id="OP_RETURN" />;
    }
    if (type === 'data') {
        outputLabel = <Translation id="DATA_ETH" />;
    }
    if (type === 'locktime') {
        const isTimestamp = new BigNumber(value).gte(BTC_LOCKTIME_VALUE);
        outputLabel = (
            <Translation id={isTimestamp ? 'LOCKTIME_TIMESTAMP' : 'LOCKTIME_BLOCKHEIGHT'} />
        );
    }
    if (type === 'fee') {
        outputLabel = <Translation id="FEE" />;
    }
    if (type === 'destination-tag') {
        outputLabel = <Translation id="DESTINATION_TAG" />;
    }

    let outputValue = value;
    let outputSymbol;
    let fiatVisible = false;
    if (token) {
        outputValue = formatAmount(value, token.decimals);
        outputSymbol = token.symbol;
    } else if (type === 'regular' || type === 'fee') {
        outputValue = formatNetworkAmount(value, symbol);
        outputSymbol = symbol;
        fiatVisible = !isTestnet(symbol);
    }

    const hasExpansion = (type === 'opreturn' || type === 'data') && outputValue.length >= 10;

    return (
        <OutputElement
            indicator={<Indicator state={state} size={16} />}
            label={outputLabel}
            value={outputValue}
            cryptoSymbol={outputSymbol}
            fiatSymbol={symbol}
            hasExpansion={hasExpansion}
            fiatVisible={fiatVisible}
        />
    );
};

export default Output;
