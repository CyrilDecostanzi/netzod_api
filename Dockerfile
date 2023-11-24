# Utilise la version spécifique de Node correspondant à celle que tu utilises
FROM node:18.17

# Crée un utilisateur 'appuser' avec un répertoire home
RUN groupadd -r appgroup && useradd -r -g appgroup -m appuser

# Définit le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Copie les fichiers de configuration de l'application
COPY package*.json ./

# Installe les dépendances de l'application
RUN npm install --legacy-peer-deps

# Copie le reste du code source de l'application dans le conteneur
COPY . .

# Change la propriété de /usr/src/app au nouvel utilisateur
RUN chown -R appuser:appgroup /usr/src/app

# Change l'utilisateur à 'appuser'
USER appuser

# Construit l'application pour la production
RUN npm run build

# Expose le port sur lequel l'application s'exécutera
EXPOSE 3001

# Définit la commande pour exécuter l'application
CMD ["node", "build/main"]
