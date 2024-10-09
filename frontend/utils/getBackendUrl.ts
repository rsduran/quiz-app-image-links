export const getBackendUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    // In development, use localhost
    return 'http://localhost:5000/api';
  } else {
    // In production, use relative URL
    return '/api';
  }
};
