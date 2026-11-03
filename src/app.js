import { demoCandidates, referenceProfiles } from "./data.js";
import { analyzeReference, rankProfiles } from "./ranker.js";
import { formatProfilesCsv, normalizeHttpsUrl, parseProfileCsv } from "./csv.js";

const el = (selector) => document.querySelector(selector);
const referenceSelect = el("#reference-select");
const referenceName = el("#reference-name");
const referenceRole = el("#reference-role");
const referenceOrganization = el("#reference-organization");
const referenceLocation = el("#reference-location");
const referenceLinkedin = el("#reference-linkedin");
const referenceText = el("#reference-text");
const customWrap = el("#custom-reference-wrap");
const resultBody = el("#results-body");
const filterInput = el("#filter-input");
const toast = el("#toast");
let candidates = [...demoCandidates];
let rankedResults = [];
let toastTimeout;

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function initials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase();
}

function sourceReviewLabel(date) {
  if (!date) return "Check current role";
  const ageDays = (Date.now() - new Date(`${date}T00:00:00Z`).valueOf()) / 86_400_000;
  return ageDays > 365 ? `Review overdue · ${date}` : `User review date · ${date}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("visible"), 2800);
}

function updateAnalysis(reference, signals) {
  el("#analysis-title").textContent = reference.name || "Custom reference profile";
  const context = [reference.role, reference.organization, reference.location].filter(Boolean).join(" · ");
  el("#analysis-summary").textContent = context || reference.text.slice(0, 180);
  const source = el("#reference-source");
  const sourceUrl = normalizeHttpsUrl(reference.linkedinUrl, true) || normalizeHttpsUrl(reference.sourceUrl);
  source.hidden = !sourceUrl;
  source.href = sourceUrl;
  source.textContent = sourceUrl ? (reference.linkedinUrl ? "Open reference LinkedIn profile ↗" : `Check reference source · ${reference.source || "Public source"} ↗`) : "";
  el("#signal-chips").innerHTML = signals.map((signal) => `<span class="signal-chip">${escapeHtml(signal)}</span>`).join("");
  el("#analysis-method").textContent = `Context analyzed across ${signals.length ? "role, reach & experience" : "professional context"}`;
}

function renderResults() {
  const filter = filterInput.value.trim().toLowerCase();
  const filtered = rankedResults.filter((profile) => [
    profile.name, profile.role, profile.organization, profile.location,
    profile.experience, ...(profile.signals || []), ...(profile.matchedSignals || [])
  ].filter(Boolean).join(" ").toLowerCase().includes(filter));
  el("#result-count").textContent = filtered.length;
  el("#showing-count").textContent = `Showing ${filtered.length} of ${rankedResults.length} profiles`;
  el("#empty-state").hidden = filtered.length > 0;
  resultBody.innerHTML = filtered.map((profile, index) => {
    const tags = profile.matchedSignals.map((signal) => `<span class="tag">${escapeHtml(signal)}</span>`).join("");
    const linkedinUrl = normalizeHttpsUrl(profile.linkedinUrl, true);
    const profileLink = linkedinUrl
      ? `<a class="profile-link" href="${escapeHtml(linkedinUrl)}" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>`
      : `<span>LinkedIn not supplied</span>`;
    const sourceUrl = normalizeHttpsUrl(profile.sourceUrl);
    const sourceLink = sourceUrl
      ? `<a class="profile-link" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer" title="Public source: ${escapeHtml(profile.sourceLabel || "source")}">Source ↗</a>`
      : "";
    const personName = linkedinUrl
      ? `<a class="person-name" href="${escapeHtml(linkedinUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(profile.name)}</a>`
      : `<span class="person-name">${escapeHtml(profile.name)}</span>`;
    const experience = profile.experience
      ? `<span class="context-experience">${escapeHtml(profile.experience)}</span>`
      : `<span class="context-experience missing">Experience not provided</span>`;
    const sourceType = profile.sourceType === "individual" ? "Individual bio" :
      profile.sourceType === "licensed_dataset" ? "Licensed dataset" :
      profile.sourceType === "organization" ? "Organization context" : "User-provided source";
    const sourceReview = sourceReviewLabel(profile.sourceReviewedOn);
    return `<tr>
      <td class="rank-cell">${String(index + 1).padStart(2, "0")}</td>
      <td><div class="person-cell"><span class="person-avatar alt-${index % 4}">${escapeHtml(initials(profile.name))}</span><div>${personName}<div class="person-links">${profileLink}<span>·</span>${sourceLink}</div></div></div></td>
      <td><span class="context-role">${escapeHtml(profile.role || "Role not provided")}</span><span class="context-org">${escapeHtml(profile.organization || "Organization not provided")}</span>${profile.location ? `<span class="context-location">${escapeHtml(profile.location)}</span>` : ""}${experience}<span class="provenance-note">${escapeHtml(sourceType)} · ${escapeHtml(sourceReview)}</span></td>
      <td><div class="tag-list">${tags}</div><div class="match-reason">${escapeHtml(profile.explanation)}</div></td>
      <td class="score-cell"><div class="score-topline"><span class="score-number">${profile.score}</span><span class="score-label">points</span></div><div class="score-track"><span class="score-fill" style="width:${profile.score}%"></span></div></td>
    </tr>`;
  }).join("");
}

