import { json } from '@sveltejs/kit'
import { MongoClient } from 'mongodb'
import { env } from '$env/dynamic/private'

const dbClient = new MongoClient(env.DB_URI);

export async function POST({ request }) {
    let scan = await request.json()
    let productName = scan.productName

    console.log(productName)
}