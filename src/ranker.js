import { ecosystemConcepts } from "./data.js";

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "by", "for", "from", "in", "into", "is",
  "of", "on", "or", "the", "to", "with", "who", "works", "working", "years"
]);

const TERM_ALIASES = new Map([
  ["principal", "school leadership"], ["headmaster", "school leadership"],
  ["headmistress", "school leadership"], ["headteacher", "school leadership"],
  ["director", "school leadership"], ["trustee", "school governance"],
  ["owner", "school founder"], ["founder", "school founder"],
  ["schools", "school"], ["campuses", "school"], ["campus", "school"],
  ["teachers", "teacher"], ["teaching", "teacher development"],
  ["educator", "education leadership"], ["educationist", "education leadership"],
  ["nonprofit", "education philanthropy"], ["ngo", "education philanthropy"],
  ["edtech", "education technology"], ["k12", "k-12"],
  ["multi-campus", "school network"], ["multi-school", "school network"],
  ["franchise", "school network"], ["partnerships", "school partnerships"],
  ["systems", "systems change"], ["policy", "education policy"]
]);

const CONCEPT_LABELS = {
  school_leadership: "School leadership",
  school_network: "School networks",
  teaching_learning: "Teaching & learning",
  education_systems: "Education systems",
  innovation: "Education innovation"
};

function normalizeText(text = "") {
  return String(text).toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9+#-]+/g, " ")
    .trim();
}

function profileText(profile) {
  return [
    profile.name, profile.role, profile.organization, profile.location,
    profile.experience, profile.text, profile.bio, profile.summary, ...(profile.signals || [])
  ].filter(Boolean).join(" ");
}

function tokenize(text) {
  return normalizeText(text).split(/\s+/).filter((token) => token && !STOP_WORDS.has(token));
}

function conceptMatches(text) {
  const normalized = ` ${normalizeText(text)} `;
  const matches = [];
  for (const [concept, phrases] of Object.entries(ecosystemConcepts)) {
    const found = phrases.filter((phrase) => normalized.includes(` ${normalizeText(phrase)} `));
    if (found.length) matches.push({ concept, phrases: [...new Set(found)] });
  }
  return matches;
}

function expandedTerms(text) {
  const terms = tokenize(text);
  for (const token of [...terms]) {
    const alias = TERM_ALIASES.get(token);
    if (alias) terms.push(...tokenize(alias));
  }
  for (const { phrases } of conceptMatches(text)) {
    for (const phrase of phrases) terms.push(...tokenize(phrase));
  }
  const frequencies = new Map();
  for (const term of terms) frequencies.set(term, (frequencies.get(term) || 0) + 1);
  return frequencies;
}

function buildTfIdfVectors(reference, candidates) {
  const documents = [reference, ...candidates].map((profile) => expandedTerms(profileText(profile)));
  const documentFrequency = new Map();
  for (const terms of documents) {
    for (const term of terms.keys()) documentFrequency.set(term, (documentFrequency.get(term) || 0) + 1);
  }
  const total = documents.length;
  return documents.map((terms) => {
    const vector = new Map();
    for (const [term, frequency] of terms) {
      const termFrequency = 1 + Math.log(frequency);
      const inverseDocumentFrequency = Math.log(1 + (total + 1) / (documentFrequency.get(term) + 1));
      vector.set(term, termFrequency * inverseDocumentFrequency);
    }
    return vector;
  });
}

function cosineSimilarity(left, right) {
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (const value of left.values()) leftNorm += value * value;
  for (const value of right.values()) rightNorm += value * value;
  for (const [term, value] of left) dot += value * (right.get(term) || 0);
  if (!leftNorm || !rightNorm) return 0;
  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}

function overlapRatio(left, right) {
  if (!left.length) return 0;
  const rightSet = new Set(right);
  const shared = left.filter((value) => rightSet.has(value)).length;
  return shared / new Set(left).size;
}

function jaccardSimilarity(left, right) {
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  if (!leftSet.size && !rightSet.size) return 0;
  let intersection = 0;
  for (const term of leftSet) if (rightSet.has(term)) intersection += 1;
  return intersection / (leftSet.size + rightSet.size - intersection);
}

