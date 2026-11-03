# School Signal — LinkedIn School Influencer Discovery MVP

A browser-only prototype for turning an authorized reference-profile summary into an explainable, ranked list of similar school-ecosystem professionals. This project does **not** log into, scrape, or fetch LinkedIn pages.

## Run locally

Requirements: Python 3.8+ to run locally (no packages to install). Node.js 18+ is optional for tests.

```powershell
python app.py
```

The app opens `http://127.0.0.1:8000` in your browser. Press `Ctrl+C` in the terminal to stop it. The Python entry point uses only the standard library and serves the browser UI and ranking code locally. To run the automated ranker tests when Node.js is available:

```powershell
npm test
```

## Optional GitHub Pages deployment

The app is static and includes a GitHub Actions Pages workflow. Push this folder to a GitHub repository's `main` branch, enable **Settings → Pages → Build and deployment → GitHub Actions**, and the workflow publishes the site. This workspace has not been connected to a GitHub remote, so no public URL has been deployed from here.

## Demo walkthrough (5–10 minutes)

1. Open the app; a Kiran Bir Sethi test reference is compared against a bundled set of 21 real education professionals. The reference person is excluded, so 20 other profiles are ranked.
2. Review the reference analysis and extracted school-ecosystem signals.
3. Use the reference selector to compare the Ashish Dhawan or Shaheen Mistri test profile.
4. Inspect the score, evidence tags, match explanation, and public source link for any result. A LinkedIn link is shown only when supplied in an import; the bundled demo does not invent profile URLs.
5. Filter by a name, organization, or signal, then export the ranked list.
6. Import your own CSV to replace the bundled candidate set. The CSV is read in-browser and is not uploaded.

The demo set contains 21 **real, publicly known education professionals** and public organization/source links for checking context. It is a small hand-curated test set, not a live LinkedIn directory; role details may be stale and should be checked before use. Some source links are organization pages rather than individual biographies and therefore provide organization context, not independent proof of a person's current title. LinkedIn profile URLs are deliberately left blank unless supplied through an authorized CSV.

### CSV format

Required: `name`. Recommended: `role`, `organization`, `location`, `experience`, and a traceable `source_url`. Optional headers: `role` (or `current_role` / `title`), `organization` (or `org` / `company`), `location`, `experience` (or `bio` / `summary`), `signals` (or `tags`), `linkedin_url` (or `linkedin`), `source_url` (or `source`), `source_label`, `source_type`, and `source_reviewed_on` (or `source_checked_at`, ISO `YYYY-MM-DD`). Valid source types: `organization`, `individual`, `licensed_dataset`, `user_provided`. Separate multiple signals with `;` or `|`. The review date is user-supplied metadata and is not independently verified by the app.

```csv
name,role,organization,location,experience,signals,linkedin_url,source_url,source_label,source_type,source_reviewed_on
"Example Person","School director","Example School Group","Pune, India","Led several schools and built teacher development programs","school leadership;school network;teacher development",,"https://example.org/about","Official bio","individual","2026-10-12"
```

Only import information you are authorized to process. The app validates that supplied URLs use HTTPS, but it does not fetch or verify their contents. It labels the source type, shows the experience text, and flags missing or older-than-one-year user review dates; a date is not proof of truth. CSV data stays in browser memory and is discarded on refresh. Avoid sensitive personal information. Export before closing if you need to retain results.

## Technical note

### Architecture and retrieval

The static client hosts the UI, data, and ranking code. The bundled test records are local fixtures based on public-facing education organization context; most bundled links are organization pages, not individual proof of current titles. Source type is shown so users can distinguish organization context from an individual bio. User imports can retain a source URL and an optional user-entered review date. The app makes no third-party network requests; only links explicitly opened by the user leave the app. It does not retrieve LinkedIn results or require external credentials. Imported data is intentionally session-only, with CSV export as the retention path. There is no backend, profile enrichment, or automated contact lookup.

### Similarity and ranking

The reference bio and each candidate's role, organization, experience, and signals are normalized and expanded with a small education-domain synonym/concept map (for example school group, multi-campus, and school network). Log-scaled term frequency and inverse-document frequency create a local TF-IDF representation, compared by cosine similarity. Education-domain concept overlap broadens matching beyond exact title strings. The final **0–100 ranking points** combine:

- 55% contextual TF-IDF cosine similarity
- 25% overlap in education-domain concepts or supplied signals
- 12% role/experience fit
- 8% location overlap (zero when the location is absent or does not match)

Scores are a relative ranking aid, not calibrated probabilities or evidence of influence. The UI shows the candidate's experience text and shared concepts so users can inspect the basis. The small curated ontology and test corpus can bias results; this is a classical information-retrieval/ML ranking approach, not a large language model or a trained deep-learning model. Evaluation needs human relevance labels; passing unit tests does not establish that the rank is suitable for outreach.

### Limitations and responsible production path

- The bundled set is fixed and manually curated. Importing an authorized CSV lets you replace it, but broader coverage and fresh roles require an authorized data source; the app cannot create that data.
- LinkedIn URLs are not guessed or fetched. Add them only from an authorized source. Public organization pages are labeled as organization context and must not be treated as proof of individual current roles.
- Missing and older-than-one-year review dates are made visible. User-entered review dates are not independently validated, and the app cannot automatically refresh a profile.
- A production deployment still needs an approved, licensed/consented data source, independent source-level verification, retention/access controls, and an evaluation set reviewed by school-sector experts.
- Use only official partner APIs or licensed datasets whose terms explicitly permit discovery and ranking. Do not bypass login, CAPTCHA, rate limits, or other controls. LLM enrichment would require a separate privacy and vendor review.
- This workspace is local-only and has no GitHub remote or deployment credentials. The Pages workflow is ready, but a public URL requires a user-controlled GitHub repository and enabled Pages permissions.

### Suggested evaluation

Have education-domain reviewers label relevant/not relevant for a set of reference profiles, then track precision@10, recall@20, source coverage, stale-record rate, and score calibration. This prototype's automated checks validate the ranking pipeline and test set shape, not real-world relevance quality.

## Files

- `index.html`, `styles.css`: responsive interface
- `app.py`: Python standard-library local server/launcher
- `src/data.js`: sample records and education concept map
- `src/ranker.js`: local, explainable TF-IDF and weighted ranking
- `src/app.js`: browser workflow, provenance display, CSV import/export, filtering
- `src/csv.js`: safe URL validation and CSV parsing/export
- `tests/ranker.test.js`: ranking and data-shape tests
- `DEMO_SCRIPT.md`: timed demo walkthrough
- `.github/workflows/deploy-pages.yml`: optional static GitHub Pages deployment
