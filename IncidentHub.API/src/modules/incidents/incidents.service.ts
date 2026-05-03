import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { IncidentsRepository } from './incidents.repository';
import { CreateIncidentDto } from './dto/request/create-incident.dto';
import { UpdateIncidentDto } from './dto/request/update-incident.dto';
import { IncidentsEvents } from './incidents.events';
import { toIncidentResponse } from './incidents.mapper';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class IncidentsService {
    constructor(
        private repo: IncidentsRepository,
        private events: IncidentsEvents,
        private auditLogs: AuditLogsService,
    ) { }

    async create(dto: CreateIncidentDto) {
        const created = await this.repo.create(dto);
        if (!created) throw new InternalServerErrorException('Failed to create incident');
        const resp = toIncidentResponse(created);
        await this.auditLogs.log('INCIDENT_CREATED', resp!.id, null, resp!);
        this.events.publishCreated(resp!);
        return resp!;
    }

    async findAll(query: any) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const { items, count } = await this.repo.findAndCount(query, page, limit);
        return {
            data: items.map(toIncidentResponse),
            meta: {
                page,
                limit,
                total: count,
                totalPages: Math.ceil(count / limit) || 1,
                hasNextPage: page * limit < count,
                hasPreviousPage: page > 1,
            },
        };
    }

    async findOne(id: string) {
        const found = await this.repo.findById(id);
        if (!found) throw new NotFoundException('Incident not found');
        return toIncidentResponse(found);
    }

    async update(id: string, dto: UpdateIncidentDto) {
        const existing = await this.repo.findById(id);
        if (!existing) throw new NotFoundException('Incident not found');
        const before = toIncidentResponse(existing);
        const updatedEntity = await this.repo.update(id, dto as any);
        const resp = toIncidentResponse(updatedEntity);
        await this.auditLogs.log('INCIDENT_UPDATED', id, before, resp);
        this.events.publishUpdated(resp);
        return resp;
    }

    async remove(id: string) {
        const existing = await this.repo.findById(id);
        if (!existing) throw new NotFoundException('Incident not found');
        const before = toIncidentResponse(existing);
        await this.repo.softDelete(id);
        await this.auditLogs.log('INCIDENT_DELETED', id, before, null);
        this.events.publishDeleted({ id });
        return { id };
    }

    async summary() {
        return this.repo.getSummary();
    }
}
