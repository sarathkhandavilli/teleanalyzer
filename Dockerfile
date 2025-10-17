# ==========================
# Build Stage
# ==========================
FROM node:22.17.0-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build production files
RUN npm run build

# Expose app port
EXPOSE 5173

# Start production server
CMD ["npm", "run", "dev"]
