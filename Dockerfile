# Utilise la version spécifique de Node correspondant à celle que tu utilises
FROM node:18.17

# Définit le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Copie les fichiers de configuration de l'application
COPY package*.json ./

# Installe les dépendances de l'application
RUN npm install --legacy-peer-deps


# Copie le reste du code source de l'application dans le conteneur
COPY . .

# Crée un dossier pour les fichiers uploadés
RUN mkdir uploads

# Ouvrir les permissions pour le dossier uploads pour que l'application puisse écrire dedans
RUN chmod -R 777 uploads

# Construit l'application pour la production
RUN npm run build

# Expose le port sur lequel l'application s'exécutera
EXPOSE 3001

# Définit la commande pour exécuter l'application
CMD ["node", "build/main"]
