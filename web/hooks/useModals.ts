import {
  AddMemberContext,
  CreateGroupContext,
  CreateProjectContext,
  DeleteModalContext,
  ImportFileContext,
  ImportTemplateContext,
} from "contexts/ModalsContext";
import { useContext } from "react";

export function useCreateGroup() {
  return useContext(CreateGroupContext);
}

export function useCreateProject() {
  return useContext(CreateProjectContext);
}

export function useAddMember() {
  return useContext(AddMemberContext);
}

export function useDeleteModal() {
  return useContext(DeleteModalContext);
}

export function useImportTemplate() {
  return useContext(ImportTemplateContext);
}

export function useImportFile() {
  return useContext(ImportFileContext);
}
