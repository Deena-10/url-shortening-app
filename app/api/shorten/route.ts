import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateUrl, normalizeUrl } from "@/lib/validations";
import { generateUniqueShortCode } from "@/lib/utils";

/**
 * POST /api/shorten
 * Creates a new shortened URL
 * Public endpoint - no authentication required
 * 
 * Request body: { url: string }
 * Response: { success: true, data: { id, originalUrl, shortUrl, shortCode, clickCount, createdAt } }
 */

// Force dynamic rendering - prevents Next.js from trying to statically analyze this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { url } = body;

    // Validate input
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "URL is required and must be a string",
        },
        { status: 400 }
      );
    }

    // Normalize URL (add protocol if missing)
    const normalizedUrl = normalizeUrl(url);

    // Validate URL format
    const validation = validateUrl(normalizedUrl);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0].message || "Invalid URL format",
        },
        { status: 400 }
      );
    }

    // Generate unique short code
    const shortCode = await generateUniqueShortCode(async (code: string) => {
      const exists = await prisma.url.findUnique({
        where: { shortCode: code },
      });
      return !!exists;
    });

    // Save to Prisma
    const newUrl = await prisma.url.create({
      data: {
        originalUrl: normalizedUrl,
        shortCode,
      },
    });

    // Generate full short URL
    const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/${newUrl.shortCode}`;

    // Return JSON response
    return NextResponse.json(
      {
        success: true,
        data: {
          id: newUrl.id,
          originalUrl: newUrl.originalUrl,
          shortUrl,
          shortCode: newUrl.shortCode,
          clickCount: newUrl.clickCount,
          createdAt: newUrl.createdAt,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating shortened URL:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create shortened URL. Please try again.",
      },
      { status: 500 }
    );
  }
}
