import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
    base: command === 'serve' ? '/' : '/FildraVision/',
    plugins: [react(), svgr()],
}));
