declare module "@hcaptcha/react-hcaptcha" {
  import type { Component } from "react";

  export interface HCaptchaProps {
    sitekey: string;
    languageOverride?: string;
    onVerify?: (token: string) => void;
    onExpire?: () => void;
    onError?: (err: string) => void;
  }

  export default class HCaptcha extends Component<HCaptchaProps> {}
}

declare module "*.mp3" {
  const src: string;
  export default src;
}
