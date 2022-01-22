import express from "express";
import fs from "fs";
import gql from "graphql-tag";
import {
  CREATE_GROUP,
  CREATE_REQUEST,
  UPDATE_GROUP,
  UPDATE_REQUEST,
  UPDATE_USER,
} from "graphql/mutations";
import { GET_GROUP, GET_REQUESTS, GET_USER } from "graphql/queries";
import { GQL_SERVER_URL } from "lib/config";
import os from "os";
import { arrayRemove, arrayUnion } from "utils/array-helpers";
import graphQLClient from "utils/graphql";
import { downloadFile, uploadFile } from "utils/storage";
import { v4 as uuidv4 } from "uuid";

export const getTemplatesList = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const templateRequests = fs.readdirSync(`${__dirname}/../../templates`);
    res.locals.data = {
      data: templateRequests,
    };
    return next();
  } catch (err) {
    return next(err);
  }
};

export const createGroup = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { uid } = res.locals;
    const { title, template, objectId: providedObjectId, createdAt } = req.body;

    const groupId = providedObjectId || uuidv4();

    const { user } = await graphQLClient(res.locals.token).request(GET_USER, {
      objectId: uid,
    });

    if (template) {
      const templateRequests = fs.readdirSync(
        `${__dirname}/../../templates/${template}`
      );

      await graphQLClient(res.locals.token).request(CREATE_GROUP, {
        objectId: groupId,
        title: template,
        ownerId: uid,
        access: [uid],
        write: [uid],
      });

      for (let i = 0; i < templateRequests.length; i++) {
        const templateRequest = templateRequests[i];
        const request = fs.readFileSync(
          `${__dirname}/../../templates/${template}/${templateRequest}`
        );
        const text = request.toString().split("\n\n");
        const link = text[0];
        const header = text[1];
        const body = text[2];
        const def = gql`
          ${body}
        `.definitions[0] as any;
        const title = def.name.value;
        const variables = text[3];

        await graphQLClient(res.locals.token).request(CREATE_REQUEST, {
          objectId: uuidv4(),
          groupId,
          title,
          link,
          body,
          headers: header,
          variables,
          notes: "",
        });
      }
    } else {
      await graphQLClient(res.locals.token).request(CREATE_GROUP, {
        objectId: groupId,
        title,
        ownerId: uid,
        access: [uid],
        write: [uid],
        ...(createdAt && { createdAt }),
      });
    }

    await graphQLClient(res.locals.token).request(UPDATE_USER, {
      objectId: uid,
      groups: arrayUnion(user.groups, groupId),
    });

    res.locals.data = {
      id: groupId,
    };
    return next("router");
  } catch (err) {
    return next(err);
  }
};

export const updateGroup = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { uid } = res.locals;
    const { groupId } = req.params;
    const { title } = req.body;

    const { group } = await graphQLClient(res.locals.token).request(GET_GROUP, {
      objectId: groupId,
    });

    if (!group.write.includes(uid))
      throw new Error("Only editors can update a group.");

    await graphQLClient(res.locals.token).request(UPDATE_GROUP, {
      objectId: groupId,
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

export const deleteGroup = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { uid } = res.locals;
    const { groupId } = req.params;

    const { group } = await graphQLClient(res.locals.token).request(GET_GROUP, {
      objectId: groupId,
    });

    const { user } = await graphQLClient(res.locals.token).request(GET_USER, {
      objectId: uid,
    });

    if (group.ownerId !== uid) throw new Error("Permission denied.");

    await graphQLClient(res.locals.token).request(UPDATE_GROUP, {
      objectId: groupId,
      isDeleted: true,
    });

    const { requests } = await graphQLClient(res.locals.token).request(
      GET_REQUESTS,
      {
        groupId,
      }
    );

    await Promise.all(
      requests.map(async (request: any) => {
        await graphQLClient(res.locals.token).request(UPDATE_REQUEST, {
          objectId: request.objectId,
          isDeleted: true,
        });
      })
    );

    await graphQLClient(res.locals.token).request(UPDATE_USER, {
      objectId: uid,
      groups: arrayRemove(user.groups, groupId),
    });

    res.locals.data = {
      success: true,
    };
    return next("router");
  } catch (err) {
    return next(err);
  }
};

export const exportGroup = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { uid } = res.locals;
    const { groupId } = req.params;

    const { group } = await graphQLClient(res.locals.token).request(GET_GROUP, {
      objectId: groupId,
    });

    if (group.ownerId !== uid) throw new Error("Permission denied.");

    const { requests } = await graphQLClient(res.locals.token).request(
      GET_REQUESTS,
      {
        groupId,
      }
    );

    const fileToExport = {
      title: group.title,
      requests: requests.map((request: any) => ({
        title: request.title,
        link: request.link,
        body: request.body,
        headers: request.headers,
        variables: request.variables,
        wsProtocol: request.wsProtocol,
        appSyncKey: request.appSyncKey,
      })),
    };

    res.locals.data = fileToExport;
    return next("router");
  } catch (err) {
    return next(err);
  }
};

export const importGroup = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { uid } = res.locals;
    const { url } = req.body;

    const directoryPath = `${os.tmpdir()}/gqlstudio`;
    const filePath = `${directoryPath}/${uuidv4()}.json`;

    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath);
    }

    await downloadFile(`${GQL_SERVER_URL}${url}`, filePath);

    const file = JSON.parse(fs.readFileSync(filePath).toString());

    const { user } = await graphQLClient(res.locals.token).request(GET_USER, {
      objectId: uid,
    });

    const groupId = uuidv4();

    await graphQLClient(res.locals.token).request(CREATE_GROUP, {
      objectId: groupId,
      title: file.title,
      ownerId: uid,
      access: [uid],
      write: [uid],
    });

    for (let i = 0; i < file.requests.length; i++) {
      const request = file.requests[i];

      await graphQLClient(res.locals.token).request(CREATE_REQUEST, {
        objectId: uuidv4(),
        groupId,
        title: request.title,
        link: request.link,
        body: request.body,
        headers: request.headers,
        variables: request.variables,
        wsProtocol: request.wsProtocol,
        appSyncKey: request.appSyncKey,
      });
    }

    await graphQLClient(res.locals.token).request(UPDATE_USER, {
      objectId: uid,
      groups: arrayUnion(user.groups, groupId),
    });

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.locals.data = {
      id: groupId,
    };
    return next("router");
  } catch (err) {
    return next(err);
  }
};
