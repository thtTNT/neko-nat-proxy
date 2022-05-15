import EventEmitter from "events";

export default class SocketHandler extends EventEmitter {

    constructor(socket) {
        super()
        this.socket = socket
        this.buffer = ""
        this.ignore = false
        this.socket.on('data', (data) => {
            for (let chr of data.toString()) {
                if (this.ignore) {
                    this.ignore = false;
                    this.buffer += chr;
                    continue;
                }
                if (chr == '\\') {
                    this.ignore = true;
                    continue;
                }
                if (chr == '\n') {
                    this.emit('packet', JSON.parse(this.buffer))
                    this.buffer = ""
                    continue;
                }
                this.buffer += chr;
            }
        })
    }

    write(packet) {
        let message = JSON.stringify(packet);
        this.socket.write(
            message.replaceAll('\\', '\\\\')
                .replaceAll('\n', '\\\n') + '\n'
        )
    }

    sendAndWait(packet) {
        return new Promise((resolve, reject) => {
            this.once('packet', packet => resolve(packet))
            this.write(packet);
        })
    }

    destory(){
        this.socket.removeAllListeners('data')
    }

}