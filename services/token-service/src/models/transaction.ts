import { z } from 'zod';
import { TokenTransactionType } from '@fuseapp/types';

// Schema para validação de transações
export const tokenTransactionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  amount: z.number().positive(),
  type: z.nativeEnum(TokenTransactionType),
  walletAddress: z.string().optional(),
  reference: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type TokenTransaction = z.infer<typeof tokenTransactionSchema>; 