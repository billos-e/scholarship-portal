# Student Scholarship Portal — Contexte projet

> Mémoire partagée pour l'équipe TECHMA et les agents IA.  
> Dernière mise à jour : 26 juin 2026

---

## 1. Résumé exécutif

| Champ | Valeur |
|-------|--------|
| **Client** | Alexandra Bay (organisation à but non lucratif, Thaïlande) |
| **Produit** | Portail étudiant + dashboard admin pour boursiers |
| **Problème** | Processus manuel (Excel + e-mails) pour ~100–150 étudiants |
| **Budget client** | 1 500 USD |
| **Budget Replit (interne)** | ≤ 50 USD — développement prompt-efficient |
| **Délai interne** | ~1 semaine (call d'équipe) |
| **Délai contractuel** | < 20 jours après kickoff + paiement + infos nécessaires |
| **Plateforme** | **Netlify** (prod) + **Supabase** PostgreSQL ; Replit initialement prévu |
| **Développeur assigné** | Bill (Osee Bill AHOGNONVI) |
| **État du repo** | Phases 0–3 livrées sur `main` ; prod Netlify ; phase 4 (export, Blobs) en cours |

---

## 2. Contexte métier

### Ce que fait l'organisation
- Gère des **étudiants déjà boursiers** (pas de candidature en ligne).
- Paie la scolarité **chaque semestre**.
- Suit les **notes (GPA)**, les **demandes de paiement**, les **rapports de semestre** et le **bien-être** des étudiants.

### Utilisateurs
| Rôle | Accès |
|------|-------|
| **Étudiant** | Son profil, ses demandes, ses uploads, son historique |
| **Admin** (bénévoles, non techniques) | Tous les étudiants, revue, approbation, export |
| **Hors scope** | Donateurs, universités |

### Spécificités Thaïlande (paiements)
Trois modes à supporter :
1. Virement bancaire (compte)
2. **PromptPay** (numéro de téléphone)
3. **QR code** (upload d'image à scanner)

### Universités
- Plusieurs universités partenaires.
- Dates de semestre **variables** selon l'université (souvent 4 semestres/an ; été parfois obligatoire) — changent **chaque année académique**.
- Table `Universities` comme référence (pas de login).
- **MVP (Option A)** : `semester_label` en texte sur chaque soumission (`Fall 2026`) — pas de table calendrier ni `semester_type`.

### Cycle de vie étudiant
- Étudiants actifs → diplômés ou inactifs.
- Accès désactivable tout en **conservant l'historique**.

---

## 3. Périmètre fonctionnel (MVP)

### Portail étudiant
- Profil : nom, ID, e-mail, téléphone, université, programme, année, semestre, GPA, statut
- Demande de paiement de scolarité (par semestre) : montant, échéance, facture, infos bancaires, PromptPay, QR
- Rapport de semestre : académique, bien-être (1–5), défis, activités, réflexions
- Uploads : factures (PDF/image), relevés de notes
- Statuts de demande : `Submitted` → `Under Review` → `Approved` → `Paid`
- Historique des semestres passés

### Dashboard admin
- Liste / recherche (nom, université)
- Filtres (semestre, statut paiement)
- Revue documents, infos bancaires, rapports
- Approuver, marquer payé, notes internes
- Export Excel / CSV
- Gestion statut étudiant (actif / diplômé / inactif)

### Modules de données
- `Students`
- `Universities` (recommandé)
- `Semester Reports`
- `Tuition Payment Requests`
- `Bank Information`
- `Payment History`

### Livrables finaux
- Auth étudiant + admin
- Uploads fichiers
- Workflows paiement + rapport semestre
- Déploiement Replit
- Formation (call + Loom optionnel)

### Hors scope (évolutions futures)
- Contrats de bourse
- Rappels e-mail automatiques
- Notifications à l'approbation

---

## 4. Contraintes techniques & budget Replit

### Stratégie recommandée (économie de crédits)
1. **Développer d'abord dans Cursor** (local ou GitHub) — coût Replit = 0.
2. **PostgreSQL via Docker en local** — BDD Replit non accessible depuis l'extérieur.
3. **ORM + migrations versionnées** (Prisma ou Drizzle) — seul `DATABASE_URL` change sur Replit.
4. **Ne déployer sur Replit** qu'aux jalons : auth OK, CRUD étudiant, workflow paiement, admin de base.
5. Sur Replit : prompts **détaillés et ciblés** ; éviter les allers-retours vagues avec l'agent.
6. Utiliser des **données de test** (seed) jusqu'à réception du tableur client.
7. Branding (logo, couleurs exactes) en placeholders jusqu'à réception des assets.

### Stack cible
- **Next.js 15** + TypeScript + **Prisma** + **Auth.js** + Tailwind/shadcn
- Local : PostgreSQL 16 via **Docker** (`docker-compose.yml`) + ORM avec migrations
- Prod : **Netlify** + PostgreSQL **Supabase** (`DATABASE_URL` / `DIRECT_URL` dans les secrets du site)
- Auth : login séparé étudiant / admin ; comptes étudiants créés par admin
- Uploads : factures, relevés, images QR
- UI : responsive, simple, mobile-friendly, **anglais**

### Environnement local — Docker & PostgreSQL

**Pas besoin de MCP Docker** pour ce projet. Postgres est géré via le terminal avec `docker compose`. Les agents IA dans Cursor peuvent démarrer/arrêter le conteneur et lancer les migrations sans configuration MCP supplémentaire.

Fichiers à la racine du repo :
- `docker-compose.yml` — service Postgres
- `.env.example` — `DATABASE_URL` locale
- `.gitignore` — exclut `.env.local`, secrets, etc.

| Paramètre | Valeur (dev local) |
|-----------|-------------------|
| Conteneur | `scholarship-postgres` |
| URL | `postgresql://scholarship:scholarship_dev@localhost:5432/scholarship` |
| Port | `5432` |

```bash
docker compose up -d      # démarrer
docker compose ps         # statut (attendre "healthy")
docker compose down       # arrêter (données conservées)
```

Détails complets : [`IMPLEMENTATION_PLAN.md` §3.2](./IMPLEMENTATION_PLAN.md).

---

## 5. Ce qu'on peut faire MAINTENANT (sans la cliente)

| Priorité | Tâche | Dépend client ? |
|----------|-------|-----------------|
| P0 | Schéma DB + migrations / modèles | Non |
| P0 | Auth (rôles Student / Admin) | Non |
| P0 | Structure routes : portail étudiant vs admin | Non |
| P1 | CRUD profil étudiant (champs de la proposition) | Non |
| P1 | Formulaire demande de paiement + statuts workflow | Non |
| P1 | Formulaire rapport de semestre (tous les champs proposal) | Non |
| P1 | Upload fichiers (facture, relevé, QR) | Non |
| P2 | Dashboard admin : liste, filtres, actions approve/paid | Non |
| P2 | Export CSV/Excel | Non |
| P2 | UI responsive avec couleurs placeholder (fuchsia/orange approx.) | Non |
| P2 | Données seed (5–10 étudiants fictifs) | Non |
| P3 | Déploiement Replit + config env | Non (sauf domaine) |
| P3 | Import réel des étudiants | **Oui** — tableur |
| P3 | Logique semestre par université | **Oui** — dates |
| P3 | Branding final | **Oui** — logo + hex |
| P3 | Domaine personnalisé | **Oui** — accès DNS |

---

## 6. Dépendances client

> Source : section *Timeline* de `Student Scholarship Portal Proposal (1) (1).md`  
> Objectif : une seule demande groupée, minimale, au bon moment.

### Bloquant — ne pas livrer sans

| # | Élément | Pourquoi c'est bloquant | Quand demander |
|---|---------|-------------------------|----------------|
| B1 | **Tableur actuel des étudiants** | Impossible d'importer les vrais comptes, valider les champs réels et former l'admin sur des données réelles | **Dès maintenant** (1 e-mail) |
| B2 | **Structure des dates de semestre par université** | Les filtres, sélection de semestre et rapports seront faux sans calendrier par établissement | **Dès maintenant** (peut être dans le même e-mail que B1) |

### Important — n'empêche pas de coder, bloque la mise en prod / finition

| # | Élément | Pourquoi | Quand demander |
|---|---------|--------|----------------|
| I1 | **Codes couleur fuchsia + orange + logo** | Finition UI ; placeholders suffisent en dev | Semaine 1, avant démo client |
| I2 | **Libellés finaux des formulaires** | La proposition contient déjà le texte ; demander seulement si la cliente veut des formulations spécifiques | Optionnel — avec la démo |
| I3 | **Accès DNS / sous-domaine** | Uniquement pour URL personnalisée | **À la fin**, avant go-live |

### Non bloquant pour démarrer
- Enregistrement call client (déjà dans `scolarship_initial_call.txt`)
- Accès à une app existante (il n'y en a pas — greenfield)
- Paiement Fiverr / confirmation kickoff (côté Masdouk)

### Message client suggéré (une seule demande)

```
Subject: Two items to kick off your student portal

Hi Alexandra,

To start building your portal, we only need two things from you:

1. Your current student spreadsheet (Excel or CSV) — so we can 
   set up student accounts with the correct fields.
2. Semester start/end dates for each university you work with 
   (even a simple list is fine).

Logo, brand colors, and domain setup can wait until the core 
portal is ready for your review.

Thank you!
```

---

## 7. Décisions & hypothèses de travail

En l'absence de réponse client, on avance avec :

- **Textes des formulaires** : repris tels quels de la proposition
- **Semestres** : champ texte libre + liste générique (Fall / Spring / Summer / Winter) en attendant les dates réelles
- **Couleurs** : fuchsia `#FF00FF` et orange `#FF8C00` en placeholder
- **Langue UI** : anglais (cliente anglophone)
- **Création comptes étudiants** : par l'admin (pas d'auto-inscription) — les étudiants existent déjà
- **Capacité** : ~100–150 étudiants max

---

## 8. Équipe & process

| Personne | Rôle |
|----------|------|
| Masdouk Adelakoun | PM / client liaison |
| Bill | Développement |
| Bari | Suivi avancement |

### Communication
- Groupe WhatsApp dédié
- Partager captures d'écran à chaque jalon (pas attendre la fin)
- Documenter les décisions dans ce fichier

### Projet distinct
Le **lead hosting platform** (Integrity / Berberdo) est un **autre projet** — ne pas mélanger les contextes.

---

## 9. Références internes

| Fichier | Contenu |
|---------|---------|
| `docs/Student Scholarship Portal Proposal (1) (1).md` | Proposition contractuelle complète |
| `docs/notes.txt` | Notes fonctionnelles détaillées |
| `docs/scolarship_initial_call.txt` | Transcript appel client (24 juin) |
| `docs/team call.txt` | Transcript call d'équipe (assignation, contraintes) |
| `docs/PROJECT_CONTEXT.md` | Ce document |
| `docs/IMPLEMENTATION_PLAN.md` | Plan d'implémentation (schéma, phases, Docker, checklists) |
| `docker-compose.yml` | Postgres local (Docker) |
| `.env.example` | `DATABASE_URL` locale (modèle) |

### Points clés de l'appel client (24 juin)
- Pas de candidature : étudiants déjà boursiers
- GPA saisi par l'étudiant ; admin suit les paiements
- Excel actuel + e-mails = douleur principale
- Bénévoles non techniques = UX simple obligatoire
- Diplômés : garder données, couper l'accès

### Points clés du call d'équipe
- 1 semaine de délai
- ≤ 50 $ Replit
- Cursor d'abord → Replit ensuite
- Efficacité des prompts IA = critère d'évaluation
- Design propre et facile à utiliser

---

## 10. Jalons suggérés (semaine 1)

| Jour | Jalon |
|------|-------|
| J1 | Schéma DB, auth, layout étudiant/admin, seed data |
| J2 | Profil étudiant + demande de paiement (sans import réel) |
| J3 | Rapport de semestre + uploads |
| J4 | Dashboard admin (liste, filtres, approve/paid, notes) |
| J5 | Export CSV, polish UI, déploiement Replit, import si tableur reçu |

---

## 11. Journal des décisions

| Date | Décision | Auteur |
|------|----------|--------|
| 2026-06-25 | Création de ce document de contexte | Agent / Bill |
| 2026-06-25 | Dev Cursor-first pour préserver budget Replit | Équipe |
| 2026-06-25 | Demande client minimale : tableur (+ dates si dispo) | Équipe |
| 2026-06-25 | PostgreSQL Docker local, migrations vers Replit | Équipe |
| 2026-06-25 | Option A semestres : `semester_label`, pas de `semester_type` | Équipe |
| 2026-06-25 | Plan d'implémentation rédigé (`IMPLEMENTATION_PLAN.md`) | Équipe |
| 2026-06-25 | Postgres local opérationnel via Docker (`docker-compose.yml`) | Équipe |
| 2026-06-25 | Stack figée : Next.js 15 + Prisma + Auth.js + shadcn | Équipe |

---

*Mettre à jour ce fichier à chaque décision importante, jalon livré, ou nouvelle info client.*
