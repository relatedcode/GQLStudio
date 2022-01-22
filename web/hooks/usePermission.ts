import { useEffect, useState } from "react";

const usePermission = (group: any, user: any) => {
  const [userPermission, setUserPermission] = useState("");

  useEffect(() => {
    if (group && user) {
      if (group.ownerId === user.uid) {
        setUserPermission("Owner");
      } else if (group.write.includes(user.uid)) {
        setUserPermission("Editor");
      } else {
        setUserPermission("Viewer");
      }
    }
  }, [group, user]);

  return {
    userPermission,
    read: true,
    write: userPermission === "Owner" || userPermission === "Editor",
    owner: userPermission === "Owner",
  };
};

export default usePermission;
