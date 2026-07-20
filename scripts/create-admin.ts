import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Creates (or resets the password of) a back-office admin.
// Usage: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=secret npm run admin:create
const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || null;

  if (!email || !password) {
    console.error(
      "Missing env. Usage: ADMIN_EMAIL=you@x.com ADMIN_PASSWORD=secret npm run admin:create"
    );
    process.exit(1);
  }
  if (password.length < 6) {
    console.error("ADMIN_PASSWORD must be at least 6 characters.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.admin.upsert({
    where: { email },
    update: { passwordHash, name },
    create: { email, passwordHash, name },
  });

  console.log(`Admin ready: ${admin.email} (id ${admin.id}). Log in at /admin/login`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
