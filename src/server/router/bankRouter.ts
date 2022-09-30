import { z } from "zod";
import { createRouter } from "./context";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";

export const bankRouter = createRouter()
  .query("getAll", {
    input: z.object({
      take: z.number().min(0, { message: "Enter Number Greater than 0" }),
    }),
    resolve: async ({ input, ctx }) => {
      const cookie = ctx.req.headers.cookie;
      if (!cookie) {
        throw new Error("No cookie");
      }
      if (!cookie.includes("bank_token")) {
        throw new Error("No token");
      }
      const token = cookie.split("bank_token=")[1];
      try {
        jwt.verify(token, process.env.JWT_SECRET as string);
      } catch (error) {
        throw new Error("Invalid token");
      }

      const { take } = input;

      const banksData = await ctx.prisma.bank.findMany({
        take,
        include: {
          applications: {
            select: {
              id: true,
              status: true,
              User: {
                select: {
                  name: true,
                  email: true,
                  id: true,
                },
              },
            },
          },
        },
      });

      const banks = banksData.map((bank, index) => {
        const temp = {
          id: bank.id,
          createdAt: bank.createdAt,
          name: bank.createdAt,
          applications: bank.applications,
        };
        return temp;
      });

      return banks;
    },
  })
  .mutation("register", {
    input: z.object({
      name: z
        .string()
        .min(6, { message: "Name must be at least 3 characters" }),
      email: z.string().email({ message: "Enter a valid email" }),
      password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters" }),
      ifsc_code: z.string().min(11, { message: "Enter a valid IFSC code" }),
    }),
    resolve: async ({ input, ctx }) => {
      const { email, ifsc_code, name, password } = input;

      const hashedPassword = bcrypt.hashSync(password, 12);

      const bank = await ctx.prisma.bank.create({
        data: {
          name,
          password: hashedPassword,
          email,
          ifsc_code,
        },
        select: {
          id: true,
          name: true,
          email: true,
          ifsc_code: true,
          createdAt: true,
        },
      });

      return bank;
    },
  })
  .mutation("login", {
    input: z.object({
      ifsc_code: z.string().min(11, { message: "Enter a valid IFSC code" }),
      password: z.string().min(6, { message: "Enter a valid password" }),
    }),
    resolve: async ({ input, ctx }) => {
      const { ifsc_code, password } = input;

      const bank = await ctx.prisma.bank.findUnique({
        where: {
          ifsc_code,
        },
        select: {
          id: true,
          name: true,
          email: true,
          ifsc_code: true,
          createdAt: true,
          password: true,
        },
      });

      if (!bank) {
        throw new Error("No bank with this IFSC code");
      }

      const valid = bcrypt.compareSync(password, bank.password);

      if (!valid) {
        throw new Error("Invalid password");
      }

      const token = jwt.sign(
        {
          id: bank.id,
          ifsc_code: bank.ifsc_code,
          email: bank.email,
          name: bank.name,
        },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "1d",
        }
      );

      ctx.res.setHeader(
        "Set-Cookie",
        `bank_token=${token}; path=/; httpOnly; sameSite=strict`
      );

      return {
        id: bank.id,
        name: bank.name,
        email: bank.email,
        ifsc_code: bank.ifsc_code,
        createdAt: bank.createdAt,
      };
    },
  })
  .mutation("logout", {
    resolve: async ({ ctx }) => {
      ctx.res.setHeader(
        "Set-Cookie",
        `bank_token=; path=/; httpOnly; sameSite=strict; Max-Age=0`
      );
      return true;
    },
  });