function makeExplanation(reference, candidate) {
  const referenceText = profileText(reference);
  const candidateText = profileText(candidate);
  const referenceConcepts = conceptMatches(referenceText);
  const candidateConcepts = conceptMatches(candidateText);
  const referenceConceptNames = new Set(referenceConcepts.map((item) => item.concept));
  const sharedConcepts = candidateConcepts
    .filter((item) => referenceConceptNames.has(item.concept))
    .map((item) => item.concept);
  const refSignals = (reference.signals || []).map((signal) => normalizeText(signal));
  const candidateSignals = (candidate.signals || []).map((signal) => normalizeText(signal));
  const sharedSignals = candidateSignals.filter((signal) =>
    refSignals.some((ref) => ref === signal || ref.includes(signal) || signal.includes(ref))
  );
  const labels = sharedSignals.slice(0, 3);
  for (const concept of sharedConcepts) {
    if (labels.length >= 3) break;
    const label = CONCEPT_LABELS[concept];
    if (!labels.includes(label)) labels.push(label);
  }
  if (!labels.length) labels.push("Related education-sector experience");
  const basis = sharedConcepts.map((concept) => CONCEPT_LABELS[concept].toLowerCase());
  if (candidate.location && reference.location &&
      normalizeText(candidate.location).split(" ").some((part) => normalizeText(reference.location).includes(part) && part.length > 3)) {
    basis.push("shared location");
  }
  const reason = basis.length
    ? `Shared context: ${basis.slice(0, 2).join(" and ")}.`
    : "Relevant education-sector experience and shared professional context.";
  return { labels, reason };
}

export function analyzeReference(text) {
  const signals = conceptMatches(text)
    .flatMap((item) => item.phrases.slice(0, 2))
    .filter((phrase, index, list) => list.indexOf(phrase) === index)
    .slice(0, 6);
  return signals.length ? signals : tokenize(text).slice(0, 6);
}

export function rankProfiles(reference, candidates) {
  if (!reference || !Array.isArray(candidates) || candidates.length === 0) return [];
  const referenceName = normalizeText(reference.name || "");
  const eligibleCandidates = referenceName
    ? candidates.filter((candidate) => normalizeText(candidate.name || "") !== referenceName)
    : candidates;
  if (!eligibleCandidates.length) return [];
  const vectors = buildTfIdfVectors(reference, eligibleCandidates);
  const referenceConcepts = conceptMatches(profileText(reference)).map((item) => item.concept);
  const referenceSignals = (reference.signals || []).map(normalizeText);
  const referenceRoleTerms = expandedTerms([
    reference.role, reference.organization, reference.experience, reference.text, ...(reference.signals || [])
  ].filter(Boolean).join(" "));
  return eligibleCandidates.map((candidate, index) => {
    const candidateConcepts = conceptMatches(profileText(candidate)).map((item) => item.concept);
    const conceptOverlap = overlapRatio(referenceConcepts, candidateConcepts);
    const candidateSignals = (candidate.signals || []).map(normalizeText);
    const explicitSignalOverlap = overlapRatio(referenceSignals, candidateSignals);
    const semanticSimilarity = cosineSimilarity(vectors[0], vectors[index + 1]);
    const roleTerms = expandedTerms(`${candidate.role || ""} ${candidate.experience || ""} ${(candidate.signals || []).join(" ")}`);
    const roleFit = jaccardSimilarity([...referenceRoleTerms.keys()], [...roleTerms.keys()]);
    const hasSharedLocation = Boolean(candidate.location && reference.location &&
      normalizeText(candidate.location).split(" ").some((part) => part.length > 3 && normalizeText(reference.location).includes(part)));
    const locationFit = hasSharedLocation ? 1 : 0;
    const score = Math.round(100 * (
      semanticSimilarity * 0.55 +
      Math.max(conceptOverlap, explicitSignalOverlap) * 0.25 +
      roleFit * 0.12 +
      locationFit * 0.08
    ));
    const explanation = makeExplanation(reference, candidate);
    return {
      ...candidate,
      score: Math.min(100, score),
      explanation: explanation.reason,
      matchedSignals: explanation.labels,
      sharedConceptCount: referenceConcepts.filter((concept) => candidateConcepts.includes(concept)).length
    };
  }).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}
