/**
 * Resolves an image path to a displayable URL.
 * - If the path is already an absolute URL (http/https), returns it as-is.
 * - If the path is a relative path (e.g. /api/images/...), returns it as-is.
 *   In production, both frontend and API are on the same origin.
 *   In local dev, Vite proxy forwards /api requests to the backend.
 * - If empty/null, returns empty string.
 */
export const resolveImageUrl = (path: string | undefined | null): string => {
    if (!path) return '';
    // Already a full URL or a relative path — return as-is
    return path;
};
