import useProjects from "hooks/useProjects";

export default function useProjectById(objectId?: string) {
  const { projects, loading } = useProjects();
  return { data: projects.find((r) => r.objectId === objectId), loading };
}
