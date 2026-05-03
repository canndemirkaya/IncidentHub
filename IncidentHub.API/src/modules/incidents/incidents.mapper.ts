export function toIncidentResponse(entity: any) {
    if (!entity) return null;
    const { id, title, description, service, severity, status, createdAt, updatedAt } = entity;
    return { id, title, description, service, severity, status, createdAt, updatedAt };
}
