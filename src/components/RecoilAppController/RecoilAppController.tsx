import React, { useEffect } from 'react';

import { useRecoilSnapshot, useRecoilValueLoadable } from 'recoil';

import { useApiBase } from 'hooks';
import { useMyAddress, rSelectedCircleId, rFullCircle } from 'recoilState';
import { DOMAIN_IS_PREVIEW } from 'utils/domain';

export const RecoilAppController = () => {
  const myAddress = useMyAddress();
  const { logout, fetchManifest } = useApiBase();

  // eslint-disable-next-line no-console
  console.log(useRecoilValueLoadable(rSelectedCircleId));
  // eslint-disable-next-line no-console
  console.log(useRecoilValueLoadable(rFullCircle));

  useEffect(() => {
    if (!myAddress) {
      logout();
    } else {
      fetchManifest();
      // TODO: Trigger first navigation
    }
  }, [myAddress]);

  return <>{DOMAIN_IS_PREVIEW && <DebugObserver />}</>;
};

// The following DebugObserver and window.$recoilValues are for debugging.
interface IRecoilAtomValue {
  contents: any;
  state: string;
}

const DebugObserver = () => {
  const snapshot = useRecoilSnapshot();
  React.useEffect(() => {
    // This only get's atoms not selectors, see:
    // https://github.com/facebookexperimental/Recoil/issues/1214
    const nodes = Array.from(snapshot.getNodes_UNSTABLE({ isModified: true }));
    // eslint-disable-next-line no-console
    console.groupCollapsed('RECOIL Δ', ...nodes.map(n => n.key));
    for (const node of nodes) {
      const loadable = snapshot.getLoadable(node);
      // eslint-disable-next-line no-console
      console.log(
        '-',
        node.key,
        loadable.state === 'hasValue' ? loadable.contents : loadable.state
      );
    }
    // eslint-disable-next-line no-console
    console.groupEnd();
  }, [snapshot]);

  return null;
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: This is debug code!!!
window.$recoilValues = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const states = window.$recoilDebugStates as RecoilState[];
  const latest = states[states.length - 1]?.atomValues?._hamt as Map<
    string,
    IRecoilAtomValue
  >;
  // eslint-disable-next-line no-console
  latest.forEach((v, k) => console.log(k, v.state, v.contents));
};