function discover(reference) {
  if (!reference) return;
  if (!reference.text.trim()) {
    showToast("Add authorized profile bio or experience text before analyzing. A URL alone is not fetched.");
    return;
  }
  const referenceContext = [reference.role, reference.organization, reference.location, reference.text]
    .filter(Boolean).join(". ");
  const analyzed = { ...reference, signals: analyzeReference(referenceContext) };
  updateAnalysis(reference, analyzed.signals);
  rankedResults = rankProfiles(analyzed, candidates);
  filterInput.value = "";
  renderResults();
  el("#analysis-panel").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function getReference() {
  const selected = referenceSelect.value;
  if (selected === "custom") {
    const text = referenceText.value.trim();
    const linkedinUrl = referenceLinkedin.value.trim();
    if (linkedinUrl && !normalizeHttpsUrl(linkedinUrl, true)) {
      showToast("Use a valid HTTPS LinkedIn profile URL, or leave the URL blank.");
      return null;
    }
    return {
      name: referenceName.value.trim() || "Custom reference profile",
      role: referenceRole.value.trim(),
      organization: referenceOrganization.value.trim(),
      location: referenceLocation.value.trim(),
      linkedinUrl,
      text,
      signals: []
    };
  }
  return referenceProfiles[selected];
}

function exportCsv() {
  const csv = formatProfilesCsv(rankedResults);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "school-signal-ranked-profiles.csv";
  link.click();
  URL.revokeObjectURL(url);
  showToast("Ranked profiles exported.");
}

referenceSelect.addEventListener("change", () => {
  const isCustom = referenceSelect.value === "custom";
  customWrap.hidden = !isCustom;
  if (isCustom) referenceName.focus({ preventScroll: true });
  else discover(getReference());
});
el("#analyze-button").addEventListener("click", () => discover(getReference()));
filterInput.addEventListener("input", renderResults);
el("#export-button").addEventListener("click", exportCsv);
el("#reset-button").addEventListener("click", () => {
  referenceSelect.value = "kiran";
  customWrap.hidden = true;
  [referenceName, referenceRole, referenceOrganization, referenceLocation, referenceLinkedin, referenceText]
    .forEach((input) => { input.value = ""; });
  filterInput.value = "";
  candidates = [...demoCandidates];
  el("#dataset-status").textContent = `Demo dataset · ${demoCandidates.length} profiles`;
  discover(referenceProfiles.kiran);
  showToast("Workspace reset to the demo profiles.");
});
el("#csv-upload").addEventListener("change", async (event) => {
  const [file] = event.target.files || [];
  if (!file) return;
  try {
    const imported = parseProfileCsv(await file.text());
    if (!imported.length) throw new Error("No profiles with names were found.");
    const reference = getReference();
    if (!reference || !reference.text.trim()) {
      if (reference) showToast("Add authorized reference bio or experience text before importing candidates.");
      return;
    }
    candidates = imported;
    el("#dataset-status").textContent = `${imported.length} imported profiles`;
    discover(reference);
    showToast(`Imported ${imported.length} profiles locally.`);
  } catch (error) {
    showToast(error.message || "Could not read the CSV file.");
  } finally {
    event.target.value = "";
  }
});

discover(referenceProfiles.kiran);
