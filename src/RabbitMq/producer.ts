import { Channel, ConsumeMessage } from "amqplib";
import config from "../config";
import { randomUUID } from "crypto";
export default class Producer {
  constructor(private channel: Channel) {}

  async produceMessage(data: any, correlationId: string, replyToQueue: string) {
    console.log("the correlation id is :" + correlationId);
    this.channel.sendToQueue(replyToQueue, Buffer.from(JSON.stringify(data)), {
      correlationId: correlationId,
    });
  }
}
