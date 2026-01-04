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
