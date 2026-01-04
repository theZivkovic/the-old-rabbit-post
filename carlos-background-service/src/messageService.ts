import amqp from "amqplib";

export async function dispatchMessages(messageObjs: Array<any>) {
  let connection: amqp.ChannelModel | null = null;
  let channel: amqp.ConfirmChannel | null = null;

  try {
    connection = await amqp.connect(
      process.env.RABBIT_MQ_CONNECTION_STRING as string
    );

    channel = await connection.createConfirmChannel();

    await channel.assertExchange("dead_letter_exchange", "direct", {
      durable: true,
    });

    await channel.assertQueue("dead_letter_queue", {
      durable: true,
    });

    await channel.bindQueue(
      "dead_letter_queue",
      "dead_letter_exchange",
      "message.failed"
    );

    await channel.assertExchange("messages_exchange", "direct", {
      durable: true,
    });

    messageObjs.forEach((messageObj) => {
      channel!.publish(
        "messages_exchange",
        "message.created",
        Buffer.from(JSON.stringify(messageObj)),
        {persistent: true}
      );
    });

    await channel.waitForConfirms();

    console.log(`Messages sent to exchange: ${JSON.stringify(messageObjs)}`);
  } finally {
    await channel?.close();
    await connection?.close();
  }
}
