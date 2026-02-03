interface ApplicationDetailPageProps {
  params: {
    id: string;
  };
}

import ApplicationSteps from "@/components/Custom/ApplicationSteps";

export default async function ApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const { id } = await params;

  return <ApplicationSteps applicationId={id} />;
}
