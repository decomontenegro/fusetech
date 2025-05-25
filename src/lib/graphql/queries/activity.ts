import { gql } from '@apollo/client';

export const GET_ACTIVITIES = gql`
  query GetActivities($limit: Int!, $offset: Int!, $type: String, $source: String) {
    physical_activities(
      where: {
        _and: [
          { user_id: { _eq: "X-Hasura-User-Id" } },
          { type: { _eq: $type } },
          { source: { _eq: $source } }
        ]
      }
      order_by: { created_at: desc }
      limit: $limit
      offset: $offset
    ) {
      id
      user_id
      type
      title
      description
      distance
      duration
      start_date
      end_date
      source
      source_id
      points
      is_verified
      polyline
      calories
      elevation_gain
      average_heart_rate
      max_heart_rate
      created_at
      updated_at
    }
    physical_activities_aggregate(
      where: {
        _and: [
          { user_id: { _eq: "X-Hasura-User-Id" } },
          { type: { _eq: $type } },
          { source: { _eq: $source } }
        ]
      }
    ) {
      aggregate {
        count
      }
    }
  }
`;

export const GET_ACTIVITY = gql`
  query GetActivity($id: uuid!) {
    physical_activities_by_pk(id: $id) {
      id
      user_id
      type
      title
      description
      distance
      duration
      start_date
      end_date
      source
      source_id
      points
      is_verified
      polyline
      calories
      elevation_gain
      average_heart_rate
      max_heart_rate
      created_at
      updated_at
      user {
        id
        username
        name
        avatar_url
      }
    }
  }
`;

export const CREATE_ACTIVITY = gql`
  mutation CreateActivity(
    $type: String!,
    $title: String!,
    $description: String,
    $distance: Int,
    $duration: Int!,
    $startDate: timestamptz!,
    $endDate: timestamptz,
    $source: String!,
    $calories: Int,
    $elevationGain: Int,
    $averageHeartRate: Int,
    $maxHeartRate: Int
  ) {
    insert_physical_activities_one(
      object: {
        type: $type,
        title: $title,
        description: $description,
        distance: $distance,
        duration: $duration,
        start_date: $startDate,
        end_date: $endDate,
        source: $source,
        source_id: null,
        calories: $calories,
        elevation_gain: $elevationGain,
        average_heart_rate: $averageHeartRate,
        max_heart_rate: $maxHeartRate
      }
    ) {
      id
      created_at
    }
  }
`;

export const UPDATE_ACTIVITY = gql`
  mutation UpdateActivity(
    $id: uuid!,
    $title: String,
    $description: String
  ) {
    update_physical_activities_by_pk(
      pk_columns: { id: $id },
      _set: {
        title: $title,
        description: $description
      }
    ) {
      id
      title
      description
      updated_at
    }
  }
`;

export const GET_ACTIVITY_STATS = gql`
  query GetActivityStats {
    # Total de atividades
    total_activities: physical_activities_aggregate(
      where: { user_id: { _eq: "X-Hasura-User-Id" } }
    ) {
      aggregate {
        count
      }
    }
    
    # Distância total
    total_distance: physical_activities_aggregate(
      where: { user_id: { _eq: "X-Hasura-User-Id" } }
    ) {
      aggregate {
        sum {
          distance
        }
      }
    }
    
    # Duração total
    total_duration: physical_activities_aggregate(
      where: { user_id: { _eq: "X-Hasura-User-Id" } }
    ) {
      aggregate {
        sum {
          duration
        }
      }
    }
    
    # Pontos totais
    total_points: physical_activities_aggregate(
      where: { user_id: { _eq: "X-Hasura-User-Id" } }
    ) {
      aggregate {
        sum {
          points
        }
      }
    }
    
    # Atividades por tipo
    activities_by_type: physical_activities(
      where: { user_id: { _eq: "X-Hasura-User-Id" } }
    ) {
      type
    }
  }
`;
