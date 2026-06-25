# Student Scholarship Portal — Plan d'implémentation

> Document opérationnel pour développeurs et agents IA.  
> Pas de code — uniquement les instructions nécessaires pour construire la plateforme.  
> Dernière mise à jour : 25 juin 2026

**Documents liés :**
- [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) — contexte métier, contraintes, dépendances client
- [`Student Scholarship Portal Proposal (1) (1).md`](./Student%20Scholarship%20Portal%20Proposal%20(1)%20(1).md) — périmètre contractuel
- [`notes.txt`](./notes.txt) — détail fonctionnel
- [`scolarship_initial_call.txt`](./scolarship_initial_call.txt) — transcript appel client
- [`team call.txt`](./team%20call.txt) — transcript call d'équipe

---

## 1. Objectif du livrable

Remplacer le processus manuel (Excel + e-mails) par une application web centralisée permettant :

- aux **étudiants boursiers** de soumettre chaque semestre leur demande de paiement de scolarité, leurs documents et leur rapport de semestre ;
- aux **administrateurs** (bénévoles non techniques) de revoir, approuver, tracer les paiements et exporter les données.

**Ce n'est pas** un système de candidature : les étudiants ont **déjà** leur bourse.

---

## 2. Contraintes à respecter

| Contrainte | Détail |
|------------|--------|
| Budget Replit | ≤ 50 USD — développement local d'abord, Replit au déploiement |
| Délai interne | ~1 semaine |
| Stack cible | Application full-stack déployée sur **Replit** avec base intégrée |
| Pas d'Airtable | Base de données custom dans l'application (initialement Softr+Airtable envisagé, abandonné) |
| Développement | Cursor en local → migration Replit ; efficacité des prompts IA |
| UX | Simple, propre, **mobile-friendly** (étudiants sur téléphone) |
| Utilisateurs finaux | Bénévoles non techniques côté admin |
| Langue UI | **Anglais** (cliente anglophone) |
| Capacité | ~100–150 étudiants actifs max |
| Communication équipe | Captures d'écran dans le groupe WhatsApp à chaque jalon |

---

## 3. Architecture technique

### 3.1 Principe directeur

**Une seule base de code. Une seule chose change entre local et Replit : `DATABASE_URL`.**

La BDD Replit n'est en pratique **pas accessible depuis l'environnement local**. On développe donc entièrement en local, puis on applique le même schéma sur Replit via migrations.

### Stack cible (choix officiel)

| Couche | Choix |
|--------|-------|
| Framework | **Next.js 15** (App Router) |
| Langage | **TypeScript** |
| ORM | **Prisma** (migrations versionnées dans Git) |
| Base locale | **PostgreSQL 16** via Docker (`docker-compose.yml` à la racine) |
| Base production | PostgreSQL Replit (`DATABASE_URL` dans les secrets) |
| Auth | **Auth.js v5** (Credentials) — rôles `STUDENT` / `ADMIN` |
| UI | **Tailwind CSS + shadcn/ui** |
| Formulaires | React Hook Form + Zod |
| Export | xlsx ou csv-stringify |

### Environnement local — PostgreSQL (Docker)

> **Pas besoin de MCP Docker.** Les agents IA et développeurs utilisent le **terminal** (`docker compose`). Aucune configuration MCP supplémentaire n'est requise.

La BDD Replit n'est pas accessible depuis l'extérieur. Postgres tourne en local via Docker ; seul `DATABASE_URL` change au déploiement.

| Élément | Valeur |
|---------|--------|
| Fichier config | `docker-compose.yml` (racine du repo) |
| Conteneur | `scholarship-postgres` |
| Image | `postgres:16-alpine` |
| Port | `localhost:5432` |
| Base | `scholarship` |
| Utilisateur | `scholarship` |
| Mot de passe (dev) | `scholarship_dev` |
| Volume données | `scholarship_pgdata` (persistant) |

**`DATABASE_URL` locale** (voir aussi `.env.example`) :
```
postgresql://scholarship:scholarship_dev@localhost:5432/scholarship
```

**Commandes :**
```bash
# Démarrer Postgres (depuis la racine du projet)
docker compose up -d

# Vérifier le statut (healthy = prêt)
docker compose ps

# Arrêter
docker compose down

# Logs
docker compose logs -f postgres

# Tester la connexion
docker compose exec postgres pg_isready -U scholarship -d scholarship
```

