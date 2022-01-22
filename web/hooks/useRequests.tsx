import RequestsContext from "contexts/RequestsContext";
import { useContext } from "react";

const useRequests = () => useContext(RequestsContext);

export default useRequests;
