import { gql } from '@apollo/client';

export const GET_TOKEN_TRANSACTIONS = gql`
  query GetTokenTransactions($limit: Int!, $offset: Int!, $type: String) {
    token_transactions(
      where: {
        _and: [
          { user_id: { _eq: "X-Hasura-User-Id" } },
          { type: { _eq: $type } }
        ]
      }
      order_by: { created_at: desc }
      limit: $limit
      offset: $offset
    ) {
      id
      user_id
      wallet_address
      amount
      type
      status
      source
      source_id
      tx_hash
      block_number
      created_at
      updated_at
    }
    token_transactions_aggregate(
      where: {
        _and: [
          { user_id: { _eq: "X-Hasura-User-Id" } },
          { type: { _eq: $type } }
        ]
      }
    ) {
      aggregate {
        count
      }
    }
  }
`;

export const GET_TOKEN_TRANSACTION = gql`
  query GetTokenTransaction($id: uuid!) {
    token_transactions_by_pk(id: $id) {
      id
      user_id
      wallet_address
      amount
      type
      status
      source
      source_id
      tx_hash
      block_number
      created_at
      updated_at
    }
  }
`;

export const GET_USER_WALLETS = gql`
  query GetUserWallets {
    wallets(
      where: { user_id: { _eq: "X-Hasura-User-Id" } }
      order_by: { is_primary: desc }
    ) {
      id
      address
      is_primary
      created_at
      updated_at
    }
  }
`;

export const ADD_WALLET = gql`
  mutation AddWallet($address: String!, $isPrimary: Boolean!) {
    insert_wallets_one(
      object: {
        address: $address,
        is_primary: $isPrimary
      }
    ) {
      id
      address
      is_primary
      created_at
    }
  }
`;

export const SET_PRIMARY_WALLET = gql`
  mutation SetPrimaryWallet($walletId: uuid!) {
    # Primeiro, definir todos como não primários
    update_wallets(
      where: { user_id: { _eq: "X-Hasura-User-Id" } },
      _set: { is_primary: false }
    ) {
      affected_rows
    }
    
    # Depois, definir o selecionado como primário
    update_wallets_by_pk(
      pk_columns: { id: $walletId },
      _set: { is_primary: true }
    ) {
      id
      is_primary
      updated_at
    }
  }
`;

export const REMOVE_WALLET = gql`
  mutation RemoveWallet($walletId: uuid!) {
    delete_wallets_by_pk(id: $walletId) {
      id
    }
  }
`;
