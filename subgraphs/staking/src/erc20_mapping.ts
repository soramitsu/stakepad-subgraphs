import { 
  Stake as StakeEvent, 
  Unstake as UnstakeEvent, 
  Claim as ClaimEvent,
  ActivatePool as PoolActivationEvent,
  UpdatePool as PoolUpdateEvent
} from "../generated/ERC20LockUpFactory/ERC20LockUpStakingPool"
import { Pool, History } from "../generated/schema"
import { getOrCreateUser } from "./utils/user";
import { BigInt } from "@graphprotocol/graph-ts";

export function handleStake(event: StakeEvent): void {
  let user = getOrCreateUser(event.address, event.params.user);
  let pool = Pool.load(event.address.toHex())!;
  let history = new History(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
  
  history.user = user.id;
  history.pool = pool.id;
  history.amount = event.params.amount;
  history.timestamp = event.block.timestamp;
  history.transactionHash = event.transaction.hash;
  history.event_type = "Stake";
  history.save();

  if (user.amount.gt(BigInt.fromI32(0))) {
    user.pending = user.pending.plus(user.amount.times(pool.accRewardPerShare))
                               .minus(user.rewardDebt)
  }

  pool.totalTokensStaked = pool.totalTokensStaked.plus(event.params.amount);
  user.amount = user.amount.plus(event.params.amount);
  user.rewardDebt = user.amount
                        .times(pool.accRewardPerShare);

  pool.save();
  user.save();
}

export function handleUnstake(event: UnstakeEvent): void {
  let user = getOrCreateUser(event.address, event.params.user);
  let pool = Pool.load(event.address.toHex())!;
  let history = new History(event.transaction.hash.toHex() + "-" + event.logIndex.toString());

  history.user = user.id;
  history.pool = pool.id;
  history.amount = event.params.amount;
  history.timestamp = event.block.timestamp;
  history.transactionHash = event.transaction.hash;
  history.event_type = "Unstake";
  history.save();

  user.pending = user.pending.plus(user.amount.times(pool.accRewardPerShare))
                             .minus(user.rewardDebt)

  user.amount = user.amount.minus(event.params.amount);

  user.rewardDebt = user.amount
                        .times(pool.accRewardPerShare);

  pool.totalTokensStaked = pool.totalTokensStaked.minus(event.params.amount);

  pool.save();
  user.save();
}

export function handleClaim(event: ClaimEvent): void {
  let user = getOrCreateUser(event.address, event.params.user);
  let pool = Pool.load(event.address.toHex())!;
  let history = new History(event.transaction.hash.toHex() + "-" + event.logIndex.toString());

  history.user = user.id;
  history.pool = pool.id;
  history.amount = user.pending;
  history.timestamp = event.block.timestamp;
  history.transactionHash = event.transaction.hash;
  history.event_type = "Claim";
  history.save();
  
  if (user.amount.gt(BigInt.fromI32(0))) {
    user.pending = user.pending.plus(user.amount.times(pool.accRewardPerShare))
                                .minus(user.rewardDebt)

    user.rewardDebt = user.amount.times(pool.accRewardPerShare)
  }

  if (user.pending.gt(BigInt.fromI32(0))) {
    pool.totalTokensClaimed = pool.totalTokensClaimed.plus(user.pending);
    user.claimed = user.claimed.plus(user.pending);
    user.pending = BigInt.fromI32(0)
  }

  pool.save();
  user.save();
}

export function handleActivatePool(event: PoolActivationEvent): void {
  let pool = Pool.load(event.address.toHex())!;

  if (!pool.isPoolActive) {
    pool.isPoolActive = true;
  }

  pool.save();
}

export function handleUpdatePool(event: PoolUpdateEvent): void {
  let pool = Pool.load(event.address.toHex())!;

  pool.accRewardPerShare = event.params.accumulatedRewardTokenPerShare;
  pool.totalTokensStaked = event.params.totalStaked
  pool.lastRewardBlock = event.params.lastBlockNumber;

  pool.save();
}