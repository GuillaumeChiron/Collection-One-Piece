# Contexte projet — Collection One Piece

## Objectif
Site web permettant de suivre une collection personnelle de tomes One Piece
(possédé / manquant) et de la partager avec des proches, qui peuvent réserver
un tome manquant pour ne pas offrir de doublon à un anniversaire.

Le collectionneur (propriétaire) a accès à l'état possédé/manquant ainsi
qu'aux réservations en cours.

## Stack
- Vue 3 (Composition API) + TypeScript, scaffoldé via `pnpm create vue@latest`
- Pinia pour le state management
- Tailwind CSS v4 (plugin Vite natif `@tailwindcss/vite`, pas de config PostCSS séparée)
- Backend : Supabase (Postgres + Auth + Realtime)
- Gestionnaire de paquets : pnpm partout (attention aux build scripts pnpm à
  approuver via `pnpm approve-builds` pour la CLI Supabase)

## Backend Supabase — déjà en place
- Projet Supabase créé, lié en local via `pnpm supabase link --project-ref <ref>`
- Migrations appliquées :
  - `init_schema` : tables `tomes` et `reservations` + RLS + index unique
  - `seed_tomes` : peuplement des 112 tomes (numéros 1 à 112, `possede = false`)
  - `enable_realtime` : Realtime activé sur `tomes` et `reservations`

### Schéma
```sql
create table tomes (
  id serial primary key,
  numero integer unique not null,
  titre text,
  possede boolean not null default false,
  updated_at timestamptz not null default now()
);

create table reservations (
  id uuid primary key default gen_random_uuid(),
  tome_id integer not null references tomes(id) on delete cascade,
  guest_name text not null,
  guest_token uuid not null,
  status text not null default 'active' check (status in ('active','cancelled')),
  created_at timestamptz not null default now()
);

-- Une seule réservation active possible par tome (gère la concurrence nativement)
create unique index one_active_reservation_per_tome
  on reservations (tome_id)
  where status = 'active';
```

### RLS (résumé)
- `tomes` : lecture publique, écriture réservée à l'utilisateur authentifié (le
  collectionneur, via `auth.users` — pas de table `users` custom).
- `reservations` : lecture publique, création libre (invités anonymes),
  annulation basée sur un `guest_token` généré côté navigateur de l'invité
  (pas une vraie sécurité, juste un identifiant local — acceptable pour un
  usage familial).

### Pas de table `users` custom
Volontaire : le collectionneur utilise `auth.users` (Supabase Auth intégré).
Les invités n'ont pas de compte, juste un `guest_token` + `guest_name` stockés
directement sur la ligne de réservation. Si besoin plus tard d'un profil
personnalisé, créer une table `profiles` liée à `auth.users(id)` plutôt que de
modifier `auth.users` directement.

## Variables d'environnement (`.env`, jamais commité)
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...   # clé "publishable" (sb_publishable_...) ou anon legacy
```
Ne jamais utiliser la clé `secret`/`service_role` côté frontend.

## Frontend — déjà en place
1. `src/services/supabase.ts` : client Supabase (`createClient`)
2. Types TypeScript (`src/types/`) : `Tome`, `Reservation`
3. Stores Pinia (`src/stores/`) :
   - `collectionStore.ts` : fetch des tomes, `setPossede`, compteur/progress, sync Realtime
   - `reservationStore.ts` : fetch/réservation/annulation via `guest_token` (localStorage), sync Realtime
   - `authStore.ts` : session Supabase Auth (login/logout du collectionneur, non prévu initialement mais nécessaire pour protéger l'admin)
4. Composants Vue (`src/components/`) :
   - `ProgressHeader` (compteur, barre de progression)
   - `CollectionGrid` / `TomeCard`
   - `ReservationModal` (prénom + confirmation)
   - `AdminPanel` (formulaire de login + vue collectionneur une fois authentifié)
5. Vues séparées (`src/views/`) : `GuestView.vue` (route `/`, public) et `CollectorView.vue`
   (route `/admin`, protection faite dans `AdminPanel` via `authStore.isAuthenticated`)
6. Router configuré avec les deux routes ci-dessus

## Prochaines étapes (pas encore faites)
1. Déploiement : Vercel ou Netlify (+ configurer `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` sur la plateforme)
2. Tester le flux complet dans un navigateur (login collectionneur, réservation invité, sync Realtime entre deux onglets)
3. Vérifier que `src/__tests__/App.spec.ts` couvre bien le contenu actuel de `App.vue`

## Conventions à respecter
- Toujours créer une nouvelle migration Supabase pour tout changement de
  schéma (`pnpm supabase migration new <nom>` puis `pnpm supabase db push`),
  ne jamais éditer une migration déjà appliquée.
- Les 3 lignes ci-dessus permettent d'ajouter le tome 113 plus tard via
  `insert into tomes (numero, possede) values (113, false);` dans une nouvelle
  migration, sans toucher aux précédentes.
