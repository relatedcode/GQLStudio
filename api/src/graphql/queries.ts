import { gql } from "graphql-request";

export const GET_USER = gql`
  query Query($objectId: String, $email: String) {
    user(objectId: $objectId, email: $email) {
      objectId
      name
      email
      groups
      photoURL
      createdAt
      updatedAt
    }
  }
`;

export const GET_CREDENTIAL = gql`
  query Query {
    credential {
      userId
      accessToken
      sshPrivateKey
      sshKeyFingerprint
      sshPassphrase
      customDomain
      createdAt
      updatedAt
    }
  }
`;

export const GET_GROUP = gql`
  query Query($objectId: String!) {
    group(objectId: $objectId) {
      objectId
      title
      ownerId
      write
      access
      isDeleted
      createdAt
      updatedAt
    }
  }
`;

export const GET_PROJECT = gql`
  query Query($objectId: String!) {
    project(objectId: $objectId) {
      objectId
      title
      region
      size
      ownerId
      status
      dropletIPAddress
      dropletId
      domainRecordId
      dropletName
      link
      logs
      type
      hasuraAdminSecret
      hasuraDBPassword
      directusAdminEmail
      directusAdminPassword
      directusKey
      directusSecret
      directusDBPassword
      gqliteAdminEmail
      gqliteAdminPassword
      gqliteSecretKey
      gqliteMinioPassword
      gqliteRedisPassword
      gqliteDBPassword
      isDeleted
      createdAt
      updatedAt
    }
  }
`;

export const GET_REQUESTS = gql`
  query GetRequestsByGroup($groupId: String!) {
    requests(groupId: $groupId) {
      objectId
      groupId
      title
      link
      body
      headers
      notes
      variables
      appSyncKey
      wsProtocol
      isDeleted
      createdAt
      updatedAt
    }
  }
`;
