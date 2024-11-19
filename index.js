process.on('uncaughtException', (err) => {
    console.log("error in code",err);
})
import express from 'express';
import { connectDB } from './database/dbconnection.js';
import { bootstrap } from './src/bootstrap.js';

import dotenv from "dotenv"
import path from 'path'
const app = express()
const port = 3000

dotenv.config({ path: path.resolve('./config/.env') })




connectDB()

bootstrap(app, express)

process.on('unhandledRejection', (err) => {
    console.log('unhandled error', err);
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))