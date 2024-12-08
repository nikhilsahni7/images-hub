"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { downloadImage } from "@/lib/download";
import { cn } from "@/lib/utils";

interface DownloadTimerProps {
  imageUrl: string;
  filename: string;
  className?: string;
}

export function DownloadTimer({
  imageUrl,
  filename,
  className,
}: DownloadTimerProps) {
  const [timeLeft, setTimeLeft] = React.useState(10);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [downloadStarted, setDownloadStarted] = React.useState(false);
  const progress = ((10 - timeLeft) / 10) * 100;

  React.useEffect(() => {
    if (downloadStarted && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (downloadStarted && timeLeft === 0) {
      handleDownload();
    }
  }, [timeLeft, downloadStarted]);

  const handleDownload = async () => {
    setIsDownloading(true);
    await downloadImage(imageUrl, filename);
    setIsDownloading(false);
    setDownloadStarted(false);
    setTimeLeft(10);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Button
        className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
        onClick={() => setDownloadStarted(true)}
        disabled={downloadStarted || isDownloading}
      >
        {isDownloading ? (
          "Downloading..."
        ) : downloadStarted ? (
          `Starting download in ${timeLeft}s`
        ) : (
          <>
            <Download className="h-5 w-5" />
            Download Free
          </>
        )}
      </Button>
      {downloadStarted && <Progress value={progress} className="h-2 w-full" />}
    </div>
  );
}