**Notes :**
- `docker compose down` conserve les données (volume). `docker compose down -v` **supprime** les données.
- Copier `.env.example` → `.env.local` lors de l'initialisation Next.js + Prisma.
- Ne jamais committer `.env` / `.env.local` (voir `.gitignore`).

### 3.3 Environnements

```
┌─────────────────┐     migrations Git      ┌─────────────────┐
│  Local (Docker) │ ──────────────────────► │  Replit (prod)  │
│  Postgres       │     même schéma ORM     │  Postgres       │
│  Cursor dev     │     DATABASE_URL seul   │  déploiement    │
└─────────────────┘       change            └─────────────────┘
```

### 3.4 Setup local requis

1. **Docker** installé et daemon actif (`docker --version`, `docker compose version`)
2. Lancer Postgres : `docker compose up -d` (voir §3.2)
3. Fichier `.env.local` avec `DATABASE_URL` (copier depuis `.env.example`)
4. Commandes npm (à ajouter au `package.json` lors du scaffolding) :
   - `db:migrate` — `prisma migrate dev`
   - `db:seed` — données de test
   - `db:studio` — `prisma studio` (inspection optionnelle)
5. `.env.example` documenté dans le repo (sans secrets)
6. `.env.local` et secrets Replit **jamais** commités

### 3.5 Migration vers Replit (fin de projet)

1. Pousser le repo sur GitHub / importer dans Replit
2. Configurer `DATABASE_URL` dans les secrets Replit
3. Exécuter `migrate deploy` (équivalent prod)
4. Exécuter le script d'import client si tableur reçu
5. Configurer les variables d'environnement (auth secret, etc.)
6. Tester les parcours critiques en prod
7. Optionnel : connecter un sous-domaine DNS (nécessite accès client — pas bloquant au début)

**Aucune modification du code métier ne doit être nécessaire** — seulement config et données.

### 3.6 Ce qu'il faut éviter

- Replit DB key-value
- Schéma créé uniquement à la main dans l'UI Replit
- SQLite local si Replit utilise Postgres (écarts de dialecte)
- Logique métier couplée à l'environnement Replit
- Développement directement sur Replit (consomme le budget)

---

## 4. Modèle de données

### 4.1 Décisions de schéma (validées en équipe)

| Décision | Choix |
|----------|-------|
| Gestion des semestres | **Option A (MVP)** : `semester_label` en texte sur chaque soumission (ex. `Fall 2026`) — pas de table `UniversitySemesters` au départ |
| `semester_type` | **Non retenu** — inutile pour ce MVP |
| `UniversitySemesters` | **Hors scope MVP** — extensible plus tard via champ `university_semester_id` nullable si besoin |
| Comptes étudiants | Créés par l'**admin** — pas d'auto-inscription |
| Universités | Table de référence — **pas de login université** |
| Dates de semestre | Changent **chaque année académique** — ne pas figer en colonnes fixes sur `Universities` |
| Paiement réel | **Hors plateforme** — l'app trace le workflow, l'admin paie manuellement puis marque `Paid` |

### 4.2 Entités et champs

#### `Universities`
Table de référence — pas de compte utilisateur.

| Champ | Type | Notes |
|-------|------|-------|
| `id` | UUID / cuid | PK |
| `name` | string | Nom affiché, unique |
| `has_summer_semester` | boolean | Défaut `true` ; affiner quand infos client disponibles |
| `is_active` | boolean | Université partenaire active |
| `notes` | text | Optionnel — notes internes admin |
| `created_at` / `updated_at` | datetime | |

**Source initiale des données :** colonne `University` du spreadsheet client (valeurs uniques).

---

#### `Users`
Comptes d'authentification (étudiants et admins).

| Champ | Type | Notes |
|-------|------|-------|
| `id` | UUID / cuid | PK |
| `email` | string | Unique, utilisé pour login |
| `password_hash` | string | Jamais stocker le mot de passe en clair |
| `role` | enum | `STUDENT` \| `ADMIN` |
| `is_active` | boolean | `false` = accès désactivé (ex. diplômé) |
| `created_at` / `updated_at` | datetime | |

---

#### `Students`
Profil métier lié à un `User` de rôle `STUDENT` (relation 1:1).

