import { Web3Provider } from '@ethersproject/providers';
import axios from 'axios';

import { API_URL } from 'utils/domain';
import { getSignature } from 'utils/provider';

import {
  IApiCircle,
  IApiTokenGift,
  IApiProfile,
  IApiUser,
  IApiEpoch,
  IApiLogin,
  IApiManifest,
  PostProfileParam,
  PostTokenGiftsParam,
  PostUsersParam,
  PutCirclesParam,
  PutUsersParam,
  UpdateUsersParam,
  UpdateCreateEpochParam,
  NominateUserParam,
  IApiNominee,
  CreateCircleParam,
  IApiFullCircle,
} from 'types';

// // TODO: Update to v2 token gated endpoints
// // TODO: Update to v2 token gated endpoints
// // TODO: Update to v2 token gated endpoints
// prefix('v2')
//   prefix('{circle_id}')
//     prefix('admin')->middleware(['verify-circle-admin'])->group(function () {
//             put('/circles/{circle}', [CircleController::class, 'updateCircle']);
//             put('/users/{address}', [UserController::class, 'adminUpdateUser']);
//             post('/users', [UserController::class, 'createUser']);
//             delete('/users/{address}', [UserController::class, 'deleteUser']);
//             post('/epoches', [EpochController::class, 'createEpoch']);
//             put('/epoches/{epoch}', [EpochController::class, 'updateEpoch']);
//             delete('/epoches/{epoch}', [EpochController::class, 'deleteEpoch']);
//             post('/upload-logo', [CircleController::class, 'uploadCircleLogo']);
//             get('/webhook', [CircleController::class, 'getWebhook']);
//             post('/bulk-update', [UserController::class, 'bulkUpdate']);
//             post('/bulk-create', [UserController::class, 'bulkCreate']);
//             post('/bulk-delete', [UserController::class, 'bulkDelete']);
//             post('/bulk-restore', [UserController::class, 'bulkRestore']);

//             put('/users', [UserController::class, 'updateMyUser']);
//             post('/token-gifts', [DataController::class, 'newUpdateGifts']);
//             post('/teammates', [DataController::class, 'updateTeammates']);
//             post('/nominees', [NominationController::class, 'createNominee']);
//             post('/vouch', [NominationController::class, 'addVouch']);
//             get('/nominees', [NominationController::class, 'getNominees']);
//             get('/csv', [DataController::class, 'generateCsv']);

axios.defaults.baseURL = API_URL;

export class APIService {
  provider = undefined as Web3Provider | undefined;
  address = undefined as string | undefined;
  axios = axios.create({ baseURL: API_URL });

  constructor(provider?: Web3Provider, token?: string) {
    this.provider = provider;
    token && this.setAuth(token);
  }

  setProvider(provider?: Web3Provider) {
    this.provider = provider;
  }

  setAuth(token?: string) {
    const auth = token
      ? {
          headers: { Authorization: 'Bearer ' + token },
        }
      : {};
    this.axios = axios.create({ baseURL: API_URL, ...auth });
  }

  login = async (address: string): Promise<IApiLogin> => {
    const { signature, hash } = await getSignature(
      'Login to Coordinape',
      this.provider
    );
    const response = await this.axios.post('/v2/login', {
      signature,
      hash,
      address,
    });
    return response.data;
  };

  logout = async (): Promise<boolean> => {
    return (await this.axios.post('/v2/logout')).data;
  };

  getManifest = async (
    address: string,
    circleId?: number
  ): Promise<IApiManifest> => {
    const response = await this.axios.post('/v2/manifest', {
      address,
      circleId,
    });
    return response.data;
  };

  getFullCircle = async (
    address: string,
    circleId: number
  ): Promise<IApiFullCircle> => {
    const response = await this.axios.get(`/v2/full-circle`, {
      params: {
        circleId,
      },
    });
    return response.data;
  };

  getProfile = async (address: string): Promise<IApiProfile> => {
    return await this.axios.get(`/profile/${address}`);
  };

  updateProfile = async (
    address: string,
    params: PostProfileParam
  ): Promise<IApiProfile> => {
    const data = JSON.stringify(params);
    const { signature, hash } = await getSignature(data, this.provider);
    const response = await this.axios.post(`/profile`, {
      signature,
      data,
      address,
      hash,
    });
    return response.data;
  };

  createCircle = async (
    address: string,
    params: CreateCircleParam,
    captcha_token: string,
    uxresearch_json: string
  ): Promise<IApiCircle> => {
    const data = JSON.stringify(params);
    const { signature, hash } = await getSignature(data, this.provider);
    const response = await this.axios.post('/circles', {
      signature,
      data,
      address,
      hash,
      captcha_token,
      uxresearch_json,
    });
    return response.data;
  };

  putCircles = async (
    address: string,
    circleId: number,
    params: PutCirclesParam
  ): Promise<IApiCircle> => {
    const data = JSON.stringify(params);
    const { signature, hash } = await getSignature(data, this.provider);
    const response = await this.axios.put(
      `${circleId}/admin/circles/${circleId}`,
      {
        signature,
        data,
        address,
        hash,
      }
    );
    return response.data as IApiCircle;
  };

