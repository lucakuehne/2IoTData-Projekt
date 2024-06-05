import { json } from '@sveltejs/kit'
import { MongoClient } from 'mongodb'
import { env } from '$env/dynamic/private'

const dbClient = new MongoClient(env.DB_URI);

export async function GET() {
    
}

export async function POST({ request }) {
    let scan = await request.json()
    //console.log(scan.productName)
    try {
        await dbClient.connect();
        const database = dbClient.db('2iotdata');
        const scansCollection = database.collection('scans');
            let createdScan = await scansCollection.insertOne({
                productName: scan.productName,
                fetched: false,
                createdAt: new Date(Date.now())
            });
            return json({
                status: 200,
                body: createdScan
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