| Champ | Type | Notes |
|-------|------|-------|
| `id` | UUID / cuid | PK |
| `user_id` | FK → Users | Unique |
| `student_id` | string | ID organisation (ex. matricule interne) |
| `first_name` | string | |
| `last_name` | string | |
| `phone` | string | Optionnel |
| `university_id` | FK → Universities | |
| `degree_program` | string | |
| `year_of_study` | string ou int | |
| `current_semester_label` | string | Info indicative sur le profil (ex. `Fall 2026`) |
| `gpa` | decimal | Dernière valeur connue ; aussi dans les rapports semestriels |
| `status` | enum | `ACTIVE` \| `GRADUATED` \| `INACTIVE` |
| `created_at` / `updated_at` | datetime | |

**Règle :** un étudiant `GRADUATED` ou `INACTIVE` → `User.is_active = false` mais **données historiques conservées**.

---

#### `BankInformation`
Coordonnées bancaires structurées — dernière version connue par étudiant.

| Champ | Type | Notes |
|-------|------|-------|
| `id` | UUID / cuid | PK |
| `student_id` | FK → Students | |
| `bank_account_name` | string | |
| `bank_account_number` | string | |
| `bank_name` | string | |
| `promptpay_number` | string | Optionnel — spécifique Thaïlande |
| `qr_payment_image_url` | string | Optionnel — chemin vers fichier uploadé |
| `last_updated_at` | datetime | |

**Note :** les infos bancaires sont aussi capturées dans chaque demande de paiement (snapshot au moment de la soumission).

---

#### `TuitionPaymentRequests`
Demande de paiement de scolarité — une par soumission semestrielle.

| Champ | Type | Notes |
|-------|------|-------|
| `id` | UUID / cuid | PK |
| `student_id` | FK → Students | |
| `semester_label` | string | **Option A** — ex. `Fall 2026`, `Spring 2027` |
| `amount_due` | decimal | |
| `due_date` | date | Échéance de la scolarité |
| `invoice_file_url` | string | Facture PDF ou image |
| `status` | enum | Voir §5.1 |
| `admin_notes` | text | Notes internes — **invisibles pour l'étudiant** |
| `submitted_at` | datetime | |
| `reviewed_at` | datetime | Optionnel |
| `approved_at` | datetime | Optionnel |
| `paid_at` | datetime | Optionnel |
| `created_at` / `updated_at` | datetime | |

**Snapshot bancaire au moment de la soumission** (champs dupliqués ou FK vers une table snapshot) :
- `bank_account_name`, `bank_account_number`, `bank_name`, `promptpay_number`, `qr_payment_image_url`

Raison : les coordonnées peuvent changer entre semestres ; l'admin doit voir ce qui a été soumis.

---

#### `SemesterReports`
Rapport de semestre — lié à la même soumission semestrielle que la demande de paiement.

| Champ | Type | Notes |
|-------|------|-------|
| `id` | UUID / cuid | PK |
| `student_id` | FK → Students | |
| `tuition_payment_request_id` | FK → TuitionPaymentRequests | 1:1 — soumission groupée |
| `semester_label` | string | Même valeur que la demande liée |
| **Académique** | | |
| `gpa` | decimal | |
| `credits_completed` | int | Optionnel |
| `passed_all_courses` | boolean | |
| `transcript_file_url` | string | Upload relevé de notes |
| **Bien-être (1–5)** | | |
| `wellbeing_physical` | int | 1–5 |
| `wellbeing_mental` | int | 1–5 |
| `wellbeing_financial` | int | 1–5 |
| `wellbeing_stress` | int | 1–5 |
| `wellbeing_confidence` | int | 1–5 |
| **Défis** | | |
| `challenges` | string[] / JSON | Valeurs : `financial`, `family`, `mental_health`, `housing`, `transportation`, `technology`, `health`, `other` |
| **Activités** | | |
| `activities` | string[] / JSON | Valeurs : `community_service`, `volunteering`, `leadership`, `internship`, `part_time_work`, `student_clubs` |
| **Réflexions** | | |
| `reflection_achievement` | text | Plus grande réussite du semestre |
| `reflection_challenge` | text | Plus grand défi et comment surmonté |
| `reflection_additional` | text | Ce que l'organisation devrait savoir |
| `submitted_at` | datetime | |
| `created_at` / `updated_at` | datetime | |

---

#### `PaymentHistory`
Historique des paiements effectués — enregistrement admin après virement réel.

