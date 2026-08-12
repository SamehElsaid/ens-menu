import "react-phone-number-input/style.css";
import "react-datepicker/dist/react-datepicker.css";
import { ChangeEvent, useId, useRef, useState } from "react";
import { UnmountClosed } from "react-collapse";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import PhoneInput from "react-phone-number-input";
import ar from "react-phone-number-input/locale/ar";
import en from "react-phone-number-input/locale/en";
import Select, { GroupBase, OptionsOrGroups, SingleValue } from "react-select";
import DatePicker, { registerLocale } from "react-datepicker";
import { ar as arLocale } from "date-fns/locale/ar";
import { enUS as enLocale } from "date-fns/locale/en-US";
import { useLocale, useTranslations } from "next-intl";
import { format } from "date-fns";
import { cn } from "@/lib/cn";
import {
  focusField,
  focusRing,
  settle,
  useFieldControl,
} from "@/components/ui";

registerLocale("ar", arLocale);
registerLocale("en", enLocale);
const locales = {
  ar,
  en,
};

interface CustomInputProps {
  type?: string;
  placeholder?: string;
  id?: string;
  icon?: React.ReactNode;
  label?: string;
  className?: string;
  error?: string;
  color?: string;
  size?: string;
  setOpen?: (open: boolean) => void;
  open?: boolean;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  disabled?: boolean;
  reset?: () => void;
  rows?: number;
  disabledPreviousDates?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  [key: string]: unknown;
}
type OptionType = {
  label: string;
  value: string;
};

/**
 * Multi-purpose form control used across the dashboard and auth flows.
 *
 * Styling comes from the shared tokens so it matches `@/components/ui/Input`.
 * Prefer `Field` + `Input` on new surfaces; this stays for the existing forms
 * that depend on its `select` / `tel` / `date` / `choice` branches.
 */
