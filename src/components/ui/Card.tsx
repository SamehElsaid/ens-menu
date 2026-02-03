
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className=" rounded-2xl ">
      <div
        className={`bg-white rounded-md  shadow-md p-6 md:p-8 w-full transition-all duration-300 ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

