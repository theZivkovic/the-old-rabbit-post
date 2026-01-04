import type {QueryResult} from "pg";
import type {BlueBookEntry} from "./blueBookEntry.js";
import {pool} from "./db.js";

const BlueBookEntryTable = "blue_book_entries";

class BlueBookEntryRepository {
  async updateStatus(id: number, status: BlueBookEntry["status"]) {
    const queryResult: QueryResult<BlueBookEntry> = await pool.query(
      `UPDATE ${BlueBookEntryTable}
        SET status = $1
        WHERE id = $2 
        RETURNING *`,
      [status, id]
    );
    return queryResult.rows[0];
  }
}

const blueBookEntryRepository = new BlueBookEntryRepository();
export {blueBookEntryRepository};
