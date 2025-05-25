import { gql } from '@apollo/client';

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    users(where: { id: { _eq: "X-Hasura-User-Id" } }) {
      id
      username
      name
      bio
      avatar_url
      level
      points
      created_at
      updated_at
    }
  }
`;

export const GET_USER_PROFILE = gql`
  query GetUserProfile($userId: uuid!) {
    users(where: { id: { _eq: $userId } }) {
      id
      username
      name
      bio
      avatar_url
      level
      points
      created_at
    }
  }
`;

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($userId: uuid!, $name: String, $bio: String, $avatarUrl: String) {
    update_auth_users(
      where: { id: { _eq: $userId } }
      _set: { name: $name, bio: $bio, avatar_url: $avatarUrl }
    ) {
      affected_rows
      returning {
        id
        name
        bio
        avatar_url
        updated_at
      }
    }
  }
`;

export const GET_USER_FRIENDS = gql`
  query GetUserFriends($userId: uuid!, $limit: Int!, $offset: Int!) {
    friendships(
      where: {
        _or: [
          { user_id: { _eq: $userId }, status: { _eq: "accepted" } }
          { friend_id: { _eq: $userId }, status: { _eq: "accepted" } }
        ]
      }
      limit: $limit
      offset: $offset
    ) {
      id
      user {
        id
        username
        name
        avatar_url
        level
      }
      friend {
        id
        username
        name
        avatar_url
        level
      }
      created_at
    }
    friendships_aggregate(
      where: {
        _or: [
          { user_id: { _eq: $userId }, status: { _eq: "accepted" } }
          { friend_id: { _eq: $userId }, status: { _eq: "accepted" } }
        ]
      }
    ) {
      aggregate {
        count
      }
    }
  }
`;

export const ADD_FRIEND = gql`
  mutation AddFriend($userId: uuid!, $friendId: uuid!) {
    insert_friendships_one(
      object: {
        user_id: $userId,
        friend_id: $friendId,
        status: "pending"
      }
    ) {
      id
      status
      created_at
    }
  }
`;

export const ACCEPT_FRIEND_REQUEST = gql`
  mutation AcceptFriendRequest($friendshipId: uuid!) {
    update_friendships_by_pk(
      pk_columns: { id: $friendshipId },
      _set: { status: "accepted" }
    ) {
      id
      status
      updated_at
    }
  }
`;

export const REJECT_FRIEND_REQUEST = gql`
  mutation RejectFriendRequest($friendshipId: uuid!) {
    update_friendships_by_pk(
      pk_columns: { id: $friendshipId },
      _set: { status: "rejected" }
    ) {
      id
      status
      updated_at
    }
  }
`;

export const REMOVE_FRIEND = gql`
  mutation RemoveFriend($friendshipId: uuid!) {
    delete_friendships_by_pk(id: $friendshipId) {
      id
    }
  }
`;
