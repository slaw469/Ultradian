import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const userRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
    });

    return user;
  }),
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        image: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: input,
      });

      return user;
    }),
});
