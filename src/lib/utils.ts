import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 86400) { // Less than 24 hours
    return "atualizado";
  } else if (diffInSeconds < 2592000) { // 30 days
    const days = Math.floor(diffInSeconds / 86400);
    return `há ${days} dia${days > 1 ? 's' : ''}`;
  } else {
    // Fallback to a simple date format for older dates
    return date.toLocaleDateString('pt-BR');
  }
}
