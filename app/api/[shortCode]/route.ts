//app\api\[shortCode]\route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/[shortCode]
 * Redirects to the original URL and increments click count
 * Uses 308 (Permanent Redirect) to preserve the request method
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  try {
    const { shortCode } = params;

    // Validate shortCode format (should be 6 alphanumeric characters)
    const alphanumericPattern = /^[a-zA-Z0-9]{6}$/;
    if (!shortCode || typeof shortCode !== "string" || !alphanumericPattern.test(shortCode)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid short code format",
        },
        { status: 400 }
      );
    }

    // Find URL by shortCode
    const url = await prisma.url.findUnique({
      where: {
        shortCode,
      },
    });

    // If URL not found, return 404
    if (!url) {
      return NextResponse.json(
        {
          success: false,
          error: "Short URL not found",
        },
        { status: 404 }
      );
    }

    // Increment click count (using atomic update)
    await prisma.url.update({
      where: {
        id: url.id,
      },
      data: {
        clickCount: {
          increment: 1,
        },
      },
    });

    // Redirect to original URL using 308 (Permanent Redirect)
    // This preserves the request method and is ideal for URL redirects
    return NextResponse.redirect(url.originalUrl, 308);

  } catch (error) {
    // Handle errors
    console.error("Error redirecting URL:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to redirect. Please try again.",
      },
      { status: 500 }
    );
  }
}

