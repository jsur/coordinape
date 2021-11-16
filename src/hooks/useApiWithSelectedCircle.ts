import { useApiBase } from 'hooks';
import { useMyProfile, useSelectedCircle } from 'recoilState';
import { getApiService } from 'services/api';

import { useRecoilLoadCatch } from './useRecoilLoadCatch';

import { PutUsersParam, NominateUserParam } from 'types';

// API mutations that need a circle id.
// This could be parameterized like the admin hooks.
export const useApiWithSelectedCircle = () => {
  const { fetchManifest, fetchCircle } = useApiBase();
  const { address } = useMyProfile();
  const selectedCircleState = useSelectedCircle();
  const { circleId, myUser } = selectedCircleState;

  const updateMyUser = useRecoilLoadCatch(
    () => async (params: PutUsersParam) => {
      await getApiService().updateMyUser(address, circleId, {
        name: myUser.name,
        bio: myUser.bio,
        non_receiver: myUser.non_receiver,
        non_giver: myUser.non_giver,
        epoch_first_visit: myUser.epoch_first_visit,
        ...params,
      });
      await fetchManifest();
    },
    [address, circleId, myUser]
  );

  const nominateUser = useRecoilLoadCatch(
    () => async (params: NominateUserParam) => {
      await getApiService().nominateUser(address, circleId, params);
      await fetchCircle({ circleId: circleId });
    },
    [address, circleId]
  );

  const vouchUser = useRecoilLoadCatch(
    () => async (nominee_id: number) => {
      await getApiService().vouchUser(address, circleId, nominee_id);
      await fetchCircle({ circleId: circleId });
    },
    [address, circleId],
    { hideLoading: true }
  );

  return {
    updateMyUser,
    nominateUser,
    vouchUser,
  };
};
