import { gql } from '@apollo/client';

export const GET_STRAVA_CONNECTION = gql`
  query GetStravaConnection {
    strava_connections(
      where: { user_id: { _eq: "X-Hasura-User-Id" } }
    ) {
      id
      user_id
      athlete_id
      username
      is_verified
      created_at
      updated_at
    }
  }
`;

export const GET_SOCIAL_CONNECTIONS = gql`
  query GetSocialConnections {
    social_connections(
      where: { user_id: { _eq: "X-Hasura-User-Id" } }
    ) {
      id
      user_id
      platform
      platform_user_id
      username
      is_verified
      created_at
      updated_at
    }
  }
`;

export const GET_SOCIAL_CONNECTION = gql`
  query GetSocialConnection($platform: String!) {
    social_connections(
      where: {
        _and: [
          { user_id: { _eq: "X-Hasura-User-Id" } },
          { platform: { _eq: $platform } }
        ]
      }
    ) {
      id
      user_id
      platform
      platform_user_id
      username
      is_verified
      created_at
      updated_at
    }
  }
`;
