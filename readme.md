# RAG Chatbot - Qdrant | OpenAI

This project implements a chatbot that uses a Retrieval-Augmented Generation (RAG) system to provide answers about products stored in a vector database (Qdrant).

The project leverages OpenAI to generate embeddings of products, making it possible to search for related products based on user queries.

## Project Structure

The src folder contains the following main files:

- index.ts: Main file that starts the chatbot and handles product search.
- qdrantClient.ts: Module for interacting with Qdrant, including functions to create collections, insert vectors, and search for products.
- insertProducts.ts: Script to populate the Qdrant database with products and their related embeddings generated via OpenAI.

## Prerequisites

- Make sure you have Node.js installed.
- You will need an OpenAI API key to generate embeddings.
- Make sure you have a Qdrant instance running. You can start it locally using Docker:

```bash
docker run -p 6333:6333 qdrant/qdrant
```

## Configuration

Create a `.env` file in the main directory of the project with the following variables:

```env
OPENAI_API_KEY=your_openai_api_key
QDRANT_API_URL=http://localhost:6333
```

> Replace your_openai_api_key with your actual OpenAI API key.

## Installing Dependencies

```bash
yarn install
```

Or, if you use npm:

```bash
npm install
```

## Populating the Qdrant Database

Before running the chatbot, you need to populate the Qdrant database with products and their embeddings. To do this, run the `insertProducts.ts` script:

```bash
yarn tsx src/insertProducts.ts
```

This script creates a collection in Qdrant named “ecommerce-chatbot”, if it doesn’t exist. It generates real embeddings for each product description using the OpenAI API and inserts the products along with their embeddings into the collection.

### Starting the Chatbot

Once the database is populated, you can start the chatbot by running:

```bash
yarn tsx src/index.ts
```

The chatbot will wait for input from the terminal. Enter a query, such as “laptop”, to search for related products. The system will return a list of products ranked by relevance.

## Key Functions

**index.ts**

1. Starts the chatbot and accepts user input.
2. Uses OpenAI to generate an embedding of the user’s query.
3. Searches for related products in Qdrant and returns the results ordered by similarity.

**insertProducts.ts**

1. Creates the collection in Qdrant if it doesn’t exist.
2. Populates the database with products and their embeddings generated via OpenAI.
3. Handles errors and checks if the products are already present.

**qdrantClient.ts**

Contains functions for interacting with Qdrant:

1. Create a collection: Sets the vector size and similarity metric (Cosine).
2. Insert and update vectors: Uses the upsert function to insert or update products.
3. Search similar vectors: Finds products that are most similar to the query vector.
4. Check collection existence and count points: To check the database status.

### Output

```plaintext
Cosa stai cercando? laptop
Embedding della query: [...]
Risultati della ricerca: [
  { id: 1, name: 'Laptop Pro 15', price: 1200, score: 0.84 },
  { id: 5, name: 'Tablet Z10', price: 400, score: 0.81 },
  { id: 2, name: 'Smartphone X200', price: 800, score: 0.79 }
]
Prodotti suggeriti:
1. Laptop Pro 15 - 1200 EUR
2. Tablet Z10 - 400 EUR
3. Smartphone X200 - 800 EUR
```
