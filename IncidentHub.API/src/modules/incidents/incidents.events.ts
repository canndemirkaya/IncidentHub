import { Injectable } from '@nestjs/common';
import { IncidentsGateway } from './incidents.gateway';

@Injectable()
export class IncidentsEvents {
    constructor(private gateway: IncidentsGateway) { }

    publishCreated(payload: any) {
        this.gateway.broadcast('incident.created', payload);
    }

    publishUpdated(payload: any) {
        this.gateway.broadcast('incident.updated', payload);
    }

    publishDeleted(payload: any) {
        this.gateway.broadcast('incident.deleted', payload);
    }
}
