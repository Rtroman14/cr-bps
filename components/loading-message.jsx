import { cn } from "@/lib/utils";
import Image from "next/image";

export default function LoadingMessage({ darkTheme }) {
    return (
        <div className="pt-1 flex items-start gap-2">
            <div className="flex-shrink-0 self-end">
                <div className="relative mx-auto h-8 w-8 sm:h-9 sm:w-9">
                    <Image
                        src="/cr-bps-logo.png"
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
            <ul className="tp-loader tp-loader--small rounded-xl p-4 drop-shadow">
                <li className="bg-gray-500"></li>
                <li className="bg-gray-500"></li>
                <li className="bg-gray-500"></li>
            </ul>
        </div>
    );
}
