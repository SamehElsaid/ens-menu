/* eslint-disable react-hooks/set-state-in-effect */

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { UnmountClosed } from "react-collapse";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import PhoneInput from "react-phone-number-input";
import ar from "react-phone-number-input/locale/ar";
import en from "react-phone-number-input/locale/en";
import Select, {
  components,
  GroupBase,
  OptionsOrGroups,
  SingleValue,
} from "react-select";
import DatePicker, { registerLocale } from "react-datepicker";
import { ar as arLocale } from "date-fns/locale/ar";
import { enUS as enLocale } from "date-fns/locale/en-US";
import { useLocale, useTranslations } from "next-intl";
import { axiosGet } from "@/shared/axiosCall";
import { CountryRaw, PaginatedResponse } from "@/types/types";

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  disabled?: boolean;
  apiUrl?: string;
  querySearch?: string;
  triggerApiUrl?: string;
  reset?: () => void;
  rows?: number;
  disabledPreviousDates?: boolean;
  [key: string]: unknown;
}
type OptionType = {
  label: string;
  value: string;
};

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
  apiUrl,
  querySearch,
  triggerApiUrl = "",
  reset,
  disabledPreviousDates = false,
  ...props
}: CustomInputProps) {
  const [focus, setFocus] = useState<boolean>(false);
  const [openDate, setOpenDate] = useState<boolean>(false);
  const [active, setActive] = useState<boolean>(false);
  const phoneRef = useRef(null);
  const t = useTranslations();
  const locale = useLocale();
  const [options, setOptions] = useState<OptionType[]>([]);
  const [loadingOptions, setLoadingOptions] = useState<boolean>(false);
  const [isSearching] = useState<boolean>(querySearch ? true : false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [config, setConfig] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    isPrevious: boolean;
    isNext: boolean;
  }>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    isPrevious: false,
    isNext: false,
  });
  void _color;

  const formatDate = (date?: Date | null) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTime = (time?: Date | null) => {
    if (!time) return "";
    const hours = String(time.getHours()).padStart(2, "0");
    const minutes = String(time.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    if (apiUrl && querySearch) {
      setLoadingOptions(true);
      setOptions([]);
      console.log(triggerApiUrl);
      const value = (props?.value as OptionType)?.label || searchValue || "";
      axiosGet<CountryRaw[]>(
        apiUrl +
          `?${querySearch}=${value}&page=${page}${
            triggerApiUrl ? `&${triggerApiUrl}` : ""
          }`,
        locale
      )
        .then((res) => {
          if (res.status && res.data) {
            const data = res.data as PaginatedResponse;
            const options: OptionType[] =
              data?.data?.data?.map((item: unknown) => ({
                label:
                  locale === "ar"
                    ? (item as { name_ar: string }).name_ar
                    : (item as { name_en: string }).name_en,
                value: (item as { id: string }).id,
              })) || [];
            setOptions(options);
            console.log(data);
            setConfig({
              page: data?.data?.page || 1,
              limit: data?.data?.limit || 10,
              total: data?.data?.total || 0,
              totalPages: data?.data?.totalPages || 0,
              isPrevious: data?.data?.isPrevious || false,
              isNext: data?.data?.isNext || false,
            });
          }
        })
        .finally(() => {
          setLoadingOptions(false);
        });
    }
  }, [
    apiUrl,
    querySearch,
    props.value,
    locale,
    searchValue,
    page,
    triggerApiUrl,
  ]);

  return (
    <>
      <div className="w-full relative">
        {type === "choice" ? (
          <div className="w-full">
            <div
              className={`rounded-lg ${
                error
                  ? "border border-red-300 bg-red-50/30"
                  : "border border-gray-200 bg-gray-50/80"
              } shadow-sm`}
            >
              <div className="flex items-center gap-2">
                {(props.options as OptionType[])?.map((option) => {
                  const isSelected =
                    (props.value as OptionType)?.value === option.value;
                  console.log(props.value, option.value);

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        console.log(option.value);
                        props.onChange?.(
                          option as unknown as ChangeEvent<HTMLInputElement>
                        );
                      }}
                      className={`flex-1 rounded-2xl  px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                        isSelected
                          ? "bg-accent-purple text-white shadow-md"
                          : "bg-transparent text-accent-purple hover:text-accent-purple/80"
                      } ${error && !isSelected ? "text-red-600" : ""}`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : type === "select" ? (
          <div className="relative ">
            <label
              htmlFor={id}
              className={`duration-200 z-10 absolute start-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-2xl  border ${
                error
                  ? "bg-red-50 text-red-500 border-red-200"
                  : focus
                  ? "text-accent-purple border-accent-purple/20"
                  : " text-accent-purple border-accent-purple/20"
              }`}
            >
              {icon}
            </label>
            <Select
              instanceId={id}
              {...props}
              className="basic-single "
              classNamePrefix={`cursor-text ${size == "small" ? "small" : ""} ${
                error ? "error" : ""
              } select`}
              isSearchable={
                isSearching || (props?.isSearchable as boolean) || false
              }
              name={id}
              inputId={id}
              isLoading={loadingOptions}
              isClearable={true}
              noOptionsMessage={() => (
                <div className="text-accent-purple">{t("auth.noOptions")}</div>
              )}
              loadingMessage={() => (
                <div className="text-accent-purple">{t("auth.loading")}</div>
              )}
              placeholder={t("auth.selectPlaceholder")}
              options={
                (props.options as OptionsOrGroups<
                  OptionType,
                  GroupBase<OptionType>
                >) ||
                options.concat(
                  config.isNext
                    ? [{ label: t("auth.seeMore"), value: "seeMore" }]
                    : []
                )
              }
              value={props?.value as SingleValue<OptionType>}
              onInputChange={(input) => {
                setSearchValue(input);
                setPage(1);
              }}
              onChange={(newValue, actionMeta) => {
                if (actionMeta.action === "clear") {
                  reset?.();
                }
                props.onChange?.(
                  newValue as unknown as ChangeEvent<HTMLInputElement>
                );
              }}
              components={{
                Option: (props) => {
                  const safeInnerProps = { ...props.innerProps };
                  safeInnerProps.onMouseDown = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  };
                  safeInnerProps.onClick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setLoadingOptions(true);
                    setPage((prev) => prev + 1);
                  };
                  if (props.data.value === "seeMore") {
                    return (
                      <div
                        {...safeInnerProps}
                        className="px-3 py-2 text-accent-purple font-medium text-center cursor-pointer"
                      >
                        {t("auth.seeMore")}
                      </div>
                    );
                  }
                  return <components.Option {...props} />;
                },
              }}
            />
          </div>
        ) : type === "tel" ? (
          <div className="">
            <PhoneInput
              labels={locales[locale as keyof typeof locales]}
              style={{
                border: props?.value === undefined && "1px solid #00cfe8",
              }}
              ref={phoneRef}
              defaultCountry={"AE"}
              className={`phoneNumber ${Boolean(error) ? "error" : ""} ${
                active ? "main" : ""
              } ${props?.value === undefined ? "error" : ""} `}
              placeholder="123-456-7890"
              {...props}
              value={props?.value as string | undefined}
              onChange={
                props.onChange as unknown as (
                  value?: string | undefined
                ) => void
              }
            />
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
              timeFormat="HH:mm"
              dateFormat={type === "date" ? "yyyy-MM-dd" : "HH:mm"}
              open={openDate}
              onCalendarOpen={() => setOpenDate(true)}
              onCalendarClose={() => setOpenDate(false)}
              selected={props.value as Date | null | undefined}
              onChange={(date) =>
                props.onChange?.(
                  date as unknown as ChangeEvent<HTMLInputElement>
                )
              }
              customInput={
                <div className="flex  items-center flex-col rounded-2xl  w-full relative overflow-hidden">
                  {icon && (
                    <label
                      htmlFor={id}
                      className={`duration-200 absolute start-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-2xl  border ${
                        error
                          ? "bg-red-50 text-red-500 border-red-200"
                          : focus
                          ? "text-accent-purple border-accent-purple/20"
                          : " text-accent-purple border-accent-purple/20"
                      }`}
                    >
                      {icon}
                    </label>
                  )}
                  <div
                    className="absolute inset-0  z-50"
                    onClick={() => setOpenDate((prev) => !prev)}
                  ></div>
                  <input
                    id={id?.replace(" ", "-")}
                    type="text"
                    placeholder={placeholder}
                    onFocus={() => (setOpen ? setOpen(true) : setFocus(true))}
                    onBlur={() => (setOpen ? setOpen(false) : setFocus(false))}
                    {...props}
                    className={`w-full date-input   duration-200 ${
                      size == "small" ? "py-2.5" : "py-3.5"
                    } ${
                      icon ? "ps-14" : "ps-4"
                    } outline-none rounded-2xl  pe-4! border  border-accent-purple/20  focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20  disabled:opacity-80 ${
                      className || ""
                    } ${
                      error
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50 "
                        : ""
                    } `}
                    {...props}
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
            className={`flex ${
              type === "textarea" ? "items-start" : "items-center"
            } flex-col rounded-2xl  w-full relative overflow-hidden`}
          >
            {icon && (
              <label
                htmlFor={id}
                className={`duration-200 absolute  start-3 ${
                  type === "textarea" ? "top-3" : "top-1/2 -translate-y-1/2"
                } flex items-center justify-center w-9 h-9 text-xl ${
                  error
                    ? "bg-red-50 text-red-500 border-red-200"
                    : focus
                    ? " text-accent-purple border-accent-purple/20"
                    : " text-accent-purple/60 border-accent-purple/20"
                }`}
              >
                {icon}
              </label>
            )}

            {type === "textarea" ? (
              <textarea
                id={id?.replace(" ", "-")}
                placeholder={placeholder}
                onFocus={() => (setOpen ? setOpen(true) : setFocus(true))}
                onBlur={() => (setOpen ? setOpen(false) : setFocus(false))}
                rows={props.rows || 4}
                onChange={(e) => {
                  props.onChange?.(
                    e as React.ChangeEvent<
                      HTMLInputElement | HTMLTextAreaElement
                    >
                  );
                }}
                value={props.value as string | undefined}
                disabled={props.disabled}
                className={`w-full resize-y duration-200 ${
                  size == "small" ? "py-2.5" : "py-3.5"
                } ${
                  icon ? "ps-14" : "ps-4"
                } pe-4 outline-none rounded-2xl  border  border-accent-purple/20  focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20  disabled:opacity-80 ${
                  className || ""
                } ${
                  error
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50 "
                    : ""
                } `}
              />
            ) : (
              <>
                {" "}
                <input
                  id={id?.replace(" ", "-")}
                  type={active ? "text" : type}
                  placeholder={placeholder}
                  onFocus={() => (setOpen ? setOpen(true) : setFocus(true))}
                  onBlur={() => (setOpen ? setOpen(false) : setFocus(false))}
                  {...props}
                  className={`w-full ${type === "color" ? "opacity-0!" : ""} ${
                    type === "password" ? "pe-12" : "pe-4"
                  } duration-200 ${size == "small" ? "py-2.5" : "py-3.5"} ${
                    icon ? "ps-14" : "ps-4"
                  } outline-none rounded-2xl  border ${
                    type === "color" ? "bg-background-two" : ""
                  } border-accent-purple/20  focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20  disabled:opacity-80 ${
                    className || ""
                  } ${
                    error
                      ? "border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50 "
                      : ""
                  } ${type === "color" ? "h-[54.18px]" : ""}`}
                  {...props}
                />
                {type === "password" && (
                  <button
                    type="button"
                    className="absolute h-full flex items-center pe-3! end-3 transform text-xl text-accent-purple/70 hover:text-accent-purple duration-200"
                    onClick={() => setActive(!active)}
                  >
                    {active ? <FaRegEye /> : <FaRegEyeSlash />}
                  </button>
                )}
                {setOpen && (
                  <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="absolute h-full flex items-center end-3 transform text-xl text-accent-purple/70 hover:text-accent-purple duration-200"
                  >
                    <IoIosArrowDown />
                  </button>
                )}
              </>
            )}
          </div>
        )}

        <UnmountClosed isOpened={Boolean(error)}>
          <p className="text-xs text-red-500 mt-1">{error}</p>
        </UnmountClosed>
      </div>
    </>
  );
}
