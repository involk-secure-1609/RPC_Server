import { Channel, Connection, connect } from "amqplib";
import Consumer from "./consumer";
import Producer from "./producer";
import config from "../config";

// Singleton Instance
class RabbitMQClient {
  private constructor() {}

  private static instance: RabbitMQClient;
  private isInitialzed: boolean = false;
  private producer: Producer;
  private consumer: Consumer;
  private connection: Connection;
  private producerChannel: Channel;
  private consumerChannel: Channel;

  public static getInstance() {
    if (!this.instance) {
      this.instance = new RabbitMQClient();
    }

    return this.instance;
  }
  async initialize() {
    if (this.isInitialzed) {
      return;
    }
    try {
      this.connection = await connect(config.rabbitMQ.url);

      this.producerChannel = await this.connection.createChannel();
      this.consumerChannel = await this.connection.createChannel();

      // setting exclusive to true means that when this channel is deleted
      // the queue also will be deleted
      const { queue: rpcQueue } = await this.consumerChannel.assertQueue(
        config.rabbitMQ.queues.rpcQueue,
        { exclusive: true }
      );

      this.consumer = new Consumer(this.consumerChannel, rpcQueue);
      this.producer = new Producer(this.producerChannel);

      this.consumer.consumeMessages();
      this.isInitialzed = true;
    } catch (error) {
      console.log("rabbitMQ error: ", error);
    }
  }

  async produce(data: any, correlationId: string, replyToQueue: string) {
    if (!this.isInitialzed) {
      await this.initialize();
    }
    return await this.producer.produceMessage(
      data,
      correlationId,
      replyToQueue
    );
  }
}

export default RabbitMQClient.getInstance();
