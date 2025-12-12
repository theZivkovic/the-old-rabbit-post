import amqp from "amqplib";

export async function dispatchNotification(notificationMessage: string) {
  let connection: amqp.ChannelModel | null = null;
  let channel: amqp.ConfirmChannel | null = null;

  try {
    connection = await amqp.connect(
      process.env.RABBIT_MQ_CONNECTION_STRING as string
    );

    channel = await connection.createConfirmChannel();

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

    channel.publish(
      "notifications_exchange",
      "notification.created",
      Buffer.from(notificationMessage),
      { persistent: true }
    );

    await channel.waitForConfirms();

    console.log(`Message sent to exchange: ${notificationMessage}`);
  } finally {
    await channel?.close();
    await connection?.close();
  }
}

export async function flushNotificationsFromDeadletter() {
  const connection = await amqp.connect(
    process.env.RABBIT_MQ_CONNECTION_STRING as string
  );
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
