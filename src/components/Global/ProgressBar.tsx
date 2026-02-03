import HolyLoader from "holy-loader";

export default function ProgressBar() {
  return (
    <HolyLoader
      color="#0bb7b4"
      height="3px"
      easing="linear"
      showSpinner={true}
      ignoreSearchParams
      boxShadow="0 0 10px 0 rgba(0, 0, 0, 0.1)"
    />
  );
}
