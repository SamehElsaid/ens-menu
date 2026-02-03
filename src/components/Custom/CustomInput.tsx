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
import { CountryRaw, PaginatedResponse } from "@/modules/Header/types";

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
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  apiUrl?: string;
  querySearch?: string;
  triggerApiUrl?: string;
  reset?: () => void;
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
  label,
  className = "",
  error,
  color: _color = "main",
  size = "normal",
  setOpen,
  apiUrl,
  querySearch,
  triggerApiUrl = "",
  reset,
  ...props
}: CustomInputProps) {
  const [focus, setFocus] = useState<boolean>(false);
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


  console.log(
    options.concat(
      config.isNext ? [{ label: t("auth.seeMore"), value: "seeMore" }] : []
    )
  );

  return (
    <>
      <div className="w-full relative">
        {label && (
          <label className="capitalize px-3" htmlFor={id}>
            {label}
          </label>
        )}

        {type === "select" ? (
          <div className="relative ">
            <label
              htmlFor={id}
              className={`duration-200 z-10 absolute start-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-md border ${
                error
                  ? "bg-red-50 text-red-500 border-red-200"
                  : focus
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-primary/5 text-primary border-primary/20"
              }`}
            >
              {icon}
            </label>
            <Select
              instanceId={id}
              {...props}
              className="basic-single "
              classNamePrefix={`cursor-text ${size == "small" ? "small" : ""} ${error ? "error" : ""} select`}
              isSearchable={
                isSearching || (props?.isSearchable as boolean) || false
              }
              name={id}
              inputId={id}
              isLoading={loadingOptions}
              isClearable={true}
              noOptionsMessage={() => (
                <div className="text-primary">{t("auth.noOptions")}</div>
              )}
              loadingMessage={() => (
                <div className="text-primary">{t("auth.loading")}</div>
              )}
              placeholder={t("auth.selectPlaceholder")}
              options={
               
                (props.options as OptionsOrGroups<
                  OptionType,
                  GroupBase<OptionType>
                >) || options.concat(
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
                  console.log("clear");
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
                        className="px-3 py-2 text-primary font-medium text-center cursor-pointer"
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
              defaultCountry={"EG"}
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
        ) : type === "date" ? (
          <div className="relative w-full">
            <DatePicker
              {...props}
              showYearDropdown
              showMonthDropdown
              locale={locale}
              dateFormat="yyyy-MM-dd"
              selected={props.value as Date | null | undefined}
              onChange={(date) =>
                props.onChange?.(
                  date as unknown as ChangeEvent<HTMLInputElement>
                )
              }
              customInput={
                <div className="flex  items-center flex-col rounded-md w-full relative overflow-hidden">
                  {icon && (
                    <label
                      htmlFor={id}
                      className={`duration-200 absolute start-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-md border ${
                        error
                          ? "bg-red-50 text-red-500 border-red-200"
                          : focus
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-primary/5 text-primary border-primary/20"
                      }`}
                    >
                      {icon}
                    </label>
                  )}

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
                    } outline-none rounded-md pe-4! border ${"bg-primary/5"} border-primary/20  focus:border-primary focus:ring-2 focus:ring-primary/20  disabled:opacity-80 ${
                      className || ""
                    } ${
                      error
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50 "
                        : ""
                    } `}
                    {...props}
                    value={
                      (props.value as Date)?.toISOString()?.split("T")?.[0] ||
                      ""
                    }
                  />
                </div>
              }
            />
          </div>
        ) : (
          <div className="flex items-center flex-col rounded-md w-full relative overflow-hidden">
            {icon && (
              <label
                htmlFor={id}
                className={`duration-200 absolute start-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-md border ${
                  error
                    ? "bg-red-50 text-red-500 border-red-200"
                    : focus
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-primary/5 text-primary border-primary/20"
                }`}
              >
                {icon}
              </label>
            )}

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
              } outline-none rounded-md border ${
                type === "color" ? "bg-background-two" : "bg-primary/5"
              } border-primary/20  focus:border-primary focus:ring-2 focus:ring-primary/20  disabled:opacity-80 ${
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
                className="absolute h-full flex items-center pe-3! end-3 transform text-xl text-primary/70 hover:text-primary duration-200"
                onClick={() => setActive(!active)}
              >
                {active ? <FaRegEye /> : <FaRegEyeSlash />}
              </button>
            )}

            {setOpen && (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="absolute h-full flex items-center end-3 transform text-xl text-primary/70 hover:text-primary duration-200"
              >
                <IoIosArrowDown />
              </button>
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
