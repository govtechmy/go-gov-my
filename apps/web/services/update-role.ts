export async function updateRole(
  id: string,
  userId: string,
  role: 'owner' | 'member'
): Promise<Response> {
  const res = await fetch(`/api/workspaces/${id}/invites/reset`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      role,
    }),
  });

  return res;
}
