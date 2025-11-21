/**
 * Generates a random short code (6 characters, alphanumeric)
 * Character set: a-zA-Z0-9 (case-sensitive)
 * @returns A random 6-character string
 */
export function generateShortCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates a unique short code by checking the database
 * Will retry if a duplicate is found (with a maximum number of attempts)
 * @param checkExists - Function that checks if a shortCode exists in the database
 * @param maxAttempts - Maximum number of attempts to generate a unique code (default: 10)
 * @returns A unique short code
 */
export async function generateUniqueShortCode(
  checkExists: (code: string) => Promise<boolean>,
  maxAttempts: number = 10
): Promise<string> {
  let attempts = 0;
  let shortCode: string;

  do {
    shortCode = generateShortCode();
    attempts++;

    if (attempts >= maxAttempts) {
      throw new Error("Failed to generate unique short code after multiple attempts");
    }
  } while (await checkExists(shortCode));

  return shortCode;
}

/**
 * Formats a date to a human-readable string
 * @param date - Date object or date string
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

/**
 * Formats a date to include time
 * @param date - Date object or date string
 * @returns Formatted date string with time (e.g., "Jan 15, 2024 at 3:45 PM")
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

