// Everwise Final Test — the capstone at the end of the path.
//
// Unlike a phase exam, this draws on every phase (1–17) across both tracks:
// Foundations (1–7) and Scam Protection (8–17). It sits on the last node of
// the path and only unlocks once every lesson, challenge, and phase exam is
// complete.
//
// Question mix, by source phase:
//   1–2   Foundations, personal information        (Q1, Q2)
//   2     Passwords, 2FA, public Wi-Fi             (Q3, Q4)
//   3     Texting, email, calls                    (Q5)
//   4     Banking, payments, shopping              (Q6, Q7)
//   5     Health & government sites                (Q8)
//   6     Social media, fake news, deepfakes       (Q9)
//   7     Emergency response                       (Q10, Q11)
//   8–9   Pausing, verifying, warning signs        (Q12, Q13, Q14)
//   10    Impersonation                            (Q15, Q16)
//   11    AI voices, images, overconfidence        (Q17)
//   12–13 Personal info, links, attachments        (Q18, Q19)
//   14–17 Money, AI as a helper, helping others    (Q20)

export const finalExam = {
  id: "everwise-final-exam",
  track: "capstone",
  // Sits with the last phase so it inherits the Summit color on the path.
  phase: 17,
  order: 9999,
  title: "Everwise Final Test",
  topics: [
    "Internet basics, AI, and personal information",
    "Passwords, two-factor authentication, and safe browsing",
    "Texting, email, and video calls",
    "Banking, payments, and online shopping",
    "Health and government websites",
    "Social media, fake news, and deepfakes",
    "Spotting scammer tactics and disguises",
    "What to do if something goes wrong",
  ],
  passingScore: 16,
  totalQuestions: 20,
  phaseBadge: "Everwise Graduate",
  phaseBadgeXp: 250,
  questions: [
    {
      question:
        "Someone you did not expect contacts you and asks for information. Which of these should you never give them?",
      options: [
        "Your first name",
        "Your favorite hobby",
        "The city you live in",
        "Your password, verification code, or Social Security number",
      ],
      correctIndex: 3,
      explanation:
        "Passwords, verification codes, Social Security numbers, and bank account numbers are the keys to your accounts. A real organization will never call or text you asking for them.",
    },
    {
      question:
        "A text message says: \"We sent you a 6-digit code. Please reply with it to confirm your identity.\" What should you do?",
      options: [
        "Reply with the code so your account isn't closed",
        "Never share the code, and contact the company yourself using a number you already trust",
        "Forward the code to a friend to ask what they think",
        "Reply asking who is calling",
      ],
      correctIndex: 1,
      explanation:
        "Verification codes are meant for you alone. Anyone asking you to send one is trying to get into your account.",
    },
    {
      question: "Which of these passwords is the strongest?",
      options: [
        "BlueRiver$Garden88",
        "password123",
        "Robert1948",
        "abc12345",
      ],
      correctIndex: 0,
      explanation:
        "Strong passwords are long, mix different kinds of characters, and don't contain your name or birth year. Length matters more than anything else.",
    },
    {
      question:
        "You're at a coffee shop using free public Wi-Fi. Which activity is the riskiest?",
      options: [
        "Reading the news",
        "Checking the weather",
        "Logging into your bank account",
        "Looking at a restaurant menu",
      ],
      correctIndex: 2,
      explanation:
        "Public Wi-Fi can be watched by others on the same network. Save banking and other sensitive tasks for your home connection or your phone's own data.",
    },
    {
      question:
        "An email that looks like it's from your bank asks you to click a link and \"verify your account immediately.\" What is the safest response?",
      options: [
        "Ignore the link and open your bank's app or type its website address yourself",
        "Click the link, but only enter your username",
        "Reply to the email asking if it's real",
        "Forward it to everyone in your contacts as a warning",
      ],
      correctIndex: 0,
      explanation:
        "Never use a link from a suspicious message. Reach the organization the way you normally would — its app, its official website, or the number on your card.",
    },
    {
      question:
        "Someone you have never met in person asks you to pay them with Zelle, a wire transfer, or gift cards. What does this tell you?",
      options: [
        "Nothing unusual — these are normal payment methods",
        "It's a strong warning sign, because these payments are almost impossible to get back",
        "It's safe as long as the amount is small",
        "It's safe if they send a photo of their ID",
      ],
      correctIndex: 1,
      explanation:
        "Scammers prefer payments that can't be reversed. A credit card offers far more protection if something goes wrong.",
    },
    {
      question:
        "You find an online store with unusually low prices that you've never heard of. What should you check before buying?",
      options: [
        "Only whether the pictures look professional",
        "Nothing — low prices are always a good deal",
        "Whether the website loads quickly",
        "Look for reviews elsewhere, a real contact address, and whether the site accepts credit cards",
      ],
      correctIndex: 3,
      explanation:
        "Fake stores copy real photos and build convincing pages. Independent reviews, a genuine way to contact them, and credit-card payment are better signals.",
    },
    {
      question:
        "Which website address is most likely to be the real Social Security Administration?",
      options: [
        "ssa-benefits-now.com",
        "ssa.gov",
        "socialsecurity-verify.net",
        "my-ssa-login.org",
      ],
      correctIndex: 1,
      explanation:
        "United States government agencies use addresses ending in .gov. Look-alike endings such as .com, .net, or .org with extra words are a warning sign.",
    },
    {
      question:
        "You see a video online of a well-known person saying something shocking. Before believing or sharing it, what's the best step?",
      options: [
        "Check whether trusted news organizations are reporting the same thing",
        "Share it right away so others are warned",
        "Believe it — video can't be faked",
        "Judge it by how many likes it has",
      ],
      correctIndex: 0,
      explanation:
        "Video and audio can now be convincingly faked. Confirming a story through several established news sources is the most reliable check.",
    },
    {
      question:
        "You realize you entered your email password on a fake website. What should you do first?",
      options: [
        "Wait a few days and watch what happens",
        "Change that password right away, and anywhere else you used it",
        "Delete your email account",
        "Turn off your computer and leave it off",
      ],
      correctIndex: 1,
      explanation:
        "Your email can be used to reset passwords on your other accounts, so securing it first limits the damage. Turn on two-factor authentication while you're there.",
    },
    {
      question:
        "Money has been taken from your bank account by a scammer. Who should you contact first?",
      options: [
        "Your bank",
        "The scammer, to ask for it back",
        "A friend who is good with computers",
        "Nobody — banks never help with this",
      ],
      correctIndex: 0,
      explanation:
        "Your bank can freeze the account, stop further transfers, and begin a fraud investigation. Acting quickly gives them the best chance of recovering the money.",
    },
    {
      question:
        "A caller creates a sense of panic and says you must act in the next ten minutes. What is the single most useful thing you can do?",
      options: [
        "Do exactly what they ask, quickly",
        "Keep them talking until they slip up",
        "Give partial information to test them",
        "Pause and hang up, then verify the story yourself",
      ],
      correctIndex: 3,
      explanation:
        "Urgency is a tool scammers use to stop you thinking clearly. Real organizations will always let you call them back.",
    },
    {
      question:
        "Someone contacting you insists you keep the conversation secret — don't tell your family, don't tell your bank. What does this mean?",
      options: [
        "They are protecting your privacy",
        "It's a strong sign of a scam",
        "It's normal for financial matters",
        "They must work for the government",
      ],
      correctIndex: 1,
      explanation:
        "Secrecy keeps you away from the people who would spot the scam. No legitimate organization asks you to hide a request from your family or your bank.",
    },
    {
      question:
        "True or False: If your phone shows a caller ID with your bank's name, you can be confident the call really is from your bank.",
      options: ["True", "False"],
      correctIndex: 1,
      explanation:
        "Caller ID can be faked easily — this is called spoofing. Hang up and call the number printed on your card or statement instead.",
    },
    {
      question:
        "Someone calls saying they're from the government and that you owe money you must pay today, or you'll be arrested. What is happening?",
      options: [
        "A genuine legal notice you must act on",
        "A billing error you should settle by phone",
        "A courtesy reminder",
        "A scam — government agencies contact you by mail and never demand instant payment",
      ],
      correctIndex: 3,
      explanation:
        "Real agencies send written notices, allow time to respond, and never threaten immediate arrest or demand gift cards and wire transfers.",
    },
    {
      question:
        "You get a message: \"Grandma, it's me. I'm in trouble and need money. Please don't tell Mom.\" What should you do?",
      options: [
        "Send the money quickly — they sound scared",
        "Reply and ask for their bank details",
        "Call your grandchild on the number you already have, and check with family",
        "Send a smaller amount, just in case",
      ],
      correctIndex: 2,
      explanation:
        "This is a common scam, and AI can now imitate a loved one's voice. Verifying through a number you already know, and talking to family, exposes it immediately.",
    },
    {
      question:
        "You ask an AI assistant a question and it gives a confident, detailed answer. How much should you trust it?",
      options: [
        "Treat it as a helpful starting point and confirm anything important",
        "Completely — AI doesn't make mistakes",
        "Not at all — AI is never useful",
        "Trust it only if the answer is long",
      ],
      correctIndex: 0,
      explanation:
        "AI can sound completely certain while being wrong. It's genuinely useful for explaining and drafting, but check facts that affect your health, money, or safety.",
    },
    {
      question:
        "Why is it a problem to use the same password for several accounts?",
      options: [
        "It uses more storage on your device",
        "Websites will charge you more",
        "If one account is broken into, all the others are exposed too",
        "It makes your internet slower",
      ],
      correctIndex: 2,
      explanation:
        "Criminals take a password stolen from one site and try it everywhere else. A password manager lets you keep a different one for each account without memorizing them.",
    },
    {
      question:
        "You receive an unexpected email with an attachment you weren't expecting. What's the safest action?",
      options: [
        "Open it to see what it is",
        "Open it only if the file is small",
        "Forward it to a friend to open first",
        "Don't open it, and confirm with the sender through a method you already trust",
      ],
      correctIndex: 3,
      explanation:
        "Attachments can install harmful software. A link or attachment is an invitation, not a command — you can always check before accepting it.",
    },
    {
      question:
        "A friend tells you they just clicked a suspicious link and shared some information. What is the most helpful response?",
      options: [
        "Tell them they should have known better",
        "Tell them to ignore it and hope nothing happens",
        "Stay calm, help them change affected passwords and contact their bank, and reassure them it happens to many people",
        "Tell them to stop using the internet entirely",
      ],
      correctIndex: 2,
      explanation:
        "Shame keeps people silent, which makes things worse. Calm, practical help — secure the accounts, contact the bank, report it — is what actually limits the harm.",
    },
  ],
  results: [
    {
      minScore: 20,
      title: "Everwise Master",
      xp: 250,
      trophy: true,
      message:
        "A perfect score. You've shown real command of everything Everwise teaches — from everyday digital skills to spotting the most convincing scams.",
    },
    {
      minScore: 16,
      title: "Everwise Graduate",
      xp: 200,
      trophy: true,
      message:
        "Congratulations — you've completed the whole Everwise journey. You have the knowledge to use the internet confidently and to help the people around you stay safe too.",
    },
    {
      minScore: 12,
      title: "Almost There",
      xp: 60,
      trophy: false,
      message:
        "You're close. Look back over the topics you missed, then take the final test again — there's no limit on attempts.",
    },
    {
      minScore: 0,
      title: "Review Recommended",
      xp: 0,
      trophy: false,
      message:
        "Take your time and revisit the phases covering the questions you missed. Everything you need is still there on your path, and you can retake this whenever you're ready.",
    },
  ],
};

export default finalExam;
