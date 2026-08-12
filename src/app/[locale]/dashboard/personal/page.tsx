"use client";

import PersonalProfile from "@/components/Dashboard/PersonalProfile";

/**
 * The signed-in user's own profile.
 *
 * This lives at the account level because that is what it is. It used to be
 * reachable only at `/dashboard/{menu}/personal`, which implied an account could
 * hold a different name and password per menu. The menu-scoped URL still
 * resolves so old links keep working.
 */
export default function AccountPersonalPage() {
  return <PersonalProfile backLink="" />;
}
