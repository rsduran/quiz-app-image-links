export const getBackendUrl = () => {
  // Use the NEXT_PUBLIC_BACKEND_URL from the environment variable if available,
  // otherwise default to 'http://localhost:5000/api'
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';
};