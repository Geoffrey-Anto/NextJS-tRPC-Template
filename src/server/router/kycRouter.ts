import { z } from "zod";
import { createRouter } from "./context";
import * as jwt from "jsonwebtoken";

export const kycRouter = createRouter()
  .query("getForMe", {
    input: z.object({
      take: z.number().min(0, { message: "Enter Number Greater than 0" }),
    }),
    resolve: async ({ input: { take }, ctx }) => {
      const cookie = ctx.req.headers.cookie;
      if (!cookie) {
        throw new Error("No cookie");
      }
      if (!cookie.includes("user_token")) {
        throw new Error("No token");
      }
      const token = cookie.split("user_token=")[1];
      let payload: any = null;
      try {
        payload = jwt.verify(token, process.env.JWT_SECRET as string);
      } catch (error) {
        throw new Error("Invalid token");
      }
      const kycs = await ctx.prisma.kYC.findMany({
        take,
        where: {
          userId: payload.id,
        },
      });

      return kycs;
    },
  })
  .mutation("create", {
    input: z
      .object({
        aadharId: z.string(),
        panId: z.string(),
        driverLicenseId: z.string(),
        passport: z.string(),
      })
      .required(),
    resolve: async ({ input, ctx }) => {
      const cookie = ctx.req.headers.cookie;
      if (!cookie) {
        throw new Error("No cookie");
      }
      if (!cookie.includes("user_token")) {
        throw new Error("No token");
      }
      const token = cookie.split("user_token=")[1];
      let payload: any = null;
      try {
        payload = jwt.verify(token, process.env.JWT_SECRET as string);
      } catch (error) {
        throw new Error("Invalid token");
      }

      const user = await ctx.prisma.user.findUnique({
        where: {
          id: payload.id,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const kyc = await ctx.prisma.kYC.create({
        data: {
          aadharId: input.aadharId,
          panId: input.panId,
          driversLicenseId: input.driverLicenseId,
          passport: input.passport,
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });

      return kyc;
    },
  });
