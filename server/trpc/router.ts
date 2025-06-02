import { router } from "./trpc";
import { userRouter } from "./routers/user";
import { calendarRouter } from "./routers/calendar";

export const appRouter = router({
  user: userRouter,
  calendar: calendarRouter,
});

export type AppRouter = typeof appRouter;
