# How to Get Started with Qdrant Locally

In this short example, you will use the Python Client to create a Collection, load data into it and run a basic search query.

## Download and run

First, download the latest Qdrant image from Dockerhub:

```zsh
docker pull qdrant/qdrant
```

Then, run the service:

```zsh
docker run -p 6333:6333 -p 6334:6334 \
    -v $(pwd)/qdrant_storage:/qdrant/storage:z \
    qdrant/qdrant
```

Under the default configuration all data will be stored in the ./qdrant_storage directory. This will also be the only directory that both the Container and the host machine can both see.

Qdrant is now accessible:

- REST API: localhost:6333
- Web UI: localhost:6333/dashboard
- GRPC API: localhost:6334

## Initialize the client

```ts
import { QdrantClient } from "@qdrant/js-client-rest";

const client = new QdrantClient({ host: "localhost", port: 6333 });
```

> By default, Qdrant starts with no encryption or authentication . This means anyone with network access to your machine can access your Qdrant container instance. Please read Security carefully for details on how to secure your instance.

## Create a collection

You will be storing all of your vector data in a Qdrant collection. Let’s call it test_collection. This collection will be using a dot product distance metric to compare vectors.

```ts
await client.createCollection("test_collection", {
  vectors: { size: 4, distance: "Dot" },
});
```

## Add vectors

Let’s now add a few vectors with a payload. Payloads are other data you want to associate with the vector:

```ts
const operationInfo = await client.upsert("test_collection", {
  wait: true,
  points: [
    { id: 1, vector: [0.05, 0.61, 0.76, 0.74], payload: { city: "Berlin" } },
    { id: 2, vector: [0.19, 0.81, 0.75, 0.11], payload: { city: "London" } },
    { id: 3, vector: [0.36, 0.55, 0.47, 0.94], payload: { city: "Moscow" } },
    { id: 4, vector: [0.18, 0.01, 0.85, 0.8], payload: { city: "New York" } },
    { id: 5, vector: [0.24, 0.18, 0.22, 0.44], payload: { city: "Beijing" } },
    { id: 6, vector: [0.35, 0.08, 0.11, 0.44], payload: { city: "Mumbai" } },
  ],
});

console.debug(operationInfo);
```

Response:

```ts
{ operation_id: 0, status: 'completed' }
```

## Run a query

Let’s ask a basic question - Which of our stored vectors are most similar to the query vector [0.2, 0.1, 0.9, 0.7]?

```ts
let searchResult = await client.query("test_collection", {
  query: [0.2, 0.1, 0.9, 0.7],
  limit: 3,
});

console.debug(searchResult.points);
```

Response:

```ts
[
  {
    id: 4,
    version: 0,
    score: 1.362,
    payload: null,
    vector: null,
  },
  {
    id: 1,
    version: 0,
    score: 1.273,
    payload: null,
    vector: null,
  },
  {
    id: 3,
    version: 0,
    score: 1.208,
    payload: null,
    vector: null,
  },
];
```

The results are returned in decreasing similarity order. Note that payload and vector data is missing in these results by default. See payload and vector in the result on how to enable it.

## Add a filter

We can narrow down the results further by filtering by payload. Let’s find the closest results that include “London”.

```ts
searchResult = await client.query("test_collection", {
  query: [0.2, 0.1, 0.9, 0.7],
  filter: {
    must: [{ key: "city", match: { value: "London" } }],
  },
  with_payload: true,
  limit: 3,
});

console.debug(searchResult);
```

Response:

```ts
[
  {
    id: 2,
    version: 0,
    score: 0.871,
    payload: {
      city: "London",
    },
    vector: null,
  },
];
```

> To make filtered search fast on real datasets, we highly recommend to create payload indexes!

You have just conducted vector search. You loaded vectors into a database and queried the database with a vector of your own. Qdrant found the closest results and presented you with a similarity score.

Now you know how Qdrant works. Getting started with Qdrant Cloud is just as easy. Create an account and use our SaaS completely free. We will take care of infrastructure maintenance and software updates.
