import { Factory, Pool, Token } from "../generated/schema";
import { 
  CreateStakingPool as NewStakingPoolEvent 
} from "../generated/ERC20LockUpFactory/ERC20LockUpStakingFactory"
import { ERC20LockUpStakingPool as StakingPoolTemplate } from "../generated/templates";
import { BigInt, log } from "@graphprotocol/graph-ts";

export function handleStakingPoolCreation(event: NewStakingPoolEvent): void {
  const factoryAddress = event.address.toHex();
  const poolAddress = event.params.stakingAddress.toString();
  // const tokenAddress = event.params.stakeToken.toString();
  // let pool = Pool.load(poolAddress)!; ???
  // let token = Token.load(tokenAddress)!; ???

  let factory = Factory.load(factoryAddress);
  if (!factory) {
    factory = new Factory(factoryAddress);
    factory.totalPools = BigInt.fromI32(0);
    factory.save();
  }

  factory.totalPools = factory.totalPools.plus(BigInt.fromI32(1));
  factory.poolAddress.push(poolAddress);

  // token.save()
  
  factory.save();

  //TODO Handle pool creation here based on the factoty type (nolockup/lockup/penalty)
  //pool.save()
  //StakingPoolTemplate.create(event.params.stakingAddress);
  //log.info("Pool initialized: {}", [pool.id]);
}