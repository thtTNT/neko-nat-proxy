import { program } from 'commander'
import * as net from 'net'
import SocketHandler from './ClientSocketHandler.js';

program
    .option('-p, --port <port>', 'the listen port of host', 4000)
    .requiredOption('--host <host>', 'the host of server')
    .requiredOption('-k, --key <key>', 'the key of host')
    .requiredOption('-l, --local <local>', 'the local port')
    .requiredOption('-r, --remote <remote>','remote port')
    .parse(process.argv)

let options = program.opts();
let client = new net.Socket()

client.connect(options.port,options.host, () => {
    let handler = new SocketHandler(client,{
        host: options.host,
        port: options.port,
        remotePort: options.remote,
        localPort: options.local,
        key: options.key
    })
})