import { streamText, smoothStream, tool, generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import path from "path";
import fs from "fs/promises";

export const maxDuration = 120;

const filePath = path.join(process.cwd(), "lib/prompts/system-message/system-message-grok.v2.3.md");
const systemMessage = await fs.readFile(filePath, "utf8");

const sendWebhook = async (data) => {
    try {
        // const webhookUrl = process.env.WEBHOOK_URL;
        const webhookUrl = "https://webhook.site/c6b97a32-8671-4f8f-a9c0-8eb3ecfd2130";
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
                description: "Submits a proposal to PandaDoc with the provided variables",
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
                    proposal_name: z.string().describe("The name of the proposal document file"),
                    proposal_title: z
                        .string()
                        .describe("The title of the proposal document (cover letter title)"),
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
                description: "Get general information about CR-BPS company and services",
                parameters: z.object({}),
                execute: async () => {
                    // Read the CR-BPS summary markdown file
                    const filePath = path.join(process.cwd(), "lib/knowledge/summary-of-cr-bps.md");
                    const content = await fs.readFile(filePath, "utf8");
                    return `<about_cr_bps>${content}</about_cr_bps>`;
                },
            }),
            letter_proposal_introduction_examples: tool({
                description:
                    "Provides examples of introduction sections from past CR-BPS letter proposals",
                parameters: z.object({}),
                execute: async () => {
                    const filePath = path.join(
                        process.cwd(),
                        "lib/prompts/letter/letter-proposal-introduction-examples.md"
                    );
                    const content = await fs.readFile(filePath, "utf8");
                    return `<letter_proposal_introduction_examples>${content}</letter_proposal_introduction_examples>`;
                },
            }),
            letter_project_understanding_examples: tool({
                description:
                    "Get examples of project understanding sections from past CR-BPS proposals",
                parameters: z.object({}),
                execute: async () => {
                    // Read the CR-BPS summary markdown file
                    const filePath = path.join(
                        process.cwd(),
                        "lib/prompts/letter/letter-project-understanding-examples.md"
                    );
                    const content = await fs.readFile(filePath, "utf8");
                    return `<letter_project_understanding_examples>${content}</letter_project_understanding_examples>`;
                },
            }),
            letter_scope_of_services_examples: tool({
                description:
                    "Get examples of scope of services sections from past CR-BPS proposals",
                parameters: z.object({}),
                execute: async () => {
                    // Read the CR-BPS summary markdown file
                    const filePath = path.join(
                        process.cwd(),
                        "lib/prompts/letter/letter-scope-of-services-examples.md"
                    );
                    const content = await fs.readFile(filePath, "utf8");
                    return `<letter_scope_of_services_examples>${content}</letter_scope_of_services_examples>`;
                },
            }),
            rfp_response_introduction_examples: tool({
                description:
                    "Provides examples of introduction sections from past CR-BPS letter proposals",
                parameters: z.object({}),
                execute: async () => {
                    const filePath = path.join(
                        process.cwd(),
                        "lib/prompts/rfp-response/rfp-response-introduction-examples.md"
                    );
                    const content = await fs.readFile(filePath, "utf8");
                    return `<rfp_response_introduction_examples>${content}</rfp_response_introduction_examples>`;
                },
            }),
            rfp_response_project_understanding_examples: tool({
                description:
                    "Get examples of project understanding sections from past CR-BPS proposals",
                parameters: z.object({}),
                execute: async () => {
                    // Read the CR-BPS summary markdown file
                    const filePath = path.join(
                        process.cwd(),
                        "lib/prompts/rfp-response/rfp-response-project-understanding-examples.md"
                    );
                    const content = await fs.readFile(filePath, "utf8");
                    return `<rfp_response_project_understanding_examples>${content}</rfp_response_project_understanding_examples>`;
                },
            }),
            rfp_response_scope_of_services_examples: tool({
                description:
                    "Get examples of scope of services sections from past CR-BPS proposals",
                parameters: z.object({}),
                execute: async () => {
                    // Read the CR-BPS summary markdown file
                    const filePath = path.join(
                        process.cwd(),
                        "lib/prompts/rfp-response/rfp-response-scope-of-services-examples.md"
                    );
                    const content = await fs.readFile(filePath, "utf8");
                    return `<rfp_response_scope_of_services_examples>${content}</rfp_response_scope_of_services_examples>`;
                },
            }),
        },
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
