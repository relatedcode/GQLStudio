const MODEL_NAME_USER = "users";
module.exports.createUserResolver = function (
  database,
  Operation,
  withFilter,
  pubsub
) {
  return {
    Subscription: {
      user: {
        subscribe: withFilter(
          () => pubsub.asyncIterator(MODEL_NAME_USER),
          (payload, args) => {
            if (args.objectId) {
              return payload.user.objectId === args.objectId;
            }
            if (args.groupId) {
              return payload.user.groups.includes(args.groupId);
            }
            return true;
          }
        ),
      },
    },
    Query: {
      users: async (root, args) => {
        let filter = {};
        if (args.groupId) {
          filter = {
            groups: {
              [Operation.contains]: [args.groupId],
            },
          };
        }
        if (args.updatedAt) {
          filter = {
            updatedAt: {
              [Operation.gt]: args.updatedAt,
            },
          };
        }
        return await database.models[MODEL_NAME_USER].findAll({
          where: filter,
        });
      },
      user: async (root, args) => {
        let filter = {};
        if (args.objectId) {
          filter = {
            objectId: {
              [Operation.eq]: args.objectId,
            },
          };
        }
        if (args.email) {
          filter = {
            email: {
              [Operation.eq]: args.email,
            },
          };
        }
        return (
          await database.models[MODEL_NAME_USER].findOne({
            where: filter,
          })
        ).dataValues;
      },
    },
    Mutation: {
      createUser: async (root, args, context, info) => {
        const user = await database.models[MODEL_NAME_USER].create(args);
        pubsub.publish(MODEL_NAME_USER, {
          user: user.dataValues,
        });
        return user.dataValues;
      },
      updateUser: async (root, args, context, info) => {
        const filter = {
          where: { objectId: args.objectId },
          returning: true,
        };
        const user = (
          await database.models[MODEL_NAME_USER].update(args, filter)
        )[1][0];
        pubsub.publish(MODEL_NAME_USER, {
          user: user.dataValues,
        });
        return user.dataValues;
      },
    },
  };
};

const MODEL_NAME_GROUP = "groups";
module.exports.createGroupResolver = function (
  database,
  Operation,
  withFilter,
  pubsub
) {
  return {
    Subscription: {
      group: {
        subscribe: withFilter(
          () => pubsub.asyncIterator(MODEL_NAME_GROUP),
          (payload, args) => {
            return true;
          }
        ),
      },
    },
    Query: {
      groups: async (root, args) => {
        let filter = {
          isDeleted: false,
        };
        if (args.userId) {
          filter = {
            access: {
              [Operation.contains]: [args.userId],
            },
            isDeleted: false,
          };
        }
        if (args.updatedAt) {
          filter = {
            updatedAt: {
              [Operation.gt]: args.updatedAt,
            },
          };
        }
        return await database.models[MODEL_NAME_GROUP].findAll({
          where: filter,
          order: [["createdAt", "ASC"]],
        });
      },
      group: async (root, args) => {
        let filter = {};
        if (args.objectId) {
          filter = {
            objectId: {
              [Operation.eq]: args.objectId,
            },
          };
        }
        return (
          await database.models[MODEL_NAME_GROUP].findOne({
            where: filter,
          })
        ).dataValues;
      },
    },
    Mutation: {
      createGroup: async (root, args, context, info) => {
        const group = await database.models[MODEL_NAME_GROUP].create(args);
        pubsub.publish(MODEL_NAME_GROUP, {
          group: group.dataValues,
        });
        return group.dataValues;
      },
      updateGroup: async (root, args, context, info) => {
        const filter = {
          where: { objectId: args.objectId },
          returning: true,
        };
        const group = (
          await database.models[MODEL_NAME_GROUP].update(args, filter)
        )[1][0];
        pubsub.publish(MODEL_NAME_GROUP, {
          group: group.dataValues,
        });
        return group.dataValues;
      },
    },
  };
};

