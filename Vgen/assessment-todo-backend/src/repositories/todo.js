import { ObjectId } from 'mongodb';

export default (db) => {
    const { TODO_COLLECTION } = process.env;
    const collection = db.collection(TODO_COLLECTION);

    async function insertOne(todo) {
        return await collection.insertOne(todo);
    }

    async function findByUserId(userID) {
        try {
            const results = await collection.find({userID}).toArray();
            return results;
        } catch (error) {
            console.error('Error querying collection:', error);
            throw error;
        }        
    }

    async function update(id, updated) {
        const objectId = new ObjectId(id);
        const results = await collection.updateOne({ _id: objectId }, { $set: updated });
        return results;
    }

    return {
        insertOne,
        findByUserId,
        update
    };
};