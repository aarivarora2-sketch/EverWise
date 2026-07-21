// Everwise lessons.
// Each lesson alternates between "skill" (how to do everyday online things)
// and "protection" (how to spot the tricks). Kept to a single tap-answer so
// both lesson types live in one consistent, easy flow.
//
// Shape of each lesson:
//   type        "skill" | "protection"
//   title       short lesson name
//   learn       plain-language teaching text (read aloud on the Learn screen)
//   question    the one-tap quiz question
//   scenario    the situation the learner is judging
//   options     exactly two answer options [a, b]
//   correct     index (0 or 1) of the correct option
//   explanation the "why" — what to remember

export const lessons = [
  {
    type: "protection",
    title: "Fake IRS Calls",
    learn:
      "The government will never call you and demand money over the phone. Real agencies like the IRS send letters by mail. A caller who says you owe taxes and must pay right now — or you'll be arrested — is a scammer. They use fear to rush you. It is always safe to hang up.",
    question: "Is this a real call, or a scam?",
    scenario:
      "Your phone rings. A stern voice says: “This is the IRS. You owe back taxes. Pay $500 in gift cards today or the police will arrest you tonight.”",
    options: ["It's a scam — hang up", "It's real — I should pay"],
    correct: 0,
    explanation:
      "This is a scam. The IRS never calls to demand instant payment, never asks for gift cards, and never threatens arrest. When someone rushes and scares you, that's the biggest warning sign. Hang up — you did the right thing.",
  },
  {
    type: "skill",
    title: "Attach a photo to an email",
    learn:
      "To send a picture in an email, look for the paperclip icon. The paperclip always means “attach a file.” Tap it, choose your photo, and it gets added to your message. The paperclip is the same in almost every email app, so once you know it, you can send photos anywhere.",
    question: "Which button attaches a photo?",
    scenario:
      "You're writing an email to your granddaughter and want to send her a photo from your last visit. You see two buttons at the bottom of the message.",
    options: ["The paperclip icon", "The trash can icon"],
    correct: 0,
    explanation:
      "The paperclip attaches a file, like a photo. The trash can deletes your email instead. Remember: paperclip means “attach.” Now you can share photos with family any time.",
  },
  {
    type: "protection",
    title: "Grandkid in trouble",
    learn:
      "In this scam, someone calls pretending to be your grandchild — or a lawyer for them — saying they're in trouble and need money fast, and to keep it secret. Scammers can even fake a familiar voice now. The safe move is to hang up and call your family member back on their real number to check.",
    question: "Is this a real emergency, or a scam?",
    scenario:
      "A shaky voice says: “Grandma, it's me. I had an accident and I'm in jail. Please don't tell Mom. Send $2,000 right away.”",
    options: ["It's a scam — call family to check", "It's real — send the money"],
    correct: 0,
    explanation:
      "This is a scam. Pressure, secrecy, and an urgent money request are the signs. Real family won't mind you double-checking. Hang up and call your grandchild's real number — you'll almost always find they're safe at home.",
  },
  {
    type: "skill",
    title: "Join a video call",
    learn:
      "When family sends a link for a video call, you don't need to set anything up. Just tap the link they sent. It opens the call and connects you. If it asks to use your camera and microphone, tap “Allow” so they can see and hear you. That's all it takes to be face-to-face.",
    question: "How do you join the call?",
    scenario:
      "Your son texts: “Video call at 6pm! Here's the link.” It's 6pm now and you want to join so you can see the grandkids.",
    options: ["Tap the link he sent", "Reply with your password"],
    correct: 0,
    explanation:
      "Just tap the link — it opens the call and connects you. You never need to send a password to join a video call. If anyone asks for your password to “let you in,” that's a scam. Enjoy seeing the family!",
  },
  {
    type: "protection",
    title: "You won a prize",
    learn:
      "A real prize never costs you money. If someone says you've won a lottery, a gift card, or a vacation — but you must first pay a fee, taxes, or “shipping” — it's a scam. You cannot win a contest you never entered. When a prize asks you to pay to collect it, the answer is always no.",
    question: "Is this a real prize, or a scam?",
    scenario:
      "A message says: “Congratulations! You've won a $1,000 gift card. To claim it, just pay a $50 processing fee with your card.”",
    options: ["It's a scam — ignore it", "It's real — pay the fee"],
    correct: 0,
    explanation:
      "This is a scam. A genuine prize never asks you to pay to receive it, and you can't win something you didn't enter. Paying the “fee” just hands a scammer your money and card number. Ignore it and delete the message.",
  },
];
