import { streamText, smoothStream, tool, generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import path from "path";
import fs from "fs/promises";

// Allow streaming responses up to 30 seconds
export const maxDuration = 60;

const filePath = path.join(process.cwd(), "lib/knowledge/system-message-grok.md");
const systemMessage = await fs.readFile(filePath, "utf8");

const sendWebhook = async (data) => {
    try {
        const webhookUrl = process.env.WEBHOOK_URL;
        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Webhook failed with status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type") || "";

        let responseBody;
        if (contentType.includes("application/json")) {
            responseBody = await response.json();
        } else {
            responseBody = await response.text();
        }

        return {
            success: true,
            data: responseBody,
        };
    } catch (error) {
        console.error("Webhook error:", error);
        return {
            success: false,
            error: error.message,
            status: error.status || 500,
        };
    }
};

export async function POST(req) {
    const { messages } = await req.json();

    const openai = createOpenAI({
        compatibility: "strict",
        apiKey: process.env.OPENAI_API_KEY,
    });

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
        tools: {
            create_proposal: tool({
                description: "Send a proposal submission webhook event",
                parameters: z.object({
                    client_first_name: z.string().describe("The first name of the client"),
                    client_last_name: z.string().describe("The last name of the client"),
                    client_email: z.string().describe("The email address of the client"),
                    client_street_address: z.string().describe("The client's street address"),
                    client_city: z.string().describe("The city in which the client resides"),
                    client_state: z
                        .string()
                        .describe("The client's state (e.g., CA for California)"),
                    client_zip: z.string().describe("The ZIP code for the client's address"),
                    re: z
                        .string()
                        .describe(
                            "The name of the recipient or project the proposal is addressed to"
                        ),
                    proposal_introduction: z
                        .string()
                        .describe(
                            "A detailed introduction to the proposal including scope and purpose"
                        ),
                    proposal_name: z
                        .string()
                        .describe("The title or name of the proposal document"),
                    proposal_type: z
                        .enum(["letter", "rfp_response"])
                        .describe("The type of proposal being submitted"),
                }),
                execute: async (proposalData) => {
                    try {
                        const webhook = await sendWebhook(proposalData);

                        console.log(`webhook -->`, webhook);

                        return webhook;
                    } catch (error) {
                        console.error(error);
                        return {
                            success: false,
                            message: error.message,
                        };
                    }
                },
            }),
            about_cr_bps: tool({
                description: "Get information about CR-BPS",
                parameters: z.object({}),
                execute: async () => {
                    // Read the CR-BPS summary markdown file
                    const filePath = path.join(process.cwd(), "lib/knowledge/summary-of-cr-bps.md");
                    const content = await fs.readFile(filePath, "utf8");
                    return `<about_cr_bps>${content}</about_cr_bps>`;
                },
            }),
            generate_project_understanding: tool({
                description: "Use this tool to generate the project understanding section",
                parameters: z.object({}),
                execute: async () => {
                    // Read the CR-BPS summary markdown file
                    const filePath = path.join(
                        process.cwd(),
                        "lib/knowledge/project-understanding-examples.md"
                    );
                    const content = await fs.readFile(filePath, "utf8");
                    return `<project_understanding_examples>${content}</project_understanding_examples>`;
                },
            }),
            generate_proposal_introduction: tool({
                description: "Use this tool to generate the proposal introduction section",
                parameters: z.object({}),
                execute: async () => {
                    // Read the CR-BPS summary markdown file
                    const filePath = path.join(
                        process.cwd(),
                        "lib/knowledge/proposal-introduction-examples.md"
                    );
                    const content = await fs.readFile(filePath, "utf8");
                    return `<proposal_introduction_examples>${content}</proposal_introduction_examples>`;
                },
            }),
            // generate_scope_of_services: tool({
            //     description: "Use this tool to generate the scope of services section",
            //     parameters: z.object({}),
            //     execute: async () => {
            //         // Read the CR-BPS summary markdown file
            //         const filePath = path.join(
            //             process.cwd(),
            //             "lib/knowledge/scope-of-services-examples.md"
            //         );
            //         const content = await fs.readFile(filePath, "utf8");

            //         const { text } = await generateText({
            //             model: openai("o4-mini"),
            //             prompt: `Your task is to generate a scope of services section for CR-BPS. They will include your generated output in their proposal. Here are previous examples of this section they've used in the past:

            //             <scope_of_services_examples>${content}</scope_of_services_examples>
            //             `,
            //             messages,
            //         });

            //         return text;
            //     },
            // }),
            generate_scope_of_services: tool({
                description: "Use this tool to generate the scope of services section",
                parameters: z.object({}),
                execute: async () => {
                    // Read the CR-BPS summary markdown file
                    const filePath = path.join(
                        process.cwd(),
                        "lib/knowledge/scope-of-services-examples.md"
                    );
                    const content = await fs.readFile(filePath, "utf8");
                    return `<scope_of_services_examples>${content}</scope_of_services_examples>`;
                },
            }),
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
