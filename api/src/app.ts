import * as groups from "controllers/groups";
import * as members from "controllers/members";
import * as projects from "controllers/projects";
import * as requests from "controllers/requests";
import * as users from "controllers/users";
import cors from "cors";
import express from "express";
import { verifyToken } from "utils/auth";

const app = express();

app.disable("x-powered-by");
app.set("json spaces", 2);
app.use(cors({ origin: "*", methods: "GET,POST,HEAD,OPTIONS,DELETE" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const authMiddleware = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    if (!(req.headers && req.headers.authorization))
      throw new Error("The function must be called by an authenticated user.");

    const token = req.headers.authorization.split("Bearer ")[1];
    if (!token)
      throw new Error("The function must be called by an authenticated user.");

    const decodedToken = (await verifyToken(token)) as any;

    res.locals.uid = decodedToken.uid;
    res.locals.token = token;
    return next();
  } catch (err) {
    return next(err);
  }
};

const usersRouter = express.Router();
usersRouter.post("/", users.createUser);
usersRouter.post("/:id", authMiddleware, users.updateUser);

const groupsRouter = express.Router();
groupsRouter.use(authMiddleware);

groupsRouter.post("/import", groups.importGroup);
groupsRouter.get("/:groupId/export", groups.exportGroup);

groupsRouter.post("/", groups.createGroup);
groupsRouter.post("/:groupId", groups.updateGroup);
groupsRouter.delete("/:groupId", groups.deleteGroup);

groupsRouter.post("/:groupId/requests", requests.createRequest);
groupsRouter.post("/:groupId/requests/:requestId", requests.updateRequest);
groupsRouter.delete("/:groupId/requests/:requestId", requests.deleteRequest);

groupsRouter.post("/:groupId/members", members.addMember);
groupsRouter.post("/:groupId/members/:memberId", members.editMemberPermission);
groupsRouter.delete("/:groupId/members/:memberId", members.deleteMember);

const projectRouter = express.Router();
projectRouter.use(authMiddleware);
projectRouter.get("/credentials", projects.getCredentials);
projectRouter.post("/credentials", projects.setCredentials);
projectRouter.post("/", projects.createProject);
projectRouter.post("/:id", projects.updateProject);
projectRouter.delete("/:id", projects.deleteProject);

app.get("/templates", authMiddleware, groups.getTemplatesList);
app.use("/users", usersRouter);
app.use("/groups", groupsRouter);
app.use("/projects", projectRouter);

app.post("/prettify", authMiddleware, requests.prettify);

app.use(
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path === "/graphql") return next();
    if (!res.locals.data) throw new Error("The requested URL was not found.");
    res.statusCode = 200;
    if (res.locals.data === true) return res.end();
    res.set("Content-Type", "application/json");
    return res.json(res.locals.data);
  }
);

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    res.set("Content-Type", "application/json");
    res.statusCode = 400;
    return res.json({
      error: {
        message: err.message,
      },
    });
  }
);

const PORT = 4001;

app.listen(PORT, () => {
  console.log(`🚀 GQLStudio server is running at http://localhost:${PORT}`);
});
