import { z } from "zod";
import { createRouter } from "./context";
import * as jwt from "jsonwebtoken";
import crypto from "crypto";

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

      const user = await ctx.prisma.user.findUnique({
        where: {
          id: payload.id,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const { private_key } = user;

      const priv = Buffer.from(private_key);

      const kyc = await ctx.prisma.kYC.findUnique({
        where: {
          userId: payload.id,
        },
      });

      if (!kyc) {
        throw new Error("KYC not found");
      }

      let { aadharId, driversLicenseId, panId, passport } = kyc;

      const aadhar = crypto
        .privateDecrypt(
          {
            key: priv,
            padding: crypto.constants.RSA_NO_PADDING,
          },
          Buffer.from(aadharId, "base64")
        )
        .toString("base64");
      const driversLicense = crypto
        .privateDecrypt(
          {
            key: priv,
            padding: crypto.constants.RSA_NO_PADDING,
          },
          Buffer.from(driversLicenseId, "base64")
        )
        .toString("base64");
      const pan = crypto
        .privateDecrypt(
          {
            key: priv,
            padding: crypto.constants.RSA_NO_PADDING,
          },
          Buffer.from(panId, "base64")
        )
        .toString("base64");
      const passportId = crypto
        .privateDecrypt(
          {
            key: priv,
            padding: crypto.constants.RSA_NO_PADDING,
          },
          Buffer.from(passport, "base64")
        )
        .toString("base64");

      return {
        aadharId: aadhar,
        driversLicenseId: driversLicense,
        panId: pan,
        passport: passportId,
        id: kyc.id,
        createdAt: kyc.createdAt,
      };
    },
  })
  .query("isKycDone", {
    input: z.object({
      id: z.string(),
    }),
    resolve: ({ ctx, input }) => {
      console.log(ctx.req.cookies);
      return true;
    },
  })
  .mutation("create_token", {
    resolve: async ({ ctx }) => {
      ctx.res.setHeader(
        "Set-Cookie",
        `kyc_token=verified; path=/; httpOnly; sameSite=strict`
      );
    },
  })
  .mutation("create", {
    input: z
      .object({
        aadharId: z.string().min(12).max(12),
        panId: z.string().min(10).max(10),
        driverLicenseId: z.string().min(7).max(7),
        passport: z.string().min(8).max(8),
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

      let { aadharId, driverLicenseId, panId, passport } = input;

      aadharId = crypto
        .publicEncrypt(
          {
            key: Buffer.from(user.public_key),
          },
          Buffer.from(aadharId, "base64")
        )
        .toString("base64");

      driverLicenseId = crypto
        .publicEncrypt(
          {
            key: Buffer.from(user.public_key),
          },
          Buffer.from(driverLicenseId, "base64")
        )
        .toString("base64");

      panId = crypto
        .publicEncrypt(
          {
            key: Buffer.from(user.public_key),
          },
          Buffer.from(panId, "base64")
        )
        .toString("base64");

      passport = crypto
        .publicEncrypt(
          {
            key: Buffer.from(user.public_key),
          },
          Buffer.from(passport, "base64")
        )
        .toString("base64");

      const kyc = await ctx.prisma.kYC.create({
        data: {
          aadharId: aadharId,
          panId: panId,
          driversLicenseId: driverLicenseId,
          passport: passport,
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
