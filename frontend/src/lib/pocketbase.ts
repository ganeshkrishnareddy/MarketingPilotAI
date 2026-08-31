import PocketBase from 'pocketbase';

// Connect to the local PocketBase instance
export const pb = new PocketBase('http://127.0.0.1:8090');

// Disable auto-cancellation to avoid issues with concurrent requests in React Strict Mode
pb.autoCancellation(false);
