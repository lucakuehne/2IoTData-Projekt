import { json } from '@sveltejs/kit'
import { MongoClient } from 'mongodb'
import { env } from '$env/dynamic/private'

const dbClient = new MongoClient(env.DB_URI);

//let products;

export async function GET() {
    try {
        await dbClient.connect();
        const database = dbClient.db('2iotdata');
        const productsCollection = database.collection('products');
        let products = await productsCollection.find({}).toArray();
        return json({
            status: 200,
            body: products
        });
    } catch (exceptionVar) {
        console.log(exceptionVar);
        return json({ status: 500 });
    } finally {
        // Ensures that the client will close when you finish/error
        await dbClient.close();
    }
}

export async function POST({ request }) {
    let productDto = await request.json()
    try {
        await dbClient.connect();
        const database = dbClient.db('2iotdata');
        const productsCollection = database.collection('products');
        let existingProduct = await productsCollection.findOne({ name: productDto.name });
        if (existingProduct == null) {
            let product = await productsCollection.insertOne({
                name: productDto.name,
                amount: productDto.amount,
                inventory: [
                    {
                        expirationDate: productDto.expirationDate,
                        amount: productDto.amount
                    }
                ]
            });
            return json({
                status: 200,
                body: product
            });
        } else {
            let updateDoc = {
                $set: {
                    amount: (existingProduct.amount + productDto.amount)
                },
                $push: {
                    inventory: {
                        amount: productDto.amount,
                        expirationDate: productDto.expirationDate
                  }
                },
            };
            let product = await productsCollection.updateOne({ name: productDto.name }, updateDoc);
            return json({
                status: 200,
                body: product
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
    let productDto = await request.json()
    try {
        await dbClient.connect();
        const database = dbClient.db('2iotdata');
        const productsCollection = database.collection('products');
        const filterPipeline = [
            { $match : { name: productDto.name }},
            { $project: {
                inventory: {
                    $filter: {
                        input: "$inventory",
                        as: "item",
                        cond: {
                            $eq: [ "$$item.expirationDate", productDto.expirationDate ]
                        }
                    }
                }
             }
            }
        ]
        let existingProduct = productsCollection.aggregate(filterPipeline).toArray; // TODO: Filter für expirationDate zusätzlich zu Namen
        for await (const doc of existingProduct) {
            console.log(doc);
        }
        //console.log(existingProduct);
        /* if (existingProduct == null) {
            // TODO: Überprüfen, ob letztes InventoryItem von Produkt
            let product = await productsCollection.insertOne(productDto);
            return json({
                status: 200,
                body: product
            });
        } else {
            let updateDoc = {
                $push: {
                  inventory: {
                    amount: productDto.amount,
                    expirationDate: productDto.expirationDate
                  }
                },
            };
            let product = await productsCollection.updateOne({ name: productDto.name }, updateDoc);
            return json({
                status: 200,
                body: product
            });
        } */
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