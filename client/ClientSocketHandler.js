import SocketHandler from "../common/SocketHandler.js";
import * as net from 'net'

export default class ClientSocketHandler extends SocketHandler {

    constructor(socket, options) {
        super(socket);
        this.host = options.host;
        this.port = options.port;
        this.localPort = options.localPort
        this.init(options);
        this.pipes = {}
    }

    async init(options) {
        let response = await this.sendAndWait({
            type: "ALOHA",
            remotePort: options.remotePort,
            key: options.key
        });
        if (response.code < 0) {
            console.log(response.message)
            process.exit(0);
        }
        this.clientId = response.id;
        console.log(`Connection established: ID-${this.clientId}`)
        this.on('packet', packet => {
            switch (packet.type) {
                case "NEW_PIPE":
                    this.createPipe(packet.uuid)
            }
        })

    }

    createPipe(uuid){
        let socket = new net.Socket();
        socket.connect(this.port,this.host, () => {
            let handler = new SocketHandler(socket);
            handler.write({
                type: "PIPE",
                clientId: this.clientId,
                pipeUUID: uuid
            })
            handler.destory()
            let outSoscket = net.connect(this.localPort,"localhost", () => {
                outSoscket.on('data', data => {
                    socket.write(data);
                })
                socket.on('data',data => {
                    outSoscket.write(data);
                })
            })
        })
    }


}