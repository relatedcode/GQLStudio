import { useQuery, useSubscription } from "@apollo/client";
import { USER as USER_QUERY } from "graphql/queries";
import { USER as USER_SUBSCRIPTION } from "graphql/subscriptions";
import useAuth from "hooks/useAuth";
import { createContext, useEffect, useState } from "react";

const UserContext = createContext({
  user: null,
});

export const UserProvider = ({ children }) => {
  const { user: authUser } = useAuth();
  const { data } = useQuery(USER_QUERY, {
    variables: { objectId: authUser?.uid },
    skip: !authUser?.uid,
  });
  const { data: dataPush } = useSubscription(USER_SUBSCRIPTION, {
    variables: { objectId: authUser?.uid },
    skip: !authUser?.uid,
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (data) {
      setUser(data.user);
    }
  }, [data]);

  useEffect(() => {
    if (dataPush) {
      setUser(dataPush.user);
    }
  }, [dataPush]);

  return (
    <UserContext.Provider
      value={{
        user,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
