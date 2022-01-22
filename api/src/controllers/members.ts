import express from "express";
import { UPDATE_GROUP, UPDATE_USER } from "graphql/mutations";
import { GET_GROUP, GET_USER } from "graphql/queries";
import { arrayRemove, arrayUnion } from "utils/array-helpers";
import graphQLClient from "utils/graphql";

export const addMember = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { uid } = res.locals;
    const { groupId } = req.params;
    const { email } = req.body;

    const { group } = await graphQLClient(res.locals.token).request(GET_GROUP, {
      objectId: groupId,
    });

    if (!group.write.includes(uid)) throw new Error("Permission denied.");

    const { user: newMember } = await graphQLClient(res.locals.token).request(
      GET_USER,
      {
        email,
      }
    );

    if (group.access.includes(newMember.uid))
      throw new Error("The user is already in this group.");

    await graphQLClient(res.locals.token).request(UPDATE_GROUP, {
      objectId: groupId,
      access: arrayUnion(group.access, newMember.objectId),
    });

    await graphQLClient(res.locals.token).request(UPDATE_USER, {
      objectId: newMember.objectId,
      groups: arrayUnion(newMember.groups, groupId),
    });

    res.locals.data = {
      success: true,
    };
    return next("router");
  } catch (err: any) {
    if (err.message.includes("Cannot read property 'dataValues' of null"))
      err.message = "This email is not associated with any user.";
    return next(err);
  }
};

export const editMemberPermission = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { uid } = res.locals;
    const { groupId, memberId } = req.params;
    const { permission } = req.body;

    if (memberId === uid) {
      throw new Error("Cannot edit the owner's permission.");
    }

    const { group } = await graphQLClient(res.locals.token).request(GET_GROUP, {
      objectId: groupId,
    });

    if (!group.write.includes(uid)) throw new Error("Permission denied.");

    if (!group.access.includes(memberId)) {
      throw new Error(`${memberId} is not in the group.`);
    }

    if (permission === "editor") {
      await graphQLClient(res.locals.token).request(UPDATE_GROUP, {
        objectId: groupId,
        write: arrayUnion(group.write, memberId),
      });
    } else if (permission === "viewer") {
      await graphQLClient(res.locals.token).request(UPDATE_GROUP, {
        objectId: groupId,
        write: arrayRemove(group.write, memberId),
      });
    }

    res.locals.data = {
      success: true,
    };
    return next("router");
  } catch (err) {
    return next(err);
  }
};

export const deleteMember = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { uid } = res.locals;
    const { groupId, memberId } = req.params;

    const { group } = await graphQLClient(res.locals.token).request(GET_GROUP, {
      objectId: groupId,
    });

    const { user: member } = await graphQLClient(res.locals.token).request(
      GET_USER,
      {
        objectId: memberId,
      }
    );

    if (memberId !== uid && group.ownerId !== uid)
      throw new Error("Permission denied.");

    await graphQLClient(res.locals.token).request(UPDATE_GROUP, {
      objectId: groupId,
      write: arrayRemove(group.write, memberId),
      access: arrayRemove(group.access, memberId),
    });

    await graphQLClient(res.locals.token).request(UPDATE_USER, {
      objectId: memberId,
      groups: arrayRemove(member.groups, groupId),
    });

    res.locals.data = {
      success: true,
    };
    return next("router");
  } catch (err) {
    return next(err);
  }
};
