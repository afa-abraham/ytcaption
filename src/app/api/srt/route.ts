import { NextResponse } from 'next/server';

export async function GET() {
  const url = 'https://storage.googleapis.com/loveme-assets/captions/ALM-YT120.srt';

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch SRT file from GCS');
    
    const text = await res.text();

    return new NextResponse(text, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error('Error fetching SRT file:', err);
    return new NextResponse('Failed to load SRT file.', { status: 500 });
  }
}
