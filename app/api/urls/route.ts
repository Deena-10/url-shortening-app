import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/urls
 * Fetches all shortened URLs for the dashboard
 * Returns URLs sorted by creation date (newest first)
 * 
 * Response: { success: true, data: [ { id, originalUrl, shortUrl, shortCode, clickCount, createdAt } ] }
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch all URLs from database, sorted by createdAt descending (newest first)
    const urls = await prisma.url.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    // Generate full short URLs for each entry
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const urlsWithShortUrl = urls.map((url) => ({
      id: url.id,
      originalUrl: url.originalUrl,
      shortUrl: `${baseUrl}/${url.shortCode}`,
      shortCode: url.shortCode,
      clickCount: url.clickCount,
      createdAt: url.createdAt,
    }));

    // Return success response
    return NextResponse.json({
      success: true,
      data: urlsWithShortUrl,
      count: urls.length,
    });

  } catch (error) {
    console.error("Error fetching URLs:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch URLs. Please try again.",
      },
      { status: 500 }
    );
  }
}

