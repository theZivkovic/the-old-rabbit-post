import express, {type Request, type Response} from "express";
import {
  dispatchNotification,
  flushNotificationsFromDeadletter,
} from "./notifications.js";

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());

app.post("/notifications", async (req: Request, res: Response) => {
  try {
    const notificationMessage = req.body.message;
    if (!notificationMessage) {
      return res.status(400).send("Message is required");
    }

    await dispatchNotification(notificationMessage);
    res.status(200).json({message: "Notification dispatched successfully"});
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post(
  "/notifications/flush-from-deadletter",
  async (req: Request, res: Response) => {
    try {
      await flushNotificationsFromDeadletter();
      res
        .status(200)
        .json({message: "Notifications flushed from dead letter queue"});
    } catch (error) {
      console.error("Error processing request:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

app.listen(PORT, () => {
  console.log(`Ottos stand service is running on port ${PORT}.`);
});
