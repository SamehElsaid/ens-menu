import HolyLoader from "holy-loader";

export default function ProgressBar() {
  return (
    <HolyLoader
      color="var(--brand)"
      height="3px"
      easing="linear"
      showSpinner={false}
      ignoreSearchParams
      boxShadow="0 0 10px 0 rgba(0, 0, 0, 0.1)"
    />
  );
}
