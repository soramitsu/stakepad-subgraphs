import { BigInt, Address } from "@graphprotocol/graph-ts";
import { Token } from "../../generated/schema";
import { ERC20 } from "../../generated/ERC20LockUpFactory/ERC20"

/**
 * Fetches or creates a Token entity using the given token address.
 * 
 * If the Token entity does not exist, it creates a new one by binding to the ERC20 contract
 * at the given address and fetching the token's details (name, symbol, decimals) from the contract.
 *
 * @param tokenAddress - The address of the ERC20 token.
 * @returns The Token entity corresponding to the given token address.
 */
export function fetchToken(tokenAddress: Address): Token {
    let token = Token.load(tokenAddress.toHexString());

    if (token == null) {
      token = new Token(tokenAddress.toHexString());
      let tokenContract = ERC20.bind(tokenAddress);
      let tryName = tokenContract.try_name();
      let trySymbol = tokenContract.try_symbol();
      let tryDecimals = tokenContract.try_decimals();
      
      token.name = tryName.reverted ? "" : tryName.value;
      token.symbol = trySymbol.reverted ? "" : trySymbol.value;
      token.decimals = tryDecimals.reverted ? BigInt.fromI32(0) : BigInt.fromI32(tryDecimals.value);
      token.save();
    }

    return token as Token;
}