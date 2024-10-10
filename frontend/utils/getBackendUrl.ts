// utils/getBackendUrl.ts

export const getBackendUrl = (): string => {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    // Use the explicitly set backend URL (ALB DNS in production)
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  } else if (process.env.NEXT_PUBLIC_ENV === 'docker') {
    // Docker Compose environment
    return 'http://backend:5000/api';
  } else if (process.env.NODE_ENV === 'development') {
    // Local development
    return 'http://localhost:5000/api';
  } else {
    // Fallback for production if NEXT_PUBLIC_BACKEND_URL is not set
    return '/api';
  }
};
