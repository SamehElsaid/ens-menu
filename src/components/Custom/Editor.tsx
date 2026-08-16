"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { axiosPost } from "@/shared/axiosCall";
import { _resizeImage } from "@/shared/_shared";
import SunEditor from "suneditor-react";
import { Skeleton, Spinner } from "@/components/ui";
import { sanitizeBuilderHtml } from "@/lib/template-builder/sanitizeContent";

interface ImageUploadResult {
  result: Array<{ url: string; name: string; size: number }>;
}

interface EditorProps {
  initialTemplateName: string;
  type: string;
  setValue: (field: string, value: string) => void;
  trigger: (field: string) => void;
  loadingSave?: boolean;
  setLoadingSave?: (loading: boolean) => void;
  setShowDescription?: () => void;
  to?: string;
}

const Editor = ({
  initialTemplateName,
  type,
  setValue,
  trigger,
  setLoadingSave,
}: EditorProps) => {
  const locale = useLocale();
  const [loading, setLoading] = useState(true);
  const t = useTranslations("common");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 0);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Skeleton className="h-100 w-full rounded-lg" />;
  }

  return (
    <div className="relative">
      {isLoading && (
        <div
          className="absolute bottom-0 end-0 z-10 flex items-center gap-1.5 border-s border-t border-line bg-surface-2 px-2 py-1"
          role="status"
        >
          <Spinner size="xs" />
          <span className="ui-label">{t("saving")}</span>
        </div>
      )}

      <SunEditor
        onChange={(e) => {
          setValue(type, sanitizeBuilderHtml(e));
          trigger(type);
          setLoadingSave?.(false);
          setIsLoading(false);
        }}
        onInput={() => {
          setLoadingSave?.(true);
          setIsLoading(true);
        }}
        defaultValue={initialTemplateName}
        onImageUploadBefore={(files, _info, uploadHandler) => {
          _resizeImage(files[0])
            .then((resized) => {
              const formData = new FormData();
              formData.append("image", resized);
              axiosPost<FormData, { image: string }>(
                "/structure/image/",
                locale,
                formData,
              ).then((res) => {
                if (res.status && res.data) {
                  const result: ImageUploadResult = {
                    result: [
                      {
                        url: res.data.image,
                        name: resized.name,
                        size: resized.size,
                      },
                    ],
                  };
                  uploadHandler(result);
                } else {
                  uploadHandler({ result: [] });
                }
              });
            })
            .catch((err) => {
              console.error(err);
              uploadHandler({ result: [] });
            });
          return undefined;
        }}
        setOptions={{
          buttonList: [
            ["font", "fontSize", "formatBlock"],
            [
              "bold",
              "underline",
              "italic",
              "strike",
              "subscript",
              "superscript",
            ],
            ["align", "horizontalRule", "list", "table"],
            ["fontColor", "hiliteColor"],
            ["outdent", "indent"],
            ["undo", "redo"],
            ["removeFormat"],
            ["link"],
            ["preview", "print", "image"],
            ["fullScreen", "showBlocks", "codeView"],
          ],
        }}
        height="400px"
        width="100%"
      />
    </div>
  );
};

export default Editor;
