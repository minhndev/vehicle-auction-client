/**
 * axiosInstance.ts
 * Alias for axiosClient — exposes the fully configured Axios instance
 * (with 401 auto-refresh logic) under the name recommended by FRONTEND_INTEGRATION.md §18.
 *
 * Import either `axiosClient` or `axiosInstance` — they are the same object.
 */
export { default as axiosInstance } from './axiosClient';
export { default as api } from './axiosClient';
export { default } from './axiosClient';
