import {BlueBookEntry} from "./blueBookEntry";

export async function getAllBlueBookEntries() {
  const response = await fetch("http://localhost:3000/blue-book-entries");
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }
  return (await response.json()) as Array<BlueBookEntry>;
}

export async function createBlueBookEntry() {
  const response = await fetch("http://localhost:3000/blue-book-entries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "New Entry",
      body: "This is the body of the new blue book entry.",
      from_name: "Alice",
      to_name: "Bob",
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create: ${response.status}`);
  }
  return (await response.json()) as BlueBookEntry;
}
