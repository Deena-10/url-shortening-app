/**
 * Type definitions for the URL shortener application
 */

export interface Url {
  id: string;
  originalUrl: string;
  shortCode: string;
  clickCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUrlRequest {
  url: string;
}

export interface CreateUrlResponse {
  id: string;
  originalUrl: string;
  shortUrl: string;
  shortCode: string;
  clickCount: number;
  createdAt: Date;
}

export interface UrlResponse {
  id: string;
  originalUrl: string;
  shortUrl: string;
  shortCode: string;
  clickCount: number;
  createdAt: Date;
  updatedAt: Date;
}