| Champ | Type | Notes |
|-------|------|-------|
| `id` | UUID / cuid | PK |
| `student_id` | FK → Students | |
| `tuition_payment_request_id` | FK → TuitionPaymentRequests | |
| `semester_label` | string | |
| `amount_paid` | decimal | |
| `payment_status` | string | Ex. `PAID` |
| `payment_date` | date | |
| `internal_notes` | text | Optionnel |
| `created_at` | datetime | |

**Règle :** créer une entrée `PaymentHistory` quand l'admin passe une demande à `Paid`.

---

### 4.3 Relations résumées

```
Universities 1──* Students
Users 1──1 Students (role=STUDENT)
Users *──1 (role=ADMIN, pas de profil Student)
Students 1──* TuitionPaymentRequests
Students 1──* SemesterReports
Students 1──* PaymentHistory
Students 1──* BankInformation (dernière version)
TuitionPaymentRequests 1──1 SemesterReports
TuitionPaymentRequests 1──0..1 PaymentHistory
```

### 4.4 Extensibilité future (ne pas implémenter maintenant)

Prévoir dans le schéma sans développer :
- `university_semester_id` nullable sur `TuitionPaymentRequests` / `SemesterReports`
- Table `UniversitySemesters` si calendrier formel requis plus tard
- Champs pour contrats de bourse, notifications e-mail

---

## 5. Workflows métier

### 5.1 Statuts de demande de paiement

```
SUBMITTED → UNDER_REVIEW → APPROVED → PAID
```

| Statut | Qui déclenche | Signification |
|--------|---------------|---------------|
| `SUBMITTED` | Étudiant | Soumission reçue |
| `UNDER_REVIEW` | Admin | En cours d'examen |
| `APPROVED` | Admin | Demande validée, paiement à effectuer |
| `PAID` | Admin | Virement effectué hors plateforme |

**Transitions admin autorisées :**
- `SUBMITTED` → `UNDER_REVIEW`
- `UNDER_REVIEW` → `APPROVED`
- `APPROVED` → `PAID` (crée entrée `PaymentHistory`)

L'étudiant voit le statut en lecture seule.

### 5.2 Parcours étudiant (user flow)

1. Login
2. Tableau de bord : statut de la dernière demande + accès historique
3. Mise à jour du profil (champs éditables)
4. **Chaque semestre — soumission groupée :**
   - Partie paiement : montant, échéance, facture, infos bancaires, PromptPay, QR
   - Partie rapport : académique, bien-être, défis, activités, réflexions, relevé
5. Soumission → statut `SUBMITTED`
6. Consultation du suivi et de l'historique des semestres passés

**Règle UX :** formulaire unique par semestre (paiement + rapport ensemble), pas deux parcours séparés.

### 5.3 Parcours admin (user flow)

1. Login
2. Dashboard : vue d'ensemble (nombre d'étudiants, demandes en attente, etc.)
3. Liste étudiants : recherche par nom, filtre par université
4. Liste demandes : filtre par `semester_label`, filtre par statut
5. Détail d'une demande : profil étudiant, documents, rapport, infos bancaires
6. Actions : passer en revue, approuver, marquer payé, ajouter note interne
7. Gestion étudiants : créer compte, désactiver (diplômé), conserver historique
8. Export CSV / Excel

### 5.4 Permissions

| Action | Étudiant | Admin |
|--------|----------|-------|
| Voir son propre profil | ✅ | — |
| Voir tous les profils | ❌ | ✅ |
| Soumettre demande / rapport | ✅ (soi) | ❌ |
| Voir ses propres documents | ✅ | — |
| Voir tous les documents | ❌ | ✅ |
| Changer statut paiement | ❌ | ✅ |
| Notes internes | ❌ | ✅ |
| Export | ❌ | ✅ |
| Créer / désactiver comptes | ❌ | ✅ |

---

## 6. Fonctionnalités par module

### 6.1 Authentification

- [ ] Login email + mot de passe
- [ ] Deux rôles : `STUDENT`, `ADMIN`
- [ ] Middleware de protection des routes par rôle
- [ ] Étudiant : accès uniquement à ses propres données (vérification `student_id` côté serveur, pas seulement côté UI)
- [ ] Compte désactivé (`is_active = false`) : login refusé, données conservées
- [ ] Premier admin : créé via seed ou script one-shot
- [ ] Pas d'auto-inscription publique

