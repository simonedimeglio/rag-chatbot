# Interfaces

Javascript / Typescript

```zsh
npm install @qdrant/js-client-rest
```

## Usage

Run the Qdrant Docker container;

```zsh
docker run -p 6333:6333 qdrant/qdrant
```

## Instantiate a client

```ts
import { QdrantClient } from "@qdrant/js-client-rest";

// TO connect to Qdrant running locally
const client = new QdrantClient({ url: "http://127.0.0.1:6333" });

// or connect to Qdrant Cloud
const client = new QdrantClient({
  url: "https://xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.us-east-0-1.aws.cloud.qdrant.io",
  apiKey: "<your-api-key>",
});
```

## Make requests

Using one of the available facade methods:

```ts
const result = await client.getCollections();
console.log("List of collections:", result.collections);
```

## Support

TypeScript types are provided alongside JavaScript sources to be used in:

- Node.js (ESM and CJS) - >= 18.0.0
- Deno
- Browser (fetch API)
- Cloudflare Workers (OpenAPI only)

## API Reference

All interaction with Qdrant takes place via the REST API. We recommend using REST API if you are using Qdrant for the first time or if you are working on a prototype.

REST API: https://api.qdrant.tech/api-reference gRPC API: https://github.com/qdrant/qdrant/blob/master/docs/grpc/docs.md

## gRPC Interface

The gRPC methods follow the same principles as REST. For each REST endpoint, there is a corresponding gRPC method.

As per the configuration file, the gRPC interface is available on the specified port.

```config
service:
  grpc_port: 6334
```

> If you decide to use gRPC, you must expose the port when starting Qdrant.

Running the service inside of Docker will look like this:

```config
docker run -p 6333:6333 -p 6334:6334 \
    -v $(pwd)/qdrant_storage:/qdrant/storage:z \
    qdrant/qdrant
```

When to use gRPC: The choice between gRPC and the REST API is a trade-off between convenience and speed. gRPC is a binary protocol and can be more challenging to debug. We recommend using gRPC if you are already familiar with Qdrant and are trying to optimize the performance of your application.
