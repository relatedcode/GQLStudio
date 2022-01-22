import useGroups from "hooks/useGroups";

export default function useGroupById(id: any) {
  const { groups, loading } = useGroups();
  return { group: groups.find((g) => g.objectId === id), loading };
}
