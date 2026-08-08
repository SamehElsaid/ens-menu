"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { axiosPost } from "@/shared/axiosCall";
import { _resizeImage } from "@/shared/_shared";
import SunEditor from "suneditor-react";

interface ImageUploadResult {
  result: Array<{ url: string; name: string; size: number }>;
}

interface EditorProps {
  initialTemplateName: string;
  type: string;
  setValue: (field: string, value: string) => void;
  trigger: (field: string) => void;
  refresh?: unknown;
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
  refresh,
  loadingSave,
  setLoadingSave,
}: EditorProps) => {
  const locale = useLocale();
  const [templateName, setTemplateName] = useState(initialTemplateName);
  const [loading, setLoading] = useState(true);
  const ref = useRef("");
  const t = useTranslations("common");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setTemplateName(initialTemplateName);
    setLoading(true);
    setTimeout(() => setLoading(false), 0);
  }, [refresh]);

  if (loading) {
    return (
      <div className="w-full h-[400px] rounded-[10px] animate-pulse bg-gray-200" />
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute bg-violet-500 px-2 py-1 bottom-0 end-0 z-10 flex items-center justify-center backdrop-blur-[2px]">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-white ms-2">{t("saving")}</span>
        </div>
      )}

      <SunEditor
        onChange={(e) => {
          setTemplateName(e);
          setValue(type, e);
          trigger(type);
          ref.current = e;
          setLoadingSave?.(false);
          setIsLoading(false);
        }}
        onInput={() => {
          setLoadingSave?.(true);
          setIsLoading(true);
        }}
        defaultValue={templateName}
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
                  console.log(res.data);
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
