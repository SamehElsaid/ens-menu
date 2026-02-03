export type ChatUser = {
  id: string;
  name: string;
  avatar: string;
};

export type ChatMessageType = "text" | "image" | "audio" | "document";

export type ChatMessage = {
  id: string;
  userId: string;
  type: ChatMessageType;
  content: string;
  createdAt: string;
  imageUrl?: string;
  audioUrl?: string;
  durationSeconds?: number;
  documentUrl?: string;
  fileName?: string;
};

export const fakeUsers: ChatUser[] = [
  {
    id: "u1",
    name: "You",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=You",
  },
  {
    id: "u2",
    name: "Dr. Sara",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Sara",
  },
  {
    id: "u3",
    name: "Support Bot",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Bot",
  },
];

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60 * 1000).toISOString();

export const fakeMessages: ChatMessage[] = [
  {
    id: "m1",
    userId: "u2",
    type: "text",
    content: "Hi, how are you feeling today?",
    createdAt: minutesAgo(60),
  },
  {
    id: "m2",
    userId: "u1",
    type: "text",
    content: "I’m feeling a bit stressed, honestly.",
    createdAt: minutesAgo(59),
  },
  {
    id: "m3",
    userId: "u2",
    type: "text",
    content: "Thanks for sharing that. What do you think is stressing you the most right now?",
    createdAt: minutesAgo(58),
  },
  {
    id: "m4",
    userId: "u1",
    type: "text",
    content: "Work has been very busy and I feel like I can’t disconnect even after hours.",
    createdAt: minutesAgo(57),
  },
  {
    id: "m5",
    userId: "u2",
    type: "text",
    content: "That sounds exhausting. Have you been able to take any short breaks during the day?",
    createdAt: minutesAgo(56),
  },
  {
    id: "m6",
    userId: "u1",
    type: "text",
    content: "Not really, I usually just push through until I’m done.",
    createdAt: minutesAgo(55),
  },
  {
    id: "m7",
    userId: "u2",
    type: "text",
    content: "Tip: Even 2–3 minute micro‑breaks can help your focus and reduce stress.",
    createdAt: minutesAgo(54),
  },
  {
    id: "m8",
    userId: "u2",
    type: "text",
    content: "When was the last time you felt relaxed and calm? What were you doing then?",
    createdAt: minutesAgo(53),
  },
  {
    id: "m9",
    userId: "u1",
    type: "text",
    content: "Last weekend, when I was out walking with friends and left my phone at home.",
    createdAt: minutesAgo(52),
  },
  {
    id: "m10",
    userId: "u2",
    type: "text",
    content: "Great, that’s a helpful clue. We can think of small ways to bring that feeling into your week.",
    createdAt: minutesAgo(51),
  },
  {
    id: "m11",
    userId: "u1",
    type: "text",
    content: "That would be nice.",
    createdAt: minutesAgo(50),
  },
  {
    id: "m12",
    userId: "u2",
    type: "text",
    content: "How has your sleep been over the last few nights?",
    createdAt: minutesAgo(49),
  },
  {
    id: "m13",
    userId: "u1",
    type: "text",
    content: "I sleep late and wake up feeling tired.",
    createdAt: minutesAgo(48),
  },
  {
    id: "m14",
    userId: "u2",
    type: "text",
    content: "Okay, we’ll also look at a gentle evening routine to help you unwind.",
    createdAt: minutesAgo(47),
  },
  {
    id: "m15",
    userId: "u2",
    type: "text",
    content: "Tip: Try to keep screens away for 30 minutes before you go to sleep.",
    createdAt: minutesAgo(46),
  },
  {
    id: "m16",
    userId: "u1",
    type: "text",
    content: "I’ll try that tonight.",
    createdAt: minutesAgo(45),
  },
  {
    id: "m17",
    userId: "u2",
    type: "text",
    content: "Wonderful. We’ll review how it went in our next session.",
    createdAt: minutesAgo(44),
  },
  {
    id: "m18",
    userId: "u2",
    type: "text",
    content: "Before we end today, is there anything else on your mind?",
    createdAt: minutesAgo(43),
  },
  {
    id: "m19",
    userId: "u1",
    type: "text",
    content: "No, that’s all for now. Thank you.",
    createdAt: minutesAgo(42),
  },
  {
    id: "m20",
    userId: "u2",
    type: "text",
    content: "You’re welcome. Remember, one small step at a time is enough.",
    createdAt: minutesAgo(41),
  },
  {
    id: "m21",
    userId: "u2",
    type: "text",
    content: "Tip: You can send voice messages or images if that’s easier for you.",
    createdAt: minutesAgo(40),
  },
];


