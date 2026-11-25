// Pulls the human-readable reason out of an API error. All services return
// Spring ProblemDetail (message in `detail`); a few use `message`/`error`.
export function apiError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const d = (err as { response?: { data?: { detail?: string; message?: string; error?: string } } })?.response?.data
  return d?.detail || d?.message || d?.error || fallback
}
