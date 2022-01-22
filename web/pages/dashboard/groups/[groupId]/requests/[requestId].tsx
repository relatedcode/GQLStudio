/* eslint-disable */
import {
  ApolloClient,
  gql,
  HttpLink,
  InMemoryCache,
  split,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { Tab } from "@headlessui/react";
import { SparklesIcon, TrashIcon } from "@heroicons/react/outline";
import Button from "components/Button";
import DocExplorer from "components/DocExplorer";
import { css } from "components/editor/css";
import Style from "components/editor/Style";
import LoadingSection from "components/LoadingSection";
import Select from "components/Select";
import { useFormik } from "formik";
import { buildClientSchema, getIntrospectionQuery } from "graphql";
import useAuth from "hooks/useAuth";
import useGroupById from "hooks/useGroupById";
import usePermission from "hooks/usePermission";
import useRequestById from "hooks/useRequestById";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { WebSocketLink as WebSocketLinkTransportWS } from "pages/_app";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { deleteData, postData } from "utils/api-helpers";
import classNames from "utils/classNames";

const CodeMirror = dynamic(
  () => {
    import("codemirror-graphql/lint");
    import("codemirror-graphql/mode");
    import("codemirror/addon/edit/closebrackets");
    import("codemirror/addon/edit/matchbrackets");
    import("codemirror/mode/javascript/javascript");
    return import("react-codemirror2").then((mod) => mod.Controlled as any);
  },
  { ssr: false }
);

export const wsProtocolOptions = [
  {
    title: "graphql-transport-ws",
    value: "graphql-transport-ws",
  },
  {
    title: "graphql-ws",
    value: "graphql-ws",
  },
];

const cachedResponse = {};

function Tabs({
  categories,
  panels,
  setCategory,
  className,
  defaultIndex = 0,
}: {
  categories: string[];
  panels: any;
  setCategory: any;
  className?: string;
  defaultIndex?: number;
}) {
  return (
    <div className={classNames(className, "w-full")}>
      <Tab.Group
        onChange={(index) => {
          setCategory(categories[index]);
        }}
        defaultIndex={defaultIndex}
      >
        <Tab.List className="flex p-1 space-x-1 bg-transparent rounded-xl">
          {categories.map((category) => (
            <Tab
              key={category}
              className={({ selected }) =>
                classNames(
                  "w-full py-2.5 text-sm leading-5 font-medium text-gray-300 rounded-lg focus:outline-none",
                  selected ? "bg-gray-600 shadow" : "hover:bg-white/[0.12]"
                )
              }
            >
              {category}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          {categories.map((posts, idx) => (
            <Tab.Panel className="focus:outline-none" key={idx}>
              {panels[idx]}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}

function NoRequest() {
  return (
    <main className="flex-grow flex flex-col justify-center max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-full">
      <div className="py-16">
        <div className="text-center">
          <h1 className="mt-2 text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
            Request not found.
          </h1>
          <p className="mt-2 text-base text-gray-200">
            Sorry, we couldn&pos;t find the page you&pos;re looking for.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function Request() {
  const router = useRouter();
  const { requestId, groupId } = router.query;

  const { user } = useAuth();
  const { group } = useGroupById(groupId);
  const { data: request, loading } = useRequestById(requestId as string);

  const { write, owner } = usePermission(group, user);

  const [isUpdating, setIsUpdating] = useState(false);

  const subscriptionInstance = useRef<any>(null);
  const responseRef = useRef("");
  const [response, setResponse] = useState(
    cachedResponse[requestId as string] || ""
  );

  const [schema, setSchema] = useState<any>(undefined);

  const [reqParams, setReqParams] = useState("Body");
  const [resParams, setResParams] = useState("Response");
  const [otherParams, setOtherParams] = useState("Variables");

  const formik = useFormik({
    initialValues: {
      body: request?.body || "",
      headers: request?.headers || "",
      variables: request?.variables || "",
      notes: request?.notes || "",
      link: request?.link || "",
      wsProtocol: request?.wsProtocol || "graphql-transport-ws",
    },
    enableReinitialize: true,
    onSubmit: async () => {
      await handleSendRequest();
    },
  });
  const {
    values,
    setFieldValue,
    isSubmitting,
    setSubmitting,
    resetForm,
    dirty: isUpdated,
  } = formik;
  const { body, headers, variables, notes, link, wsProtocol } = values;

  const stopSubscription = () => {
    subscriptionInstance.current?.unsubscribe();
    setSubmitting(false);
  };

  const getSchema = async () => {
    try {
      if (!link) return;
      setSchema(undefined);
      const res = await fetch(
        link.replace("ws://", "http://").replace("wss://", "https://"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(headers && JSON.parse(headers)),
          },
          body: JSON.stringify({ query: getIntrospectionQuery() }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSchema(buildClientSchema(data.data));
    } catch (err: any) {
      setSchema(null);
      toast.error(err.message);
    }
  };

  useEffect(() => {
    stopSubscription();
    responseRef.current = "";
    setResponse(cachedResponse[requestId as string] || "");
    setReqParams("Body");
    setResParams("Response");
    setOtherParams("Variables");
  }, [requestId]);

  useEffect(() => {
    return () => {
      stopSubscription();
    };
  }, []);

  useEffect(() => {
    setSchema(null);
  }, [requestId, link]);

  useEffect(() => {
    if (resParams === "Documentation" && !schema) {
      getSchema();
    }
  }, [resParams]);

  useEffect(() => {
    const confirmationMessage =
      "Unsaved changes. Are you sure you want to leave this page?";
    const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
      (e || window.event).returnValue = confirmationMessage;
      return confirmationMessage; // Gecko + Webkit, Safari, Chrome etc.
    };
    const beforeRouteHandler = (url: string) => {
      if (router.pathname !== url && !confirm(confirmationMessage)) {
        // to inform NProgress or something ...
        router.events.emit("routeChangeError");
        // tslint:disable-next-line: no-string-throw
        throw `Route change to "${url}" was aborted (this error can be safely ignored). See https://github.com/zeit/next.js/issues/2476.`;
      }
      cachedResponse[requestId as string] = "";
    };
    if (isUpdated && write) {
      window.addEventListener("beforeunload", beforeUnloadHandler);
      router.events.on("routeChangeStart", beforeRouteHandler);
    } else {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
      router.events.off("routeChangeStart", beforeRouteHandler);
    }
    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
      router.events.off("routeChangeStart", beforeRouteHandler);
    };
  }, [isUpdated]);

  const handlePrettify = async () => {
    try {
      const { result } = await postData(`/prettify`, {
        text: body,
      });
      setFieldValue("body", result);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      stopSubscription();
      if (!write) throw new Error("Permission denied!");
      let title = "No title";
      if (body) {
        try {
          const query = gql`
            ${body}
          `;
          title = getMainDefinition(query).name?.value ?? "No title";
        } catch (err) {
          title = "No title";
        }
      }
      const linkUpdated = link !== request.link;
      const bodyUpdated = body !== request.body;
      const notesUpdated = notes !== request.notes;
      const headersUpdated = headers !== request.headers;
      const variablesUpdated = variables !== request.variables;
      const wsProtocolUpdated = wsProtocol !== request.wsProtocol;
      if (
        linkUpdated ||
        bodyUpdated ||
        notesUpdated ||
        headersUpdated ||
        variablesUpdated ||
        wsProtocolUpdated
      ) {
        await postData(`/groups/${groupId}/requests/${requestId}`, {
          ...(bodyUpdated && { title }),
          ...(linkUpdated && { link }),
          ...(bodyUpdated && { body }),
          ...(headersUpdated && { headers }),
          ...(notesUpdated && { notes }),
          ...(variablesUpdated && { variables }),
          ...(wsProtocolUpdated && { wsProtocol }),
        });
      }
    } catch (err: any) {
      toast.error(err.message);
      console.error(err);
    }
    setIsUpdating(false);
  };

  const handleSendRequest = async () => {
    setSubmitting(true);
    try {
      if (!link) throw new Error("There is no URL.");
      if (!body) throw new Error("There is no request body.");

      subscriptionInstance.current?.unsubscribe();
      responseRef.current = "";
      setResponse("");

      let valHeaders;
      try {
        valHeaders = headers ? JSON.parse(headers) : "";
      } catch (err) {
        throw new Error("There is an issue with your headers.");
      }

      let valVariables;
      try {
        valVariables = variables ? JSON.parse(variables) : "";
      } catch (err) {
        throw new Error("There is an issue with your variables.");
      }

      let query;
      try {
        query = gql`
          ${body}
        `;
      } catch (err) {
        throw new Error("There is an issue with your body.");
      }

      const definition: any = getMainDefinition(query);
      const queryType = definition.operation;

      if (queryType === "subscription") setResponse("Connecting...");

      let wsLink;
      if (wsProtocol === "graphql-transport-ws") {
        wsLink = new WebSocketLinkTransportWS({
          url: link.replace("http://", "ws://").replace("https://", "wss://"),
          connectionParams: {
            headers: valHeaders,
          },
        });
      } else if (wsProtocol === "graphql-ws") {
        wsLink = new WebSocketLink({
          uri: link.replace("http://", "ws://").replace("https://", "wss://"),
          options: {
            reconnect: true,
            connectionParams: {
              headers: valHeaders,
            },
          },
        });
      }

      const httpLink = new HttpLink({
        uri: link.replace("ws://", "http://").replace("wss://", "https://"),
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
        return {
          headers: valHeaders,
        };
      });

      const client = new ApolloClient({
        link: authLink.concat(splitLink),
        cache: new InMemoryCache({ addTypename: true }),
      });

      let result;
      if (queryType === "query") {
        result = await client.query({
          query,
          variables: valVariables,
        });
      } else if (queryType === "mutation") {
        result = await client.mutate({
          mutation: query,
          variables: valVariables,
        });
      } else if (queryType === "subscription") {
        subscriptionInstance.current = await client
          .subscribe({
            query,
            variables: valVariables,
          })
          .subscribe({
            next: (data) => {
              const r = `// Event received at ${new Date().toLocaleString()}\n${JSON.stringify(
                data,
                null,
                2
              )}`;
              cachedResponse[requestId as string] = r;
              responseRef.current = r;
              setResponse(responseRef.current);
            },
            error(err) {
              responseRef.current = `// Error received at ${new Date().toLocaleString()}\n${JSON.stringify(
                err,
                null,
                2
              )}`;
              setResponse(responseRef.current);
            },
          });
      }
      if (queryType !== "subscription") {
        const { loading, networkStatus, ...data } = result;
        const r = JSON.stringify(data, null, 2);
        cachedResponse[requestId as string] = r;
        setResponse(r);
        setSubmitting(false);
      }
      if (queryType === "subscription") setResponse("Waiting...");
    } catch (err: any) {
      if (err.networkError)
        setResponse(JSON.stringify(err.networkError, null, 2));
      else if (err.graphQLErrors)
        setResponse(JSON.stringify(err.graphQLErrors, null, 2));
      else toast.error(err.message);
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const confirm = window.confirm(
        "Are you sure you want to delete this request?"
      );
      if (!confirm) return;
      if (requestId && groupId) {
        await deleteData(`/groups/${groupId}/requests/${requestId}`);
      }
      router.push(`/dashboard/groups/${groupId}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <LoadingSection />;
  if (!loading && requestId && !request) return <NoRequest />;

  let subscriptionRunning;
  try {
    subscriptionRunning =
      body &&
      (getMainDefinition(gql(body)) as any).operation === "subscription" &&
      isSubmitting;
  } catch (err) {}

  return (
    <div className="py-6">
      <div className="mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">{request?.title}</h1>
      </div>
      <div>
        <div className="py-6 w-full mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center w-full">
            <div className="w-4/5 flex items-center">
              <div className="code w-full">
                <input
                  type="text"
                  name="link"
                  id="link"
                  value={link}
                  onChange={(e: any) => setFieldValue("link", e.target.value)}
                  placeholder="URL"
                  className="focus:ring-green-500 bg-transparent focus:border-green-500 block w-full shadow-sm sm:text-base border-gray-500 text-gray-200 rounded-md"
                />
              </div>

              <Button
                loading={isSubmitting}
                onClick={() => handleSendRequest()}
                text="Go"
              />

              {subscriptionRunning && (
                <Button onClick={() => stopSubscription()} text="Stop" />
              )}
            </div>

            {isUpdated && (
              <div className="flex items-center justify-end ml-auto">
                {write && (
                  <Button
                    loading={isUpdating}
                    onClick={() => handleSave()}
                    text="Save"
                  />
                )}
                <Button
                  loading={isUpdating}
                  white
                  onClick={() => {
                    resetForm();
                    cachedResponse[requestId as string] = "";
                  }}
                  text="Cancel"
                />
              </div>
            )}
          </div>
        </div>

        <div className="py-6 grid grid-cols-2 gap-2 mx-auto px-5">
          {/* Body */}
          <Tabs
            categories={["Headers", "Body", "Server"]}
            defaultIndex={1}
            panels={[
              <CodeMirror
                // @ts-ignore
                value={headers}
                options={{
                  lineNumbers: true,
                  lineWrapping: true,
                  tabSize: 2,
                  indentUnit: 0,
                  mode: "javascript",
                  autoCloseBrackets: true,
                  matchBrackets: true,
                  showCursorWhenSelecting: true,
                  readOnly: false,
                  foldGutter: {
                    minFoldSize: 2,
                  },
                }}
                onBeforeChange={(editor, data, value) => {
                  setFieldValue("headers", value);
                }}
              />,
              <div className="relative">
                <button
                  onClick={() => handlePrettify()}
                  className="absolute top-4 right-4 z-10"
                >
                  <SparklesIcon className="h-5 w-5 text-white" />
                </button>
                <CodeMirror
                  // @ts-ignore
                  value={body}
                  options={{
                    lineNumbers: true,
                    lineWrapping: true,
                    tabSize: 2,
                    mode: "graphql",
                    autoCloseBrackets: true,
                    matchBrackets: true,
                    showCursorWhenSelecting: true,
                    readOnly: false,
                    foldGutter: {
                      minFoldSize: 2,
                    },
                  }}
                  onBeforeChange={(editor, data, value) => {
                    setFieldValue("body", value);
                  }}
                />
              </div>,
              <div className="py-5 px-4 bg-[#171c24] rounded-[15px]">
                <Select
                  name="wsProtocol"
                  value={wsProtocol}
                  options={wsProtocolOptions}
                  label="WebSocket protocol"
                  setFieldValue={setFieldValue}
                  className="mb-[345px]"
                />
              </div>,
            ]}
            setCategory={setReqParams}
          />

          {/* Response */}
          <Tabs
            className="row-span-2"
            categories={["Response", "Documentation"]}
            panels={[
              <CodeMirror
                // @ts-ignore
                value={response}
                options={{
                  lineNumbers: true,
                  lineWrapping: true,
                  tabSize: 2,
                  mode:
                    response === "Connecting..." || response === "Waiting..."
                      ? "text"
                      : "javascript",
                  theme: "custom-1",
                  autoCloseBrackets: true,
                  matchBrackets: true,
                  showCursorWhenSelecting: true,
                  readOnly: true,
                  foldGutter: {
                    minFoldSize: 4,
                  },
                }}
                onBeforeChange={(editor, data, value) => null}
              />,
              <DocExplorer schema={schema} />,
            ]}
            setCategory={setResParams}
          />

          {/* Notes */}
          <Tabs
            className="mt-5"
            categories={["Variables", "Notes"]}
            panels={[
              <CodeMirror
                // @ts-ignore
                value={variables}
                options={{
                  lineNumbers: true,
                  lineWrapping: true,
                  tabSize: 2,
                  indentUnit: 0,
                  mode: "javascript",
                  theme: "custom-0",
                  autoCloseBrackets: true,
                  matchBrackets: true,
                  showCursorWhenSelecting: true,
                  readOnly: false,
                  foldGutter: {
                    minFoldSize: 2,
                  },
                }}
                onBeforeChange={(editor, data, value) => {
                  setFieldValue("variables", value);
                }}
              />,
              <CodeMirror
                // @ts-ignore
                value={notes}
                options={{
                  lineNumbers: true,
                  lineWrapping: true,
                  tabSize: 2,
                  mode: "text",
                  theme: "custom-0",
                  autoCloseBrackets: true,
                  matchBrackets: true,
                  showCursorWhenSelecting: true,
                  readOnly: false,
                  foldGutter: {
                    minFoldSize: 2,
                  },
                }}
                onBeforeChange={(editor, data, value) => {
                  setFieldValue("notes", value);
                }}
              />,
            ]}
            setCategory={setOtherParams}
          />
        </div>
      </div>

      {owner && (
        <div className="px-4 sm:px-6 md:px-8 mt-10">
          <button
            type="button"
            onClick={() => handleDelete()}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 ring-offset-gray-800 focus:ring-red-500"
          >
            <TrashIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Delete
          </button>
        </div>
      )}
      <Style css={css} />
    </div>
  );
}
