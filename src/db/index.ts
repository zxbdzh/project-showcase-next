import { drizzle } from "drizzle-orm/node-postgres";
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// 生产构建会并行起多个 worker 做静态生成/取数。裸 TCP(pg)直连 Neon 时,构建机
// (如 GitHub runner)上短时大量连接冷启动的 Neon 实例,连接易被重置(ECONNRESET)。
// 构建期改用 Neon HTTP 驱动:每次查询走一次 HTTPS、无 TCP 长连接,对冷启动/网络
// 抖动更鲁棒;运行期(长运行容器)仍用 pg 连接池,复用连接、低延迟。
const isBuild = process.env.NEXT_PHASE === "phase-production-build";

// 开发环境 HMR 会反复重新执行本模块;若每次都 new Pool,旧池不会关闭,
// 连接持续泄漏直至 Neon 连接耗尽。故把池缓存到 globalThis 复用。
const globalForDb = globalThis as unknown as { __pgPool?: Pool };

function createDb(): NodePgDatabase<typeof schema> {
  if (isBuild) {
    const sql = neon(process.env.DATABASE_URL!);
    // 项目不使用事务,HTTP 驱动的查询 API 与 pg 一致;统一对外暴露 NodePgDatabase 类型。
    return drizzleHttp(sql, { schema }) as unknown as NodePgDatabase<typeof schema>;
  }

  const pool =
    globalForDb.__pgPool ??
    new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 10_000,
    });
  if (process.env.NODE_ENV !== "production") globalForDb.__pgPool = pool;

  return drizzle(pool, { schema });
}

export const db = createDb();
