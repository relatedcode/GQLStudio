export const FAKE_EMAIL = true;

export const getAPIUrl = () => {
  return typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL ||
        `http://${window?.location.hostname}:4001`
    : "";
};

export const getGQLServerUrl = () => {
  return typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_GQL_SERVER_URL ||
        `http://${window?.location.hostname}:4000`
    : "";
};
