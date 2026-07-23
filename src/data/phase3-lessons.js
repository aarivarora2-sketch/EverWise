// Everwise - Digital Literacy Track
// Phase 3: Communication
// Biome: Coast | Color: #4A6FA5
//
// All lessons exactly as written by the team.
// NOTE: Phase 3 ends with a Final Exam (see phase3Exam export at the bottom).

export const phase3Lessons = [
  // ============================================================
  // LESSON 3.1
  // ============================================================
  {
    id: "safe-texting",
    track: "literacy",
    phase: 3,
    order: 19,
    lessonNumber: "3.1",
    title: "Safe Texting",
    badge: "Smart Texter",
    xp: 20,
    goals: [
      "Explain what text messages (SMS) are.",
      "Recognize common text message scams.",
      "Identify suspicious links and requests.",
      "Know how to respond safely to unexpected messages."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What is Texting?",
        text: "Texting is one of the easiest ways to stay connected with family and friends. You can use it to say hello, share photos, share your location with trusted people, and keep in touch every day.",
        footer: "Remember: only text people you know. Be careful with messages from unknown numbers."
      },
      {
        type: "learn",
        heading: "Understanding the Screen",
        text: "Every texting app has the same basic parts:",
        bullets: [
          "Contact Name - the person you're texting",
          "Message Bubbles - each bubble is one text message",
          "Text Box - where you type your message",
          "Send Button - sends your message",
          "Emoji Button - adds smiley faces and other emojis",
          "Attachment Button - lets you send photos, files, or your location"
        ]
      },
      {
        type: "learn",
        heading: "What Do \"Sent,\" \"Delivered,\" and \"Read\" Mean?",
        text: "When you send a text, you may see a small word underneath it.",
        bullets: [
          "Sending - your phone is working to send the message",
          "Sent - your message left your phone",
          "Delivered - their phone received it, but they may not have opened it yet",
          "Read - the person has opened and read your message (if they have Read Receipts turned on)"
        ],
        footer: "Not everyone shares read receipts. If you don't see \"Read,\" it doesn't mean they are ignoring you."
      },
      {
        type: "learn",
        heading: "Blue vs. Green Text Bubbles (iPhone)",
        text: "A blue bubble means you're texting another iPhone user. The message is sent using iMessage, through the internet, and you may see Delivered or Read underneath.\n\nA green bubble means the message is sent as a regular text (SMS/MMS). The other person may have an Android phone, or iMessage may not be available. You usually won't see Read receipts.\n\nBoth blue and green messages work. The color does not mean one is better than the other."
      },
      {
        type: "match",
        title: "What Does It Mean?",
        pairs: [
          { word: "Sent", match: "Left your phone" },
          { word: "Delivered", match: "Arrived on their phone" },
          { word: "Read", match: "They opened the message" },
          { word: "Blue Bubble", match: "iMessage between Apple devices" },
          { word: "Green Bubble", match: "Regular text message (SMS/MMS)" }
        ]
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Don't worry if someone doesn't reply right away. A message marked Delivered or Read doesn't mean the person is available to respond immediately. They may be driving, busy, or simply waiting until later to reply."
      },
      {
        type: "learn",
        heading: "Not Every Text Message Is Real",
        text: "Unfortunately, scammers also send text messages. Their goal is often to steal money, passwords, credit card numbers, or personal information. Scam texts often try to make you panic or act quickly."
      },
      {
        type: "learn",
        heading: "The S.T.O.P. Method",
        text: "Pause before responding to any unexpected message.",
        bullets: [
          "S - Stop. Don't rush or click any links.",
          "T - Think. Does this message make sense? Were you expecting it?",
          "O - Observe. Look for warning signs like urgency, strange links, requests for money, or spelling mistakes.",
          "P - Protect. If you're unsure, delete the message or contact the company or person using a trusted phone number or official website, not the information in the text."
        ]
      },
      {
        type: "learn",
        heading: "Common Scam Text Messages",
        text: "Examples include:",
        bullets: [
          "\"Your package couldn't be delivered. Click here.\"",
          "\"Your bank account has been locked. Verify now.\"",
          "\"Congratulations! You won a free iPhone!\"",
          "\"You owe unpaid toll fees. Pay immediately.\"",
          "\"The IRS is texting you about unpaid taxes.\""
        ],
        footer: "These messages often include a link that asks you to click."
      },
      {
        type: "multiselect",
        title: "Which Text Messages Look Suspicious?",
        prompt: "Tap every message that seems suspicious.",
        options: [
          { text: "\"Congratulations! You won a free vacation. Click here to claim it.\"", correct: true },
          { text: "\"Your bank account is locked. Verify your information now.\"", correct: true },
          { text: "\"Unpaid toll detected. Pay immediately using this link.\"", correct: true },
          { text: "\"Package delivery failed. Click here to reschedule.\"", correct: true },
          { text: "\"Hi Grandma! Are we still having lunch tomorrow?\"", correct: false },
          { text: "\"Your dentist appointment is tomorrow at 2:00 PM.\"", correct: false },
          { text: "\"Can you pick up milk on your way home?\"", correct: false }
        ],
        feedback: "Excellent! Messages that create urgency or ask you to click links unexpectedly are common scam tactics.",
        incorrectFeedback: "Not quite. Legitimate businesses usually won't pressure you to click a link immediately or ask for sensitive information by text."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Text Message (SMS)", back: "A short message sent between phones." },
          { front: "Scam Text", back: "A fake text message that tries to steal money or personal information." },
          { front: "Suspicious Link", back: "A web link that may lead to a fake or unsafe website." },
          { front: "Verification Code", back: "A temporary code used to confirm it's really you signing in." },
          { front: "Unknown Sender", back: "Someone you don't recognize or weren't expecting to hear from." }
        ]
      },
      {
        type: "match",
        title: "Match the Message",
        pairs: [
          { word: "\"You won a prize!\"", match: "Don't click the link" },
          { word: "Unknown sender", match: "Be cautious" },
          { word: "Bank alert", match: "Verify using the official app or website" },
          { word: "Package problem", match: "Check the shipping company directly" },
          { word: "Verification code", match: "Only use it if you requested it" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Link", "Official", "Scam", "Unknown"],
        questions: [
          { text: "If you receive a suspicious text, don't click the ______.", answer: "Link" },
          { text: "If you're unsure whether a text is real, contact the company using its ______ website or app.", answer: "Official" },
          { text: "A fake text designed to steal information is called a ______.", answer: "Scam" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret receives this text: \"FedEx: Your package could not be delivered. Click here immediately to avoid a return fee.\" She isn't expecting a package. What should she do?",
        options: [
          "Click the link.",
          "Reply with her address.",
          "Ignore the link and check directly with the shipping company if she has concerns.",
          "Send the message to friends."
        ],
        correctIndex: 2,
        explanation: "If you're not expecting a package, this message may be a scam. Checking with the shipping company directly is safer."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert receives a text that says: \"Your bank account has been frozen. Click here to unlock it.\" What should he do?",
        options: [
          "Click the link immediately.",
          "Reply with his password.",
          "Open his bank's official app or call the bank using the phone number on the back of his debit or credit card.",
          "Send the text to his family."
        ],
        correctIndex: 2,
        explanation: "Always contact your bank using trusted contact information, not the link in the text."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda receives a text from her granddaughter: \"Hi Grandma! Can you call me when you have time?\" She recognizes the phone number. What should she do?",
        options: [
          "Call or reply if she wants to.",
          "Report it as spam.",
          "Delete the message immediately.",
          "Give her banking password."
        ],
        correctIndex: 0,
        explanation: "This is a normal conversation with someone she knows. Not every text is a scam."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "STOP before you tap a link. Ask yourself: Was I expecting this message? Does the sender make sense? Is the message creating pressure or fear? Can I check another way? If something feels wrong, pause and verify first."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          {
            label: "Safer Choices",
            items: [
              "Verify messages through official websites or apps",
              "Delete obvious scam texts",
              "Be cautious with unknown numbers",
              "Keep personal information private"
            ]
          },
          {
            label: "Risky Choices",
            items: [
              "Click every link you receive",
              "Reply with passwords or verification codes",
              "Trust messages just because they use a company logo",
              "Feel pressured to act immediately"
            ]
          }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You receive: \"Congratulations! You've won a $500 gift card!\"",
        options: [
          "Click the link.",
          "Reply with your address.",
          "Ignore or delete the message unless you know it's legitimate.",
          "Send your bank information."
        ],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You receive a text asking you to confirm your Social Security number.",
        options: [
          "Reply with the number.",
          "Call the number in the text.",
          "Do not reply. Contact the organization through its official website or phone number if needed.",
          "Share the message online."
        ],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "A friend sends you a link to funny photos. You weren't expecting it. What should you do?",
        options: [
          "Click it immediately.",
          "If it seems unusual, ask your friend if they really sent it before opening the link.",
          "Forward it to everyone.",
          "Enter your password."
        ],
        correctIndex: 1
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You receive a text with a verification code, but you didn't request one.",
        options: [
          "Share it with whoever asks.",
          "Reply to the text.",
          "Do not share the code. If you're concerned, check your account security.",
          "Post the code on social media."
        ],
        correctIndex: 2
      },
      {
        type: "learn",
        heading: "Remember",
        text: "Safe texting habits include: think before you click, verify unexpected messages, use official apps and websites, and never share passwords or verification codes by text. Scammers often create urgency. Legitimate organizations generally won't ask for sensitive information through unexpected text messages."
      }
    ],
    quiz: [
      { question: "What is a text message (SMS)?", options: ["A phone call", "A short message sent between phones", "A social media post", "An email"], correctIndex: 1 },
      { question: "Which is a common scam text?", options: ["\"Dinner at 6 tonight.\"", "\"Your bank account is locked. Click here.\"", "\"Happy birthday!\""], correctIndex: 1 },
      { question: "True or False: If a text creates urgency and asks you to click a link, you should stop and think before clicking.", options: ["False", "True"], correctIndex: 1 },
      { question: "If you're unsure about a text from a company, contact them using their ______ website or app.", options: ["Official", "Password", "Camera"], correctIndex: 0 },
      { question: "A text says you won a prize you never entered. What should you do?", options: ["Click the link.", "Reply with your information.", "Ignore or delete the message unless you can verify it's legitimate.", "Send money to claim it."], correctIndex: 2 },
      { question: "Which information should you never send in response to an unexpected text?", options: ["Your favorite color", "Passwords, verification codes, Social Security numbers, and bank account information"], correctIndex: 1 },
      { question: "A message from your granddaughter asking about dinner arrives from her usual phone number. What should you do?", options: ["Assume it's a scam automatically.", "Reply or call if you want to, since you recognize the sender.", "Report her as spam.", "Send your banking password."], correctIndex: 1 },
      { question: "If you're unsure whether a text is real, what's the safest next step?", options: ["Click the link to check.", "Reply asking if it's a scam.", "Contact the company using its official website, app, or phone number.", "Ignore every text forever."], correctIndex: 2 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 1: Safe Texting!",
      learned: [
        "Recognize common text message scams.",
        "Avoid suspicious links.",
        "Verify messages safely.",
        "Communicate confidently through text."
      ],
      next: "Video Calls"
    }
  },

  // ============================================================
  // LESSON 3.2
  // ============================================================
  {
    id: "video-calls",
    track: "literacy",
    phase: 3,
    order: 20,
    lessonNumber: "3.2",
    title: "Video Calls",
    badge: "Video Call Pro",
    xp: 20,
    goals: [
      "Explain what a video call is.",
      "Join a video call safely.",
      "Turn the camera and microphone on or off.",
      "Recognize fake meeting invitations.",
      "Know basic video call etiquette."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Is a Video Call?",
        text: "A video call lets you see and talk to another person over the internet. People use video calls to talk with family and friends, meet with doctors (telehealth), attend meetings, take online classes, and join community or religious groups.",
        bullets: ["Zoom", "FaceTime", "Google Meet", "Microsoft Teams"]
      },
      {
        type: "learn",
        heading: "Camera and Microphone",
        text: "During a video call, you can choose whether people can see you (Camera) or hear you (Microphone). Most apps let you turn both on or off at any time.\n\nCamera Off: people can hear you, but cannot see you.\nMicrophone Muted: people can see you, but cannot hear you."
      },
      {
        type: "learn",
        heading: "Joining a Video Call Safely",
        text: "Before joining:",
        bullets: [
          "Make sure you know who invited you",
          "Double-check the meeting link",
          "Join from the official app if possible",
          "If you're unsure, contact the organizer first"
        ],
        footer: "Avoid joining meetings from unexpected links sent by strangers."
      },
      {
        type: "learn",
        heading: "Watch Out for Fake Meeting Invitations",
        text: "Scammers sometimes send fake invitations that say things like \"Your doctor's appointment has moved. Click here\" or \"Your bank wants to meet with you. Join now.\"\n\nBefore clicking, ask: Were you expecting this meeting? Do you recognize the sender? Can you confirm another way? If something feels suspicious, don't click the link."
      },
      {
        type: "multiselect",
        title: "Which Invitations Look Safe?",
        prompt: "Tap every invitation that seems trustworthy.",
        options: [
          { text: "Your daughter sends a FaceTime invitation you were expecting.", correct: true },
          { text: "Your doctor's office emails a Zoom link after you scheduled an appointment.", correct: true },
          { text: "Your community center sends its weekly meeting link.", correct: true },
          { text: "A stranger texts, \"Click here to join your bank meeting.\"", correct: false },
          { text: "An unknown email says, \"Urgent! Join immediately.\"", correct: false },
          { text: "Someone you don't know invites you to a meeting with a cash prize.", correct: false }
        ],
        feedback: "Excellent! Trusted invitations come from people or organizations you know and were expecting."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Video Call", back: "A conversation where people can see and hear each other using the internet." },
          { front: "Camera", back: "Lets others see you during a video call." },
          { front: "Microphone", back: "Lets others hear your voice." },
          { front: "Mute", back: "Turns your microphone off so others cannot hear you." },
          { front: "Meeting Link", back: "A web link used to join a video call." }
        ]
      },
      {
        type: "match",
        title: "Match the Feature",
        pairs: [
          { word: "Camera", match: "Lets others see you" },
          { word: "Microphone", match: "Lets others hear you" },
          { word: "Mute", match: "Turns your microphone off" },
          { word: "Meeting Link", match: "Opens a video meeting" },
          { word: "Video Call", match: "Lets people talk face-to-face online" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Mute", "Camera", "Meeting", "Microphone"],
        questions: [
          { text: "If you don't want people to hear you, press ______.", answer: "Mute" },
          { text: "The ______ lets other people see you.", answer: "Camera" },
          { text: "A video call invitation usually contains a ______ link.", answer: "Meeting" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret receives a Zoom invitation from her doctor's office after scheduling an appointment. What should she do?",
        options: [
          "Join using the official Zoom link she expected.",
          "Ignore it forever.",
          "Send her Social Security number first.",
          "Forward the meeting to strangers."
        ],
        correctIndex: 0,
        explanation: "This matches an appointment she expected."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert receives this text: \"URGENT! Your bank meeting starts now! Click here!\" He wasn't expecting any meeting. What should he do?",
        options: [
          "Click immediately.",
          "Enter his banking password.",
          "Ignore the link and contact the bank through its official phone number or app if he has concerns.",
          "Forward the message to everyone."
        ],
        correctIndex: 2,
        explanation: "Banks generally don't invite customers to unexpected meetings by text message."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda joins a family video call. Everyone is talking at once. What's the best thing to do?",
        options: [
          "Leave immediately.",
          "Shout louder.",
          "Mute your microphone when you're not speaking and unmute when it's your turn.",
          "Turn off everyone's camera."
        ],
        correctIndex: 2,
        explanation: "Muting when you're not speaking helps reduce background noise and makes it easier for everyone to hear."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Before joining any video call, ask: Is this a meeting I expected? Do I recognize who sent the invitation? Is the link from a trusted source? Am I comfortable joining? If you're unsure, call the person or organization using a trusted phone number to confirm."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          {
            label: "Safer Choices",
            items: [
              "Join meetings you were expecting",
              "Mute your microphone when you're not talking",
              "Confirm unexpected invitations before joining",
              "Join through the official app when possible"
            ]
          },
          {
            label: "Less Safe Choices",
            items: [
              "Click every meeting link you receive",
              "Share meeting passwords publicly",
              "Leave your microphone on with lots of background noise",
              "Join meetings from strangers"
            ]
          }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You receive an email with a Zoom link from someone you don't know.",
        options: [
          "Join immediately.",
          "Reply with your personal information.",
          "Don't join unless you can verify who sent it and why.",
          "Forward it to your contacts."
        ],
        correctIndex: 2,
        explanation: "Unknown meeting invitations should be verified before you join."
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "Your dog starts barking loudly during a video call. What should you do?",
        options: [
          "Keep talking over the noise.",
          "Mute your microphone until the barking stops.",
          "End the call forever.",
          "Turn off your internet."
        ],
        correctIndex: 1,
        explanation: "Muting helps everyone hear the conversation without background noise."
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You accidentally turned your camera off. What happens?",
        options: [
          "The meeting ends.",
          "Your internet disconnects.",
          "People can still hear you (if you're not muted), but they can't see you.",
          "Everyone else is removed from the meeting."
        ],
        correctIndex: 2,
        explanation: "Turning off your camera only stops others from seeing you. Your microphone still works unless it's muted."
      },
      {
        type: "learn",
        heading: "Remember",
        text: "Video calls are a great way to stay connected. Join meetings you expect, verify unexpected invitations, use the mute button when you're not speaking, and turn your camera on or off whenever you're comfortable. Never click suspicious meeting links, share meeting passwords publicly, or give personal information to someone just because they're on a video call."
      }
    ],
    quiz: [
      { question: "What is a video call?", options: ["A text message.", "An email.", "A conversation where people can see and hear each other over the internet.", "A password manager."], correctIndex: 2 },
      { question: "Which are good video call habits?", options: ["Joining every link you get", "Muting when not speaking, verifying invitations, joining from trusted people, and using the official app"], correctIndex: 1 },
      { question: "True or False: You should join every meeting link you receive.", options: ["True", "False"], correctIndex: 1 },
      { question: "If you don't want others to hear you, press ______.", options: ["Mute", "Speaker", "Photo"], correctIndex: 0 },
      { question: "Your camera is turned off. What happens?", options: ["The call ends.", "People can't hear you.", "People can't see you, but they can still hear you if your microphone isn't muted.", "Your phone turns off."], correctIndex: 2 },
      { question: "You receive an unexpected video meeting invitation from someone you don't know. What should you do?", options: ["Join immediately.", "Reply with your password.", "Verify who sent it before joining, or ignore it if it seems suspicious.", "Share the meeting with friends."], correctIndex: 2 },
      { question: "What is the safest way to confirm an unexpected meeting invitation?", options: ["Click the link to see what happens.", "Reply with your Social Security number.", "Contact the person or organization using their official phone number, website, or app.", "Forward the invitation to everyone you know."], correctIndex: 2 },
      { question: "Which button turns your microphone off during a video call?", options: ["Camera", "End Call", "Mute", "Chat"], correctIndex: 2 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 2: Video Calls!",
      learned: [
        "Join video calls safely.",
        "Use your camera and microphone.",
        "Recognize suspicious meeting invitations.",
        "Practice good video call etiquette."
      ],
      next: "Email Basics"
    }
  },

  // ============================================================
  // LESSON 3.3
  // ============================================================
  {
    id: "email-basics",
    track: "literacy",
    phase: 3,
    order: 21,
    lessonNumber: "3.3",
    title: "Email Basics",
    badge: "Email Expert",
    xp: 20,
    goals: [
      "Explain what email is.",
      "Identify the parts of an email.",
      "Recognize phishing (fake) emails.",
      "Know when it is safe to open links and attachments.",
      "Organize their inbox safely."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Is Email?",
        text: "Email is a way to send and receive messages over the internet. People use email to talk with family and friends, receive messages from doctors, get shopping receipts, receive travel confirmations, communicate with businesses, and receive appointment reminders. Unlike text messages, emails are usually longer and can include files like photos or documents."
      },
      {
        type: "learn",
        heading: "Parts of an Email",
        text: "Every email has several important parts:",
        bullets: [
          "From - shows who sent the email",
          "Subject - a short title that explains what the email is about",
          "Message - the main content of the email",
          "Attachment - a file sent with the email (such as a PDF or photo)",
          "Link - a button or web address you can click to visit a website"
        ],
        footer: "Before clicking anything, always check who sent the email."
      },
      {
        type: "learn",
        heading: "What Is Phishing?",
        text: "Phishing is when scammers send fake emails pretending to be someone you trust. They may pretend to be your bank, UPS, FedEx, USPS, Amazon, the IRS, Medicare, or Netflix. The goal is often to trick you into giving away passwords, credit card numbers, Social Security numbers, or money."
      },
      {
        type: "learn",
        heading: "Warning Signs of a Phishing Email",
        text: "Watch for emails that:",
        bullets: [
          "Say \"Act immediately!\"",
          "Ask for passwords or personal information",
          "Contain spelling or grammar mistakes",
          "Come from strange email addresses",
          "Promise prizes you didn't enter to win",
          "Ask you to click a link right away"
        ],
        footer: "If something feels wrong, don't click. Verify first."
      },
      {
        type: "multiselect",
        title: "Which Emails Look Suspicious?",
        prompt: "Tap every email that seems suspicious.",
        options: [
          { text: "\"Your account will be deleted today! Click here immediately.\"", correct: true },
          { text: "\"Congratulations! You won $5,000!\"", correct: true },
          { text: "\"Verify your Social Security number now.\"", correct: true },
          { text: "\"Your password has expired. Enter it here.\"", correct: true },
          { text: "\"Your dentist appointment is tomorrow at 10:00 AM.\"", correct: false },
          { text: "\"Family Reunion Photos\"", correct: false },
          { text: "\"Your grocery pickup is ready.\"", correct: false }
        ],
        feedback: "Excellent! Scam emails often create urgency or ask for sensitive information."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Email", back: "A message sent over the internet." },
          { front: "Phishing", back: "A fake email that tries to steal your information." },
          { front: "Attachment", back: "A file sent with an email." },
          { front: "Subject Line", back: "The title of an email." },
          { front: "Sender", back: "The person or organization that sent the email." }
        ]
      },
      {
        type: "match",
        title: "Match the Email Part",
        pairs: [
          { word: "Sender", match: "Shows who sent the email" },
          { word: "Subject", match: "Tells what the email is about" },
          { word: "Attachment", match: "Adds a file" },
          { word: "Link", match: "Opens a website" },
          { word: "Message", match: "Contains the main information" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Sender", "Phishing", "Attachment", "Subject"],
        questions: [
          { text: "Before opening an email, check the ______.", answer: "Sender" },
          { text: "A fake email designed to steal information is called ______.", answer: "Phishing" },
          { text: "A PDF or photo sent with an email is called an ______.", answer: "Attachment" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret receives an email from amazon-support247@gmail.com. The subject says \"URGENT! Your Amazon account is locked.\" What should she do?",
        options: [
          "Click the link immediately.",
          "Reply with her password.",
          "Open the official Amazon app or type amazon.com into her browser to check her account instead.",
          "Send the email to all her friends."
        ],
        correctIndex: 2,
        explanation: "The sender's address looks suspicious. Scammers often use email addresses that look similar to real companies."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert receives an email from his doctor's office reminding him about an appointment he scheduled last week. Should he open it?",
        options: ["Yes", "No"],
        correctIndex: 0,
        explanation: "This is an expected email from a trusted source."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda receives an email with an attachment from someone she doesn't know. The message says \"Open immediately to receive your prize.\" What should she do?",
        options: [
          "Open the attachment.",
          "Reply asking for more prizes.",
          "Do not open the attachment. Delete or report the email if it seems suspicious.",
          "Forward it to family."
        ],
        correctIndex: 2,
        explanation: "Unexpected attachments can contain malware."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Before clicking a link or opening an attachment, ask yourself: Do I recognize the sender? Was I expecting this email? Is the sender's email address spelled correctly? Is the email asking for personal information? If you're unsure, go directly to the company's official website or app instead of using the email link."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          {
            label: "Safer Choices",
            items: [
              "Read the sender's email address carefully",
              "Delete suspicious emails",
              "Open attachments only from people you trust",
              "Visit companies through their official website or app"
            ]
          },
          {
            label: "Less Safe Choices",
            items: [
              "Click every email link",
              "Send passwords by email",
              "Open unexpected attachments",
              "Trust every email with a company logo"
            ]
          }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You receive an email saying \"You won a free cruise! Click here to claim your prize!\"",
        options: [
          "Click the link.",
          "Reply with your address.",
          "Ignore or delete the email unless you can verify it's legitimate.",
          "Enter your credit card information."
        ],
        correctIndex: 2,
        explanation: "Unexpected prizes are a common phishing scam."
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "Your bank emails you asking for your online banking password.",
        options: [
          "Send the password.",
          "Click the link.",
          "Do not reply with your password. Contact your bank using its official phone number or app if you have questions.",
          "Email your Social Security number instead."
        ],
        correctIndex: 2,
        explanation: "Legitimate banks generally do not ask for your password by email."
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You notice the sender's email is support-paypal@gmail.com and the email says it's from PayPal. What should you do?",
        options: [
          "Trust it because it says \"PayPal.\"",
          "Click the link.",
          "Be cautious. Check your PayPal account using the official app or website instead.",
          "Reply with your password."
        ],
        correctIndex: 2,
        explanation: "Scammers often use free email addresses to pretend they're a trusted company."
      },
      {
        type: "learn",
        heading: "Remember",
        text: "Good email habits include: check the sender, read the subject carefully, be cautious with links and attachments, and verify unexpected emails through official websites or apps. Never email your passwords, open unexpected attachments, or click links just because an email looks official."
      }
    ],
    quiz: [
      { question: "What is email?", options: ["A phone call.", "A text message only.", "A message sent over the internet.", "A search engine."], correctIndex: 2 },
      { question: "Which is a common sign of a phishing email?", options: ["It arrives on a Tuesday", "It creates urgency, asks for passwords, offers unexpected prizes, or comes from a strange sender address"], correctIndex: 1 },
      { question: "True or False: It's always safe to click links in emails because they have company logos.", options: ["True", "False"], correctIndex: 1 },
      { question: "A file sent with an email is called an ______.", options: ["Attachment", "Camera", "Keyboard"], correctIndex: 0 },
      { question: "An email asks for your online banking password. What should you do?", options: ["Reply with the password.", "Click the link and sign in.", "Do not send your password. Contact your bank through its official phone number or app if needed.", "Send your credit card number instead."], correctIndex: 2 },
      { question: "What should you check first before opening an email attachment?", options: ["The weather.", "Your battery level.", "Whether you recognize the sender and were expecting the attachment.", "The color of the email."], correctIndex: 2 },
      { question: "You receive an email from a company you use, but the sender's address looks unusual. What should you do?", options: ["Trust it because the logo looks real.", "Reply asking if it's fake.", "Don't use the email's links. Visit the company's official website or app to check your account.", "Send your personal information."], correctIndex: 2 },
      { question: "Which habits help keep your email safe?", options: ["Clicking everything quickly", "Checking the sender, opening attachments only when expected, verifying through official sites, and reporting phishing"], correctIndex: 1 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 3: Email Basics!",
      learned: [
        "Understand the parts of an email.",
        "Recognize phishing emails.",
        "Open attachments safely.",
        "Avoid dangerous links."
      ],
      next: "Blocking Numbers"
    }
  },

  // ============================================================
  // LESSON 3.4
  // ============================================================
  {
    id: "blocking-numbers",
    track: "literacy",
    phase: 3,
    order: 22,
    lessonNumber: "3.4",
    title: "Blocking Numbers",
    badge: "Call Control Expert",
    xp: 20,
    goals: [
      "Explain what blocking a phone number does.",
      "Know when it's appropriate to block a number.",
      "Understand what happens after a number is blocked.",
      "Differentiate between blocking, reporting spam, and deleting a message."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Does \"Block\" Mean?",
        text: "Blocking a phone number tells your phone that you no longer want to receive calls or text messages from that number. After you block someone, they usually cannot call you successfully, their text messages usually won't be delivered to you, and you stop receiving notifications from that number.\n\nBlocking can help reduce unwanted calls and messages, although it may not stop every spam call because scammers sometimes use different phone numbers."
      },
      {
        type: "learn",
        heading: "When Should You Block Someone?",
        text: "Blocking is a good choice if someone:",
        bullets: [
          "Keeps sending scam messages",
          "Calls repeatedly after you've ignored them",
          "Harasses or threatens you",
          "Continues contacting you after you've asked them to stop"
        ]
      },
      {
        type: "learn",
        heading: "When Should You NOT Block?",
        text: "You probably shouldn't block family members, your doctor's office, your bank (if you've confirmed the number is legitimate), emergency contacts, or businesses you regularly use.\n\nIf you're unsure who is calling, let the call go to voicemail. If it's important, the caller will often leave a message."
      },
      {
        type: "learn",
        heading: "Blocking vs. Deleting vs. Reporting",
        text: "These actions are different.",
        bullets: [
          "Block - stops future calls and texts from that number",
          "Delete - removes the message from your phone, but the sender can still contact you later",
          "Report Spam - tells your phone carrier or messaging app that the message may be spam"
        ],
        footer: "Many phones let you Report Spam and Block at the same time."
      },
      {
        type: "multiselect",
        title: "Which Numbers Would You Block?",
        prompt: "Tap every number that would be reasonable to block.",
        options: [
          { text: "A number sending fake lottery messages every day", correct: true },
          { text: "A robocaller calling five times a day", correct: true },
          { text: "Someone repeatedly asking for your banking password", correct: true },
          { text: "A stranger sending threatening messages", correct: true },
          { text: "Your daughter", correct: false },
          { text: "Your doctor's office", correct: false },
          { text: "Your pharmacy", correct: false }
        ],
        feedback: "Excellent! Blocking is helpful for unwanted or scam contacts, not trusted people."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Block", back: "Stops future calls and texts from a specific number." },
          { front: "Spam", back: "Unwanted or fraudulent messages." },
          { front: "Robocall", back: "An automated phone call, often used for advertising or scams." },
          { front: "Voicemail", back: "A recorded message someone leaves if you don't answer." },
          { front: "Report Spam", back: "Reports suspicious messages to help reduce spam." }
        ]
      },
      {
        type: "match",
        title: "Match the Action",
        pairs: [
          { word: "Block", match: "Stops future calls and texts" },
          { word: "Delete", match: "Removes the message from your phone" },
          { word: "Report Spam", match: "Reports suspicious messages" },
          { word: "Voicemail", match: "Lets callers leave a message" },
          { word: "Unknown Number", match: "May need extra caution" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Block", "Delete", "Voicemail", "Spam"],
        questions: [
          { text: "If someone keeps sending scam texts, you can ______ their number.", answer: "Block" },
          { text: "Removing a text from your phone is called ______.", answer: "Delete" },
          { text: "If you don't answer a call, the caller may leave a ______.", answer: "Voicemail" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret receives six scam texts in one week from the same phone number saying \"You've won a prize! Click here!\" What should she do?",
        options: [
          "Reply \"Stop.\"",
          "Click the link.",
          "Block the number and report the messages as spam.",
          "Send them her address."
        ],
        correctIndex: 2,
        explanation: "Replying to scam texts can sometimes confirm your number is active. It's usually better to block and report them."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert misses a call from an unknown number. The caller leaves a voicemail saying \"Hello Robert, this is Dr. Smith's office confirming tomorrow's appointment.\" What should he do?",
        options: [
          "Listen to the voicemail and, if needed, call the doctor's office using a number he already knows.",
          "Block the number immediately.",
          "Report the doctor's office as spam.",
          "Delete the voicemail without listening."
        ],
        correctIndex: 0,
        explanation: "Not every unknown number is a scam. Voicemail can help you decide whether a call is legitimate."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda keeps receiving robocalls selling products. The same number calls every afternoon. What should she do?",
        options: [
          "Keep answering every call.",
          "Give them her credit card number.",
          "Block the number. If her phone offers it, report it as spam too.",
          "Call the number back repeatedly."
        ],
        correctIndex: 2,
        explanation: "There's usually no benefit to answering repeated robocalls. Blocking is a good option."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Before you block, ask yourself: Is this someone I know? Have they left a legitimate voicemail? Is this a repeated scam or unwanted contact? If the answer is yes to the last question, blocking is often the right choice."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          {
            label: "Safer Choices",
            items: [
              "Block repeated scam numbers",
              "Listen to legitimate voicemails",
              "Report spam when your phone gives you the option",
              "Block someone who continues harassing you"
            ]
          },
          {
            label: "Less Safe Choices",
            items: [
              "Reply to scam texts",
              "Give scammers personal information",
              "Block your doctor's office without checking",
              "Answer every robocall"
            ]
          }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "An unknown number calls once but leaves no voicemail.",
        options: [
          "Block it immediately.",
          "Wait to see if they call again or leave a voicemail before deciding.",
          "Send them your address.",
          "Call back and give your Social Security number."
        ],
        correctIndex: 1,
        explanation: "One missed call isn't always a scam. Waiting for a voicemail or repeated pattern can help you decide."
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "A family member accidentally calls several times while trying to reach you.",
        options: [
          "Block them.",
          "Call or text them back if you'd like.",
          "Report them as spam.",
          "Delete their contact."
        ],
        correctIndex: 1
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "Someone keeps sending threatening messages. What should you do?",
        options: [
          "Continue responding.",
          "Give them more personal information.",
          "Block the number. If you ever feel you're in immediate danger or receive credible threats, contact your local law enforcement.",
          "Send them money."
        ],
        correctIndex: 2
      },
      {
        type: "learn",
        heading: "Remember",
        text: "Blocking helps stop future calls and texts from a specific number. Block scam callers, repeated robocalls, and people who harass you. Report spam when possible. Deleting a message is not the same as blocking the sender, and blocking one scam number doesn't stop scammers from using new numbers, so continue to stay alert."
      }
    ],
    quiz: [
      { question: "What does blocking a phone number do?", options: ["Deletes every contact on your phone.", "Turns off your phone.", "Stops future calls and texts from that number.", "Changes your phone number."], correctIndex: 2 },
      { question: "Which numbers might be appropriate to block?", options: ["Your pharmacy", "Repeated scam callers, robocalls, and people sending threatening messages"], correctIndex: 1 },
      { question: "True or False: Deleting a text message also blocks the sender.", options: ["True", "False"], correctIndex: 1 },
      { question: "If you don't answer a call, the caller may leave a ______.", options: ["Voicemail", "Camera", "Battery"], correctIndex: 0 },
      { question: "An unknown caller leaves a voicemail confirming your doctor's appointment. What should you do?", options: ["Block the number immediately.", "Report it as spam.", "Listen to the voicemail and confirm by contacting your doctor's office using a trusted phone number.", "Ignore all future calls."], correctIndex: 2 },
      { question: "What is one advantage of reporting spam?", options: ["It charges the caller money.", "It changes your phone number.", "It helps your phone carrier or messaging app identify unwanted messages.", "It automatically deletes all messages forever."], correctIndex: 2 },
      { question: "You receive repeated scam texts from the same number. What's the best response?", options: ["Reply with your password.", "Keep clicking the links.", "Block the number and report it as spam if possible.", "Save the number as a contact."], correctIndex: 2 },
      { question: "If you're unsure whether a caller is legitimate, what is a good first step?", options: ["Give them your credit card number.", "Block them immediately without listening.", "Let the call go to voicemail and listen to the message before deciding what to do.", "Answer every call no matter what."], correctIndex: 2 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 4: Blocking Numbers!",
      learned: [
        "Block unwanted callers and texters.",
        "Understand the difference between blocking, deleting, and reporting spam.",
        "Use voicemail to help identify legitimate callers.",
        "Protect yourself from repeated scam calls and messages."
      ],
      next: "Reporting Spam"
    }
  },

  // ============================================================
  // LESSON 3.5
  // ============================================================
  {
    id: "reporting-spam",
    track: "literacy",
    phase: 3,
    order: 23,
    lessonNumber: "3.5",
    title: "Reporting Spam",
    badge: "Spam Stopper",
    xp: 20,
    goals: [
      "Explain what spam is.",
      "Recognize spam calls, texts, and emails.",
      "Know how to report spam.",
      "Understand why reporting spam helps protect others.",
      "Know what to do after reporting spam."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Is Spam?",
        text: "Spam is an unwanted message or call. Spam can arrive as emails, text messages, phone calls, or social media messages.\n\nSome spam is simply annoying advertisements. Other spam is designed to steal money, steal passwords, steal personal information, or install harmful software (malware). Reporting spam helps phone companies and email providers identify and reduce these unwanted messages."
      },
      {
        type: "learn",
        heading: "How Can You Recognize Spam?",
        text: "Common warning signs include:",
        bullets: [
          "You weren't expecting the message",
          "It says you won a prize you never entered",
          "It creates urgency like \"Act now!\"",
          "It asks for personal or financial information",
          "It contains suspicious links",
          "The sender's information looks strange or unfamiliar"
        ],
        footer: "If you're unsure, pause before responding."
      },
      {
        type: "learn",
        heading: "How to Report Spam",
        text: "Many phones and email apps include a Report Spam or Report Junk button. When you report spam, the message may be sent to your phone carrier or email provider for review, the sender may also be blocked depending on your device, and reporting helps improve spam filters for everyone.\n\nReporting spam doesn't guarantee you'll never hear from that scammer again. Scammers often use new phone numbers and email addresses."
      },
      {
        type: "learn",
        heading: "What About Spam Calls?",
        text: "If you receive a spam call:",
        bullets: [
          "Let it go to voicemail if you don't recognize the number",
          "Hang up if the caller asks for personal information or pressures you",
          "Block the number if the calls continue",
          "Report the number as spam if your phone offers that option"
        ],
        footer: "Never feel obligated to stay on the phone with a suspicious caller."
      },
      {
        type: "multiselect",
        title: "Which Messages Should You Report as Spam?",
        prompt: "Tap every message that should probably be reported.",
        options: [
          { text: "\"Congratulations! You've won $10,000!\"", correct: true },
          { text: "\"Your Social Security number has been suspended. Click here.\"", correct: true },
          { text: "\"Pay this overdue toll immediately.\"", correct: true },
          { text: "\"Verify your banking password.\"", correct: true },
          { text: "\"Your eye doctor's appointment is tomorrow.\"", correct: false },
          { text: "\"Happy Birthday! Love, Sarah.\"", correct: false },
          { text: "\"Dinner is at 6 tonight.\"", correct: false }
        ],
        feedback: "Excellent! Messages asking for personal information or creating fake emergencies are common spam."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Spam", back: "An unwanted message or call." },
          { front: "Report Spam", back: "Marks a message as unwanted or suspicious." },
          { front: "Spam Filter", back: "A tool that helps move unwanted messages out of your inbox." },
          { front: "Scam Call", back: "A phone call that tries to steal money or information." },
          { front: "Junk Email", back: "Another name for spam email." }
        ]
      },
      {
        type: "match",
        title: "Match the Term",
        pairs: [
          { word: "Spam", match: "Unwanted message" },
          { word: "Report Spam", match: "Marks a message as suspicious" },
          { word: "Spam Filter", match: "Helps block unwanted messages" },
          { word: "Scam Call", match: "Fraudulent phone call" },
          { word: "Junk Email", match: "Spam email" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Spam", "Report", "Filter", "Block"],
        questions: [
          { text: "An unwanted text or email is called ______.", answer: "Spam" },
          { text: "Many email apps have a ______ Spam button.", answer: "Report" },
          { text: "A spam ______ helps move unwanted emails out of your inbox.", answer: "Filter" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret receives this text: \"You owe $6.99 in toll fees. Pay immediately or your license will be suspended.\" She hasn't driven on a toll road. What should she do?",
        options: [
          "Click the payment link.",
          "Reply with her credit card number.",
          "Report the text as spam, delete it, and visit the toll agency's official website herself if she has questions.",
          "Send the message to all her contacts."
        ],
        correctIndex: 2,
        explanation: "Going directly to the official website is much safer than using the link in the message."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert receives an email saying \"Your account will be closed today unless you verify your password.\" What should he do?",
        options: [
          "Reply with his password.",
          "Click the link immediately.",
          "Report it as spam or phishing, then check his account by going directly to the company's official website or app.",
          "Ignore it but forward it to everyone."
        ],
        correctIndex: 2,
        explanation: "Legitimate companies generally don't ask for passwords by email."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda answers a phone call. The caller says \"This is the IRS. You must pay immediately with gift cards.\" What should she do?",
        options: [
          "Buy the gift cards.",
          "Stay on the phone.",
          "Hang up. If she's concerned, she can contact the IRS using the official phone number from irs.gov.",
          "Give the caller her Social Security number."
        ],
        correctIndex: 2,
        explanation: "Government agencies don't demand immediate payment with gift cards."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Before reporting, ask yourself: Was I expecting this message? Does it ask for money or personal information? Is it creating urgency? Can I verify it another way? If several answers are yes, it's a good candidate to report as spam."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          {
            label: "Safer Choices",
            items: ["Report suspicious texts", "Report phishing emails", "Hang up on scam callers", "Delete spam after reporting it"]
          },
          {
            label: "Less Safe Choices",
            items: ["Reply to spam messages", "Click suspicious links", "Give out passwords or banking information", "Stay on the phone with a scammer"]
          }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "An unknown caller demands immediate payment using gift cards.",
        options: [
          "Stay on the phone.",
          "Give your payment information.",
          "Hang up and block the number if the calls continue.",
          "Drive to the nearest store to buy gift cards."
        ],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "Your email app asks: \"Report Spam?\" What happens?",
        options: [
          "Your computer is deleted.",
          "Your phone breaks.",
          "The message is marked as spam, helping improve spam filtering. It may also move to your Spam or Junk folder.",
          "Your contacts disappear."
        ],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You accidentally opened a spam email but didn't click any links or download attachments. What should you do?",
        options: [
          "Panic because your device is definitely infected.",
          "Reply to the scammer.",
          "Close the email, report it as spam if possible, and delete it. Simply opening an email usually isn't enough to infect your device.",
          "Send the email to your friends."
        ],
        correctIndex: 2,
        explanation: "The bigger risks usually come from clicking malicious links, downloading attachments, or entering personal information."
      },
      {
        type: "learn",
        heading: "Remember",
        text: "When you see spam: report it, delete it, block the sender if appropriate, and never share passwords or financial information. Don't click suspicious links, don't call phone numbers listed in suspicious messages, and don't respond just to tell scammers to stop."
      }
    ],
    quiz: [
      { question: "What is spam?", options: ["A trusted family message.", "A weather alert.", "An unwanted or suspicious message or call.", "A video call."], correctIndex: 2 },
      { question: "Which messages should you report?", options: ["Appointment reminders", "Prize scams, fake banking alerts, suspicious toll requests, and emails asking for passwords"], correctIndex: 1 },
      { question: "True or False: Reporting spam can help improve spam filters.", options: ["False", "True"], correctIndex: 1 },
      { question: "An unwanted message is often called ______.", options: ["Spam", "Photo", "Music"], correctIndex: 0 },
      { question: "A caller demands payment with gift cards. What should you do?", options: ["Buy the gift cards.", "Stay on the phone.", "Hang up immediately.", "Give them your credit card number."], correctIndex: 2 },
      { question: "You receive a suspicious email asking for your password. What should you do?", options: ["Reply with your password.", "Click the link.", "Report it as spam or phishing and visit the company's official website or app if you want to check your account.", "Forward it to your family."], correctIndex: 2 },
      { question: "What should you do after reporting a spam message?", options: ["Keep replying to it.", "Send it to your contacts.", "Delete it if you no longer need it.", "Give the sender your personal information."], correctIndex: 2 },
      { question: "You accidentally opened a spam email but didn't click anything. What is the best next step?", options: ["Assume your device is infected.", "Reply asking if it's a scam.", "Close the email, report it as spam if possible, and delete it.", "Enter your password to \"protect\" your account."], correctIndex: 2 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 5: Reporting Spam!",
      learned: [
        "Recognize spam messages and calls.",
        "Report spam on your phone or email.",
        "Handle suspicious messages safely.",
        "Avoid responding to scammers."
      ],
      next: "Sharing Photos Safely"
    }
  },

  // ============================================================
  // LESSON 3.6
  // ============================================================
  {
    id: "sharing-photos",
    track: "literacy",
    phase: 3,
    order: 24,
    lessonNumber: "3.6",
    title: "Sharing Photos Safely",
    badge: "Photo Privacy Protector",
    xp: 20,
    goals: [
      "Share photos safely with family and friends.",
      "Decide who should be able to see their photos.",
      "Recognize personal information that may appear in photos.",
      "Avoid common photo-sharing scams.",
      "Protect their privacy before posting pictures online."
    ],
    blocks: [
      {
        type: "learn",
        heading: "Why Do People Share Photos?",
        text: "Photos help us share memories and stay connected. People often share photos with family, for birthdays and celebrations, of pets, from vacations, and of children and grandchildren (with permission from parents or guardians). Sharing photos can be fun, but it's important to think about who can see them."
      },
      {
        type: "learn",
        heading: "Not Every Photo Should Be Public",
        text: "Some photos are fine to share with everyone. Others should only be shared with people you trust.\n\nGood to share: family gatherings, flowers, pets, birthday cake, nature.\n\nBe careful sharing: photos showing your home address, credit cards, prescription bottles, medical paperwork, boarding passes, driver's license or ID, mail with your address, or screenshots showing passwords or private messages.\n\nEven if you trust your friends, remember that online posts can sometimes be copied or shared by others."
      },
      {
        type: "learn",
        heading: "Who Can See Your Photos?",
        text: "Many apps let you choose who can see your pictures. You may be able to share with family only, friends only, specific people, or everyone (public). When possible, choose the smallest audience that fits your goal."
      },
      {
        type: "learn",
        heading: "Photo Scams",
        text: "Scammers sometimes use photos to trick people. Examples include fake giveaway posts, fake profiles using stolen pictures, someone asking you to send pictures of your ID or credit card, or someone requesting a photo of your debit card to \"verify\" your account.\n\nNever send photos of your driver's license, passport, Social Security card, credit or debit cards, or banking documents, unless you are using a trusted, secure process with an organization you know."
      },
      {
        type: "multiselect",
        title: "Which Photos Are Safe to Share Publicly?",
        prompt: "Tap every photo that is generally safe to post publicly.",
        options: [
          { text: "A picture of your dog playing in the park", correct: true },
          { text: "A sunset at the beach", correct: true },
          { text: "Flowers in your garden", correct: true },
          { text: "A homemade birthday cake", correct: true },
          { text: "A photo of your driver's license", correct: false },
          { text: "A picture of your credit card", correct: false },
          { text: "Mail showing your address", correct: false },
          { text: "Your prescription bottle", correct: false }
        ],
        feedback: "Excellent! Everyday photos of pets, nature, and celebrations are usually much safer to share than photos containing personal information."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Public Post", back: "A post that anyone can see." },
          { front: "Private Photo", back: "A photo shared only with selected people." },
          { front: "Personal Information", back: "Information that identifies you, such as your address or driver's license number." },
          { front: "Privacy Settings", back: "Controls who can see your posts and photos." },
          { front: "Photo Scam", back: "A scam that asks for pictures containing personal or financial information." }
        ]
      },
      {
        type: "match",
        title: "Match the Photo",
        pairs: [
          { word: "Picture of your dog", match: "Safe to share publicly" },
          { word: "Driver's license", match: "Keep private" },
          { word: "Family vacation photo", match: "Share with trusted people if you choose" },
          { word: "Credit card", match: "Never post online" },
          { word: "Flowers", match: "Safe to share publicly" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Privacy", "Credit Card", "Address", "Public"],
        questions: [
          { text: "Before posting online, check your ______ settings.", answer: "Privacy" },
          { text: "Never post a photo showing your ______.", answer: "Credit Card" },
          { text: "A picture showing your home ______ could put your privacy at risk.", answer: "Address" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret wants to post a picture of her new puppy on Facebook. The photo only shows the puppy playing in the yard. What should she do?",
        options: [
          "Share it if she's comfortable and chooses the audience she wants.",
          "Include a photo of her driver's license too.",
          "Post her full home address with the picture.",
          "Share her banking information in the comments."
        ],
        correctIndex: 0,
        explanation: "Sharing a pet photo is generally fine. Choosing who can see it adds another layer of privacy."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert receives this message: \"To claim your prize, send us a picture of your driver's license.\" What should he do?",
        options: [
          "Send the photo.",
          "Send a picture of his credit card too.",
          "Do not send photos of personal documents. Ignore or report the message if it appears to be a scam.",
          "Reply asking how many prizes he won."
        ],
        correctIndex: 2,
        explanation: "Legitimate giveaways generally don't ask for sensitive personal documents this way."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda takes a photo of her birthday cake. In the background is a letter showing her home address. What should she do?",
        options: [
          "Post it without looking.",
          "Zoom in on the address.",
          "Crop or retake the photo so the address isn't visible before sharing.",
          "Write her address in the caption too."
        ],
        correctIndex: 2,
        explanation: "Looking at the background before posting is a great habit."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Before you share a photo, ask yourself: Does it show my address? Does it show my credit card or ID? Does it show private paperwork? Am I comfortable with the people who will see it? If you're unsure, don't post it until you've checked carefully."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          {
            label: "Safer Choices",
            items: ["Review the background before posting", "Use privacy settings", "Share personal photos only with trusted people", "Crop out private information"]
          },
          {
            label: "Less Safe Choices",
            items: ["Post photos of your driver's license", "Share your credit card", "Post pictures showing your address", "Send personal documents to strangers online"]
          }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You notice your prescription bottle is visible in a picture you're about to post.",
        options: [
          "Ignore it.",
          "Zoom in on it.",
          "Retake or crop the photo before sharing.",
          "Write the medication name in the caption."
        ],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "Someone on social media you've never met asks you to send a picture of your driver's license to \"prove you're real.\"",
        options: [
          "Send it.",
          "Send your passport too.",
          "Do not send personal identification. Ignore, block, or report the account if it seems suspicious.",
          "Ask them for your bank account number."
        ],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You're posting a picture from your front yard. Your house number is clearly visible. What should you do?",
        options: [
          "Leave it exactly as it is.",
          "Add your street name in the caption.",
          "Crop or retake the picture so your house number isn't visible if you don't want to share that information.",
          "Tag your home location publicly."
        ],
        correctIndex: 2,
        explanation: "House numbers and addresses can reveal where you live."
      },
      {
        type: "learn",
        heading: "Remember",
        text: "Before sharing any photo: check the background, protect personal information, choose who can see your photo, and think before you post. Never share pictures of IDs, credit or debit cards, or medical documents publicly, and never feel pressured to send personal photos to strangers."
      }
    ],
    quiz: [
      { question: "What should you do before posting a photo online?", options: ["Post it immediately.", "Check whether it contains personal information.", "Send it to strangers first.", "Turn off your phone."], correctIndex: 1 },
      { question: "Which photos should generally not be shared publicly?", options: ["Photos of flowers", "Driver's license, credit card, mail showing your address, and prescription bottles"], correctIndex: 1 },
      { question: "True or False: It's a good idea to check the background of a photo before posting it.", options: ["False", "True"], correctIndex: 1 },
      { question: "Before posting online, review your ______ settings.", options: ["Privacy", "Battery", "Speaker"], correctIndex: 0 },
      { question: "Someone online asks you to send a picture of your driver's license to claim a prize. What should you do?", options: ["Send it.", "Send your passport too.", "Do not send personal identification. Ignore or report the request if it seems suspicious.", "Post it publicly."], correctIndex: 2 },
      { question: "Which sharing option usually gives you the most control?", options: ["Public", "Everyone", "Share only with trusted people or a specific audience.", "Anyone on the internet."], correctIndex: 2 },
      { question: "Why is it important to check the background of a photo?", options: ["To make the photo brighter.", "To count how many people are in it.", "It may accidentally reveal private information like your address or documents.", "It changes the weather."], correctIndex: 2 },
      { question: "Which habit helps protect your privacy when sharing photos?", options: ["Posting quickly", "Reviewing the picture, cropping out personal information, choosing who can see it, and thinking before posting"], correctIndex: 1 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 6: Sharing Photos Safely!",
      learned: [
        "Share photos more safely.",
        "Protect personal information in pictures.",
        "Check backgrounds before posting.",
        "Recognize photo-related scams."
      ],
      next: "Sharing Your Location"
    }
  },

  // ============================================================
  // LESSON 3.7
  // ============================================================
  {
    id: "sharing-location",
    track: "literacy",
    phase: 3,
    order: 25,
    lessonNumber: "3.7",
    title: "Sharing Your Location",
    badge: "Communication Champion",
    xp: 20,
    phaseBadge: true,
    goals: [
      "Explain what location sharing is.",
      "Know when it is appropriate to share their location.",
      "Understand the difference between sharing your location once and continuously.",
      "Safely stop location sharing.",
      "Recognize location-sharing scams."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Is Location Sharing?",
        text: "Location sharing allows your phone to tell another person where you are. Many apps let you share your location, including Messages, Find My (Apple), Google Maps, and family safety apps. Location sharing can be very helpful when used with people you trust."
      },
      {
        type: "learn",
        heading: "When Is It Helpful?",
        text: "Sharing your location can make life easier. Examples include:",
        bullets: [
          "Letting your family know you're on your way home",
          "Meeting friends at a park or event",
          "Helping family find you during an emergency",
          "Finding each other in a large parking lot"
        ]
      },
      {
        type: "learn",
        heading: "When Should You NOT Share?",
        text: "Never share your location with someone you just met online, a person asking for your address to claim a prize, someone pretending to be customer support, or anyone who makes you uncomfortable. Remember: you are always in control of your location."
      },
      {
        type: "learn",
        heading: "One-Time vs. Continuous Sharing",
        text: "Some apps let you choose how long to share your location.\n\nOne-Time Location: your location is shared once or for a short period. Example: \"I'll share my location while you come pick me up.\"\n\nContinuous Location Sharing: someone can see your location until you turn it off. This is useful for family members, caregivers (if you choose), and trusted friends during travel.\n\nReview who can see your location from time to time and stop sharing when you no longer need it."
      },
      {
        type: "multiselect",
        title: "Who Would You Share Your Location With?",
        prompt: "Tap everyone it would usually be appropriate to share your location with.",
        options: [
          { text: "Your spouse or partner", correct: true },
          { text: "Your adult child", correct: true },
          { text: "A trusted friend you're meeting", correct: true },
          { text: "A caregiver (if you choose)", correct: true },
          { text: "Someone you met on social media yesterday", correct: false },
          { text: "A stranger claiming you won a prize", correct: false },
          { text: "Someone asking for your address online", correct: false }
        ],
        feedback: "Excellent! Share your location only with people you know and trust."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Location Sharing", back: "Allowing someone to see where you are." },
          { front: "One-Time Location", back: "Shares your location only once or for a short period." },
          { front: "Continuous Sharing", back: "Shares your location until you turn it off." },
          { front: "Trusted Contact", back: "Someone you know personally and trust." },
          { front: "Stop Sharing", back: "Turns off location sharing." }
        ]
      },
      {
        type: "match",
        title: "Match the Situation",
        pairs: [
          { word: "Meeting your daughter at a restaurant", match: "Share your location temporarily" },
          { word: "Stranger online asks where you live", match: "Do not share" },
          { word: "Family road trip", match: "Share with trusted family if you choose" },
          { word: "Prize claim asks for your address", match: "Do not share" },
          { word: "You no longer need location sharing", match: "Stop sharing your location" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Location", "Stop", "Temporary", "Trusted"],
        questions: [
          { text: "Only share your ______ with people you know and trust.", answer: "Location" },
          { text: "When you no longer need location sharing, you should ______ sharing.", answer: "Stop" },
          { text: "Sharing your location while someone picks you up is usually ______.", answer: "Temporary" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret is meeting her daughter at a shopping mall. Her daughter can't find the entrance she's using. What should Margaret do?",
        options: [
          "Post her location publicly on Facebook.",
          "Tell everyone at the mall where she is.",
          "Share her location directly with her daughter for a short time.",
          "Send her banking password."
        ],
        correctIndex: 2,
        explanation: "Temporary location sharing is helpful for meeting someone you trust."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert receives this message: \"To receive your prize, send your live location immediately.\" What should he do?",
        options: [
          "Share it.",
          "Share his home address too.",
          "Ignore the message and report it if it appears to be a scam.",
          "Ask for a bigger prize."
        ],
        correctIndex: 2,
        explanation: "Legitimate prizes don't require your live location."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda shared her location with her son while traveling. She has safely arrived home. What should she do?",
        options: [
          "Leave location sharing on forever without checking.",
          "Share her location with everyone else.",
          "Stop sharing if she no longer wants her son to see her location.",
          "Post her home address online."
        ],
        correctIndex: 2,
        explanation: "It's a good habit to turn off location sharing when you no longer need it."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Before you share your location, ask yourself: Do I know this person? Do I trust them? Do they really need my location? Can I share it temporarily instead of continuously? If you're unsure, don't share until you're confident it's the right choice."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          {
            label: "Safer Choices",
            items: [
              "Share with trusted family",
              "Stop sharing when you no longer need it",
              "Use temporary sharing when possible",
              "Check who has access to your location every few months"
            ]
          },
          {
            label: "Less Safe Choices",
            items: [
              "Share your live location publicly",
              "Give strangers your location",
              "Leave continuous sharing on without reviewing it",
              "Feel pressured into sharing your location"
            ]
          }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You're meeting a friend at a concert and can't find each other.",
        options: [
          "Post your location publicly.",
          "Share your location directly with your friend for a short time.",
          "Give your home address instead.",
          "Share your location with everyone in your contacts."
        ],
        correctIndex: 1
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You've been sharing your location with your daughter during a road trip. The trip is over. What should you do?",
        options: [
          "Leave sharing on forever.",
          "Share your location with more people.",
          "Stop sharing if you no longer need it.",
          "Delete your phone."
        ],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "An app asks to share your location with all users. What should you do?",
        options: [
          "Automatically allow it.",
          "Share your location because everyone else does.",
          "Read why the app needs your location and only share if it makes sense.",
          "Give the app your Social Security number too."
        ],
        correctIndex: 2,
        explanation: "Always understand why an app wants your location before allowing access."
      },
      {
        type: "learn",
        heading: "Remember",
        text: "Sharing your location can be very helpful, but only when you choose. Share with trusted people, use temporary sharing when possible, stop sharing when you're finished, and review your location settings regularly. Never share your location with strangers, feel pressured to share, or post your live location publicly."
      }
    ],
    quiz: [
      { question: "What is location sharing?", options: ["Sending a text message.", "Taking a picture.", "Allowing another person or app to know where you are.", "Connecting to Wi-Fi."], correctIndex: 2 },
      { question: "Who is it usually appropriate to share your location with?", options: ["Anyone who asks", "A trusted family member, a trusted friend you're meeting, a caregiver if you choose, or your spouse"], correctIndex: 1 },
      { question: "True or False: You should share your location with anyone who asks politely online.", options: ["True", "False"], correctIndex: 1 },
      { question: "When you no longer need location sharing, you should ______ sharing.", options: ["Stop", "Camera", "Weather"], correctIndex: 0 },
      { question: "A stranger online asks for your live location. What should you do?", options: ["Share it.", "Send your address too.", "Do not share your location. Ignore or block the person if needed.", "Call them immediately."], correctIndex: 2 },
      { question: "What's one benefit of temporary location sharing?", options: ["It shares your location forever.", "It lets someone see your location only for a limited time.", "It gives everyone access to your location.", "It cannot be turned off."], correctIndex: 1 },
      { question: "You shared your location with your daughter while she picked you up. You're home now. What should you do?", options: ["Leave location sharing on forever.", "Share your location with your neighbors too.", "Stop sharing if you no longer need it.", "Delete your contacts."], correctIndex: 2 },
      { question: "Before sharing your location, what should you ask yourself?", options: ["Nothing, just share", "Do I trust this person? Do they really need it? Can I share temporarily? Am I comfortable?"], correctIndex: 1 }
    ],
    complete: {
      title: "Phase 3 Complete!",
      subtitle: "You completed Lesson 7: Sharing Your Location, and all of Phase 3: Communication!",
      learned: [
        "Safe Texting",
        "Video Calls",
        "Email Basics",
        "Blocking Numbers",
        "Reporting Spam",
        "Sharing Photos Safely",
        "Sharing Your Location"
      ],
      next: "Phase 3 Final Exam"
    }
  }
];

// ============================================================
// PHASE 3 FINAL EXAM
// ============================================================
export const phase3Exam = {
  id: "phase3-exam",
  track: "literacy",
  phase: 3,
  order: 26,
  title: "Phase 3 Final Exam: Communication",
  topics: [
    "Safe Texting",
    "Video Calls",
    "Email Basics",
    "Blocking Numbers",
    "Reporting Spam",
    "Sharing Photos",
    "Location Sharing"
  ],
  passingScore: 8,
  totalQuestions: 10,
  questions: [
    {
      question: "You receive a text saying you won a free vacation. What should you do?",
      options: ["Click the link.", "Reply \"YES.\"", "Ignore, delete, or report it if it appears to be spam.", "Share it with friends."],
      correctIndex: 2
    },
    {
      question: "True or False: It's okay to click every attachment in an email.",
      options: ["True", "False"],
      correctIndex: 1
    },
    {
      question: "Which email address looks more trustworthy?",
      options: ["support-paypal-login.net", "paypal.com", "paypal-security-free.com", "paypal-help-now.net"],
      correctIndex: 1,
      explanation: "Official company emails come from the company's real domain."
    },
    {
      question: "Unwanted emails and text messages are called ______.",
      options: ["Spam", "Camera", "Password"],
      correctIndex: 0
    },
    {
      question: "Which photos are safer to share?",
      options: ["Photos showing your credit card", "Photos without personal documents visible that don't reveal sensitive information"],
      correctIndex: 1
    },
    {
      question: "What should you do with repeated scam calls?",
      options: ["Answer every time.", "Call them back.", "Block the number and report it if appropriate.", "Give them personal information."],
      correctIndex: 2
    },
    {
      question: "Who should you share your location with?",
      options: ["Anyone online", "Every app", "Trusted people when necessary", "Everyone on Facebook"],
      correctIndex: 2
    },
    {
      question: "A caller asks for your banking password. What should you do?",
      options: ["Give it.", "Give half of it.", "Hang up.", "Email it later."],
      correctIndex: 2
    },
    {
      question: "Which is a sign of a scam email?",
      options: ["A friendly greeting", "Urgent threats, poor spelling, requests for passwords, and unexpected attachments"],
      correctIndex: 1
    },
    {
      question: "Before joining a video call, what should you check?",
      options: ["Nothing.", "Your bank account.", "That you recognize who invited you and are comfortable with your surroundings if your camera is on.", "Your TV."],
      correctIndex: 2
    }
  ],
  results: [
    { minScore: 10, title: "Communication Master", xp: 50, trophy: true },
    { minScore: 8, title: "Communication Champion", xp: 40, trophy: false }
  ]
};

export default phase3Lessons;
