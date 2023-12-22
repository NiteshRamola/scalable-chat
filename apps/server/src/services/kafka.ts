import fs from "fs";
import { Kafka, Producer } from "kafkajs";
import path from "path";

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

export default kafka;
