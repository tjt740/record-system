import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    base: 'record-system/account-authorization-manager/',
    plugins: [react()],
});
