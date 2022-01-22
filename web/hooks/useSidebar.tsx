import SidebarContext from "providers/SidebarProvider";
import { useContext } from "react";

const useSidebar = () => useContext(SidebarContext);

export default useSidebar;
