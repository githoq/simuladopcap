import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // Carrega variáveis do .env (sem prefixo VITE_ — ficam no servidor)
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: "dist",
      sourcemap: false,
    },
    server: {
      port: 3000,
      // Proxy local de desenvolvimento — simula o serverless function
      // Redireciona /api/chat → handler Node.js inline
      // (Em produção, o Vercel usa o arquivo api/chat.ts diretamente)
    },
    // Expõe APENAS variáveis VITE_ para o frontend (seguro)
    // GEMINI_API_KEY NÃO tem prefixo VITE_ → não vai para o bundle
    envPrefix: "VITE_",
  };
});
