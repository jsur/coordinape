import iti from 'itiriri';
import isEqual from 'lodash/isEqual';
import { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil';

import { useApiBase } from 'hooks';
import {
  rLocalTeammates,
  rLocalGifts,
  rUsersMap,
  useCircle,
  rAvailableTeammates,
  rLocalTeammatesChanged,
  useUserGifts,
  rAllocationStepStatus,
  useSelectedCircleId,
} from 'recoilState';
import { getApiService } from 'services/api';

import { useDeepChangeEffect } from './useDeepChangeEffect';
import { useRecoilLoadCatch } from './useRecoilLoadCatch';

import { ISimpleGift, IUser, ITokenGift, PostTokenGiftsParam } from 'types';

/**
 * Controller: triggers updates if the underlying data from the api changes.
 */
export const useAllocationController = (circleId: number) => {
  const { myUser } = useCircle(circleId);
  const { pendingGiftsFrom } = useUserGifts(myUser.id);
  const usersMap = useRecoilValue(rUsersMap);

  const [localTeammates, setLocalTeammates] = useRecoilState(
    rLocalTeammates(circleId)
  );

  const setLocalGifts = useSetRecoilState(rLocalGifts(circleId));

  useDeepChangeEffect(() => {
    setLocalTeammates(myUser.teammates);
    setLocalGifts(getLocalGiftUpdater(myUser.teammates));
  }, [myUser.teammates]);

  useDeepChangeEffect(() => {
    const newGifts = pendingGiftsToSimpleGifts(pendingGiftsFrom, usersMap);
    setLocalGifts(getLocalGiftUpdater(localTeammates, newGifts));
  }, [pendingGiftsFrom]);
};

/**
 * Methods and state for an allocation.
 */
export const useAllocation = (circleId: number) => {
  const { fetchCircle } = useApiBase();
  const { myUser } = useCircle(circleId);
  const { pendingGiftsFrom: pendingGifts } = useUserGifts(myUser.id);

  const [completedSteps] = useRecoilValue(rAllocationStepStatus(circleId));
  const availableTeammates = useRecoilValue(rAvailableTeammates);
  const usersMap = useRecoilValue(rUsersMap);
  const localTeammatesChanged = useRecoilValue(
    rLocalTeammatesChanged(circleId)
  );

  const [localTeammates, setLocalTeammates] = useRecoilState(
    rLocalTeammates(circleId)
  );
  const [localGifts, setLocalGifts] = useRecoilState(rLocalGifts(circleId));

  const tokenStarting = myUser?.non_giver !== 0 ? 0 : myUser.starting_tokens;
  const tokenAllocated = Array.from(localGifts).reduce(
    (sum, { tokens }: ISimpleGift) => sum + tokens,
    0
  );
  const tokenRemaining = tokenStarting - tokenAllocated;
  const teammateReceiverCount = localGifts
    .map(g => (g.user.non_receiver ? 0 : 1))
    .reduce((a: number, b: number) => a + b, 0);
  const givePerUser = new Map(localGifts.map(g => [g.user.id, g]));

  const localGiftsChanged =
    buildDiffMap(pendingGiftMap(pendingGifts), simpleGiftsToMap(localGifts))
      .size > 0;

  const toggleLocalTeammate = (userId: number) => {
    if (myUser.circle.team_selection === 0) {
      console.error('toggleLocalTeammate with circle without team selection');
      return;
    }
    const newTeammates = localTeammates.find(u => u.id === userId)
      ? [...localTeammates.filter(u => u.id !== userId)]
      : [
          ...localTeammates,
          availableTeammates.find(u => u.id === userId) as IUser,
        ];
    setLocalTeammates(newTeammates);
    setLocalGifts(getLocalGiftUpdater(newTeammates));
  };

  const setAllLocalTeammates = () => {
    if (myUser.circle.team_selection === 0) {
      console.error('toggleLocalTeammate with circle without team selection');
      return;
    }
    setLocalTeammates(availableTeammates);
    setLocalGifts(getLocalGiftUpdater(availableTeammates));
  };

  const clearLocalTeammates = () => {
    if (myUser.circle.team_selection === 0) {
      console.error('toggleLocalTeammate with circle without team selection');
      return;
    }
    setLocalTeammates([]);
    setLocalGifts(getLocalGiftUpdater([]));
  };

  const updateGift = (
    id: number,
    { note, tokens }: { note?: string; tokens?: number }
  ) => {
    const idx = localGifts.findIndex(g => g.user.id === id);
    const original = localGifts[idx];
    const user = usersMap.get(id);
    if (!user) {
      throw `User ${id} not found in userMap`;
    }
    if (idx === -1) {
      return [
        ...localGifts,
        { user, tokens: tokens ?? 0, note: note ?? '' } as ISimpleGift,
      ];
    }
    const copy = localGifts.slice();
    copy[idx] = {
      user,
      tokens: Math.max(0, tokens !== undefined ? tokens : original.tokens),
      note: note !== undefined ? note : original.note,
    };
    setLocalGifts(copy);
  };

  const rebalanceGifts = () => {
    if (teammateReceiverCount === 0) {
      return;
    }
    if (tokenAllocated === 0) {
      setLocalGifts(
        localGifts.slice().map(g => {
          return {
            ...g,
            tokens: Math.floor(tokenStarting / teammateReceiverCount),
          };
        })
      );
    } else {
      const rebalance = tokenStarting / tokenAllocated;
      setLocalGifts(
        localGifts
          .slice()
          .map(g => ({ ...g, tokens: Math.floor(g.tokens * rebalance) }))
      );
    }
  };

  const saveTeammates = useRecoilLoadCatch(
    () => async () => {
      await getApiService().postTeammates(
        myUser.address,
        myUser.circle_id,
        localTeammates.map(u => u.id)
      );
      await fetchCircle({ circleId: myUser.circle_id });
    },
    [myUser],
    {
      success: 'Saved Teammates',
      transformError: e =>
        (e.message = `With hardware wallets, try shorter changes. ${e.message}`),
    }
  );

  const saveGifts = useRecoilLoadCatch(
    () => async () => {
      const diff = buildDiffMap(
        pendingGiftMap(pendingGifts),
        simpleGiftsToMap(localGifts)
      );

      const params: PostTokenGiftsParam[] = iti(diff.entries())
        .map(([userId, [tokens, note]]) => ({
          tokens,
          recipient_id: userId,
          note,
        }))
        .toArray();

      await getApiService().postTokenGifts(
        myUser.address,
        myUser.circle_id,
        params
      );
      await fetchCircle({ circleId: myUser.circle_id });
    },
    [pendingGifts, localGifts],
    { success: 'Saved Gifts' }
  );

  return {
    localTeammates,
    localGifts,
    localGiftsChanged,
    localTeammatesChanged,
    tokenRemaining,
    givePerUser,
    completedSteps,
    toggleLocalTeammate,
    setAllLocalTeammates,
    clearLocalTeammates,
    rebalanceGifts,
    saveGifts,
    saveTeammates,
    updateGift,
  };
};

/**
 * Updater for gifts, for non-empty gifts and teammates.
 *
 * @param newTeammates - Include these.
 * @param newGifts - Overwrite the existing gifts.
 */
const getLocalGiftUpdater =
  (newTeammates: IUser[], newGifts?: ISimpleGift[]) =>
  (baseGifts: ISimpleGift[]) => {
    const startingGifts = newGifts ?? baseGifts;
    const startingSet = new Set(startingGifts.map(g => g.user.id));
    const newSet = new Set(newTeammates.map(u => u.id));
    const keepers = [] as ISimpleGift[];
    startingGifts.forEach(g => {
      if (newSet.has(g.user.id) || g.note !== '' || g.tokens > 0) {
        keepers.push(g);
      }
    });
    newTeammates.forEach(u => {
      if (!startingSet.has(u.id)) {
        keepers.push({ user: u, tokens: 0, note: '' } as ISimpleGift);
      }
    });
    return keepers;
  };

const pendingGiftsToSimpleGifts = (
  pending: ITokenGift[],
  usersMap: Map<number, IUser>
) =>
  pending.map(
    g =>
      ({
        user: usersMap.get(g.recipient_id),
        tokens: g.tokens,
        note: g.note,
      } as ISimpleGift)
  );

type tokenNote = [number, string];

const simpleGiftsToMap = (source: ISimpleGift[]): Map<number, tokenNote> =>
  new Map(source.map(g => [g.user.id, [g.tokens, g.note]]));

const pendingGiftMap = (pending: ITokenGift[]): Map<number, tokenNote> =>
  new Map(pending.map(g => [g.recipient_id, [g.tokens, g.note]]));

const buildDiffMap = (
  remoteMap: Map<number, tokenNote>,
  localMap: Map<number, tokenNote>
) => {
  const diff = iti(localMap.keys()).reduce<Map<number, tokenNote>>(
    (changes: Map<number, tokenNote>, key: number) => {
      // changes is initialized as remote,
      if (!changes.has(key)) {
        const tn = localMap.get(key) as tokenNote;
        if (tn[0] !== 0 || tn[1] !== '') {
          changes.set(key, tn);
        }
      } else {
        const remote = changes.get(key) as tokenNote;
        const local = localMap.get(key) as tokenNote;
        if (isEqual(remote, local)) {
          changes.delete(key);
        } else {
          changes.set(key, local);
        }
      }
      return changes;
    },
    new Map(remoteMap)
  );

  return diff;
};

export const useSelectedAllocation = () => useAllocation(useSelectedCircleId());
export const useSelectedAllocationController = () =>
  useAllocationController(useSelectedCircleId());
