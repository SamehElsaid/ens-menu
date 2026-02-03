import Link from "next/link";
import { useLocale } from "next-intl";

interface LinkToProps {
  href: string;
  children: React.ReactNode;
  [key: string]: unknown;
}
function LinkTo({ href, children, ...props }: LinkToProps) {
  const locale = useLocale();
  return (
    <Link {...props} href={href} locale={locale}>
      {children}
    </Link>
  );
}

export default LinkTo;
