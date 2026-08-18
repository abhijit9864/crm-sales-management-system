import {
  Bell,
  ChevronDown,
  Menu,
  Search,
} from "lucide-react";

function Topbar({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center border-b border-[#EDEEF0] bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      {/* Mobile menu */}
      <button
        type="button"
        onClick={onMenuClick}
        className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl text-[#555E67] hover:bg-[#F5F8FE] hover:text-[#266DF0] lg:hidden"
      >
        <Menu size={21} />
      </button>

      {/* Search */}
      <div className="relative hidden w-full max-w-[360px] sm:block">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA1AA]"
        />

        <input
          type="search"
          placeholder="Search anything..."
          className="h-10 w-full rounded-xl border border-[#EDEEF0] bg-[#F5F8FE] pl-11 pr-4 font-inter text-sm text-[#232529] outline-none transition-all placeholder:text-[#9CA1AA] focus:border-[#B3CCFA] focus:bg-white focus:ring-4 focus:ring-[#D9E5FC]"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {/* Notifications */}
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#555E67] transition-colors hover:bg-[#F5F8FE] hover:text-[#266DF0]"
        >
          <Bell size={19} />

          <span className="absolute right-[9px] top-[8px] h-2 w-2 rounded-full border-2 border-white bg-[#266DF0]" />
        </button>

        <div className="h-7 w-px bg-[#EDEEF0]" />

        {/* User */}
        <button
          type="button"
          className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-[#F5F8FE]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D9E5FC] font-gilroy text-sm font-bold text-[#266DF0]">
            AP
          </div>

          <div className="hidden text-left md:block">
            <p className="font-inter text-sm font-semibold text-[#232529]">
              Abhijit Pradhan
            </p>

            <p className="font-inter text-[11px] text-[#9CA1AA]">
              Sales Executive
            </p>
          </div>

          <ChevronDown
            size={16}
            className="hidden text-[#9CA1AA] md:block"
          />
        </button>
      </div>
    </header>
  );
}

export default Topbar;