export function sortAsc(a: any, b: any) {
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}
