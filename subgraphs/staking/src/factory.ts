import { Factory, Pool, Token, Request } from "../generated/schema";

import { 
  StakingPoolDeployed as LockUpPoolDeploymentEvent,
  RequestSubmitted as LockUpPoolRequestSubmitted,
  RequestStatusChanged as LockUpPoolStatusChanged
} from "../generated/ERC20LockUpFactory/ERC20LockUpStakingFactory"

import {
  StakingPoolDeployed as PenaltyPoolDeploymentEvent,
  RequestSubmitted as PenaltyPoolRequestSubmitted,
  RequestStatusChanged as PenaltyPoolStatusChanged
} from "../generated/ERC20PenaltyFeeFactory/ERC20PenaltyFeeStakingFactory"

import { ERC20LockUpStakingPool as StakingPoolTemplate } from "../generated/templates";
import { BigInt, Address } from "@graphprotocol/graph-ts";
import { fetchToken } from "../src/utils/token";

export function handleLockUpPoolDeployment(event: LockUpPoolDeploymentEvent): void {
  const factoryAddress = event.address.toHex();
  const poolAddress = event.params.stakingAddress.toHex();

  let factory = Factory.load(factoryAddress);
  if (!factory) {
    factory = new Factory(factoryAddress);
    factory.totalPools = BigInt.fromI32(0);
    factory.poolAddress = [];
  }
  factory.totalPools = factory.totalPools.plus(BigInt.fromI32(1));
  factory.poolAddress.push(poolAddress);
  factory.save();

  let request = Request.load(event.params.id.toString())!;
  request.requestStatus = "DEPLOYED";
  request.save();

  let stakeTokenAddress = Address.fromString(request.stakeToken);
  let rewardTokenAddress = Address.fromString(request.rewardToken);
  let stakeToken = fetchToken(stakeTokenAddress);
  let rewardToken = fetchToken(rewardTokenAddress);

  let pool = new Pool(poolAddress);
  pool.stakeToken = stakeToken.id;
  pool.rewardToken = rewardToken.id;
  pool.startTime = request.poolStartTime;
  pool.endTime = request.poolEndTime;
  pool.rewardTokenPerSecond = request.rewardPerSecond;
  pool.totalStaked = BigInt.fromI32(0);
  pool.totalClaimed = BigInt.fromI32(0);
  pool.accRewardPerShare = BigInt.fromI32(0);
  pool.lastRewardTimestamp = event.block.timestamp;
  pool.isPoolActive = true;
  pool.admin = event.transaction.from.toHex();
  pool.owner = event.transaction.from.toHex();
  pool.save();

  StakingPoolTemplate.create(event.params.stakingAddress);
}

export function handleLockUpPoolRequestSubmitted(event: LockUpPoolRequestSubmitted): void {
  const requestId = event.params.id.toString();

  let request = new Request(requestId);
  request.deployer = event.params.deployer;
  request.requestStatus = "CREATED";
  request.stakeToken = event.params.data.stakeToken.toHex();
  request.rewardToken = event.params.data.rewardToken.toHex();
  request.rewardPerSecond = event.params.data.rewardPerSecond;
  request.poolStartTime = event.params.data.poolStartTime;
  request.poolEndTime = event.params.data.poolEndTime;
  request.unstakeLockUpTime = event.params.data.unstakeLockUpTime;
  request.claimLockUpTime = event.params.data.claimLockUpTime;
  request.penaltyPeriod = BigInt.fromI32(0);
  request.save();
}

export function handleLockUpPoolStatusChanged(event: LockUpPoolStatusChanged): void {
  const requestId = event.params.id.toString();
  let request = Request.load(requestId)!;
  request.save();
}

export function handlePenaltyPoolDeployment(event: PenaltyPoolDeploymentEvent): void {
  const factoryAddress = event.address.toHex();
  const poolAddress = event.params.stakingAddress.toHex();

  let factory = Factory.load(factoryAddress);
  if (!factory) {
    factory = new Factory(factoryAddress);
    factory.totalPools = BigInt.fromI32(0);
    factory.poolAddress = [];
  }
  factory.totalPools = factory.totalPools.plus(BigInt.fromI32(1));
  factory.poolAddress.push(poolAddress);
  factory.save();

  let request = Request.load(event.params.id.toString())!;
  request.requestStatus = "DEPLOYED";
  request.save();

  let stakeTokenAddress = Address.fromString(request.stakeToken);
  let rewardTokenAddress = Address.fromString(request.rewardToken);
  let stakeToken = fetchToken(stakeTokenAddress);
  let rewardToken = fetchToken(rewardTokenAddress);

  let pool = new Pool(poolAddress);
  pool.stakeToken = stakeToken.id;
  pool.rewardToken = rewardToken.id;
  pool.startTime = request.poolStartTime;
  pool.endTime = request.poolEndTime;
  pool.rewardTokenPerSecond = request.rewardPerSecond;
  pool.totalStaked = BigInt.fromI32(0);
  pool.totalClaimed = BigInt.fromI32(0);
  pool.accRewardPerShare = BigInt.fromI32(0);
  pool.lastRewardTimestamp = event.block.timestamp;
  pool.isPoolActive = true;
  pool.admin = event.transaction.from.toHex();
  pool.owner = event.transaction.from.toHex();
  pool.save();

  StakingPoolTemplate.create(event.params.stakingAddress);
}

export function handlePenaltyPoolRequestSubmitted(event: PenaltyPoolRequestSubmitted): void {
  const requestId = event.params.id.toString();

  let request = new Request(requestId);
  request.deployer = event.params.deployer;
  request.requestStatus = "CREATED";
  request.stakeToken = event.params.data.stakeToken.toHex();
  request.rewardToken = event.params.data.rewardToken.toHex();
  request.rewardPerSecond = event.params.data.rewardPerSecond;
  request.poolStartTime = event.params.data.poolStartTime;
  request.poolEndTime = event.params.data.poolEndTime;
  request.unstakeLockUpTime = BigInt.fromI32(0);
  request.claimLockUpTime = BigInt.fromI32(0);
  request.penaltyPeriod = event.params.data.penaltyPeriod;
  request.save();
}

export function handlePenaltyPoolStatusChanged(event: PenaltyPoolStatusChanged): void {
  const requestId = event.params.id.toString();
  let request = Request.load(requestId)!;
  request.save();
}