import { useQuery, useSubscription } from "@apollo/client";
import { REQUESTS } from "graphql/queries";
import { REQUEST } from "graphql/subscriptions";
import useAuth from "hooks/useAuth";
import { useRouter } from "next/router";
import { createContext, useEffect, useState } from "react";
import { sortAsc } from "utils/sort";

const RequestsContext = createContext({
  requests: [],
  loading: true,
});

export function RequestsProvider({ children }) {
  const router = useRouter();
  const { user } = useAuth();
  const { groupId } = router.query;

  const [requests, setRequests] = useState([]);

  const { data, loading } = useQuery(REQUESTS, {
    // variables: { userId: user?.uid },
    skip: !user,
    // fetchPolicy: "network-only",
  });
  const { data: dataPush } = useSubscription(REQUEST, {
    // variables: { groupId },
    skip: !user,
  });

  useEffect(() => {
    if (data) {
      setRequests([
        ...requests.filter((request) => request.groupId !== groupId),
        ...data.requests,
      ]);
    }
  }, [data]);

  useEffect(() => {
    if (dataPush) {
      setRequests([
        ...requests.filter(
          (item) => item.objectId !== dataPush.request.objectId
        ),
        dataPush.request,
      ]);
    }
  }, [dataPush]);

  return (
    <RequestsContext.Provider
      value={{
        requests: requests
          .filter((request) => !request.isDeleted)
          .sort(sortAsc),
        loading,
      }}
    >
      {children}
    </RequestsContext.Provider>
  );
}

export default RequestsContext;
