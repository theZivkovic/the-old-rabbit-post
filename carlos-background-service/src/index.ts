import cron from "node-cron";
import {blueBookEntryRepository} from "./blueBookEntryRepository.js";
import {BlueBookEntryStatus} from "./blueBookEntry.js";
import {dispatchMessages} from "./messageService.js";

const task = cron.schedule(
  "* * * * *",
  async () => {
    await cronTick();
    const now = new Date().toISOString();
    console.log(`[${now}] Task executed successfully!`);
  },
  {
    timezone: "UTC",
  }
);

async function cronTick() {
  const blueBookEntriesToProcess = await blueBookEntryRepository.getAllByStatus(
    BlueBookEntryStatus.NEW
  );
  await blueBookEntryRepository.updateStatuses(
    blueBookEntriesToProcess.map((entry) => entry.id),
    BlueBookEntryStatus.TAKEN_BY_CARLO
  );
  await dispatchMessages(blueBookEntriesToProcess);
}

task.start();

console.log("Cron job service started.");
