import amqp from "amqplib";

flushMessages().catch((error) => {
  console.error("Error flushing messages:", error);
});

async function flushMessages() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertQueue("notifications_dead_letter_queue", {
    durable: true,
  });

  while (true) {
    const msg = await channel.get("notifications_dead_letter_queue", {
      noAck: false,
    });

    if (!msg) {
      console.log("No more messages in dead-letter queue.");
      break;
    }

    const originalExchange = msg.properties.headers?.["x-first-death-exchange"];

    if (!originalExchange) {
      console.warn(
        "Message missing x-first-death-exchange header. Acknowledging and skipping."
      );
      channel.nack(msg, false, false);
      continue;
    }

    console.log(
      `Flushing message back to original exchange (${originalExchange}):`,
      msg.content.toString()
    );
    channel.publish(originalExchange, "notification.created", msg.content, {
      persistent: true,
    });

    channel.ack(msg);
  }
}
