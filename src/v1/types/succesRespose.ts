import z from "zod";

export const SuccessResponseSchema = z.object({
    success: z.literal(true),
    message: z.string(),
    data: z.any().nullable(),
    meta: z
        .object({
            requestId: z.string().optional(),
            timestamp: z.iso.datetime(),
        })
        .optional(),
});

export const successResponse = (message: string, data: any, meta?: any) => ({
  success: true,
  message,
  data,
  meta: {
    ...meta,
    timestamp: new Date().toISOString(),
  },
});


export type SuccessResponseType = z.infer<typeof SuccessResponseSchema>;
