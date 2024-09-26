import { Channel, ConsumeMessage } from "amqplib";
import MessageHandler from "../messageHandler";

export default class Consumer {
  constructor(private channel: Channel, private rpcQueue: string) {}

  async consumeMessages() {
    console.log("Ready to consume messages..");
    this.channel.consume(
      this.rpcQueue,
      async (msg: ConsumeMessage | null) => {
        if (msg) {
          const { correlationId, replyTo } = msg.properties;
          const operation = msg.properties.headers?.function;
          if (!correlationId || !replyTo) {
            console.log("Missing properties...");
          } else {
            console.log("Consumed", JSON.parse(msg.content.toString()));
            await MessageHandler.handle(
              operation,
              JSON.parse(msg.content.toString()),
              correlationId,
              replyTo
            );
          }
        } else {
          console.log("received message is NULL");
        }
      },
      {
        // when noAck is true once the message has been consumed succesfully
        // it will be removed from the replyqueue
        noAck: true,
      }
    );
  }
}
