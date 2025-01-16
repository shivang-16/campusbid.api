import { db } from "../db/db";

export const generateUsername = async () => {
  // Check if the 'counters' collection and the specific document exist
  let counterDoc = await db.collection('counters').findOne({ for: 'user' });

  if (!counterDoc) {
    // If the document does not exist, create the collection and the document
    await db.collection('counters').insertOne({
      for: 'user',
      sequenceValue: 10000000 // Starting value for the username sequence
    });
    counterDoc = await db.collection('counters').findOne({ for: 'user' });
  }

  console.log(counterDoc, "counterDoc");

  // Increment the sequence value to generate a new username
  const updatedCounter = await db.collection('counters').findOneAndUpdate(
    { for: 'user' },
    { $inc: { sequenceValue: 1 } },
    { returnDocument: 'after', upsert: true }
  );

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
