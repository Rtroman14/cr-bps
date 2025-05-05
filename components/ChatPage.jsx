"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/ChatMessage";
import { PaperClipIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useChat } from "@ai-sdk/react";
import LoadingMessage from "./loading-message";
import { toast } from "sonner";
import Thinking from "@/components/thinking";

const initialMessages = [
    {
        id: "initial",
        role: "assistant",
        content: `Hello! Which proposal type would you like help with? "Letter" or "RFP Response"?`,
    },
];

export default function ChatPage() {
    const { messages, input, handleInputChange, handleSubmit, status, setMessages, append } =
        useChat({
            initialMessages,
            onError(error) {
                console.error(`error -->`, error);
                toast.error(error.message || "There was an error");
            },
        });
    const messagesEndRef = useRef(null);
    const formRef = useRef(null);
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            formRef.current?.requestSubmit();
        }
    };

    useEffect(() => {
        console.log(`status -->`, status);
    }, [status]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]); // Update scroll when messages change

    // Handler to remove a selected file
    const handleRemoveFile = (index) => {
        const dataTransfer = new DataTransfer();
        Array.from(files).forEach((file, i) => {
            if (i !== index) dataTransfer.items.add(file);
        });
        setFiles(dataTransfer.files);
        if (fileInputRef.current) {
            fileInputRef.current.files = dataTransfer.files;
        }
    };

    // Handler to reset the conversation to initial state
    const handleNewChat = () => {
        setMessages(initialMessages);
        setFiles([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    useEffect(() => {
        console.log(messages);
    }, [messages]);

    return (
        <div className="flex flex-col h-screen">
            <ScrollArea className="flex-1 min-h-0 overflow-hidden w-full">
                <div className="h-full flex flex-col px-4 md:px-6 lg:px-8 max-w-4xl mx-auto">
                    <div className="mx-auto w-full py-6 space-y-9">
                        {messages
                            .filter((message) => message.content !== "")
                            .map((message) => {
                                return (
                                    <ChatMessage
                                        key={message.id}
                                        role={message.role}
                                        id={message.id}
                                        content={message.content}
                                        attachments={message.experimental_attachments}
                                    />
                                );
                            })}
                        {status === "submitted" && (
                            <div>{status === "submitted" && <Thinking />}</div>
                        )}
                        {messages.at(-1)?.role === "assistant" &&
                            messages.at(-1)?.content === "" &&
                            status !== "submitted" && (
                                <div>
                                    <Thinking />
                                </div>
                            )}
                        <div ref={messagesEndRef} aria-hidden="true" />
                    </div>
                </div>
            </ScrollArea>

            {/* Footer */}
            <div className="bg-background">
                <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6">
                    {files && files.length > 0 && (
                        <div className="flex flex-wrap gap-2 py-2 overflow-auto max-h-40">
                            {Array.from(files).map((file, index) => (
                                <div
                                    key={index}
                                    className="relative border border-input rounded-lg p-1 flex items-center bg-background"
                                >
                                    {file.type.startsWith("image/") ? (
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="w-12 h-12 object-cover rounded"
                                        />
                                    ) : (
                                        <div className="flex items-center">
                                            <PaperClipIcon className="w-5 h-5 text-muted-foreground mr-1" />
                                            <div>
                                                <p
                                                    className="text-sm font-medium truncate"
                                                    title={file.name}
                                                >
                                                    {file.name}
                                                </p>
                                                <p
                                                    className="text-xs text-muted-foreground truncate"
                                                    title={file.type}
                                                >
                                                    {file.type || "Unknown"}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFile(index)}
                                        className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-background rounded-full p-0.5 cursor-pointer border"
                                    >
                                        <XMarkIcon className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <form
                        ref={formRef}
                        onSubmit={(event) => {
                            event.preventDefault();
                            let options = { experimental_attachments: files };
                            if (!input.trim() && files && files.length > 0) {
                                append({ role: "user", content: "See attached" }, options);
                            } else {
                                handleSubmit(event, options);
                            }
                            setFiles(undefined);
                            if (fileInputRef.current) {
                                fileInputRef.current.value = "";
                            }
                        }}
                        className="relative rounded-2xl border border-transparent bg-muted transition-colors focus-within:bg-muted/50 focus-within:border-input has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 [&:has(input:is(:disabled))_*]:pointer-events-none"
                    >
                        <input
                            type="file"
                            multiple
                            accept=".png,.jpg,.jpeg,.pdf,.txt"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={(event) => {
                                if (event.target.files) {
                                    const dataTransfer = new DataTransfer();
                                    Array.from(event.target.files).forEach((file) => {
                                        const ext = file.name.split(".").pop().toLowerCase();
                                        if (["png", "jpg", "jpeg", "pdf", "txt"].includes(ext)) {
                                            dataTransfer.items.add(file);
                                        }
                                    });
                                    setFiles(dataTransfer.files);
                                    if (fileInputRef.current) {
                                        fileInputRef.current.files = dataTransfer.files;
                                    }
                                }
                            }}
                        />
                        <textarea
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            className="flex sm:min-h-[70px] w-full bg-transparent px-4 py-3 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none [resize:none]"
                            placeholder="Ask me anything... (Press Enter to send, Shift+Enter for new line)"
                            aria-label="Enter your prompt"
                        />
                        {/* Textarea buttons */}
                        <div className="flex items-center justify-between gap-2 p-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-full h-8 text-xs"
                                onClick={handleNewChat}
                            >
                                New Chat
                            </Button>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    className="rounded-full size-8 border-border hover:bg-background hover:shadow-md transition-[box-shadow]"
                                    onClick={() => fileInputRef.current?.click()}
                                    variant="outline"
                                    size="icon"
                                >
                                    <PaperClipIcon className="text-muted-foreground/70 size-5" />
                                </Button>
                                <Button type="submit" className="rounded-full h-8 text-xs">
                                    Send
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
