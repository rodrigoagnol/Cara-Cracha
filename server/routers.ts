import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getChildren,
  getChildById,
  createChild,
  updateChild,
  getGuardians,
  getGuardianById,
  getGuardianByCPF,
  createGuardian,
  updateGuardian,
  getAuthorizations,
  getAuthorizationsByChild,
  getAuthorizationsByGuardian,
  createAuthorization,
  updateAuthorization,
  deleteAuthorization,
  getExitLogs,
  getExitLogsByChild,
  createExitLog,
} from "./db";
import { isFaceMatch, findBestMatch, isValidEmbedding } from "./faceRecognition";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Rotas para gestão de crianças
  children: router({
    list: protectedProcedure.query(async () => {
      return getChildren();
    }),

    getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
      return getChildById(input);
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          age: z.number().optional(),
          classroom: z.string().optional(),
          photoUrl: z.string().optional(),
          faceEmbedding: z.array(z.number()).optional(),
          parentPhone: z.string().optional(),
          parentEmail: z.string().optional(),
          parentName: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return createChild(input);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          age: z.number().optional(),
          classroom: z.string().optional(),
          photoUrl: z.string().optional(),
          faceEmbedding: z.array(z.number()).optional(),
          parentPhone: z.string().optional(),
          parentEmail: z.string().optional(),
          parentName: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateChild(id, data);
      }),
  }),

  // Rotas para gestão de responsáveis
  guardians: router({
    list: protectedProcedure.query(async () => {
      return getGuardians();
    }),

    getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
      return getGuardianById(input);
    }),

    getByCPF: protectedProcedure.input(z.string()).query(async ({ input }) => {
      return getGuardianByCPF(input);
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          cpf: z.string(),
          relationship: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          photoUrl: z.string().optional(),
          faceEmbedding: z.array(z.number()).optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return createGuardian(input);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          cpf: z.string().optional(),
          relationship: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          photoUrl: z.string().optional(),
          faceEmbedding: z.array(z.number()).optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateGuardian(id, data);
      }),
  }),

  // Rotas para gestão de autorizações
  authorizations: router({
    list: protectedProcedure.query(async () => {
      return getAuthorizations();
    }),

    getByChild: protectedProcedure.input(z.number()).query(async ({ input }) => {
      return getAuthorizationsByChild(input);
    }),

    getByGuardian: protectedProcedure.input(z.number()).query(async ({ input }) => {
      return getAuthorizationsByGuardian(input);
    }),

    create: protectedProcedure
      .input(
        z.object({
          childId: z.number(),
          guardianId: z.number(),
          isAuthorized: z.boolean().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return createAuthorization(input);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          isAuthorized: z.boolean().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateAuthorization(id, data);
      }),

    delete: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
      return deleteAuthorization(input);
    }),
  }),

  // Rotas para histórico de saídas
  exitLogs: router({
    list: protectedProcedure
      .input(
        z.object({
          limit: z.number().optional(),
          offset: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        return getExitLogs(input.limit || 100, input.offset || 0);
      }),

    getByChild: protectedProcedure.input(z.number()).query(async ({ input }) => {
      return getExitLogsByChild(input);
    }),

    create: protectedProcedure
      .input(
        z.object({
          childId: z.number(),
          guardianId: z.number().optional(),
          guardianPhotoUrl: z.string().optional(),
          childPhotoUrl: z.string().optional(),
          isAuthorized: z.boolean(),
          matchConfidence: z.number().optional(),
          status: z.enum(["approved", "denied", "pending", "manual_review"]).optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return createExitLog(input);
      }),
  }),

  // Rotas para reconhecimento facial
  faceRecognition: router({
    validateMatch: protectedProcedure
      .input(
        z.object({
          embedding1: z.array(z.number()),
          embedding2: z.array(z.number()),
          threshold: z.number().optional(),
        })
      )
      .query(({ input }) => {
        if (!isValidEmbedding(input.embedding1) || !isValidEmbedding(input.embedding2)) {
          throw new Error("Invalid embeddings");
        }
        return isFaceMatch(input.embedding1, input.embedding2, input.threshold || 0.6);
      }),

    findMatch: protectedProcedure
      .input(
        z.object({
          embedding: z.array(z.number()),
          candidates: z.array(
            z.object({
              id: z.number(),
              embedding: z.array(z.number()),
            })
          ),
          threshold: z.number().optional(),
        })
      )
      .query(({ input }) => {
        if (!isValidEmbedding(input.embedding)) {
          throw new Error("Invalid embedding");
        }
        return findBestMatch(input.embedding, input.candidates, input.threshold || 0.6);
      }),
  }),
});

export type AppRouter = typeof appRouter;
