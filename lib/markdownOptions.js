import { CodeBlock, CodeBlockCode } from "@/components/ui/code-block";

const ATagTargetBlank = ({ children, ...props }) => (
    <a {...props} target="_blank">
        {children}
    </a>
);

const ProposalSection = ({ children, ...props }) => (
    <CodeBlock>
        <CodeBlockCode {...props} code={children} language="markdown" />
    </CodeBlock>
);

export const markdownOptions = {
    overrides: {
        h1: {
            props: {
                className: "text-2xl font-bold mb-3 mt-4",
            },
        },
        h2: {
            props: {
                className: "text-xl font-bold mb-3 mt-4",
            },
        },
        h3: {
            props: {
                className: "text-xl font-bold mb-3 mt-4",
            },
        },
        h4: {
            props: {
                className: "font-bold mb-0.5",
            },
        },
        ul: {
            props: {
                className: "markdown-ul space-y-1 py-1",
            },
        },
        ol: {
            props: {
                className: "markdown-ol space-y-1 py-1",
            },
        },
        span: {
            props: {
                className: "markdown-span",
            },
        },
        a: {
            component: ATagTargetBlank,
            props: {
                className: "text-blue-500 underline",
            },
        },
        blockquote: {
            // component: ProposalSection,
            props: {
                className: "!italic px-4 my-0 border-l border-gray-300 space-y-4",
                // "!italic p-4 my-4 border-l-4 border-gray-300 bg-gray-700 text-gray-100 space-y-4",
            },
        },
        table: {
            props: {
                className: "border-collapse border border-black w-full",
            },
        },
        th: {
            props: {
                className: "border border-black align-top p-2 text-left",
            },
        },
        td: {
            props: {
                className: "border border-black align-top p-2",
            },
        },
    },
};
