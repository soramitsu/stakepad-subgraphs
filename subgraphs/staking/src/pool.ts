import {
  Stake as StakeEvent,
  Unstake as UnstakeEvent,
  Claim as ClaimEvent,
  UpdatePool as PoolUpdateEvent
} from "../generated/ERC20LockUpFactory/ERC20LockUpStakingPool"

import {
  Stake as NFTStakeEvent,
  Unstake as NFTUnstakeEvent,
} from "../generated/ERC721LockUpFactory/ERC721LockUpStakingPool"

import { Pool, History } from "../generated/schema"
import { getOrCreateUser } from "./utils/user";
import { BigInt } from "@graphprotocol/graph-ts";

export function handleStake(event: StakeEvent): void {
  let user = getOrCreateUser(event.address, event.params.user);
  let pool = Pool.load(event.address.toHex())!;
  let history = new History(event.transaction.hash.toHex());

  history.user = user.id;
  history.pool = pool.id;
  history.amount = event.params.amount;
  history.timestamp = event.block.timestamp;
  history.event_type = "Stake";
  history.save();

  if (user.amount.gt(BigInt.fromI32(0))) {
    user.pending = user.pending.plus(user.amount.times(pool.accRewardPerShare))
      .minus(user.rewardDebt)
  }
  user.amount = user.amount.plus(event.params.amount);
  user.rewardDebt = user.amount.times(pool.accRewardPerShare);
  pool.totalStaked = pool.totalStaked.plus(event.params.amount);

  pool.save();
  user.save();
}

export function handleUnstake(event: UnstakeEvent): void {
  let user = getOrCreateUser(event.address, event.params.user);
  let pool = Pool.load(event.address.toHex())!;
  let history = new History(event.transaction.hash.toHex());

  history.user = user.id;
  history.pool = pool.id;
  history.amount = event.params.amount;
  history.timestamp = event.block.timestamp;
  history.event_type = "Unstake";
  history.save();

  user.pending = user.pending.plus(user.amount.times(pool.accRewardPerShare))
    .minus(user.rewardDebt)
  user.amount = user.amount.minus(event.params.amount);
  user.rewardDebt = user.amount.times(pool.accRewardPerShare);

  pool.totalStaked = pool.totalStaked.minus(event.params.amount);

  pool.save();
  user.save();
}

export function handleNFTStake(event: NFTStakeEvent): void {
  let user = getOrCreateUser(event.address, event.params.user);
  let pool = Pool.load(event.address.toHex())!;
  let history = new History(event.transaction.hash.toHex());
  let amount = BigInt.fromI32(event.params.tokenIds.length);

  history.user = user.id;
  history.pool = pool.id;
  history.amount = amount;
  history.timestamp = event.block.timestamp;
  history.event_type = "NFTStake";

  let tokenIds = event.params.tokenIds;
  let tokenIdStr = new Array<string>(tokenIds.length);
  for (let i = 0; i < tokenIds.length; i++) {
    tokenIdStr[i] = tokenIds[i].toString();
  }
  history.tokenIds = tokenIdStr;
  history.save();

  if (user.amount.gt(BigInt.fromI32(0))) {
    user.pending = user.pending.plus(user.amount.times(pool.accRewardPerShare))
      .minus(user.rewardDebt)
  }
  user.amount = user.amount.plus(amount);
  user.rewardDebt = user.amount.times(pool.accRewardPerShare);
  pool.totalStaked = pool.totalStaked.plus(amount);

  pool.save();
  user.save();
}

export function handleNFTUnstake(event: NFTUnstakeEvent): void {
  let user = getOrCreateUser(event.address, event.params.user);
  let pool = Pool.load(event.address.toHex())!;
  let history = new History(event.transaction.hash.toHex());
  let amount = BigInt.fromI32(event.params.tokenIds.length);

  history.user = user.id;
  history.pool = pool.id;
  history.amount = amount;
  history.timestamp = event.block.timestamp;
  history.event_type = "NFTUnstake";

  let tokenIds = event.params.tokenIds;
  let tokenIdStr = new Array<string>(tokenIds.length);
  for (let i = 0; i < tokenIds.length; i++) {
    tokenIdStr[i] = tokenIds[i].toString();
  }
  history.tokenIds = tokenIdStr;
  history.save();

  user.pending = user.pending.plus(user.amount.times(pool.accRewardPerShare))
    .minus(user.rewardDebt)
  user.amount = user.amount.minus(amount);
  user.rewardDebt = user.amount.times(pool.accRewardPerShare);

  pool.totalStaked = pool.totalStaked.minus(amount);

  pool.save();
  user.save();
}

export function handleClaim(event: ClaimEvent): void {
  let user = getOrCreateUser(event.address, event.params.user);
  let pool = Pool.load(event.address.toHex())!;
  let history = new History(event.transaction.hash.toHex());

  history.user = user.id;
  history.pool = pool.id;
  history.amount = user.pending;
  history.timestamp = event.block.timestamp;
  history.event_type = "Claim";
  history.save();

  if (user.amount.gt(BigInt.fromI32(0))) {
    user.pending = user.pending.plus(user.amount.times(pool.accRewardPerShare))
      .minus(user.rewardDebt)
    user.rewardDebt = user.amount.times(pool.accRewardPerShare)
  }

  user.pending = BigInt.fromI32(0);
  user.claimed = user.claimed.plus(event.params.amount);
  pool.totalClaimed = pool.totalClaimed.plus(event.params.amount);
  pool.totalPenalties = pool.totalPenalties.plus(event.params.penaltyAmount);

  pool.save();
  user.save();
}

export function handleUpdatePool(event: PoolUpdateEvent): void {
  let pool = Pool.load(event.address.toHex())!;
  pool.accRewardPerShare = event.params.accumulatedRewardTokenPerShare;
  pool.totalStaked = event.params.totalStaked
  pool.lastRewardTimestamp = event.params.lastBlockTimestamp;
  pool.save();
}