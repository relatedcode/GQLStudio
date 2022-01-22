import { gql } from "@apollo/client";

export const GROUPS = gql`
  query GetGroups($userId: String) {
    groups(userId: $userId) {
      objectId
      title
      ownerId
      access
      write
      isDeleted
      createdAt
      updatedAt
    }
  }
`;

export const USERS = gql`
  query GetUsers($groupId: String) {
    users(groupId: $groupId) {
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

export const USER = gql`
  query GetUserById($objectId: String) {
    user(objectId: $objectId) {
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

export const CREDENTIAL = gql`
  query GetCredential {
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

export const REQUESTS = gql`
  query GetRequests($groupId: String, $userId: String) {
    requests(groupId: $groupId, userId: $userId) {
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

export const REQUEST = gql`
  query GetRequestById($objectId: String!) {
    request(objectId: $objectId) {
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

export const PROJECTS = gql`
  query GetProjects($ownerId: String!) {
    projects(ownerId: $ownerId) {
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
