const axios = require('axios');

async function analizzaImmagineConOpenAI(imageBase64) {
  const apiKey = process.env.OPENAI_API_KEY;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Descrivi la moneta o banconota in questa immagine. Includi valore, anno, paese, e caratteristiche visibili." },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 500
      },
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    const output = response.data.choices[0].message.content;
    return output;
  } catch (err) {
    console.error("❌ Errore OpenAI Vision:", err.response?.data || err.message);
    return "Errore durante l'analisi dell'immagine.";
  }
}

module.exports = { analizzaImmagineConOpenAI };
