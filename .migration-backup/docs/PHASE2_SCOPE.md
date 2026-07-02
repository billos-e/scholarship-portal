# Phase 2 — Périmètre des évolutions

> Document de cadrage. Pas de code — uniquement les décisions et modifications à appliquer.  
> Dernière mise à jour : 29 juin 2026

**Documents liés :**
- [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) — décisions MVP (Option A semestres)
- [`masdouk_comments`](./masdouk_comments) — retours de recette
- [`scolarship_initial_call.txt`](./scolarship_initial_call.txt) — besoin métier initial
- [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) — contexte client

---

## 1. Contexte

Le MVP a livré les fonctionnalités cœur (soumissions, workflow admin, exports bruts). Les retours de recette et le besoin métier initial montrent des écarts sur la gestion admin, les vues détail et la structuration des semestres par université.

L’Option A (`semester_label` texte libre) reste valide pour l’historique existant. La phase 2 introduit une table de calendrier sans casser les données déjà soumises.

---

## 2. Gestion des semestres par université

### 2.1 Nouvelle table `UniversitySemesters`

Une ligne = un semestre précis d’une université pour une année académique donnée. Les dates varient chaque année : on crée de nouvelles lignes, on n’écrase pas les anciennes.

| Colonne | Rôle |
|---------|------|
| `id` | Identifiant |
| `university_id` | Université concernée |
| `academic_year` | Année de référence (ex. `2026` ou `2025-2026`) |
| `term_code` | Type de période : `FALL`, `SPRING`, `SUMMER`, `WINTER` |
| `label` | Libellé affiché (ex. `Fall 2026`) |
| `start_date` | Début du semestre |
| `end_date` | Fin du semestre |
| `is_active` | Semestre utilisable ou archivé |
| `created_at` / `updated_at` | Audit |

**Hors scope de cette table :** `submission_open_date`, `submission_close_date` — pas nécessaires pour structurer les semestres ; à envisager seulement si blocage automatique des soumissions hors période est demandé.

### 2.2 Lien avec les soumissions existantes

- Ajouter `university_semester_id` (nullable) sur `TuitionPaymentRequests` et `SemesterReports` — champ déjà prévu dans le schéma MVP.
- Conserver `semester_label` sur les soumissions pour l’historique et les exports.
- Les nouvelles soumissions sélectionnent un semestre parmi ceux de l’université de l’étudiant.

### 2.3 Règles métier

- Chaque université peut avoir un nombre variable de semestres par année (certaines sans été — cohérent avec `has_summer_semester` sur `Universities`).
- L’admin crée et gère les semestres par université (CRUD).
- L’étudiant ne saisit plus un libellé libre : il choisit dans la liste des semestres actifs de son université.
- Les anciennes soumissions sans `university_semester_id` restent consultables via `semester_label`.

### 2.4 Dépendance client

Dates de semestre par université — action item du call initial, toujours en attente. Nécessaire pour alimenter la table correctement.

---

## 3. Modifications admin et UX (retours recette)

### 3.1 Mode consultation vs édition — Étudiants

**Problème :** cliquer sur un étudiant ouvre directement l’édition.

**À faire :**
- Page détail en lecture seule (profil, banque, historique des demandes, statut).
- Action explicite « Edit » pour passer en mode édition.
- Même logique sur le lien depuis la liste : consultation d’abord, édition sur demande.

### 3.2 Vue détail — Universités

**Problème :** seulement nom, compteur d’étudiants et édition en dialog ; pas de vue détail.

**À faire :**
- Page détail université (infos, `has_summer_semester`, notes, statut).
- Liste des étudiants rattachés à cette université.
- Liste des semestres configurés pour cette université.
- Actions : éditer, archiver/désactiver.

### 3.3 Archivage / suppression

**Problème :** pas d’action delete ou archive visible pour étudiants et universités.

**À faire :**
- Étudiants : archiver via statut `INACTIVE` / `GRADUATED` (déjà partiellement en place) + action explicite dans l’UI ; pas de suppression physique (historique conservé).
- Universités : désactiver (`is_active = false`) ; pas de suppression si des étudiants y sont rattachés.

### 3.4 Exports filtrés

**Problème :** export global sans filtre (période, semestre, université, statut).

**À faire :**
- Filtres sur la page Export : semestre, université, statut, plage de dates.
- Bouton Export sur les listes admin (étudiants, demandes) reprenant les filtres actifs de la page.
- L’export reflète le jeu de données filtré, pas tout le dataset.

### 3.5 Filtres et recherche

**Problème :** filtre étudiants signalé non fonctionnel.

**À faire :**
- Vérifier et corriger le comportement des filtres sur la liste étudiants.
- S’assurer que recherche, université et statut fonctionnent de bout en bout.

### 3.6 Champs étudiants et universités

**Problème :** profil université trop minimal ; vérifier exhaustivité des champs étudiants vs spreadsheet client.

**À faire :**
- Enrichir le profil université (adresse, ville, pays, site web — à valider avec la cliente).
- Comparer les champs actuels du profil étudiant avec le spreadsheet client ; ajouter les champs manquants identifiés.

### 3.7 Design

**Constat :** acceptable pour le MVP, à retravailler une fois la fonctionnalité stabilisée.

**À faire :** polish UI après livraison des points fonctionnels ci-dessus ; appliquer les couleurs client (fuchsia / orange) si codes reçus.

---

## 4. Hors scope phase 2

| Élément | Raison |
|---------|--------|
| Autres types de requêtes (hors paiement de scolarité) | Non dans le call ni la proposition ; extension possible, à valider avec la cliente |
| Accès donateur / université | Exclu du périmètre contractuel |
| Fenêtres de soumission automatiques (`submission_open/close`) | Non demandé ; reporté |
| Paiement en ligne | Hors scope — virement manuel |

---

## 5. Ordre de priorité suggéré

1. Semestres par université (table + CRUD admin + sélection étudiant)
2. Vue détail étudiant (lecture seule + edit séparé)
3. Vue détail université (étudiants + semestres)
4. Exports filtrés
5. Correction filtres liste étudiants
6. Archivage explicite dans l’UI
7. Champs manquants (audit spreadsheet)
8. Design / branding

---

## 6. Critères de done phase 2

- [ ] Admin peut créer et gérer les semestres par université avec dates
- [ ] Étudiant sélectionne un semestre valide pour son université à la soumission
- [ ] Clic sur un étudiant → vue consultation ; edit sur action explicite
- [ ] Page détail université avec étudiants et semestres
- [ ] Export filtré (page dédiée + depuis les listes)
- [ ] Filtres liste étudiants fonctionnels
- [ ] Actions archiver/désactiver visibles et cohérentes
- [ ] Champs profil alignés avec le spreadsheet client (si reçu)
