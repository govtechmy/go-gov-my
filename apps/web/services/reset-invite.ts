export async function resetInvite(id: string): Promise<void> {
  const res = await fetch(`/api/workspaces/${id}/invites/reset`, {
    method: 'POST',
  });

  if (!res.ok) {
    throw new Error(`Error when reseting invite for workspace ${id}`);
  }
}
