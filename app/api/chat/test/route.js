import { streamText, smoothStream } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export const maxDuration = 180;

export async function POST(req) {
    const { messages } = await req.json();

    const openai = createOpenAI({
        compatibility: "strict",
        apiKey: process.env.OPENAI_API_KEY,
    });

    const systemMessage = `You MUST return this text for every response:
<output>
This is a **bold text** and this is an *italic text*.

## Lists

### Unordered List
- Item 1
- Item 2
- Item 3

### Ordered List
1. First item
2. Second item
3. Third item
</output>
`;

    // const google = createGoogleGenerativeAI({
    //     apiKey: process.env.GOOGLE_AI_API_KEY,
    // });

    const result = streamText({
        system: systemMessage,
        // model: google("gemini-2.0-flash-001"), // not great results
        // model: openai("gpt-4o"), // spent $9 on 1 day of testing
        // model: openai("gpt-4o-mini"), // won't work - has a 128K tokens context window.
        model: openai("o4-mini"), // this works
        // model: openai("gpt-4.1-nano"), // no
        experimental_transform: smoothStream({
            delayInMs: 20, // optional: defaults to 10ms
        }),
        messages,
        maxSteps: 8,
        onStepFinish({ stepType, toolCalls }) {
            console.log(`stepType -->`, stepType);
            console.log(`toolCalls -->`, toolCalls);
        },
        onError({ error }) {
            console.log("ERROR");
            console.error(error); // your error logging logic here
        },
        // onStepFinish(event) {
        //     console.log(`event -->`, event);
        // },
        onFinish({ text, finishReason, usage, response }) {
            console.log(`usage -->`, usage);
        },
    });

    return result.toDataStreamResponse();
}
