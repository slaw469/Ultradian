import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type CreateContextOptions = {
  session: Awaited<ReturnType<typeof getSession>>;
};

/**
 * This creates a server-side context for each request
 */
const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma,
  };
};

export const createTRPCContext = async () => {
  const session = await getSession();

  return createInnerTRPCContext({
    session,
  });
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof Error
            ? error.cause.message
            : error.message,
      },
    };
  },
});

/**
 * Router and procedure helpers
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected (authenticated) procedure
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});
