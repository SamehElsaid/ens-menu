import HolyLoader from "holy-loader";

export default function ProgressBar() {
  return (
    <HolyLoader
      color="#9234ea"
      height="3px"
      easing="linear"
      showSpinner={true}
      ignoreSearchParams
      boxShadow="0 0 10px 0 rgba(0, 0, 0, 0.1)"
    />
  );
}
