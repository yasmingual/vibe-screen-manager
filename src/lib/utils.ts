
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }
  
  return `${minutes}m ${remainingSeconds}s`;
}

// Extract video ID from YouTube URL
export function extractYoutubeVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Extract video ID from TikTok URL
export function extractTiktokVideoId(url: string): string | null {
  const regex = /tiktok\.com\/@[^\/]+\/video\/(\d+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Determine if a string is a valid URL
export function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch (e) {
    return false;
  }
}
