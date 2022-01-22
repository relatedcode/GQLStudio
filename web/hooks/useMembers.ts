import { useQuery, useSubscription } from "@apollo/client";
import { USERS } from "graphql/queries";
import { USER } from "graphql/subscriptions";
import { useEffect, useState } from "react";

export default function useMembers(groupId?: string) {
  const { data } = useQuery(USERS, {
    variables: { groupId },
    skip: !groupId,
    fetchPolicy: "network-only",
  });
  const { data: dataPush } = useSubscription(USER, {
    variables: { groupId },
    skip: !groupId,
  });

  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (data) setUsers(data.users);
  }, [data]);

  useEffect(() => {
    if (dataPush) {
      setUsers([
        ...users.filter((item) => item.objectId !== dataPush.user.objectId),
        dataPush.user,
      ]);
    }
  }, [dataPush]);

  return { data: users };
}
