import { IncidentsService } from '../incidents.service';

describe('IncidentsService (unit)', () => {
    let service: IncidentsService;
    const mockRepo: any = {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };
    const mockEvents: any = { publishCreated: jest.fn(), publishUpdated: jest.fn(), publishDeleted: jest.fn() };
    const mockAudit: any = { log: jest.fn() };

    beforeEach(() => {
        // ensure mock has findById alias
        mockRepo.findById = mockRepo.findFirst
        service = new IncidentsService(mockRepo as any, mockEvents as any, mockAudit as any);
        jest.clearAllMocks();
    });

    it('create should call repo and events and audit', async () => {
        mockRepo.create.mockResolvedValue({ id: '1', title: 't' });
        const res = await service.create({ title: 't', description: 'd', service: 's', severity: 'low' } as any);
        expect(res).toBeDefined();
        expect(mockRepo.create).toHaveBeenCalled();
        expect(mockEvents.publishCreated).toHaveBeenCalled();
        expect(mockAudit.log).toHaveBeenCalledWith('INCIDENT_CREATED', res!.id, null, res);
    });

    it('findOne not found should throw', async () => {
        mockRepo.findFirst.mockResolvedValue(null);
        await expect(service.findOne('x')).rejects.toThrow();
    });

    it('update should call audit and events', async () => {
        mockRepo.findFirst.mockResolvedValue({ id: '1', title: 't' });
        mockRepo.update.mockResolvedValue({ id: '1', title: 't2' });
        const res = await service.update('1', { title: 't2' } as any);
        expect(mockAudit.log).toHaveBeenCalledWith('INCIDENT_UPDATED', '1', expect.any(Object), expect.any(Object));
        expect(mockEvents.publishUpdated).toHaveBeenCalled();
    });

    it('remove should soft delete and publish', async () => {
        mockRepo.findFirst.mockResolvedValue({ id: '1' });
        mockRepo.softDelete = jest.fn().mockResolvedValue({ id: '1' });
        const r = await service.remove('1');
        expect(mockRepo.softDelete).toHaveBeenCalledWith('1');
        expect(mockEvents.publishDeleted).toHaveBeenCalledWith({ id: '1' });
    });
});

