import RabbitMQClient from './RabbitMq/client';
export default class MessageHandler {
  static async handle(
    operation: string,
    data: any,
    correlationId: string,
    replyTo: string,
  ) {
    let res = {};
    const { num1, num2 } = data;
    console.log("the operation is:", operation);

    switch (operation) {
      case "multiply":
        res = num1 * num2;
        break;
      case "add":
        res = num1 + num2;
        break;
      case "subtract":
        res = Math.abs(num1 - num2);
        break;
      default:
        res = 0;
        break;
    }

    await RabbitMQClient.produce(res, correlationId, replyTo);
  }
}
