import { Module } from '@nestjs/common';
import { AuditLogsRepository } from './audit-logs.repository';
import { AuditLogsService } from './audit-logs.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
    providers: [AuditLogsService, AuditLogsRepository, PrismaService],
    exports: [AuditLogsService],
})
export class AuditLogsModule { }
