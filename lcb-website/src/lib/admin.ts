import { kvGet, kvSet } from "./kv";

export type ApplicationsConfig = {
  campusLeads: { open: boolean; formUrl: string };
  centralTeam: { open: boolean; formUrl: string };
};

export async function readData<T>(key: string): Promise<T> {
  return kvGet<T>(key);
}

export async function writeData<T>(key: string, data: T): Promise<void> {
  return kvSet(key, data);
}

export async function getApplicationsConfig(): Promise<ApplicationsConfig> {
  return kvGet<ApplicationsConfig>("data:applications");
}