### 6.2 Portail étudiant

- [ ] Page tableau de bord (statut actuel, raccourci nouvelle soumission, historique)
- [ ] Page profil (lecture / édition champs autorisés)
- [ ] Formulaire de soumission semestrielle :
  - [ ] Champs paiement (montant, date, facture, banque, PromptPay, QR)
  - [ ] Champs rapport académique
  - [ ] Enquête bien-être (5 questions, échelle 1–5)
  - [ ] Cases à cocher défis
  - [ ] Cases à cocher activités
  - [ ] 3 champs texte réflexion
  - [ ] Upload relevé de notes
- [ ] Champ `semester_label` : saisie texte ou liste suggérée (`Fall 2026`, `Spring 2026`, `Summer 2026`, `Winter 2026`) — **pas de validation de dates au MVP**
- [ ] Page historique : soumissions passées avec statuts
- [ ] Affichage mobile-first

### 6.3 Dashboard admin

- [ ] Tableau de bord KPIs simples : total étudiants actifs, demandes en attente, payées ce semestre
- [ ] Liste / recherche étudiants (nom, université, statut)
- [ ] Liste demandes avec filtres (semestre, statut, université)
- [ ] Page détail demande : tous les champs + prévisualisation / téléchargement fichiers
- [ ] Actions : `Under Review`, `Approve`, `Mark as Paid`
- [ ] Champ notes internes (non visible étudiant)
- [ ] CRUD étudiants : créer (email, mot de passe temporaire ou reset), modifier, désactiver
- [ ] CRUD universités : ajouter, désactiver (minimum viable)
- [ ] Export CSV et/ou Excel (étudiants, demandes, rapports — au minimum demandes)

### 6.4 Uploads de fichiers

Types acceptés :
- Factures : PDF, JPG, PNG
- Relevés de notes : PDF, JPG, PNG
- QR paiement : JPG, PNG

Exigences :
- [ ] Taille max définie (ex. 10 Mo)
- [ ] Stockage avec nom unique (pas de collision)
- [ ] URL / chemin enregistré en base
- [ ] Accès restreint : étudiant → ses fichiers ; admin → tous
- [ ] Prévisualisation ou lien de téléchargement côté admin

### 6.5 Import depuis spreadsheet client

- [ ] Script ou page admin d'import CSV / Excel
- [ ] Mapping colonnes configurable (le format exact du fichier client est inconnu à ce stade)
- [ ] Étapes :
  1. Extraire universités uniques → `Universities`
  2. Créer `Users` + `Students` pour chaque ligne
  3. Importer champs disponibles (GPA, téléphone, etc.)
  4. Rapport d'import : lignes OK, lignes en erreur, doublons
- [ ] Ne pas écraser les données existantes sans confirmation
- [ ] **Un seul fichier actif suffit** pour le lancement ; fichier diplômés optionnel plus tard

---

## 7. UI / UX

### 7.1 Principes

- Interface **en anglais**
- Cible : bénévoles non techniques (admin) et étudiants sur **mobile**
- Navigation simple, peu de niveaux de profondeur
- Formulaires longs découpés visuellement en sections (Paiement / Académique / Bien-être / Réflexions)
- Messages de confirmation après soumission
- États vides explicites (« No submissions yet for this semester »)

### 7.2 Branding

| Élément | MVP | Final |
|---------|-----|-------|
| Couleurs | Placeholder fuchsia `#FF00FF` + orange `#FF8C00` | Codes exacts client |
| Logo | Texte ou placeholder | Fichier client |
| Domaine | URL Replit par défaut | Sous-domaine client (quand DNS fourni) |

### 7.3 Textes des formulaires

Utiliser les libellés de la **proposition** et de `notes.txt` tels quels en anglais.  
Ne demander des libellés custom à la cliente que si elle le demande explicitement.

---

## 8. Données de test (seed)

Créer en local avant réception du tableur client :

- 1 admin (`admin@example.com`)
- 2 universités fictives (une avec été, une sans)
- 5–10 étudiants avec profils variés
- 2–3 demandes de paiement à différents statuts
- 1–2 rapports de semestre liés
- Fichiers uploadés factices ou placeholders

Objectif : tester tous les parcours sans données client.

---

## 9. Dépendances client

### 9.1 Bloquant pour la mise en production (pas pour le développement)

