import { isAxiosError } from "axios";

export function getApiErrorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (isAxiosError(err)) {
    return err.response?.data?.message ?? fallback;
  }
  return fallback;
}
