import test from "node:test";
import assert from "node:assert/strict";
import { demoCandidates, referenceProfiles } from "../src/data.js";
import { analyzeReference, rankProfiles } from "../src/ranker.js";
import { formatProfilesCsv, normalizeHttpsUrl, parseProfileCsv } from "../src/csv.js";

test("demo dataset contains enough complete, unique profiles to return 20 matches", () => {
  assert.ok(demoCandidates.length >= 21);
  assert.equal(new Set(demoCandidates.map((profile) => profile.id)).size, demoCandidates.length);
  assert.ok(demoCandidates.every((profile) =>
    profile.name && profile.role && profile.organization && profile.location && profile.experience && profile.sourceUrl
  ));
});

test("ranker returns every candidate in stable descending score order", () => {
  const reference = { ...referenceProfiles.kiran, signals: analyzeReference(referenceProfiles.kiran.text) };
  const ranked = rankProfiles(reference, demoCandidates);
  assert.equal(ranked.length, 20);
  assert.ok(ranked.every((profile) => profile.name !== reference.name));
  assert.ok(ranked.every((profile) => profile.score >= 0 && profile.score <= 100));
  assert.deepEqual(ranked.map((profile) => profile.score), [...ranked].map((profile) => profile.score).sort((a, b) => b - a));
  assert.ok(ranked.every((profile) => profile.explanation && profile.matchedSignals.length));
});

test("ranker excludes the reference person but keeps all other relevant profiles", () => {
  for (const reference of Object.values(referenceProfiles)) {
    const ranked = rankProfiles({ ...reference, signals: analyzeReference(reference.text) }, demoCandidates);
    assert.equal(ranked.length, 20);
    assert.ok(ranked.every((profile) => profile.name !== reference.name));
  }
});

test("school group leadership ranks ahead of generic education-system context for a school founder", () => {
  const reference = {
    text: "School founder and principal. Built a multi-campus school network and school partnerships.",
    signals: ["school founder", "school leadership", "school network", "school partnerships"]
  };
  const candidates = [
    { id: "network", name: "Network Builder", role: "Founder, school group", experience: "Leads multi-campus school operations and school partnerships.", signals: ["school founder", "school network", "school partnerships"] },
    { id: "policy", name: "Policy Analyst", role: "Education policy researcher", experience: "Studies national education policy and systems change.", signals: ["education policy", "systems change"] }
  ];
  const ranked = rankProfiles(reference, candidates);
  assert.equal(ranked[0].id, "network");
  assert.ok(ranked[0].score > ranked[1].score);
});

test("reference biography text participates in contextual matching", () => {
  const reference = {
    name: "Reference",
    text: "I lead teacher development and professional learning for school teachers.",
    signals: []
  };
  const ranked = rankProfiles(reference, [
    { id: "teachers", name: "Teacher Network", experience: "Builds teacher development programs and professional learning networks for schools." },
    { id: "owners", name: "School Owner", experience: "Owns and operates a chain of independent schools." }
  ]);
  assert.equal(ranked[0].id, "teachers");
});

test("CSV import preserves quoted commas, newlines, source provenance and review date", () => {
  const [profile] = parseProfileCsv([
    "name,role,experience,signals,source_url,source_type,source_reviewed_on",
    '"Example, Educator","School director","Leads schools, trains teachers","school network;teacher development","https://example.org/bio","individual","2026-10-12"'
  ].join("\r\n"));
  assert.equal(profile.name, "Example, Educator");
  assert.equal(profile.experience, "Leads schools, trains teachers");
  assert.deepEqual(profile.signals, ["school network", "teacher development"]);
  assert.equal(profile.sourceType, "individual");
  assert.equal(profile.sourceReviewedOn, "2026-10-12");

  const [multiline] = parseProfileCsv('name,experience\r\n"Example","Line one\nLine two"');
  assert.equal(multiline.experience, "Line one\nLine two");
});

test("CSV parser rejects malformed rows, invalid dates and unsafe profile URLs", () => {
  assert.throws(() => parseProfileCsv('name,role\r\nExample,"unclosed'), /unclosed quoted field/);
  assert.throws(() => parseProfileCsv("name,source_reviewed_on\nExample,2026-02-30"), /YYYY-MM-DD/);
  assert.throws(() => parseProfileCsv("name,source_reviewed_on\nExample,2999-01-01"), /cannot be in the future/);
  assert.throws(() => parseProfileCsv("name,linkedin_url\nExample,https://evil.example/in/person"), /Invalid LinkedIn URL/);
  assert.throws(() => parseProfileCsv("name,source_url\nExample,http://example.org"), /Use an HTTPS URL/);
  assert.equal(normalizeHttpsUrl("https://www.linkedin.com/in/example", true), "https://www.linkedin.com/in/example");
  assert.equal(normalizeHttpsUrl("javascript:alert(1)"), "");
});

test("CSV export preserves provenance and neutralizes spreadsheet formulas", () => {
  const csv = formatProfilesCsv([{
    name: "=HYPERLINK(\"https://evil.example\")",
    experience: "Line 1, line 2",
    sourceType: "organization",
    sourceReviewedOn: "2026-10-12",
    signals: ["school network"],
    score: 42
  }]);
  assert.match(csv, /source_type/);
  assert.match(csv, /source_reviewed_on/);
  assert.match(csv, /"'=HYPERLINK\(""https:\/\/evil\.example""\)"/);
  const [roundTripped] = parseProfileCsv(csv);
  assert.equal(roundTripped.sourceType, "organization");
  assert.equal(roundTripped.sourceReviewedOn, "2026-10-12");
});
