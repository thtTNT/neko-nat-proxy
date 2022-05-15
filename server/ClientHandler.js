import SocketHandler from "../common/SocketHandler.js";
import * as net from 'net'
import { v4 as uuidv4 } from 'uuid'

export default class ClientHandler {

    constructor(socketHandler, remotePort, clientID) {
        this.socketHandler = socketHandler
        this.createProxyServer(remotePort)
        this.id = clientID
        this.pipes = {}
        this.printLog(`A client connnected: { RemotePort: ${remotePort} }`)
    }

    createProxyServer(port) {
        this.proxyServer = net.createServer();
        this.proxyServer.listen(port, '0.0.0.0');
        this.proxyServer.on('connection', (socket) => {
            let pipeUUID = uuidv4().toString();
            this.pipes[pipeUUID] = {};
            this.pipes[pipeUUID].userSocket = socket;
            this.socketHandler.write({
                type: "NEW_PIPE",
                uuid: pipeUUID.toString()
            })
        })
    }

    registerPipe(uuid, socket) {
        if (this.pipes[uuid]) {
            this.pipes[uuid].clientSocket = socket;
            this.pipes[uuid].userSocket.on("data", data => {
                this.pipes[uuid].clientSocket.write(data)
            })
            this.pipes[uuid].clientSocket.on("data", data => {
                this.pipes[uuid].userSocket.write(data)
            })
            this.printLog(`New pipe established: ${uuid}`)
        }
    }

    printLog(message) {
        console.log(`[Client ${this.id}] ${message}`)
    }
}