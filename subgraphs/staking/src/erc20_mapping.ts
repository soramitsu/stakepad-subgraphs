import { 
  Stake as StakeEvent, 
  Unstake as UnstakeEvent, 
  Claim as ClaimEvent 
} from "../generated/StakingPoolErc20/StakingPoolErc20"
import { Stake, Unstake, Claim } from "../generated/schema"

export function handleStake(event: StakeEvent): void {
  let entity = new Stake(event.transaction.hash.toHex() + '-' + event.logIndex.toString());

  entity.id = event.transaction.hash.toHex() + '-' + event.logIndex.toString();
  entity.user = event.params.user;
  entity.amount = event.params.amount;

  entity.save();
}

export function handleUnstake(event: UnstakeEvent): void {
  let entity = new Unstake(event.transaction.hash.toHex() + '-' + event.logIndex.toString());

  entity.id = event.transaction.hash.toHex() + '-' + event.logIndex.toString();
  entity.user = event.params.user;
  entity.amount = event.params.amount;

  entity.save();
}

export function handleClaim(event: ClaimEvent): void {
  let entity = new Claim(event.transaction.hash.toHex() + '-' + event.logIndex.toString());

  entity.id = event.transaction.hash.toHex() + '-' + event.logIndex.toString();
  entity.user = event.params.user;
  entity.amount = event.params.amount;

  entity.save();  
}