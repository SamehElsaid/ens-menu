import {
  ENSMENU_SUPPORT_EMAIL,
  ENSMENU_WHATSAPP_DISPLAY,
  ENSMENU_WHATSAPP_URL,
} from "@/lib/contactConstants";
import { cn } from "@/lib/cn";

const linkClassName =
  "font-semibold text-purple-600 underline-offset-2 transition-colors hover:text-purple-700 hover:underline dark:text-purple-400 dark:hover:text-purple-300";

function renderContactLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const isBullet = trimmed.startsWith("•");
  const content = isBullet ? trimmed.slice(1).trim() : trimmed;

  if (content.includes(ENSMENU_SUPPORT_EMAIL)) {
    const prefix = content.split(ENSMENU_SUPPORT_EMAIL)[0].replace(/:\s*$/, "").trim();

    return (
      <p key={trimmed} className="flex gap-2 text-start">
        <span
          className="mt-2 h-1 w-1 shrink-0 rounded-full bg-purple-500"
          aria-hidden
        />
        <span>
          {prefix}:{" "}
          <a href={`mailto:${ENSMENU_SUPPORT_EMAIL}`} className={linkClassName}>
            {ENSMENU_SUPPORT_EMAIL}
          </a>
        </span>
      </p>
    );
  }

  const whatsappInLine =
    content.match(/\+[\d\s]+/)?.[0]?.trim() ?? ENSMENU_WHATSAPP_DISPLAY;

  if (
    content.includes(ENSMENU_WHATSAPP_DISPLAY.replace(/\s/g, "")) ||
    content.includes(ENSMENU_WHATSAPP_DISPLAY) ||
    /whatsapp|واتساب/i.test(content)
  ) {
    const prefix = content.split(whatsappInLine)[0].replace(/:\s*$/, "").trim();

    return (
      <p key={trimmed} className="flex gap-2 text-start">
        <span
          className="mt-2 h-1 w-1 shrink-0 rounded-full bg-purple-500"
          aria-hidden
        />
        <span>
          {prefix}:{" "}
          <a
            href={ENSMENU_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            dir="ltr"
            className={cn(linkClassName, "inline-block")}
          >
            {whatsappInLine}
          </a>
        </span>
      </p>
    );
  }

  return (
    <p key={trimmed} className={cn(isBullet && "flex gap-2 text-start")}>
      {isBullet ? (
        <>
          <span
            className="mt-2 h-1 w-1 shrink-0 rounded-full bg-purple-500"
            aria-hidden
          />
          <span>{content}</span>
        </>
      ) : (
        trimmed
      )}
    </p>
  );
}

type LegalContactBodyProps = {
  body: string;
};

export default function LegalContactBody({ body }: LegalContactBodyProps) {
  return (
    <>
      {body.split("\n").map((line) => renderContactLine(line))}
    </>
  );
}
