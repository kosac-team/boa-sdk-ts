/*******************************************************************************

    The class that defines the transaction in a block.

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { DataPayload } from './DataPayload';
import { hashFull } from "./Hash";
import { KeyPair, Seed } from "./KeyPair";
import { TxInput } from './TxInput';
import { TxOutput } from './TxOutput';

import { SmartBuffer } from 'smart-buffer';

/**
 * The transaction type constant
 */
export enum TxType
{
    Payment = 0,
    Freeze = 1
}

/**
 * The class that defines the transaction in a block.
 */
export class Transaction
{
    /**
     * The type of the transaction
     */
    public type: TxType;

    /**
     * The array of references to the unspent output of the previous transaction
     */
    public inputs: TxInput[];

    /**
     * The array of newly created outputs
     */
    public outputs: TxOutput[];

    /**
     * The data payload to store
     */
    public payload: DataPayload;

    /**
     * Constructor
     * @param type    The type of the transaction
     * @param inputs  The array of references to the unspent output of the previous transaction
     * @param outputs The array of newly created outputs
     * @param payload The data payload to store
     */
    constructor (type: number, inputs: TxInput[], outputs: TxOutput[], payload: DataPayload)
    {
        this.type = type;
        this.inputs = inputs;
        this.outputs = outputs;
        this.payload = payload;
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash (buffer: SmartBuffer)
    {
        buffer.writeUInt8(this.type);
        for (let elem of this.inputs)
            elem.computeHash(buffer);
        for (let elem of this.outputs)
            elem.computeHash(buffer);
        this.payload.computeHash(buffer);
    }

    /**
     * Creates a new transaction
     * @param inputs An array of 1 or more UTXOs to be spent
     * @param outputs An array of 1 or more output
     * @param keys An array of length matching `inputs` which are the keys controlling the UTXOs
     * @param data The data to store
     * @returns The instance of Transaction
     */
    public static create (inputs: Array<TxInput>, outputs: Array<TxOutput>, keys: Array<Seed>,
        payload: DataPayload): Transaction
    {
        if (inputs.length == 0)
            throw new Error ("The number of inputs is 0.");

        if (outputs.length == 0)
            throw new Error ("The number of outputs is 0.");

        if (inputs.length != keys.length)
            throw new Error ("The number of inputs and keys are different.");

        let key_pairs: Array<KeyPair> = [];
        for (let elem of keys)
            key_pairs.push(KeyPair.fromSeed(elem));

        let tx = new Transaction(TxType.Payment, inputs, outputs, payload);
        let tx_hash = hashFull(tx);
        for (let idx = 0; idx < tx.inputs.length; idx++)
            tx.inputs[idx].signature.data.set(key_pairs[idx].secret.sign(tx_hash.data).data)

        return tx;
    }
}
