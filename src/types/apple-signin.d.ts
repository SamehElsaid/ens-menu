interface AppleIDAuthInit {
  clientId: string;
  scope?: string;
  redirectURI: string;
  state?: string;
  nonce?: string;
  usePopup?: boolean;
}

interface AppleIDName {
  firstName?: string | null;
  lastName?: string | null;
}

interface AppleIDSignInResponse {
  authorization: {
    code?: string;
    id_token: string;
    state?: string;
  };
  user?: {
    email?: string;
    name?: AppleIDName;
  };
}

interface AppleIDAuth {
  init: (config: AppleIDAuthInit) => void;
  signIn: (config?: Partial<AppleIDAuthInit>) => Promise<AppleIDSignInResponse>;
}

interface AppleIDNamespace {
  auth: AppleIDAuth;
}

interface Window {
  AppleID?: AppleIDNamespace;
}
