# Vercel AI SDK - Node.js Quickstart

In this quickstart tutorial, you'll build a simple AI chatbot with a streaming user interface. Along the way, you'll learn key concepts and techniques that are fundamental to using the SDK in your own projects. If you are unfamiliar with the concepts of Prompt Engineering and HTTP Streaming, you can optionally read these documents first.To follow this quickstart, you'll need:

- Node.js 18+ and pnpm installed on your local development machine.
- An OpenAI API key.

## Setup your application

Start by creating a new directory using the mkdir command. Change into your new directory and then run the pnpm init command. This will create a package.json in your new directory.

```zsh
mkdir my-ai-app
cd my-ai-app
pnpm init
```

## Install dependencies

Install ai and @ai-sdk/openai, the AI SDK's OpenAI provider, along with other necessary dependencies.

> The AI SDK is designed to be a unified interface to interact with any large language model. This means that you can change model and providers with just one line of code! Learn more about available providers and building custom providers in the providers section.

```zsh
pnpm add ai @ai-sdk/openai zod dotenv
pnpm add -D @types/node tsx typescript
```

The ai and @ai-sdk/openai packages contain the AI SDK and the AI SDK OpenAI provider, respectively. You will use zod to define type-safe schemas that you will pass to the large language model (LLM). You will use dotenv to access environment variables (your OpenAI key) within your application. There are also three development dependencies, installed with the -D flag, that are necessary to run your Typescript code.

### Configure OpenAI API Key

Create a .env file in your project root and add your OpenAI API Key. This key is used to authenticate your application with the OpenAI service.

## Create your application

Create an index.ts file in the root of your project and add the following code:

```ts
import { openai } from "@ai-sdk/openai";
import { CoreMessage, streamText } from "ai";
import dotenv from "dotenv";
import * as readline from "node:readline/promises";

dotenv.config();

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const messages: CoreMessage[] = [];

async function main() {
  while (true) {
    const userInput = await terminal.question("You: ");

    messages.push({ role: "user", content: userInput });

    const result = await streamText({
      model: openai("gpt-4-turbo"),
      messages,
    });

    let fullResponse = "";
    process.stdout.write("\nAssistant: ");
    for await (const delta of result.textStream) {
      fullResponse += delta;
      process.stdout.write(delta);
    }
    process.stdout.write("\n\n");

    messages.push({ role: "assistant", content: fullResponse });
  }
}

main().catch(console.error);
```

Let's take a look at what is happening in this code:

Set up a readline interface for taking input from the terminal, enabling interactive sessions directly from the command line. Initialize an array called messages to store the history of your conversation. This history allows the model to maintain context in ongoing dialogues. In the main function: Prompt for and capture user input, storing it in userInput. Add user input to the messages array as a user message. Call streamText, which is imported from the ai package. This function accepts a configuration object that contains a model provider and messages. Iterate over the text stream returned by the streamText function (result.textStream) and print the contents of the stream to the terminal. Add the assistant's response to the messages array.

### Running Your Application

With that, you have built everything you need for your chatbot! To start your application, use the command:

```zsh
pnpm tsx index.ts
```

You should see a prompt in your terminal. Test it out by entering a message and see the AI chatbot respond in real-time! The AI SDK makes it fast and easy to build AI chat interfaces with Node.js.

## Enhance Your Chatbot with Tools

While large language models (LLMs) have incredible generation capabilities, they struggle with discrete tasks (e.g. mathematics) and interacting with the outside world (e.g. getting the weather). This is where tools come in.

Tools are actions that an LLM can invoke. The results of these actions can be reported back to the LLM to be considered in the next response.

For example, if a user asks about the current weather, without tools, the model would only be able to provide general information based on its training data. But with a weather tool, it can fetch and provide up-to-date, location-specific weather information.

Let's enhance your chatbot by adding a simple weather tool.

## Update Your Application

Modify your index.ts file to include the new wather tool:

