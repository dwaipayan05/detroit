import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

let conn: MongoClient;


export async function connectToMongo() {
  if (!conn) conn = await client.connect();
  const db = conn.db("detroit");
  return { db };
}

export const mongo = {
  connectToMongo,
  client,
  db: () => {
    if (!conn) throw new Error("MongoDB connection not established");
    return conn.db("detroit");
  },
  close: async () => {
    if (conn) {
      await conn.close();
    }
  }
}