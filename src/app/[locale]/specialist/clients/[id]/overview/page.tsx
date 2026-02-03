import OverView from '@/components/dashboardControls/OverView'

export default function OverviewPage() {
  return (
    <OverView params={Promise.resolve({ id: "clientId" })} />
  )
}
