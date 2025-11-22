import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /[shortCode]
 * Redirects to the original URL and increments click count
 * Root-level redirect for better UX (users visit yoursite.com/abc123)
 * Uses 308 (Permanent Redirect) to preserve the request method
 */

// Force dynamic rendering - prevents Next.js from trying to statically analyze this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  try {
    const { shortCode } = params;

    // Validate shortCode format (should be exactly 6 alphanumeric characters)
    // This automatically excludes reserved paths like "api", "dashboard", etc.
    const alphanumericPattern = /^[a-zA-Z0-9]{6}$/;
    if (!shortCode || typeof shortCode !== "string" || !alphanumericPattern.test(shortCode)) {
      // If not a valid shortCode format, let Next.js handle it (404 or other routes)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid short code format",
        },
        { status: 404 }
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

