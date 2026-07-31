import { PrismaConfig } from "prisma";

export default {
  earlyAccess: true,
  schema: {
    kind: "single",
    filePath: "./prisma/schema.prisma",
  },
  datasource: {
    url: process.env["DATABASE_URL"]!,
  },
} satisfies PrismaConfig;