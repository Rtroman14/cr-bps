import Image from "next/image";
import { TextShimmer } from "./text-shimmer";

export default function Thinking({ text = "Thinking..." }) {
    return (
        <div className="flex items-center gap-4">
            <div className="shrink-0 self-end">
                <div className="relative mx-auto h-8 w-8 sm:h-9 sm:w-9">
                    <Image
                        src="/cr-bps-logo.png"
                        alt="CR-BPS Logo"
                        quality={100}
                        sizes="32px, 36px"
                        className="rounded-full shadow-sm"
                        unoptimized
                        fill
                        style={{
                            objectFit: "contain",
                        }}
                    />
                </div>
            </div>
            <TextShimmer className="text-sm" duration={1.5}>
                {text}
            </TextShimmer>
        </div>
    );
}
