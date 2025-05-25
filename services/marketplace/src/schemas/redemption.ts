export const RedemptionSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    rewardId: { type: 'string' },
    rewardName: { type: 'string' },
    rewardImageUrl: { type: 'string' },
    partnerId: { type: 'string' },
    partnerName: { type: 'string' },
    price: { type: 'number' },
    status: { type: 'string', enum: ['pending', 'processing', 'completed', 'failed', 'disputed', 'refunded'] },
    code: { type: 'string' },
    expiresAt: { type: 'string', format: 'date-time' },
    redeemedAt: { type: 'string', format: 'date-time' },
    txHash: { type: 'string' },
    notes: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'userId', 'rewardId', 'rewardName', 'price', 'status', 'createdAt']
};

export const CreateRedemptionSchema = {
  type: 'object',
  properties: {
    rewardId: { type: 'string' }
  },
  required: ['rewardId']
};
