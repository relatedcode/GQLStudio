import express from "express";
import { CREATE_CREDENTIAL, CREATE_USER, UPDATE_USER } from "graphql/mutations";
import { createGQLUser, updateGQLUser } from "utils/auth";
import graphQLClient from "utils/graphql";

export const createUser = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { name, email, password } = req.body;

    const user = await createGQLUser({
      email,
      password,
    });

    await graphQLClient(user.idToken).request(CREATE_USER, {
      objectId: user.uid,
      name,
      email,
      groups: [],
    });

    await graphQLClient(user.idToken).request(CREATE_CREDENTIAL, {
      accessToken: "",
      sshPrivateKey: "",
      sshKeyFingerprint: "",
      sshPassphrase: "",
    });

    res.locals.data = user;
    return next("router");
  } catch (err) {
    return next(err);
  }
};

export const updateUser = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { name, email, photoURL } = req.body;
    const { id } = req.params;
    const { uid } = res.locals;

    if (id !== uid) throw new Error("Not allowed.");

    if (email) {
      await updateGQLUser(res.locals.token, uid, {
        email,
      });
    }

    await graphQLClient(res.locals.token).request(UPDATE_USER, {
      objectId: uid,
      ...(name && { name }),
      ...(email && { email }),
      ...(photoURL != null && { photoURL }),
    });

    res.locals.data = {
      success: true,
    };
    return next("router");
  } catch (err) {
    return next(err);
  }
};
