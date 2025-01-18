# Use uma imagem base oficial do Node.js
FROM node:14

# Defina o diretório de trabalho para a pasta raiz do projeto
WORKDIR /app

# Copie o package.json e o package-lock.json da raiz do projeto
COPY /package*.json ./

# Instale as dependências da raiz do projeto
RUN npm install

# Defina o diretório de trabalho para a pasta do servidor
WORKDIR /app/server

# Copie o package.json e o package-lock.json da pasta do servidor
COPY server/package*.json ./

# Instale as dependências do servidor
RUN npm install

# Copie o restante do código do servidor
COPY server/ .

# Defina o diretório de trabalho para a pasta do cliente
WORKDIR /app

# Copie o restante do código do cliente
COPY . .
# Exponha as portas necessárias
EXPOSE 3000 5000

# Comando para rodar o servidor e o cliente
CMD ["sh", "-c", "npm start & cd server && ./start-server.sh"]