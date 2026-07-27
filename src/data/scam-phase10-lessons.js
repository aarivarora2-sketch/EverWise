// Everwise - Scam Protection track
// Phase 17: Living Confidently Online
//
// The final phase. One clear idea:
//   Online safety is not about being afraid. It is about having habits
//   you can trust.
//
// The tone here is deliberately calmer than earlier phases. After ten
// phases of scam material, learners can end up over-cautious and isolated.
// These lessons include plenty of ordinary, safe online activity so that
// "everything is a scam" is never the takeaway.

const CONFIDENT_HABITS = [
  "Pause when pressure appears",
  "Check the request",
  "Verify through trusted sources",
  "Ask for help when needed",
  "Decide after the pressure is gone",
];

export const scamPhase10Lessons = [
  // ============================================================
  // LESSON 10.1
  // ============================================================
  {
    id: "scam-trust-your-routine",
    track: "scam",
    phase: 17,
    order: 1,
    lessonNumber: "10.1",
    title: "Trust Your Safety Routine",
    pathTitle: "Your Routine",
    badge: "Routine Keeper",
    xp: 20,
    goals: [
      "Use pause, check, verify, ask, decide when unsure.",
      "Act without needing to recognize every scam instantly."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Trust Your Safety Routine",
        question: "What should I do when I'm not sure?",
        objective:
          "Learn how to use a simple safety routine whenever something online feels confusing, urgent, emotional, or risky.",
        warningSigns: CONFIDENT_HABITS,
        text: "Living confidently online does not mean you'll recognize every scam immediately. It means you have a routine to follow when something feels uncertain. Pause before clicking, replying, paying, downloading, sharing codes, or giving personal information. Check what's happening — who contacted you, what they want, whether money or private information is involved. Verify through a trusted path you choose. Ask a trusted person if you're unsure. Then decide calmly. The goal is not to be perfect. The goal is to slow down, check, and choose with confidence."
      },
      {
        type: "tiered",
        title: "When you feel unsure",
        scenario:
          "You receive a message that says, \"Your account will close today unless you click here.\" You're not sure if it's real.",
        question: "Which routine is the best?",
        options: [
          {
            text: "Pause, check the message, verify through the official account, ask for help if needed, then decide.",
            tier: "best",
            feedback:
              "You do not need to know instantly whether it's real. You need to follow the safety routine."
          },
          {
            text: "Treat urgency and account threats as reasons to slow down.",
            tier: "safe",
            feedback: "That's the pause, correctly triggered."
          },
          {
            text: "Click immediately because the message says today.",
            tier: "unsafe",
            feedback: "\"Today\" exists to prevent the pause."
          }
        ]
      },
      {
        type: "tiered",
        title: "Checking the request",
        scenario:
          "A caller says, \"I need the code we just sent to your phone.\"",
        question: "What should you check?",
        options: [
          {
            text: "The caller is asking for a private verification code.",
            tier: "best",
            feedback:
              "The request matters. A verification code protects an account and should stay private."
          },
          {
            text: "Verification codes should not be shared with callers or message senders.",
            tier: "safe",
            feedback: "A rule with no exceptions."
          },
          {
            text: "The code is safe to share because it expires soon.",
            tier: "unsafe",
            feedback:
              "It only needs to work once, and they're calling right now."
          }
        ]
      },
      {
        type: "tiered",
        title: "Verifying through a trusted path",
        scenario:
          "You receive an email about a credit card problem. The email includes a phone number to call.",
        question: "Which response is the best?",
        options: [
          {
            text: "Use the number on the back of your card or the official app instead of the number in the email.",
            tier: "best",
            feedback:
              "A trusted path is safer than contact information inside a suspicious message."
          },
          {
            text: "Save the email if the card company may need to review it.",
            tier: "safe",
            feedback: "Useful if it turns out to be a phishing attempt."
          },
          {
            text: "Call the number in the email because it is faster.",
            tier: "unsafe",
            feedback:
              "A number supplied by a suspicious message verifies nothing."
          }
        ]
      },
      {
        type: "tiered",
        title: "Asking for help",
        scenario:
          "You feel embarrassed because you almost clicked a suspicious link, and you're unsure what to do next.",
        question: "Which response is the best?",
        options: [
          {
            text: "Ask a trusted person to help you review the message.",
            tier: "best",
            feedback:
              "Scammers use embarrassment to keep people quiet. A trusted helper makes the next step easier."
          },
          {
            text: "Remember that asking for help is part of staying safe.",
            tier: "safe",
            feedback: "It's a step in the routine, not a failure."
          },
          {
            text: "Stay silent because feeling embarrassed means you should handle it alone.",
            tier: "unsafe",
            feedback:
              "Almost clicking means you caught it. That's worth talking about, not hiding."
          }
        ]
      },
      {
        type: "confidence",
        question:
          "How confident do you feel using the routine: pause, check, verify, ask, decide?",
        practice: [
          {
            scenario:
              "A text says, \"You won a prize. Pay a $25 fee now to claim it.\"",
            question: "Which response is the best?",
            options: [
              {
                text: "Pause and check why you're being asked to pay money to receive money.",
                tier: "best",
                feedback: "Money pressure is a strong reason to use the safety routine."
              },
              {
                text: "Verify the prize through an official source before doing anything.",
                tier: "safe",
                feedback: "Starting with whether you entered anything."
              },
              {
                text: "Pay the fee because the prize is larger than the fee.",
                tier: "unsafe",
                feedback: "That comparison is the whole hook."
              }
            ]
          },
          {
            scenario:
              "A message from an unfamiliar number says, \"This is your grandson. I'm in trouble. Don't tell anyone.\"",
            question: "Which response is the best?",
            options: [
              {
                text: "Contact your grandson or another family member using a number you already trust.",
                tier: "best",
                feedback:
                  "A safety routine helps you care about someone without being rushed or isolated."
              },
              {
                text: "Treat secrecy, urgency, and money pressure as warning signs.",
                tier: "safe",
                feedback: "Three signals in one short message."
              },
              {
                text: "Keep the secret because the message asks you to.",
                tier: "unsafe",
                feedback: "The secrecy request is the clearest sign of all."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 2.3 — Rushing Is a Warning",
            note: "Urgency is a reason to slow down, not speed up."
          },
          {
            lesson: "Lesson 8.7 — Build Your Everyday AI Routine",
            note: "AI can help you think, but you still review, verify, and decide."
          },
          {
            lesson: "Lesson 9.4 — Make a Family or Friend Safety Plan",
            note: "You can also ask someone else to help you check."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The confusing message mix",
        setup:
          "You feel worried because the message uses your name.",
        messages: [
          {
            from: "Text · Unfamiliar number",
            body:
              "This is Support. Your bank card was used in another state. FINAL NOTICE: your account will close today unless you verify now. Reply with the verification code we just sent. Do not delay. Call 1-877-555-0192.",
            fakeButton: "Secure my account"
          }
        ],
        question: "What should you do?",
        options: [
          {
            text: "Pause. Do not click the link, call the number in the text, or share the verification code. Check the request, verify through the official bank app or the number on your card, ask for help if needed, then decide.",
            tier: "best",
            feedback:
              "You used the full safety routine. The message came from an unfamiliar number, created urgency, used your name to build trust, included both a link and a phone number, asked for a verification code, and threatened account closure."
          },
          {
            text: "Save the message if the bank may need to review it.",
            tier: "safe",
            feedback: "Worth keeping — banks track these campaigns."
          },
          {
            text: "Click the link because the message uses your first name and says Final Notice.",
            tier: "unsafe",
            feedback:
              "Your first name is easy to find, and \"Final Notice\" is a phrase, not evidence. Notice it asked for a verification code — no real bank ever does."
          }
        ],
        spotted: [
          "Unfamiliar number",
          "Urgency and account threat",
          "Your name used to build trust",
          "Link and phone number inside the message",
          "Request for a verification code"
        ]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Trust Your Safety Routine.",
      habit: "When unsure, use the routine: pause, check, verify, ask, decide.",
      warningSign: "You don't need to know everything — you need a routine you can trust.",
      skills: [
        "Paused before acting",
        "Identified the request",
        "Protected verification codes",
        "Used official verification"
      ],
      next: "Keep Your Digital Life Healthy"
    }
  },

  // ============================================================
  // LESSON 10.2
  // ============================================================
  {
    id: "scam-digital-health",
    track: "scam",
    phase: 17,
    order: 2,
    lessonNumber: "10.2",
    title: "Keep Your Digital Life Healthy",
    pathTitle: "Digital Health",
    badge: "Digital Caretaker",
    xp: 20,
    goals: [
      "Use update, review, remove, protect, backup.",
      "Tell normal maintenance apart from scary pop-ups."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Keep Your Digital Life Healthy",
        question: "How do I stay safer over time?",
        objective:
          "Learn simple maintenance habits that help keep accounts, devices, apps, and online routines safer over time.",
        warningSigns: ["Update — keep devices and apps current", "Review — check statements and settings", "Remove — clean up what you don't use", "Protect — strong passwords and two-step", "Backup — keep an extra copy of what matters"],
        text: "Online safety is not only about reacting to suspicious messages. It's also about taking care of your digital life the way you take care of your home or car. Keep important devices and apps reasonably current. Review bank statements, account activity, saved payment methods, subscription charges, and recovery information. Remove old apps, unused accounts, and saved payment methods you don't need. Protect important accounts with unique passwords and two-step verification — email, banking, health, and payment accounts especially. And keep a backup of important photos and files. Digital health doesn't need to be perfect. Small regular habits make online life safer and less stressful."
      },
      {
        type: "tiered",
        title: "Updates",
        scenario:
          "Your phone says a software update is available. You're not sure what it means.",
        question: "Which response is the best?",
        options: [
          {
            text: "Check that the update is coming from the phone's normal settings, then install it when you have time and enough battery.",
            tier: "best",
            feedback:
              "Updates should come through the device or app's normal settings, not surprise message links."
          },
          {
            text: "Ask a trusted helper if you are unsure.",
            tier: "safe",
            feedback: "No shame in asking about settings."
          },
          {
            text: "Click a random text message link that says it will update your phone.",
            tier: "unsafe",
            feedback:
              "Phones don't update through text links. That's a delivery method for something else."
          }
        ]
      },
      {
        type: "tiered",
        title: "Review account activity",
        scenario: "You check your card statement and see a charge you don't recognize.",
        question: "What should you do?",
        options: [
          {
            text: "Review receipts and subscriptions, then contact the card company through the official app or number on the card if it still looks unfamiliar.",
            tier: "best",
            feedback: "Reviewing account activity helps catch problems earlier."
          },
          {
            text: "Ask an authorized household member if they recognize the charge, when appropriate.",
            tier: "safe",
            feedback: "Often the simplest explanation."
          },
          {
            text: "Ignore it because checking statements is unnecessary.",
            tier: "unsafe",
            feedback:
              "Statements are how small unauthorized charges get caught before they grow."
          }
        ]
      },
      {
        type: "tiered",
        title: "Remove what you no longer use",
        scenario:
          "Your phone has many apps you no longer use. Some still have saved payment information.",
        question: "Which response is the best?",
        options: [
          {
            text: "Review old apps and remove the ones you no longer need, after making sure you aren't deleting anything important.",
            tier: "best",
            feedback:
              "Cleaning up unused apps and saved payment information can reduce confusion and risk."
          },
          {
            text: "Remove saved payment methods from accounts you no longer use when possible.",
            tier: "safe",
            feedback: "The saved cards matter more than the apps themselves."
          },
          {
            text: "Keep every old app forever because removing apps is always unsafe.",
            tier: "unsafe",
            feedback:
              "Unused apps with saved cards are the risk, not the removal."
          }
        ]
      },
      {
        type: "tiered",
        title: "Protect important accounts",
        scenario:
          "You use the same simple password for email, shopping, and banking.",
        question: "Which account should get special attention first?",
        options: [
          {
            text: "Email, because it can be used to reset many other accounts.",
            tier: "best",
            feedback:
              "Email is especially important because it often controls password resets for everything else."
          },
          {
            text: "Banking and payment accounts also deserve strong, unique protection.",
            tier: "safe",
            feedback: "Right behind email in priority."
          },
          {
            text: "None of them need changes because the password is easy to remember.",
            tier: "unsafe",
            feedback:
              "Easy to remember and reused across three important accounts is the exact combination to fix."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel keeping your digital life healthy over time?",
        practice: [
          {
            scenario:
              "A browser pop-up says, \"Your computer is infected. Click here to update security now.\"",
            question: "Which response is the best?",
            options: [
              {
                text: "Do not click the pop-up. Use trusted device settings or trusted tech support to check updates or security.",
                tier: "best",
                feedback:
                  "Real maintenance happens through trusted settings or trusted support, not scary pop-ups."
              },
              {
                text: "Ask a trusted helper if the message worries you.",
                tier: "safe",
                feedback: "They can confirm it's nothing."
              },
              {
                text: "Click the pop-up because it sounds urgent.",
                tier: "unsafe",
                feedback:
                  "Web pages cannot scan your computer. The alarm is the product."
              }
            ]
          },
          {
            scenario:
              "You have several subscriptions and can't remember which ones renew each month.",
            question: "Which response is the best?",
            options: [
              {
                text: "Review card statements, app subscriptions, and account settings to identify active recurring charges.",
                tier: "best",
                feedback: "Recurring charges add up. Reviewing them keeps you in control."
              },
              {
                text: "Cancel subscriptions you no longer want through official account settings or customer service.",
                tier: "safe",
                feedback: "The natural next step after finding them."
              },
              {
                text: "Ignore them because small monthly charges do not matter.",
                tier: "unsafe",
                feedback: "Several small charges quietly become a large yearly one."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 5.4 — One Password Isn't Enough",
            note: "Important accounts need strong, unique passwords."
          },
          {
            lesson: "Lesson 5.6 — A Second Lock on Your Account",
            note: "Two-step verification adds another layer of protection."
          },
          {
            lesson: "Lesson 7.4 — Read the Checkout Details",
            note: "Reviewing subscriptions helps prevent surprise payments."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The digital checkup",
        setup:
          "You decide to do a monthly digital checkup and notice several things at once.",
        messages: [
          {
            from: "Your phone and accounts",
            body:
              "A normal software update is available in Settings. Three apps you haven't opened in years. One shopping app still has a saved card. Your email password is the same as your shopping password. A small monthly subscription you forgot about. Many family photos on your phone, and you're not sure if they're backed up."
          },
          {
            from: "Browser pop-up",
            body: "Click here to remove viruses now!",
            fakeButton: "Remove viruses"
          }
        ],
        question: "What should you do?",
        options: [
          {
            text: "Use trusted settings for the phone update, review old apps and saved cards, strengthen your email password, check the subscription through official account settings, avoid the pop-up, and ask a trusted helper about backing up photos.",
            tier: "best",
            feedback:
              "You completed a smart digital checkup. Updates through trusted settings, old apps reviewed, saved cards made intentional, email protected, subscriptions checked, scary pop-up ignored, and backups handed to someone who can help."
          },
          {
            text: "Take one step at a time instead of trying to fix everything at once.",
            tier: "safe",
            feedback:
              "Genuinely good advice — a checkup you actually finish beats a perfect one you abandon."
          },
          {
            text: "Click the browser pop-up first because it sounds urgent.",
            tier: "unsafe",
            feedback:
              "It's the only item on that list that isn't real maintenance — and the only one designed to make you act first."
          }
        ],
        spotted: ["A scary pop-up pretending to be maintenance"]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Keep Your Digital Life Healthy.",
      habit: "Keep your digital life healthy: update, review, remove, protect, backup.",
      warningSign: "A pop-up claiming to have scanned your computer.",
      skills: [
        "Used trusted update paths",
        "Reviewed account activity",
        "Managed subscriptions",
        "Protected important accounts"
      ],
      next: "Use the Internet Without Fear"
    }
  },

  // ============================================================
  // LESSON 10.3
  // ============================================================
  {
    id: "scam-without-fear",
    track: "scam",
    phase: 17,
    order: 3,
    lessonNumber: "10.3",
    title: "Use the Internet Without Fear",
    pathTitle: "Without Fear",
    badge: "Confident User",
    xp: 20,
    goals: [
      "Tell normal online activity from unusual activity.",
      "Stay connected instead of withdrawing."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Use the Internet Without Fear",
        question: "How do I stay safe without becoming afraid of everything?",
        objective:
          "Learn how to keep using the internet, apps, online shopping, messages, and AI with confidence instead of avoiding everything out of fear.",
        warningSigns: ["Use — keep using helpful tools", "Notice — pay attention to unusual moments", "Pause — give yourself time", "Check — use your routines", "Continue — it's okay to move forward"],
        text: "After learning about scams, passwords, payment safety, and AI mistakes, it's normal to feel more cautious. That caution is useful. But the goal of online safety is not to make you afraid of the internet. The internet helps you talk to family, shop, manage appointments, read news, learn skills, get directions, pay bills, and stay connected to your community. Avoiding everything can make life harder and more isolated. Online confidence means knowing when to stop and when it's okay to move forward."
      },
      {
        type: "tiered",
        title: "Confidence is not carelessness",
        scenario:
          "You receive a normal email confirmation after buying something from a store's official website. The order number, total, and delivery estimate match what you just purchased.",
        question: "What is the best response?",
        options: [
          {
            text: "Save the confirmation and continue normally.",
            tier: "best",
            feedback:
              "Not every message is suspicious. Confidence means using good habits without unnecessary fear."
          },
          {
            text: "Keep the receipt until the item arrives.",
            tier: "safe",
            feedback: "Sensible record-keeping."
          },
          {
            text: "Panic and assume every email is dangerous.",
            tier: "unsafe",
            feedback:
              "You just made this purchase, and every detail matches. This is what a real confirmation looks like."
          }
        ]
      },
      {
        type: "tiered",
        title: "Caution is not fear",
        scenario:
          "You receive an unexpected text saying, \"Your package is delayed. Pay a small fee here.\" You are expecting a package.",
        question: "Which response is the best?",
        options: [
          {
            text: "Pause and check the delivery through the official store or delivery app.",
            tier: "best",
            feedback:
              "The answer isn't to stop shopping online forever. The answer is to check through a trusted route."
          },
          {
            text: "Treat the payment link as something to verify before using.",
            tier: "safe",
            feedback: "The link is the part to be careful about."
          },
          {
            text: "Decide you should never order packages online again.",
            tier: "unsafe",
            feedback:
              "One suspicious text doesn't need to change how you live. Check it and move on."
          }
        ]
      },
      {
        type: "tiered",
        title: "Helpful AI use",
        scenario: "You want AI to help make a grocery list for a family dinner.",
        question: "Which response is the best?",
        options: [
          {
            text: "Ask AI for a simple grocery list and review it before shopping.",
            tier: "best",
            feedback:
              "AI can still be useful. The key is using it for the right tasks and reviewing the answer."
          },
          {
            text: "Tell AI your preferences without sharing private account information.",
            tier: "safe",
            feedback: "Preferences are exactly the right kind of context."
          },
          {
            text: "Avoid AI completely because AI can sometimes be wrong.",
            tier: "unsafe",
            feedback:
              "A wrong grocery list costs nothing. Risk decides review — and this is low risk."
          }
        ]
      },
      {
        type: "tiered",
        title: "Staying connected",
        scenario:
          "Your friend says, \"There are too many scams. I think I should stop using my phone for messages.\"",
        question: "Which response is the best?",
        options: [
          {
            text: "\"You do not have to stop using messages. Let's use safety habits for messages that feel unusual.\"",
            tier: "best",
            feedback: "Safety should help people stay connected, not become isolated."
          },
          {
            text: "\"We can check suspicious messages together when needed.\"",
            tier: "safe",
            feedback: "Offering to help removes the reason to withdraw."
          },
          {
            text: "\"You are right. The safest choice is to never communicate online.\"",
            tier: "unsafe",
            feedback:
              "Isolation carries its own real harms, and scammers don't only use the internet."
          }
        ]
      },
      {
        type: "confidence",
        question:
          "How confident do you feel using online tools while still following your safety habits?",
        practice: [
          {
            scenario:
              "You want to pay a bill online through the company's official website. You typed the address yourself and the account details match your bill.",
            question: "Which response is the best?",
            options: [
              {
                text: "Continue carefully, review the payment details, and save the confirmation.",
                tier: "best",
                feedback:
                  "Trusted paths and clear records help you use online tools confidently."
              },
              {
                text: "Use your normal money safety habits before submitting payment.",
                tier: "safe",
                feedback: "Who, what, how much, how, record."
              },
              {
                text: "Refuse to pay any bills online ever again.",
                tier: "unsafe",
                feedback:
                  "You did everything right here — that's what a safe payment looks like."
              }
            ]
          },
          {
            scenario:
              "You receive a message from a family member through a number already saved in your phone, asking what time dinner starts.",
            question: "Which response is the best?",
            options: [
              {
                text: "Reply normally if the message fits the situation.",
                tier: "best",
                feedback:
                  "Online safety doesn't mean doubting every ordinary interaction."
              },
              {
                text: "Stay aware, but don't treat every normal message as suspicious.",
                tier: "safe",
                feedback: "A saved number and an ordinary question."
              },
              {
                text: "Assume every text from family is fake.",
                tier: "unsafe",
                feedback:
                  "That would make family life exhausting, and there's no money or information involved here."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 10.1 — Trust Your Safety Routine",
            note: "When unsure, use pause, check, verify, ask, decide."
          },
          {
            lesson: "Lesson 10.2 — Keep Your Digital Life Healthy",
            note: "Regular maintenance makes online life less stressful."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The confident online day",
        setup:
          "You're having a normal online day and do five things.",
        messages: [
          {
            from: "Your day",
            body:
              "1. You video call your granddaughter using your usual app. 2. You receive an order confirmation from a store right after making a purchase. 3. You ask AI for a simple soup recipe. 4. You receive an unexpected text saying your bank account will close unless you click a link. 5. You pay your electric bill by typing the official website yourself and saving the confirmation."
          }
        ],
        question: "Which response shows the best online confidence?",
        options: [
          {
            text: "Use the normal trusted tools calmly, save useful records, review AI's recipe before using it, and pause before acting on the unexpected bank text — verifying that one through the official app or the number on your card.",
            tier: "best",
            feedback:
              "You knew which activities were normal — video call, expected confirmation, AI recipe, official bill payment — and which needed caution. You didn't panic, but you didn't ignore risk either."
          },
          {
            text: "Continue using helpful online tools while checking anything unusual.",
            tier: "safe",
            feedback: "That's the balance in one sentence."
          },
          {
            text: "Stop using the internet completely because one suspicious text appeared.",
            tier: "unsafe",
            feedback:
              "Four of those five things were completely normal. One suspicious text is a reason to check that text, not to give up the other four."
          }
        ],
        spotted: ["One unexpected bank text among four ordinary activities"]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Use the Internet Without Fear.",
      habit: "Use helpful online tools, notice unusual moments, pause, check, and continue with confidence.",
      warningSign: "Safety habits should keep your life open, not make your world smaller.",
      skills: [
        "Recognized normal online activity",
        "Noticed suspicious communication",
        "Avoided unnecessary fear",
        "Stayed connected and independent"
      ],
      next: "Your Online Safety Graduation"
    }
  },

  // ============================================================
  // LESSON 10.4 — GRADUATION
  // ============================================================
  {
    id: "scam-graduation",
    track: "scam",
    phase: 17,
    order: 4,
    lessonNumber: "10.4",
    title: "Your Online Safety Graduation",
    pathTitle: "Graduation",
    badge: "Scam Defense Specialist",
    xp: 100,
    goals: [
      "Combine every habit into one toolkit.",
      "Apply the toolkit across many situations at once."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Your Online Safety Graduation",
        question: "Am I ready to use what I learned?",
        objective:
          "Review the most important safety habits from the full curriculum and practice using them together.",
        warningSigns: ["Pause — slow down under pressure", "Protect — guard what opens doors", "Verify — use trusted paths", "Record — keep useful proof", "Ask — get help, give help", "Decide — the choice is yours"],
        text: "You do not need to memorize every lesson perfectly to be safer online. What matters is that you have built habits you can return to. Pause when something feels urgent, emotional, secretive, or too good to be true. Protect the information that opens doors to your accounts, money, and identity. Verify using trusted paths you choose. Keep records when something matters. Ask for help before acting when something feels risky, and help others calmly. Make the final decision after the pressure is gone. The goal is not perfection. The goal is: I know how to pause, check, and choose a safer next step."
      },
      {
        type: "tiered",
        title: "The master routine",
        scenario: "A message feels urgent, confusing, and money-related.",
        question: "Which routine is the best?",
        options: [
          {
            text: "Pause, protect private information, verify through a trusted source, save records if needed, ask for help, then decide.",
            tier: "best",
            feedback:
              "The full safety toolkit helps when several warning signs appear at once."
          },
          {
            text: "Slow down before money moves.",
            tier: "safe",
            feedback: "The single most protective habit in the course."
          },
          {
            text: "Act first and check later.",
            tier: "unsafe",
            feedback: "With money, there often is no later."
          }
        ]
      },
      {
        type: "tiered",
        title: "Private information",
        scenario:
          "A caller says, \"To prove your identity, read me the verification code we sent to your phone.\"",
        question: "What should you remember?",
        options: [
          {
            text: "Verification codes are private and should not be shared with callers or message senders.",
            tier: "best",
            feedback:
              "Verification codes are part of account protection and should be guarded carefully."
          },
          {
            text: "Contact the real company through an official route if you're worried.",
            tier: "safe",
            feedback: "They can tell you whether anything is actually happening."
          },
          {
            text: "Share the code because the caller said it proves your identity.",
            tier: "unsafe",
            feedback:
              "It proves your identity to a website — which is why they want it. It proves nothing to a caller."
          }
        ]
      },
      {
        type: "tiered",
        title: "Money safety",
        scenario:
          "An online seller says, \"Pay outside the marketplace through a direct payment app, and mark it as personal.\"",
        question: "Which response is the best?",
        options: [
          {
            text: "Stay inside trusted checkout or walk away from the purchase.",
            tier: "best",
            feedback:
              "How money moves matters. Safer paths provide more control, proof, and help."
          },
          {
            text: "Notice that leaving the platform may reduce records and support options.",
            tier: "safe",
            feedback: "Which is precisely why they asked."
          },
          {
            text: "Pay directly because the seller promised a discount.",
            tier: "unsafe",
            feedback:
              "\"Mark it as personal\" specifically removes buyer protection."
          }
        ]
      },
      {
        type: "tiered",
        title: "AI safety",
        scenario: "AI gives a confident answer about a health insurance deadline.",
        question: "What should you do?",
        options: [
          {
            text: "Use AI's answer as a starting point, then verify the deadline through the official insurance company or trusted support person.",
            tier: "best",
            feedback:
              "AI can help explain and organize, but serious decisions need verification."
          },
          {
            text: "Ask AI to help prepare questions for the insurance company.",
            tier: "safe",
            feedback: "Turns the answer into useful preparation."
          },
          {
            text: "Trust AI completely because it sounded certain.",
            tier: "unsafe",
            feedback: "Health coverage plus a deadline is high-risk by definition."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel using your online safety habits in real life?",
        practice: [
          {
            scenario:
              "A text from an unfamiliar number says, \"This is your grandson. I'm in trouble. Do not call anyone. Send money now.\"",
            question: "Which response is the best?",
            options: [
              {
                text: "Do not send money. Contact your grandson or another trusted family member using a saved number.",
                tier: "best",
                feedback: "You can care about someone while still verifying safely."
              },
              {
                text: "Treat secrecy, urgency, and money pressure as warning signs.",
                tier: "safe",
                feedback: "All three in one message."
              },
              {
                text: "Keep the secret and send money quickly.",
                tier: "unsafe",
                feedback: "\"Do not call anyone\" is the reason to call someone."
              }
            ]
          },
          {
            scenario:
              "An email says, \"Your account will close today. Click here to update your password.\"",
            question: "Which response is the best?",
            options: [
              {
                text: "Do not click the link. Go to the official app or website yourself to check the account.",
                tier: "best",
                feedback: "Urgency plus an account link means verify through a trusted path."
              },
              {
                text: "Ask a trusted person for help if unsure.",
                tier: "safe",
                feedback: "A second opinion settles it quickly."
              },
              {
                text: "Click because the email says the account will close today.",
                tier: "unsafe",
                feedback: "Password pages are the most commonly faked pages of all."
              }
            ]
          },
          {
            scenario: "A friend says, \"I think I clicked something bad. I'm embarrassed.\"",
            question: "Which response is the best?",
            options: [
              {
                text: "\"I'm glad you told me. Let's slow down and figure out the next safe step together.\"",
                tier: "best",
                feedback: "Kindness helps people stay open and take action."
              },
              {
                text: "Help them identify what information was shared.",
                tier: "safe",
                feedback: "That determines every step after."
              },
              {
                text: "\"How could you fall for that?\"",
                tier: "unsafe",
                feedback:
                  "That's the sentence that stops people telling anyone next time."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Phase 8 — Becoming Scam-Proof",
            note: "Pausing is powerful. You are always in control."
          },
          {
            lesson: "Phase 9 — The Warning Signs",
            note: "Unexpected contact, secrecy, rushing, strange payments, refusing verification."
          },
          {
            lesson: "Phase 10 — The Masks Scammers Wear",
            note: "The disguise changes. The warning signs don't."
          },
          {
            lesson: "Phases 11 & 15 — AI",
            note: "AI can make scams convincing, and AI itself can guess. You decide."
          },
          {
            lesson: "Phases 12, 13 & 14 — Information, Communication, Money",
            note: "Protect what opens doors, handle messages carefully, and check before money moves."
          },
          {
            lesson: "Phase 16 — Helping Others Stay Safe",
            note: "Help without shame and bring in trusted support when needed."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The graduation challenge",
        setup:
          "You're having a busy week online. Six things happen.",
        messages: [
          {
            from: "1 · Text",
            body: "Your package is delayed. Pay $1.75 here to release delivery.",
            fakeButton: "Pay now"
          },
          {
            from: "2 · Phone call",
            body:
              "This is bank security. Your account is in danger. Read me the verification code we sent so we can protect you."
          },
          {
            from: "3 · Marketplace seller",
            body:
              "Pay me directly through a payment app and mark it as personal. Do not use the marketplace checkout."
          },
          {
            from: "4 · AI chatbot",
            body: "That tablet deal looks like a great bargain."
          },
          {
            from: "5 · Text from unfamiliar number",
            body: "Grandma, it's Daniel. I'm in trouble. Please don't tell Mom. I need money today."
          },
          {
            from: "6 · Your friend, calling",
            body: "I clicked a bank link and typed my password. I feel so stupid."
          }
        ],
        question: "What should you do?",
        options: [
          {
            text: "Use your safety toolkit: check the package through the official store or delivery app, do not share the bank verification code, avoid paying the seller outside the marketplace, treat AI's answer as something to review, verify the family message through a saved family contact, and help your friend calmly secure their account through the official bank app.",
            tier: "best",
            feedback:
              "You completed the graduation challenge. You paused under pressure, protected codes and payment information, verified through trusted paths, knew what to record, asked for and offered help, and made every decision after checking."
          },
          {
            text: "Pause, protect private information, verify through trusted sources, save records when needed, ask for help, and decide after checking.",
            tier: "safe",
            feedback:
              "The toolkit stated in full — and it applies to all six situations."
          },
          {
            text: "Trust the messages because they use familiar details and sound urgent.",
            tier: "unsafe",
            feedback:
              "Familiar details and urgency are the two things every one of these six situations has in common — and they're exactly what the whole course taught you to notice."
          }
        ],
        spotted: [
          "Small delivery fee through a text link",
          "Caller asking for a verification code",
          "Direct payment outside marketplace checkout",
          "A confident AI answer that needed review",
          "Family emergency from an unfamiliar number",
          "A friend feeling ashamed after sharing a password"
        ]
      }
    ],
    quiz: [],
    complete: {
      title: "🎓 Congratulations — you've graduated!",
      subtitle: "You completed Your Online Safety Graduation and the entire Scam Protection course.",
      habit: "Use your full toolkit: pause, protect, verify, record, ask, decide.",
      warningSign: "You don't need to be perfect. You need habits you can trust.",
      skills: [
        "Recognized warning signs across every channel",
        "Protected codes, passwords, and payment information",
        "Verified through trusted sources",
        "Used AI as a helper, not an authority",
        "Helped someone without shame",
        "Stayed calm under pressure"
      ],
      learned: [
        "Online safety is not about fear. It is about freedom, confidence, and habits you can trust.",
        "Pause. Protect. Verify. Record. Ask. Decide.",
        "Online confidence is built one safe choice at a time."
      ],
      next: "You've completed the course"
    }
  }
];

export default scamPhase10Lessons;
