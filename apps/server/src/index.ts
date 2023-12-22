import http from "http";
import { startMessageConsumer } from "./services/kafka";
import SocketService from "./services/socket";

async function init() {
  await startMessageConsumer();
  const socketService = new SocketService();

  const httpServer = http.createServer();
  const PORT = process.env.PORT || 8000;

  socketService.io.attach(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`Server running at PORT: ${PORT}`);
  });

  socketService.initListeners();
}

init();
