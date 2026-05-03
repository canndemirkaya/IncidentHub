import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateIncidentDto } from './dto/request/create-incident.dto';

@Injectable()
export class IncidentsRepository {
    constructor(private prisma: PrismaService) { }

    async create(data: CreateIncidentDto) {
        return this.prisma.incident.create({ data });
    }

    async findById(id: string) {
        return this.prisma.incident.findFirst({ where: { id, deletedAt: null } });
    }

    async findAndCount(filters: any, page = 1, limit = 10) {
        const where: any = { deletedAt: null };
        if (filters.status) where.status = filters.status;
        if (filters.severity) where.severity = filters.severity;
        if (filters.service) where.service = { contains: filters.service, mode: 'insensitive' };

        const [items, count] = await Promise.all([
            this.prisma.incident.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.incident.count({ where }),
        ]);
        return { items, count };
    }

    async update(id: string, data: any) {
        return this.prisma.incident.update({ where: { id }, data });
    }

    async softDelete(id: string) {
        return this.prisma.incident.update({ where: { id }, data: { deletedAt: new Date() } });
    }

    async getSummary() {
        const total = await this.prisma.incident.count({ where: { deletedAt: null } });
        const open = await this.prisma.incident.count({ where: { deletedAt: null, status: 'open' } });
        const investigating = await this.prisma.incident.count({ where: { deletedAt: null, status: 'investigating' } });
        const resolved = await this.prisma.incident.count({ where: { deletedAt: null, status: 'resolved' } });
        const critical = await this.prisma.incident.count({ where: { deletedAt: null, severity: 'critical' } });
        return { total, open, investigating, resolved, critical };
    }
}
