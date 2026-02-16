interface CardDashBoardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
  border?: boolean;
  borderColor?: string;
}

function CardDashBoard({ 
  className = "", 
  children, 
  hover = false,
  border = true,
  borderColor = "border-slate-200 dark:border-slate-800"
}: CardDashBoardProps) {
  return (
    <div 
      className={`
        bg-white dark:bg-slate-900 
        rounded-2xl 
        ${border ? `border ${borderColor}` : ''}
        shadow-sm 
        p-6
        ${hover ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export default CardDashBoard
