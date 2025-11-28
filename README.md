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

## Docker compose
docker-compose up --build

## Tester avec /health/
curl http://localhost:3000/health