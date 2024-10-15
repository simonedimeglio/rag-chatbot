import axios from "axios"; // Importa Axios per fare richieste HTTP
import dotenv from "dotenv"; // Importa dotenv per caricare le variabili d'ambiente
import * as readline from "node:readline/promises"; // Importa readline per gestire l'input dal terminale
import { searchVector } from "./qdrantClient"; // Importa la funzione per cercare vettori in Qdrant

dotenv.config(); // Carica le variabili d'ambiente dal file .env

// Configura l'interfaccia per leggere input dal terminale
const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Leggi l'API key di OpenAI dalle variabili d'ambiente
const openaiApiKey = process.env.OPENAI_API_KEY;
// Nome della collection in Qdrant
const collectionName = "ecommerce-chatbot";

// Funzione per generare embedding tramite l'API di OpenAI
async function getEmbedding(text: string): Promise<number[]> {
  try {
    // Chiamata API a OpenAI per generare embedding del testo
    const response = await axios.post(
      "https://api.openai.com/v1/embeddings",
      {
        model: "text-embedding-ada-002", // Modello di embedding da utilizzare
        input: text, // Il testo da cui generare l'embedding
      },
      {
        headers: {
          Authorization: `Bearer ${openaiApiKey}`, // Autorizzazione con API key
        },
      }
    );
    // Ritorna il vettore di embedding
    return response.data.data[0].embedding;
  } catch (error) {
    // Log degli errori in caso di problemi
    console.error(
      "Errore nella generazione degli embedding:",
      error.response?.data || error.message
    );
    return []; // Ritorna un array vuoto in caso di errore
  }
}

// Funzione per cercare prodotti correlati
async function searchRelatedProducts(userQuery: string) {
  // Genera embedding per la query dell'utente
  const queryEmbedding = await getEmbedding(userQuery);

  if (queryEmbedding.length === 0) {
    // Se non è stato possibile generare un embedding, mostra un messaggio di errore
    console.log("Errore nel generare embedding per la query dell'utente.");
    return [];
  }

  console.log("Embedding della query:", queryEmbedding); // Log per debugging

  // Cerca i prodotti nel database Qdrant usando l'embedding della query
  const results = await searchVector(collectionName, queryEmbedding, 5); // Cerchiamo fino a 5 prodotti

  if (results.length === 0) {
    // Se non vengono trovati prodotti correlati, stampa un messaggio
    console.log("Nessun prodotto correlato trovato.");
    return [];
  }

  console.log("Prodotti correlati trovati:", results); // Log per vedere i risultati grezzi
  return results;
}

// Avvio del chatbot
(async () => {
  while (true) {
    // Legge la query dell'utente dal terminale
    const userQuery = await terminal.question("Cosa stai cercando? ");

    // Cerca i prodotti correlati in base alla query
    const relatedProducts = await searchRelatedProducts(userQuery);

    if (relatedProducts.length > 0) {
      // Se vengono trovati prodotti correlati, li mostra all'utente
      console.log("Prodotti suggeriti:");
      relatedProducts.forEach((product, index) => {
        console.log(
          `${index + 1}. ${product.payload.name} - ${product.payload.price} EUR`
        );
      });
    } else {
      // Se non vengono trovati prodotti correlati, informa l'utente
      console.log("Nessun prodotto trovato.");
    }
  }
})();
