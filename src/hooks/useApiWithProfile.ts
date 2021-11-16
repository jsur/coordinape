/* eslint-disable react-hooks/rules-of-hooks */
import { useApiBase } from 'hooks';
import { useMyProfile } from 'recoilState';
import { getApiService } from 'services/api';

import { useRecoilLoadCatch } from './useRecoilLoadCatch';

import { CreateCircleParam, PostProfileParam } from 'types';

// API mutations that need the profile loaded.
export const useApiWithProfile = () => {
  const { address } = useMyProfile();
  const { fetchManifest } = useApiBase();

  const createCircle = useRecoilLoadCatch(
    () =>
      async (
        params: CreateCircleParam,
        captchaToken: string,
        uxresearchJson: string
      ) => {
        const result = await getApiService().createCircle(
          address,
          params,
          captchaToken,
          uxresearchJson
        );
        await fetchManifest();
        return result;
      },
    [address]
  );

  const updateAvatar = useRecoilLoadCatch(
    () => async (newAvatar: File) => {
      await getApiService().uploadAvatar(address, newAvatar);
      await fetchManifest();
    },
    [address]
  );

  const updateBackground = useRecoilLoadCatch(
    () => async (newAvatar: File) => {
      await getApiService().uploadBackground(address, newAvatar);
      await fetchManifest();
    },
    [address]
  );

  const updateMyProfile = useRecoilLoadCatch(
    () => async (params: PostProfileParam) => {
      await getApiService().updateProfile(address, params);
      await fetchManifest();
    },
    [address]
  );

  return {
    createCircle,
    updateAvatar,
    updateBackground,
    updateMyProfile,
  };
};