```ts
import { openai } from "@ai-sdk/openai";
import { CoreMessage, streamText, tool } from "ai";
import dotenv from "dotenv";
import { z } from "zod";
import * as readline from "node:readline/promises";

dotenv.config();

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const messages: CoreMessage[] = [];

async function main() {
  while (true) {
    const userInput = await terminal.question("You: ");

    messages.push({ role: "user", content: userInput });

    const result = await streamText({
      model: openai("gpt-4-turbo"),
      messages,
      tools: {
        weather: tool({
          description: "Get the weather in a location (in Celsius)",
          parameters: z.object({
            location: z
              .string()
              .describe("The location to get the weather for"),
          }),
          execute: async ({ location }) => ({
            location,
            temperature: Math.round((Math.random() * 30 + 5) * 10) / 10, // Random temp between 5°C and 35°C
          }),
        }),
      },
    });

    let fullResponse = "";
    process.stdout.write("\nAssistant: ");
    for await (const delta of result.textStream) {
      fullResponse += delta;
      process.stdout.write(delta);
    }
    process.stdout.write("\n\n");

    messages.push({ role: "assistant", content: fullResponse });
  }
}

main().catch(console.error);
```

In this updated code:

You import the tool function from the ai package. You define a tools object with a weather tool. This tool: Has a description that helps the model understand when to use it. Defines parameters using a Zod schema, specifying that it requires a location string to execute this tool. Defines an execute function that simulates getting weather data (in this case, it returns a random temperature). This is an asynchronous function, so you could fetch real data from an external API.

Now your chatbot can "fetch" weather information for any location the user asks about. When the model determines it needs to use the weather tool, it will generate a tool call with the necessary parameters. The execute function will then be automatically run, and the results will be used by the model to generate its response.

Try asking something like "What's the weather in New York?" and see how the model uses the new tool.

Notice the blank "assistant" response? This is because instead of generating a text response, the model generated a tool call. You can access the tool call and subsequent tool result in the toolCall and toolResult keys of the result object.

```ts
import { openai } from "@ai-sdk/openai";
import { CoreMessage, streamText, tool } from "ai";
import dotenv from "dotenv";
import { z } from "zod";
import * as readline from "node:readline/promises";

dotenv.config();

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const messages: CoreMessage[] = [];

async function main() {
  while (true) {
    const userInput = await terminal.question("You: ");

    messages.push({ role: "user", content: userInput });

    const result = await streamText({
      model: openai("gpt-4-turbo"),
      messages,
      tools: {
        weather: tool({
          description: "Get the weather in a location (in Celsius)",
          parameters: z.object({
            location: z
              .string()
              .describe("The location to get the weather for"),
          }),
          execute: async ({ location }) => ({
            location,
            temperature: Math.round((Math.random() * 30 + 5) * 10) / 10, // Random temp between 5°C and 35°C
          }),
        }),
      },
    });

    let fullResponse = "";
    process.stdout.write("\nAssistant: ");
    for await (const delta of result.textStream) {
      fullResponse += delta;
      process.stdout.write(delta);
    }
    process.stdout.write("\n\n");

    console.log(await result.toolCalls);
    console.log(await result.toolResults);
    messages.push({ role: "assistant", content: fullResponse });
  }
}

main().catch(console.error);
```

> Now, when you ask about the weather, you'll see the tool call and its result displayed in your chat interface.

## Enabling Multi-Step Tool Calls

You may have noticed that while the tool results are visible in the chat interface, the model isn't using this information to answer your original query. This is because once the model generates a tool call, it has technically completed its generation.

To solve this, you can enable multi-step tool calls using maxSteps. This feature will automatically send tool results back to the model to trigger an additional generation. In this case, you want the model to answer your question using the results from the weather tool.

### Update your application

Modify your index.ts file to include the maxSteps option:

