import { useLocale } from 'next-intl'
import { useEffect, useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'

interface ViewTimeProps {
  data: string | Date | null | undefined
}

function ViewTime({ data }: ViewTimeProps) {
  const [time, setTime] = useState<string>('')
  const locale = useLocale()
  const dateLocale = locale === 'ar' ? ar : enUS

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined
    if (!data) {
      setTime('')
      return () => clearInterval(intervalId)
    }

    const createdDate = new Date(data)
    const today = new Date()
    const timeDiff = Math.abs(today.getTime() - createdDate.getTime())
    const daysAgo = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
    const exactTime = format(createdDate, 'hh:mm a', { locale: dateLocale })

    const updateTime = () => {
      if (daysAgo === 1) {
        setTime(
          `${formatDistanceToNow(createdDate, { addSuffix: true, locale: dateLocale })} (${exactTime})`,
        )
      } else if (daysAgo <= 7) {
        setTime(
          `${formatDistanceToNow(createdDate, { addSuffix: true, locale: dateLocale })} (${exactTime})`,
        )
      } else {
        setTime(format(createdDate, 'PPp', { locale: dateLocale }))
      }
    }

    updateTime()
    if (daysAgo === 1) {
      intervalId = setInterval(updateTime, 60000)
    }

    return () => clearInterval(intervalId)
  }, [data, dateLocale, locale])

  return <span className="block">{time}</span>
}

export default ViewTime
