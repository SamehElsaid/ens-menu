import { FiBell, FiMenu } from "react-icons/fi";
import { IoChatbubblesOutline } from "react-icons/io5";
import UserDropDown from "../UserDropDown";
import LinkTo from "../Global/LinkTo";

export function DashboardHeader({
  setIsMenuOpen,
  segment,
}: {
  setIsMenuOpen: (isMenuOpen: boolean | ((prev: boolean) => boolean)) => void;
  segment: string | null;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-8">
      <div className="flex  items-center gap-1 justify-between">
        <div className="flex items-center gap-1">
          {segment && (
            <button
              onClick={() => setIsMenuOpen((prev: boolean) => !prev)}
              className="rounded-full flex items-center justify-center w-10 h-10 border border-slate-200 bg-white  text-slate-500 transition hover:text-primary hover:border-secondary lg:hidden"
            >
              <FiMenu className="text-lg" />
            </button>
          )}
          <LinkTo href="/chat" className="rounded-full flex items-center justify-center w-10 h-10 border border-slate-200 bg-white  text-slate-500 transition hover:text-primary hover:border-secondary">
            <IoChatbubblesOutline className="text-lg" />
          </LinkTo>
        </div>
        <div className="flex items-center gap-1">
          <LinkTo href="/" className=" text-lg font-bold text-primary">Logo</LinkTo>
        </div>
        <div className="flex items-center gap-1 ">
          <button className="rounded-full flex items-center justify-center w-10 h-10 border border-slate-200 bg-white  text-slate-500 transition hover:text-primary hover:border-secondary">
            <FiBell className="text-lg" />
          </button>

          <UserDropDown />
        </div>
      </div>
    </header>
  );
}
