/*******************************************************************************

    The class that defines data stored in the transaction's payload
    when the proposal's fee is deposited

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { VarInt } from '../utils/VarInt';

import { SmartBuffer } from 'smart-buffer';
import {Utils} from "../..";

/**
 * The class that defines data stored in the transaction's payload
 * when the proposal's fee is deposited
 */
export class ProposalFeeData
{
    public static HEADER = "PROP-FEE"

    /**
     * The id of the proposal
     */
    public proposal_id: string;

    /**
     * Constructor
     * @param proposal_id The id of the proposal
     */
    constructor (proposal_id: string)
    {
        this.proposal_id = proposal_id;
    }

    /**
     * Serialize as binary data.
     * @param buffer The buffer where serialized data is stored
     */
    public serialize (buffer: SmartBuffer)
    {
        let temp = Buffer.from(ProposalFeeData.HEADER);
        VarInt.fromNumber(temp.length, buffer);
        buffer.writeBuffer(temp);

        temp = Buffer.from(this.proposal_id);
        VarInt.fromNumber(temp.length, buffer);
        buffer.writeBuffer(temp);
    }

    /**
     * Deserialize as binary data.
     * An exception occurs when the size of the remaining data is less than the required.
     * @param buffer The buffer to be deserialized
     */
    public static deserialize (buffer: SmartBuffer): ProposalFeeData
    {
        let length = VarInt.toNumber(buffer);
        let header = Utils.readBuffer(buffer, length);
        if (header.toString() !== ProposalFeeData.HEADER)
            throw new Error("This is not the expected data type.");

        length = VarInt.toNumber(buffer);
        let temp = Utils.readBuffer(buffer, length);
        let proposal_id = temp.toString();
        return new ProposalFeeData(proposal_id);
    }
}