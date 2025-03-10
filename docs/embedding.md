# Embeddings

Embeddings are a way to represent words, phrases, or images as vectors in a high-dimensional space. In this space, similar words are close to each other, and the distance between words can be used to measure their similarity.

## Embedding a Single Value

The AI SDK provides the embed function to embed single values, which is useful for tasks such as finding similar words or phrases or clustering text. You can use it with embeddings models, e.g. openai.embedding('text-embedding-3-large') or mistral.embedding('mistral-embed').

```ts
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";

// 'embedding' is a single embedding object (number[])
const { embedding } = await embed({
  model: openai.embedding("text-embedding-3-small"),
  value: "sunny day at the beach",
});
```

## Embedding Many Values

When loading data, e.g. when preparing a data store for retrieval-augmented generation (RAG), it is often useful to embed many values at once (batch embedding).

The AI SDK provides the embedMany function for this purpose. Similar to embed, you can use it with embeddings models, e.g. openai.embedding('text-embedding-3-large') or mistral.embedding('mistral-embed').

```ts
import { openai } from "@ai-sdk/openai";
import { embedMany } from "ai";

// 'embeddings' is an array of embedding objects (number[][]).
// It is sorted in the same order as the input values.
const { embeddings } = await embedMany({
  model: openai.embedding("text-embedding-3-small"),
  values: [
    "sunny day at the beach",
    "rainy afternoon in the city",
    "snowy night in the mountains",
  ],
});
```

## Embedding Similarity

After embedding values, you can calculate the similarity between them using the cosineSimilarity function. This is useful to e.g. find similar words or phrases in a dataset. You can also rank and filter related items based on their similarity.

```ts
import { openai } from "@ai-sdk/openai";
import { cosineSimilarity, embedMany } from "ai";

const { embeddings } = await embedMany({
  model: openai.embedding("text-embedding-3-small"),
  values: ["sunny day at the beach", "rainy afternoon in the city"],
});

console.log(
  `cosine similarity: ${cosineSimilarity(embeddings[0], embeddings[1])}`
);
```

## Token Usage

Many providers charge based on the number of tokens used to generate embeddings. Both embed and embedMany provide token usage information in the usage property of the result object:

```ts
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";

const { embedding, usage } = await embed({
  model: openai.embedding("text-embedding-3-small"),
  value: "sunny day at the beach",
});

console.log(usage); // { tokens: 10 }
```
