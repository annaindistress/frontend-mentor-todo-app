import { defineConfig } from "vite";
import autoprefixer from 'autoprefixer';

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        autoprefixer
      ],
    },
  },
  base: '/frontend-mentor-todo-app/',
  root: 'src',
});
