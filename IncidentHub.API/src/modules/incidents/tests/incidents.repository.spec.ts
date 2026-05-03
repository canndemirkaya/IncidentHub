import { IncidentsRepository } from '../incidents.repository';

describe('IncidentsRepository', () => {
    let repo: IncidentsRepository;
    const mockPrisma: any = {
        incident: {
            create: jest.fn(),
            findFirst: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
            update: jest.fn(),
        },
    };

    beforeEach(() => {
        repo = new IncidentsRepository(mockPrisma as any);
        jest.clearAllMocks();
    });

    it('create should call prisma.create', async () => {
        mockPrisma.incident.create.mockResolvedValue({ id: '1' });
        const r = await repo.create({ title: 't' } as any);
        expect(mockPrisma.incident.create).toHaveBeenCalledWith({ data: { title: 't' } });
        expect(r).toEqual({ id: '1' });
    });

    it('findById should call prisma.findFirst with deletedAt null', async () => {
        mockPrisma.incident.findFirst.mockResolvedValue({ id: '1' });
        const r = await repo.findById('1');
        expect(mockPrisma.incident.findFirst).toHaveBeenCalledWith({ where: { id: '1', deletedAt: null } });
        expect(r).toEqual({ id: '1' });
    });

    it('findAndCount should query prisma findMany and count', async () => {
        mockPrisma.incident.findMany.mockResolvedValue([{ id: '1' }]);
        mockPrisma.incident.count.mockResolvedValue(1);
        const res = await repo.findAndCount({}, 1, 10);
        expect(mockPrisma.incident.findMany).toHaveBeenCalled();
        expect(mockPrisma.incident.count).toHaveBeenCalled();
        expect(res.count).toBe(1);
    });

    it('update should call prisma.update', async () => {
        mockPrisma.incident.update.mockResolvedValue({ id: '1', title: 't2' });
        const r = await repo.update('1', { title: 't2' });
        expect(mockPrisma.incident.update).toHaveBeenCalledWith({ where: { id: '1' }, data: { title: 't2' } });
        expect(r.title).toBe('t2');
    });

    it('softDelete should set deletedAt', async () => {
        mockPrisma.incident.update.mockResolvedValue({ id: '1', deletedAt: new Date() });
        const r = await repo.softDelete('1');
        expect(mockPrisma.incident.update).toHaveBeenCalledWith({ where: { id: '1' }, data: { deletedAt: expect.any(Date) } });
        expect(r.id).toBe('1');
    });
});
