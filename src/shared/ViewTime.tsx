import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import {
  formatRelativeActivityTime,
  shouldRefreshRelativeActivityTime,
} from "@/lib/formatDateTime";

interface ViewTimeProps {
  data: string | Date | null | undefined;
}

function ViewTime({ data }: ViewTimeProps) {
  const [tick, setTick] = useState(0);
  const locale = useLocale();

  useEffect(() => {
    if (!data || !shouldRefreshRelativeActivityTime(data)) {
      return;
    }

    const intervalId = setInterval(() => {
      setTick((value) => value + 1);
    }, 60000);
    return () => clearInterval(intervalId);
  }, [data]);

  const time = data ? formatRelativeActivityTime(data, locale) : "";
  void tick;

  return <span className="block">{time}</span>;
}

export default ViewTime;
