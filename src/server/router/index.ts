// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import { userRouter } from "./userRouter";
import { bankRouter } from "./bankRouter";
import { kycRouter } from "./kycRouter";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("user.", userRouter)
  .merge("bank.", bankRouter)
  .merge("kyc.", kycRouter);

export type AppRouter = typeof appRouter;
