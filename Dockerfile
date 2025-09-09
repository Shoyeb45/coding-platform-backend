# Use official Node.js LTS image
FROM node:22-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install dependencies (only production deps if NODE_ENV=production)
RUN npm install --omit=dev

# Copy the rest of the app
COPY . .

# generate prisma client
RUN npx prisma generate

RUN npm run build

# Expose the port (change if your app uses a different one)
EXPOSE 4000


# Start the server
CMD ["npm", "run", "start"]
