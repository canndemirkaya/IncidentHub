import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.incident.deleteMany();
    const incidents = [
        {
            title: 'Database timeout on payment service',
            description: 'Users are receiving timeout errors during checkout.',
            service: 'Payment API',
            severity: 'high',
        },
        {
            title: 'Auth token expired for many users',
            description: 'Tokens are not refreshed; login fails intermittently.',
            service: 'Auth Service',
            severity: 'medium',
        }
    ];

    for (const i of incidents) {
        await prisma.incident.create({ data: i as any });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
