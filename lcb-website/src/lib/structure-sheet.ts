import { fallbackStructureData, type StructureData } from "@/data/structure-data";

const GOOGLE_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1mQXJiyP_t8cefY5t_CoAlda70o_v4EvE/export?format=csv&gid=745815957";

// Verified official department heads & titles
const DEPT_HEADS: Record<string, { head: string; designation: string }> = {
  T101: {
    head: "Md Junayed Islam Mahi",
    designation: "Senior Executive, HR & Talent Acquisition",
  },
  T102: {
    head: "Md Abir Hossain",
    designation: "Marketing Lead",
  },
  T103: {
    head: "Kayum Rosul Razu",
    designation: "Deputy Manager, Operation",
  },
  T104: {
    head: "Syed Istiak Hossen",
    designation: "Deputy Manager, Partnership Team",
  },
  T105: {
    head: "Md. Yasin Islam",
    designation: "Creative Design & Social Media Lead",
  },
  T106: {
    head: "Jahid Hossain Sunny",
    designation: "Communication Lead",
  },
  T107: {
    head: "Mahmudur Rahman",
    designation: "Assistant Director, Training & Development",
  },
  T108: {
    head: "Md. Ezaz Ahamed Khan",
    designation: "Assistant Manager, Corporate Relations & Job Placement",
  },
  T109: {
    head: "Fabiya Ahsan Ahona",
    designation: "Lead, Innovation & Transformation",
  },
  T110: {
    head: "Md Abu Talha",
    designation: "Assistant Manager, Partnership",
  },
  T111: {
    head: "Abu Helal Rashid Reza",
    designation: "Assistant Director, Mentor & Industry Connect",
  },
  T112: {
    head: "S M Muqtadirul Huq",
    designation: "Lead, Event Affairs",
  },
  T113: {
    head: "Abdullah Kaosar",
    designation: "Lead, Quality Assurance & Global Benchmarking",
  },
};

