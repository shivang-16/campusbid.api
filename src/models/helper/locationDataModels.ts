import mongoose from "mongoose"


export const citySchema = new mongoose.Schema ({
    name: String,
    countryCode: String,
    stateCode: String,
    latitude: String,
    longitude: String
})

export const stateSchema = new mongoose.Schema ({
    name: String,
    isoCode: String,
    countryCode: String,
    latitude: String,
    longitude: String
})

export const collegeSchema = new mongoose.Schema ({
    College_Name: String,
    State: String,
    StateCode: String,
    Stream: String,
})

