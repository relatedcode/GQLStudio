import { gql } from "@apollo/client";

export const GROUP = gql`
  subscription OnUpdateGroup {
    group {
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

export const USER = gql`
  subscription OnUpdateUser($objectId: String, $groupId: String) {
    user(objectId: $objectId, groupId: $groupId) {
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

export const REQUEST = gql`
  subscription OnUpdateRequest($groupId: String, $objectId: String) {
    request(groupId: $groupId, objectId: $objectId) {
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

export const PROJECT = gql`
  subscription OnUpdateProject($ownerId: String!) {
    project(ownerId: $ownerId) {
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
