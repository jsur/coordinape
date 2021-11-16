import iti from 'itiriri';
import { useHistory } from 'react-router';

import { useRecoilLoadCatch } from 'hooks';
import {
  rSelectedCircleId,
  useMyAddress,
  rApiManifest,
  rApiFullCircle,
  rSelectedCircleIdSource,
  rCirclesMap,
  rSelfIdProfileMap,
} from 'recoilState';
import { getHistoryPath, getAllocationPath } from 'routes/paths';
import { getApiService } from 'services/api';
import { getSelfIdProfiles } from 'utils/selfIdHelpers';

export const useApiBase = () => {
  const history = useHistory();
  const myAddress = useMyAddress();

  const navigateDefault = (circleId: number, hasCurrentEpoch: boolean) => {
    if (history.location.pathname === '/') {
      if (hasCurrentEpoch) {
        history.push(getAllocationPath());
      } else {
        history.push(getHistoryPath());
      }
    }
    // TODO: hasCurrentEpoch is a lie (not passed in correctly)
  };

  const logout = useRecoilLoadCatch(
    ({ set }) =>
      async () => {
        set(rApiFullCircle, new Map());
        set(rApiManifest, undefined);
        return await getApiService().logout();
      },
    []
  );

  const fetchSelfIds = useRecoilLoadCatch(
    ({ set }) =>
      async (addresses: string[]) => {
        if (addresses.length === 0) {
          return;
        }
        const profiles = await getSelfIdProfiles(addresses);
        set(rSelfIdProfileMap, om => {
          const result = new Map(om);
          iti(profiles).forEach(p => result.set(p.address, p));
          return result;
        });
      },
    [],
    { hideLoading: true }
  );

  const fetchManifest = useRecoilLoadCatch(
    ({ snapshot, set }) =>
      async () => {
        const circleIdState = snapshot.getLoadable(rSelectedCircleId);
        const circleId =
          circleIdState.state === 'hasValue'
            ? circleIdState.contents
            : undefined;
        const manifest = await getApiService().getManifest(myAddress, circleId);

        // eslint-disable-next-line no-console
        console.log('fetchManifest', manifest);

        set(rApiManifest, manifest);
        const fullCircle = manifest.circle;
        if (fullCircle) {
          // TODO: refactor with old RecoilHelper
          set(rApiFullCircle, m => {
            const result = new Map(m);
            result.set(fullCircle.circle.id, fullCircle);
            return result;
          });
          set(rSelectedCircleIdSource, fullCircle.circle.id);
          fetchSelfIds(fullCircle.users.map(u => u.address));
          navigateDefault(fullCircle.circle.id, false);
        }
        return manifest;
      },
    [myAddress]
  );

  const fetchCircle = useRecoilLoadCatch(
    ({ snapshot, set }) =>
      async ({ circleId, select }: { circleId: number; select?: boolean }) => {
        if (!(await snapshot.getPromise(rCirclesMap)).has(circleId)) {
          // Wasn't included in their manifest.
          throw `Your profile doesn't have access to ${circleId}`;
        }

        const fullCircle = await getApiService().getFullCircle(
          myAddress,
          circleId
        );
        set(rApiFullCircle, m => {
          const result = new Map(m);
          result.set(fullCircle.circle.id, fullCircle);
          return result;
        });
        select && set(rSelectedCircleIdSource, circleId);
        select && navigateDefault(circleId, true);

        fetchSelfIds(fullCircle.users.map(u => u.address));
      },
    [myAddress]
  );

  const selectCircle = useRecoilLoadCatch(
    ({ snapshot, set }) =>
      async (circleId: number) => {
        if (circleId === -1) {
          // This signifies no circle selected
          // TODO: Change to use undefined
          set(rSelectedCircleIdSource, circleId);
        }

        if (!(await snapshot.getPromise(rCirclesMap)).has(circleId)) {
          // Wasn't included in their manifest.
          throw `Your profile doesn't have access to ${circleId}`;
        }

        if (!(await snapshot.getPromise(rApiFullCircle)).has(circleId)) {
          // Need to fetch this circle
          fetchCircle({ circleId, select: true });
        } else {
          set(rSelectedCircleIdSource, circleId);
        }
      },
    [myAddress]
  );

  return {
    fetchManifest,
    fetchCircle,
    selectCircle,
    selectAndFetchCircle: (circleId: number) =>
      fetchCircle({ circleId, select: true }),
    logout,
  };
};
