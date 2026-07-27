// Everwise - Scam Protection track
// Phase 11: When AI Enters the Conversation
//
// Big idea: AI can make conversations, photos, videos, and messages seem more
// believable — but the safety habits already built still protect you.
//
// The Final Bosses deliberately escalate: 4.1 is text only, and by 4.4 the
// learner faces text + voice + video + urgency together.

const AI_HABITS = [
  "Slow down",
  "Verify important information",
  "Ask questions",
  "Make the final decision yourself",
];

export const scamPhase4Lessons = [
  // ============================================================
  // LESSON 4.1
  // ============================================================
  {
    id: "scam-ai-written-words",
    track: "scam",
    phase: 11,
    order: 1,
    lessonNumber: "4.1",
    title: "When Words Aren't Written by People",
    pathTitle: "AI-Written Words",
    badge: "Message Reader",
    xp: 20,
    goals: [
      "Understand that good grammar no longer proves a message is real.",
      "Judge a message by what it asks you to do."
    ],
    blocks: [
      {
        type: "reading",
        heading: "When Words Aren't Written by People",
        question: "How do I know if this message was written by a person or AI?",
        objective:
          "Learn that messages can now be written by artificial intelligence, making them sound more natural and convincing than ever before.",
        warningSigns: AI_HABITS,
        text: "Years ago, scam messages were often easy to spot because they contained spelling mistakes or awkward wording. Today, artificial intelligence can write clear, friendly, and professional messages in just a few seconds. That means a message can sound convincing whether it was written by a person or by AI. Instead of judging a message by how well it's written, focus on what it's asking you to do."
      },
      {
        type: "tiered",
        title: "Spot the change",
        scenario:
          "You receive an email with perfect spelling and grammar asking you to confirm your bank account information.",
        question: "What should you remember?",
        options: [
          {
            text: "A well-written message can still be fake.",
            tier: "best",
            feedback:
              "AI can write messages that sound professional. The quality of the writing is no longer a reliable clue."
          },
          {
            text: "I should verify the request before responding.",
            tier: "safe",
            feedback:
              "Exactly the right action — and the reason is that good writing no longer proves anything."
          },
          {
            text: "Good grammar means the message is trustworthy.",
            tier: "unsafe",
            feedback:
              "That used to be a useful rule. AI has retired it."
          }
        ]
      },
      {
        type: "tiered",
        title: "Choose the safest response",
        scenario:
          "A professional-looking message says, \"Your account has unusual activity. Please click below to confirm your information.\"",
        question: "Which response is the best?",
        options: [
          {
            text: "Visit your bank's official website or call them using a trusted phone number.",
            tier: "best",
            feedback:
              "Instead of judging how the message looks, you judged what it was asking you to do."
          },
          {
            text: "Wait until you can verify the request yourself.",
            tier: "safe",
            feedback: "Waiting costs nothing and keeps you in control."
          },
          {
            text: "Click the link because the email looks official.",
            tier: "unsafe",
            feedback:
              "Looking official is now trivially easy. The request is what matters."
          }
        ]
      },
      {
        type: "tiered",
        title: "Apply the lesson",
        scenario:
          "Someone sends you a polite email offering a prize if you respond today.",
        question: "Which response is the best?",
        options: [
          {
            text: "Verify the offer before responding.",
            tier: "best",
            feedback: "Friendly language is not proof that a message is genuine."
          },
          {
            text: "Ignore the message until you know it's real.",
            tier: "safe",
            feedback: "Ignoring is perfectly safe — a real prize will wait."
          },
          {
            text: "Trust the message because it sounds friendly.",
            tier: "unsafe",
            feedback: "AI writes friendly text as easily as formal text."
          }
        ]
      },
      {
        type: "tiered",
        title: "Connect previous lessons",
        scenario:
          "You receive a perfectly written email claiming to be from your electric company. It says your service may be disconnected today unless you confirm your account information using the link provided.",
        question: "Which response is safe?",
        options: [
          {
            text: "Contact your electric company using the phone number on your bill.",
            tier: "best",
            feedback:
              "The message looked different from older scam emails, but the warning signs stayed the same: unexpected request, urgency, and being pushed toward their link instead of independent verification."
          },
          {
            text: "Log into your account yourself to check for notices.",
            tier: "safe",
            feedback: "Your own account is a trusted source."
          },
          {
            text: "Click the email link because it looks professional.",
            tier: "unsafe",
            feedback:
              "Professionalism is exactly what AI added to these messages. The warning signs didn't change."
          }
        ]
      },
      {
        type: "confidence",
        question:
          "How confident do you feel recognizing that AI can write convincing messages?",
        practice: [
          {
            scenario:
              "A text message has perfect grammar and asks you to verify your password.",
            question: "Which response is best?",
            options: [
              {
                text: "Verify through the company's official website.",
                tier: "best",
                feedback: "No company needs your password by text."
              },
              {
                text: "Ignore the message until you've checked your account.",
                tier: "safe",
                feedback: "Safe and simple."
              },
              {
                text: "Trust it because it was written well.",
                tier: "unsafe",
                feedback: "Writing quality proves nothing now."
              }
            ]
          },
          {
            scenario:
              "Someone says, \"You can always tell a scam because it has bad spelling.\"",
            question: "Which answer is correct?",
            options: [
              {
                text: "That used to be more common, but AI can now write very professional messages.",
                tier: "best",
                feedback:
                  "This is one of the biggest changes AI has brought to scams."
              },
              {
                text: "Good writing alone doesn't prove something is real.",
                tier: "safe",
                feedback: "Correct — appearance and honesty are separate things."
              },
              {
                text: "That's always true.",
                tier: "unsafe",
                feedback:
                  "It's a dangerous rule to rely on today. Many scam messages are now flawless."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 1.4 — Stop, Verify, Then Decide",
            note: "A convincing message still needs verification."
          },
          {
            lesson: "Lesson 3.7 — Deliveries & Packages",
            note: "You learned not to trust a text just because it looked real. AI makes those messages look even better — your response stays the same."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The perfect email",
        setup:
          "An email arrives. It uses your name, has perfect grammar, and includes the bank's logo. Nothing looks suspicious.",
        messages: [
          {
            from: "Email · Your Bank",
            body:
              "Dear [your name], our systems detected unusual activity on your account. For your protection, please review and confirm your recent transactions.",
            fakeButton: "Secure your account"
          }
        ],
        question: "Which response is the best first step?",
        options: [
          {
            text: "Close the email and contact your bank using the number on your card or by logging into your account yourself.",
            tier: "best",
            feedback:
              "This lesson wasn't about spotting spelling mistakes — it was about remembering that appearance alone isn't proof. AI can create messages that look professional, but verifying independently still protects you."
          },
          {
            text: "Wait until you can verify the information through the bank's official website.",
            tier: "safe",
            feedback: "Waiting and verifying is exactly right."
          },
          {
            text: "Click the \"Secure Your Account\" button because the email looks authentic.",
            tier: "unsafe",
            feedback:
              "There was nothing to spot — and that's the point. The old clues are gone, so the habit of verifying independently is what remains."
          }
        ],
        spotted: ["Unexpected contact", "Pressure to act", "Refusing independent verification"]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed When Words Aren't Written by People.",
      habit: "Judge a message by what it asks you to do — not by how well it's written.",
      warningSign: "A flawless message asking for something unexpected.",
      skills: [
        "Looked beyond appearances",
        "Verified independently",
        "Recognized AI's influence on messages"
      ],
      next: "When the Voice Isn't Real"
    }
  },

  // ============================================================
  // LESSON 4.2
  // ============================================================
  {
    id: "scam-ai-voice",
    track: "scam",
    phase: 11,
    order: 2,
    lessonNumber: "4.2",
    title: "When the Voice Isn't Real",
    pathTitle: "Cloned Voices",
    badge: "Voice Verifier",
    xp: 20,
    goals: [
      "Understand that AI can copy a familiar voice.",
      "Verify through a number you already have, not the call you received."
    ],
    blocks: [
      {
        type: "reading",
        heading: "When the Voice Isn't Real",
        question: "What if the voice sounds exactly like someone I know?",
        objective:
          "Learn that AI can copy a person's voice, so a familiar voice alone is no longer proof of someone's identity.",
        warningSigns: AI_HABITS,
        text: "AI can now create voices that sound surprisingly similar to real people. A scammer might use technology to imitate a family member, a friend, or even someone famous. Hearing a familiar voice can make you feel like you should act quickly, but your ears alone are no longer enough to confirm who is speaking. If a call feels unusual, end the conversation and contact the person using a phone number you already know."
      },
      {
        type: "tiered",
        title: "Spot the new risk",
        scenario:
          "You receive a phone call that sounds exactly like your grandson. He says, \"Grandma, I need your help right away.\"",
        question: "What should you remember first?",
        options: [
          {
            text: "A familiar voice is not enough to prove someone's identity.",
            tier: "best",
            feedback:
              "AI can imitate voices. A familiar voice should encourage you to verify — not rush."
          },
          {
            text: "I should verify who is calling before taking action.",
            tier: "safe",
            feedback: "The right action, for exactly the right reason."
          },
          {
            text: "If I recognize the voice, I know it's really him.",
            tier: "unsafe",
            feedback:
              "This was true for most of history. It isn't anymore, and scammers know it."
          }
        ]
      },
      {
        type: "tiered",
        title: "Choose the safest response",
        scenario:
          "The caller says, \"Please don't call Mom or Dad. I just need you to help me.\"",
        question: "Which response is the best?",
        options: [
          {
            text: "End the call and contact your grandson or another family member using a number you already have.",
            tier: "best",
            feedback:
              "Ending the call puts you back in control and lets you verify independently."
          },
          {
            text: "Tell the caller you'll call back after checking.",
            tier: "safe",
            feedback: "Good — just be sure to use your own saved number."
          },
          {
            text: "Stay on the line and continue the conversation.",
            tier: "unsafe",
            feedback:
              "Staying on the line is how they prevent you from checking. Notice the secrecy request too."
          }
        ]
      },
      {
        type: "tiered",
        title: "Apply the lesson",
        scenario: "The caller sounds upset and says, \"There's no time to explain!\"",
        question: "Which response is the best?",
        options: [
          {
            text: "Slow down and verify the situation before taking any action.",
            tier: "best",
            feedback:
              "Strong emotions are often used to make people act without thinking."
          },
          {
            text: "Tell them you'll help after you've confirmed what's happening.",
            tier: "safe",
            feedback: "A clear, kind boundary."
          },
          {
            text: "Act immediately because they sound scared.",
            tier: "unsafe",
            feedback:
              "Sounding scared is now something software can produce on demand."
          }
        ]
      },
      {
        type: "tiered",
        title: "Connect previous lessons",
        scenario:
          "The caller sounds exactly like your granddaughter. She asks you to buy gift cards immediately and read the numbers over the phone.",
        question: "Which response is safe?",
        options: [
          {
            text: "End the call and contact your granddaughter using a trusted phone number.",
            tier: "best",
            feedback:
              "Even though AI made the voice convincing, you recognized familiar warning signs: pressure, secrecy, and a strange payment request."
          },
          {
            text: "Call another family member to verify the situation.",
            tier: "safe",
            feedback: "Another trusted route to the same answer."
          },
          {
            text: "Buy the gift cards because the voice sounds real.",
            tier: "unsafe",
            feedback:
              "The gift cards give it away regardless of the voice. No real emergency is solved that way."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel recognizing that AI can imitate voices?",
        practice: [
          {
            scenario:
              "Someone who sounds like your daughter asks you to send money immediately.",
            question: "Which response is the best?",
            options: [
              {
                text: "End the call and contact your daughter yourself.",
                tier: "best",
                feedback: "One call to her real number settles it."
              },
              {
                text: "Verify with another trusted family member.",
                tier: "safe",
                feedback: "Also effective."
              },
              {
                text: "Send the money because you recognize the voice.",
                tier: "unsafe",
                feedback: "Recognition is no longer identification."
              }
            ]
          },
          {
            scenario:
              "A familiar voice tells you, \"Don't tell anyone until I explain.\"",
            question: "Which response is the best?",
            options: [
              {
                text: "Verify the situation independently before continuing.",
                tier: "best",
                feedback:
                  "Secrecy plus a familiar voice is a combination worth stopping for."
              },
              {
                text: "End the call and check with another family member.",
                tier: "safe",
                feedback: "Breaking the isolation is the key move."
              },
              {
                text: "Keep the conversation secret.",
                tier: "unsafe",
                feedback: "Secrecy is what makes the scam survive."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 2.5 — Always Verify",
            note: "The safest way to know who's calling is to contact them yourself."
          },
          {
            lesson: "Lesson 3.5 — Someone You Love",
            note: "You learned emotions can rush your decisions. AI now makes those conversations sound even more convincing."
          }
        ]
      },
      {
        type: "finalboss",
        title: "\"Grandma, it's me\"",
        setup:
          "Your phone rings. The caller sounds exactly like your grandson, and his voice is shaky. You can hear traffic in the background.",
        messages: [
          {
            from: "Incoming call · Unknown number",
            body:
              "Grandma... it's me. I was in a small car accident. I'm okay, but I need help right now. My phone is almost dead, so please don't hang up. I don't want Mom and Dad to worry until I figure this out. Can you send money through a payment app so I can get home?"
          }
        ],
        question: "What should you do first?",
        options: [
          {
            text: "End the call and contact your grandson or another trusted family member using a phone number you already have.",
            tier: "best",
            feedback:
              "This was difficult because the voice sounded real. But you remembered the main idea: a familiar voice is no longer proof of identity. Instead of trusting what you heard, you trusted your safety habits."
          },
          {
            text: "Tell the caller you'll verify the situation before helping.",
            tier: "safe",
            feedback:
              "A reasonable boundary — just make sure you actually hang up and call the number you have."
          },
          {
            text: "Send the money because the voice sounds exactly like him.",
            tier: "unsafe",
            feedback:
              "The voice was the bait, and it can be cloned from a few seconds of audio. Everything else was a warning sign: don't hang up, don't tell your parents, send money now."
          }
        ],
        spotted: [
          "Unexpected contact",
          "Requests for secrecy",
          "Pressure to hurry",
          "Refusing independent verification"
        ]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed When the Voice Isn't Real.",
      habit: "Trust your verification process — not a familiar voice.",
      warningSign: "A familiar voice you didn't expect to hear.",
      skills: [
        "Verified independently",
        "Stayed calm during an emotional call",
        "Recognized AI voice cloning"
      ],
      next: "When the Picture Never Happened"
    }
  },

  // ============================================================
  // LESSON 4.3
  // ============================================================
  {
    id: "scam-ai-images",
    track: "scam",
    phase: 11,
    order: 3,
    lessonNumber: "4.3",
    title: "When the Picture Never Happened",
    pathTitle: "Fake Images",
    badge: "Image Checker",
    xp: 20,
    goals: [
      "Understand that AI can create realistic images of things that never happened.",
      "Verify a surprising image before believing or sharing it."
    ],
    blocks: [
      {
        type: "reading",
        heading: "When the Picture Never Happened",
        question: "Can I trust a picture just because it looks real?",
        objective:
          "Learn that AI can create realistic images that never actually happened, so a convincing picture alone is not proof that something is real.",
        warningSigns: AI_HABITS,
        text: "For many years, people believed that \"seeing is believing.\" Today, artificial intelligence can create pictures of people, places, and events that never happened. Some AI images are harmless, like artwork or imaginary animals, while others are made to trick people into believing something is true. Before believing or sharing an unexpected image, take a moment to ask where it came from and whether a trusted source confirms it."
      },
      {
        type: "tiered",
        title: "Spot the new risk",
        scenario:
          "A friend sends you a picture of a famous actor standing on the moon. The picture looks incredibly realistic.",
        question: "What should you remember?",
        options: [
          {
            text: "A realistic picture can still be created by AI.",
            tier: "best",
            feedback:
              "AI can create pictures that look surprisingly realistic. A convincing image isn't proof that it actually happened."
          },
          {
            text: "It's okay to verify where the picture came from.",
            tier: "safe",
            feedback: "Checking the source is exactly the right instinct."
          },
          {
            text: "If it looks real, it must be real.",
            tier: "unsafe",
            feedback:
              "Realism is now something software produces on request."
          }
        ]
      },
      {
        type: "tiered",
        title: "Choose the safest response",
        scenario:
          "You see an image online claiming a local bridge has collapsed. The post is being shared by many people.",
        question: "Which response is the best?",
        options: [
          {
            text: "Check a trusted local news source before believing or sharing it.",
            tier: "best",
            feedback: "Lots of shares don't make a picture true."
          },
          {
            text: "Wait until you can learn more before sharing it.",
            tier: "safe",
            feedback: "Not sharing is always safe."
          },
          {
            text: "Share it immediately because everyone else is.",
            tier: "unsafe",
            feedback:
              "Sharing spreads it further, and popularity is not evidence."
          }
        ]
      },
      {
        type: "tiered",
        title: "Apply the lesson",
        scenario:
          "A picture appears to show a frightened child asking for donations after a natural disaster.",
        question: "Which response is the best?",
        options: [
          {
            text: "Verify the charity or story before donating or sharing.",
            tier: "best",
            feedback:
              "Scammers sometimes use emotional images to encourage quick decisions. Your habit is to pause and verify."
          },
          {
            text: "Look for the same story from trusted news organizations.",
            tier: "safe",
            feedback: "A good cross-check."
          },
          {
            text: "Donate immediately because the picture is emotional.",
            tier: "unsafe",
            feedback:
              "The emotion is the point of the image. Real charities can be verified."
          }
        ]
      },
      {
        type: "tiered",
        title: "Connect previous lessons",
        scenario:
          "A social media post shows what appears to be your bank's building damaged by fire. The post says customers must immediately move their money using a provided link before accounts are frozen.",
        question: "Which response is safe?",
        options: [
          {
            text: "Ignore the post and contact your bank through its official website or phone number.",
            tier: "best",
            feedback:
              "The picture looked believable, but you recognized familiar warning signs: urgency, an unexpected request, and no independent verification. The technology changed. Your habits didn't."
          },
          {
            text: "Wait until trusted news or your bank confirms the information.",
            tier: "safe",
            feedback: "Nothing is lost by waiting."
          },
          {
            text: "Use the link because the picture looks convincing.",
            tier: "unsafe",
            feedback:
              "\"Move your money now\" is the same scam you met in Lesson 3.3, with a new photograph attached."
          }
        ]
      },
      {
        type: "confidence",
        question:
          "How confident do you feel recognizing that AI can create realistic images?",
        practice: [
          {
            scenario:
              "Someone sends you a realistic picture claiming your town is flooding.",
            question: "Which response is the best?",
            options: [
              {
                text: "Check trusted local news before believing or sharing it.",
                tier: "best",
                feedback: "Local emergencies are always reported by local news."
              },
              {
                text: "Wait for more information.",
                tier: "safe",
                feedback: "Perfectly reasonable."
              },
              {
                text: "Share it immediately because it looks real.",
                tier: "unsafe",
                feedback: "Sharing unverified alarm helps no one."
              }
            ]
          },
          {
            scenario:
              "A picture online seems shocking and makes you want to warn everyone immediately.",
            question: "Which response is the best?",
            options: [
              {
                text: "Pause and verify the picture before sharing it.",
                tier: "best",
                feedback: "The urge to warn people is exactly what's being used."
              },
              {
                text: "Search for trusted sources reporting the same event.",
                tier: "safe",
                feedback: "A solid check."
              },
              {
                text: "Share it first and verify later.",
                tier: "unsafe",
                feedback: "By then it has already spread."
              }
            ]
          }
        ]
      },
      {
        type: "finalboss",
        title: "The neighbor at the door",
        setup:
          "One afternoon, your neighbor knocks on your door looking concerned. They show you a photo on their phone that appears to show your local grocery store badly damaged after a fire.",
        messages: [
          {
            from: "Your neighbor, in person",
            body:
              "I saw this online just a few minutes ago. Everyone's rushing to buy food before the store closes. I'm heading there now — you should come too before it's too late."
          }
        ],
        question: "What should you do first?",
        options: [
          {
            text: "Check a trusted local news source or the grocery store's official website before believing the picture or changing your plans.",
            tier: "best",
            feedback:
              "The picture seemed believable, and your neighbor was genuinely trying to help. But instead of reacting to the image, you relied on your safety habits: a realistic picture isn't proof that something really happened."
          },
          {
            text: "Thank your neighbor and tell them you'd like to verify the information first.",
            tier: "safe",
            feedback:
              "Kind and sensible — your neighbor may be passing on something they were fooled by too."
          },
          {
            text: "Go immediately because the picture looks convincing.",
            tier: "unsafe",
            feedback:
              "Notice that the person showing you the photo was completely sincere. Sincerity doesn't verify an image — and a real fire would be all over local news."
          }
        ],
        spotted: ["An image used as proof", "Pressure to hurry", "No independent verification"]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed When the Picture Never Happened.",
      habit: "A picture can be convincing. Verify it before believing or sharing it.",
      warningSign: "A shocking image with no trusted source behind it.",
      skills: [
        "Looked beyond appearances",
        "Verified with trusted sources",
        "Resisted emotional pressure"
      ],
      next: "When Videos Can Lie"
    }
  },

  // ============================================================
  // LESSON 4.4
  // ============================================================
  {
    id: "scam-ai-video",
    track: "scam",
    phase: 11,
    order: 4,
    lessonNumber: "4.4",
    title: "When Videos Can Lie",
    pathTitle: "Deepfake Video",
    badge: "Video Verifier",
    xp: 20,
    goals: [
      "Understand what a deepfake video is.",
      "Verify a surprising video before believing or acting on it."
    ],
    blocks: [
      {
        type: "reading",
        heading: "When Videos Can Lie",
        question: "Can I trust a video just because I can see and hear it?",
        objective:
          "Learn that AI can create videos of people appearing to say or do things that never actually happened.",
        warningSigns: AI_HABITS,
        text: "Videos have always felt like strong evidence because they let us both see and hear someone. Today, AI can create or change videos so that people appear to say words they never spoke. These videos are sometimes called deepfakes. Some are created for entertainment, while others are designed to spread false information or trick people. If a surprising video asks you to believe something important or take action, verify it before trusting or sharing it."
      },
      {
        type: "tiered",
        title: "Spot the new risk",
        scenario:
          "You see a video online of a well-known public figure saying something shocking.",
        question: "What should you remember?",
        options: [
          {
            text: "A video can be created or changed using AI.",
            tier: "best",
            feedback:
              "Seeing and hearing something isn't always enough to prove it's true."
          },
          {
            text: "I should look for trusted sources reporting the same event.",
            tier: "safe",
            feedback: "Anything genuinely shocking would be widely reported."
          },
          {
            text: "If it's on video, it must be true.",
            tier: "unsafe",
            feedback: "Video used to be strong evidence. AI weakened that."
          }
        ]
      },
      {
        type: "tiered",
        title: "Choose the safest response",
        scenario:
          "A friend sends you a surprising video and writes, \"Everyone needs to see this!\"",
        question: "Which response is the best?",
        options: [
          {
            text: "Verify the story with trusted news sources before sharing it.",
            tier: "best",
            feedback:
              "The safest habit is to verify before passing information to others."
          },
          {
            text: "Wait until you know more about where the video came from.",
            tier: "safe",
            feedback: "Source matters more than content."
          },
          {
            text: "Share it immediately because it looks convincing.",
            tier: "unsafe",
            feedback:
              "Convincing is the goal of a deepfake. Sharing lends it your credibility."
          }
        ]
      },
      {
        type: "tiered",
        title: "Apply the lesson",
        scenario:
          "A video makes you feel angry and encourages viewers to act immediately.",
        question: "Which response is the best?",
        options: [
          {
            text: "Pause and verify the video's claims before taking action.",
            tier: "best",
            feedback:
              "Strong emotions make anyone more likely to act quickly. Slowing down protects you."
          },
          {
            text: "Look for multiple trusted sources reporting the same story.",
            tier: "safe",
            feedback: "Multiple sources is the standard test."
          },
          {
            text: "Act immediately because the video feels convincing.",
            tier: "unsafe",
            feedback:
              "Anger plus urgency is a deliberate combination."
          }
        ]
      },
      {
        type: "tiered",
        title: "Connect previous lessons",
        scenario:
          "A video appears to show your bank's president announcing that all customers must update their accounts today using a link shown on screen.",
        question: "Which response is safe?",
        options: [
          {
            text: "Contact your bank using the official phone number or website you already trust.",
            tier: "best",
            feedback:
              "You remembered that AI can create convincing messages, voices, and videos — but your habits remain the same: verify independently, don't rush, ignore unexpected links."
          },
          {
            text: "Ignore the link and verify the announcement independently.",
            tier: "safe",
            feedback: "Exactly the right split — ignore their route, choose yours."
          },
          {
            text: "Follow the instructions because the speaker appears on video.",
            tier: "unsafe",
            feedback:
              "A face and a voice on screen are now both things AI can generate."
          }
        ]
      },
      {
        type: "confidence",
        question:
          "How confident do you feel recognizing that videos can be created or changed with AI?",
        practice: [
          {
            scenario: "A video claims your local water supply is unsafe.",
            question: "Which response is the best?",
            options: [
              {
                text: "Check your local government or water provider before believing it.",
                tier: "best",
                feedback: "Official sources handle real public-safety notices."
              },
              {
                text: "Wait until trusted news confirms the story.",
                tier: "safe",
                feedback: "Sensible."
              },
              {
                text: "Share the video immediately to warn everyone.",
                tier: "unsafe",
                feedback:
                  "Spreading an unverified health scare can cause real harm."
              }
            ]
          },
          {
            scenario:
              "Someone says, \"You can always trust a video because you can see the person talking.\"",
            question: "Which response is the best?",
            options: [
              {
                text: "AI can create or change videos, so important information should always be verified.",
                tier: "best",
                feedback: "This is the core change of the last few years."
              },
              {
                text: "Videos are helpful, but they are not proof by themselves.",
                tier: "safe",
                feedback: "Well put."
              },
              {
                text: "Videos can't be faked.",
                tier: "unsafe",
                feedback: "They can, and increasingly convincingly."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 4.2 — When the Voice Isn't Real",
            note: "AI can combine a realistic voice with a realistic video."
          },
          {
            lesson: "Lesson 4.3 — When the Picture Never Happened",
            note: "Just as pictures can be fake, videos can be created or changed too."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The emergency broadcast",
        setup:
          "While watching videos online, you see what appears to be an emergency announcement from your city's mayor. The video looks professional and the voice sounds natural. Thousands of comments say things like \"I just registered!\" and \"Everyone do this now!\"",
        messages: [
          {
            from: "Video · \"Office of the Mayor\"",
            body:
              "There has been a dangerous chemical spill in our city. All residents must click the link below to register for emergency assistance before the end of the day.",
            fakeButton: "Register for assistance"
          }
        ],
        question: "What should you do first?",
        options: [
          {
            text: "Check your city's official website or trusted local news before believing the announcement or clicking any links.",
            tier: "best",
            feedback:
              "This scenario combined everything you've learned: the message sounded convincing, the voice sounded real, and the video looked authentic. But instead of trusting appearances, you slowed down, verified independently, and didn't let urgency control your decision."
          },
          {
            text: "Wait for confirmation from multiple official sources.",
            tier: "safe",
            feedback:
              "A genuine emergency would be announced through many channels at once."
          },
          {
            text: "Click the link because the video looks like an official emergency announcement.",
            tier: "unsafe",
            feedback:
              "Every layer here was manufactured — the face, the voice, the professional look, even the comments. Real emergency information never lives behind a single link."
          }
        ],
        spotted: [
          "Unexpected contact",
          "Pressure to hurry",
          "An unverified link",
          "Refusing independent verification"
        ]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed When Videos Can Lie.",
      habit: "A convincing video is not proof. Verify important information before acting.",
      warningSign: "A shocking video that wants immediate action.",
      skills: [
        "Recognized AI-generated video",
        "Verified with official sources",
        "Resisted urgency",
        "Ignored crowd pressure"
      ],
      next: "When AI Answers Back"
    }
  },

  // ============================================================
  // LESSON 4.5
  // ============================================================
  {
    id: "scam-ai-chatbots",
    track: "scam",
    phase: 11,
    order: 5,
    lessonNumber: "4.5",
    title: "When AI Answers Back",
    pathTitle: "AI Chatbots",
    badge: "AI Helper",
    xp: 20,
    goals: [
      "Use AI chatbots for everyday tasks with confidence.",
      "Verify AI answers that affect health, money, or safety."
    ],
    blocks: [
      {
        type: "reading",
        heading: "When AI Answers Back",
        question: "Can I trust everything an AI chatbot tells me?",
        objective:
          "Learn that AI chatbots can be helpful for everyday questions, but they can sometimes give incorrect or incomplete answers.",
        warningSigns: AI_HABITS,
        text: "AI chatbots can answer questions, explain ideas, help write letters, and even suggest recipes or vacation plans. They can be useful everyday tools. However, AI doesn't always know when it's wrong. Sometimes it gives outdated, incomplete, or incorrect information while sounding very confident. For everyday questions, AI can be a great helper. For important decisions involving your health, money, or personal information, it's always smart to double-check with a trusted source."
      },
      {
        type: "tiered",
        title: "Know when AI helps",
        scenario:
          "You want ideas for meals using the food already in your kitchen.",
        question: "Which response is the best?",
        options: [
          {
            text: "Asking an AI chatbot for recipe ideas is a good use of AI.",
            tier: "best",
            feedback: "AI is excellent for brainstorming and everyday tasks."
          },
          {
            text: "AI can help organize your shopping list.",
            tier: "safe",
            feedback: "Another good everyday use."
          },
          {
            text: "AI should make all important life decisions for you.",
            tier: "unsafe",
            feedback:
              "Helpful for ideas, not a substitute for your judgment on things that matter."
          }
        ]
      },
      {
        type: "tiered",
        title: "Know when to verify",
        scenario:
          "An AI chatbot gives you advice about changing your retirement investments.",
        question: "Which response is the best?",
        options: [
          {
            text: "Verify the advice before making financial decisions.",
            tier: "best",
            feedback:
              "AI can provide useful information, but important financial decisions deserve extra verification."
          },
          {
            text: "Ask a qualified financial professional if you're unsure.",
            tier: "safe",
            feedback: "A professional can account for your specific situation."
          },
          {
            text: "Make the investment immediately because AI sounds confident.",
            tier: "unsafe",
            feedback:
              "Confidence isn't accuracy — and your retirement is not the place to find that out."
          }
        ]
      },
      {
        type: "tiered",
        title: "Apply the lesson",
        scenario:
          "You ask an AI chatbot a question about a medication. The answer sounds detailed, but you're unsure.",
        question: "Which response is the best?",
        options: [
          {
            text: "Check with your doctor, pharmacist, or another trusted medical source.",
            tier: "best",
            feedback:
              "AI can explain information, but healthcare decisions should always be verified with trusted professionals."
          },
          {
            text: "Use AI to help you understand the topic, but verify medical advice.",
            tier: "safe",
            feedback: "A good balance — learn from it, decide with a professional."
          },
          {
            text: "Assume the answer is correct because it sounds professional.",
            tier: "unsafe",
            feedback:
              "Detailed writing and correct information are two different things."
          }
        ]
      },
      {
        type: "tiered",
        title: "Connect previous lessons",
        scenario:
          "An AI chatbot writes an email for you asking your bank about a suspicious charge.",
        question: "Which response is safe?",
        options: [
          {
            text: "Read the email before sending it and make sure it's accurate.",
            tier: "best",
            feedback:
              "AI can save time, but you're still responsible for what gets sent. Always review important messages."
          },
          {
            text: "Edit the message so it clearly reflects what you want to say.",
            tier: "safe",
            feedback: "Your own words carry your meaning best."
          },
          {
            text: "Send it without reading because AI wrote it.",
            tier: "unsafe",
            feedback:
              "It goes out under your name, so it needs your eyes first."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel using an AI chatbot safely?",
        practice: [
          {
            scenario: "You ask AI to explain a gardening problem.",
            question: "Which response is the best?",
            options: [
              {
                text: "AI is a good place to start for everyday questions.",
                tier: "best",
                feedback: "Low stakes, easy to check, genuinely useful."
              },
              {
                text: "Compare its advice with another trusted source if needed.",
                tier: "safe",
                feedback: "Sensible for anything you'll act on."
              },
              {
                text: "AI is always correct.",
                tier: "unsafe",
                feedback: "It is not, and it rarely says so."
              }
            ]
          },
          {
            scenario:
              "AI tells you that you qualify for a government benefit you've never heard of.",
            question: "Which response is the best?",
            options: [
              {
                text: "Verify the information using an official government website before acting.",
                tier: "best",
                feedback: "Benefits information changes often and varies by location."
              },
              {
                text: "Ask AI where you can find the official information.",
                tier: "safe",
                feedback: "A good use — let it point you to the real source."
              },
              {
                text: "Apply immediately because AI told you.",
                tier: "unsafe",
                feedback: "Verify eligibility with the agency itself."
              }
            ]
          }
        ]
      },
      {
        type: "finalboss",
        title: "Planning a trip",
        setup:
          "You're planning a weekend trip to visit family. You ask an AI chatbot to recommend a hotel, suggest a scenic route, and tell you the hotel's cancellation policy. The AI gives you a detailed, organized answer with hotel names, driving times, and policy information.",
        question: "What should you do before booking?",
        options: [
          {
            text: "Check the hotel's official website to confirm availability, prices, and cancellation policies before making a reservation.",
            tier: "best",
            feedback:
              "This lesson wasn't about spotting a scam — it was about using AI wisely. You let AI help you, but you remembered that important details should still be verified before making a decision."
          },
          {
            text: "Compare the recommendation with another trusted travel website.",
            tier: "safe",
            feedback: "A reasonable cross-check."
          },
          {
            text: "Book the hotel immediately because the AI gave a detailed answer.",
            tier: "unsafe",
            feedback:
              "Prices, availability, and cancellation policies change constantly — exactly the kind of detail AI is most likely to have wrong."
          }
        ],
        spotted: []
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed When AI Answers Back.",
      habit: "Let AI help you think — but verify before making important decisions.",
      warningSign: "Acting on an AI answer without checking it.",
      skills: [
        "Used AI for everyday tasks",
        "Verified important information",
        "Reviewed AI-written content before sending"
      ],
      next: "When AI Sounds Certain"
    }
  },

  // ============================================================
  // LESSON 4.6
  // ============================================================
  {
    id: "scam-ai-confidence",
    track: "scam",
    phase: 11,
    order: 6,
    lessonNumber: "4.6",
    title: "When AI Sounds Certain",
    pathTitle: "AI Sounds Certain",
    badge: "Confidence Checker",
    xp: 20,
    goals: [
      "Understand that AI can be confidently wrong.",
      "Verify anything affecting health, money, or safety."
    ],
    blocks: [
      {
        type: "reading",
        heading: "When AI Sounds Certain",
        question: "If AI sounds certain, does that mean it's right?",
        objective:
          "Learn that AI can give incorrect information with confidence, so confidence is never proof that an answer is correct.",
        warningSigns: AI_HABITS,
        text: "One surprising thing about AI is that it often gives answers confidently — even when those answers are incomplete or incorrect. Unlike a person, AI usually doesn't know when it has made a mistake. That's why an answer can sound convincing even if it isn't accurate. When the information could affect your money, health, safety, or personal information, always take a moment to verify it with a trusted source."
      },
      {
        type: "tiered",
        title: "Spot the idea",
        scenario:
          "An AI chatbot answers your question quickly and sounds completely sure.",
        question: "What should you remember?",
        options: [
          {
            text: "A confident answer can still be incorrect.",
            tier: "best",
            feedback:
              "AI doesn't always know when it's wrong. That's why confidence alone isn't enough."
          },
          {
            text: "Important information should be verified.",
            tier: "safe",
            feedback: "The right conclusion."
          },
          {
            text: "If AI sounds confident, it's always right.",
            tier: "unsafe",
            feedback:
              "Confidence is a style of writing, not a measure of accuracy."
          }
        ]
      },
      {
        type: "tiered",
        title: "Choose the safest response",
        scenario:
          "You ask AI when your driver's license expires. It gives you a date, but renewing on time is important.",
        question: "Which response is the best?",
        options: [
          {
            text: "Check your driver's license or your state's official DMV website to confirm the date.",
            tier: "best",
            feedback:
              "AI has no way to know your personal document details. For important information, verify."
          },
          {
            text: "Use the AI answer as a reminder to verify the information yourself.",
            tier: "safe",
            feedback: "A good use — a prompt to check, not an answer to trust."
          },
          {
            text: "Trust the date because AI answered confidently.",
            tier: "unsafe",
            feedback:
              "AI cannot see your licence. Any date it gives is a guess."
          }
        ]
      },
      {
        type: "tiered",
        title: "Apply the lesson",
        scenario: "AI recommends a medication schedule that seems reasonable.",
        question: "Which response is the best?",
        options: [
          {
            text: "Follow the instructions from your doctor or pharmacist instead of relying only on AI.",
            tier: "best",
            feedback:
              "AI can help explain medical information, but healthcare decisions should come from trusted medical professionals."
          },
          {
            text: "Use AI to help understand the medication, but verify medical advice.",
            tier: "safe",
            feedback: "Understanding is a fine use. Dosing is not."
          },
          {
            text: "Follow the AI's instructions without checking.",
            tier: "unsafe",
            feedback:
              "Medication schedules depend on your history, other medicines, and dosage. Only a professional can weigh those."
          }
        ]
      },
      {
        type: "tiered",
        title: "Connect previous lessons",
        scenario:
          "AI writes, \"I'm certain this investment will earn a high return.\" The answer sounds professional and detailed.",
        question: "Which response is safe?",
        options: [
          {
            text: "Verify the information before making any investment decisions.",
            tier: "best",
            feedback:
              "The confidence of the answer wasn't the important part. The decision was. You remembered to verify before acting."
          },
          {
            text: "Speak with a trusted financial professional if you're unsure.",
            tier: "safe",
            feedback: "A qualified person can assess your actual circumstances."
          },
          {
            text: "Invest because the answer sounded confident.",
            tier: "unsafe",
            feedback:
              "No one can be certain about future returns — and an AI stating certainty is a sign to slow down, not speed up."
          }
        ]
      },
      {
        type: "confidence",
        question:
          "How confident do you feel recognizing that AI can sound certain without being correct?",
        practice: [
          {
            scenario: "AI gives directions to a business you've never visited.",
            question: "Which response is the best?",
            options: [
              {
                text: "Check the address with a trusted map before leaving.",
                tier: "best",
                feedback: "Addresses are easy to get subtly wrong."
              },
              {
                text: "Compare it with another source.",
                tier: "safe",
                feedback: "Two sources agreeing is reassuring."
              },
              {
                text: "Assume the directions are correct because AI sounded certain.",
                tier: "unsafe",
                feedback: "Certainty is not verification."
              }
            ]
          },
          {
            scenario: "AI confidently tells you a government office is closed today.",
            question: "Which response is the best?",
            options: [
              {
                text: "Verify the office hours on the official website before changing your plans.",
                tier: "best",
                feedback: "Opening hours change and AI may be working from old information."
              },
              {
                text: "Call the office if you're unsure.",
                tier: "safe",
                feedback: "The most direct check available."
              },
              {
                text: "Cancel your trip because AI sounded confident.",
                tier: "unsafe",
                feedback: "You may cancel a trip you didn't need to."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 1.4 — Stop, Verify, Then Decide",
            note: "Whether the information comes from a person or AI, important decisions deserve verification."
          },
          {
            lesson: "Lesson 4.5 — When AI Answers Back",
            note: "AI can be very helpful, but double-checking important information is still your job."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The tax refund",
        setup:
          "You're curious whether you qualify for a tax credit, so you ask an AI chatbot. You were planning to file your taxes based on this information.",
        messages: [
          {
            from: "AI chatbot",
            body:
              "Yes, you definitely qualify. You can expect a refund of about $1,200."
          }
        ],
        question: "What should you do first?",
        options: [
          {
            text: "Verify the information using official tax resources or a qualified tax professional before filing your taxes.",
            tier: "best",
            feedback:
              "The challenge wasn't recognizing a scam — it was recognizing that confidence isn't proof of accuracy. You used AI as a helpful tool, but you didn't let it replace trusted information for an important financial decision."
          },
          {
            text: "Use the AI answer as a starting point, then confirm the details before making any decisions.",
            tier: "safe",
            feedback: "A sound way to use it."
          },
          {
            text: "File your taxes based only on the AI's answer because it sounded confident.",
            tier: "unsafe",
            feedback:
              "Note the word \"definitely\" — AI has no access to your income, filing status, or circumstances, so it cannot possibly know. Filing on that basis could cost you."
          }
        ],
        spotted: []
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed When AI Sounds Certain.",
      habit: "Confident answers still deserve verification when the decision matters.",
      warningSign: "Certainty where certainty isn't possible.",
      skills: [
        "Separated confidence from accuracy",
        "Verified important information",
        "Used AI as a starting point, not a final authority"
      ],
      next: "When AI Doesn't Know"
    }
  },

  // ============================================================
  // LESSON 4.7
  // ============================================================
  {
    id: "scam-ai-limits",
    track: "scam",
    phase: 11,
    order: 7,
    lessonNumber: "4.7",
    title: "When AI Doesn't Know",
    pathTitle: "AI's Limits",
    badge: "Source Finder",
    xp: 20,
    goals: [
      "Understand that AI doesn't know current, local, or personal information.",
      "Use official sources for anything time-sensitive."
    ],
    blocks: [
      {
        type: "reading",
        heading: "When AI Doesn't Know",
        question: "Does AI know everything?",
        objective:
          "Learn that AI doesn't have access to every fact or every event, so it may not know the answer to every question.",
        warningSigns: AI_HABITS,
        text: "AI has learned from a huge amount of information, but that doesn't mean it knows everything. It may not know about recent events, personal details, or information that isn't available to it. Sometimes it may even guess instead of saying it doesn't know. That's why AI is a great place to start learning, but it shouldn't be your only source when the answer is important."
      },
      {
        type: "tiered",
        title: "Spot the idea",
        scenario: "A friend says, \"AI knows every fact in the world.\"",
        question: "Which response is the best?",
        options: [
          {
            text: "AI knows a lot, but it doesn't know everything.",
            tier: "best",
            feedback:
              "AI is powerful, but it isn't connected to every piece of information."
          },
          {
            text: "Some information should still be checked with trusted sources.",
            tier: "safe",
            feedback: "The practical consequence of that limit."
          },
          {
            text: "AI always has the correct answer.",
            tier: "unsafe",
            feedback: "It often has an answer. That's not the same thing."
          }
        ]
      },
      {
        type: "tiered",
        title: "Choose the safest response",
        scenario: "You ask AI whether your doctor's office is open today.",
        question: "Which response is the best?",
        options: [
          {
            text: "Call the doctor's office or check its official website.",
            tier: "best",
            feedback:
              "For current schedules and important information, official sources are the best choice."
          },
          {
            text: "Use AI as a starting point, but verify before making the trip.",
            tier: "safe",
            feedback: "Sensible — especially before a long drive."
          },
          {
            text: "Assume AI knows today's office hours.",
            tier: "unsafe",
            feedback:
              "AI has no live connection to your doctor's schedule."
          }
        ]
      },
      {
        type: "tiered",
        title: "Apply the lesson",
        scenario: "You ask AI, \"Did my granddaughter arrive home safely?\"",
        question: "Which response is the best?",
        options: [
          {
            text: "Contact your granddaughter or another family member directly.",
            tier: "best",
            feedback:
              "AI doesn't know what's happening in your personal life, and it can't verify personal events."
          },
          {
            text: "Remember that AI doesn't know personal events like this.",
            tier: "safe",
            feedback: "Understanding the limit is half the skill."
          },
          {
            text: "Ask AI again because it might know now.",
            tier: "unsafe",
            feedback:
              "Asking twice may produce a confident guess, which is worse than no answer."
          }
        ]
      },
      {
        type: "tiered",
        title: "Connect previous lessons",
        scenario:
          "AI tells you your local pharmacy closes at 8:00 PM tonight. You were planning to pick up an important prescription.",
        question: "Which response is safe?",
        options: [
          {
            text: "Check the pharmacy's official website or call before leaving.",
            tier: "best",
            feedback:
              "AI may be correct — but when something is important, your safest habit is still to verify."
          },
          {
            text: "Use AI's answer as a reminder, then verify it.",
            tier: "safe",
            feedback: "A good working pattern."
          },
          {
            text: "Drive there based only on AI's answer.",
            tier: "unsafe",
            feedback:
              "A wasted trip is inconvenient. A missed prescription can matter more."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel recognizing that AI doesn't know everything?",
        practice: [
          {
            scenario: "You ask AI whether your favorite restaurant is open today.",
            question: "Which response is the best?",
            options: [
              {
                text: "Check the restaurant's official website or call before visiting.",
                tier: "best",
                feedback: "Hours change, especially around holidays."
              },
              {
                text: "Use AI as a starting point, but verify.",
                tier: "safe",
                feedback: "Reasonable."
              },
              {
                text: "Assume the hours are correct.",
                tier: "unsafe",
                feedback: "AI can't see today's opening hours."
              }
            ]
          },
          {
            scenario: "AI gives you today's weather forecast.",
            question: "Which response is the best?",
            options: [
              {
                text: "Check a trusted weather service before making important outdoor plans.",
                tier: "best",
                feedback: "Weather is exactly the kind of live data AI may not have."
              },
              {
                text: "Use AI as a general guide.",
                tier: "safe",
                feedback: "Fine for casual purposes."
              },
              {
                text: "Assume the forecast is always correct.",
                tier: "unsafe",
                feedback: "It may be describing a typical day, not today."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 2.5 — Always Verify",
            note: "Official sources are still the best place to confirm important information."
          },
          {
            lesson: "Lesson 4.6 — When AI Sounds Certain",
            note: "Even when AI sounds confident, it may not have complete or current information."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The community event",
        setup:
          "You're excited to attend your town's annual community fair this afternoon. It's a 40-minute drive. Before leaving, you ask an AI chatbot what time the fair ends.",
        messages: [
          {
            from: "AI chatbot",
            body: "The fair ends at 8:00 PM."
          }
        ],
        question: "What should you do first?",
        options: [
          {
            text: "Check the community fair's official website or social media page before driving there.",
            tier: "best",
            feedback:
              "This wasn't about catching a scam — it was about understanding AI's limits. The answer was reasonable, but event schedules change. You used AI as a helpful starting point and confirmed with the official source."
          },
          {
            text: "Call the event organizer if you can't find updated information online.",
            tier: "safe",
            feedback: "A direct and reliable check."
          },
          {
            text: "Leave immediately because the AI gave you a specific answer.",
            tier: "unsafe",
            feedback:
              "A specific answer feels reliable, but AI has no way to know this year's schedule for your town's fair. An 80-minute round trip deserves one quick check."
          }
        ],
        spotted: []
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed When AI Doesn't Know.",
      habit: "AI is a great place to start — but official sources are the best place to finish.",
      warningSign: "A specific answer about something current or local.",
      skills: [
        "Recognized AI's limits",
        "Used official sources for current information",
        "Verified before acting"
      ],
      next: "Making AI Your Helper"
    }
  },

  // ============================================================
  // LESSON 4.8
  // ============================================================
  {
    id: "scam-ai-helper",
    track: "scam",
    phase: 11,
    order: 8,
    lessonNumber: "4.8",
    title: "Making AI Your Helper",
    pathTitle: "AI as Helper",
    badge: "AI Confident",
    xp: 20,
    goals: [
      "Use AI confidently for everyday tasks.",
      "Keep the final decision yourself."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Making AI Your Helper",
        question: "How can AI make my everyday life easier?",
        objective:
          "Learn how to use AI as a helpful everyday assistant while continuing to verify important information.",
        warningSigns: AI_HABITS,
        text: "AI can be a helpful tool for everyday life. It can suggest recipes, explain unfamiliar words, help write emails, plan trips, organize shopping lists, and answer questions about hobbies. These are great ways to save time and learn something new. Just remember that AI is your helper, not your decision-maker. When a question involves your health, money, safety, or personal information, always verify the answer before acting."
      },
      {
        type: "tiered",
        title: "Choosing a good use for AI",
        scenario:
          "You have chicken, rice, and vegetables in your refrigerator but aren't sure what to cook.",
        question: "Which response is the best?",
        options: [
          {
            text: "Ask AI for recipe ideas.",
            tier: "best",
            feedback: "AI is great at helping with everyday planning and ideas."
          },
          {
            text: "Ask AI to help make a grocery list.",
            tier: "safe",
            feedback: "Another excellent everyday use."
          },
          {
            text: "Ask AI to decide whether you should stop taking a medication.",
            tier: "unsafe",
            feedback:
              "That decision belongs to you and your doctor, not a chatbot."
          }
        ]
      },
      {
        type: "tiered",
        title: "Choosing when to verify",
        scenario:
          "You ask AI whether you should move all of your retirement savings into one investment.",
        question: "Which response is the best?",
        options: [
          {
            text: "Verify the information with a trusted financial professional before making changes.",
            tier: "best",
            feedback:
              "AI can help you learn, but important financial decisions deserve trusted advice."
          },
          {
            text: "Use AI to understand investment terms before deciding.",
            tier: "safe",
            feedback: "Learning the vocabulary is a genuinely good use."
          },
          {
            text: "Follow the suggestion immediately because it sounds reasonable.",
            tier: "unsafe",
            feedback:
              "Sounding reasonable is not the same as being right for your situation."
          }
        ]
      },
      {
        type: "tiered",
        title: "Using AI together",
        scenario: "You're writing a birthday card but can't think of the right words.",
        question: "Which response is the best?",
        options: [
          {
            text: "Ask AI to suggest a message, then make it your own.",
            tier: "best",
            feedback:
              "AI can help you get started, but your personal touch makes the message meaningful."
          },
          {
            text: "Use AI for ideas and edit the final version.",
            tier: "safe",
            feedback: "Exactly the right working relationship."
          },
          {
            text: "Copy and send the first response without reading it.",
            tier: "unsafe",
            feedback:
              "A card in someone else's words isn't much of a card."
          }
        ]
      },
      {
        type: "tiered",
        title: "Bringing it all together",
        scenario:
          "You're planning a vacation. AI suggests hotels, restaurants, and places to visit.",
        question: "Which response is safe?",
        options: [
          {
            text: "Verify prices, reservations, and business hours before making plans.",
            tier: "best",
            feedback:
              "You used AI exactly as it's meant to help — organizing ideas, saving time, giving suggestions — then verified the important details yourself."
          },
          {
            text: "Use AI's suggestions as a starting point for your research.",
            tier: "safe",
            feedback: "A great way to begin planning."
          },
          {
            text: "Assume every recommendation is current and accurate.",
            tier: "unsafe",
            feedback:
              "Businesses close, prices change, and AI may not know."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel using AI as a helpful everyday tool?",
        practice: [
          {
            scenario: "You want to learn how to grow tomatoes.",
            question: "Which response is the best?",
            options: [
              {
                text: "Ask AI for beginner gardening tips.",
                tier: "best",
                feedback: "A perfect low-stakes use."
              },
              {
                text: "Compare AI's advice with a gardening website if needed.",
                tier: "safe",
                feedback: "Useful for climate-specific advice."
              },
              {
                text: "Assume every gardening tip will work in every climate.",
                tier: "unsafe",
                feedback: "Growing advice varies enormously by region."
              }
            ]
          },
          {
            scenario: "You ask AI to help organize your weekly errands.",
            question: "Which response is the best?",
            options: [
              {
                text: "Let AI help you organize your schedule.",
                tier: "best",
                feedback: "Organizing is one of its genuine strengths."
              },
              {
                text: "Adjust the plan so it fits your own day.",
                tier: "safe",
                feedback: "You know your life better than it does."
              },
              {
                text: "Follow the schedule without checking whether it works for you.",
                tier: "unsafe",
                feedback: "It doesn't know your appointments or your energy."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 4.5 — When AI Answers Back",
            note: "AI is most helpful when you use it as an assistant instead of expecting it to be perfect."
          },
          {
            lesson: "Lesson 4.6 — When AI Sounds Certain",
            note: "Even helpful answers should be verified when the decision is important."
          }
        ]
      },
      {
        type: "finalboss",
        title: "Planning the perfect day",
        setup:
          "Tomorrow is your anniversary and you want to make the day special, so you ask an AI chatbot to help plan it.",
        messages: [
          {
            from: "AI chatbot",
            body:
              "Here's your day: breakfast at Corner Café (opens 7am), a walk through Riverside Park, the art museum in the afternoon (open until 5pm), and dinner at Bella's. No reservations needed anywhere."
          }
        ],
        question: "What should you do before leaving home?",
        options: [
          {
            text: "Use AI's plan, but verify the restaurant hours, museum schedule, and whether reservations are needed before you go.",
            tier: "best",
            feedback:
              "This was the perfect way to use AI. You let it do what it's good at — organizing ideas, saving time, creating a plan — then you did what people do best: verified the important details and made the final decisions."
          },
          {
            text: "Keep the itinerary but check important details using the businesses' official websites or by calling ahead.",
            tier: "safe",
            feedback: "The same instinct, just as effective."
          },
          {
            text: "Follow the plan exactly because AI organized everything for you.",
            tier: "unsafe",
            feedback:
              "\"No reservations needed\" is precisely the sort of detail AI cannot actually know — and an anniversary dinner is a poor place to discover that."
          }
        ],
        spotted: []
      }
    ],
    quiz: [],
    complete: {
      title: "Phase 11 complete!",
      subtitle: "You completed Making AI Your Helper — and all of Phase 11.",
      habit: "Let AI help you think. Let yourself make the final decision.",
      warningSign: "Letting a tool make a decision that's yours to make.",
      skills: [
        "Used AI confidently",
        "Chose appropriate tasks for AI",
        "Verified important information",
        "Made informed decisions"
      ],
      learned: [
        "AI can write, speak, create images, make videos, and help solve everyday problems.",
        "AI changes how information looks — but not the habits that keep you safe.",
        "Slow down. Verify important information. Ask questions. Make the final decision yourself.",
        "Next: protecting something just as valuable as your money — your personal information."
      ],
      next: "Phase 12: Protecting Your Personal Information"
    }
  }
];

export default scamPhase4Lessons;
