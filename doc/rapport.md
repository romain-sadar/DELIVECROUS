# Module Livraison – Rapport Technique (DeliveCROUS)

## 1. Contexte du Module Livraison

Le module Livraison constitue le cœur opérationnel de la plateforme DeliveCROUS. Il gère l’ensemble des interactions critiques liées au processus de commande : gestion des utilisateurs, plats, points de livraison, création et suivi des commandes.

L’objectif est de garantir :

- une intégrité transactionnelle stricte (paiements, disponibilité plats, opérations atomiques),
- une cohérence forte entre les entités (relations User ↔ Commande, Commande ↔ Items, Items ↔ Plats),
- une traçabilité complète des opérations,
- une performance stable sous charges modérées.

Compte tenu de ces contraintes, une base relationnelle transactionnelle (PostgreSQL) s’impose.

## 2. Justification – Choix du Modèle Relationnel pour le Module Livraison

### 2.1. Enjeux du module

Le module Livraison implique :

- Transactions ACID: chaque commande implique plusieurs écritures (commande + items + calcul du total).
- Contraintes fortes : disponibilité des plats, activation des points, unicité (plat/commande).
- Relations multiples :

  - 1 User → N Commandes
  - 1 Commande → N Items
  - 1 Plat → N Items
  - 1 Point Livraison → N Commandes
- Validations strictes (prix, quantités, statuts).

### 2.2. Pourquoi PostgreSQL + Prisma (ORM TS) ?

- PostgreSQL garantit une intégrité transactionnelle ACID, indispensable pour les commandes, paiements et stocks.
- Modèle relationnel parfaitement adapté aux relations fortes (User ↔ Commande ↔ CommandeItems).
- Excellentes performances sur les jointures, requêtes filtrées et transactions complexes.
- Prisma apporte une API ORM moderne, typée et sécurisée, qui réduit les erreurs au runtime.
- Génération automatique des types → productivité accrue et cohérence entre code et schéma.
- Système de migrations structuré permettant de faire évoluer le modèle sans dette technique**.
- Très bon écosystème Node.js, compatible Docker, testing et CI/CD → stack fiable pour un module critique.


## 3. Schéma de Données – Module Livraison

### 3.1. Modèle ERD

TODO : Inserer diagramme entite relation

### 3.2. Modèle Prisma (implémentation réelle)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id           Int       @id @default(autoincrement())
  email        String    @unique
  passwordHash String
  firstName    String
  lastName     String
  role         String    @default("STUDENT")
  createdAt    DateTime  @default(now())
  commandes    Commande[]
}

model PointLivraison {
  id          Int         @id @default(autoincrement())
  nom         String
  typePoint   String      
  adresse     String?
  latitude    Float?
  longitude   Float?
  actif       Boolean     @default(true)
  createdAt   DateTime    @default(now())
  commandes   Commande[]
}

model Plat {
  id          Int             @id @default(autoincrement())
  libelle     String
  description String?
  prix        Decimal
  categorie   String?
  disponible  Boolean         @default(true)
  createdAt   DateTime        @default(now())
  items       CommandeItem[]
}

model Commande {
  id               Int             @id @default(autoincrement())
  userId           Int
  pointLivraisonId Int
  statut           String         
  total            Decimal
  modePaiement     String          
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt

  user           User           @relation(fields: [userId], references: [id])
  pointLivraison PointLivraison @relation(fields: [pointLivraisonId], references: [id])
  items          CommandeItem[]
}

model CommandeItem {
  id           Int       @id @default(autoincrement())
  commandeId   Int
  platId       Int
  quantite     Int
  prixUnitaire Decimal

  commande     Commande  @relation(fields: [commandeId], references: [id])
  plat         Plat      @relation(fields: [platId], references: [id])

  @@unique([commandeId, platId])
}
```


## 4. Architecture du Module (Côté Node.js)

Le module est structuré en architecture REST modulaire + services + validation.


### Exemple : Service de création de commande

```ts
return prisma.$transaction(async (tx) => {
  const user = await tx.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Utilisateur introuvable.");

  const point = await tx.pointLivraison.findUnique({ where: { id: pointLivraisonId } });
  if (!point?.actif) throw new Error("Point de livraison invalide ou inactif.");

  const plats = await tx.plat.findMany({
    where: { id: { in: items.map(i => i.plat_id) }, disponible: true }
  });

  if (plats.length !== items.length)
    throw new Error("Un ou plusieurs plats sont indisponibles.");

  let total = 0;
  const itemsData = items.map(item => {
    const plat = plats.find(p => p.id === item.plat_id)!;
    const prix = Number(plat.prix);
    total += prix * item.quantite;

    return {
      platId: item.plat_id,
      quantite: item.quantite,
      prixUnitaire: prix
    };
  });

  return tx.commande.create({
    data: {
      userId,
      pointLivraisonId,
      statut: "PENDING",
      modePaiement,
      total,
      items: { create: itemsData }
    },
    include: { items: true, pointLivraison: true }
  });
});
```

### API REST exposée (voir openapi pour plus de details)

= `POST /api/commandes` → création d’une commande
= `GET /api/commandes/user/:id` → historique utilisateur
= `GET /api/commandes/:id` → détail
= `GET /api/plats` → catalogue des plats
= `GET /api/points-livraison` → points actifs

## 5. Tests Automatisés

Nous avons mis en place des tests unitaires et d’intégration avec Vitest + Supertest.

### Types de tests :

= Validation des payloads
= Mock Prisma pour éviter une vraie base
= Tests API sur les routes
= Tests de services isolés

## 6. Sécurité – Authentification JWT

Le module intègre :

- hashage mot de passe (bcrypt)
- JWT Access token (15 min)
- JWT Refresh token (7 jours)
- Middleware `requireAuth`
- Tests sur les routes protégées

Justification :

- standard Node.js
- facile à étendre aux autres modules
- compatible microservices


## 7. Conclusion – Module Livraison

### Points forts :

- modèle relationnel parfaitement adapté
- intégrité transactionnelle robuste
- architecture modulaire claire
- API REST cohérente
- tests unitaires & integration fiables
- base idéale pour interconnexion avec les autres modules

### Limites :

- complexité du schéma
- forte dépendance aux transactions SQL
- scalabilité verticale (sharding plus difficile)

### Évolutions possibles :

* système de notifications en temps réel (WebSockets)
* caching Redis pour les plats et points
* file asynchrone pour traitement des commandes
* monitoring Prometheus + Grafana

