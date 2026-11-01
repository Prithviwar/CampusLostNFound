import { MongoClient, Db } from 'mongodb';

const uri    = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB  || 'campus_lnf';

// Module-level cache to reuse the connection in Next.js dev (hot-reload safe)
let client: MongoClient | null = null;
let db: Db | null = null;

export async function getMongoDB(): Promise<Db> {
  if (db) return db;
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  return db;
}

export async function getCollection(name: string) {
  const database = await getMongoDB();
  return database.collection(name);
}
