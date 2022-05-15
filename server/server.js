import { program } from 'commander'
import * as net from 'net'
import SocketHandler from '../common/SocketHandler.js';
import Config from './config.js'
import ClientManager from './ClientManager.js';

program
    .option('-p, --port <port>', 'the listen port of server', 4000)
    .requiredOption('-k, --key <key>', 'the key of server')
    .parse(process.argv)

let options = program.opts();
Config.port = options.port
Config.key = options.key

let clientManager = new ClientManager()

let server = net.createServer();
server.listen(Config.port, "0.0.0.0")

server.on("connection", (socket) => {
    let handler = new SocketHandler(socket)
    handler.once("packet", packet => {
        if (packet.type === "ALOHA") {
            if (packet.key !== Config.key) {
                handler.write({
                    type: 'ALOHA_RESPONSE',
                    code: -1,
                    message: 'Wrong key'
                })
                return;
            }
            let clientID = clientManager.addClient(handler, packet.remotePort)
            handler.write({
                type: 'ALOHA_RESPONSE',
                code: 1,
                id: clientID,
                message: 'Create successfully'
            })
        }
        if (packet.type === "PIPE") {
            clientManager.registerPipe(packet.clientId, packet.pipeUUID, socket)
        }
    })
})
