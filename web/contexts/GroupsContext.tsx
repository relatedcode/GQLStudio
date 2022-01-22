import { useQuery, useSubscription } from "@apollo/client";
import { GROUPS } from "graphql/queries";
import { GROUP } from "graphql/subscriptions";
import useAuth from "hooks/useAuth";
import { createContext, useEffect, useState } from "react";
import { sortAsc } from "utils/sort";

const GroupsContext = createContext({
  groups: [],
  loading: true,
});

export function GroupsProvider({ children }) {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);

  const { data, loading } = useQuery(GROUPS, {
    variables: {
      userId: user?.uid,
    },
    skip: !user,
  });
  const { data: dataPush } = useSubscription(GROUP, {
    skip: !user,
  });

  useEffect(() => {
    if (data) setGroups(data.groups);
  }, [data]);

  useEffect(() => {
    if (dataPush) {
      setGroups([
        ...groups.filter((item) => item.objectId !== dataPush.group.objectId),
        dataPush.group,
      ]);
    }
  }, [dataPush]);

  return (
    <GroupsContext.Provider
      value={{
        groups: groups
          .filter((item) => !item.isDeleted && item.access.includes(user?.uid))
          .sort(sortAsc),
        loading,
      }}
    >
      {children}
    </GroupsContext.Provider>
  );
}

export default GroupsContext;
