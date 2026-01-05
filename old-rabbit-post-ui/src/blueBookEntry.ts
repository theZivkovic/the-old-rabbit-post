export enum BlueBookEntryStatus {
  NEW = "NEW",
  TAKEN_BY_CARLO = "TAKEN_BY_CARLO",
  TAKEN_BY_POSTMAN = "TAKEN_BY_POSTMAN",
  BLOCKED = "BLOCKED",
  DELIVERED = "DELIVERED",
}

export type BlueBookEntry = {
  id: number;
  title: string;
  body: string;
  from_name: string;
  to_name: string;
  status: BlueBookEntryStatus;
  retry_count: number;
  delivering_by?: string;
  created_at: Date;
  updated_at: Date;
};
