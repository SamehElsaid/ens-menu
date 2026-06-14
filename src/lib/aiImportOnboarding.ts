import type { AppDispatch } from "@/store/store";
import { SET_ACTIVE_USER } from "@/store/authSlice/authSlice";
import { axiosPatch } from "@/shared/axiosCall";

export type AuthSliceUser = {
  onboardingCompleted?: boolean;
  [key: string]: unknown;
};

type AuthSliceData = {
  user?: AuthSliceUser;
  [key: string]: unknown;
};

/** Read nested `auth.data.user` from Redux auth slice. */
export function getAuthSliceUser(authData: unknown): AuthSliceUser | null {
  if (!authData || typeof authData !== "object") return null;
  const user = (authData as AuthSliceData).user;
  if (!user || typeof user !== "object") return null;
  return user;
}

/** True only when the backend explicitly marks onboarding as incomplete. */
export function shouldShowAiImportOnboarding(authData: unknown): boolean {
  const user = getAuthSliceUser(authData);
  return user?.onboardingCompleted === false;
}

/** New registrations should start with onboarding pending when the API omits the flag. */
export function withNewUserOnboardingFlag<T extends AuthSliceUser>(user: T): T {
  if (user.onboardingCompleted !== undefined) return user;
  return { ...user, onboardingCompleted: false };
}

export async function markAiImportOnboardingComplete(
  locale: string,
  dispatch: AppDispatch,
  authData: unknown,
): Promise<boolean> {
  const currentUser = getAuthSliceUser(authData);
  if (currentUser?.onboardingCompleted === true) return true;

  const res = await axiosPatch<
    { onboardingCompleted: boolean },
    { user?: AuthSliceUser }
  >("/user/profile", locale, { onboardingCompleted: true });

  if (!res?.status) return false;

  const updatedUser = (res.data as { user?: AuthSliceUser } | undefined)?.user;
  const nextUser: AuthSliceUser = {
    ...currentUser,
    ...updatedUser,
    onboardingCompleted: true,
  };

  dispatch(
    SET_ACTIVE_USER({
      ...(typeof authData === "object" && authData !== null ? authData : {}),
      user: nextUser,
    }),
  );

  return true;
}
