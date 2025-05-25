export const RewardSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    shortDescription: { type: 'string' },
    price: { type: 'number' },
    originalPrice: { type: 'number' },
    imageUrl: { type: 'string' },
    category: { type: 'string' },
    partnerId: { type: 'string' },
    partnerName: { type: 'string' },
    partnerLogo: { type: 'string' },
    quantity: { type: 'number' },
    available: { type: 'boolean' },
    featured: { type: 'boolean' },
    popular: { type: 'boolean' },
    expiresAt: { type: 'string', format: 'date-time' },
    termsAndConditions: { type: 'string' },
    howToUse: { type: 'string' },
    status: { type: 'string', enum: ['draft', 'pending', 'approved', 'rejected'] },
    rejectionReason: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'name', 'description', 'price', 'category', 'partnerId', 'available', 'status', 'createdAt']
};

export const RewardQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    category: { type: 'string' },
    minPrice: { type: 'number', minimum: 0 },
    maxPrice: { type: 'number', minimum: 0 },
    sortBy: { type: 'string', enum: ['price', 'createdAt', 'popularity'] },
    sortOrder: { type: 'string', enum: ['asc', 'desc'] }
  }
};

export const CreateRewardSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 3, maxLength: 100 },
    description: { type: 'string', minLength: 10 },
    shortDescription: { type: 'string', maxLength: 150 },
    price: { type: 'number', minimum: 1 },
    originalPrice: { type: 'number', minimum: 0 },
    imageUrl: { type: 'string', format: 'uri' },
    category: { type: 'string' },
    quantity: { type: 'number', minimum: 0 },
    available: { type: 'boolean' },
    expiresAt: { type: 'string', format: 'date-time' },
    termsAndConditions: { type: 'string' },
    howToUse: { type: 'string' }
  },
  required: ['name', 'description', 'price', 'category']
};

export const UpdateRewardSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 3, maxLength: 100 },
    description: { type: 'string', minLength: 10 },
    shortDescription: { type: 'string', maxLength: 150 },
    price: { type: 'number', minimum: 1 },
    originalPrice: { type: 'number', minimum: 0 },
    imageUrl: { type: 'string', format: 'uri' },
    category: { type: 'string' },
    quantity: { type: 'number', minimum: 0 },
    available: { type: 'boolean' },
    expiresAt: { type: 'string', format: 'date-time' },
    termsAndConditions: { type: 'string' },
    howToUse: { type: 'string' }
  }
};
