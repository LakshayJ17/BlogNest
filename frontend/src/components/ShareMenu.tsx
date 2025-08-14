import { useEffect, useRef, useState } from "react";
import { Share2, Copy } from "lucide-react";
import {
    FacebookShareButton,
    TwitterShareButton,
    WhatsappShareButton,
    FacebookIcon,
    TwitterIcon,
    WhatsappIcon,
} from "react-share";

export function ShareMenu({ url, title }: { url: string; title: string }) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    useEffect(() => {
        if (!open) return;

        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);


    return (
        <div className="relative inline-block" ref={menuRef}>
            <button
                onClick={() => setOpen((v) => !v)}
                className="p-2 rounded-full bg-neutral-200 hover:bg-neutral-300 transition text-center cursor-pointer"
                title="Share"
            >
                <Share2 size={20} />
            </button>
            {open && (
                <div className="absolute z-10 mt-2 right-0 bg-white border rounded-lg shadow-lg p-4 flex flex-col items-center gap-3 min-w-[180px]">
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-3 py-1 rounded bg-neutral-100 hover:bg-neutral-200 transition text-sm w-full"
                    >
                        <Copy size={16} />
                        {copied ? "Copied!" : "Copy Link"}
                    </button>
                    <div className="flex gap-2 pt-2">
                        <FacebookShareButton url={url} title={title}>
                            <FacebookIcon size={32} round />
                        </FacebookShareButton>
                        <TwitterShareButton url={url} title={title}>
                            <TwitterIcon size={32} round />
                        </TwitterShareButton>
                        <WhatsappShareButton url={url} title={title}>
                            <WhatsappIcon size={32} round />
                        </WhatsappShareButton>
                    </div>
                </div>
            )}
        </div>
    );
}
