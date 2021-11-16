import { useApiBase } from 'hooks';
import { useMyProfile } from 'recoilState';
import { getApiService } from 'services/api';

import { useRecoilLoadCatch } from './useRecoilLoadCatch';

import {
  PutCirclesParam,
  UpdateUsersParam,
  PostUsersParam,
  UpdateCreateEpochParam,
} from 'types';

export const useApiAdminCircle = (circleId: number) => {
  const { fetchCircle } = useApiBase();
  const { address } = useMyProfile();

  const updateCircle = useRecoilLoadCatch(
    () => async (params: PutCirclesParam) => {
      await getApiService().putCircles(address, circleId, params);
      await fetchCircle({ circleId });
    },
    [address, circleId]
  );

  const updateCircleLogo = useRecoilLoadCatch(
    () => async (newAvatar: File) => {
      await getApiService().uploadCircleLogo(address, circleId, newAvatar);
      await fetchCircle({ circleId });
    },
    [address, circleId]
  );

  const createEpoch = useRecoilLoadCatch(
    () => async (params: UpdateCreateEpochParam) => {
      await getApiService().createEpoch(address, circleId, params);
      await fetchCircle({ circleId });
    },
    [address, circleId],
    { hideLoading: true }
  );

  const updateEpoch = useRecoilLoadCatch(
    () => async (epochId: number, params: UpdateCreateEpochParam) => {
      await getApiService().updateEpoch(address, circleId, epochId, params);
      await fetchCircle({ circleId });
    },
    [address, circleId],
    { hideLoading: true }
  );

  const deleteEpoch = useRecoilLoadCatch(
    () => async (epochId: number) => {
      await getApiService().deleteEpoch(address, circleId, epochId);
      await fetchCircle({ circleId });
    },
    [address, circleId]
  );

  const updateUser = useRecoilLoadCatch(
    () => async (userAddress: string, params: UpdateUsersParam) => {
      await getApiService().updateUser(address, circleId, userAddress, params);
      await fetchCircle({ circleId });
    },
    [address, circleId]
  );

  const createUser = useRecoilLoadCatch(
    () => async (params: PostUsersParam) => {
      await getApiService().createUser(address, circleId, params);
      await fetchCircle({ circleId });
    },
    [address, circleId]
  );

  const deleteUser = useRecoilLoadCatch(
    () => async (userAddress: string) => {
      await getApiService().deleteUser(address, circleId, userAddress);
      await fetchCircle({ circleId });
    },
    [address, circleId]
  );

  const getDiscordWebhook = useRecoilLoadCatch(
    () => async () => {
      return await getApiService().getDiscordWebhook(address, circleId);
    },
    [address, circleId]
  );

  return {
    updateCircle,
    updateCircleLogo,
    createEpoch,
    updateEpoch,
    deleteEpoch,
    updateUser,
    createUser,
    deleteUser,
    getDiscordWebhook,
  };
};
