"use strict";

const { MongoClient } = require ("mongodb");

const MONGO_URL = "mongodb+srv://nodebucket_user:12345nodebucket@cluster0.5xo6jeh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const mongo = async (operations, next) => {
  try {
    console.log("Connecting to the database...");

    const client = await MongoClient.connect(MONGO_URL, {
      useNewURLParser: true,
      useUnifiedTopology: true
    });

    const db = client.db("nodebucket");
    console.log ("connected to the database");

    await operations(db);
    console.log("Operation was successful:");

    client.close();
    console.log("Disconnected from the database.");
  } catch (err) {
    const error = new Error("Error connecting to the database:", err);
    error.status = 500;
    console.error("Error connecting to the database:", err);
    next(error);
  }
}

module.exports = { mongo };