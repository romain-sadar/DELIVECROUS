# Module Livraison - DELIVECROUS
### Romain SADAR et Erwan HAMZA

# Installation avec Docker:

## Fichier .env a la racine

PORT=3000
NODE_ENV=development

POSTGRES_USER=delivecrous
POSTGRES_PASSWORD=delivecrous
POSTGRES_DB=delivecrous_livraison

DATABASE_URL=postgresql://delivecrous:delivecrous@db:5432/delivecrous_livraison?schema=public

JWT_ACCESS_SECRET=super-secret-access-key-change-me
JWT_REFRESH_SECRET=super-secret-refresh-key-change-me
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

## Docker compose
docker-compose up --build

## Tester avec /health/
curl http://localhost:3000/health

## Documentation API

- JSON OpenAPI : `GET /api/openapi.json`
- Swagger UI : `GET /api/docs`