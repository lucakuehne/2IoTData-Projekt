import { json } from '@sveltejs/kit'
import { MongoClient } from 'mongodb'
import { env } from '$env/dynamic/public'

const dbClient = new MongoClient(env.PUBLIC_DB_URI);

let products;

export async function GET() {
    try {
        const database = dbClient.db('2iotdata');
        const productsCollection = database.collection('products');
        //const query = { title: 'Back to the Future' };
        //const product = await products.findOne(query);
        products = await productsCollection.find({}).toArray();
        console.log(products);
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