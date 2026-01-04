import amqp from "amqplib";
import {withExponentialBackoff} from "./withExponentialBackoff.js";
import {BlueBookEntryStatus, type BlueBookEntry} from "./blueBookEntry.js";
const {blueBookEntryRepository} = await import("./blueBookEntryRepository.js");

const MAX_RETRIES = 3;

export class ConsumerService {
  async consumeMessages() {
    const RABBIT_MQ_CONNECTON_RETRIES = 10;
    const RABBIT_MQ_INITIAL_DELAY_MS = 1000;

    const connection = await withExponentialBackoff(
      () => amqp.connect(process.env.RABBIT_MQ_CONNECTION_STRING as string),
      RABBIT_MQ_CONNECTON_RETRIES,
      RABBIT_MQ_INITIAL_DELAY_MS
    );

    const channel = await connection.createChannel();

    await channel.assertExchange(
      "notifications_dead_letter_exchange",
      "direct",
      {
        durable: true,
      }
    );

    await channel.assertQueue("notifications_dead_letter_queue", {
      durable: true,
    });

    await channel.bindQueue(
      "notifications_dead_letter_queue",
      "notifications_dead_letter_exchange",
      "notification.failed"
    );

    await channel.assertExchange("notifications_exchange", "direct", {
      durable: true,
    });

    await channel.assertQueue("notifications_queue", {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": "notifications_dead_letter_exchange",
        "x-dead-letter-routing-key": "notification.failed",
      },
    });

    await channel.bindQueue(
      "notifications_queue",
      "notifications_exchange",
      "notification.created"
    );

    console.log(
      "Waiting for messages in %s. To exit press CTRL+C",
      "notifications_queue"
    );

    await channel.consume(
      "notifications_queue",
      async (msg: amqp.ConsumeMessage | null) => {
        if (msg !== null) {
          this.processMessage(channel, msg);
        }
      },
      {noAck: false}
    );
  }

  private async processMessage(
    channel: amqp.Channel,
    msg: amqp.ConsumeMessage
  ) {
    console.log("Processing message:", msg.content.toString());
    const message = JSON.parse(msg.content.toString()) as BlueBookEntry;
    try {
      await blueBookEntryRepository.updateStatus(
        message.id,
        BlueBookEntryStatus.TAKEN_BY_POSTMAN
      );
      await this.waitFor(10000);
      await blueBookEntryRepository.updateStatus(
        message.id,
        BlueBookEntryStatus.DELIVERED
      );
      channel.ack(msg);
      console.log("Done processing message:", msg.content.toString());
    } catch {
      console.error("Error processing message: ", msg.content.toString());
      const retries = msg.properties.headers?.["x-retries"] || 0;

      if (retries < MAX_RETRIES) {
        const headers = {
          ...msg.properties.headers,
          "x-retries": retries + 1,
        };

        channel.publish(
          "notifications_exchange",
          "notification.created",
          msg.content,
          {headers, persistent: true}
        );

        console.log(`Message requeued with retry count: ${retries + 1}`);
        channel.ack(msg);
        return;
      } else {
        console.log(
          `Message moved to DLQ after ${retries} retries: ${msg.content.toString()}`
        );
        channel.reject(msg, false);
      }
    } finally {
    }
  }

  private waitFor(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
