"use client";

import { useCallback, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-toastify";
import LinkTo from "@/components/Global/LinkTo";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import { useAppSelector } from "@/store/hooks";
import { useMenuImportFlow } from "@/hooks/useMenuImportFlow";
import ImportStepper from "./shared/ImportStepper";
import UploadStep from "./steps/UploadStep";
import ProcessingStep from "./steps/ProcessingStep";
import ReviewStep from "./steps/ReviewStep";
import ImportErrorPanel from "./shared/ImportErrorPanel";
import { _resizeImage } from "@/shared/_shared";
import {
  MENU_IMPORT_COMPRESSED_TARGET_BYTES,
  MENU_IMPORT_COMPRESS_THRESHOLD_BYTES,
} from "@/lib/menuImport/constants";
import { formatImageSizeLog } from "@/lib/menuImport/formatImageSize";
import { IoArrowBackOutline } from "react-icons/io5";

export default function MenuImportWizard() {
  const t = useTranslations("MenuImport");
  const locale = useLocale() as "ar" | "en";
  const params = useParams();
  const menuId =
    typeof params.menu === "string"
      ? params.menu
      : ((params.menu as string[])?.[0] ?? "");

  const menu = useAppSelector((state) => state.menuData.menu);
  const currency = menu?.currency ?? "EGP";

  const flow = useMenuImportFlow({ menuId, currency, locale });
  const { state } = flow;

  const [isPreparingImage, setIsPreparingImage] = useState(false);

  const handleFileSelect = useCallback(
    async (file: File) => {
      setIsPreparingImage(true);
      try {
        console.log("[MenuImport] Image before client prepare:", {
          fileName: file.name,
          mimeType: file.type,
          ...formatImageSizeLog(file.size),
        });

        const resized = await _resizeImage(
          file,
          MENU_IMPORT_COMPRESSED_TARGET_BYTES,
          MENU_IMPORT_COMPRESS_THRESHOLD_BYTES,
        );

        if (resized.size < file.size) {
          console.log("[MenuImport] Image after client prepare:", {
            fileName: resized.name,
            mimeType: resized.type,
            ...formatImageSizeLog(resized.size),
          });
        }

        flow.setFile(resized);
        if (resized.size < file.size) {
          // toast.info(t("imageResized"));
        }
      } catch {
        toast.error(t("imageResizeFailed"));
      } finally {
        setIsPreparingImage(false);
      }
    },
    [flow, t],
  );

  const handleOpenConfirm = useCallback(() => {
    flow.openConfirm();
  }, [flow]);

  return (
    <div className="space-y-8 pb-10 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <LinkTo
            href={`/dashboard/${menuId}`}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-primary mb-3 transition-colors"
          >
            <IoArrowBackOutline className="text-lg" />
            {t("backToOverview")}
          </LinkTo>
          <PageTitleWithHelp>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
              {t("pageTitle")}
            </h1>
          </PageTitleWithHelp>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t("pageSubtitle")}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 md:p-8">
        <ImportStepper currentStep={state.step} />

        <div className="mt-8">
          {state.step === "upload" && (
            <UploadStep
              file={state.file}
              previewUrl={state.previewUrl}
              onFileSelect={handleFileSelect}
              onClear={flow.clearFile}
              onAnalyze={flow.startAnalysis}
              isProcessing={state.isProcessing}
              isPreparing={isPreparingImage}
            />
          )}

          {state.step === "processing" && (
            <ProcessingStep previewUrl={state.previewUrl} />
          )}

          {state.step === "review" && state.draft && (
            <ReviewStep
              draft={state.draft}
              parseErrors={state.parseErrors}
              blockingErrors={flow.blockingErrors}
              blockingPriceErrors={flow.blockingPriceErrors}
              blockingNameErrors={flow.blockingNameErrors}
              unresolvedPriceConflicts={flow.unresolvedPriceConflicts}
              canProceedToConfirm={flow.canProceedToConfirm}
              duplicatesLoading={state.duplicatesLoading}
              confirmOpen={state.confirmOpen}
              isSaving={state.isSaving}
              saveResult={state.saveResult}
              saveError={state.error}
              menuId={menuId}
              onNewUpload={flow.clearFile}
              onOpenConfirm={handleOpenConfirm}
              onCloseConfirm={flow.closeConfirm}
              onConfirmSave={flow.confirmSave}
              onUpdateCategory={flow.updateCategory}
              onUpdateItem={flow.updateItem}
              onUpdateVariant={flow.updateVariant}
              onDeleteItem={flow.deleteItem}
              onDeleteCategory={flow.deleteCategory}
              onAddItem={flow.addItem}
              onAddCategory={flow.addCategory}
              onAddVariant={flow.addVariant}
              onRemoveVariant={flow.removeVariant}
              onResolveDuplicate={flow.resolveDuplicate}
              onItemImage={(categoryId, itemId, imageUrl) =>
                flow.updateItem(categoryId, itemId, { imageUrl })
              }
            />
          )}

          {state.step === "error" && state.error && (
            <ImportErrorPanel
              error={state.error}
              onRetry={flow.retryAnalysis}
              onChangeImage={flow.clearFile}
            />
          )}
        </div>
      </div>

    </div>
  );
}
