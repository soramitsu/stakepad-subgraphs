# stakepad-subgraphs
Designing a Better World Through Decentralized Technologies

## Brief Description of The Graph Node Setup

A Graph Node runs the subgraph which ingests event data by calling to Infura through http. It can also connect to any geth node or parity node that accepts RPC calls.

This subgraph has three types of files which tell the Graph Node to ingest events from specific contracts. They are:
* The subgraph manifest (subgraph.yaml)
* A GraphQL schema      (schema.graphql)
* Mapping scripts       (pool.ts, factory.ts) 

This repository has these files created and ready to compile, so a user can start this subgraph on their own. The only thing that needs to be edited is the contract addresses in the `subgraph.yaml`.

## Steps to Deploy the stakepad on the Subgraph Studio
This subgraph is not yet on [The Graph Studio](https://thegraph.com/studio/). To understand how deploying to the hosted service works, check out the steps below: 

1. Go to the [graph studio](https://thegraph.com/studio/), authenticate with your wallet and click on `Create Subgraph` button indicating the name of the subgraph - `stakepad`.

2. Clone this repository to your local machine:

2. Once you've cloned the repository, navigate to the root directory of the project and change directories:

```shell
cd stakepad-subgraphs/subgraphs/staking
```

3. Setup the environment:

```shell
npm install
```

4. Authenticate in CLI with your `deploy key`

```shell
graph auth --studio <deploy_key>
```

5. Generate the AssemblyScript types and Build the subgraph:

```shell
graph codegen && graph build
```

6. Running Tests

```shell
graph test
```

7. Deploying ot the Subgraph Studio: 

```shell
graph deploy --studio <subgraph_name>
```

## Getting started with Querying
Below are a few ways to show how to query the `stakepad` for data.

```
query GetAllFactories {
  factories {
    id
    totalPools
    poolAddress
  }
}
```

```
query GetAllPools {
  pools {
    id
    stakeToken {
      id
      name
      symbol
      decimals
    }
    rewardToken {
      id
      name
      symbol
      decimals
    }
    startTime
    endTime
    unstakeLockUpTime
    claimLockUpTime
    penaltyPeriod
    totalPenalties
    rewardTokenPerSecond
    totalStaked
    totalClaimed
    lastRewardTimestamp
    accRewardPerShare
    owner
  }
}
```
