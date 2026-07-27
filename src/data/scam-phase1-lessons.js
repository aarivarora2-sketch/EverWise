// Everwise - Scam Protection track
// Phase 8: Becoming Scam-Proof
//
// This phase builds four mental habits before any specific scam is taught.
// By the end, the learner should carry these automatically:
//   1. If someone rushes you, slow yourself down.
//   2. You are always in control.
//   3. Strong emotions are a reason to slow down, not speed up.
//   4. Verify unexpected requests before you trust them.
//
// BLOCK TYPES: reading, tiered, confidence, memory, finalboss

export const scamPhase1Lessons = [
  // ============================================================
  // LESSON 1.1
  // ============================================================
  {
    id: "scam-pause-button",
    track: "scam",
    phase: 8,
    order: 1,
    lessonNumber: "1.1",
    title: "The Pause Button",
    pathTitle: "The Pause Button",
    badge: "Pause Button",
    xp: 20,
    goals: [
      "Recognize when someone is trying to rush you.",
      "Remember that you always have time to think before deciding."
    ],
    blocks: [
      {
        type: "reading",
        heading: "The Pause Button",
        question: "Why are they trying to make me hurry?",
        objective:
          "Learn to recognize when someone is trying to rush you, and remember that you always have time to think before making a decision.",
        text: "Many scams begin with one simple trick: making you feel like you must act immediately. Whether it is a phone call, email, or text message, an unexpected request does not become more trustworthy just because it sounds urgent. Honest businesses and organizations will give you time to verify information before making an important decision. Taking a moment to slow down is often the first step toward staying safe."
      },
      {
        type: "tiered",
        title: "Spot the red flag",
        scenario: "A caller says, \"You only have two minutes to fix this problem.\"",
        question: "Which part of the message should make you stop and think?",
        options: [
          {
            text: "They gave you a short deadline.",
            tier: "best",
            feedback:
              "Creating urgency is one of the most common ways scammers pressure people into making quick decisions."
          },
          {
            text: "They sounded polite.",
            tier: "unsafe",
            feedback:
              "Politeness is easy to fake and tells you nothing about whether someone is honest. The short deadline is the real warning sign."
          },
          {
            text: "They called during the afternoon.",
            tier: "unsafe",
            feedback:
              "The time of day doesn't matter. What matters is that they gave you a deadline to stop you from thinking."
          }
        ]
      },
      {
        type: "tiered",
        title: "Choose the safest response",
        scenario:
          "Someone says, \"Please don't take time to think. We need to finish this right now.\"",
        question: "What is the safest response?",
        options: [
          {
            text: "Take a moment before making any decision.",
            tier: "best",
            feedback:
              "When someone rushes you, slowing down helps you make better decisions. Anyone discouraging you from thinking deserves extra caution."
          },
          {
            text: "Continue listening because they sound helpful.",
            tier: "unsafe",
            feedback:
              "Sounding helpful is part of the approach. Someone who won't let you think is showing you a warning sign."
          },
          {
            text: "Answer as quickly as possible.",
            tier: "unsafe",
            feedback:
              "Answering quickly is exactly what they want. Speed is the scammer's advantage, not yours."
          }
        ]
      },
      {
        type: "tiered",
        title: "Apply the lesson",
        scenario:
          "You receive an email saying, \"Your account will be closed today unless you respond immediately.\"",
        question: "What is the biggest warning sign?",
        options: [
          {
            text: "It is creating urgency.",
            tier: "best",
            feedback:
              "Scammers use urgency in phone calls, emails, text messages, and even websites. The pressure itself is the clue."
          },
          {
            text: "It uses your name.",
            tier: "unsafe",
            feedback:
              "Your name is easy to find and doesn't prove anything. The deadline is what should make you pause."
          },
          {
            text: "It has bold text.",
            tier: "unsafe",
            feedback:
              "Formatting isn't the issue. The demand for an immediate response is the warning sign."
          }
        ]
      },
      {
        type: "tiered",
        title: "Real-life decision",
        scenario:
          "A company contacts you about your account but tells you the issue can also be handled tomorrow.",
        question: "What is the best choice?",
        options: [
          {
            text: "Take a little time to think before responding.",
            tier: "best",
            feedback:
              "Taking time to think is a smart habit, not a mistake. Notice that an honest organization gave you that option."
          },
          {
            text: "Reply immediately because they contacted you first.",
            tier: "safe",
            feedback:
              "Nothing terrible happens here, but replying right away skips the pause that protects you in the cases that do matter."
          },
          {
            text: "Ignore them forever.",
            tier: "unsafe",
            feedback:
              "Slowing down doesn't mean avoiding everything. You can verify a request and then deal with it properly."
          }
        ]
      },
      {
        type: "confidence",
        question:
          "How confident do you feel about recognizing when someone is trying to rush you?",
        practice: [
          {
            scenario: "A stranger tells you, \"This offer expires in five minutes.\"",
            question: "What should you notice first?",
            options: [
              {
                text: "The short deadline.",
                tier: "best",
                feedback:
                  "A short deadline is often used to pressure people into acting before they think."
              },
              {
                text: "They sound friendly.",
                tier: "unsafe",
                feedback: "Friendliness is easy to perform. The deadline is the clue."
              },
              {
                text: "The offer seems exciting.",
                tier: "unsafe",
                feedback:
                  "Excitement is part of the pressure. Look at the deadline instead."
              }
            ]
          },
          {
            scenario: "Someone asks you to make an important decision immediately.",
            question: "What is the safest habit?",
            options: [
              {
                text: "Take a moment before deciding.",
                tier: "best",
                feedback:
                  "You always have the right to slow down before making an important decision."
              },
              {
                text: "Decide as quickly as possible.",
                tier: "unsafe",
                feedback:
                  "Quick decisions are what scams depend on. Give yourself time."
              },
              {
                text: "Let the caller decide for you.",
                tier: "unsafe",
                feedback:
                  "The decision is always yours. Nobody gets to make it on your behalf."
              }
            ]
          }
        ]
      },
      {
        type: "finalboss",
        title: "The two-minute caller",
        setup:
          "Your phone rings from an unknown number. The caller says there is a problem with one of your accounts and asks you to stay on the phone while they explain what happened.",
        question: "What should you do first?",
        options: [
          {
            text: "Hang up.",
            tier: "best",
            feedback:
              "Hanging up gives you time to think, verify the situation yourself, and decide what to do next. You can always call the organization back on a number you trust."
          },
          {
            text: "Stay on the phone.",
            tier: "unsafe",
            feedback:
              "Staying on the line is exactly what the caller wants, because it keeps you from stopping to think. Ending the call costs you nothing."
          }
        ],
        spotted: ["Unexpected contact", "Pressure to stay on the line"]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed The Pause Button.",
      habit: "If someone rushes you, slow yourself down.",
      warningSign: "A deadline you didn't ask for.",
      skills: [
        "Recognized manufactured urgency",
        "Gave yourself time to think",
        "Ended a pressured conversation"
      ],
      next: "You Are In Control"
    }
  },

  // ============================================================
  // LESSON 1.2
  // ============================================================
  {
    id: "scam-you-are-in-control",
    track: "scam",
    phase: 8,
    order: 2,
    lessonNumber: "1.2",
    title: "You Are In Control",
    pathTitle: "You're In Control",
    badge: "In Control",
    xp: 20,
    goals: [
      "Understand that your phone, computer, and accounts belong to you.",
      "Know you can hang up, close a page, or ask for help at any time."
    ],
    blocks: [
      {
        type: "reading",
        heading: "You Are In Control",
        question: "Do I have to do what they say?",
        objective:
          "Learn that you are always in control of your phone, computer, and online accounts. No one can force you to act immediately.",
        text: "Scammers often try to sound like they are in charge by telling you exactly what to do. They may ask you to click a link, download a program, or stay on the phone while they give instructions. Remember, your phone and computer belong to you. You can hang up, close a website, or ask someone you trust for help at any time. Staying in control is one of the best ways to stay safe online."
      },
      {
        type: "tiered",
        title: "Spot the red flag",
        scenario: "A caller says, \"Don't hang up. Just follow every step I tell you.\"",
        question: "What is the biggest warning sign?",
        options: [
          {
            text: "They want to control what you do.",
            tier: "best",
            feedback:
              "Scammers often try to keep people from stopping to think by controlling the conversation."
          },
          {
            text: "They are speaking clearly.",
            tier: "unsafe",
            feedback:
              "Speaking clearly is not a warning sign. Being told not to hang up is."
          },
          {
            text: "They know how to use computers.",
            tier: "unsafe",
            feedback:
              "Technical knowledge proves nothing. The attempt to control your actions is the clue."
          }
        ]
      },
      {
        type: "tiered",
        title: "Choose the safest response",
        scenario: "Someone asks you to download a program before explaining why.",
        question: "What should you do?",
        options: [
          {
            text: "Ask questions and decide later.",
            tier: "best",
            feedback:
              "You never have to install software or follow instructions just because someone asks."
          },
          {
            text: "Download it immediately.",
            tier: "unsafe",
            feedback:
              "Installing software gives someone access to your device. That decision should always be yours, made calmly."
          },
          {
            text: "Leave the program running overnight.",
            tier: "unsafe",
            feedback:
              "This gives a stranger even more time with your device. Don't install it in the first place."
          }
        ]
      },
      {
        type: "tiered",
        title: "Apply the lesson",
        scenario:
          "A pop-up appears saying, \"Call this number immediately so we can fix your computer.\"",
        question: "What should you remember?",
        options: [
          {
            text: "You are still in control of what you do.",
            tier: "best",
            feedback:
              "Unexpected pop-ups can be fake. You can close the page and decide what to do next."
          },
          {
            text: "The message knows your computer.",
            tier: "unsafe",
            feedback:
              "A pop-up can appear on any computer that visits a page. It knows nothing about yours."
          },
          {
            text: "Every warning message is an emergency.",
            tier: "unsafe",
            feedback:
              "Alarming messages are designed to feel like emergencies. That feeling is the trick."
          }
        ]
      },
      {
        type: "tiered",
        title: "Real-life decision",
        scenario:
          "Someone online says, \"If you leave this page, your computer could stop working.\"",
        question: "What is the safest response?",
        options: [
          {
            text: "Remember that you decide what happens next.",
            tier: "best",
            feedback:
              "No stranger gets to control your computer. You decide when to continue, leave a page, or ask for help."
          },
          {
            text: "Stay because they told you to.",
            tier: "unsafe",
            feedback:
              "A threat like this is meant to trap you on the page. Closing it is safe."
          },
          {
            text: "Click every button until the message disappears.",
            tier: "unsafe",
            feedback:
              "Clicking around a suspicious page can make things worse. Close the whole page instead."
          }
        ]
      },
      {
        type: "confidence",
        question:
          "How confident do you feel about staying in control when someone tells you what to do online?",
        practice: [
          {
            scenario: "Someone says, \"Don't ask anyone else. Just follow my instructions.\"",
            question: "What should you remember?",
            options: [
              {
                text: "You can stop and decide for yourself.",
                tier: "best",
                feedback:
                  "You always have the right to stop and think before following instructions."
              },
              {
                text: "They must know more than you.",
                tier: "unsafe",
                feedback:
                  "Confidence isn't expertise, and it certainly isn't honesty."
              },
              {
                text: "It is rude to ask questions.",
                tier: "unsafe",
                feedback:
                  "Asking questions is never rude. Anyone discouraging it is showing you a warning sign."
              }
            ]
          },
          {
            scenario: "A website tells you to download a file immediately.",
            question: "What is the safest habit?",
            options: [
              {
                text: "Decide for yourself before downloading anything.",
                tier: "best",
                feedback: "You are always in control of what you download or install."
              },
              {
                text: "Download it because the website asked.",
                tier: "unsafe",
                feedback:
                  "A website asking is not a reason. You choose what goes on your device."
              },
              {
                text: "Download it and ask questions later.",
                tier: "unsafe",
                feedback:
                  "Once something is installed, the damage may already be done. Ask first."
              }
            ]
          }
        ]
      },
      {
        type: "finalboss",
        title: "The helpful technician",
        setup:
          "Your computer displays a message saying there is a problem. A phone number appears on the screen. When you call, the person asks you to stay on the line and download a program so they can \"fix\" your computer.",
        question: "What should you do first?",
        options: [
          {
            text: "Hang up.",
            tier: "best",
            feedback:
              "You stayed in control. If someone unexpectedly tells you to download software or follow instructions, you can always end the conversation and decide what to do next on your own."
          },
          {
            text: "Download the program.",
            tier: "unsafe",
            feedback:
              "That program would give a stranger control of your computer. The message and the phone number both came from the same unexpected source, so neither can be trusted."
          }
        ],
        spotted: ["Unexpected contact", "Pressure to stay on the line", "Request for remote access"]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed You Are In Control.",
      habit: "You are always in control of your phone, computer, and accounts.",
      warningSign: "Someone telling you exactly what to do.",
      skills: [
        "Refused unwanted instructions",
        "Ended a controlling conversation",
        "Protected your device from remote access"
      ],
      next: "Stay Calm, Think Clearly"
    }
  },

  // ============================================================
  // LESSON 1.3
  // ============================================================
  {
    id: "scam-stay-calm",
    track: "scam",
    phase: 8,
    order: 3,
    lessonNumber: "1.3",
    title: "Stay Calm, Think Clearly",
    pathTitle: "Stay Calm",
    badge: "Clear Thinker",
    xp: 20,
    goals: [
      "Notice when a message is creating a strong emotion.",
      "Treat strong feelings as a signal to slow down."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Stay Calm, Think Clearly",
        question: "Why do I suddenly feel worried or excited?",
        objective:
          "Learn that strong emotions can make it harder to make good decisions, and that taking a moment to stay calm helps you think clearly.",
        text: "Scammers often try to create strong emotions because emotional decisions are usually faster than careful ones. They may try to make you feel worried, excited, guilty, or even curious. Whenever a message or phone call causes a strong emotional reaction, treat it as a reminder to slow down and think. Staying calm gives you a better chance to recognize scams and make safe choices."
      },
      {
        type: "tiered",
        title: "Spot the red flag",
        scenario:
          "You receive a text message saying, \"Congratulations! You've won a brand-new smartphone. Claim your prize today!\"",
        question: "What should make you stop and think?",
        options: [
          {
            text: "The message is trying to make you feel excited.",
            tier: "best",
            feedback:
              "Scammers often use excitement to encourage quick decisions without careful thinking."
          },
          {
            text: "The phone is new.",
            tier: "unsafe",
            feedback:
              "What's being offered isn't the issue. The rush of excitement is what's being used on you."
          },
          {
            text: "The text arrived in the morning.",
            tier: "unsafe",
            feedback: "Timing is irrelevant. The emotional pull is the warning sign."
          }
        ]
      },
      {
        type: "tiered",
        title: "Choose the safest response",
        scenario: "An unexpected message promises a reward if you act immediately.",
        question: "What should you do?",
        options: [
          {
            text: "Stop and think before responding.",
            tier: "best",
            feedback:
              "Exciting offers can wait. Taking a moment to think helps protect you from scams."
          },
          {
            text: "Claim the reward immediately.",
            tier: "unsafe",
            feedback:
              "Acting immediately is what the message is designed to produce. Real rewards don't vanish because you thought about them."
          },
          {
            text: "Forward the message to your friends.",
            tier: "unsafe",
            feedback:
              "Passing it along spreads the scam to people who trust you."
          }
        ]
      },
      {
        type: "tiered",
        title: "Apply the lesson",
        scenario:
          "A caller says, \"Your account has a serious problem, and we need to fix it today.\"",
        question: "Which emotion is the caller most likely trying to create?",
        options: [
          {
            text: "Worry.",
            tier: "best",
            feedback:
              "Scammers often use fear to encourage quick decisions. Worry and excitement are two sides of the same tactic."
          },
          {
            text: "Happiness.",
            tier: "unsafe",
            feedback:
              "This message is built to alarm you, not to please you."
          },
          {
            text: "Curiosity.",
            tier: "unsafe",
            feedback:
              "Curiosity is sometimes used, but a \"serious problem\" is aimed squarely at fear."
          }
        ]
      },
      {
        type: "tiered",
        title: "Real-life decision",
        scenario:
          "You receive an unexpected message that makes you feel excited or worried.",
        question: "What is the best first step?",
        options: [
          {
            text: "Take a moment to think before responding.",
            tier: "best",
            feedback:
              "Whether the message creates excitement, worry, or curiosity, slowing down helps you make better decisions."
          },
          {
            text: "Reply immediately.",
            tier: "unsafe",
            feedback:
              "The strong feeling is exactly why you shouldn't reply yet."
          },
          {
            text: "Ignore every message forever.",
            tier: "unsafe",
            feedback:
              "You don't need to avoid everything. Just pause long enough to think clearly."
          }
        ]
      },
      {
        type: "confidence",
        question:
          "How confident do you feel about recognizing when emotions are affecting your decisions?",
        practice: [
          {
            scenario:
              "An email says, \"This is your last chance to receive a special reward.\"",
            question: "What emotion is the message trying to create?",
            options: [
              {
                text: "Excitement.",
                tier: "best",
                feedback:
                  "Scammers often promise rewards to encourage quick decisions."
              },
              {
                text: "Confusion.",
                tier: "unsafe",
                feedback: "The message is designed to attract you, not confuse you."
              },
              {
                text: "Relaxation.",
                tier: "unsafe",
                feedback: "\"Last chance\" is built to raise your pulse, not lower it."
              }
            ]
          },
          {
            scenario: "A phone call makes you feel worried about one of your accounts.",
            question: "What should you do first?",
            options: [
              {
                text: "Stay calm and think before acting.",
                tier: "best",
                feedback: "Staying calm helps you make safer decisions."
              },
              {
                text: "Follow every instruction immediately.",
                tier: "unsafe",
                feedback:
                  "Worry makes instructions feel urgent. That's the point of the worry."
              },
              {
                text: "Make a decision as quickly as possible.",
                tier: "unsafe",
                feedback: "Speed helps the scammer, never you."
              }
            ]
          }
        ]
      },
      {
        type: "finalboss",
        title: "The lucky winner",
        setup:
          "You receive a text message saying you've won an expensive vacation. To claim it, you only need to click a link and complete a short form today.",
        question: "What should you do first?",
        options: [
          {
            text: "Take a moment to think before doing anything.",
            tier: "best",
            feedback:
              "The message tried to make you feel excited so you would act quickly. By slowing down first, you gave yourself time to decide whether the message could be trusted."
          },
          {
            text: "Click the link.",
            tier: "unsafe",
            feedback:
              "The excitement and the deadline were both there to get you clicking before you thought. A prize you never entered to win is rarely a prize at all."
          }
        ],
        spotted: ["Unexpected contact", "Emotional pressure", "A deadline you didn't ask for"]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Stay Calm, Think Clearly.",
      habit: "Strong emotions are a reason to slow down, not speed up.",
      warningSign: "A message that makes you feel a sudden strong emotion.",
      skills: [
        "Noticed emotional pressure",
        "Stayed calm under excitement and worry",
        "Paused before responding"
      ],
      next: "Stop, Verify, Then Decide"
    }
  },

  // ============================================================
  // LESSON 1.4
  // ============================================================
  {
    id: "scam-stop-verify-decide",
    track: "scam",
    phase: 8,
    order: 4,
    lessonNumber: "1.4",
    title: "Stop, Verify, Then Decide",
    pathTitle: "Stop & Verify",
    badge: "Verifier",
    xp: 20,
    goals: [
      "Verify unexpected requests before trusting them.",
      "Use contact information you found yourself, not what you were given."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Stop, Verify, Then Decide",
        question: "How do I know if this is really them?",
        objective:
          "Learn that unexpected requests should always be verified before you trust them or take action.",
        text: "Not every unexpected phone call, email, or text message is a scam, but every unexpected request deserves a moment to be verified. Instead of trusting someone because they sound convincing or use a familiar name, contact the company, bank, or person yourself using an official phone number or website. Taking a minute to verify can prevent hours of stress and protect your personal information."
      },
      {
        type: "tiered",
        title: "Spot the safe choice",
        scenario: "Someone calls and says they are from your bank.",
        question: "What is the safest first step?",
        options: [
          {
            text: "Hang up and call your bank using the phone number on your bank card.",
            tier: "best",
            feedback:
              "Using a trusted phone number lets you know who you are really speaking with. You chose the number, so nobody could fake it."
          },
          {
            text: "Continue talking because they knew your name.",
            tier: "unsafe",
            feedback:
              "Your name is easy to find. Knowing it proves nothing about who someone is."
          },
          {
            text: "Give them your account number so they can verify you.",
            tier: "unsafe",
            feedback:
              "You should never have to prove who you are to someone who contacted you unexpectedly. It works the other way around."
          }
        ]
      },
      {
        type: "tiered",
        title: "Choose the safest response",
        scenario:
          "You receive a text message asking you to click a link to verify your account.",
        question: "What should you do?",
        options: [
          {
            text: "Visit the company's official website or call them using an official number.",
            tier: "best",
            feedback:
              "Whenever possible, start the conversation yourself using trusted contact information."
          },
          {
            text: "Reply to the text asking if it is real.",
            tier: "unsafe",
            feedback:
              "If the text is fake, the reply goes straight back to the scammer, who will happily tell you it's real."
          },
          {
            text: "Open the link immediately.",
            tier: "unsafe",
            feedback:
              "Never let an unexpected message decide where you go online. The page it opens can look perfect and still be fake."
          }
        ]
      },
      {
        type: "tiered",
        title: "Apply the lesson",
        scenario:
          "You receive an unexpected email saying there is a problem with one of your accounts.",
        question: "What is the safest way to find out if it is real?",
        options: [
          {
            text: "Call the company using the phone number listed on your statement or official website.",
            tier: "best",
            feedback:
              "Always use contact information that you found yourself."
          },
          {
            text: "Reply to the email.",
            tier: "unsafe",
            feedback:
              "Replying only reaches whoever sent it. That's no way to check whether they're genuine."
          },
          {
            text: "Click the email link to learn more.",
            tier: "unsafe",
            feedback:
              "The link is chosen by the sender. Choose your own route instead."
          }
        ]
      },
      {
        type: "tiered",
        title: "Real-life decision",
        scenario:
          "An unexpected caller asks you to confirm personal information before they can help you.",
        question: "What should you do?",
        options: [
          {
            text: "Verify who they are by contacting the organization yourself.",
            tier: "best",
            feedback:
              "You don't have to prove who you are to someone who contacted you unexpectedly. Verify first."
          },
          {
            text: "Answer their questions because they called first.",
            tier: "unsafe",
            feedback:
              "Calling first gives someone no authority at all. If anything, it's the reason to be careful."
          },
          {
            text: "Stay on the phone until they finish explaining.",
            tier: "unsafe",
            feedback:
              "The longer the call runs, the more pressure builds. You can end it and check independently."
          }
        ]
      },
      {
        type: "confidence",
        question:
          "How confident do you feel about verifying unexpected requests before trusting them?",
        practice: [
          {
            scenario: "Someone says they are calling from your insurance company.",
            question: "How can you verify they are really from your insurance company?",
            options: [
              {
                text: "Call the phone number on your insurance card.",
                tier: "best",
                feedback: "Always use contact information you already trust."
              },
              {
                text: "Ask them if they promise they are real.",
                tier: "unsafe",
                feedback:
                  "Someone willing to lie about who they are will happily promise anything."
              },
              {
                text: "Continue talking until they convince you.",
                tier: "unsafe",
                feedback:
                  "Being convincing is the whole skill. Verification beats persuasion."
              }
            ]
          },
          {
            scenario:
              "A text message says there is a problem with your package and asks you to click a link.",
            question: "What is the safest first step?",
            options: [
              {
                text: "Visit the shipping company's official website yourself.",
                tier: "best",
                feedback: "Starting from the official website helps you avoid fake links."
              },
              {
                text: "Click the link in the message.",
                tier: "unsafe",
                feedback:
                  "The link leads wherever the sender wants it to. Choose your own path."
              },
              {
                text: "Reply to the text.",
                tier: "unsafe",
                feedback: "A reply only reaches the sender, whoever they really are."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 1.1 — The Pause Button",
            note: "Verifying takes time, and you've already learned that you're allowed to take it."
          },
          {
            lesson: "Lesson 1.2 — You Are In Control",
            note: "You choose the phone number, the website, and the moment. Not the caller."
          },
          {
            lesson: "Lesson 1.3 — Stay Calm, Think Clearly",
            note: "A calm mind is what makes verifying feel natural instead of rude."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The bank caller",
        setup:
          "You receive an unexpected phone call from someone claiming to be from your bank. They explain that there may be unusual activity on your account and ask you to verify your identity before they can help.",
        question: "What should you do first?",
        options: [
          {
            text: "Hang up and call your bank using the phone number on your debit or credit card.",
            tier: "best",
            feedback:
              "By ending the unexpected call and contacting your bank yourself, you made sure you were speaking with the real organization — not someone pretending to be them."
          },
          {
            text: "Give them the information they requested.",
            tier: "unsafe",
            feedback:
              "They called you, so they're the ones who need to be verified. Handing over personal details to an unexpected caller is exactly what the scam depends on."
          }
        ],
        spotted: ["Unexpected contact", "Request for personal information", "No independent verification"]
      }
    ],
    quiz: [],
    complete: {
      title: "Phase 8 complete!",
      subtitle: "You completed Stop, Verify, Then Decide — and all of Phase 8.",
      habit: "Verify unexpected requests before you trust them.",
      warningSign: "Being asked to prove yourself to someone who contacted you.",
      skills: [
        "Verified using contact information you chose",
        "Refused to confirm details to an unexpected caller",
        "Started the conversation on your own terms"
      ],
      learned: [
        "If someone rushes you, slow yourself down.",
        "You are always in control.",
        "Strong emotions are a reason to slow down, not speed up.",
        "Verify unexpected requests before you trust them."
      ],
      next: "Phase 9: The Warning Signs"
    }
  }
];

export default scamPhase1Lessons;
