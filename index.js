const { create, Client } = require('@open-wa/wa-automate');

create().then((client) => start(client));

function start(client) {
  client.onMessage(async (message) => {
    if (message.type === 'image') {
      console.log('📷 Immagine ricevuta!');
      
      // 1. Download img
      const mediaData = await client.decryptFile(message);
      const base64 = Buffer.from(mediaData).toString('base64');
      
      // 2. (opt) Sent image to AI or API to recogonize
      // Exemple: Google Vision API, or custom server

      // 3. Save data you db (es. with fetch/post)

      // 4. Answer user
      await client.sendText(message.from, 'Immagine ricevuta! Sto analizzando...');
    }

    if (message.body === '!ciao') {
      await client.sendText(message.from, '👋 Ciao! Inviami una foto di una moneta o banconota!');
    }
  });
}
