import UserContext from "contexts/UserContext";
import { useContext } from "react";

const useUser = () => useContext(UserContext);

export default useUser;
