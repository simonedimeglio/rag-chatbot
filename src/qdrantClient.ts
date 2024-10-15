import { QdrantClient } from "@qdrant/js-client-rest"; // Importa il client REST di Qdrant
import * as dotenv from "dotenv"; // Importa dotenv per gestire le variabili d'ambiente

dotenv.config(); // Carica le variabili d'ambiente dal file .env

// Configura il client di Qdrant utilizzando l'URL definito nelle variabili d'ambiente
const qdrant = new QdrantClient({
  url: process.env.QDRANT_API_URL, // URL del server Qdrant
  prefer_grpc: false, // Usa HTTP/REST invece di gRPC
});

// Funzione per creare una collection in Qdrant
export async function createCollection(collectionName: string) {
  try {
    // Crea una nuova collection con le specifiche di dimensione del vettore e misura della similarità
    await qdrant.createCollection(collectionName, {
      vectors: {
        size: 1536, // Dimensione del vettore di embedding (basata sul modello OpenAI)
        distance: "Cosine", // Tipo di distanza usata per calcolare la similarità
      },
    });
    console.log(`Collection '${collectionName}' creata con successo.`);
  } catch (error: any) {
    // Gestisce il caso in cui la collection esista già (codice errore 409) o altri errori
    if (error.status === 409) {
      console.log(`Collection '${collectionName}' già esistente, procediamo.`);
    } else {
      console.error("Errore nella creazione della collection:", error);
    }
  }
}

// Funzione per verificare se una collection esiste
export async function doesCollectionExist(
  collectionName: string
): Promise<boolean> {
  try {
    // Verifica l'esistenza della collection tramite il client di Qdrant
    const response = await qdrant.getCollection(collectionName);
    return response !== undefined; // Se la collection esiste, ritorna true
  } catch (error: any) {
    // Se la collection non esiste, ritorna false (404 Not Found)
    if (error.status === 404) {
      return false;
    }
    // Gestione di altri errori
    console.error("Errore nel controllo della collection:", error);
    return false;
  }
}

// Funzione per inserire o aggiornare i vettori nella collection
export async function upsertVectors(
  collectionName: string,
  vectors: number[][], // Array di vettori di embedding
  payloads: any[] // Dati associati (payload) a ogni vettore
) {
  try {
    // Inserisci o aggiorna i vettori nella collection
    const response = await qdrant.upsert(collectionName, {
      points: vectors.map((vector, idx) => ({
        id: idx, // Identificatore univoco per ogni vettore
        vector, // Il vettore di embedding
        payload: payloads[idx], // Dati associati al vettore (es. nome, descrizione, prezzo)
      })),
    });
    console.log("Vettori inseriti con successo:", response);
  } catch (error) {
    console.error("Errore nell'inserimento dei vettori:", error); // Gestione degli errori di inserimento
  }
}

// Funzione per cercare vettori simili in Qdrant
export async function searchVector(
  collectionName: string,
  vector: number[], // Vettore di embedding da cercare
  topK: number = 5 // Numero massimo di risultati da restituire
) {
  try {
    // Cerca i vettori più simili a quello fornito
    const result = await qdrant.search(collectionName, {
      vector, // Il vettore di query
      limit: topK, // Numero massimo di risultati da restituire
    });
    console.log("Risultati della ricerca:", result); // Stampa i risultati grezzi
    return result; // Ritorna i risultati della ricerca
  } catch (error) {
    console.error("Errore nella ricerca del vettore:", error); // Gestione degli errori di ricerca
  }
}

// Funzione per ottenere il numero di punti (prodotti) in una collection
export async function getPointCount(collectionName: string): Promise<number> {
  try {
    // Richiesta per contare i punti nella collection
    const response = await qdrant.count(collectionName);
    return response.result ? response.result.count : 0; // Ritorna il numero di punti nella collection
  } catch (error) {
    console.error("Errore nel conteggio dei punti nella collection:", error); // Gestione degli errori di conteggio
    return 0; // In caso di errore, ritorna 0
  }
}
