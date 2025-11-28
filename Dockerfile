FROM node:22-alpine

# 1. Répertoire de travail
WORKDIR /app

# 2. Copier les fichiers de dépendances + Prisma schema
COPY package.json package-lock.json ./
COPY prisma ./prisma

# 3. Installer les dépendances (déclenche aussi "postinstall" -> prisma generate)
RUN npm install

# 4. Copier le reste du code (TS, config)
COPY tsconfig.json ./
COPY src ./src

# 5. Builder le projet TypeScript
RUN npm run build

# 6. Commande de démarrage
CMD ["node", "dist/server.js"]
