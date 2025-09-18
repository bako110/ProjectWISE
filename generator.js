import { MongoClient } from 'mongodb';
import fs from 'fs';

const MONGO_URI = process.env.MONGO_URI; // Utilise la variable d'environnement

if (!MONGO_URI) {
  throw new Error("La variable d'environnement MONGO_URI n'est pas définie !");
}

export async function generateDictionary() {
  const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();

  const db = client.db('collectordb'); // Nom de ta base

  const collections = await db.listCollections().toArray();
  const dictionary = [];

  for (const col of collections) {
    const collectionName = col.name;
    const sample = await db.collection(collectionName).findOne();

    if (sample) {
      const fields = Object.keys(sample).map(key => {
        return { name: key, type: typeof sample[key] };
      });

      dictionary.push({
        collection: collectionName,
        fields
      });
    }
  }

  fs.writeFileSync('dictionary.json', JSON.stringify(dictionary, null, 2));
  console.log('Dictionnaire généré dans dictionary.json');

  await client.close();
}
