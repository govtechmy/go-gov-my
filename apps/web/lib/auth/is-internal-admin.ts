import { Session } from "./utils";

const INTERNAL_AGENCY_CODE = "govtech";

export function isInternalAdmin(session: Session) {
  const { agencyCode, role } = session.user;
  return agencyCode === INTERNAL_AGENCY_CODE && role === "super_admin";
}