| Élément | Statut |
|---------|--------|
| Tableur étudiants actifs | À demander — couvre comptes + universités |
| Dates de semestre par université | **Non bloquant MVP** — Option A sans validation de dates |

### 9.2 Demande client recommandée (une seule, minimale)

> Votre tableur actuel des étudiants (Excel ou CSV).  
> Si les dates de semestre par université sont dans ce fichier ou ailleurs, merci de les inclure — sinon on vous le redemandera plus tard.

### 9.3 Ce que le spreadsheet couvrira probablement

| Donnée | Probable dans le fichier ? |
|--------|---------------------------|
| Étudiants (noms, emails, etc.) | ✅ Oui |
| Liste des universités | ✅ Probable (colonne `University`) |
| Dates de semestre structurées | ❓ Incertain — souvent absent |
| Diplômés | ❌ Fichier séparé selon la cliente |

### 9.4 Hypothèses de travail (en l'absence de réponse client)

- Textes formulaires = proposition
- `semester_label` = texte libre ou liste générique sans validation de dates
- Couleurs = placeholders
- Comptes étudiants = créés par admin ou import
- Pas de validation « fenêtre de soumission » par semestre

---

## 10. Plan de livraison par phases

### Phase 0 — Fondations (Jour 1)

- [x] Docker Compose PostgreSQL (`docker-compose.yml` — voir §3.2)
- [x] Initialiser le repo (Next.js 16 + TS + Tailwind v4 + shadcn, lint, `.env.example`)
- [x] ORM + première migration (toutes les tables §4)
- [x] Script seed de base
- [x] Auth (login, rôles, protection des routes via `proxy.ts`)
- [x] Layouts de base : shell étudiant / shell admin + dashboards
- [x] README technique : setup local, commandes, migration Replit

**Jalon WhatsApp :** capture login admin + login étudiant seed.

---

### Phase 1 — Profils & référentiels (Jour 2)

- [ ] CRUD `Universities` (admin)
- [ ] CRUD `Students` + création compte `User` associé (admin)
- [ ] Page profil étudiant (lecture / édition)
- [ ] Gestion statut étudiant (`ACTIVE` / `GRADUATED` / `INACTIVE`)
- [ ] Désactivation login sans suppression de données

**Jalon :** capture profil étudiant + liste admin des étudiants.

---

### Phase 2 — Soumission semestrielle (Jour 3)

- [ ] Formulaire groupé paiement + rapport
- [ ] Tous les champs §4 (`TuitionPaymentRequests`, `SemesterReports`)
- [ ] Uploads facture + relevé + QR
- [ ] Snapshot bancaire à la soumission
- [ ] Mise à jour `BankInformation` (dernière version)
- [ ] Statut initial `SUBMITTED`
- [ ] Page historique étudiant

**Jalon :** capture soumission complète côté étudiant.

---

### Phase 3 — Dashboard admin & workflow (Jour 4)

- [ ] Liste demandes + filtres (semestre, statut, université)
- [ ] Page détail avec documents et rapport
- [ ] Transitions de statut + horodatage
- [ ] Notes internes admin
- [ ] `Mark as Paid` → entrée `PaymentHistory`
- [ ] KPIs tableau de bord admin

**Jalon :** capture workflow Submitted → Paid.

---

### Phase 4 — Finition & déploiement (Jour 5)

- [ ] Export CSV / Excel
- [ ] Script import spreadsheet (si fichier reçu)
- [ ] Polish UI mobile + responsive
- [ ] Tests manuels parcours complets
- [ ] Déploiement Replit + `migrate deploy`
- [ ] Import données client si disponibles
- [ ] Vérification prod (auth, uploads, exports)
- [ ] Appliquer branding client si assets reçus

**Jalon :** URL Replit fonctionnelle partagée au groupe.

---

### Phase 5 — Handover (post-livraison)

- [ ] Call de formation avec la cliente (walkthrough admin + étudiant)
- [ ] Loom vidéo optionnel
- [ ] Documentation admin courte (comment approuver, marquer payé, exporter, ajouter étudiant)
- [ ] Config domaine DNS si accès fourni

---

## 11. Tests manuels (checklist)

### Étudiant
- [ ] Login avec compte actif
- [ ] Login refusé si compte désactivé
- [ ] Édition profil sauvegardée
- [ ] Soumission complète avec uploads
- [ ] Impossible d'accéder aux données d'un autre étudiant (test URL directe)
- [ ] Historique affiche les soumissions passées
- [ ] Affichage correct sur mobile (viewport étroit)

