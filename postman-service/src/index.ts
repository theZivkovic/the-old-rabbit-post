import express, {type Request, type Response} from "express";
import {ConsumerService} from "./consumerService.js";

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());

const consumerService = new ConsumerService();

app.listen(PORT, () => {
  console.log(`Postman service is running on port ${PORT}.`);
  consumerService.consumeMessages().catch((error) => {
    console.error("Error consuming messages:", error);
  });
});

app.get("/processed-messages", async (req: Request, res: Response) => {
  try {
    const processedMessages = consumerService.getProcessedMessages();
    res.status(200).json(processedMessages);
  } catch (error) {
    console.error("Error fetching processed messages:", error);
    res.status(500).send("Internal Server Error");
  }
});
