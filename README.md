# Kickbox

> Le Letterboxd du football. Note les matchs que tu regardes, écris tes reviews, suis tes amis.

## Stack

- **Framework** : Next.js (App Router, TypeScript)
- **UI** : shadcn/ui + Tailwind CSS (mode sombre par défaut)
- **Backend & DB** : Supabase (Postgres + Auth + RLS)
- **Données matchs** : football-data.org
- **État serveur** : TanStack Query
- **Déploiement** : Vercel

## Lancer en local

```bash
# 1. Copier les variables d'environnement
cp .env.local.example .env.local
# Remplir .env.local avec tes clés

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de dev
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Roadmap

- **Phase 0** ✅ Setup (Next.js, shadcn, Supabase, tooling)
- **Phase 1** Auth + DB + Sync football-data.org
- **Phase 2** Browse matches
- **Phase 3** Log a match
- **Phase 4** Social (MVP complet)
- **Phase 5+** Listes, likes, tags, stats, Capacitor

## Décisions techniques

Voir [`DECISIONS.md`](./DECISIONS.md).
