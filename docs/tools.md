# Tools

While large language models (LLMs) have incredible generation capabilities, they struggle with discrete tasks (e.g. mathematics) and interacting with the outside world (e.g. getting the weather).

Tools are actions that an LLM can invoke. The results of these actions can be reported back to the LLM to be considered in the next response.

For example, when you ask an LLM for the "weather in London", and there is a weather tool available, it could call a tool with London as the argument. The tool would then fetch the weather data and return it to the LLM. The LLM can then use this information in its response.

## What is a tool?

A tool is an object that can be called by the model to perform a specific task. You can use tools with generateText and streamText by passing one or more tools to the tools parameter. A tool consists of three properties:

description: An optional description of the tool that can influence when the tool is picked. parameters: A Zod schema or a JSON schema that defines the parameters. The schema is consumed by the LLM, and also used to validate the LLM tool calls. execute: An optional async function that is called with the arguments from the tool call. If the LLM decides to use a tool, it will generate a tool call. Tools with an execute function are run automatically when these calls are generated. The results of the tool calls are returned using tool result objects.

You can automatically pass tool results back to the LLM using multi-step calls with streamText and generateText.

## Schemas

Schemas are used to define the parameters for tools and to validate the tool calls.

The AI SDK supports both raw JSON schemas (using the jsonSchema function) and Zod schemas. Zod is the most popular JavaScript schema validation library.

You can then specify a Zod schema, for example:

```ts
import z from "zod";

const recipeSchema = z.object({
  recipe: z.object({
    name: z.string(),
    ingredients: z.array(
      z.object({
        name: z.string(),
        amount: z.string(),
      })
    ),
    steps: z.array(z.string()),
  }),
});
```

## Tool Calling

As covered under Foundations, tools are objects that can be called by the model to perform a specific task. AI SDK Core tools contain three elements:

description: An optional description of the tool that can influence when the tool is picked. parameters: A Zod schema or a JSON schema that defines the parameters. The schema is consumed by the LLM, and also used to validate the LLM tool calls. execute: An optional async function that is called with the arguments from the tool call. It produces a value of type RESULT (generic type). It is optional because you might want to forward tool calls to the client or to a queue instead of executing them in the same process. The tools parameter of generateText and streamText is an object that has the tool names as keys and the tools as values:

```ts
import { z } from "zod";
import { generateText, tool } from "ai";

const result = await generateText({
  model: yourModel,
  tools: {
    weather: tool({
      description: "Get the weather in a location",
      parameters: z.object({
        location: z.string().describe("The location to get the weather for"),
      }),
      execute: async ({ location }) => ({
        location,
        temperature: 72 + Math.floor(Math.random() * 21) - 10,
      }),
    }),
  },
  prompt: "What is the weather in San Francisco?",
});
```

> When a model uses a tool, it is called a "tool call" and the output of the tool is called a "tool result".

Tool calling is not restricted to only text generation. You can also use it to render user interfaces (Generative UI).

## Multi-step calls

Large language models need to know the tool results before they can continue to generate text. This requires sending the tool results back to the model. You can enable this feature by setting the maxSteps setting to a number greater than 1.

When maxSteps is set to a number greater than 1, the language model will be called in a loop when there are tool calls and for every tool call there is a tool result, until there are no further tool calls or the maximum number of tool steps is reached.

Example

In the following example, there are two steps:

Step 1

1. The prompt 'What is the weather in San Francisco?' is sent to the model.
2. The model generates a tool call.
3. The tool call is executed.

Step 2

1. The tool result is sent to the model.
2. The model generates a response considering the tool result.

```ts
import { z } from "zod";
import { generateText, tool } from "ai";

const { text, steps } = await generateText({
  model: yourModel,
  tools: {
    weather: tool({
      description: "Get the weather in a location",
      parameters: z.object({
        location: z.string().describe("The location to get the weather for"),
      }),
      execute: async ({ location }) => ({
        location,
        temperature: 72 + Math.floor(Math.random() * 21) - 10,
      }),
    }),
  },
  maxSteps: 5, // allow up to 5 steps
  prompt: "What is the weather in San Francisco?",
});
```

> You can use streamText in a similar way.

### Steps

To access intermediate tool calls and results, you can use the steps property in the result object or the streamText onFinish callback. It contains all the text, tool calls, tool results, and more from each step.

Example: Extract tool results from all steps

```ts
import { generateText } from "ai";

const { steps } = await generateText({
  model: openai("gpt-4-turbo"),
  maxSteps: 10,
  // ...
});

// extract all tool calls from the steps:
const allToolCalls = steps.flatMap((step) => step.toolCalls);
```

### `onStepFinish` callback

When using generateText or streamText, you can provide an onStepFinish callback that is triggered when a step is finished, i.e. all text deltas, tool calls, and tool results for the step are available. When you have multiple steps, the callback is triggered for each step.

```ts
import { generateText } from "ai";

const result = await generateText({
  // ...
  onStepFinish({ text, toolCalls, toolResults, finishReason, usage }) {
    // your own logic, e.g. for saving the chat history or recording usage
  },
});
```

## Response Messages

Adding the generated assistant and tool messages to your conversation history is a common task, especially if you are using multi-step tool calls.

Both generateText and streamText have a responseMessages property that you can use to add the assistant and tool messages to your conversation history. It is also available in the onFinish callback of streamText.

The responseMessages property contains an array of CoreMessage objects that you can add to your conversation history:

```ts
import { generateText } from "ai";

const messages: CoreMessage[] = [
  // ...
];

const { responseMessages } = await generateText({
  // ...
  messages,
});

// add the response messages to your conversation history:
messages.push(...responseMessages); // streamText: ...(await responseMessages)
```

## Tool Choice

You can use the toolChoice setting to influence when a tool is selected. It supports the following settings:

auto (default): the model can choose whether and which tools to call. required: the model must call a tool. It can choose which tool to call. none: the model must not call tools { type: 'tool', toolName: string (typed) }: the model must call the specified tool

```ts
import { z } from "zod";
import { generateText, tool } from "ai";

const result = await generateText({
  model: yourModel,
  tools: {
    weather: tool({
      description: "Get the weather in a location",
      parameters: z.object({
        location: z.string().describe("The location to get the weather for"),
      }),
      execute: async ({ location }) => ({
        location,
        temperature: 72 + Math.floor(Math.random() * 21) - 10,
      }),
    }),
  },
  toolChoice: "required", // force the model to call a tool
  prompt: "What is the weather in San Francisco?",
});
```

## Prompt engineering with tools

When you create prompts that include tools, getting good results can be tricky as the number and complexity of your tools increases.

Here are a few tips to help you get the best results:

Use a model that is strong at tool calling, such as gpt-4 or gpt-4-turbo. Weaker models will often struggle to call tools effectively and flawlessly. Keep the number of tools low, e.g. to 5 or less. Keep the complexity of the tool parameters low. Complex Zod schemas with many nested and optional elements, unions, etc. can be challenging for the model to work with. Use semantically meaningful names for your tools, parameters, parameter properties, etc. The more information you pass to the model, the better it can understand what you want. Add .describe("...") to your Zod schema properties to give the model hints about what a particular property is for. When the output of a tool might be unclear to the model and there are dependencies between tools, use the description field of a tool to provide information about the output of the tool execution. You can include example input/outputs of tool calls in your prompt to help the model understand how to use the tools. Keep in mind that the tools work with JSON objects, so the examples should use JSON. In general, the goal should be to give the model all information it needs in a clear way.