```ts
import { openai } from "@ai-sdk/openai";
import { CoreMessage, streamText, tool } from "ai";
import dotenv from "dotenv";
import { z } from "zod";
import * as readline from "node:readline/promises";

dotenv.config();

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const messages: CoreMessage[] = [];

async function main() {
  while (true) {
    const userInput = await terminal.question("You: ");

    messages.push({ role: "user", content: userInput });

    const result = await streamText({
      model: openai("gpt-4-turbo"),
      messages,
      tools: {
        weather: tool({
          description: "Get the weather in a location (in Celsius)",
          parameters: z.object({
            location: z
              .string()
              .describe("The location to get the weather for"),
          }),
          execute: async ({ location }) => ({
            location,
            temperature: Math.round((Math.random() * 30 + 5) * 10) / 10, // Random temp between 5°C and 35°C
          }),
        }),
      },
      maxSteps: 5,
      onStepFinish: (step) => {
        console.log(JSON.stringify(step, null, 2));
      },
    });

    let fullResponse = "";
    process.stdout.write("\nAssistant: ");
    for await (const delta of result.textStream) {
      fullResponse += delta;
      process.stdout.write(delta);
    }
    process.stdout.write("\n\n");

    messages.push({ role: "assistant", content: fullResponse });
  }
}

main().catch(console.error);
```

In this updated code:

You set maxSteps to 5, allowing the model to use up to 5 "steps" for any given generation. You add an onStepFinish callback to log each step of the interaction, helping you understand the model's tool usage. This means we can also delete the toolCall and toolResult console.log statements from the previous example. Now, when you ask about the weather in a location, you should see the model using the weather tool results to answer your question.

By setting maxSteps to 5, you're allowing the model to use up to 5 "steps" for any given generation. This enables more complex interactions and allows the model to gather and process information over several steps if needed. You can see this in action by adding another tool to convert the temperature from Celsius to Fahrenheit.

### Adding a second tool

Update your index.ts file to add a new tool to convert the temperature from Celsius to Fahrenheit:

```ts
import { openai } from "@ai-sdk/openai";
import { CoreMessage, streamText, tool } from "ai";
import dotenv from "dotenv";
import { z } from "zod";
import * as readline from "node:readline/promises";

dotenv.config();

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const messages: CoreMessage[] = [];

async function main() {
  while (true) {
    const userInput = await terminal.question("You: ");

    messages.push({ role: "user", content: userInput });

    const result = await streamText({
      model: openai("gpt-4-turbo"),
      messages,
      tools: {
        weather: tool({
          description: "Get the weather in a location (in Celsius)",
          parameters: z.object({
            location: z
              .string()
              .describe("The location to get the weather for"),
          }),
          execute: async ({ location }) => ({
            location,
            temperature: Math.round((Math.random() * 30 + 5) * 10) / 10, // Random temp between 5°C and 35°C
          }),
        }),
        convertCelsiusToFahrenheit: tool({
          description: "Convert a temperature from Celsius to Fahrenheit",
          parameters: z.object({
            celsius: z
              .number()
              .describe("The temperature in Celsius to convert"),
          }),
          execute: async ({ celsius }) => {
            const fahrenheit = (celsius * 9) / 5 + 32;
            return { fahrenheit: Math.round(fahrenheit * 100) / 100 };
          },
        }),
      },
      maxSteps: 5,
      onStepFinish: (step) => {
        console.log(JSON.stringify(step, null, 2));
      },
    });

    let fullResponse = "";
    process.stdout.write("\nAssistant: ");
    for await (const delta of result.textStream) {
      fullResponse += delta;
      process.stdout.write(delta);
    }
    process.stdout.write("\n\n");

    messages.push({ role: "assistant", content: fullResponse });
  }
}

main().catch(console.error);
```

Now, when you ask "What's the weather in New York in Celsius?", you should see a more complete interaction:

The model will call the weather tool for New York. You'll see the tool result logged. It will then call the temperature conversion tool to convert the temperature from Celsius to Fahrenheit. The model will then use that information to provide a natural language response about the weather in New York. This multi-step approach allows the model to gather information and use it to provide more accurate and contextual responses, making your chatbot considerably more useful.

This example shows how tools can expand the model's capabilities. You can create more complex tools to integrate with real APIs, databases, or any other external systems, allowing the model to access and process real-world data in real-time. Tools bridge the gap between the model's knowledge cutoff and current information.
