FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=http://localhost:3000
ARG VITE_ENQUIRY_API_URL
ARG VITE_LEAD_API_KEY
ARG VITE_WHATSAPP_NUMBER=919930413300

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ENQUIRY_API_URL=$VITE_ENQUIRY_API_URL
ENV VITE_LEAD_API_KEY=$VITE_LEAD_API_KEY
ENV VITE_WHATSAPP_NUMBER=$VITE_WHATSAPP_NUMBER

RUN npm run build

FROM nginx:1.27-alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
