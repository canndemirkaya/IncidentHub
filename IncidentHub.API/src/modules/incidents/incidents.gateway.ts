import { WebSocketServer, WebSocketGateway, OnGatewayInit } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class IncidentsGateway implements OnGatewayInit {
    @WebSocketServer()
    server!: Server;

    private logger = new Logger('IncidentsGateway');

    afterInit() {
        this.logger.log('Gateway initialized');
    }

    broadcast(event: string, payload: any) {
        if (this.server) this.server.emit(event, payload);
    }
}
