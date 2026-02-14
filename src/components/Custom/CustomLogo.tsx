
function CustomLogo() {
  return (
    <div className="flex flex-col items-center mt-8 mb-12">
      <div className="relative w-20 h-20 mb-4 overflow-hidden">
        <div className="grid grid-cols-3 grid-rows-3 gap-1.5 h-full w-full opacity-90">
          <div className="bg-royal-purple dark:bg-purple-300 rounded-sm" />
          <div className="bg-accent-purple/20 dark:bg-accent-purple/35 rounded-sm" />
          <div className="bg-royal-purple dark:bg-purple-300 rounded-sm" />
          <div className="bg-accent-purple/20 dark:bg-accent-purple/35 rounded-sm" />
          <div className="bg-royal-purple dark:bg-purple-300 rounded-sm" />
          <div className="bg-accent-purple/20 dark:bg-accent-purple/35 rounded-sm" />
          <div className="bg-royal-purple dark:bg-purple-300 rounded-sm" />
          <div className="bg-accent-purple/20 dark:bg-accent-purple/35 rounded-sm" />
          <div className="bg-royal-purple dark:bg-purple-300 rounded-sm" />
        </div>
        <div className="scanning-line absolute right-0 w-full z-20" />
      </div>
      <h1 className="text-2xl lg:text-xl xl:text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-linear-to-r from-slate-900 via-purple-600 to-slate-900 dark:from-slate-100 dark:via-purple-300 dark:to-slate-100 bg-size-[200%_auto] uppercase">
        Ensmenu
        <div className="w-full h-1 -mt-0.5 rounded-full bg-purple-600 dark:bg-purple-400 shadow-[0_0_10px_rgba(124,58,237,0.5)] opacity-40 dark:opacity-70" />
      </h1>
    </div>
  );
}

export default CustomLogo;
