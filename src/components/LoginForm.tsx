"use client";
import { Controller, Resolver, useForm } from "react-hook-form";
import CustomInput from "@/components/Custom/CustomInput";
import { FaEnvelope } from "react-icons/fa";
import { TbLockPassword } from "react-icons/tb";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslations } from "next-intl";
import { loginSchema, LoginSchema } from "@/schemas/loginSchema";
import { toast } from "react-toastify";
import { decryptData, encryptData } from "@/shared/encryption";
import Cookies from "js-cookie";
import { useRouter } from "@/i18n/navigation";
import LinkTo from "./Global/LinkTo";
import { SET_ACTIVE_USER } from "@/store/authSlice/authSlice";
import { useAppDispatch } from "@/store/hooks";
export default function LoginForm() {
  const t = useTranslations("");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: yupResolver(loginSchema(t)) as unknown as Resolver<LoginSchema>,
    mode: "onChange",
  });

  const messages = {
    email: t("auth.email"),
    password: t("auth.password"),
    login: t("auth.login"),
  };

  const onSubmit = (data: LoginSchema) => {
    console.log(data);

    if (data.email === "admin@admin.com" && data.password === "123456Ss") {
      const sendData = {
        email: data.email,
        kind: "specialist",
        completedData: true,
        phone: "+201010101010",
        country: { label: "Egypt", value: "EG" },
        state: { label: "Cairo", value: "CA" },
        city: { label: "Cairo", value: "CA" },
        birthDate: new Date(),
        gender: { label: "Male", value: "male" },
      };
      const encryptedData = encryptData(sendData);

      Cookies.set("sub", encryptedData, {
        expires: 3,
        sameSite: "Strict",
        secure: true,
        path: "/",
      });
      router.push("/specialist");
      dispatch(SET_ACTIVE_USER({ ...decryptData(encryptedData) }));
    } else if (
      data.email === "parent@parent.com" &&
      data.password === "123456Ss"
    ) {
      const sendData = {
        email: data.email,
        kind: "parent",
        completedData: true,
        phone: "+201010101010",
        country: { label: "Egypt", value: "EG" },
        state: { label: "Cairo", value: "CA" },
        city: { label: "Cairo", value: "CA" },
        birthDate: new Date(),
        gender: { label: "Male", value: "male" },
      };
      const encryptedData = encryptData(sendData);

      Cookies.set("sub", encryptedData, {
        expires: 3,
        sameSite: "Strict",
        secure: true,
        path: "/",
      });
      router.push("/parent");
      dispatch(SET_ACTIVE_USER({ ...decryptData(encryptedData) }));
    } else {
      toast.error(t("auth.invalidCredentials"));
      return;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange } }) => (
          <CustomInput
            type="email"
            placeholder={messages.email}
            id="email"
            icon={<FaEnvelope />}
            label={messages.email}
            error={errors.email?.message}
            value={value}
            onChange={onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange } }) => (
          <CustomInput
            type="password"
            placeholder={messages.password}
            id="password"
            icon={<TbLockPassword />}
            label={messages.password}
            error={errors.password?.message}
            value={value}
            onChange={onChange}
          />
        )}
      />

      <h2 className="text-sm font-medium text-primary text-end">
        <LinkTo
          href="/auth/reset-password"
          className="w-fit ms-auto block hover:text-primary/80 transition-all duration-200"
        >
          Forgot your password?
        </LinkTo>
      </h2>

      <div className="flex w-full">
        <div className="flex w-full  items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            type="submit"
            className={`flex w-full justify-center  text-center items-center gap-2 px-6 py-3 rounded-md font-medium transition-all  bg-primary text-white hover:bg-primary/80 duration-200`}
          >
            {messages.login}
          </button>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <LinkTo
          href="/auth/register"
          className="text-sm font-medium text-primary text-center hover:text-primary/80 transition-all duration-200"
        >
          Don&apos;t have an account?{" "}
          <span className="font-bold underline">Register</span>
        </LinkTo>
      </div>
    </form>
  );
}
