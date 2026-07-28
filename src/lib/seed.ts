import { prisma } from "./prisma";
import { DEFAULT_CATEGORIES, TX_KINDS } from "./constants";

/**
 * Seed the default categories for a newly created user.
 * Only called once, right after user creation, so there are no
 * existing rows to collide with the (userId, kind, name) unique constraint.
 * (SQLite doesn't support Prisma's skipDuplicates, hence a plain createMany.)
 */
export async function seedDefaultCategories(userId: string) {
  const rows = TX_KINDS.flatMap((kind) =>
    DEFAULT_CATEGORIES[kind].map((c) => ({
      userId,
      kind,
      name: c.name,
      icon: c.icon,
      color: c.color,
      isDefault: true,
    })),
  );

  await prisma.category.createMany({ data: rows });
}
