import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/urls/[id]
 * Deletes a shortened URL by ID
 * 
 * Response: { success: true, message: "URL deleted successfully" }
 */

// Force dynamic rendering - prevents Next.js from trying to statically analyze this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "URL ID is required",
        },
        { status: 400 }
      );
    }

    // Check if URL exists
    const url = await prisma.url.findUnique({
      where: {
        id,
      },
    });

    // If URL not found, return 404
    if (!url) {
      return NextResponse.json(
        {
          success: false,
          error: "URL not found",
        },
        { status: 404 }
      );
    }

    // Delete the URL
    await prisma.url.delete({
      where: {
        id,
      },
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: "URL deleted successfully",
      data: {
        id: url.id,
        shortCode: url.shortCode,
      },
    });

  } catch (error) {
    console.error("Error deleting URL:", error);

    // Handle Prisma errors
    if (error instanceof Error) {
      // Handle case where URL doesn't exist (though we check above)
      if (error.message.includes("Record to delete does not exist")) {
        return NextResponse.json(
          {
            success: false,
            error: "URL not found",
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete URL. Please try again.",
      },
      { status: 500 }
    );
  }
}

