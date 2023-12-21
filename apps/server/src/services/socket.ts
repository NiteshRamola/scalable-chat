import { Server } from "socket.io";

class SocketService {
  private _io: Server;
  constructor() {
    console.log("Socket service started...");
    this._io = new Server();
  }

  public initListeners() {
    const io = this.io;

    io.on("connect", (socket) => {
      console.log(`New socket connected`, socket.id);

      socket.on("event:message", async ({ message }: { message: string }) => {
        console.log("New message rec.", message);
      });
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
