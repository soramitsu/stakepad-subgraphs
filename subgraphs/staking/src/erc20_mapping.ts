import { 
  Stake as StakeEvent, 
  Unstake as UnstakeEvent, 
  Claim as ClaimEvent 
} from "../generated/ERC20Pools/StakingPoolErc20"
import { Pool, History } from "../generated/schema"
import { getOrCreateUser } from "./utils/user";
import { BigInt } from "@graphprotocol/graph-ts";

export function handleStake(event: StakeEvent): void {
  let user = getOrCreateUser(event.address, event.params.user);
  let pool = Pool.load(event.address.toHex())!;
  
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
  let history = History.load

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