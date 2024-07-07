import { BigInt, Address } from "@graphprotocol/graph-ts";
import { Factory } from "../../generated/schema";

/**
 * Retrieves or creates a Factory entity for a given factory address.
 *
 * @param factoryAddress - The address of the factory.
 * @returns The Factory entity corresponding to the given factory address.
 */
export function getOrCreateFactory(factoryAddress: Address): Factory {
    const id = factoryAddress.toHex();

    let factory = Factory.load(id);
    if (factory === null) {
        factory = new Factory(id);
        factory.totalPools = BigInt.fromI32(0);
        factory.poolAddress = [];
        factory.save();
    }

    return factory as Factory;
}