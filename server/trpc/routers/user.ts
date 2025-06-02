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

  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        calendarConnected: true,
        focusBlockDuration: true,
        breakDuration: true,
        workStartTime: true,
        workEndTime: true,
        chronotype: true,
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

  updateSettings: protectedProcedure
    .input(
      z.object({
        focusBlockDuration: z.number().min(15).max(180).optional(),
        breakDuration: z.number().min(5).max(60).optional(),
        workStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
        workEndTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
        chronotype: z.enum(["EARLY_BIRD", "NIGHT_OWL"]).optional(),
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