export default function CustomInput({
  type,
  placeholder,
  id,
  icon,

  className = "",
  error,
  color: _color = "main",
  size = "normal",
  setOpen,
  reset,
  disabledPreviousDates = false,
  loading = false,
  loadingLabel,
  ...props
}: CustomInputProps) {
  const [focus, setFocus] = useState<boolean>(false);
  const [openDate, setOpenDate] = useState<boolean>(false);
  const [active, setActive] = useState<boolean>(false);
  const phoneRef = useRef(null);
  const t = useTranslations();
  const locale = useLocale();
  const generatedId = useId();
  void _color;
  void focus;

  /* When this control sits inside a `Field`, take the id and description the
     Field already generated — otherwise the Field's label points at nothing and
     the input has no accessible name. An explicit `id` prop still wins. */
  const field = useFieldControl() as {
    id?: string;
    "aria-describedby"?: string;
  };
  const controlId = (id ?? field.id)?.replace(" ", "-");
  const errorId = `${controlId ?? generatedId}-error`;
  const describedBy =
    [error ? errorId : null, field["aria-describedby"] ?? null]
      .filter(Boolean)
      .join(" ") || undefined;

  const checkingLabel = loadingLabel ?? t("auth.checkingAvailability");

  const fieldLoadingHint = (
    <p className="field-loading-hint" role="status" aria-live="polite">
      <span className="field-loading-hint__spinner" aria-hidden />
      <span>{checkingLabel}</span>
    </p>
  );

  const formatDate = (date?: Date | null) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTime = (time?: Date | null) => {
    if (!time) return "";
    return format(time, "hh:mm aa", {
      locale: locale === "ar" ? arLocale : enLocale,
    });
  };

  const isSmall = size === "small";

  /* Shared control chrome, matching `@/components/ui/Input`. `focusField` is
     imported rather than re-typed so the brand halo is identical on the
     settings pages that still use this control and the ones that use `Input` —
     two focus treatments on adjacent pages is the inconsistency that reads as
     an unfinished product. */
  const controlChrome = cn(
    "w-full min-w-0 rounded-lg border bg-surface text-sm text-fg placeholder:text-fg-subtle",
    settle,
    focusField,
    "hover:border-fg-subtle",
    "disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-fg-subtle",
    error ? "border-danger hover:border-danger" : "border-line-control",
  );

  /** Decorative affix; the input keeps its own label from the caller. */
  const affix = (node: React.ReactNode, position: "textarea" | "center") => (
    <span
      className={cn(
        "pointer-events-none absolute start-3 flex items-center text-base text-fg-subtle",
        position === "textarea" ? "top-3" : "top-1/2 -translate-y-1/2",
      )}
      aria-hidden
    >
      {node}
    </span>
  );

  return (
    <>
      <div className="relative w-full">
        {type === "choice" ? (
          <div
            role="group"
            className={cn(
              "flex items-center gap-1 rounded-lg border p-1",
              error
                ? "border-danger bg-danger-soft"
                : "border-line bg-surface-2",
            )}
          >
            {(props.options as OptionType[])?.map((option) => {
              const isSelected =
                (props.value as OptionType)?.value === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    props.onChange?.(
                      option as unknown as ChangeEvent<HTMLInputElement>,
                    );
                  }}
                  className={cn(
                    "flex-1 rounded-md px-4 py-2 text-[13px] font-medium transition-colors duration-(--dur-settle)",
                    focusRing,
                    isSelected
                      ? "bg-brand text-on-brand"
                      : "text-fg-muted hover:bg-surface hover:text-fg",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        ) : type === "select" ? (
          <div className="relative">
            {icon ? affix(icon, "center") : null}
            <Select
              instanceId={id}
              {...props}
              className={cn(
                "basic-single",
                icon ? "[&_.select__control]:ps-10" : undefined,
              )}
              classNamePrefix={`cursor-text ${isSmall ? "small" : ""} ${
                error ? "error" : ""
              } select`}
              isSearchable={(props?.isSearchable as boolean) || false}
              name={id}
              inputId={controlId}
              aria-invalid={error ? true : undefined}
              aria-errormessage={describedBy}
              isClearable={true}
              noOptionsMessage={() => (
                <div className="text-fg-muted">{t("auth.noOptions")}</div>
              )}
              loadingMessage={() => (
                <div className="text-fg-muted">{t("auth.loading")}</div>
              )}
              placeholder={t("auth.selectPlaceholder")}
              options={
                props.options as OptionsOrGroups<
                  OptionType,
                  GroupBase<OptionType>
                >
              }
              value={props?.value as SingleValue<OptionType>}
              onChange={(newValue, actionMeta) => {
                if (actionMeta.action === "clear") {
                  reset?.();
                }
                props.onChange?.(
                  newValue as unknown as ChangeEvent<HTMLInputElement>,
                );
              }}
            />
          </div>
        ) : type === "tel" ? (
          <div>
            <div className="relative">
              <PhoneInput
                id={controlId}
                labels={locales[locale as keyof typeof locales]}
                ref={phoneRef}
                defaultCountry={"EG"}
                className={cn(
                  "phoneNumber",
                  loading && "phoneNumber--checking",
                  Boolean(error) && "error",
                )}
                placeholder="123-456-7890"
                {...props}
                value={props?.value as string | undefined}
                onChange={
                  props.onChange as unknown as (
                    value?: string | undefined,
                  ) => void
                }
              />
            </div>
            {loading && fieldLoadingHint}
          </div>
        ) : type === "date" || type === "time" ? (
          <div className="relative w-full">
            <DatePicker
              {...props}
              minDate={disabledPreviousDates ? new Date() : undefined}
              showYearDropdown
              showMonthDropdown
              showTimeSelectOnly={type === "time"}
              showTimeSelect={type === "time"}
              locale={locale}
              timeCaption={t("workSchedule.timeCaption")}
              timeFormat="hh:mm aa"
              dateFormat={type === "date" ? "yyyy-MM-dd" : "HH:mm"}
              open={openDate}
              onCalendarOpen={() => setOpenDate(true)}
              onCalendarClose={() => setOpenDate(false)}
              selected={props.value as Date | null | undefined}
              onChange={(date) =>
                props.onChange?.(
                  date as unknown as ChangeEvent<HTMLInputElement>,
                )
              }
              customInput={
                <div className="relative flex w-full flex-col items-center">
                  {icon ? affix(icon, "center") : null}
                  <button
                    type="button"
                    className="absolute inset-0 z-10 rounded-lg"
                    onClick={() => setOpenDate((prev) => !prev)}
                    aria-label={placeholder}
                    aria-haspopup="dialog"
                    aria-expanded={openDate}
                  />
                  <input
                    id={controlId}
                    type="text"
                    placeholder={placeholder}
                    readOnly
                    onFocus={() => (setOpen ? setOpen(true) : setFocus(true))}
                    onBlur={() => (setOpen ? setOpen(false) : setFocus(false))}
                    {...props}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={describedBy}
                    className={cn(
                      controlChrome,
                      "date-input",
                      isSmall ? "h-9" : "h-10",
                      icon ? "ps-10" : "ps-3",
                      "pe-3",
                      className,
                    )}
                    value={
                      type === "date"
                        ? formatDate(props.value as Date | null | undefined)
                        : type === "time"
                          ? formatTime(props.value as Date | null | undefined)
                          : ""
                    }
                  />
                </div>
              }
            />
          </div>
        ) : (
          <div
            className={cn(
              "relative flex w-full flex-col",
              type === "textarea" ? "items-start" : "items-center",
            )}
          >
            {icon
              ? affix(icon, type === "textarea" ? "textarea" : "center")
              : null}

            {type === "textarea" ? (
              <textarea
                id={controlId}
                placeholder={placeholder}
                onFocus={() => (setOpen ? setOpen(true) : setFocus(true))}
                onBlur={() => (setOpen ? setOpen(false) : setFocus(false))}
                rows={props.rows || 4}
                onChange={(e) => {
                  props.onChange?.(
                    e as React.ChangeEvent<
                      HTMLInputElement | HTMLTextAreaElement
                    >,
                  );
                }}
                value={props.value as string | undefined}
                disabled={props.disabled}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy}
                className={cn(
                  controlChrome,
                  "resize-y py-2.5 leading-relaxed",
                  icon ? "ps-10" : "ps-3",
                  "pe-3",
                  className,
                )}
              />
            ) : (
              <>
                <input
                  id={controlId}
                  type={active ? "text" : type}
                  placeholder={placeholder}
                  onFocus={() => (setOpen ? setOpen(true) : setFocus(true))}
                  onBlur={() => (setOpen ? setOpen(false) : setFocus(false))}
                  {...props}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={describedBy}
                  className={cn(
                    controlChrome,
                    isSmall ? "h-9" : "h-10",
                    icon ? "ps-10" : "ps-3",
                    type === "password" || setOpen ? "pe-10" : "pe-3",
                    type === "color" && "cursor-pointer p-1",
                    loading && "register-field-input--checking",
                    className,
                  )}
                />
                {type === "password" && (
                  <button
                    type="button"
                    className="absolute end-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-fg-subtle transition-colors hover:text-fg"
                    onClick={() => setActive(!active)}
                    aria-label={
                      active ? t("auth.hidePassword") : t("auth.showPassword")
                    }
                    aria-pressed={active}
                    tabIndex={-1}
                  >
                    {active ? <FaRegEye /> : <FaRegEyeSlash />}
                  </button>
                )}
                {setOpen && (
                  <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="absolute end-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-fg-subtle transition-colors hover:text-fg"
                    aria-label={placeholder}
                    tabIndex={-1}
                  >
                    <IoIosArrowDown />
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {loading && type !== "tel" && fieldLoadingHint}

        <UnmountClosed isOpened={Boolean(error)}>
          <p
            id={errorId}
            role="alert"
            className="mt-1.5 text-xs font-medium text-danger"
          >
            {error}
          </p>
        </UnmountClosed>
      </div>
    </>
  );
}
