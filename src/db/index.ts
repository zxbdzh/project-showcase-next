import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// 生产构建会并行起多个 worker,每个 worker 各建一个连接池;
// 不限并发时总连接数轻易超出数据库上限。构建期收紧到每池 1 条,运行期沿用默认。
const isBuild = process.env.NEXT_PHASE === "phase-production-build";

// 开发环境 HMR 会反复重新执行本模块;若每次都 new Pool,旧池不会关闭,
// 连接持续泄漏直至连接耗尽。故把池缓存到 globalThis 复用。
const globalForDb = globalThis as unknown as { __pgPool?: Pool };

const pool =
  globalForDb.__pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: isBuild ? 1 : 10,
    idleTimeoutMillis: 10_000,
  });

if (process.env.NODE_ENV !== "production") globalForDb.__pgPool = pool;

export const db = drizzle(pool, { schema });
