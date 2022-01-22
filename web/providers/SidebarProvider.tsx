import { createContext, Dispatch, SetStateAction, useState } from "react";

const SidebarContext = createContext({
  show: true,
  setShow: (() => {}) as Dispatch<SetStateAction<boolean>>,
});

export function SidebarProvider({ children }) {
  const [show, setShow] = useState(true);

  return (
    <SidebarContext.Provider
      value={{
        show,
        setShow,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export default SidebarContext;
