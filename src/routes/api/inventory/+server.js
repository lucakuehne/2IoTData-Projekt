import { json } from '@sveltejs/kit'
import { Int32, MongoClient } from 'mongodb'
import { env } from '$env/dynamic/private'

const dbClient = new MongoClient(env.DB_URI);

export async function GET() {
    try {
        await dbClient.connect();
        const database = dbClient.db('2iotdata');
        const inventoryCollection = database.collection('inventory');
        const pipeline = [
            {
                $group: {
                    _id: "$productId",
                    inventory: {
                        $push: "$$ROOT",
                    },
                    totalAmount: {
                        $sum: "$amount"
                    },
                },
            },
        ]
        let inventoryItems = await inventoryCollection.aggregate(pipeline).toArray();
        return json({
            status: 200,
            body: inventoryItems
        });
    } catch (exceptionVar) {
        console.log(exceptionVar);
        return json({
            status: 500
        });
    } finally {
        // Ensures that the client will close when you finish/error
        await dbClient.close();
    }
}

export async function POST({ request }) {
    let newInventory = await request.json()
    try {
        await dbClient.connect();
        const database = dbClient.db('2iotdata');
        const inventoryCollection = database.collection('inventory');
        const filter = {
            productId: newInventory.productId,
            expirationDate: newInventory.expirationDate
        };
        let existingInventory = await inventoryCollection.findOne(filter);
        if (existingInventory == null) {
            let inventory = await inventoryCollection.insertOne({
                productId: newInventory.productId,
                expirationDate: newInventory.expirationDate,
                amount: parseInt(newInventory.amount)
            });
            return json({
                status: 200,
                body: inventory
            });
        } else {
            let updatedInventory = await inventoryCollection.updateOne(filter, {
                $set: {
                    amount: (parseInt(existingInventory.amount) + parseInt(newInventory.amount))
                }
            });
            return json({
                status: 201,
                message: "Iventory has been updated"
            });
        }
    } catch (exceptionVar) {
        console.log(exceptionVar);
        return json({ 
            status: 500 
        });
    } finally {
        // Ensures that the client will close when you finish/error
        await dbClient.close();
    }
}

export async function DELETE({ request }) {
    let inventoryDto = await request.json()
    try {
        await dbClient.connect();
        const database = dbClient.db('2iotdata');
        const inventoryCollection = database.collection('inventory');
        const filter = {
            productId: inventoryDto.productId,
            expirationDate: inventoryDto.expirationDate
        }
        let existingInventory = await inventoryCollection.findOne(filter);
        if (existingInventory != null) {
            if (existingInventory.amount > inventoryDto.amount) {
                let updatedInventory = await inventoryCollection.updateOne(filter, {
                    $set: {
                        amount: (parseInt(existingInventory.amount) - parseInt(inventoryDto.amount))
                    }
                })
                return json({
                    status: 201,
                    message: "Successfully reduced inventory item"
                });
            } else {
                let deletedInventory = await inventoryCollection.deleteOne(filter);
                console.log(deletedInventory)
                return json({
                    status: 200,
                    message: "Successfully deleted inventory item"
                });
            }
        } else {
            return json({
                status: 500,
                message: "Requested inventory could not be found for deletion."
            });
        }
    } catch (exceptionVar) {
        console.log(exceptionVar);
        return json({ 
            status: 500 
        });
    } finally {
        // Ensures that the client will close when you finish/error
        await dbClient.close();
    }
}