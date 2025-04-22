import { memo, useMemo } from "react";
import Image from "next/image";
import { marked } from "marked";
import Markdown from "markdown-to-jsx";
import { markdownOptions } from "@/lib/markdownOptions";
import { cn } from "@/lib/utils";
import { UserCircleIcon } from "@heroicons/react/24/solid";

function parseMarkdownIntoBlocks(markdown) {
    const tokens = marked.lexer(markdown);
    return tokens.map((token) => token.raw);
}

const MemoizedMarkdownBlock = memo(
    ({ content }) => {
        return <Markdown options={markdownOptions}>{content}</Markdown>;
    },
    (prevProps, nextProps) => {
        if (prevProps.content !== nextProps.content) return false;
        return true;
    }
);

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock";

export const ChatMessage = memo(({ logo = "", content, id, role, attachments }) => {
    const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);
    const imageSrc = logo || "/cr-bps-logo.png";

    if (role === "user") {
        return (
            <div className="flex w-full justify-end">
                <div className="flex items-start gap-3 max-w-[80%]">
                    <div className="bg-muted text-primary rounded-xl px-4 py-2.5 shadow text-sm">
                        {content &&
                            blocks.map((block, index) => (
                                <MemoizedMarkdownBlock
                                    content={block}
                                    key={`${id}-block_${index}`}
                                />
                            ))}
                        {attachments && attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                                {attachments.map((att, idx) => {
                                    const mimeType = att.contentType || att.type || "";
                                    const src = att.url || URL.createObjectURL(att);
                                    if (mimeType.startsWith("image/")) {
                                        return (
                                            <img
                                                key={`${id}-attach-${idx}`}
                                                src={src}
                                                alt={att.name || `attachment-${idx}`}
                                                className="max-w-full rounded"
                                            />
                                        );
                                    }
                                    if (mimeType.startsWith("application/pdf")) {
                                        return (
                                            <iframe
                                                key={`${id}-attach-${idx}`}
                                                src={src}
                                                width={500}
                                                height={600}
                                                title={att.name || `attachment-${idx}`}
                                            />
                                        );
                                    }
                                    return (
                                        <div
                                            key={`${id}-attach-${idx}`}
                                            className="p-2 border rounded"
                                        >
                                            <a
                                                href={src}
                                                download={att.name}
                                                className="text-blue-600 underline"
                                            >
                                                {att.name || `attachment-${idx}`}
                                            </a>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    <div className="flex-shrink-0 drop-shadow">
                        <UserCircleIcon className="size-9 text-muted-foreground" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex w-full gap-4 max-w-[80%]">
            <div className="flex-shrink-0">
                <div className="relative mx-auto h-8 w-8 sm:h-9 sm:w-9">
                    <Image
                        src={imageSrc}
                        alt="Max Profile Picture"
                        quality={100}
                        sizes="32px, 36px"
                        className="rounded-full shadow"
                        unoptimized
                        fill
                        style={{
                            objectFit: "contain",
                        }}
                    />
                </div>
            </div>
            <div className="flex-grow">
                <div className={cn("antialiased text-primary text-sm mt-1")}>
                    {content &&
                        blocks.map((block, index) => (
                            <MemoizedMarkdownBlock content={block} key={`${id}-block_${index}`} />
                        ))}
                </div>
            </div>
        </div>
    );
});

ChatMessage.displayName = "ChatMessage";
