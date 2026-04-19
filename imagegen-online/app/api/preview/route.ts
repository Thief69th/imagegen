export async function POST(req: NextRequest) {
  try {
    const { url }: RequestBody = await req.json();

    if (!url || !isValidUrl(url)) {
      return NextResponse.json(
        { success: false, message: "Invalid URL" },
        { status: 400 }
      );
    }

    const platformData = detectPlatform(url);

    let image: string | null = null;

    // 🎯 Platform-based extraction
    if (YOUTUBE_PLATFORMS.includes(platformData.platform)) {
      const videoId = extractYouTubeThumbnail(url);

      if (videoId) {
        const thumbs = getYouTubeThumbnailUrls(videoId);
        image = await getValidImage(Object.values(thumbs));
      }
    }

    // 🌐 Universal fallback
    if (!image) {
      image = await extractImageFromUrl(url);
    }

    // 🔗 Fix relative URLs
    if (image && image.startsWith("/")) {
      image = new URL(image, url).href;
    }

    return NextResponse.json({
      success: true,
      data: {
        url,
        platform: platformData.platform,
        label: platformData.label,
        domain: platformData.domain,
        supportsAutoThumbnail: platformData.supportsAutoThumbnail,
        image,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
