# Streaming

Streaming conversational text UIs (like ChatGPT) have gained massive popularity over the past few months. This section explores the benefits and drawbacks of streaming and blocking interfaces.

Large language models (LLMs) are extremely powerful. However, when generating long outputs, they can be very slow compared to the latency you're likely used to. If you try to build a traditional blocking UI, your users might easily find themselves staring at loading spinners for 5, 10, even up to 40s waiting for the entire LLM response to be generated. This can lead to a poor user experience, especially in conversational applications like chatbots. Streaming UIs can help mitigate this issue by displaying parts of the response as they become available

```ts
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

const { textStream } = await streamText({
  model: openai("gpt-4-turbo"),
  prompt: "Write a poem about embedding models.",
});

for await (const textPart of textStream) {
  console.log(textPart);
}
```
