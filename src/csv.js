const LINKEDIN_PATH = /^\/(in|pub)\//i;
const SOURCE_TYPES = new Set(["organization", "individual", "licensed_dataset", "user_provided"]);

export function normalizeHttpsUrl(value, linkedinProfile = false) {
  if (!value) return "";
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return "";
    if (linkedinProfile && (
      (url.hostname !== "linkedin.com" && !url.hostname.endsWith(".linkedin.com")) ||
      !LINKEDIN_PATH.test(url.pathname)
    )) return "";
    return url.href;
  } catch {
    return "";
  }
}

function parseRows(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  let closedQuote = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
        closedQuote = true;
      } else {
        cell += character;
      }
      continue;
    }

    if (closedQuote && character !== "," && character !== "\r" && character !== "\n" && !/\s/.test(character)) {
      throw new Error("CSV has unexpected text after a closing quote.");
    }
    if (character === '"') {
      if (cell.trim()) throw new Error("CSV has a quote inside an unquoted field.");
      cell = "";
      quoted = true;
      closedQuote = false;
    } else if (character === ",") {
      row.push(cell.trim());
      cell = "";
      closedQuote = false;
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
      closedQuote = false;
    } else if (!(closedQuote && /\s/.test(character))) {
      cell += character;
    }
  }
  if (quoted) throw new Error("CSV contains an unclosed quoted field.");
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export function parseProfileCsv(text) {
  const rows = parseRows(String(text).replace(/^\uFEFF/, ""));
  if (rows.length < 2) throw new Error("CSV needs a header row and at least one profile.");
  const headers = rows[0].map((header) => header.toLowerCase().replace(/[\s-]+/g, "_"));
  if (headers.some((header) => !header)) throw new Error("CSV headers cannot be blank.");
  if (new Set(headers).size !== headers.length) throw new Error("CSV contains duplicate column names.");
  if (!headers.includes("name")) throw new Error("CSV must include a name column.");

  return rows.slice(1).map((values, index) => {
    const recordNumber = index + 2;
    if (values.length > headers.length) {
      throw new Error(`CSV row ${recordNumber} has more values than the header.`);
    }
    const record = Object.fromEntries(headers.map((header, i) => [header, values[i] || ""]));
    const get = (...keys) => {
      for (const key of keys) {
        if (record[key] !== undefined && record[key] !== "") return record[key];
      }
      return "";
    };
    const name = get("name");
    const linkedinUrl = get("linkedin_url", "linkedin");
    const sourceUrl = get("source_url", "source");
    const sourceType = get("source_type") || "user_provided";
    const sourceReviewedOn = get("source_reviewed_on", "source_checked_at");
    const signalText = get("signals", "tags");

    if (!name) throw new Error(`CSV row ${recordNumber} is missing a name.`);
    if (linkedinUrl && !normalizeHttpsUrl(linkedinUrl, true)) {
      throw new Error(`Invalid LinkedIn URL in CSV row ${recordNumber}. Use an HTTPS LinkedIn profile URL.`);
    }
    if (sourceUrl && !normalizeHttpsUrl(sourceUrl)) {
      throw new Error(`Invalid source URL in CSV row ${recordNumber}. Use an HTTPS URL.`);
    }
    if (!SOURCE_TYPES.has(sourceType)) {
      throw new Error(`Invalid source_type in CSV row ${recordNumber}. Use organization, individual, licensed_dataset, or user_provided.`);
    }
    if (sourceReviewedOn && !isIsoDate(sourceReviewedOn)) {
      throw new Error(`Invalid source_reviewed_on in CSV row ${recordNumber}. Use YYYY-MM-DD.`);
    }
    if (sourceReviewedOn && sourceReviewedOn > new Date().toISOString().slice(0, 10)) {
      throw new Error(`source_reviewed_on in CSV row ${recordNumber} cannot be in the future.`);
    }

    return {
      id: `import-${index}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name,
      role: get("role", "current_role", "title"),
      organization: get("organization", "org", "company"),
      location: get("location"),
      experience: get("experience", "bio", "summary"),
      signals: signalText.split(/[;|]/).map((signal) => signal.trim()).filter(Boolean),
      linkedinUrl,
      sourceUrl,
      sourceLabel: get("source_label"),
      sourceType,
      sourceReviewedOn
    };
  });
}

export function formatProfilesCsv(profiles) {
  const header = [
    "name", "role", "organization", "location", "experience", "signals",
    "linkedin_url", "source_url", "source_label", "source_type",
    "source_reviewed_on", "score", "match_explanation"
  ];
  const quote = (value) => {
    const text = String(value ?? "");
    const safeText = /^\s*[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${safeText.replace(/"/g, '""')}"`;
  };
  const rows = profiles.map((profile) => [
    profile.name, profile.role, profile.organization, profile.location,
    profile.experience, (profile.signals || []).join("; "),
    profile.linkedinUrl, profile.sourceUrl, profile.sourceLabel,
    profile.sourceType, profile.sourceReviewedOn, profile.score, profile.explanation
  ]);
  return [header, ...rows].map((row) => row.map(quote).join(",")).join("\r\n");
}
