import type {QueryResult} from "pg";
import type {BlueBookEntry} from "./blueBookEntry.js";
import {pool} from "./db.js";

const BlueBookEntryTable = "blue_book_entries";

class BlueBookEntryRepository {
  async getAll() {
    const queryResult: QueryResult<BlueBookEntry> = await pool.query(
      `SELECT * FROM ${BlueBookEntryTable}`
    );
    return queryResult.rows;
  }
  async create(entry: Omit<BlueBookEntry, "id">) {
    const queryResult: QueryResult<BlueBookEntry> = await pool.query(
      `INSERT INTO ${BlueBookEntryTable} (title, body, from_name, to_name, status) 
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
      [entry.title, entry.body, entry.from_name, entry.to_name, entry.status]
    );
    return queryResult.rows[0];
  }
}

const blueBookEntryRepository = new BlueBookEntryRepository();
export {blueBookEntryRepository};
