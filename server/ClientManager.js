import ClientHandler from "./ClientHandler.js"

export default class ClientManager {

    constructor() {
        this.clients = {}
        this.nextClientId = 0;
    }

    addClient(socketHandler, remotePort) {
        this.nextClientId++;
        this.clients[this.nextClientId] = new ClientHandler(socketHandler, remotePort, this.nextClientId);
        return this.nextClientId;
    }

    registerPipe(clientId, pipeUUID, socket) {
        if (this.clients[clientId]) {
            this.clients[clientId].registerPipe(pipeUUID, socket)
        }
    }

}