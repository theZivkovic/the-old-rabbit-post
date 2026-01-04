import type {QueryResult} from "pg";
import type {BlueBookEntry, BlueBookEntryStatus} from "./blueBookEntry.js";
import {pool} from "./db.js";

const BlueBookEntryTable = "blue_book_entries";

class BlueBookEntryRepository {
  async getAllByStatus(status: BlueBookEntryStatus): Promise<BlueBookEntry[]> {
    const queryResult: QueryResult<BlueBookEntry> = await pool.query(
      `SELECT * FROM ${BlueBookEntryTable} WHERE status = $1`,
      [status]
    );
    return queryResult.rows;
  }

  async updateStatuses(ids: number[], status: BlueBookEntry["status"]) {
    if (ids.length === 0) {
      return;
    }
    const inClause = ids.map((_, index) => `$${index + 2}`).join(", ");
    const queryResult: QueryResult<BlueBookEntry> = await pool.query(
      `UPDATE ${BlueBookEntryTable}
        SET status = $1
        WHERE id IN (${inClause})
        RETURNING *`,
      [status, ...ids]
    );
    return queryResult.rows[0];
  }
}

const blueBookEntryRepository = new BlueBookEntryRepository();
export {blueBookEntryRepository};
