/** Return the small, consistent profile shape used by the UI. */
export function getUserProfile(user) {
  const metadata = user?.user_metadata ?? user?.metadata ?? {};
  const fullName = String(metadata.full_name ?? metadata.name ?? user?.name ?? '').trim();
  const nameParts = fullName.split(/\s+/).filter(Boolean);
  const name = metadata.first_name ?? metadata.given_name ?? user?.first_name ?? nameParts[0] ?? '';
  const surname = metadata.last_name ?? metadata.surname ?? metadata.family_name ?? user?.last_name ?? nameParts.slice(1).join(' ');

  return {
    name: String(name || ''),
    surname: String(surname || ''),
    email: String(user?.email ?? ''),
  };
}
