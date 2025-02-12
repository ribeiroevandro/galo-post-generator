import React from "react";

interface DownloadButtonProps {
    normalizedName: string;
    label?: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ normalizedName, label = "Download" }) => {
    const downloadUrl = `/api/downloadImage?file=${normalizedName}.png`;

    return (
        <a
            href={downloadUrl}
            download={normalizedName}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full"
        >
            {label}
        </a>
    );
};
