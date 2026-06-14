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
  const [time, setTime] = useState<string>("");
  const locale = useLocale();

  useEffect(() => {
    if (!data) {
      setTime("");
      return;
    }

    const update = () => setTime(formatRelativeActivityTime(data, locale));
    update();

    if (!shouldRefreshRelativeActivityTime(data)) {
      return;
    }

    const intervalId = setInterval(update, 60000);
    return () => clearInterval(intervalId);
  }, [data, locale]);

  return <span className="block">{time}</span>;
}

export default ViewTime;