/**
 * Standard RFC 4180 compliant CSV parser that handles newlines and quoted commas correctly.
 */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = "";
    } else if ((char === "\r" || char === "\n") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
      currentRow.push(currentVal.trim());
      if (currentRow.some((c) => c.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = "";
    } else {
      currentVal += char;
    }
  }

  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some((c) => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Normalizes common university names from the sheet to avoid duplicate entries with minor punctuation differences.
 */
function normalizeUniName(raw: string): string {
  const clean = raw.replace(/[\.,\s]+$/, "").trim();
  const lower = clean.toLowerCase();
  if (lower.includes("jagannath university")) return "Jagannath University";
  if (lower.includes("comilla university")) return "Comilla University";
  if (lower.includes("begum rokeya university")) return "Begum Rokeya University";
  if (lower.includes("american international university"))
    return "American International University-Bangladesh (AIUB)";
  if (lower.includes("gopalganj textile engineering"))
    return "Gopalganj textile engineering college, Gopalganj (BUTEX)";
  if (lower === "dhaka university" || lower === "university of dhaka")
    return "University of Dhaka";
  if (lower.includes("rajshahi collage")) return "Rajshahi College";
  if (lower.includes("pirojpur")) return "Pirojpur science and technology university";
  if (lower.includes("port city")) return "Port City international university";
  return clean;
}

/**
 * Parses raw Google Sheet CSV data into clean, typed StructureData.
 * Strictly adheres to privacy: strips away internal remarks, catalyst assignments, or unapproved fields.
 */
export function parseSheetData(csvText: string): StructureData {
  const rows = parseCSV(csvText);
  if (!rows || rows.length < 15) {
    return fallbackStructureData;
  }

  // 1. Departments Map (T101 to T113)
  const deptOrder: string[] = [];
  const deptMap: Record<
    string,
    {
      name: string;
      head: string;
      designation: string;
      members: number;
      initiatives: [string, number][];
    }
  > = {};

  for (let r = 0; r < Math.min(rows.length, 25); r++) {
    const row = rows[r];
    const code = row[1]?.trim() || "";
    if (code.startsWith("T") && code.length <= 5) {
      const name = row[2]?.trim() || "";
      const rawMem = parseInt(row[3]?.trim() || "0", 10);
      const members = isNaN(rawMem) ? 0 : rawMem;
      const meta = DEPT_HEADS[code] || {
        head: "Department Lead",
        designation: "Lead",
      };

      deptOrder.push(code);
      deptMap[code] = {
        name,
        head: meta.head,
        designation: meta.designation,
        members,
        initiatives: [],
      };
    }
  }

  // If no departments parsed, fallback
  if (deptOrder.length === 0) {
    return fallbackStructureData;
  }

  // 2. Summary Metrics from rows 14-30 in column 2 & 3
  const summaryMetrics: Record<string, number> = {};
  for (let r = 14; r < Math.min(rows.length, 30); r++) {
    const row = rows[r];
    const key = (row[2] || "").trim().toLowerCase();
    const val = parseInt((row[3] || "").trim(), 10);
    if (key && !isNaN(val)) {
      summaryMetrics[key] = val;
    }
  }

  // 3. Parse Initiatives (columns 12 to 17)
  const founderInitiatives: [string, number][] = [];
  for (let r = 2; r < 30; r++) {
    const row = rows[r];
    if (!row) continue;
    const name = row[13]?.trim() || "";
    if (!name || name === "Initiative Name") continue;

    const rawMem = parseInt(row[14]?.trim() || "0", 10);
    const count = isNaN(rawMem) ? 0 : rawMem;
    const underCode = row[15]?.trim() || "";
    const newTeam = (row[17] || "").trim().toLowerCase();

    // Primary official assignment: map directly by underCode (T101-T113)
    if (underCode && deptMap[underCode]) {
      deptMap[underCode].initiatives.push([name, count]);
    } else if (newTeam.includes("founder")) {
      founderInitiatives.push([name, count]);
    } else {
      // Check if newTeam matches any department name
      let matched = false;
      if (newTeam) {
        for (const [, d] of Object.entries(deptMap)) {
          if (
            d.name.toLowerCase().includes(newTeam) ||
            newTeam.includes(d.name.toLowerCase())
          ) {
            d.initiatives.push([name, count]);
            matched = true;
            break;
          }
        }
      }
      if (!matched) {
        founderInitiatives.push([name, count]);
      }
    }
  }

  // 4. Parse Universities & Campus Leads (columns 9 & 10 or 6 & 7)
  const uniMap = new Map<string, number>();
  for (let r = 2; r < Math.min(rows.length, 75); r++) {
    const row = rows[r];
    // Check col 9 & 10 first (LCB Campus Lead Summary table)
    const rawU9 = row[9]?.trim();
    const c10 = parseInt(row[10]?.trim() || "0", 10);
    if (
      rawU9 &&
      !isNaN(c10) &&
      c10 > 0 &&
      !rawU9.includes("Summary") &&
      !rawU9.includes("Name")
    ) {
      const norm = normalizeUniName(rawU9);
      uniMap.set(norm, (uniMap.get(norm) || 0) + c10);
    }
  }

  const sortedUnis: [string, number][] = Array.from(uniMap.entries()).sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
  );

  const finalUnis =
    sortedUnis.length > 0 ? sortedUnis : fallbackStructureData.unis;

  // 5. Build depts tuple array
  const finalDepts: [string, string, string, number, [string, number][]][] =
    deptOrder.map((code) => {
      const d = deptMap[code];
      return [d.name, d.head, d.designation, d.members, d.initiatives];
    });

  // Calculate totals
  const computedCentral = finalDepts.reduce((acc, d) => acc + d[3], 0);
  const n_central =
    summaryMetrics["central team"] ||
    (computedCentral > 0 ? computedCentral : fallbackStructureData.n_central);

  const computedCl = finalUnis.reduce((acc, u) => acc + u[1], 0);
  const n_cl =
    summaryMetrics["campus lead head count"] ||
    (computedCl > 0 ? computedCl : fallbackStructureData.n_cl);

  const n_uni =
    summaryMetrics["unique universities having campus lead"] ||
    finalUnis.length;

  const n_ini =
    founderInitiatives.length +
    finalDepts.reduce((acc, d) => acc + d[4].length, 0);

  const n_roles =
    founderInitiatives.reduce((acc, f) => acc + f[1], 0) +
    finalDepts.reduce(
      (acc, d) => acc + d[4].reduce((a, i) => a + i[1], 0),
      0
    );

  const n_people =
    summaryMetrics["campus leads involved in initiative teams"] ||
    fallbackStructureData.n_people;

  const now = new Date();
  const monthName = now.toLocaleString("en-US", { month: "long" });
  const year = now.getFullYear();

  return {
    lastUpdated: `${monthName} ${year}`,
    depts: finalDepts,
    founder:
      founderInitiatives.length > 0
        ? founderInitiatives
        : fallbackStructureData.founder,
    unis: finalUnis,
    n_central,
    n_cl,
    n_uni: n_uni > 0 ? n_uni : fallbackStructureData.n_uni,
    n_ini: n_ini > 0 ? n_ini : fallbackStructureData.n_ini,
    n_roles: n_roles > 0 ? n_roles : fallbackStructureData.n_roles,
    n_people,
  };
}

/**
 * Fetches the live Google Sheet with Next.js ISR (5-minute cache),
 * and parses it safely. Falls back to verified baseline data on any network or parsing error.
 */
export async function getStructureData(): Promise<StructureData> {
  try {
    const res = await fetch(GOOGLE_SHEET_CSV_URL, {
      next: { revalidate: 300 }, // Auto-updates from Google Sheets every 5 min
      headers: {
        "User-Agent": "LCB-Website-Structure-Sync/1.0",
      },
    });

    if (!res.ok) {
      console.warn(
        `[getStructureData] Google Sheet responded with status ${res.status}. Using fallback data.`
      );
      return fallbackStructureData;
    }

    const csvText = await res.text();
    if (!csvText || csvText.length < 100) {
      return fallbackStructureData;
    }

    return parseSheetData(csvText);
  } catch (err) {
    console.error(
      "[getStructureData] Failed to fetch or parse Google Sheet:",
      err
    );
    return fallbackStructureData;
  }
}
