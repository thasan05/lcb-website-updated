import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src", "content", "data");

export function readJsonFile<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export function writeJsonFile<T>(filename: string, data: T): void {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

export type ApplicationsConfig = {
  campusLeads: { open: boolean; formUrl: string };
  centralTeam: { open: boolean; formUrl: string };
};

export function getApplicationsConfig(): ApplicationsConfig {
  return readJsonFile<ApplicationsConfig>("applications.json");
}
