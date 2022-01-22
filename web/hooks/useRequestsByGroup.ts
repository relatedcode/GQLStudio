import useRequests from "hooks/useRequests";

export default function useRequestsByGroup(groupId?: string) {
  const { requests, loading } = useRequests();
  return { data: requests.filter((r) => r.groupId === groupId), loading };
}
