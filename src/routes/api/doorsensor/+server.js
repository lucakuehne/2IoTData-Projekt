import { json } from '@sveltejs/kit'
import { MongoClient } from 'mongodb'
import { env } from '$env/dynamic/private'
import Gpio from 'onoff'

const dbClient = new MongoClient(env.DB_URI);

async function GET() {
	//var pushButton = new Gpio(18, 'in', 'both');
	var doorSensor = new Gpio(18, 'in');
    doorSensor.read((err, value) => {
        console.log(value);
    })
}