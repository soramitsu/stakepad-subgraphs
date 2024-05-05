import { Factory, Pool, Token } from "../generated/schema";
import { 
  CreateStakingPool as NewStakingPoolEvent 
} from "../generated/ERC20LockUpFactory/ERC20LockUpFactory"
import { BigInt } from "@graphprotocol/graph-ts";

export function handleStakingPoolCreation(event: NewStakingPoolEvent): void {
  const factoryAddress = event.address.toString();
  const poolAddress = event.params.stakingAddress.toString();
  const tokenAddress = event.params.stakeToken.toString();
  let pool = Pool.load(poolAddress)!;
  let token = Token.load(tokenAddress)!;

  let factory = Factory.load(factoryAddress);
  if (!factory) {
    factory = new Factory(factoryAddress);
  }

  factory.totalPools = factory.totalPools.plus(BigInt.fromI32(1));
  factory.poolAddress.push(poolAddress);

  token.save()
  pool.save()
  factory.save();
}