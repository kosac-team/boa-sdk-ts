/*******************************************************************************

    The class that defines the enrollment of a block.

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { JSONValidator } from '../utils/JSONValidator';
import { Hash } from '../common/Hash';
import { Signature } from '../common/Signature';
import { Sig } from '../common/Schnorr';
import { VarInt } from '../utils/VarInt';

import { SmartBuffer } from 'smart-buffer';

/**
 * The class that defines the enrollment of a block.
 * Convert JSON object to TypeScript's instance.
 * An exception occurs if the required property is not present.
 */
export class Enrollment
{
    /**
     * K: A hash of a frozen UTXO
     */
    public utxo_key: Hash;

    /**
     * X: The nth image of random value
     */
    public commitment: Hash;

    /**
     * n: The number of rounds a validator will participate in
     */
    public cycle_length: number;

    /**
     * S: A signature for the message H(K, X, n, R) and the key K, using R
     */
    public enroll_sig: Sig;

    /**
     * Constructor
     * @param key   A hash of a frozen UTXO
     * @param seed  The nth image of random value
     * @param cycle The number of rounds a validator will participate in
     * @param sig A signature for the message H(K, X, n, R) and the key K, using R
     */
    constructor (key: Hash, seed: Hash, cycle: number, sig: Sig)
    {
        this.utxo_key = key;
        this.commitment = seed;
        this.cycle_length = cycle;
        this.enroll_sig = sig;
    }

    /**
     * The reviver parameter to give to `JSON.parse`
     *
     * This function allows to perform any necessary conversion,
     * as well as validation of the final object.
     *
     * @param key   Name of the field being parsed
     * @param value The value associated with `key`
     * @returns A new instance of `Enrollment` if `key == ""`, `value` otherwise.
     */
    public static reviver (key: string, value: any): any
    {
        if (key !== "")
            return value;

        JSONValidator.isValidOtherwiseThrow('Enrollment', value);

        return new Enrollment(
            new Hash(value.utxo_key), new Hash(value.commitment),
            Number(value.cycle_length), Sig.fromSignature(new Signature(value.enroll_sig)));
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash (buffer: SmartBuffer)
    {
        this.utxo_key.computeHash(buffer);
        this.commitment.computeHash(buffer);
        buffer.writeUInt32LE(this.cycle_length);
    }

    /**
     * Serialize as binary data.
     * @param buffer - The buffer where serialized data is stored
     */
    public serialize (buffer: SmartBuffer)
    {
        this.utxo_key.serialize(buffer);
        this.commitment.serialize(buffer);
        VarInt.fromNumber(this.cycle_length, buffer);
        this.enroll_sig.serialize(buffer);
    }

    /**
     * Deserialize as binary data.
     * @param buffer - The buffer to be deserialized
     */
    public static deserialize (buffer: SmartBuffer): Enrollment
    {
        let utxo_key = Hash.deserialize(buffer);
        let commitment = Hash.deserialize(buffer);
        let cycle_length = VarInt.toNumber(buffer);
        let enroll_sig = Sig.deserialize(buffer);

        return new Enrollment(utxo_key, commitment, cycle_length, enroll_sig);
    }
}
