import { FaSpinner } from "react-icons/fa";

interface CustomBtnProps {
  text: string;
  loading?: boolean;
  disabled?: boolean;
  [key: string]: unknown;
}

export default function CustomBtn({ text = "Submit", loading, disabled, ...props }: CustomBtnProps) {
  return (
    <button disabled={loading || disabled} className="w-full disabled:cursor-not-allowed! relative disabled:opacity-50 py-3 px-4 bg-linear-to-bl from-accent-purple to-deep-indigo rounded-2xl  text-lg text-white shadow-[0_10px_30px_-5px_rgba(124,58,237,0.3)] hover:shadow-[0_15px_40px_-5px_rgba(124,58,237,0.4)] active:scale-[0.98] transition-all duration-300 border border-white/20" {...props} >
      <span className={`${loading ? "opacity-0" : ""}`}>
        {text}
      </span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <FaSpinner className="animate-spin" />
        </span>
      )}
    </button>
  )
}
