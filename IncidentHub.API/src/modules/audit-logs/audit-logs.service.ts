import { Injectable } from '@nestjs/common';
import { AuditLogsRepository } from './audit-logs.repository';

@Injectable()
export class AuditLogsService {
    constructor(private repo: AuditLogsRepository) { }

    async log(action: string, incidentId: string, oldValue?: any, newValue?: any) {
        try {
            await this.repo.create({ action, incidentId, oldValue: oldValue ? oldValue : undefined, newValue: newValue ? newValue : undefined });
        } catch (e) {
            // best-effort logging; do not fail main flow
            console.error('Failed to write audit log', e);
        }
    }

    async getForIncident(incidentId: string) {
        return this.repo.findByIncident(incidentId);
    }
}