const MODEL_NAME_REQUEST = "requests";
module.exports.createRequestResolver = function (
  database,
  Operation,
  withFilter,
  pubsub
) {
  return {
    Subscription: {
      request: {
        subscribe: withFilter(
          () => pubsub.asyncIterator(MODEL_NAME_REQUEST),
          (payload, args) => {
            if (args.groupId) {
              return payload.request.groupId === args.groupId;
            }
            if (args.objectId) {
              return payload.request.objectId === args.objectId;
            }
            return true;
          }
        ),
      },
    },
    Query: {
      requests: async (root, args) => {
        let filter = {
          isDeleted: false,
        };
        if (args.userId) {
          return await database.models[MODEL_NAME_REQUEST].findAll({
            where: filter,
            include: {
              model: database.models[MODEL_NAME_GROUP],
              as: "group",
              where: {
                access: {
                  [Operation.contains]: [args.userId],
                },
              },
            },
            order: [["createdAt", "ASC"]],
          });
        }
        if (args.groupId) {
          filter = {
            groupId: {
              [Operation.eq]: args.groupId,
            },
            isDeleted: false,
          };
        }
        if (args.updatedAt) {
          filter = {
            updatedAt: {
              [Operation.gt]: args.updatedAt,
            },
          };
        }
        return await database.models[MODEL_NAME_REQUEST].findAll({
          where: filter,
          order: [["createdAt", "ASC"]],
        });
      },
      request: async (root, args) => {
        let filter = {};
        if (args.objectId) {
          filter = {
            objectId: {
              [Operation.eq]: args.objectId,
            },
          };
        }
        return (
          await database.models[MODEL_NAME_REQUEST].findOne({
            where: filter,
          })
        ).dataValues;
      },
    },
    Mutation: {
      createRequest: async (root, args, context, info) => {
        const request = await database.models[MODEL_NAME_REQUEST].create(args);
        pubsub.publish(MODEL_NAME_REQUEST, {
          request: request.dataValues,
        });
        return request.dataValues;
      },
      updateRequest: async (root, args, context, info) => {
        const filter = {
          where: { objectId: args.objectId },
          returning: true,
        };
        const request = (
          await database.models[MODEL_NAME_REQUEST].update(args, filter)
        )[1][0];
        pubsub.publish(MODEL_NAME_REQUEST, {
          request: request.dataValues,
        });
        return request.dataValues;
      },
    },
  };
};

const MODEL_NAME_PROJECT = "projects";
module.exports.createProjectResolver = function (
  database,
  Operation,
  withFilter,
  pubsub
) {
  return {
    Subscription: {
      project: {
        subscribe: withFilter(
          () => pubsub.asyncIterator(MODEL_NAME_PROJECT),
          (payload, args) => {
            if (args.ownerId) {
              return payload.project.ownerId === args.ownerId;
            }
            return true;
          }
        ),
      },
    },
    Query: {
      projects: async (root, args) => {
        let filter = {};
        if (args.ownerId) {
          filter = {
            ownerId: {
              [Operation.eq]: args.ownerId,
            },
            isDeleted: false,
          };
        }
        return await database.models[MODEL_NAME_PROJECT].findAll({
          where: filter,
          order: [["createdAt", "ASC"]],
        });
      },
      project: async (root, args) => {
        let filter = {};
        if (args.objectId) {
          filter = {
            objectId: {
              [Operation.eq]: args.objectId,
            },
          };
        }
        return (
          await database.models[MODEL_NAME_PROJECT].findOne({
            where: filter,
          })
        ).dataValues;
      },
    },
    Mutation: {
      createProject: async (root, args, context, info) => {
        const project = await database.models[MODEL_NAME_PROJECT].create(args);
        pubsub.publish(MODEL_NAME_PROJECT, {
          project: project.dataValues,
        });
        return project.dataValues;
      },
      updateProject: async (root, args, context, info) => {
        const filter = {
          where: { objectId: args.objectId },
          returning: true,
        };
        const project = (
          await database.models[MODEL_NAME_PROJECT].update(args, filter)
        )[1][0];
        pubsub.publish(MODEL_NAME_PROJECT, {
          project: project.dataValues,
        });
        return project.dataValues;
      },
    },
  };
};

const MODEL_NAME_CREDENTIAL = "credentials";
module.exports.createCredentialResolver = function (
  database,
  Operation,
  withFilter,
  pubsub
) {
  return {
    Query: {
      credential: async (root, args, { res }) => {
        let filter = {
          userId: {
            [Operation.eq]: res.locals.uid,
          },
        };
        return (
          await database.models[MODEL_NAME_CREDENTIAL].findOne({
            where: filter,
          })
        ).dataValues;
      },
    },
    Mutation: {
      createCredential: async (root, args, { res }, info) => {
        const credential = await database.models[MODEL_NAME_CREDENTIAL].create({
          userId: res.locals.uid,
          ...args,
        });
        return credential.dataValues;
      },
      updateCredential: async (root, args, { res }, info) => {
        const filter = {
          where: { userId: res.locals.uid },
          returning: true,
        };
        const credential = (
          await database.models[MODEL_NAME_CREDENTIAL].update(args, filter)
        )[1][0];
        return credential.dataValues;
      },
    },
  };
};
