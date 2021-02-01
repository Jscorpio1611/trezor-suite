import React from 'react';
import styled from 'styled-components';
import TrezorLink from '@suite-components/TrezorLink';
import { WalletAccountTransaction } from '@wallet-reducers/transactionReducer';
import TransactionItem from '@wallet-components/TransactionItem';
import { getBlockExplorerUrl } from '@wallet-utils/transactionUtils';

const Wrapper = styled.div`
    text-align: left;
    margin-top: 25px;
`;

const StyledTrezorLink = styled(TrezorLink)`
    width: 100%;
`;

interface Props {
    txs: WalletAccountTransaction[];
}

const ChainedTxs = ({ txs }: Props) => {
    return (
        <Wrapper>
            {txs.map(tx => (
                <StyledTrezorLink href={getBlockExplorerUrl(tx)} variant="nostyle">
                    <TransactionItem
                        key={tx.txid}
                        transaction={tx}
                        isPending
                        isActionDisabled
                        accountKey={`${tx.descriptor}-${tx.symbol}-${tx.deviceState}`}
                        chainedTxMode
                    />
                </StyledTrezorLink>
            ))}
        </Wrapper>
    );
};

export default ChainedTxs;
