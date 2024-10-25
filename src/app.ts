import express from 'express'
import {config} from 'dotenv'

config({
    path: "./.env",
  });

  
export const app = express()

app.get('/', (req, res) => {
    res.send("Welcome to CampusBid Server")
})