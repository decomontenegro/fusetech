/**
 * Tipos compartilhados para o FuseLabs App
 */
// Tipos de usuário
export var UserRole;
(function (UserRole) {
    UserRole["USER"] = "user";
    UserRole["ADMIN"] = "admin";
})(UserRole || (UserRole = {}));
// Tipos de atividades
export var ActivityType;
(function (ActivityType) {
    ActivityType["RUN"] = "run";
    ActivityType["WALK"] = "walk";
    ActivityType["CYCLE"] = "cycle";
    ActivityType["SOCIAL_POST"] = "social_post";
    ActivityType["OTHER"] = "other";
})(ActivityType || (ActivityType = {}));
export var ActivityStatus;
(function (ActivityStatus) {
    ActivityStatus["PENDING"] = "pending";
    ActivityStatus["VERIFIED"] = "verified";
    ActivityStatus["REJECTED"] = "rejected";
    ActivityStatus["FLAGGED"] = "flagged";
})(ActivityStatus || (ActivityStatus = {}));
export var TokenTransactionStatus;
(function (TokenTransactionStatus) {
    TokenTransactionStatus["PENDING"] = "pending";
    TokenTransactionStatus["COMPLETED"] = "completed";
    TokenTransactionStatus["FAILED"] = "failed";
    TokenTransactionStatus["CANCELLED"] = "cancelled";
})(TokenTransactionStatus || (TokenTransactionStatus = {}));
export var TokenTransactionType;
(function (TokenTransactionType) {
    TokenTransactionType["DEPOSIT"] = "deposit";
    TokenTransactionType["WITHDRAW"] = "withdraw";
    TokenTransactionType["TRANSFER"] = "transfer";
    TokenTransactionType["REWARD"] = "reward";
    TokenTransactionType["BURN"] = "burn";
})(TokenTransactionType || (TokenTransactionType = {}));
export var FraudFlag;
(function (FraudFlag) {
    FraudFlag["UNUSUAL_SPEED"] = "unusual_speed";
    FraudFlag["UNUSUAL_LOCATION"] = "unusual_location";
    FraudFlag["UNUSUAL_PATTERN"] = "unusual_pattern";
    FraudFlag["SUSPICIOUS_TIMING"] = "suspicious_timing";
    FraudFlag["DUPLICATE_CONTENT"] = "duplicate_content";
})(FraudFlag || (FraudFlag = {}));
// Challenge Types
export var ChallengeStatus;
(function (ChallengeStatus) {
    ChallengeStatus["ACTIVE"] = "active";
    ChallengeStatus["COMPLETED"] = "completed";
    ChallengeStatus["UPCOMING"] = "upcoming";
})(ChallengeStatus || (ChallengeStatus = {}));
export var SocialPlatform;
(function (SocialPlatform) {
    SocialPlatform["INSTAGRAM"] = "instagram";
    SocialPlatform["TIKTOK"] = "tiktok";
    SocialPlatform["TWITTER"] = "twitter";
})(SocialPlatform || (SocialPlatform = {}));
// Tipos relacionados a desafios e gamificação
export var ChallengeType;
(function (ChallengeType) {
    ChallengeType["DISTANCE"] = "distance";
    ChallengeType["DURATION"] = "duration";
    ChallengeType["POSTS"] = "posts";
    ChallengeType["ACTIVITIES"] = "activities";
})(ChallengeType || (ChallengeType = {}));
export var UserRank;
(function (UserRank) {
    UserRank["BRONZE"] = "bronze";
    UserRank["SILVER"] = "silver";
    UserRank["GOLD"] = "gold";
    UserRank["PLATINUM"] = "platinum";
})(UserRank || (UserRank = {}));
