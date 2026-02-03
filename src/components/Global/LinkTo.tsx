import Link from "next/link";

interface LinkToProps {
  href: string;
  children: React.ReactNode;
  [key: string]: unknown;
}
function LinkTo({ href, children, ...props }: LinkToProps) {
  return (
    <Link {...props} href={href} >
      {children}
    </Link>
  );
}

export default LinkTo;
