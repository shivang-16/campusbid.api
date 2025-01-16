"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUsername = void 0;
const db_1 = require("../db/db");
const generateUsername = async () => {
    // Check if the 'counters' collection and the specific document exist
    let counterDoc = await db_1.db.collection('counters').findOne({ for: 'user' });
    if (!counterDoc) {
        // If the document does not exist, create the collection and the document
        await db_1.db.collection('counters').insertOne({
            for: 'user',
            sequenceValue: 10000000 // Starting value for the username sequence
        });
        counterDoc = await db_1.db.collection('counters').findOne({ for: 'user' });
    }
    console.log(counterDoc, "counterDoc");
    // Increment the sequence value to generate a new username
    const updatedCounter = await db_1.db.collection('counters').findOneAndUpdate({ for: 'user' }, { $inc: { sequenceValue: 1 } }, { returnDocument: 'after', upsert: true });
    if (updatedCounter === null) {
        throw new Error("updatedCounter is null");
    }
    console.log(updatedCounter, "updatedCounter");
    const newCounterValue = updatedCounter.sequenceValue;
    // Construct the new username in the desired format
    const newUsername = `new_${newCounterValue}`;
    // Return the new username
    return newUsername;
};
exports.generateUsername = generateUsername;
