import React, { useEffect } from 'react';

import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';

import { Button, Hidden, makeStyles, Popover } from '@material-ui/core';

import { WALLET_ICONS } from 'config/constants';
import { useApiAuth } from 'hooks';
import { useSetWalletModalOpen, useWalletAuth } from 'recoilState';
import { getApiService } from 'services/api';
import { shortenAddress } from 'utils';

const useStyles = makeStyles(theme => ({
  button: {
    marginRight: theme.spacing(2),
  },
  popover: {
    marginTop: theme.spacing(1),
    borderRadius: 8,
    boxShadow: 'none',
  },
}));

export const WalletButton = () => {
  const classes = useStyles();

  const web3Context = useWeb3React<Web3Provider>();

  const { updateAuth, clearAuth } = useApiAuth();
  const setWalletModalOpen = useSetWalletModalOpen();
  const { address, connectorName, authTokens } = useWalletAuth();
  const haveAuthToken =
    !!address && web3Context.account === address && address in authTokens;

  const [anchorEl, setAnchorEl] = React.useState<
    HTMLButtonElement | undefined
  >();

  useEffect(() => {
    getApiService().setProvider(web3Context.library);
  }, [web3Context.library]);

  const login = (addr: string, w3ctx: typeof web3Context) =>
    updateAuth({
      address: addr,
      web3Context: w3ctx,
    }).then(() => {
      // TODO: These don't work (metamask at least), what are the correct names?
      w3ctx.connector?.addListener('Web3ReactDeactivate', () => clearAuth());
      w3ctx.connector?.addListener('Web3ReactError', () => clearAuth());
      w3ctx.connector?.addListener('Web3ReactUpdate', () =>
        console.warn('Web3ReactUpdate')
      );
    });

  const connectedAddress = web3Context.account;
  if (!connectedAddress) {
    return (
      <Button
        variant="outlined"
        color="default"
        size="small"
        onClick={() => setWalletModalOpen(true)}
      >
        Connect your wallet
      </Button>
    );
  }

  if (!haveAuthToken) {
    return (
      <>
        <Button
          variant="outlined"
          color="default"
          size="small"
          onClick={() => login(connectedAddress, web3Context)}
          className={classes.button}
        >
          Login to Coordinape
        </Button>

        <Button
          variant="outlined"
          color="default"
          size="small"
          onClick={() => {
            web3Context.deactivate();
            clearAuth();
          }}
        >
          Disconnect
        </Button>
      </>
    );
  }

  const Icon = connectorName ? WALLET_ICONS?.[connectorName] : undefined;

  return (
    <>
      <Button
        variant="outlined"
        color="default"
        size="small"
        startIcon={<Hidden smDown>{Icon && <Icon />}</Hidden>}
        onClick={event => setAnchorEl(event.currentTarget)}
      >
        {shortenAddress(address)}
      </Button>
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        classes={{
          paper: classes.popover,
        }}
        onClose={() => setAnchorEl(undefined)}
        open={!!anchorEl}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Button
          variant="contained"
          size="small"
          onClick={() => {
            web3Context.deactivate();
            setAnchorEl(undefined);
          }}
        >
          Disconnect
        </Button>
      </Popover>
    </>
  );
};
