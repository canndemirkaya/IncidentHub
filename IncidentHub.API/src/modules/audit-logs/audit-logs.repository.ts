import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuditLogsRepository {
    constructor(private prisma: PrismaService) { }

    async create(entry: { incidentId: string; action: string; oldValue?: any; newValue?: any }) {
        return this.prisma.auditLog.create({ data: entry as any });
    }

    async findByIncident(incidentId: string) {
        return this.prisma.auditLog.findMany({ where: { incidentId }, orderBy: { createdAt: 'desc' } });
    }
}
