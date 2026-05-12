# DECISIONS.md — Kickbox

Format : ADR léger (Architectural Decision Record)
Statuts possibles : **Acceptée** | **Remplacée** | **Dépréciée**

---

## ADR-001 — Choix de la stack technique

**Date :** 2026-05-12
**Statut :** Acceptée

### Décision

Stack principale :
- **Framework** : Next.js 14 (App Router, TypeScript strict)
- **UI** : shadcn/ui + Tailwind CSS, mode sombre par défaut
- **Backend & DB** : Supabase (Postgres + Auth + Storage + RLS)
- **Source de données matchs** : football-data.org (REST API, free tier)
- **Gestion d'état serveur** : TanStack Query (React Query)
- **Validation** : Zod (schémas partagés client/serveur)
- **Forms** : react-hook-form + Zod
- **Dates** : date-fns (locale `fr`)
- **Icônes** : lucide-react
- **Déploiement** : Vercel

### Alternatives considérées

| Alternative | Raison du rejet |
|---|---|
| Remix à la place de Next.js | Next.js déjà maîtrisé par Nicolas (autre app), écosystème plus large, Vercel intégration native |
| Prisma + PostgreSQL auto-géré | Supabase offre Auth + Storage + RLS + client typé out-of-the-box, évite de gérer l'infrastructure |
| Redux / Zustand pour l'état | TanStack Query suffit pour l'état serveur (matchs, reviews) ; pas d'état client complexe en MVP |
| API-Football (payant) | football-data.org couvre les 12 compétitions cibles gratuitement ; l'abstraction via `MatchDataProvider` permet de switcher plus tard |
| Material UI / Chakra UI | shadcn/ui : composants non-opinionés, copiés dans le projet, 100% personnalisables, s'intègre parfaitement avec Tailwind |

### Raison

Stack choisie pour trois critères : (1) déjà connue de Nicolas → vélocité maximale, (2) free tier suffisant pour développer et lancer le MVP sans friction, (3) architecturée pour évoluer (abstraction provider, Capacitor pour mobile plus tard).

---
