# Studio Web

## What is this?

GQLite Studio for Web is a full-featured GraphQL client that lets you test and debug your GraphQL backend or any Public APIs you plan to work with.

You can compose and run your Queries, Mutations, Subscriptions using an intuitive user interface. The GraphQL responses are visually organized, which helps you to debug and understand the results easily.

The Schema documentation is available right next to your editor. Whatever info need about your GraphQL endpoint, you can be sure it always be there for you.

GQLite Studio automatically synchronizes your work across the team, so all the members will always be up-to-date. You can specify which team member should have full, or just read-only access to your work. 

## Installation

You can install GQLite Studio Web on any server (Windows, Linux or macOS), by using Docker. Just download the Docker Compose file to your computer and initiate the process.

```
curl -o docker-compose.yml https://gqlite.com/studio/docker-compose.yml

docker-compose up -d
```

Make sure to change all the sensitive values in your YAML file before building your server.

```yaml
environment:
  DB_HOST: pg
  DB_PORT: 5432
  DB_DATABASE: gqlserver
  DB_USER: gqlserver
  DB_PASSWORD: gqlserver

  CACHE_HOST: rd
  CACHE_PORT: 6379
  CACHE_PASSWORD: gqlserver
      
  MINIO_ROOT_USER: gqlserver
  MINIO_ROOT_PASSWORD: gqlserver

  ADMIN_EMAIL: admin@example.com
  ADMIN_PASSWORD: gqlserver

  SECRET_KEY: f2e85774-9a3b-46a5-8170-b40a05ead6ef
```

