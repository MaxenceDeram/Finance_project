import { prisma } from "../src/server/db/prisma";
import { hashPassword } from "../src/server/security/password";

const demoEmail = "demo@example.com";
const passwordHash = await hashPassword("DemoPassword123!");

const existingDemo = await prisma.user.findUnique({
  where: { email: demoEmail },
  select: { id: true }
});

if (existingDemo) {
  await prisma.portfolio.deleteMany({
    where: { userId: existingDemo.id }
  });

  await prisma.dailyEmailLog.deleteMany({
    where: { userId: existingDemo.id }
  });

  await prisma.auditLog.deleteMany({
    where: { userId: existingDemo.id }
  });

  await prisma.emailVerificationToken.deleteMany({
    where: { userId: existingDemo.id }
  });

  await prisma.session.deleteMany({
    where: { userId: existingDemo.id }
  });
}

await prisma.user.upsert({
  where: { email: demoEmail },
  update: {
    passwordHash,
    emailVerified: true,
    emailVerifiedAt: new Date(),
    preferences: {
      upsert: {
        update: {
          dailyEmailEnabled: true,
          timezone: "Europe/Paris",
          preferredCurrency: "EUR",
          dailyEmailHour: 22
        },
        create: {
          dailyEmailEnabled: true,
          timezone: "Europe/Paris",
          preferredCurrency: "EUR",
          dailyEmailHour: 22
        }
      }
    }
  },
  create: {
    email: demoEmail,
    passwordHash,
    emailVerified: true,
    emailVerifiedAt: new Date(),
    preferences: {
      create: {
        dailyEmailEnabled: true,
        timezone: "Europe/Paris",
        preferredCurrency: "EUR",
        dailyEmailHour: 22
      }
    }
  }
});

await prisma.asset.deleteMany({
  where: {
    OR: [
      { symbol: "CW8", exchange: "EPA", currency: "EUR" },
      { symbol: "MSFT", exchange: "NASDAQ", currency: "EUR" }
    ]
  }
});

console.log("Seed complete. Fresh demo account: demo@example.com / DemoPassword123!");
