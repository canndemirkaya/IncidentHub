import { Module } from '@nestjs/common';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { IncidentsRepository } from './incidents.repository';
import { PrismaService } from '../../database/prisma.service';
import { IncidentsGateway } from './incidents.gateway';
import { IncidentsEvents } from './incidents.events';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
    controllers: [IncidentsController],
    imports: [AuditLogsModule],
    providers: [IncidentsService, IncidentsRepository, PrismaService, IncidentsGateway, IncidentsEvents],
    exports: [IncidentsService],
})
export class IncidentsModule { }
