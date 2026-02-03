import { useEffect, useState } from "react";

function HomeApp({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-white z-111111 flex items-center justify-center">
          <div className="w-10 h-10 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
          <p className="text-primary text-2xl font-bold">Loading...</p>
        </div>
      )}
      {children}
    </>
  );
}

export default HomeApp;
