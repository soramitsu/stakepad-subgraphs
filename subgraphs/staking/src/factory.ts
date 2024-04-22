import { Factory } from "../generated/schema";
import { 
    CreateStakingPool as NewStakingPoolEvent 
} from "../generated/ERC20Pools/ERC20LockUpFactory"
import { BigInt } from "@graphprotocol/graph-ts";

export function handleStakingPoolCreation(event: NewStakingPoolEvent): void {
  const factoryAddress = event.address.toString();
  const poolAddress = event.params.stakingAddress.toString();

  let factory = Factory.load(factoryAddress);
  if (!factory) {
    factory = new Factory(factoryAddress);
  }

  factory.totalPools = factory.totalPools.plus(BigInt.fromI32(1));
  factory.poolAddress.push(poolAddress);

  factory.save();
}