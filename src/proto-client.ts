import http from 'node:http';

import { KubeConfig } from './config.js';

export class ProtoClient {
    public readonly 'config': KubeConfig;

    public async get(msgType: any, requestPath: string): Promise<any> {
        const server = this.config.getCurrentCluster()!.server;
        const u = new URL(server);
        const options = {
            path: requestPath,
            hostname: u.hostname,
            protocol: u.protocol,
        };
        await this.config.applyToHTTPSOptions(options);
        const req = http.request(options);

        const result = await new Promise<any>((resolve, reject) => {
            let data = '';
            req.on('data', (chunk) => {
                data = data + chunk;
            });
            req.on('end', () => {
                const obj = msgType.deserializeBinary(data);
                resolve(obj);
            });
            req.on('error', (err) => {
                reject(err);
            });
        });
        req.end();
        return result;
    }
}
