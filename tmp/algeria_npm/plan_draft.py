# Refonte Fonctionnelle: Édition de Cartes, Table Patients & Collisions en Temps Réel

This plan addresses a structural shift in how users interact with patients, maps, and duplicates in the registry.

## User Review Required

> [!IMPORTANT]
> This plan will significantly alter existing views, especially the `ConsolidationDuplicates` logic and the visual layout of `PatientList`. Please review the backend API additions and the real-time collision flow.

## Proposed Changes

---

### Phase 1: Interactive Map Management (Update Flow)
To allow editing of an existing map directly from the "Gestion des Territoires" panel.

#### [MODIFY] `frontend/src/components/MapManager.tsx`
- **UI Update**: Make clicking a map card load its details (`name` and `wilaya_codes`) into the right panel editor. 
- **State Addition**: Add an `editMapId` state. Change the "Enregistrer la Carte" button text to "Mettre à jour la Carte" when editing.
- **Save Event**: Update `handleSave` to issue an `axios.put/patch` to `/api/personalized-maps/${editMapId}/` if we are in edit mode, otherwise fallback to `post`. Add an "Annuler l'édition" button.

---

### Phase 2: Patient List Redesign & Export/Import
Transforming the grid of patient cards into a structured data table and hooking up CSV capabilities.

#### [MODIFY] `frontend/src/components/PatientList.tsx`
- **Layout Shift**: Replace the morphing grid cards with a structured HTML table (with columns for NID, Nom Prénom, Sexe, Age/Date, Topo, Status, Actions).
- **Export Function**: Wire the "Exporter CSV" button. We will generate the CSV directly on the frontend using the current `filteredPatients` or fetch an export feed from the backend.
- **Import Function**: Add an "Importer CSV" button that opens a file picker.

#### [NEW] `registry/views.py` (Backend APIs)
- **`bulk_import`** endpoint: Parses an uploaded CSV of patients. Before persisting to the database, it runs collision checks. Any conflicting records are collected and returned to the frontend.
- **`export_csv`** endpoint: Optional (if frontend-side generation is not desired). Streams the patient queryset as a CSV file.

---

### Phase 3: Real-Time Collision (Doublons) Detection
Instead of finding duplicates post-creation on a separate page, we will detect collisions *proactively* during the `PatientForm` save event and during bulk imports.

#### [NEW] `registry/views.py` (Backend Check Endpoint)
- **`check_collision`**: A new Action on the `PatientViewSet` (or separate endpoint) that receives patient JSON from the frontend and evaluates it against existing records (checking exact NID match, or partial Name/Soundex matches).
- Returns `{"has_collision": boolean, "matches": [...]}`.

#### [MODIFY] `frontend/src/components/PatientForm.tsx`
- **Interceptive Save**: Inside `handleSubmit`, invoke `/api/patients/check_collision/` before calling `/api/patients/` (create).
- **Collision Dialog**: If collisions exist, pop up a Modal showing the proposed patient next to the existing matches.
- **Action 'Fusionner'**: Sends a request to merge the two records (calls `PUT /api/patients/:id` with the merged fields, and generates a `MergedRecord` log).
- **Action 'Continuer quand même'**: Appends a `?force=true` query param (or `force_save: true` payload) to forcefully POST the record despite similarity.

#### [MODIFY] Bulk Import Dialog (Future Subcomponent)
- If a CSV import returns an array of collisions, render a bulk resolution grid so the user can fix/force everything before sending the final confirmation back to the backend.

## Open Questions
> [!WARNING]
> Regarding the "Fusionner" (Merge) action: Should Fusion simply overwrite the old record with the new one, or do you want a detailed field-by-field selector (e.g., choose which Name to keep, which Phone to keep)? A simple "Update Existing Record" is fastest to build.

## Verification Plan

### Automated Tests
- Trigger `POST /api/patients/check_collision/` with a dummy JSON to confirm Soundex triggers correctly.
- Test `PATCH /api/personalized-maps/<id>/` via the API.

### Manual Verification
1. Open Map Manager, click a saved map, add/remove Wilayas, and hit Update. Verify the card updates automatically.
2. Open Patient List, verify the new table layout. Use the Export CSV button to check the download contents.
3. Try adding a new patient in `PatientForm` with the exact same name or NID as an existing one. Ensure the modal pops up and allows you to either "Merge" or "Continue Anyway".
