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
import { BigInt, log } from "@graphprotocol/graph-ts";
import { fetchToken } from "../src/utils/token";

export function handleStakingPoolDeployment(event: LockUpPoolDeploymentEvent): void {
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

  StakingPoolTemplate.create(event.params.stakingAddress);

  let request = Request.load(event.params.id.toString());
  if (request) {
    request.requestStatus = "DEPLOYED";
    request.save();
  }
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
  request.save();

  fetchToken(event.params.data.stakeToken);
  fetchToken(event.params.data.rewardToken);
}

export function handleLockUpPoolStatusChanged(event: LockUpPoolStatusChanged): void {
  const requestId = event.params.id.toString();
  let request = Request.load(requestId);
  if (request) {
    request.requestStatus = event.params.status.toString();
    request.save();
  } else {
    log.warning("Request entity not found for id: {}", [requestId]);
  }
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

  StakingPoolTemplate.create(event.params.stakingAddress);

  let request = Request.load(event.params.id.toString());
  if (request) {
    request.requestStatus = "DEPLOYED";
    request.save();
  }
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
  request.penaltyPeriod = event.params.data.penaltyPeriod;
  request.save();

  fetchToken(event.params.data.stakeToken);
  fetchToken(event.params.data.rewardToken);
}

export function handlePenaltyPoolStatusChanged(event: PenaltyPoolStatusChanged): void {
  const requestId = event.params.id.toString();
  let request = Request.load(requestId);

  if (request) {
    request.requestStatus = event.params.status.toString();
    request.save();
  } else {
    log.warning("Request entity not found for id: {}", [requestId]);
  }
}