// utils/getBackendUrl.ts

export const getBackendUrl = (): string => {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    // Use the explicitly set backend URL (useful for production)
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  } else if (process.env.NEXT_PUBLIC_ENV === 'docker') {
    // Docker Compose environment
    return 'http://backend:5000/api';
  } else {
    // Default to localhost for local development
    return 'http://localhost:5000/api';
  }
};