  uploadCircleLogo = async (
    address: string,
    circleId: number,
    file: File
  ): Promise<IApiCircle> => {
    const { signature, hash } = await getSignature(file.name, this.provider);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('signature', signature);
    formData.append('address', address);
    formData.append('data', file.name);
    formData.append('hash', hash);
    const response = await this.axios.post(
      `${circleId}/admin/upload-logo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data as IApiCircle;
  };

  createEpoch = async (
    address: string,
    circleId: number,
    params: UpdateCreateEpochParam
  ): Promise<IApiEpoch> => {
    const data = JSON.stringify(params);
    const { signature, hash } = await getSignature(data, this.provider);
    const response = await this.axios.post(`${circleId}/admin/v2/epoches`, {
      signature,
      data,
      address,
      hash,
    });
    return response.data as IApiEpoch;
  };

  updateEpoch = async (
    address: string,
    circleId: number,
    epochId: number,
    params: UpdateCreateEpochParam
  ): Promise<IApiEpoch> => {
    const data = JSON.stringify(params);
    const { signature, hash } = await getSignature(data, this.provider);
    const response = await this.axios.put(
      `${circleId}/admin/epoches/${epochId}`,
      {
        signature,
        data,
        address,
        hash,
      }
    );
    return response.data as IApiEpoch;
  };

  deleteEpoch = async (
    address: string,
    circleId: number,
    epochId: number
  ): Promise<any> => {
    const data = JSON.stringify({ epoch_id: epochId });
    const { signature, hash } = await getSignature(data, this.provider);
    const response = await this.axios.delete(
      `${circleId}/admin/epoches/${epochId}`,
      {
        data: {
          signature,
          data,
          address,
          hash,
        },
      }
    );
    return response.data;
  };

  createUser = async (
    adminAddress: string,
    circleId: number,
    params: PostUsersParam
  ): Promise<IApiUser> => {
    const data = JSON.stringify(params);
    const { signature, hash } = await getSignature(data, this.provider);
    const response = await this.axios.post(`${circleId}/admin/users`, {
      signature,
      data,
      address: adminAddress,
      hash,
    });
    return response.data;
  };

  updateUser = async (
    adminAddress: string,
    circleId: number,
    originalAddress: string,
    params: UpdateUsersParam
  ): Promise<IApiUser> => {
    const data = JSON.stringify(params);
    const { signature, hash } = await getSignature(data, this.provider);
    const response = await this.axios.put(
      `${circleId}/admin/users/${originalAddress}`,
      {
        signature,
        data,
        address: adminAddress,
        hash,
      }
    );
    return response.data;
  };

  updateMyUser = async (
    address: string,
    circleId: number,
    params: PutUsersParam
  ): Promise<IApiUser> => {
    const data = JSON.stringify(params);
    const { signature, hash } = await getSignature(data, this.provider);
    const response = await this.axios.put(`${circleId}/users`, {
      signature,
      data,
      address,
      hash,
    });
    return response.data;
  };

  deleteUser = async (
    adminAddress: string,
    circleId: number,
    address: string
  ): Promise<IApiUser> => {
    const params: any = { address };
    const data = JSON.stringify(params);
    const { signature, hash } = await getSignature(data, this.provider);
    const response = await this.axios.delete(
      `${circleId}/admin/users/${address}`,
      {
        data: {
          signature,
          data,
          address: adminAddress,
          hash,
        },
      }
    );
    return response.data;
  };

  postProfileUpload = async (address: string, file: File, endpoint: string) => {
    const { signature, hash } = await getSignature(file.name, this.provider);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('signature', signature);
    formData.append('address', address);
    formData.append('data', file.name);
    formData.append('hash', hash);
    const response = await this.axios.post(
      `/${endpoint}/${address}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  };

  uploadAvatar = async (address: string, file: File): Promise<any> =>
    this.postProfileUpload(address, file, 'upload-avatar');

  uploadBackground = async (address: string, file: File): Promise<any> =>
    this.postProfileUpload(address, file, 'upload-background');

  postTeammates = async (
    address: string,
    circleId: number,
    teammates: number[]
  ): Promise<IApiUser & { pending_sent_gifts: IApiTokenGift[] }> => {
    const data = JSON.stringify({ teammates: teammates });
    const { signature, hash } = await getSignature(data, this.provider);
    const response = await this.axios.post(`${circleId}/teammates`, {
      signature,
      data,
      address,
      hash,
    });
    return response.data;
  };

  postTokenGifts = async (
    address: string,
    circleId: number,
    params: PostTokenGiftsParam[]
  ): Promise<IApiUser & { pending_sent_gifts: IApiTokenGift[] }> => {
    const data = JSON.stringify(params);
    const { signature, hash } = await getSignature(data, this.provider);
    const response = await this.axios.post(
      `${circleId}/v2/token-gifts/${address}`,
      {
        signature,
        data,
        address,
        hash,
      }
    );
    return response.data;
  };

  getDiscordWebhook = async (
    address: string,
    circleId: number
  ): Promise<any> => {
    const params: any = { address };
    const data = JSON.stringify(params);
    const { signature, hash } = await getSignature(data, this.provider);
    const response = await this.axios.get(`${circleId}/admin/webhook`, {
      params: {
        signature,
        data,
        address,
        hash,
      },
    });
    return response.data;
  };

  nominateUser = async (
    address: string,
    circleId: number,
    params: NominateUserParam
  ): Promise<IApiNominee> => {
    const data = JSON.stringify(params);
    const { signature, hash } = await getSignature(data, this.provider);
    const response = await this.axios.post(`${circleId}/nominees`, {
      signature,
      data,
      address,
      hash,
    });
    return response.data;
  };

  vouchUser = async (
    address: string,
    circleId: number,
    nominee_id: number
  ): Promise<IApiNominee> => {
    const data = JSON.stringify({ nominee_id });
    const { signature, hash } = await getSignature(data, this.provider);
    const response = await this.axios.post(`${circleId}/vouch`, {
      signature,
      data,
      address,
      hash,
    });
    return response.data;
  };
}

let apiService: APIService;

export const getApiService = (): APIService => {
  if (apiService) {
    return apiService;
  }
  apiService = new APIService();
  return apiService;
};
