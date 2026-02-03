
import ChatUI from "@/components/chat/ChatUI";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ChatPage({ params }: Props) {
  const { locale } = await params;

  return <ChatUI locale={locale} />;
}


