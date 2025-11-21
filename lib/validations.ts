import { z } from "zod";

/**
 * URL validation schema using Zod
 * Ensures the URL is valid and includes protocol
 */
export const urlSchema = z
  .string()
  .url("Please enter a valid URL")
  .min(1, "URL cannot be empty")
  .refine(
    (url) => url.startsWith("http://") || url.startsWith("https://"),
    {
      message: "URL must start with http:// or https://",
    }
  );

/**
 * Validate a URL string
 * @param url - The URL string to validate
 * @returns Object with success boolean and data/error
 */
export function validateUrl(url: string) {
  return urlSchema.safeParse(url);
}

/**
 * Normalize URL by ensuring it has a protocol
 * @param url - The URL to normalize
 * @returns Normalized URL with protocol
 */
export function normalizeUrl(url: string): string {
  // Remove whitespace
  url = url.trim();

  // If URL doesn't start with http:// or https://, add https://
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }

  return url;
}

