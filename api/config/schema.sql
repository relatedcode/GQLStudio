create table if not exists "users"(
  "objectId" varchar(255) primary key,
  "name" varchar(255) not null,
  "email" varchar(255) not null unique,
  "groups" text[] not null,
  "photoURL" varchar(255) not null default '',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists "groups"(
  "objectId" varchar(255) primary key,
  "title" varchar(255) not null,
  "ownerId" varchar(255) not null,
  "access" text[] not null,
  "write" text[] not null,
  "isDeleted" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists "requests"(
  "objectId" varchar(255) primary key,
  "groupId" varchar(255) not null references "groups"("objectId"),
  "title" text not null default '',
  "link" text not null default '',
  "body" text not null default '',
  "headers" text not null default '',
  "notes" text not null default '',
  "variables" text not null default '',
  "appSyncKey" text not null default '',
  "wsProtocol" text not null default '',
  "isDeleted" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists "projects"(
  "objectId" varchar(255) primary key,
  "title" varchar(255) not null,
  "region" varchar(255) not null,
  "size" varchar(255) not null,
  "ownerId" varchar(255) not null,
  "status" varchar(255) not null,
  "dropletIPAddress" varchar(255) not null default '',
  "dropletId" varchar(255) not null default '',
  "domainRecordId" varchar(255) not null default '',
  "dropletName" varchar(255) not null default '',
  "link" text not null default '',
  "logs" text[],

  "type" varchar(255) not null default '',

  "hasuraAdminSecret" varchar(255) not null default '',
  "hasuraDBPassword" varchar(255) not null default '',

  "directusAdminEmail" varchar(255) not null default '',
  "directusAdminPassword" varchar(255) not null default '',
  "directusKey" varchar(255) not null default '',
  "directusSecret" varchar(255) not null default '',
  "directusDBPassword" varchar(255) not null default '',

  "gqliteAdminEmail" varchar(255) not null default '',
  "gqliteAdminPassword" varchar(255) not null default '',
  "gqliteSecretKey" varchar(255) not null default '',
  "gqliteMinioPassword" varchar(255) not null default '',
  "gqliteRedisPassword" varchar(255) not null default '',
  "gqliteDBPassword" varchar(255) not null default '',

  "isDeleted" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists "credentials"(
  "userId" varchar(255) primary key,
  "accessToken" text not null default '',
  "sshPrivateKey" text not null default '',
  "sshKeyFingerprint" text not null default '',
  "sshPassphrase" text not null default '',
  "customDomain" text not null default '',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);