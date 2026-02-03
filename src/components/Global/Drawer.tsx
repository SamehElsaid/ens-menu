import { useEffect } from "react";
import { IoMdClose } from "react-icons/io";

function Drawer({
  open,
  onClose,
  children,
  title,
  right,
  length,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  right: boolean;
  length?: number;
}) {
  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [open]);
  return (
    <>
      <div
        style={{ zIndex: 5555555555 }}
        className={`fixed inset-0  bg-drawer  flex ${
          right ? "justify-end" : "justify-start"
        }  ${
          open ? "visible opacity-100" : "invisible opacity-0"
        } duration-200`}
      >
        <div className="fixed inset-0 glass-bg" onClick={onClose}></div>

        <div
          style={{
            boxShadow: "rgba(0, 0, 0, 0.15) -2.4px -2.4px 3.2px",
          }}
          className={`drawer_custom bg-white sm:w-[400px] w-full  min-h-dvh!   relative z-10 ${
            open
              ? "translate-x-0"
              : !right
              ? "-translate-x-full"
              : "-translate-x-full"
          } duration-300`}
        >
          <div className="flex justify-between items-center px-4 py-5">
            <h2 className="flex-1 text-2xl font-bold text-primary">
              {title ?? ""}
              {length ? ` (${length})` : ""}
            </h2>
            <button
              className="flex justify-center items-center z-10 w-7 h-7 rounded-full duration-300 bg-primary text-white hover:scale-110"
              onClick={onClose}
            >
              <IoMdClose className="" />
            </button>
          </div>
          <div className=" h-[calc(100%-72px)]  overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

export default Drawer;
