// Replace with your actual EC2 IP or domain in production
// export const API_BASE_URL = 'http://YOUR_EC2_IP/api/v1';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api/v1';
export const MAX_FILE_SIZE_MB = 2;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const MAX_ROOMS = 2;
export const MAX_DOCS_PER_ROOM = 3;

export const EMOJI_LIST = ['📁', '🚀', '💡', '🤖', '📚', '🧠', '🔬', '💼', '📝', '🔥'];

export const POLL_INTERVAL_MS = 3000;