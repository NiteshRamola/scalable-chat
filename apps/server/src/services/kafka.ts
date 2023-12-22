import fs from "fs";
import { Kafka, Producer } from "kafkajs";
import path from "path";
import prismaClient from "./prisma";

const kafka = new Kafka({
  brokers: [`${process.env.KAFKA_BROKER}`],
  ssl: {
    ca: [fs.readFileSync(path.resolve("./src/services/ca.pem"), "utf-8")],
  },
  sasl: {
    username: `${process.env.KAFKA_USER}`,
    password: `${process.env.KAFKA_PASSWORD}`,
    mechanism: "plain",
  },
});

let producer: null | Producer = null;

export async function createProducer() {
  if (producer) return producer;

  const _producer = kafka.producer();
  await _producer.connect();
  producer = _producer;

  return producer;
}

export async function produceMessage(message: string) {
  const producer = await createProducer();

  producer.send({
    topic: "MESSAGES",
    messages: [{ key: `message-${Date.now()}`, value: message }],
  });

  console.log("Message sent to kafka broker");
}

export async function startMessageConsumer() {
  const consumer = kafka.consumer({ groupId: "default" });

  await consumer.connect();

  await consumer.subscribe({ topic: "MESSAGES" });

  await consumer.run({
    autoCommit: true,
    eachMessage: async ({ message, pause }) => {
      if (!message.value) return;

      console.log("New message received in kafka", message?.value?.toString());

      try {
        await prismaClient.message.create({
          data: {
            text: message.value?.toString(),
          },
        });
      } catch (err) {
        console.log("Error from consumer", err);

        pause();
        setTimeout(() => {
          consumer.resume([{ topic: "MESSAGES" }]);
        }, 60 * 1000);
      }
    },
  });
}

export default kafka;
