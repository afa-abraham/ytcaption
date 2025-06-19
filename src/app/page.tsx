import YouTubeWithCaptions from "./components/YoutubeWithCaptions";

export default function Page() {
  return (
    <YouTubeWithCaptions
      videoId="OKVw7zSZ4S0"
      srtUrl="/api/srt"
      width={800}
      height={450}
      origin="http://localhost:3000"
    />
  );
}