import { BigInt, Address } from "@graphprotocol/graph-ts";
import { Factory } from "../../generated/schema";

export function getOrCreateFactory(factoryAddress: Address, address: Address): Factory {
    const id = factoryAddress.toHex() + "-" + address.toHex();

    let factory = Factory.load(id);
    if (factory === null) {
        factory = new Factory(id);
        factory.totalPools = BigInt.fromI32(0);
        factory.poolAddress = [];
        factory.save();
    }

    return factory as Factory;
}