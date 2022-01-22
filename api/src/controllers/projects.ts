import express from "express";
import fs from "fs";
import {
  CREATE_PROJECT,
  UPDATE_CREDENTIAL,
  UPDATE_PROJECT,
} from "graphql/mutations";
import { GET_CREDENTIAL, GET_PROJECT } from "graphql/queries";
import yaml from "js-yaml";
import { NodeSSH } from "node-ssh";
import os from "os";
import {
  canResolve,
  deleteData,
  fetcher,
  logTime,
  postData,
  sleep,
} from "utils";
import graphQLClient from "utils/graphql";
import randomId from "utils/random-id";
import { v4 as uuidv4 } from "uuid";

export const getCredentials = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const credentials = await graphQLClient(res.locals.token).request(
      GET_CREDENTIAL
    );

    res.locals.data = credentials.credential;
    return next("router");
  } catch (err) {
    return next(err);
  }
};

export const setCredentials = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const {
      accessToken,
      sshPrivateKey,
      sshKeyFingerprint,
      sshPassphrase,
      customDomain,
    } = req.body;

    await graphQLClient(res.locals.token).request(UPDATE_CREDENTIAL, {
      ...(accessToken != null && { accessToken }),
      ...(sshPrivateKey != null && { sshPrivateKey }),
      ...(sshKeyFingerprint != null && { sshKeyFingerprint }),
      ...(sshPassphrase != null && { sshPassphrase }),
      ...(customDomain != null && { customDomain }),
    });

    res.locals.data = {
      success: true,
    };
    return next("router");
  } catch (err) {
    return next(err);
  }
};

export const createProject = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { uid } = res.locals;
    const { title, region, size, type } = req.body;

    if (!title || !region || !size || !type) {
      throw new Error("Arguments are missing.");
    }

    const {
      credential: {
        accessToken: ACCESS_TOKEN,
        sshPrivateKey: SSH_PRIVATE_KEY,
        sshKeyFingerprint: SSH_KEY_FINGERPRINT,
        customDomain: CUSTOM_DOMAIN,
      },
    } = await graphQLClient(res.locals.token).request(GET_CREDENTIAL);

    if (!(ACCESS_TOKEN && SSH_PRIVATE_KEY && SSH_KEY_FINGERPRINT))
      throw new Error("Missing DigitalOcean credentials.");

    if (CUSTOM_DOMAIN) {
      await fetcher(
        `https://api.digitalocean.com/v2/domains/${CUSTOM_DOMAIN}`,
        {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        }
      );
    }

    const objectId = uuidv4();

    await graphQLClient(res.locals.token).request(CREATE_PROJECT, {
      objectId,
      title,
      region,
      size,
      ownerId: uid,
      status: "new",
      isDeleted: false,
      type,
      logs: [`${logTime()} Project created with objectId: ${objectId}`],
    });

    activateProject(objectId, res.locals.token);

    res.locals.data = {
      id: objectId,
    };
    return next("router");
  } catch (err) {
    return next(err);
  }
};

export const updateProject = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { uid } = res.locals;
    const { id: objectId } = req.params;
    const { title } = req.body;

    const { project } = await graphQLClient(res.locals.token).request(
      GET_PROJECT,
      {
        objectId,
      }
    );

    if (project.ownerId !== uid) throw new Error("Permission denied.");

    await graphQLClient(res.locals.token).request(UPDATE_PROJECT, {
      objectId,
      title,
    });

    res.locals.data = {
      success: true,
    };
    return next("router");
  } catch (err) {
    return next(err);
  }
};

export const deleteProject = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { uid } = res.locals;
    const { id: objectId } = req.params;

    const { project } = await graphQLClient(res.locals.token).request(
      GET_PROJECT,
      {
        objectId,
      }
    );

    if (project.ownerId !== uid) throw new Error("Permission denied.");

    await graphQLClient(res.locals.token).request(UPDATE_PROJECT, {
      objectId,
      isDeleted: true,
    });

    deactivateProject(objectId, res.locals.token);

    res.locals.data = {
      success: true,
    };
    return next("router");
  } catch (err) {
    return next(err);
  }
};

