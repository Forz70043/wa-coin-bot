require('dotenv').config();
const { create, Client } = require('@open-wa/wa-automate');
const { MongoClient } = require('mongodb');
const { analizzaImmagineConOpenAI } = require('./vision');
const mongoUri = process.env.MONGO_URI;
const clientMongo = new MongoClient(mongoUri);
const { decryptMedia } = require('@open-wa/wa-decrypt');
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
    console.log('📩 Messaggio ricevuto:', message.body);
    if (message.body === '!ciao') {
      await bot.sendText(message.from, '👋 Ciao! Inviami una foto di una moneta o banconota!');
    }

    // Gestione immagine
    if (message.type === 'image') {
      try {
        console.log('📷 Immagine ricevuta');
        try {
            // Decodifica immagine
            const mediaData = await decryptFile(message);
            const base64Image = Buffer.from(mediaData).toString('base64');
        } catch (err) {
            console.error('❌ Errore decodifica immagine:', err);
            await bot.sendText(message.from, '⚠️ Errore durante la decodifica dell\'immagine.');
            return;
        }

        // 🔍 AI: riconoscimento con OpenAI Vision
        const riconoscimento = await analizzaImmagineConOpenAI(base64Image);

        // 💾 Salvataggio nel DB
        const moneta = {
            numero: message.from,
            nome: message.sender.pushname || 'Sconosciuto',
            timestamp: new Date(),
            immagine_base64: base64Image,
            riconoscimento
        };

        const result = await db.collection('monete').insertOne(moneta);
        console.log('💾 Moneta salvata con ID:', result.insertedId);

        // ✅ Risposta all'utente
        await bot.sendText(message.from, `🔍 Risultato del riconoscimento:\n\n${riconoscimento}`);
      } catch (err) {
        console.error('❌ Errore flusso:', err);
        await bot.sendText(message.from, '⚠️ Errore durante il riconoscimento della moneta.');
      }
    }
  });
}

// Avvio bot
create().then(async (botClient) => {
  await connectToDB();
  start(botClient);
});
