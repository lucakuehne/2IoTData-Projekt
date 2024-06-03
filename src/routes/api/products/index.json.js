import { MongoClient } from "mongodb"
import { env } from '$env/dynamic/public'

const dbClient = new MongoClient(env.PUBLIC_DB_URI);

export async function get() {
    try {
        const database = dbClient.db('2iotdata');
        const productsCollection = database.collection('products');
        //const query = { title: 'Back to the Future' };
        //const product = await products.findOne(query);
        products = await productsCollection.find({}).toArray();
        console.log(products);
        return {
            status: 200,
            body: products
        }
    } catch (exceptionVar) {
        console.log(exceptionVar);
        return { status: 500 }
    } finally {
        // Ensures that the client will close when you finish/error
        await dbClient.close();
    }
}