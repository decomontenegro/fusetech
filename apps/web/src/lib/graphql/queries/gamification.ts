import { gql } from '@apollo/client';

export const GET_CHALLENGES = gql`
  query GetChallenges($limit: Int!, $offset: Int!, $isActive: Boolean) {
    challenges(
      where: { is_active: { _eq: $isActive } }
      order_by: { start_date: desc }
      limit: $limit
      offset: $offset
    ) {
      id
      title
      description
      type
      target
      reward
      start_date
      end_date
      is_active
      required_level
      metadata
      created_at
      updated_at
    }
    challenges_aggregate(
      where: { is_active: { _eq: $isActive } }
    ) {
      aggregate {
        count
      }
    }
  }
`;

export const GET_CHALLENGE = gql`
  query GetChallenge($id: uuid!) {
    challenges_by_pk(id: $id) {
      id
      title
      description
      type
      target
      reward
      start_date
      end_date
      is_active
      required_level
      metadata
      created_at
      updated_at
    }
  }
`;

export const GET_USER_CHALLENGES = gql`
  query GetUserChallenges($limit: Int!, $offset: Int!, $isCompleted: Boolean) {
    user_challenges(
      where: {
        _and: [
          { user_id: { _eq: "X-Hasura-User-Id" } },
          { is_completed: { _eq: $isCompleted } }
        ]
      }
      order_by: { created_at: desc }
      limit: $limit
      offset: $offset
    ) {
      id
      user_id
      challenge_id
      progress
      is_completed
      completed_at
      reward_claimed
      created_at
      updated_at
      challenge {
        id
        title
        description
        type
        target
        reward
        start_date
        end_date
        is_active
        required_level
      }
    }
    user_challenges_aggregate(
      where: {
        _and: [
          { user_id: { _eq: "X-Hasura-User-Id" } },
          { is_completed: { _eq: $isCompleted } }
        ]
      }
    ) {
      aggregate {
        count
      }
    }
  }
`;

export const GET_USER_CHALLENGE = gql`
  query GetUserChallenge($challengeId: uuid!) {
    user_challenges(
      where: {
        _and: [
          { user_id: { _eq: "X-Hasura-User-Id" } },
          { challenge_id: { _eq: $challengeId } }
        ]
      }
    ) {
      id
      user_id
      challenge_id
      progress
      is_completed
      completed_at
      reward_claimed
      created_at
      updated_at
      challenge {
        id
        title
        description
        type
        target
        reward
        start_date
        end_date
        is_active
        required_level
      }
    }
  }
`;

export const GET_ACHIEVEMENTS = gql`
  query GetAchievements {
    achievements(order_by: { created_at: asc }) {
      id
      title
      description
      type
      threshold
      reward
      icon
      is_secret
      metadata
      created_at
      updated_at
    }
  }
`;

export const GET_USER_ACHIEVEMENTS = gql`
  query GetUserAchievements {
    user_achievements(
      where: { user_id: { _eq: "X-Hasura-User-Id" } }
      order_by: { unlocked_at: desc }
    ) {
      id
      user_id
      achievement_id
      unlocked_at
      reward_claimed
      created_at
      updated_at
      achievement {
        id
        title
        description
        type
        threshold
        reward
        icon
        is_secret
      }
    }
  }
`;

export const GET_LEADERBOARD = gql`
  query GetLeaderboard($limit: Int!, $offset: Int!) {
    users(
      order_by: { points: desc }
      limit: $limit
      offset: $offset
    ) {
      id
      username
      name
      avatar_url
      level
      points
    }
    users_aggregate {
      aggregate {
        count
      }
    }
  }
`;

export const GET_USER_RANK = gql`
  query GetUserRank {
    # Obter o usuário atual
    current_user: users(where: { id: { _eq: "X-Hasura-User-Id" } }) {
      id
      username
      name
      avatar_url
      level
      points
    }
    
    # Contar quantos usuários têm mais pontos
    higher_ranked_users: users_aggregate(
      where: { points: { _gt: "X-Hasura-User-Points" } }
    ) {
      aggregate {
        count
      }
    }
    
    # Total de usuários
    total_users: users_aggregate {
      aggregate {
        count
      }
    }
  }
`;
