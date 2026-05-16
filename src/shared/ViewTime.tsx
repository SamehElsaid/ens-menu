import { useLocale } from 'next-intl'
import { useEffect, useState } from 'react'
import moment from 'moment'
import 'moment/locale/ar'

interface ViewTimeProps {
  data: string | Date | null | undefined
}

function ViewTime({ data }: ViewTimeProps) {
  const [time, setTime] = useState<string>('')
  const locale = useLocale()
  useEffect(() => {
    moment.locale(locale)
    let intervalId: ReturnType<typeof setInterval> | undefined
    if (data) {
      const createdDate = new Date(data)
      const today = new Date()
      const timeDiff = Math.abs(today.getTime() - createdDate.getTime())
      const daysAgo = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

      const exactTime = moment(createdDate).format('hh:mm A')

      if (daysAgo === 1) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTime(`${moment(createdDate).fromNow()} (${exactTime})`)
        intervalId = setInterval(() => {
          setTime(`${moment(createdDate).fromNow()} (${exactTime})`)
        }, 60000)
      } else if (daysAgo <= 7) {
        setTime(`${moment(createdDate).fromNow()} (${exactTime})`)
      } else {
        setTime(moment(createdDate).format('lll'))
      }
    }

    return () => clearInterval(intervalId)
  }, [data, locale])

  return <span className="block">{time}</span>
}

export default ViewTime
