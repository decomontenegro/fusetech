/**
 * Tipos compartilhados para o FuseLabs App
 */
export declare enum UserRole {
    USER = "user",
    ADMIN = "admin"
}
export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    walletAddress?: string;
    createdAt: Date;
    updatedAt: Date;
    user_metadata?: {
        full_name?: string;
        avatar_url?: string;
        role?: string;
    };
}
export declare enum ActivityType {
    RUN = "run",
    WALK = "walk",
    CYCLE = "cycle",
    SOCIAL_POST = "social_post",
    OTHER = "other"
}
export declare enum ActivityStatus {
    PENDING = "pending",
    VERIFIED = "verified",
    REJECTED = "rejected",
    FLAGGED = "flagged"
}
export type ActivitySource = 'strava' | 'manual' | 'garmin';
export interface TokenTransaction {
    id: string;
    userId: string;
    amount: number;
    txHash?: string;
    status: TokenTransactionStatus;
    type: TokenTransactionType;
    createdAt: Date;
    completedAt?: Date;
    activityId?: string;
    referenceId?: string;
}
export declare enum TokenTransactionStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export declare enum TokenTransactionType {
    DEPOSIT = "deposit",
    WITHDRAW = "withdraw",
    TRANSFER = "transfer",
    REWARD = "reward",
    BURN = "burn"
}
export interface OAuthToken {
    userId: string;
    platform: 'strava' | 'instagram' | 'tiktok';
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface Challenge {
    id: string;
    title: string;
    description: string;
    type: string;
    targetValue: number;
    status: ChallengeStatus;
    startDate: Date;
}
export interface UserChallenge {
    userId: string;
    challengeId: string;
    progress: number;
    completed: boolean;
    completedAt?: Date;
}
export interface FraudDetectionResult {
    activityId: string;
    score: number;
    flags: FraudFlag[];
    reviewRequired: boolean;
}
export declare enum FraudFlag {
    UNUSUAL_SPEED = "unusual_speed",
    UNUSUAL_LOCATION = "unusual_location",
    UNUSUAL_PATTERN = "unusual_pattern",
    SUSPICIOUS_TIMING = "suspicious_timing",
    DUPLICATE_CONTENT = "duplicate_content"
}
export interface Profile extends User {
    bio?: string;
    socialConnections: SocialConnection[];
    activityConnections: ActivityConnection[];
}
export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;
    error?: string;
}
export interface Activity {
    id: string;
    userId: string;
    points: number;
    status: ActivityStatus;
    tokenized: boolean;
    createdAt: Date;
}
export interface PhysicalActivity extends Activity {
    type: ActivityType.RUN | ActivityType.WALK | ActivityType.CYCLE | ActivityType.OTHER;
    distance: number;
    duration: number;
    stravaId?: string;
    source: ActivitySource;
}
export interface SocialActivity extends Activity {
    type: ActivityType.SOCIAL_POST;
    platform: 'instagram' | 'tiktok';
    postId: string;
    postUrl: string;
    engagement: number;
    verified: boolean;
}
export declare enum ChallengeStatus {
    ACTIVE = "active",
    COMPLETED = "completed",
    UPCOMING = "upcoming"
}
export interface Challenge {
    id: string;
    title: string;
    description: string;
    type: string;
    targetValue: number;
    status: ChallengeStatus;
    startDate: Date;
}
export interface SocialConnection {
    id: string;
    userId: string;
    platform: SocialPlatform;
    username: string;
    profileUrl?: string;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}
export declare enum SocialPlatform {
    INSTAGRAM = "instagram",
    TIKTOK = "tiktok",
    TWITTER = "twitter"
}
export interface ActivityConnection {
    id: string;
    userId: string;
    platform: ActivitySource;
    externalId: string;
    accessToken: string;
    refreshToken?: string;
    tokenExpiresAt?: string;
    createdAt: string;
    updatedAt: string;
}
export declare enum ChallengeType {
    DISTANCE = "distance",
    DURATION = "duration",
    POSTS = "posts",
    ACTIVITIES = "activities"
}
export declare enum UserRank {
    BRONZE = "bronze",
    SILVER = "silver",
    GOLD = "gold",
    PLATINUM = "platinum"
}
export interface ApiResponse<T> {
    data?: T;
    error?: ApiError;
}
export interface ApiError {
    code: string;
    message: string;
    details?: any;
}
