export function getStudentDisplayName(context = {}, notLoggedInText = 'Not logged in', loggedInText = 'Logged in') {
  const rawName = context.studentName || context.user?.full_name || context.user?.name || context.user?.given_name || '';

  if (rawName && String(rawName).trim()) {
    const decoded = decodeURIComponent(String(rawName));
    return decoded;
  }

  const hasAuth = Boolean(context.jwt || context.user?.full_name || context.user?.name || context.user?.user_id || context.user?.sub || context.user?.email);

  return hasAuth ? loggedInText : notLoggedInText;
}
