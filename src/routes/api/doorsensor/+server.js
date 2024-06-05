import { json } from '@sveltejs/kit'
import { MongoClient } from 'mongodb'
import { env } from '$env/dynamic/private'
//var Gpio = require('onoff').Gpio;

const dbClient = new MongoClient(env.DB_URI);

//