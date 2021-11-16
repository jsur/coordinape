import iti from 'itiriri';
import { atom, selector } from 'recoil';

import {
  extraEpoch,
  extraCircle,
  extraGift,
  extraNominee,
  extraUser,
  extraProfile,
} from 'utils/modelExtenders';
import { neverEndingPromise } from 'utils/tools';

import {
  IApiFullCircle,
  IApiManifest,
  IUser,
  IFullCircle,
  IManifest,
  IMyProfile,
  IProfile,
  ISelfIdProfile,
} from 'types';

export const rApiManifest = atom<IApiManifest | undefined>({
  key: 'rApiManifest',
  default: undefined,
});

export const rApiFullCircle = atom({
  key: 'rApiFullCircle',
  default: new Map<number, IApiFullCircle>(),
});

export const rRawProfileMap = atom({
  key: 'rRawProfileMap',
  default: new Map<string, IProfile>(),
});

export const rSelfIdProfileMap = atom({
  key: 'rSelfIdProfileMap',
  default: new Map<string, ISelfIdProfile>(),
});

/*
 *
 * Base DB Selectors
 *
 ***************/
export const rManifest = selector<IManifest>({
  key: 'rManifest',
  get: async ({ get }) => {
    const manifest = get(rApiManifest);
    if (manifest === undefined) {
      return neverEndingPromise<IManifest>();
    }
    const selfIdProfile = get(rSelfIdProfileMap).get(manifest.profile.address);

    const circles = manifest.circles.map(c => extraCircle(c));
    const epochs = manifest.active_epochs.map(e => extraEpoch(e));
    const myProfile = {
      ...selfIdProfile,
      ...extraProfile(manifest.profile),
      myUsers: manifest.myUsers.map(u => ({
        ...extraUser(u),
        circle: circles.find(c => c.id === u.circle_id),
        teammates: u.teammates ?? [],
      })),
    } as IMyProfile;

    return {
      myProfile,
      circles,
      epochs,
    };
  },
});

export const rFullCircle = selector<IFullCircle>({
  key: 'rFullCircle',
  get: async ({ get }) => {
    const fullCircle = get(rApiFullCircle);
    if (fullCircle === undefined) {
      return neverEndingPromise<IFullCircle>();
    }
    const selfIdProfileMap = get(rSelfIdProfileMap);

    const fcs = iti(fullCircle.values());

    const users = fcs.flat(fc =>
      fc.users.map(
        ({ profile, ...u }) =>
          ({
            profile: {
              ...selfIdProfileMap.get(u.address),
              ...profile,
            },
            ...extraUser(u),
          } as IUser)
      )
    );
    const userMap = iti(users).toMap(u => u.id);

    const pending = fcs.flat(fc => fc.pending_gifts);
    const pastGifts = fcs.flat(fc =>
      fc.token_gifts.map(g => extraGift(g, userMap))
    );
    const allGifts = pending
      .map(g => extraGift({ ...g, id: g.id + 1000000000000000 }, userMap))
      .concat(pastGifts);
    const epochs = fcs.flat(fc =>
      fc.epochs.map(e => extraEpoch(e, allGifts.toArray()))
    );
    const nominees = fcs.flat(fc =>
      fc.nominees.map(n => extraNominee(n, userMap))
    );

    return {
      usersMap: users.toMap(u => u.id),
      pendingGiftsMap: pending.toMap(g => g.id),
      pastGiftsMap: pastGifts.toMap(g => g.id),
      giftsMap: allGifts.toMap(g => g.id),
      epochsMap: epochs.toMap(e => e.id),
      nomineesMap: nominees.toMap(n => n.id),
    };
  },
});

export const rProfileMap = selector<Map<string, IProfile>>({
  key: 'rProfileMap',
  get: async ({ get }) => {
    const selfIdProfileMap = get(rSelfIdProfileMap);
    return iti(get(rRawProfileMap).values())
      .map(p => ({ ...selfIdProfileMap.get(p.address), ...p } as IProfile))
      .toMap(p => p.address);
  },
});
