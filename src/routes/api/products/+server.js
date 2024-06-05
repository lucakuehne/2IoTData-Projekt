import { json } from '@sveltejs/kit'
import { MongoClient } from 'mongodb'
import { env } from '$env/dynamic/private'

const dbClient = new MongoClient(env.DB_URI);

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
    let productName = await request.json()
    productName = productName.name
    try {
        await dbClient.connect();
        const database = dbClient.db('2iotdata');
        const productsCollection = database.collection('products');
        let existingProduct = await productsCollection.findOne({ name: productName });
        if (existingProduct == null) {
            let product = await productsCollection.insertOne({
                name: productName,
                //amount: productDto.amount,  This loud would be to summarize the total inventory
                inventory: []
            });
            return json({
                status: 200,
                body: product.insertedId
            });
        } else {
            return json({
                status: 201,
                message: "Product already exist",
                body: existingProduct._id
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