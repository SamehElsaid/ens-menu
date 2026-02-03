import { useEffect, useRef, useState } from "react";
import SunEditor from "suneditor-react";
import { FaSpinner } from "react-icons/fa";
import Loader from "./Global/Loader";

const Editor = ({
  initialTemplateName,
  onChange,
  loadingSave,
  setLoadingSave,
}: {
  initialTemplateName: string;
  onChange: (e: string) => void;
  loadingSave: boolean;
  setLoadingSave: (loading: boolean) => void;
}) => {
  const [templateName, setTemplateName] = useState(initialTemplateName);
  const [installLoadingState, setInstallLoadingState] = useState(true);
  const ref = useRef("");

  useEffect(() => {
    setTimeout(() => {
      setInstallLoadingState(false);
    }, 500);
  }, []);

  return (
    <div className="relative min-h-[400px]">
      {installLoadingState && (
        <div className="absolute inset-0 bg-white overflow-hidden z-10 flex items-center justify-center loading-overlay">
          <div className="w-[calc(100%-3px)] z-10 h-[calc(100%-3px)] bg-white absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"></div>
          <div className="blob"></div>
          <div className="z-20">
            <Loader />
          </div>
        </div>
      )}
      {loadingSave && (
        <div className="flex absolute bottom-0 z-50 gap-1 justify-center items-center p-2 text-white rounded-ss-lg bg-primary/70 end-0">
          <FaSpinner className="animate-spin" /> Loading Save...
        </div>
      )}
      <SunEditor
        onInput={() => {
          setLoadingSave(true);
        }}
        onChange={(e) => {
          setTemplateName(e);
          onChange(e);
          ref.current = e;
          setLoadingSave(false);
        }}
        defaultValue={templateName}
        setOptions={{
          buttonList: [
            ["fontSize", "formatBlock"],
            [
              "bold",
              "underline",
              "italic",
              "strike",
              "subscript",
              "superscript",
            ],
            ["align", "horizontalRule", "list"],
            ["fontColor", "hiliteColor"],
            ["outdent", "indent"],
            ["undo", "redo"],
            ["removeFormat"],
            ["preview"],
          ],
        }}
        height="400px"
        width="100%"
      />
    </div>
  );
};

export default Editor;
