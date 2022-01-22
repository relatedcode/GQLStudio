import { createContext } from "react";

export const CreateGroupContext = createContext({
  open: false,
  setOpen: null as any,
});

export const CreateProjectContext = createContext({
  open: false,
  setOpen: null as any,
});

export const AddMemberContext = createContext({
  open: false,
  setOpen: null as any,
});

export const DeleteModalContext = createContext({
  open: false,
  setOpen: null as any,
});

export const ImportTemplateContext = createContext({
  open: false,
  setOpen: null as any,
});

export const ImportFileContext = createContext({
  open: false,
  setOpen: null as any,
});
