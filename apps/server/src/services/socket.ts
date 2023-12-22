import Redis from "ioredis";
import { Server } from "socket.io";

const redisConfig = {
  host: process.env.REDIS_HOST,
  port: +(process.env.REDIS_PORT || 0),
  username: process.env.REDIS_USER,
  password: process.env.REDIS_PASSWORD,
};

const pub = new Redis(redisConfig);
const sub = new Redis(redisConfig);

class SocketService {
  private _io: Server;
  constructor() {
    console.log("Socket service started...");
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });
    sub.subscribe("MESSAGES");
  }

  public initListeners() {
    const io = this.io;

    io.on("connect", (socket) => {
      console.log(`New socket connected`, socket.id);

      socket.on("event:message", async ({ message }: { message: string }) => {
        console.log("New message:", message);

        await pub.publish("MESSAGES", JSON.stringify({ message }));
      });
    });

    sub.on("message", (channel, message) => {
      if (channel === "MESSAGES") {
        console.log("Redis:", message);
        io.emit("message", message);
      }
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
