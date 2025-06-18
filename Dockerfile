FROM node:20 as builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=builder /app/dist/clothes_store_fe/browser /usr/share/nginx/html
EXPOSE 80