export const activateProject = async (objectId: string, token: string) => {
  let dirName = "";
  let dirNameCaddyFile = "";
  let logs: any[] = [];
  try {
    const {
      credential: {
        accessToken: ACCESS_TOKEN,
        sshPrivateKey: SSH_PRIVATE_KEY,
        sshKeyFingerprint: SSH_KEY_FINGERPRINT,
        sshPassphrase: SSH_PASSPHRASE,
        customDomain: CUSTOM_DOMAIN,
      },
    } = await graphQLClient(token).request(GET_CREDENTIAL);

    const ssh = new NodeSSH();

    const { project } = await graphQLClient(token).request(GET_PROJECT, {
      objectId: objectId,
    });
    let { region, size, logs: projectLogs, type } = project;

    const dropletName = `${type}-${randomId(
      6,
      "abcdefghijklmnopqrstuvwxyz0123456789"
    )}`;

    logs = [...projectLogs];

    const data: any = await postData(
      "https://api.digitalocean.com/v2/droplets",
      {
        name: dropletName,
        region,
        size,
        image: "docker-20-04",
        ssh_keys: [SSH_KEY_FINGERPRINT],
      },
      {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      }
    );

    const dropletId = data.droplet.id;

    logs = [...logs, `${logTime()} ${type} server creation initiated...`];

    await graphQLClient(token).request(UPDATE_PROJECT, {
      objectId,
      dropletId: `${dropletId}`,
      dropletName,
      logs,
    });

    let ipV4;
    while (!ipV4) {
      await sleep(6000);

      const getDroplet: any = await fetcher(
        `https://api.digitalocean.com/v2/droplets/${dropletId}`,
        {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        }
      );

      if (
        getDroplet.droplet.status === "active" &&
        getDroplet.droplet.networks.v4.length
      ) {
        const publicIpObject = getDroplet.droplet.networks.v4.find(
          (ip: any) => ip.type === "public"
        );
        if (publicIpObject) {
          const dropletIPAddress = publicIpObject.ip_address;
          if (dropletIPAddress) ipV4 = dropletIPAddress;
        }
      }
    }

    let secrets: any = {};
    let dockerCompose: any = {};
    if (type === "hasura") {
      secrets = {
        hasuraAdminSecret: randomId(40),
        hasuraDBPassword: randomId(40),
      };
      dockerCompose = {
        version: "3.6",
        services: {
          postgres: {
            image: "postgres:12",
            ports: ["5432:5432"],
            restart: "always",
            volumes: ["db_data:/var/lib/postgresql/data"],
            environment: {
              POSTGRES_PASSWORD: secrets.hasuraDBPassword,
            },
          },
          "graphql-engine": {
            image: "hasura/graphql-engine:v2.1.1",
            ports: ["80:8080"],
            depends_on: ["postgres"],
            restart: "always",
            environment: {
              HASURA_GRAPHQL_DATABASE_URL: `postgres://postgres:${secrets.hasuraDBPassword}@postgres:5432/postgres`,
              HASURA_GRAPHQL_ENABLE_CONSOLE: "true",
              HASURA_GRAPHQL_DEV_MODE: "true",
              HASURA_GRAPHQL_ADMIN_SECRET: secrets.hasuraAdminSecret,
            },
          },
        },
        volumes: {
          db_data: null,
        },
      };
    }
    if (type === "directus") {
      secrets = {
        directusAdminEmail: "admin@example.com",
        directusAdminPassword: randomId(10),
        directusKey: randomId(40),
        directusSecret: randomId(40),
        directusDBPassword: randomId(40),
      };
      dockerCompose = {
        version: "3",
        services: {
          database: {
            container_name: "database",
            image: "postgis/postgis:13-master",
            volumes: ["./data/database:/var/lib/postgresql/data"],
            networks: ["directus"],
            environment: {
              POSTGRES_USER: "directus",
              POSTGRES_PASSWORD: secrets.directusDBPassword,
              POSTGRES_DB: "directus",
            },
          },
          cache: {
            container_name: "cache",
            image: "redis:6",
            networks: ["directus"],
          },
          directus: {
            container_name: "directus",
            image: "directus/directus:9.4.1",
            ports: ["80:8055"],
            volumes: ["./uploads:/directus/uploads"],
            networks: ["directus"],
            depends_on: ["cache", "database"],
            environment: {
              KEY: secrets.directusKey,
              SECRET: secrets.directusSecret,
              DB_CLIENT: "pg",
              DB_HOST: "database",
              DB_PORT: "5432",
              DB_DATABASE: "directus",
              DB_USER: "directus",
              DB_PASSWORD: secrets.directusDBPassword,
              CACHE_ENABLED: "true",
              CACHE_STORE: "redis",
              CACHE_REDIS: "redis://cache:6379",
              ADMIN_EMAIL: secrets.directusAdminEmail,
              ADMIN_PASSWORD: secrets.directusAdminPassword,
            },
          },
        },
        networks: {
          directus: null,
        },
      };
    }
    if (type === "gqlserver") {
      secrets = {
        gqliteAdminEmail: "admin@example.com",
        gqliteAdminPassword: randomId(10),
        gqliteSecretKey: randomId(40),
        gqliteMinioPassword: randomId(40),
        gqliteRedisPassword: randomId(40),
        gqliteDBPassword: randomId(40),
      };
      dockerCompose = {
        services: {
          gqlserver: {
            image: "relatedcode/gqlserver:latest",
            container_name: "gqlserver",
            ports: ["4000:4000"],
            environment: {
              DB_HOST: "pg",
              DB_PORT: 5432,
              DB_DATABASE: "gqlserver",
              DB_USER: "gqlserver",
              DB_PASSWORD: secrets.gqliteDBPassword,
              CACHE_HOST: "rd",
              CACHE_PORT: 6379,
              CACHE_PASSWORD: secrets.gqliteRedisPassword,
              MINIO_ROOT_USER: "gqlserver",
              MINIO_ROOT_PASSWORD: secrets.gqliteMinioPassword,
              ADMIN_EMAIL: secrets.gqliteAdminEmail,
              ADMIN_PASSWORD: secrets.gqliteAdminPassword,
              SECRET_KEY: secrets.gqliteSecretKey,
            },
            depends_on: ["redis", "postgres"],
            command: [
              "./wait-for-it.sh",
              "pg:5432",
              "--",
              "./wait-for-it.sh",
              "rd:6379",
              "--",
              "npm",
              "run",
              "watch:config",
            ],
            volumes: ["./config:/app/config"],
          },
          gqlserver_admin: {
            image: "relatedcode/gqlserver-admin:latest",
            container_name: "gqlserver_admin",
            ports: ["80:3000"],
            depends_on: ["gqlserver"],
          },
          postgres: {
            container_name: "pg",
            image: "postgres",
            ports: ["5432:5432"],
            environment: {
              POSTGRES_USER: "gqlserver",
              POSTGRES_PASSWORD: secrets.gqliteDBPassword,
              POSTGRES_DB: "gqlserver",
            },
            volumes: ["./data/pg:/var/lib/postgresql/data"],
          },
          redis: {
            image: "redis",
            container_name: "rd",
            ports: ["6379:6379"],
            command: `redis-server --requirepass ${secrets.gqliteRedisPassword} --save 60 1`,
            volumes: ["./data/rd:/data"],
          },
          minio: {
            image: "minio/minio",
            container_name: "minio",
            ports: ["9000:9000", "9001:9001"],
            environment: {
              MINIO_ROOT_USER: "gqlserver",
              MINIO_ROOT_PASSWORD: secrets.gqliteMinioPassword,
            },
            command: 'server /data --console-address ":9001"',
            volumes: ["./data/minio:/data"],
          },
        },
      };
    }

    logs = [
      ...logs,
      `${logTime()} ${type} server successfully created`,
      `${logTime()} Configuring the project...`,
    ];

    await graphQLClient(token).request(UPDATE_PROJECT, {
      objectId,
      dropletIPAddress: ipV4,
      logs,
      ...secrets,
    });

    const yamlStr = yaml.dump(dockerCompose);
    dirName = `${os.tmpdir()}/docker-compose-${randomId(6)}.yaml`;
    fs.writeFileSync(dirName, yamlStr, "utf8");

    const setupCustomDomain = !!CUSTOM_DOMAIN;

    let subdomain: any;

    if (setupCustomDomain) {
      subdomain = `${dropletName}.${CUSTOM_DOMAIN}`;
      dirNameCaddyFile = `${os.tmpdir()}/Caddyfile-${randomId(6)}`;
      const content = `# replace :80 with your domain name to get automatic https via LetsEncrypt
${subdomain} {
  reverse_proxy graphql-engine:8080
}`;
      fs.writeFileSync(dirNameCaddyFile, content, "utf8");
    }

    let connectedViaSSH = false;
    let attemptToConnect = 0;
    while (!connectedViaSSH) {
      try {
        attemptToConnect += 1;
        await ssh.connect({
          host: ipV4,
          username: "root",
          privateKey: SSH_PRIVATE_KEY,
          passphrase: SSH_PASSPHRASE || "",
        });
        connectedViaSSH = true;
      } catch (err) {
        if (attemptToConnect > 10) throw new Error("Unable to connect via SSH");
        await sleep(6000);
      }
    }

    const cwd = "/root";
    await ssh.putFile(dirName, `${cwd}/docker-compose.yaml`);
    if (setupCustomDomain)
      await ssh.putFile(dirNameCaddyFile, `${cwd}/Caddyfile`);
    await ssh.execCommand("docker-compose up -d", { cwd });
    if (type === "directus")
      await ssh.execCommand("chmod 777 uploads", { cwd });
    ssh.dispose();

    let record: any;
    if (setupCustomDomain) {
      logs = [
        ...logs,
        `${logTime()} Creation of a custom subdomain with SSL...`,
      ];

      await graphQLClient(token).request(UPDATE_PROJECT, {
        objectId,
        logs,
      });

      record = await postData(
        `https://api.digitalocean.com/v2/domains/${CUSTOM_DOMAIN}/records`,
        {
          type: "A",
          name: dropletName,
          data: ipV4,
          priority: null,
          port: null,
          ttl: 3600,
          weight: null,
          flags: null,
          tag: null,
        },
        {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        }
      );
      let dnsFound = false;
      let attemptToFound = 0;
      while (!dnsFound) {
        attemptToFound += 1;
        await sleep(10000);
        dnsFound = (await canResolve(subdomain)) as any;
        if (attemptToFound > 20) {
          break;
        }
      }
    }

    logs = [...logs, `${logTime()} Your project is ready to go!🎉`];

    await graphQLClient(token).request(UPDATE_PROJECT, {
      objectId,
      status: "active",
      link: subdomain ? `https://${subdomain}` : `http://${ipV4}`,
      domainRecordId: record ? record.domain_record.id : "",
      logs,
    });

    if (dirName) fs.unlinkSync(dirName);
    if (dirNameCaddyFile) fs.unlinkSync(dirNameCaddyFile);

    return true;
  } catch (err: any) {
    console.log(err);

    if (dirName) fs.unlinkSync(dirName);
    if (dirNameCaddyFile) fs.unlinkSync(dirNameCaddyFile);

    await graphQLClient(token).request(UPDATE_PROJECT, {
      objectId,
      status: "off",
      logs: [...logs, `${logTime()} Error: ${err.message}❌`],
    });
    return false;
  }
};

export const deactivateProject = async (objectId: string, token: string) => {
  try {
    const {
      credential: { accessToken: ACCESS_TOKEN, customDomain: CUSTOM_DOMAIN },
    } = await graphQLClient(token).request(GET_CREDENTIAL);

    const { project } = await graphQLClient(token).request(GET_PROJECT, {
      objectId,
    });

    if (project.dropletId) {
      await deleteData(
        `https://api.digitalocean.com/v2/droplets/${project.dropletId}`,
        {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        }
      );
    }

    if (project.domainRecordId) {
      await deleteData(
        `https://api.digitalocean.com/v2/domains/${CUSTOM_DOMAIN}/records/${project.domainRecordId}`,
        {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        }
      );
    }

    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
