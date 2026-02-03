function CardDashBoard({ className = "", children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={className + " bg-white rounded-2xl p-6 shadow-sm"}>
      {children}
    </div>
  )
}

export default CardDashBoard
