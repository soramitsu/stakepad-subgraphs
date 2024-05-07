import { Factory, Pool, Token } from "../generated/schema";

import { 
  CreateStakingPool as LockUpStakingPoolEvent 
} from "../generated/ERC20LockUpFactory/ERC20LockUpStakingFactory"

import {
  CreateStakingPool as NoLockUpStakingPoolEvent
} from "../generated/ERC20NoLockUpFactory/ERC20NoLockUpStakingFactory"

import {
  CreateStakingPool as PenaltyFeeStakingPoolEvent
} from "../generated/ERC20NoLockUpFactory/ERC20NoLockUpStakingFactory"

import { ERC20LockUpStakingPool as StakingPoolTemplate } from "../generated/templates";
import { BigInt, log } from "@graphprotocol/graph-ts";

export function handleLockUpStakingPoolCreation(event: LockUpStakingPoolEvent): void {
  const factoryAddress = event.address.toHex();
  const poolAddress = event.params.stakingAddress.toString();
  const tokenAddress = event.params.stakeToken.toString();

  let factory = Factory.load(factoryAddress);
  if (factory === null) {
    factory = new Factory(factoryAddress);
    factory.totalPools = BigInt.fromI32(0);
    factory.save();
  }
  factory.totalPools = factory.totalPools.plus(BigInt.fromI32(1));
  factory.poolAddress.push(poolAddress);
  factory.save();

  let pool = new Pool(poolAddress);
  pool.stakeToken = tokenAddress;
  pool.startTime = event.block.timestamp;
  pool.save();
  
  let token = Token.load(tokenAddress);
  if (!token) {
    token = new Token(tokenAddress);
    token.save();
  }

  StakingPoolTemplate.create(event.params.stakingAddress);
}

export function handleNoLockUpStakingPoolCreation(event: NoLockUpStakingPoolEvent): void {
  const factoryAddress = event.address.toHex();
  const poolAddress = event.params.stakingAddress.toString();
  const tokenAddress = event.params.stakeToken.toString();

  let factory = Factory.load(factoryAddress);
  if (!factory) {
    factory = new Factory(factoryAddress);
    factory.totalPools = BigInt.fromI32(0);
    factory.save();
  }
  factory.totalPools = factory.totalPools.plus(BigInt.fromI32(1));
  factory.poolAddress.push(poolAddress);
  factory.save();

  let pool = new Pool(poolAddress);
  pool.stakeToken = tokenAddress;
  pool.startTime = event.block.timestamp;
  pool.save();
  
  let token = Token.load(tokenAddress);
  if (!token) {
    token = new Token(tokenAddress);
    token.save();
  }

  StakingPoolTemplate.create(event.params.stakingAddress);
}

export function handlePenaltyFeePoolCreation(event: PenaltyFeeStakingPoolEvent): void {
  const factoryAddress = event.address.toHex();
  const poolAddress = event.params.stakingAddress.toString();
  const tokenAddress = event.params.stakeToken.toString();

  let factory = Factory.load(factoryAddress);
  if (!factory) {
    factory = new Factory(factoryAddress);
    factory.totalPools = BigInt.fromI32(0);
    factory.save();
  }
  factory.totalPools = factory.totalPools.plus(BigInt.fromI32(1));
  factory.poolAddress.push(poolAddress);
  factory.save();

  let pool = new Pool(poolAddress);
  pool.stakeToken = tokenAddress;
  pool.startTime = event.block.timestamp;
  pool.save();
  
  let token = Token.load(tokenAddress);
  if (!token) {
    token = new Token(tokenAddress);
    token.save();
  }

  StakingPoolTemplate.create(event.params.stakingAddress);
}