### Admin
- [ ] Login admin
- [ ] Recherche et filtres fonctionnels
- [ ] Détail demande : tous les champs et fichiers visibles
- [ ] Workflow statuts complet jusqu'à `Paid`
- [ ] Note interne non visible côté étudiant
- [ ] Création nouvel étudiant + premier login
- [ ] Désactivation étudiant diplômé
- [ ] Export téléchargeable et lisible

### Technique
- [ ] Migrations s'appliquent sur Replit sans modification de code
- [ ] Seed / import reproductibles
- [ ] Uploads accessibles en prod

---

## 12. Hors scope (ne pas implémenter)

- Accès donateur
- Accès université
- Candidature / admission à la bourse
- Paiement en ligne (Stripe, etc.) — le virement est manuel
- Contrats de bourse
- Rappels e-mail automatiques
- Notifications à l'approbation
- Table `UniversitySemesters` et validation de dates (MVP)
- Champ `semester_type`
- Auto-inscription publique

---

## 13. Risques connus et mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Format spreadsheet inconnu | Import à adapter | Script mapping flexible ; inspecter le fichier à réception |
| Colonnes inattendues dans le Excel | Champs manquants | Champs optionnels + itération import |
| Dates semestre absentes | Pas de validation calendrier | Option A — `semester_label` texte |
| Budget Replit dépassé | Coût | Dev 100 % local ; Replit en fin de semaine |
| Uploads en prod Replit | Fichiers perdus au redeploy | Vérifier persistance Replit ou storage externe dès Phase 2 |
| UX trop complexe pour bénévoles | Adoption faible | Tests avec parcours admin minimal ; libellés clairs |

---

## 14. Journal des décisions

| Date | Décision |
|------|----------|
| 2026-06-24 | Stack Replit (pas Softr/Airtable) — call client |
| 2026-06-24 | Pas de login donateur ni université |
| 2026-06-24 | Étudiants déjà boursiers — pas de candidature |
| 2026-06-25 | Dev Cursor/local d'abord, budget Replit ≤ 50 USD |
| 2026-06-25 | PostgreSQL Docker local → même migrations sur Replit |
| 2026-06-25 | Option A semestres : `semester_label` sur soumissions, pas de table calendrier MVP |
| 2026-06-25 | Pas de `semester_type` |
| 2026-06-25 | Un spreadsheet actif suffit pour le lancement |
| 2026-06-25 | Comptes étudiants créés par admin, pas d'auto-inscription |
| 2026-06-25 | UI en anglais ; placeholders fuchsia/orange |
| 2026-06-25 | Stack figée : Next.js 15 + Prisma + Auth.js + shadcn |
| 2026-06-25 | Postgres local via `docker-compose.yml` — pas de MCP Docker requis |
| 2026-06-25 | Scaffolding réel : Next.js **16** (dernière version stable via create-next-app), Tailwind **v4**, shadcn preset **Base UI** (polymorphisme via `render`, pas `asChild`) |
| 2026-06-25 | Prisma **6** retenu (Prisma 7 impose adaptateurs + `prisma.config.ts` — reporté) |
| 2026-06-25 | Auth.js v5 : `auth.config.ts` edge-safe + `auth.ts` Node ; protection des routes via `src/proxy.ts` (convention Next 16 remplaçant `middleware.ts`) |
| 2026-06-25 | `.env` unique (lu par Prisma CLI et Next.js) au lieu de `.env.local` |
| 2026-06-25 | Phase 0 livrée : login 2 rôles, dashboards, seed — testée de bout en bout |

---

## 15. Definition of Done

Le projet est considéré livré quand :

1. Un étudiant peut se connecter, soumettre une demande semestrielle complète et suivre son statut
2. Un admin peut revoir, approuver, marquer payé et exporter les données
3. Les comptes peuvent être créés / désactivés sans perte d'historique
4. L'application est déployée sur Replit et fonctionnelle
5. Les migrations s'appliquent sans changement de code entre local et prod
6. Une formation / walkthrough est planifiée ou livrée
7. Le groupe WhatsApp a reçu les jalons documentés pendant le développement

---

*Mettre à jour ce document si le schéma, le périmètre ou les décisions évoluent.*
