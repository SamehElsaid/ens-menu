import { searchFormSchema } from "@/schemas/FormSearchSchame";
import { SearchFormData } from "@/types/FormSearch";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslations } from "next-intl";
import { Controller, Resolver, useForm, useWatch } from "react-hook-form";
import { RiUserLocationLine } from "react-icons/ri";
import { TiLocationOutline } from "react-icons/ti";
import { FaGraduationCap, FaSearch } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import { useRouter } from "@/i18n/navigation";
import CustomInput from "../Custom/CustomInput";

function SearchForm() {
  const t = useTranslations("");
  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<SearchFormData>({
    defaultValues: {
      speciality: null as unknown as { label: string; value: string },
      state: null as unknown as { label: string; value: string },
      city: null as unknown as { label: string; value: string },
      search: "",
    },
    resolver: yupResolver(
      searchFormSchema(t)
    ) as unknown as Resolver<SearchFormData>,
    mode: "onChange",
  });

  const router = useRouter();

  const onSubmit = (data: SearchFormData) => {
    const params = new URLSearchParams();

    if (data?.speciality?.label) params.set("speciality", data.speciality.label);
    if (data?.state?.value) params.set("state", data.state.value);
    if (data?.city?.value) params.set("city", data.city.value);
    if (data?.search) params.set("search", data.search);

    router.push(`/search?${params.toString()}`);
  };

  const state = useWatch({
    control,
    name: "state",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 w-full">
        <Controller
          control={control}
          name="speciality"
          render={({ field: { value, onChange } }) => (
            <CustomInput
              type="select"
              size="small"
              placeholder={t("auth.speciality")}
              id="speciality"
              icon={<FaGraduationCap />}
              isSearchable={true}
              label={t("auth.speciality")}
              error={errors.speciality?.message}
              value={value}
              onChange={onChange}
              options={[
                {
                  label: t("form.specialization1"),
                  value: "specialization",
                },
                {
                  label: t("form.specialization2"),
                  value: "specialization2",
                },
                {
                  label: t("form.specialization3"),
                  value: "specialization3",
                },
              ]}
            />
          )}
        />
        <Controller
          control={control}
          name="state"
          render={({ field: { value, onChange } }) => (
            <CustomInput
              type="select"
              apiUrl={`/api/state`}
              triggerApiUrl={`countryId=64`}
              querySearch={"search"}
              placeholder={t("auth.selectState")}
              size="small"
              reset={() => {
                setValue(
                  "city",
                  null as unknown as { label: string; value: string }
                );
                trigger("city");
              }}
              id="state"
              icon={<TiLocationOutline />}
              label={t("auth.state")}
              error={errors.state?.message}
              value={value}
              onChange={onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="city"
          render={({ field: { value, onChange } }) => (
            <CustomInput
              type="select"
              apiUrl={`/api/city`}
              triggerApiUrl={`stateId=${state?.value || ""}`}
              querySearch={"search"}
              placeholder={t("auth.selectCity")}
              size="small"
              id="city"
              icon={<RiUserLocationLine />}
              label={t("auth.city")}
              error={errors.city?.message}
              value={value}
              onChange={onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="search"
          render={({ field: { value, onChange } }) => (
            <CustomInput
              type="text"
              placeholder={t("auth.search")}
              id="search"
              size="small"
              icon={<FaSearch />}
              label={t("auth.search")}
              error={errors.search?.message}
              value={value}
              onChange={onChange}
            />
          )}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-secondary  px-4 py-3 gap-1 flex items-center justify-center text-white  rounded-md text-sm  transition hover:bg-primary/90 duration-200"
        >
          <CiSearch className="text-white text-xl" />{" "}
          <span>{t("form.search")}</span>
        </button>
      </div>
    </form>
  );
}

export default SearchForm;
