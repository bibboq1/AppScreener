import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-700 bg-green-50'
  if (score >= 50) return 'text-yellow-700 bg-yellow-50'
  return 'text-red-700 bg-red-50'
}

export function getScoreBadgeColor(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}
