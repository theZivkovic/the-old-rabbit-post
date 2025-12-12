import express, { type Request, type Response } from "express";
import {
  dispatchNotification,
  flushNotificationsFromDeadletter,
} from "./notifications.js";

const app = express();

app.post(
  "/notifications",
  express.json(),
  async (req: Request, res: Response) => {
    try {
      const notificationMessage = req.body.message;
      if (!notificationMessage) {
        return res.status(400).send("Message is required");
      }

      await dispatchNotification(notificationMessage);
    } catch (error) {
      console.error("Error processing request:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

app.post(
  "/notifications/flush-from-deadletter",
  async (req: Request, res: Response) => {
    try {
      await flushNotificationsFromDeadletter();
    } catch (error) {
      console.error("Error processing request:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

app.listen(process.env.PORT || 3000, () => {
  console.log("Producer service is running.");
});
