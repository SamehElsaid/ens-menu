import { UnmountClosed } from "react-collapse";
import { useTranslations } from "next-intl";

interface UploadFileProps {
  t: ReturnType<typeof useTranslations<"">>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  attachments: File[];
  handleViewFile: (file: File) => void;
  handleDeleteFile: (index: number) => void;
  errors: string;
  label: string;
  size: number;
  accept: string;
  fileTypesMessage?: string;
}

function UploadFile({
  t,
  handleFileChange,
  attachments,
  handleViewFile,
  handleDeleteFile,
  errors,
  label,
  size,
  accept,
  fileTypesMessage,
}: UploadFileProps) {
  return (
    <div>
      <label className="capitalize px-3">
        {t(label)}
      </label>
      <div className={`border-2 ${errors ? "border-red-500 bg-red-50" : "border-primary bg-primary/10"} border-dashed rounded-lg  text-center transition-colors`}>
        <input
          type="file"
          id="attachments"
          multiple
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
        <label
          htmlFor="attachments"
          className="cursor-pointer flex flex-col items-center py-10"
        >
          <span className="text-sm ">
            {t("form.clickToUploadOrDragAndDrop")}
          </span>
          <span className="text-xs text-gray-500 mt-1">
            {fileTypesMessage
              ? t(fileTypesMessage, { size: size.toString() })
              : t("form.pngWebpJpgUpTo{size}mb", { size: size.toString() })}
          </span>
        </label>
      </div>

      {/* File List */}
      <UnmountClosed isOpened={Boolean(attachments.length > 0)}>
        <div className="mt-4 space-y-2">
          {attachments.map((file: File, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between p-3  bg-primary/5 rounded-md"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-sm font-medium  truncate">
                  {file.name.length > 20
                    ? file.name.substring(0, 20) + "..."
                    : file.name}
                </span>
                <span className="text-xs text-gray-500">
                  ({(file.size / 1024 / 1024).toFixed(2)}{" "}
                  {t("form.mb")})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleViewFile(file)}
                  className="px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors"
                >
                  {t("form.viewFile")}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteFile(index)}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100  rounded-md transition-colors"
                >
                  {t("form.deleteFile")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </UnmountClosed>

      <UnmountClosed isOpened={Boolean(errors)}>
        <p className="text-xs text-red-500 mt-1">{errors}</p>
      </UnmountClosed>
    </div>
  );
}

export default UploadFile;
