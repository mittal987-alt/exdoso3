# School Signal — 6-minute demo script

## 0:00–0:45 — Set expectations

Run `python app.py` and open the local page. Explain that this is a privacy-first prototype: it does not sign in to LinkedIn, scrape profiles, or fetch a URL. The bundled sample is a small, curated test set based on public education-organization context; source links are provided, and LinkedIn links are not invented.

## 0:45–1:45 — Start with a reference

Show the Kiran Bir Sethi reference and the extracted school leadership, learning design, and school network signals. Explain that a test reference is provided so the workflow works immediately. Select **Analyze & discover** to rerun the analysis.

## 1:45–3:15 — Review ranked matches

Point out that the reference itself is excluded and 20 other profiles remain. Open the score tooltip and explain that relevance combines TF-IDF cosine similarity (55%), education-domain concepts or supplied signals (25%), role/experience fit (12%), and location overlap (8%). Scores are 0–100 ranking points, not probabilities.

Choose one high-ranked school-network profile and one education-systems profile. Compare the matched evidence tags, experience text, and rationale. Use each **Source** link to check public context; note the provenance label and review status, and that most bundled links are organization-level, not personal biography pages.

## 3:15–4:15 — Compare references

Select Ashish Dhawan, then Shaheen Mistri. Show how a different reference context changes the candidate order and signals. Emphasize that the ranker uses role, organization, experience, location, and domain concepts rather than exact title equality alone.

## 4:15–5:15 — Enter a profile

Choose **Enter your own profile**. Enter a name, role, organization, location, authorized public bio, and optionally a LinkedIn profile URL. Explain that the URL is displayed only as a reference link; URL contents are never fetched. Run discovery and inspect the new analysis and rankings.

## 5:15–6:00 — Import/export and limits

Import a CSV with `name`, `role`, `organization`, `location`, `experience`, `signals`, plus optional `source_url`, `source_type`, and `source_reviewed_on`. Filter results and export the ranking. Close by noting that imports stay in browser memory, reset on refresh, and that production use requires a licensed/authorized data source, independent individual-level source verification, freshness checks, and expert relevance evaluation.
