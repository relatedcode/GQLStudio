import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  split,
} from "@apollo/client";
import {
  ApolloLink,
  FetchResult,
  Observable,
  Operation,
} from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";
import { getMainDefinition } from "@apollo/client/utilities";
import AuthGuard from "components/AuthGuard";
import DashboardLayout from "components/DashboardLayout";
import "components/DocExplorer/doc-explorer.css";
import "components/DocExplorer/loading.css";
import { getGQLServerUrl } from "config";
import { AuthProvider } from "contexts/AuthContext";
import { GroupsProvider } from "contexts/GroupsContext";
import {
  AddMemberContext,
  CreateGroupContext,
  CreateProjectContext,
  DeleteModalContext,
  ImportFileContext,
  ImportTemplateContext,
} from "contexts/ModalsContext";
import { ProjectsProvider } from "contexts/ProjectsContext";
import { RequestsProvider } from "contexts/RequestsContext";
import { UserProvider } from "contexts/UserContext";
import { getIdToken } from "gqlite-lib/dist/client/auth";
import { setUrl } from "gqlite-lib/dist/client/utils";
import { print } from "graphql";
import { Client, ClientOptions, createClient } from "graphql-ws";
import { useRouter } from "next/router";
import { SidebarProvider } from "providers/SidebarProvider";
import { ReactNode, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import "styles/global.css";

export class WebSocketLink extends ApolloLink {
  private client: Client;

  constructor(options: ClientOptions) {
    super();
    this.client = createClient(options);
  }

  public request(operation: Operation): Observable<FetchResult> {
    return new Observable((sink) => {
      return this.client.subscribe<FetchResult>(
        { ...operation, query: print(operation.query) },
        {
          next: sink.next.bind(sink),
          complete: sink.complete.bind(sink),
          error: (err) => {
            if (Array.isArray(err))
              // GraphQLError[]
              return sink.error(
                new Error(err.map(({ message }) => message).join(", "))
              );

            if (err instanceof CloseEvent)
              return sink.error(
                new Error(
                  `Socket closed with event ${err.code} ${err.reason || ""}` // reason will be available on clean closes only
                )
              );

            return sink.error(err);
          },
        }
      );
    });
  }
}

function CreateGroupProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <CreateGroupContext.Provider value={{ open, setOpen }}>
      {children}
    </CreateGroupContext.Provider>
  );
}

function CreateProjectProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <CreateProjectContext.Provider value={{ open, setOpen }}>
      {children}
    </CreateProjectContext.Provider>
  );
}

function AddMemberProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <AddMemberContext.Provider value={{ open, setOpen }}>
      {children}
    </AddMemberContext.Provider>
  );
}

function DeleteModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <DeleteModalContext.Provider value={{ open, setOpen }}>
      {children}
    </DeleteModalContext.Provider>
  );
}

function ImportTemplateProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <ImportTemplateContext.Provider value={{ open, setOpen }}>
      {children}
    </ImportTemplateContext.Provider>
  );
}

function ImportFileProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <ImportFileContext.Provider value={{ open, setOpen }}>
      {children}
    </ImportFileContext.Provider>
  );
}

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [apolloClient, setApolloClient] = useState(null);

  useEffect(() => {
    setUrl(getGQLServerUrl());

    const wsLink = new WebSocketLink({
      url: `${getGQLServerUrl().replace("http", "ws")}/graphql`,
      connectionParams: async () => {
        const token = await getIdToken();
        if (!token) {
          return {};
        }
        return {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
      },
    });

    const httpLink = new HttpLink({
      uri: `${getGQLServerUrl()}/graphql`,
    });

    const splitLink = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      wsLink,
      httpLink
    );

    const authLink = setContext(async (_, { headers }) => {
      // get the authentication token from local storage if it exists
      const token = await getIdToken();
      // return the headers to the context so httpLink can read them
      return {
        headers: {
          ...headers,
          ...(token && { authorization: `Bearer ${token}` }),
        },
      };
    });

    const client = new ApolloClient({
      link: authLink.concat(splitLink),
      cache: new InMemoryCache({ addTypename: false }),
    });
    setApolloClient(client);
  }, []);

  if (!apolloClient) return null;

  return (
    <ApolloProvider client={apolloClient}>
      <SidebarProvider>
        <CreateGroupProvider>
          <CreateProjectProvider>
            <AddMemberProvider>
              <DeleteModalProvider>
                <ImportTemplateProvider>
                  <ImportFileProvider>
                    <AuthProvider>
                      <UserProvider>
                        <GroupsProvider>
                          <RequestsProvider>
                            <ProjectsProvider>
                              <Toaster position="top-center" />
                              {!router.pathname.includes("/authentication") ? (
                                <AuthGuard>
                                  <DashboardLayout>
                                    <Component {...pageProps} />
                                  </DashboardLayout>
                                </AuthGuard>
                              ) : (
                                <Component {...pageProps} />
                              )}
                            </ProjectsProvider>
                          </RequestsProvider>
                        </GroupsProvider>
                      </UserProvider>
                    </AuthProvider>
                  </ImportFileProvider>
                </ImportTemplateProvider>
              </DeleteModalProvider>
            </AddMemberProvider>
          </CreateProjectProvider>
        </CreateGroupProvider>
      </SidebarProvider>
    </ApolloProvider>
  );
}

export default MyApp;
