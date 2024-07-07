import {
  Stake as StakeEvent,
  Unstake as UnstakeEvent,
  Claim as ClaimEvent,
  UpdatePool as PoolUpdateEvent
} from "../generated/ERC20LockUpFactory/ERC20LockUpStakingPool"

import {
  PenaltyClaim as PenaltyClaimEvent
} from "../generated/templates/ERC20PenaltyFeePool/ERC20PenaltyFeePool"

import { Pool, History } from "../generated/schema"
import { getOrCreateUser } from "./utils/user";
import { BigInt } from "@graphprotocol/graph-ts";

/**
 * Handles the `Stake` event emitted by the ERC20 StakingPool contract.
 * 
 * Indexing the staking event, updating the user's staked amount, 
 * pending rewards, and the pool's total staked amount. 
 *
 * @param event - Stake event contains the user address and amount staked.
 */
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

/**
 * Handles the `Unstake` event emitted by the ERC20 StakingPool contract.
 * 
 * Indexing the unstaking event, updating the user's staked amount, 
 * pending rewards, and the pool's total staked amount. 
 *
 * @param event - Unstake event contains the user address and amount unstaked.
 */
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

/**
 * Handles the `Claim` event emitted by the ERC20 StakingPool contract.
 * 
 * Indexing the claim event, updating the user's pending rewards, 
 * claimed rewards, the pool's total claimed rewards and penalties. 
 *
 * @param event - Claim event contains the user address and claimed amount.
 */
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

  pool.save();
  user.save();
}

export function handlePenaltyClaim(event: PenaltyClaimEvent): void {
  let user = getOrCreateUser(event.address, event.params.user);
  let pool = Pool.load(event.address.toHex())!;
  let history = new History(event.transaction.hash.toHex());

  history.user = user.id;
  history.pool = pool.id;
  history.amount = user.pending;
  history.timestamp = event.block.timestamp;
  history.event_type = "PenaltyClaim";
  history.save();

  if (user.amount.gt(BigInt.fromI32(0))) {
    user.pending = user.pending.plus(user.amount.times(pool.accRewardPerShare))
      .minus(user.rewardDebt)
    user.rewardDebt = user.amount.times(pool.accRewardPerShare)
  }

  user.pending = BigInt.fromI32(0);
  user.claimed = user.claimed.plus(event.params.amount);
  pool.totalClaimed = pool.totalClaimed.plus(event.params.amount);
  pool.totalPenalties = pool.totalPenalties.plus(event.params.penalityAmount);

  pool.save();
  user.save();
}

/**
 * Handles the `UpdatePool` event emitted by the ERC20 StakingPool contract.
 * 
 * Indexing the pool update event, updating the pool's accumulated reward per share,
 * total staked amount, and the last reward timestamp.
 *
 * @param event - The UpdatePool event contains the updated pool parameters.
 */
export function handleUpdatePool(event: PoolUpdateEvent): void {
  let pool = Pool.load(event.address.toHex())!;
  pool.accRewardPerShare = event.params.accumulatedRewardTokenPerShare;
  pool.totalStaked = event.params.totalStaked
  pool.lastRewardTimestamp = event.params.lastBlockTimestamp;
  pool.save();
}