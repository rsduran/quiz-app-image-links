export const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://k8s-threetie-mainlb-cf4fc9ddea-1985246971.ap-southeast-2.elb.amazonaws.com/api';
};