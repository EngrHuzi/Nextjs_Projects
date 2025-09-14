import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const options: RequestInit = {
    ...(init || {}),
    credentials: 'include',
  }

  let res = await fetch(input, options)
  if (res.status !== 401) return res

  // Attempt token refresh once
  const refreshRes = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  })

  if (!refreshRes.ok) return res

  // Retry original request with refreshed access token
  res = await fetch(input, options)
  return res
}
