import useRequests from "hooks/useRequests";

export default function useRequestById(objectId?: string) {
  const { requests, loading } = useRequests();
  return { data: requests.find((r) => r.objectId === objectId), loading };
}
