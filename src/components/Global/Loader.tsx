import { FaSpinner } from "react-icons/fa";

function Loader() {
  return (
    <div className="flex-col gap-4 w-full flex items-center justify-center">
      <div className="w-20 h-20 border-4 text-primary text-4xl animate-spin border-gray-300 flex items-center justify-center border-t-primary rounded-full">
        <FaSpinner className="animate-spin" size={40} />
      </div>
    </div>
  );
}

export default Loader;
