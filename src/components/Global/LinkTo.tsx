import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";

interface LinkToProps {
  href: string;
  children: React.ReactNode;
  [key: string]: unknown;
}
function LinkTo({ href, children, ...props }: LinkToProps) {
  const locale = useLocale();
  return (
    <Link {...props} locale={locale} href={`/${href}`} >
      {children}
    </Link>
  );
}

export default LinkTo;
