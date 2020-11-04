import { useEffect, useCallback } from 'react';
import Router, { useRouter } from 'next/router';
import { useActions, useSelector } from '@suite-hooks';
import { isWeb, isDesktop } from '@suite-utils/env';
import { isAddressValid } from '@wallet-utils/validation';
import { getProtocolInfo } from '@suite-utils/parseUri';
import * as sendFormActions from '@wallet-actions/sendFormActions';
import { getDefaultValues } from '@wallet-utils/sendFormUtils';
import { Network } from '@wallet-types';

const protocolToCoin: { [key: string]: Network['symbol'] } = {
    bitcoin: 'btc',
};

const allowedActions = [
    'accounts/send',
    // Add more actions
];

const Protocol = () => {
    const { accounts, localCurrency, enabledNetworks } = useSelector(state => ({
        accounts: state.wallet.accounts,
        localCurrency: state.wallet.settings.localCurrency,
        enabledNetworks: state.wallet.settings.enabledNetworks,
    }));
    const { getDraft, saveDraft } = useActions({
        getDraft: sendFormActions.getDraft,
        saveDraft: sendFormActions.saveDraft,
    });

    const createDraftForCoin = useCallback(
        payload => {
            const symbol = protocolToCoin[payload.coin];

            // Check if the network is enabled
            if (!enabledNetworks.includes(symbol)) return '';

            // Don't continue if the address is not valid
            if (payload.address && !isAddressValid(payload.address, symbol)) return '';

            // Find if there are any accounts for that coin
            const accountsForCoin = accounts.filter(a => a.symbol === symbol);

            // If there are none, there's nothign to do
            if (accountsForCoin.length === 0) return '';

            let accountKey = '';
            let accountType = '';
            ['normal', 'segwit', 'legacy'].some(t => {
                const accountForCoin = accountsForCoin.find(a => a.accountType === t);
                if (!accountForCoin) {
                    return false;
                }

                accountKey = accountForCoin.key;
                accountType = t;
                return true; // Stop the loop
            });

            // If no draft exists (for this account key)
            if (!getDraft(accountKey)) {
                const currencyOption = { value: localCurrency, label: localCurrency.toUpperCase() };
                // Create a new draft with the payload address and amount
                saveDraft(
                    getDefaultValues(currencyOption, payload.address, payload.amount),
                    accountKey,
                );
            }

            return `/#/${symbol}/0/${accountType}`;
        },
        [accounts, enabledNetworks, getDraft, localCurrency, saveDraft],
    );

    const handleProtocolRequest = useCallback(
        uri => {
            const { action, payload } = getProtocolInfo(uri);

            // Filter allowed actions
            if (!allowedActions.includes(action)) return;

            // Define the action as the base route
            let route = `/${action}`;

            // Special case for send coin actions (send)
            if (action === 'accounts/send' && payload.coin && protocolToCoin[payload.coin]) {
                const coinRoute = createDraftForCoin(payload);
                route += coinRoute;
            }

            Router.push(route);
        },
        [createDraftForCoin],
    );

    const { query } = useRouter();
    useEffect(() => {
        if (query.uri) {
            handleProtocolRequest(query.uri);
        }
    }, [handleProtocolRequest, query.uri]);

    useEffect(() => {
        if (isWeb()) {
            navigator.registerProtocolHandler(
                'bitcoin',
                `${window.location.origin}?uri=%s`,
                'Bitcoin / Trezor Suite',
            );
        }

        if (isDesktop()) {
            window.desktopApi!.on('protocol/open', handleProtocolRequest);
        }
    }, [handleProtocolRequest]);

    return null;
};

export default Protocol;
