"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";
import type SunEditorCore from "suneditor/src/lib/core";
import SunEditor from "suneditor-react";
import { sanitizeBuilderHtml } from "@/lib/template-builder/sanitizeContent";

interface ShowEditorProps {
  initialTemplateName: string;
  showMore?: boolean;
}

const ShowEditor = ({
  initialTemplateName,
  showMore = false,
}: ShowEditorProps) => {
  const [showMoreState, setShowMoreState] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);
  const editorInstance = useRef<SunEditorCore | null>(null);
  const t = useTranslations("common");

  useEffect(() => {
    if (!editorInstance.current) return;

    try {
      const content = showMoreState
        ? sanitizeBuilderHtml(initialTemplateName).slice(0, 600)
        : sanitizeBuilderHtml(initialTemplateName);
      editorInstance.current.setContents(content);
    } catch {
      // setContents may fail before the editor is fully mounted
    }
  }, [showMoreState, initialTemplateName]);

  return (
    <div ref={divRef}>
      <SunEditor
        getSunEditorInstance={(sunEditor) => {
          editorInstance.current = sunEditor;
        }}
        readOnly
        disableToolbar
        hideToolbar
        onLoad={() => {
          const editor = document.querySelector<HTMLElement>(
            ".sun-editor-editable",
          );
          if (editor) {
            editor.setAttribute("contenteditable", "false");
            editor.style.pointerEvents = "auto";
            editor.style.userSelect = "text";
          }
        }}
        setOptions={{
          buttonList: [],
          resizingBar: false,
        }}
        width="100%"
        defaultValue={sanitizeBuilderHtml(initialTemplateName)}
      />
      {showMore && initialTemplateName.length > 600 && (
        <Button
          className="w-full lg:w-auto"
          variant={showMoreState ? "secondary" : "danger"}
          size="sm"
          onClick={() => {
            setShowMoreState((prev) => !prev);
            setTimeout(() => {
              if (!divRef.current) return;
              const scrollOffset = 300;
              const top =
                divRef.current.getBoundingClientRect().top +
                window.scrollY -
                scrollOffset;
              window.scrollTo({ top, behavior: "auto" });
            }, 0);
          }}
        >
          {showMoreState ? t("showMore") : t("showLess")}
        </Button>
      )}
    </div>
  );
};

export default ShowEditor;
