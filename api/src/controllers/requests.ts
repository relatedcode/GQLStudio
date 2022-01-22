import express from "express";
import { CREATE_REQUEST, UPDATE_REQUEST } from "graphql/mutations";
import { GET_GROUP } from "graphql/queries";
import prettier from "prettier";
import graphQLClient from "utils/graphql";
import { v4 as uuidv4 } from "uuid";

export const prettify = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { text, type } = req.body;

    const result = prettier.format(text, {
      parser: type || "graphql",
    });

    res.locals.data = {
      result,
    };
    return next();
  } catch (err) {
    return next(err);
  }
};

export const createRequest = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { uid } = res.locals;
    const { groupId } = req.params;
    const {
      objectId: providedObjectId,
      title,
      link,
      body,
      headers,
      notes,
      variables,
      appSyncKey,
      wsProtocol,
      createdAt,
    } = req.body;

    const { group } = await graphQLClient(res.locals.token).request(GET_GROUP, {
      objectId: groupId,
    });

    if (!group.write.includes(uid)) {
      throw new Error("Permission denied.");
    }

    const objectId = providedObjectId || uuidv4();

    await graphQLClient(res.locals.token).request(CREATE_REQUEST, {
      objectId,
      groupId,
      title: title || "No title",
      ...(link && { link }),
      ...(body && { body }),
      ...(headers && { headers }),
      ...(notes && { notes }),
      ...(variables && { variables }),
      ...(appSyncKey && { appSyncKey }),
      ...(wsProtocol && { wsProtocol }),
      ...(createdAt && { createdAt }),
    });

    res.locals.data = {
      id: objectId,
    };
    return next("router");
  } catch (err) {
    return next(err);
  }
};

export const updateRequest = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { uid } = res.locals;
    const { groupId, requestId } = req.params;
    const {
      title,
      link,
      body,
      headers,
      notes,
      variables,
      appSyncKey,
      wsProtocol,
    } = req.body;

    const { group } = await graphQLClient(res.locals.token).request(GET_GROUP, {
      objectId: groupId,
    });

    if (!group.write.includes(uid)) {
      throw new Error("Permission denied.");
    }

    await graphQLClient(res.locals.token).request(UPDATE_REQUEST, {
      objectId: requestId,
      ...(title != null && { title }),
      ...(link != null && { link }),
      ...(body != null && { body }),
      ...(headers != null && { headers }),
      ...(notes != null && { notes }),
      ...(variables != null && { variables }),
      ...(appSyncKey != null && { appSyncKey }),
      ...(wsProtocol != null && { wsProtocol }),
    });

    res.locals.data = {
      success: true,
    };
    return next("router");
  } catch (err) {
    return next(err);
  }
};

export const deleteRequest = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { uid } = res.locals;
    const { groupId, requestId } = req.params;

    const { group } = await graphQLClient(res.locals.token).request(GET_GROUP, {
      objectId: groupId,
    });

    if (group.ownerId !== uid) {
      throw new Error("Permission denied.");
    }

    await graphQLClient(res.locals.token).request(UPDATE_REQUEST, {
      objectId: requestId,
      isDeleted: true,
    });

    res.locals.data = {
      success: true,
    };
    return next("router");
  } catch (err) {
    return next(err);
  }
};
