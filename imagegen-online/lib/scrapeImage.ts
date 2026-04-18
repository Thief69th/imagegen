export async function extractImageFromUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const html = await res.text();

    const ogImage =
      html.match(/<meta property="og:image" content="(.*?)"/i)?.[1] ||
      html.match(/<meta name="twitter:image" content="(.*?)"/i)?.[1];

    return ogImage || null;
  } catch {
    return null;
  }
}
