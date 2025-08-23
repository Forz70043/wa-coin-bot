require('dotenv').config();
const { create, Client } = require('@open-wa/wa-automate');
const { MongoClient } = require('mongodb');

const mongoUri = process.env.MONGO_URI;
const clientMongo = new MongoClient(mongoUri);
let db;

// Connessione a MongoDB Atlas
async function connectToDB() {
  try {
    await clientMongo.connect();
    db = clientMongo.db('wa-monete'); // Nome del database
    console.log('✅ Connesso a MongoDB Atlas');
  } catch (error) {
    console.error('❌ Errore connessione MongoDB:', error);
  }
}

// Funzione principale
function start(bot) {
  bot.onMessage(async (message) => {
    // Risposta base a comando testuale
    if (message.body === '!ciao') {
      await bot.sendText(message.from, '👋 Ciao! Inviami una foto di una moneta o banconota!');
    }

    // Gestione immagine
    if (message.type === 'image') {
      try {
        console.log('📷 Immagine ricevuta');

        // Decodifica immagine
        const mediaData = await bot.decryptFile(message);
        const base64Image = Buffer.from(mediaData).toString('base64');

        // Salvataggio nel database
        const moneta = {
          numero: message.from,
          nome: message.sender.pushname || 'Sconosciuto',
          timestamp: new Date(),
          immagine_base64: base64Image,
          messaggio_id: message.id,
          mimetype: message.mimetype,
        };

        const result = await db.collection('monete').insertOne(moneta);
        console.log('💾 Moneta salvata con ID:', result.insertedId);

        await bot.sendText(message.from, '✅ Immagine ricevuta e salvata nel database!');
      } catch (err) {
        console.error('❌ Errore nella gestione dell\'immagine:', err);
        await bot.sendText(message.from, '⚠️ Errore durante l\'elaborazione dell\'immagine.');
      }
    }
  });
}

// Avvio bot
create().then(async (botClient) => {
  await connectToDB();
  start(botClient);
});
