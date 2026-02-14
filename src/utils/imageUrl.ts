/**
 * Resolves an image path to a full URL.
 * - If the path is already an absolute URL (http/https), returns it as-is.
 * - If the path is a relative path (e.g. /uploads/...), prepends the current server origin.
 * - If empty/null, returns empty string.
 */
export const resolveImageUrl = (path: string | undefined | null): string => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    // Build URL from current hostname + backend port
    return `http://${window.location.hostname}:3001${path}`;
};
