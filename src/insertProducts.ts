import axios from "axios"; // Importa Axios per fare richieste HTTP
import dotenv from "dotenv"; // Importa dotenv per caricare le variabili d'ambiente
import { QdrantClient } from "@qdrant/js-client-rest"; // Importa il client di Qdrant

dotenv.config(); // Carica le variabili d'ambiente dal file .env

// Leggi l'API key di OpenAI e l'URL di Qdrant dalle variabili d'ambiente
const openaiApiKey = process.env.OPENAI_API_KEY;
const qdrant = new QdrantClient({
  url: process.env.QDRANT_API_URL,
  prefer_grpc: false, // Usa HTTP/REST
});

// Nome della collection in Qdrant
const collectionName = "ecommerce-chatbot";

// Dati dei prodotti (array di prodotti con id, nome, prezzo e descrizione)
const products = [
  {
    id: 1,
    name: "Laptop Pro 15",
    price: 1200,
    description: "Powerful laptop with 16GB RAM and 512GB SSD.",
  },
  {
    id: 2,
    name: "Smartphone X200",
    price: 800,
    description: "High-end smartphone with 128GB storage.",
  },
  {
    id: 3,
    name: "Cuffie Noise Cancelling",
    price: 150,
    description: "Comfortable headphones with noise cancelling technology.",
  },
  {
    id: 4,
    name: "Smartwatch FitPlus",
    price: 200,
    description: "Fitness smartwatch with heart rate monitor.",
  },
  {
    id: 5,
    name: "Tablet Z10",
    price: 400,
    description: "10-inch tablet with 64GB storage and stylus support.",
  },
];

// Funzione per generare embedding tramite l'API di OpenAI
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Chiamata all'API di OpenAI per generare embedding del testo
    const response = await axios.post(
      "https://api.openai.com/v1/embeddings",
      {
        model: "text-embedding-ada-002", // Modello di embedding da utilizzare
        input: text, // Il testo da cui generare l'embedding
      },
      {
        headers: {
          Authorization: `Bearer ${openaiApiKey}`, // Autenticazione con API key
        },
      }
    );
    // Ritorna il vettore di embedding generato
    return response.data.data[0].embedding;
  } catch (error) {
    // In caso di errore, stampa il messaggio e ritorna un array vuoto
    console.error(
      "Errore nella generazione degli embedding:",
      error.response?.data || error.message
    );
    return [];
  }
}

// Funzione per inserire i prodotti con embedding nel database di Qdrant
async function insertProducts() {
  try {
    // Itera su ogni prodotto
    for (const product of products) {
      // Genera embedding per la descrizione del prodotto
      const embedding = await generateEmbedding(product.description);

      if (embedding.length > 0) {
        // Se l'embedding è stato generato correttamente, inserisci il prodotto nel database Qdrant
        await qdrant.upsert(collectionName, {
          points: [
            {
              id: product.id, // Identificatore unico per il prodotto
              vector: embedding, // Vettore di embedding generato
              payload: {
                name: product.name,
                price: product.price,
                description: product.description,
              },
            },
          ],
        });
        console.log(`Prodotto "${product.name}" inserito con successo.`);
      } else {
        // In caso di errore con l'embedding, stampa un messaggio di errore
        console.log(`Errore nell'inserimento del prodotto "${product.name}".`);
      }
    }
  } catch (error) {
    // In caso di errore nella procedura di inserimento, stampa il messaggio
    console.error("Errore nell'inserimento dei prodotti in Qdrant:", error);
  }
}

// Funzione per creare la collection (se non esiste già)
async function createCollection() {
 