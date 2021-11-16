import { Web3Provider } from '@ethersproject/providers';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';

import { useRecoilLoadCatch } from 'hooks';
import { rWalletAuth } from 'recoilState';
import { getApiService } from 'services/api';
import { connectors } from 'utils/connectors';
import { assertDef } from 'utils/tools';

import { EConnectorNames } from 'types';

export const useApiAuth = () => {
  const updateAuth = useRecoilLoadCatch(
    ({ snapshot, set }) =>
      async ({
        address,
        web3Context,
      }: {
        address: string;
        web3Context: Web3ReactContextInterface<Web3Provider>;
      }) => {
        const { authTokens } = await snapshot.getPromise(rWalletAuth);

        try {
          const connectorName = assertDef(
            Object.entries(connectors).find(
              ([, connector]) =>
                web3Context.connector?.constructor === connector.constructor
            )?.[0],
            'Unknown web3Context.connector'
          ) as EConnectorNames;

          const token =
            authTokens[address] ?? (await getApiService().login(address)).token;
          if (token) {
            set(rWalletAuth, {
              connectorName,
              address,
              authTokens: { ...authTokens, [address]: token },
            });

            return;
          }
        } catch (e) {
          console.error('Failed to login', e);
        }

        delete authTokens[address];

        set(rWalletAuth, {
          authTokens,
        });
        throw 'Failed to get a login token';
      },
    []
  );

  const clearAuth = useRecoilLoadCatch(
    ({ snapshot, set }) =>
      async () => {
        const { authTokens, address: original } = await snapshot.getPromise(
          rWalletAuth
        );

        if (original) {
          delete authTokens[original];
        }
        set(rWalletAuth, {
          authTokens,
        });
        return;
      },
    []
  );

  return {
    updateAuth,
    clearAuth,
  };
};
