"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/ChatMessage";
import { PaperClipIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useChat } from "@ai-sdk/react";
import LoadingMessage from "./loading-message";

export default function ChatPage() {
    const { messages, input, handleInputChange, handleSubmit, status, setMessages } = useChat();
    const messagesEndRef = useRef(null);
    const formRef = useRef(null);
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            formRef.current?.requestSubmit();
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]); // Update scroll when messages change

    // Handler to remove a selected file
    const handleRemoveFile = (index) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    // Add dropzone handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <ScrollArea className="flex-1 min-h-0 overflow-hidden w-full max-w-4xl mx-auto">
                <div className="h-full flex flex-col px-4 md:px-6 lg:px-8">
                    <div className="mx-auto w-full py-6 space-y-9">
                        {messages.map((message) => {
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
                        <div ref={messagesEndRef} aria-hidden="true" />
                    </div>

                    {(status === "submitted" || status === "streaming") && (
                        <div>{status === "submitted" && <LoadingMessage />}</div>
                    )}
                </div>
            </ScrollArea>

            {/* Footer */}
            <div className="bg-background">
                <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6">
                    {files.length > 0 && (
                        <div className="flex flex-wrap gap-2 py-2 overflow-auto max-h-40">
                            {files.map((file, index) => (
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
                            handleSubmit(event, { experimental_attachments: files });
                            setFiles([]);
                            if (fileInputRef.current) {
                                fileInputRef.current.value = "";
                            }
                        }}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`relative rounded-2xl border ${
                            isDragging
                                ? "border-blue-400 border-dashed bg-muted/50"
                                : "border-transparent"
                        } bg-muted transition-colors focus-within:bg-muted/50 focus-within:border-input has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 [&:has(input:is(:disabled))_*]:pointer-events-none`}
                    >
                        <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            className="hidden"
                            onChange={(event) => {
                                if (event.target.files) setFiles(Array.from(event.target.files));
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
                        <div className="flex items-center justify-end gap-2 p-3">
                            {/* Right buttons */}
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    className="rounded-full size-8 border-none hover:bg-background hover:shadow-md transition-[box-shadow]"
                                    onClick={() => fileInputRef.current?.click()}
                                    variant="outline"
                                    size="icon"
                                >
                                    <PaperClipIcon className="text-muted-foreground/70 size-5" />
                                </Button>
                                <Button type="submit" className="rounded-full h-8">
                                    Ask Max
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
