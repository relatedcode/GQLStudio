import { gql } from "graphql-request";

export const CREATE_USER = gql`
  mutation CreateUser(
    $objectId: String!
    $name: String!
    $email: String!
    $groups: [String]!
    $photoURL: String
  ) {
    createUser(
      objectId: $objectId
      name: $name
      email: $email
      groups: $groups
      photoURL: $photoURL
    ) {
      objectId
      name
      email
      photoURL
      groups
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser(
    $objectId: String!
    $name: String
    $email: String
    $groups: [String]
    $photoURL: String
  ) {
    updateUser(
      objectId: $objectId
      name: $name
      email: $email
      groups: $groups
      photoURL: $photoURL
    ) {
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

export const CREATE_GROUP = gql`
  mutation CreateGroup(
    $objectId: String!
    $title: String!
    $ownerId: String!
    $access: [String]!
    $write: [String]!
    $isDeleted: Boolean
    $createdAt: Date
  ) {
    createGroup(
      objectId: $objectId
      title: $title
      ownerId: $ownerId
      access: $access
      write: $write
      isDeleted: $isDeleted
      createdAt: $createdAt
    ) {
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

export const UPDATE_GROUP = gql`
  mutation UpdateGroup(
    $objectId: String!
    $title: String
    $ownerId: String
    $access: [String]
    $write: [String]
    $isDeleted: Boolean
  ) {
    updateGroup(
      objectId: $objectId
      title: $title
      ownerId: $ownerId
      access: $access
      write: $write
      isDeleted: $isDeleted
    ) {
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

export const CREATE_REQUEST = gql`
  mutation CreateRequest(
    $objectId: String!
    $groupId: String!
    $title: String!
    $link: String
    $body: String
    $headers: String
    $notes: String
    $variables: String
    $appSyncKey: String
    $wsProtocol: String
    $isDeleted: Boolean
    $createdAt: Date
  ) {
    createRequest(
      objectId: $objectId
      groupId: $groupId
      title: $title
      link: $link
      body: $body
      headers: $headers
      notes: $notes
      variables: $variables
      appSyncKey: $appSyncKey
      wsProtocol: $wsProtocol
      isDeleted: $isDeleted
      createdAt: $createdAt
    ) {
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

export const UPDATE_REQUEST = gql`
  mutation UpdateRequest(
    $objectId: String!
    $groupId: String
    $title: String
    $link: String
    $body: String
    $headers: String
    $notes: String
    $variables: String
    $appSyncKey: String
    $wsProtocol: String
    $isDeleted: Boolean
  ) {
    updateRequest(
      objectId: $objectId
      groupId: $groupId
      title: $title
      link: $link
      body: $body
      headers: $headers
      notes: $notes
      variables: $variables
      appSyncKey: $appSyncKey
      wsProtocol: $wsProtocol
      isDeleted: $isDeleted
    ) {
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

export const CREATE_PROJECT = gql`
  mutation CreateProject(
    $objectId: String!
    $title: String!
    $region: String!
    $size: String!
    $ownerId: String!
    $status: String!
    $dropletIPAddress: String
    $dropletId: String
    $domainRecordId: String
    $dropletName: String
    $link: String
    $logs: [String]
    $type: String
    $hasuraAdminSecret: String
    $hasuraDBPassword: String
    $directusAdminEmail: String
    $directusAdminPassword: String
    $directusKey: String
    $directusSecret: String
    $directusDBPassword: String
    $gqliteAdminEmail: String
    $gqliteAdminPassword: String
    $gqliteSecretKey: String
    $gqliteMinioPassword: String
    $gqliteRedisPassword: String
    $gqliteDBPassword: String
    $isDeleted: Boolean
  ) {
    createProject(
      objectId: $objectId
      title: $title
      region: $region
      size: $size
      ownerId: $ownerId
      status: $status
      dropletIPAddress: $dropletIPAddress
      dropletId: $dropletId
      domainRecordId: $domainRecordId
      dropletName: $dropletName
      link: $link
      logs: $logs
      type: $type
      hasuraAdminSecret: $hasuraAdminSecret
      hasuraDBPassword: $hasuraDBPassword
      directusAdminEmail: $directusAdminEmail
      directusAdminPassword: $directusAdminPassword
      directusKey: $directusKey
      directusSecret: $directusSecret
      directusDBPassword: $directusDBPassword
      gqliteAdminEmail: $gqliteAdminEmail
      gqliteAdminPassword: $gqliteAdminPassword
      gqliteSecretKey: $gqliteSecretKey
      gqliteMinioPassword: $gqliteMinioPassword
      gqliteRedisPassword: $gqliteRedisPassword
      gqliteDBPassword: $gqliteDBPassword
      isDeleted: $isDeleted
    ) {
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

export const UPDATE_PROJECT = gql`
  mutation UpdateProject(
    $objectId: String!
    $title: String
    $region: String
    $size: String
    $ownerId: String
    $status: String
    $dropletIPAddress: String
    $dropletId: String
    $domainRecordId: String
    $dropletName: String
    $link: String
    $logs: [String]
    $type: String
    $hasuraAdminSecret: String
    $hasuraDBPassword: String
    $directusAdminEmail: String
    $directusAdminPassword: String
    $directusKey: String
    $directusSecret: String
    $directusDBPassword: String
    $gqliteAdminEmail: String
    $gqliteAdminPassword: String
    $gqliteSecretKey: String
    $gqliteMinioPassword: String
    $gqliteRedisPassword: String
    $gqliteDBPassword: String
    $isDeleted: Boolean
  ) {
    updateProject(
      objectId: $objectId
      title: $title
      region: $region
      size: $size
      ownerId: $ownerId
      status: $status
      dropletIPAddress: $dropletIPAddress
      dropletId: $dropletId
      domainRecordId: $domainRecordId
      dropletName: $dropletName
      link: $link
      logs: $logs
      type: $type
      hasuraAdminSecret: $hasuraAdminSecret
      hasuraDBPassword: $hasuraDBPassword
      directusAdminEmail: $directusAdminEmail
      directusAdminPassword: $directusAdminPassword
      directusKey: $directusKey
      directusSecret: $directusSecret
      directusDBPassword: $directusDBPassword
      gqliteAdminEmail: $gqliteAdminEmail
      gqliteAdminPassword: $gqliteAdminPassword
      gqliteSecretKey: $gqliteSecretKey
      gqliteMinioPassword: $gqliteMinioPassword
      gqliteRedisPassword: $gqliteRedisPassword
      gqliteDBPassword: $gqliteDBPassword
      isDeleted: $isDeleted
    ) {
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

export const CREATE_CREDENTIAL = gql`
  mutation CreateCredential(
    $accessToken: String
    $sshPrivateKey: String
    $sshKeyFingerprint: String
    $sshPassphrase: String
    $customDomain: String
  ) {
    createCredential(
      accessToken: $accessToken
      sshPrivateKey: $sshPrivateKey
      sshKeyFingerprint: $sshKeyFingerprint
      sshPassphrase: $sshPassphrase
      customDomain: $customDomain
    ) {
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

export const UPDATE_CREDENTIAL = gql`
  mutation UpdateCredential(
    $accessToken: String
    $sshPrivateKey: String
    $sshKeyFingerprint: String
    $sshPassphrase: String
    $customDomain: String
  ) {
    updateCredential(
      accessToken: $accessToken
      sshPrivateKey: $sshPrivateKey
      sshKeyFingerprint: $sshKeyFingerprint
      sshPassphrase: $sshPassphrase
      customDomain: $customDomain
    ) {
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
