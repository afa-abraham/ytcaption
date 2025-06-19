"use client";

import { useEffect, useRef, useState } from "react";

type Caption = {
  start: number;
  end: number;
  text: string;
};

interface Props {
  videoId: string;
  width?: number;
  height?: number;
  srtUrl: string;
  origin?: string;
}

export default function YouTubeWithCaptions({
  videoId,
  width = 800,
  height = 450,
  srtUrl,
  origin = "http://localhost:3000",
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [currentCaption, setCurrentCaption] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const captionsContainerRef = useRef<HTMLDivElement>(null)
  const activeCaptionRef = useRef<HTMLElement>(null);

  const toSeconds = (timeStr: string) => {
    const [h, m, s] = timeStr.split(":");
    const [sec, ms] = s.split(",");
    return +h * 3600 + +m * 60 + +sec + +ms / 1000;
  };

const parseSRT = (srtText: string): Caption[] => {
  return srtText
    .replace(/\r\n/g, "\n") // Normalize all line breaks
    .trim()
    .split("\n\n") // Now works as expected
    .map((entry) => {
      const lines = entry.split("\n");
      if (lines.length >= 3) {
        const [start, end] = lines[1].split(" --> ");
        return {
          start: toSeconds(start),
          end: toSeconds(end),
          text: lines.slice(2).join("<br>"),
        };
      }
      return null;
    })
    .filter(Boolean) as Caption[];
};

useEffect(() => {
  if (activeCaptionRef.current && captionsContainerRef.current) {
    const container = captionsContainerRef.current
    const activeElement = activeCaptionRef.current; 
    const containerRect = container.getBoundingClientRect();
    const elementRect = activeElement.getBoundingClientRect();
    if (
      elementRect.top< containerRect.top ||
      elementRect.bottom > containerRect.bottom 
    ) {
      activeElement.scrollIntoView({behavior: "smooth", block: "nearest"});
    }
  }
}, [currentTime, currentCaption]);

useEffect(() => {
  const fetchSRT = async () => {
    try {
      const res = await fetch(srtUrl);
      const text = await res.text();
      const parsedCaptions = parseSRT(text);
      setCaptions(parsedCaptions);

      const startTimes = parsedCaptions.map((caption) => caption.start);
      console.log("All Start Times:", startTimes);
    } catch (err) {
      console.error("Failed to load captions:", err);
    }
  };

  fetchSRT();

    const interval = setInterval(() => {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "listening", id: 1 }),
        "*"
      );
    }, 500);
    interface YouTubePlayerInfo {
      currentTime?: number;
      [key: string]: unknown;
    }

    interface YouTubePlayerMessage {
      event?: string;
      info?: YouTubePlayerInfo;
      [key: string]: unknown;
    }

    const onMessage = (event: MessageEvent) => {
      try {
      const data: YouTubePlayerMessage = JSON.parse(event.data);
      const time = data?.info?.currentTime;
      if (typeof time === "number") {
        setCurrentTime(time);
      }
      } catch (e) {
        console.error("Error parsing message data:", e);
      }
    };

    window.addEventListener("message", onMessage);
    return () => {
      clearInterval(interval);
      window.removeEventListener("message", onMessage);
    };
  }, [ srtUrl]);

  useEffect(() => {
    if (typeof currentTime !== "number" || !Array.isArray(captions)) return;

    // Threshold: how close (in seconds) the current time must be to caption.start
    const threshold = 0.5; // adjust for sensitivity

    // Find the closest caption whose start time is near current time
    const match = captions.find(
      (c) =>
        Math.abs(currentTime - c.start) <= threshold &&
        currentTime >= c.start &&
        currentTime <= c.end
    );
    console.log(match, "Match")
    console.log("Current time:", currentTime);

    if (match) {
      setCurrentCaption(match.text);
    }
  }, [currentTime, captions]);


  return (<div className="" >
    <div style={{ width, margin: "auto" }}>
      <iframe
        ref={iframeRef}
        width={width}
        height={height}
        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${encodeURIComponent(
          origin
        )}&controls=1&rel=0`}
        frameBorder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen
        title="YouTube Player"
      />

    </div>
          <div
        className="caption"
        style={{
          display: "block",
          width: "100%",
          background: "rgba(0, 0, 0, 0.7)",
          color: "white",
          padding: "10px",
          textAlign: "center",
          fontSize: "16px",
        }}
        dangerouslySetInnerHTML={{ __html: currentCaption }}
      />
      </div>
  );
}
