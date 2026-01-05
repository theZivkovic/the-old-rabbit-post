import express, {type NextFunction, type Request, type Response} from "express";
import cors from "cors";
import {flushMessagesFromDeadletter} from "./messagesService.js";
import {buildValidationMiddleware} from "./validationMiddleware.js";
import {createBlueBookEntrySchema} from "./validationSchemas.js";
import {blueBookEntryRepository} from "./blueBookEntryRepository.js";
import {BlueBookEntryStatus} from "./blueBookEntry.js";
import {globalErrorHandlerMiddleware} from "./globalErrorHandler.js";

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cors());

app.post(
  "/blue-book-entries",
  await buildValidationMiddleware(createBlueBookEntrySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const createdBlueBookEntry = await blueBookEntryRepository.create({
        ...req.body,
        status: BlueBookEntryStatus.NEW,
      });
      res.status(201).json(createdBlueBookEntry);
    } catch (error) {
      console.error("Error processing request:", error);
      next(error);
    }
  }
);

app.get(
  "/blue-book-entries",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const blueBookEntries = await blueBookEntryRepository.getAll();
      res.status(200).json(blueBookEntries);
    } catch (error) {
      console.error("Error processing request:", error);
      next(error);
    }
  }
);

app.post(
  "/messages/flush-from-deadletter",
  async (req: Request, res: Response) => {
    try {
      await flushMessagesFromDeadletter();
      res
        .status(200)
        .json({message: "Notifications flushed from dead letter queue"});
    } catch (error) {
      console.error("Error processing request:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

app.use(globalErrorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(`Ottos stand service is running on port ${PORT}.`);
});
