// producer/src/index.ts
// Producer script to send notification messages to RabbitMQ
// Usage: npm run build && node ./dist/index.js "Your notification message here"

import amqp from "amqplib";

// Read messages from command line arguments and send them to the exchange
process.argv.slice(2).forEach((msg) => {
  produceNotification(msg);
});

async function produceNotification(notificationMessage: string) {
  let connection: amqp.ChannelModel | null = null;
  let channel: amqp.ConfirmChannel | null = null;

  try {
    connection = await amqp.connect("amqp://localhost");

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
  } catch (error) {
    console.error("Publish error:", error);
  } finally {
    await channel?.close();
    await connection?.close();
  }
}
