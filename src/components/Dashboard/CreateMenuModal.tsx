"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { axiosGet, axiosPost } from "@/shared/axiosCall";
import CurrencySelector from "@/components/Global/CurrencySelector";
import { toast } from "react-toastify";
import { Menu, SlugCheckResponse, UploadResponse } from "@/types/Menu";
import {
  IoRestaurant,
  IoCloseOutline,
  IoPricetagOutline,
  IoDocumentTextOutline,
  IoImageOutline,
  IoCashOutline,
  IoLinkOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoInformationCircleOutline,
  IoAddCircleOutline,
  IoCloudUploadOutline,
} from "react-icons/io5";

interface CreateMenuModalProps {
  onClose: () => void;
  onMenuCreated?: (newMenu?: Menu) => void;
}

export default function CreateMenuModal({
  onClose,
  onMenuCreated,
}: CreateMenuModalProps) {
  const t = useTranslations("Menus.createModal");
  const locale = useLocale();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    nameAr: "",
    description: "",
    descriptionAr: "",
    slug: "",
    logo: null as File | null,
    currency: "AED",
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [slugStatus, setSlugStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    suggestions: string[];
  }>({
    checking: false,
    available: null,
    suggestions: [],
  });

  const [isCreating, setIsCreating] = useState(false);

  // Debounced slug check
  useEffect(() => {
    if (!formData.slug || formData.slug.length < 3) {
      setSlugStatus({ checking: false, available: null, suggestions: [] });
      return;
    }

    const timeoutId = setTimeout(async () => {
      setSlugStatus({ checking: true, available: null, suggestions: [] });
      try {
        const result = await axiosGet<SlugCheckResponse>(
          "/menus/check-slug",
          locale,
          undefined,
          { slug: formData.slug },
        );
        if (result.status && result.data) {
          setSlugStatus({
            checking: false,
            available: result.data.available ?? false,
            suggestions: result.data.suggestions ?? [],
          });
        } else {
          // API returned error (e.g. invalid slug format)
          const errorData = result.data as SlugCheckResponse | undefined;
          setSlugStatus({
            checking: false,
            available: errorData?.available ?? null,
            suggestions: [],
          });
        }
      } catch (error) {
        console.error("Error checking slug:", error);
        setSlugStatus({ checking: false, available: null, suggestions: [] });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.slug, locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.slug && slugStatus.available === false) {
      toast.error(t("slugTakenError"));
      return;
    }

    try {
      setIsCreating(true);

      // Upload logo first if exists
      let logoUrl: string | null = null;
      if (formData.logo) {
        const logoFormData = new FormData();
        logoFormData.append("file", formData.logo);
        logoFormData.append("type", "logos");

        const uploadResult = await axiosPost<FormData, UploadResponse>(
          "/upload",
          locale,
          logoFormData,
          true,
        );

        if (!uploadResult.status || !uploadResult.data?.url) {
          console.error("Logo upload error:", uploadResult.data);
          toast.error(t("createError"));
          setIsCreating(false);
          return;
        }

        logoUrl = uploadResult.data.url;
      }

      // Create menu with logo URL
      const menuData = {
        nameEn: formData.name,
        nameAr: formData.nameAr,
        descriptionEn: formData.description,
        descriptionAr: formData.descriptionAr,
        slug: formData.slug,
        currency: formData.currency,
        ...(logoUrl && { logo: logoUrl }),
      };

      const result = await axiosPost<typeof menuData, Menu>(
        "/menus",
        locale,
        menuData,
      );

      if (result.status && result.data) {
        toast.success(t("createSuccess"));

        if (onMenuCreated) {
          onMenuCreated(result.data);
        }

        onClose();

        // Redirect to menu dashboard after creation
        if (result.data?.id) {
          router.push(`/dashboard/${result.data.id}`);
        }
      } else {
        toast.error(t("createError"));
      }
    } catch (error) {
      console.error("Error creating menu:", error);
      toast.error(t("createError"));
    } finally {
      setIsCreating(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFormData({ ...formData, slug: suggestion });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "image/png",
      "image/x-icon",
      "image/vnd.microsoft.icon",
      "image/jpeg",
      "image/jpg",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error(t("logoFormatError"));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("logoSizeError"));
      return;
    }

    setFormData({ ...formData, logo: file });

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setFormData({ ...formData, logo: null });
    setLogoPreview(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-linear-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
              <IoRestaurant className="text-white text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("title")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <IoCloseOutline className="text-gray-500 dark:text-gray-400 text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Names Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <IoPricetagOutline className="text-primary text-xl" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("menuNames")}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("nameEn")} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="e.g., My Restaurant Menu"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("nameAr")} *
                </label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={(e) =>
                    setFormData({ ...formData, nameAr: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="مثال: قائمة مطعمي"
                  dir="rtl"
                  required
                />
              </div>
            </div>
          </div>

          {/* Descriptions Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <IoDocumentTextOutline className="text-primary text-xl" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("descriptions")}
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("descriptionEn")}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-all resize-none"
                  placeholder="Describe your menu in English..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("descriptionAr")}
                </label>
                <textarea
                  value={formData.descriptionAr}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      descriptionAr: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-all resize-none"
                  placeholder="اكتب وصف القائمة بالعربية..."
                  dir="rtl"
                />
              </div>
            </div>
          </div>

          {/* Logo Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <IoImageOutline className="text-primary text-xl" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("logo")}
              </h3>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-700/30 overflow-hidden">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <IoRestaurant className="text-gray-400 text-5xl" />
                  )}
                </div>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                  >
                    <IoCloseOutline className="text-lg" />
                  </button>
                )}
              </div>

              <div className="flex flex-col items-center gap-2 w-full">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".png,.ico,.jpg,.jpeg,image/png,image/x-icon,image/vnd.microsoft.icon,image/jpeg"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <div className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors flex items-center gap-2">
                    <IoCloudUploadOutline className="text-xl" />
                    <span className="text-sm font-medium">
                      {t("logoUpload")}
                    </span>
                  </div>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {t("logoHint")}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {t("supportedFormats")}
                </p>
              </div>
            </div>
          </div>

          {/* Currency Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <IoCashOutline className="text-primary text-xl" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("currency")}
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("currencyLabel")} *
              </label>
              <CurrencySelector
                value={formData.currency}
                onChange={(currency) => setFormData({ ...formData, currency })}
                showArabOnly={locale === "ar"}
              />
            </div>
          </div>

          {/* Slug Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <IoLinkOutline className="text-primary text-xl" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("urlSettings")}
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("slug")} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slug: e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, "-"),
                    })
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all font-mono ${
                    slugStatus.available === false
                      ? "border-red-300 dark:border-red-600 focus:ring-red-500"
                      : slugStatus.available === true
                        ? "border-green-300 dark:border-green-600 focus:ring-green-500"
                        : "border-gray-300 dark:border-gray-600 focus:ring-primary"
                  }`}
                  placeholder="my-restaurant-menu"
                  required
                />
                {slugStatus.checking && (
                  <div className="absolute start-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  </div>
                )}
                {!slugStatus.checking && slugStatus.available === true && (
                  <div className="absolute start-3 top-1/2 -translate-y-1/2">
                    <IoCheckmarkCircle className="text-green-500 text-xl" />
                  </div>
                )}
                {!slugStatus.checking && slugStatus.available === false && (
                  <div className="absolute start-3 top-1/2 -translate-y-1/2">
                    <IoCloseCircle className="text-red-500 text-xl" />
                  </div>
                )}
              </div>

              {/* Status Message */}
              {slugStatus.checking && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {t("slugChecking")}
                </p>
              )}
              {!slugStatus.checking && slugStatus.available === true && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                  <IoCheckmarkCircle className="text-base" />
                  {t("slugAvailable")}
                </p>
              )}
              {!slugStatus.checking && slugStatus.available === false && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <IoCloseCircle className="text-base" />
                  {t("slugTaken")}
                </p>
              )}

              {/* Suggestions */}
              {!slugStatus.checking &&
                slugStatus.available === false &&
                slugStatus.suggestions.length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("slugSuggestions")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {slugStatus.suggestions.map(
                        (suggestion: string, index: number) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-3 py-1.5 text-xs font-mono bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/30 text-gray-700 dark:text-gray-300 transition-all"
                          >
                            {suggestion}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                )}

              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <IoInformationCircleOutline className="text-blue-500 text-lg mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
                      {t("slugHint")}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                      {formData.slug
                        ? `${formData.slug}.ensmenu.com`
                        : "your-slug.ensmenu.com"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isCreating}
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-linear-to-r from-primary to-primary/80 text-white rounded-xl hover:from-primary/90 hover:to-primary/70 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t("creating")}
                </>
              ) : (
                <>
                  <IoAddCircleOutline className="text-xl" />
                  {t("create")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
