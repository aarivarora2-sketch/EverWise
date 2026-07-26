// Everwise - Scam Protection track
// Phase 9: Helping Others Stay Safe
//
// ⚠️ MISSING LESSONS — 9.1 and 9.2
// The source curriculum references two lessons that were never written:
//   9.1 "Help Without Embarrassing Someone"
//   9.2 "Be a Second Set of Eyes"  (checklist: sender, request, pressure, path, proof)
// Both are cited in the memory connections of 9.3, 9.4, and 9.5 and in the
// phase summary. The slots below (orders 1 and 2) are intentionally empty.
// When those lessons are written, insert them there — the references in the
// existing lessons already point at them.

const HELPING_HABITS = [
  "Stay calm and kind",
  "Avoid blame",
  "Focus on the next safe step",
  "Use official support routes",
];

export const scamPhase9Lessons = [
  // ============================================================
  // LESSON 9.1 — NOT YET WRITTEN
  // "Help Without Embarrassing Someone"
  // ============================================================

  // ============================================================
  // LESSON 9.2 — NOT YET WRITTEN
  // "Be a Second Set of Eyes"
  // Checklist: Sender. Request. Pressure. Path. Proof.
  // ============================================================

  // ============================================================
  // LESSON 9.3
  // ============================================================
  {
    id: "scam-help-after-mistake",
    track: "scam",
    phase: 109,
    order: 3,
    lessonNumber: "9.3",
    title: "Help After Someone Clicked or Shared Information",
    pathTitle: "Help After a Mistake",
    badge: "Calm Helper",
    xp: 20,
    goals: [
      "Use stop, separate, list, secure, report.",
      "Help without blame after someone has already acted."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Help After Someone Clicked or Shared Information",
        question: "What should I do if someone already made a mistake?",
        objective:
          "Learn how to calmly help someone take the next safe steps after they clicked a link, shared information, or sent money.",
        warningSigns: ["Stop — end the unsafe action", "Separate — move to a trusted route", "List — what exactly was shared?", "Secure — protect the account", "Report — tell the right organization"],
        text: "Sometimes people ask for help after something already happened. They may have clicked a link, typed a password, shared a verification code, entered card information, downloaded something, or sent money. They may feel scared or embarrassed. The most helpful response is calm and practical. Stop the unsafe action. Separate from the suspicious message and use a trusted route. List exactly what was shared. Secure the affected account or payment method. Report it through the right trusted place. Acting quickly helps — panic does not."
      },
      {
        type: "tiered",
        title: "They clicked a link",
        scenario:
          "Your friend says, \"I clicked a link in a delivery text, but I closed the page before typing anything.\" They feel worried.",
        question: "Which response is the best?",
        options: [
          {
            text: "\"Good job stopping. Let's not use that link again. We can check the package through the official store or delivery app.\"",
            tier: "best",
            feedback:
              "Clicking wasn't ideal, but stopping before typing information matters. The next step is a trusted route."
          },
          {
            text: "\"Let's report or delete the message after saving it if needed.\"",
            tier: "safe",
            feedback: "A sensible follow-up."
          },
          {
            text: "\"You ruined everything by clicking.\"",
            tier: "unsafe",
            feedback:
              "Not true, and it makes them less likely to tell you next time — which is the real danger."
          }
        ]
      },
      {
        type: "tiered",
        title: "They shared a password",
        scenario:
          "Your neighbor typed their email password into a page from a suspicious message.",
        question: "What should you help them do?",
        options: [
          {
            text: "Change the email password through the official email website or app, not through the suspicious link.",
            tier: "best",
            feedback:
              "If a password may have been shared, the affected account should be secured through the official site or app."
          },
          {
            text: "Turn on two-step verification if available and check recent account activity.",
            tier: "safe",
            feedback: "Both are strong protective steps."
          },
          {
            text: "Keep using the same password because only one page saw it.",
            tier: "unsafe",
            feedback:
              "One page is all it takes, and email often unlocks everything else."
          }
        ]
      },
      {
        type: "tiered",
        title: "They shared a verification code",
        scenario:
          "A family member says, \"A caller asked me to read the code sent to my phone. I gave it to them.\"",
        question: "Which response is the best?",
        options: [
          {
            text: "Stop the call and contact the real company through an official number or app to secure the account.",
            tier: "best",
            feedback:
              "Verification codes protect accounts. If one was shared, the real company should be contacted through a trusted route."
          },
          {
            text: "Help them explain that a verification code may have been shared.",
            tier: "safe",
            feedback: "Support teams handle this often and know what to do."
          },
          {
            text: "Tell them the code does not matter because it was only numbers.",
            tier: "unsafe",
            feedback:
              "That code was the second lock on their account, and it was just opened."
          }
        ]
      },
      {
        type: "tiered",
        title: "They sent money",
        scenario:
          "Your friend sent money to someone they now think may be a scammer. They're embarrassed and say, \"Maybe I should just forget it.\"",
        question: "Which response is the best?",
        options: [
          {
            text: "Help them save records and contact their bank, card company, payment app, or marketplace through an official channel as soon as possible.",
            tier: "best",
            feedback:
              "There's no guarantee money can be recovered, but acting quickly and keeping records gives the best chance of proper help."
          },
          {
            text: "Remind them that asking for help quickly is smart, even if the money may not be recoverable.",
            tier: "safe",
            feedback: "Reduces the shame that stops people reporting."
          },
          {
            text: "Tell them not to report it because it is too embarrassing.",
            tier: "unsafe",
            feedback:
              "Embarrassment is what scammers count on. Reporting also helps protect others."
          }
        ]
      },
      {
        type: "confidence",
        question:
          "How confident do you feel helping someone take next steps after they clicked, shared information, or sent money?",
        practice: [
          {
            scenario:
              "Someone says, \"I entered my card number on a page from a text message.\"",
            question: "Which response is the best?",
            options: [
              {
                text: "Help them contact the card company through the number on the card or official app.",
                tier: "best",
                feedback:
                  "Payment-card concerns should be handled through the card company's trusted route."
              },
              {
                text: "Help them save the message and check recent charges.",
                tier: "safe",
                feedback: "The card company will want both."
              },
              {
                text: "Tell them to reply to the text and ask for a refund.",
                tier: "unsafe",
                feedback: "That reaches the people who took the number."
              }
            ]
          },
          {
            scenario:
              "A friend downloaded an attachment from a suspicious email and is unsure what happened.",
            question: "Which response is the best?",
            options: [
              {
                text: "Help them stop using the suspicious email and get trusted tech help before opening the file again.",
                tier: "best",
                feedback:
                  "If a suspicious file was downloaded, do not keep interacting with it. Get trusted help."
              },
              {
                text: "Save details about the email and attachment if support needs to review them.",
                tier: "safe",
                feedback: "Useful context for whoever helps."
              },
              {
                text: "Keep opening the file to figure out what it does.",
                tier: "unsafe",
                feedback: "Each opening is another chance for it to run."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 5.6 — A Second Lock on Your Account",
            note: "Verification codes are private. If someone shared one, the account may need immediate attention."
          },
          {
            lesson: "Lesson 6.6 — Stop, Save, Block, and Report",
            note: "After a suspicious contact: stop responding, save records, block or report, and verify."
          },
          {
            lesson: "Lesson 7.5 — When a Purchase Goes Wrong",
            note: "Records, receipts, and official support channels matter when resolving problems."
          }
        ]
      },
      {
        type: "finalboss",
        title: "Helping after the mistake",
        setup:
          "Your cousin Denise calls you. She feels embarrassed and says, \"Please don't be mad at me.\"",
        messages: [
          {
            from: "Denise, on the phone",
            body:
              "I think I messed up. I got a text saying my email account was locked. I clicked the link. I typed my email address. I typed my password. Then someone called and I read them a code from my phone. What should I do now?"
          }
        ],
        question: "What should you do?",
        options: [
          {
            text: "\"I'm not mad. Let's stop using that link and secure your email through the official app or website. We should change the password, check account activity, turn on two-step verification if available, and contact official support if needed.\"",
            tier: "best",
            feedback:
              "You helped Denise without shame and focused on recovery: Stop using the link, Separate to the official app, List what was shared, Secure the account, Report to support if needed."
          },
          {
            text: "\"Let's write down exactly what happened and what information was shared so we can choose the right next steps.\"",
            tier: "safe",
            feedback:
              "Listing it out is genuinely the step that determines everything else."
          },
          {
            text: "\"You should have known better. Just ignore it now.\"",
            tier: "unsafe",
            feedback:
              "Both halves are wrong. The blame closes her down, and ignoring it leaves someone with her email password and a verification code."
          }
        ],
        spotted: [
          "Link clicked",
          "Password shared",
          "Verification code shared",
          "Embarrassment discouraging action"
        ]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Help After Someone Clicked or Shared Information.",
      habit: "After a mistake, help with the next safe step: stop, separate, list, secure, report.",
      warningSign: "A calm helper can turn panic into action.",
      skills: [
        "Helped without blame",
        "Identified what was shared",
        "Chose official account-security steps",
        "Helped someone regain control"
      ],
      next: "Make a Family or Friend Safety Plan"
    }
  },

  // ============================================================
  // LESSON 9.4
  // ============================================================
  {
    id: "scam-safety-plan",
    track: "scam",
    phase: 109,
    order: 4,
    lessonNumber: "9.4",
    title: "Make a Family or Friend Safety Plan",
    pathTitle: "Safety Plan",
    badge: "Plan Maker",
    xp: 20,
    goals: [
      "Build a plan around people, phrase, pause, paths, proof.",
      "Keep the plan supportive rather than controlling."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Make a Family or Friend Safety Plan",
        question: "How can we prepare before something goes wrong?",
        objective:
          "Learn how to create a simple safety plan with family, friends, or trusted helpers before a scam or confusing situation happens.",
        warningSigns: ["People — who do you call?", "Phrase — how do you ask for help?", "Pause — rules for money and codes", "Paths — trusted contact routes", "Proof — what to save"],
        text: "It is easier to stay safe when people make a plan before there is pressure. Scammers create urgency, secrecy, fear, and confusion. A family or friend safety plan gives everyone permission to pause and verify. Choose trusted people to contact. Agree on kind phrases that make asking easy — \"Can you be my second set of eyes?\" Create rules for high-risk situations: no sending money because of a surprise message, no sharing verification codes, no gift cards for bills. Write down trusted contact routes ahead of time. Decide what to save if something seems suspicious. A safety plan should not make anyone feel controlled — it should make them feel supported."
      },
      {
        type: "tiered",
        title: "Trusted contact",
        scenario:
          "Your aunt often receives confusing texts about packages, bills, and prizes. She wants to know who to ask before clicking.",
        question: "What is a good first step?",
        options: [
          {
            text: "Help her choose a trusted person she can contact for a second opinion.",
            tier: "best",
            feedback:
              "Choosing a trusted contact before pressure happens makes it easier to ask for help later."
          },
          {
            text: "Agree on a simple phrase like, \"Can you help me check this?\"",
            tier: "safe",
            feedback: "Having the words ready removes the hesitation."
          },
          {
            text: "Tell her never to ask anyone because she should handle it alone.",
            tier: "unsafe",
            feedback:
              "Isolation is what scammers work to create. Don't do it for them."
          }
        ]
      },
      {
        type: "tiered",
        title: "Money pause rule",
        scenario: "A family wants a simple rule for surprise money requests.",
        question: "Which rule is the best?",
        options: [
          {
            text: "\"Before sending money because of an unexpected message, we verify through a trusted contact or official source.\"",
            tier: "best",
            feedback: "A money pause rule helps people slow down when emotions are high."
          },
          {
            text: "\"No gift-card payments for bills, fines, prizes, or emergencies.\"",
            tier: "safe",
            feedback: "A clear, memorable rule that covers a lot of ground."
          },
          {
            text: "\"Send money first if the message sounds emotional.\"",
            tier: "unsafe",
            feedback: "That's the opposite of a safety rule."
          }
        ]
      },
      {
        type: "tiered",
        title: "Safe phrase",
        scenario:
          "Your friend is embarrassed to ask for help with suspicious messages.",
        question: "Which phrase could help?",
        options: [
          {
            text: "\"Can you be my second set of eyes?\"",
            tier: "best",
            feedback:
              "A respectful phrase makes asking for help feel normal, not embarrassing."
          },
          {
            text: "\"This feels urgent. Can we check it together?\"",
            tier: "safe",
            feedback: "Also warm and easy to say."
          },
          {
            text: "\"I am bad at technology, so fix this for me.\"",
            tier: "unsafe",
            feedback:
              "It's self-critical and untrue — spotting a suspicious message is judgment, not technical skill."
          }
        ]
      },
      {
        type: "tiered",
        title: "Trusted contact paths",
        scenario:
          "You're helping someone prepare a list of trusted contact methods.",
        question: "Which item belongs on the list?",
        options: [
          {
            text: "The phone number on the back of their bank card.",
            tier: "best",
            feedback:
              "Trusted contact paths should come from reliable sources, not from suspicious messages."
          },
          {
            text: "The official website they type directly instead of a link from a message.",
            tier: "safe",
            feedback: "Also a trusted route."
          },
          {
            text: "A phone number from a suspicious email.",
            tier: "unsafe",
            feedback: "That's the one number guaranteed not to be trustworthy."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel helping someone create a simple safety plan?",
        practice: [
          {
            scenario: "A grandparent worries they'll bother people by asking for help.",
            question: "Which response is the best?",
            options: [
              {
                text: "\"You are not bothering us. We'd rather check together before money or private information is shared.\"",
                tier: "best",
                feedback: "The safety plan should make asking for help feel welcome."
              },
              {
                text: "\"Let's agree on when to call or text for a second opinion.\"",
                tier: "safe",
                feedback: "Setting the expectation removes the worry."
              },
              {
                text: "\"Only call after the money is already gone.\"",
                tier: "unsafe",
                feedback: "By then help is much harder."
              }
            ]
          },
          {
            scenario:
              "A family is making a plan for emergency messages claiming someone is in trouble.",
            question: "Which plan is safest?",
            options: [
              {
                text: "Verify through a saved family number or another trusted family member before sending money.",
                tier: "best",
                feedback:
                  "Family names can be copied or guessed. A plan makes verification normal."
              },
              {
                text: "Do not keep surprise money requests secret.",
                tier: "safe",
                feedback: "The secrecy rule alone stops most of these."
              },
              {
                text: "Send money immediately if the message uses a real family name.",
                tier: "unsafe",
                feedback: "Names are easy to find on social media."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 6.5 — Don't Keep Suspicious Messages Secret",
            note: "A safety plan gives people permission to talk before acting."
          },
          {
            lesson: "Lesson 7.1 — Check Before Money Moves",
            note: "A money pause rule protects against rushed payment requests."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The family safety plan",
        setup:
          "Your family wants to help everyone feel safer with suspicious messages. Several family members have received fake package texts, bank warning emails, messages pretending to be relatives, donation requests after disasters, marketplace sellers asking for direct payment, and calls asking for verification codes. You want a plan that protects people without making anyone feel embarrassed.",
        question: "Which safety plan is the best?",
        options: [
          {
            text: "\"Let's choose trusted people to contact, agree on a phrase like 'Can you be my second set of eyes?', pause before money or codes are shared, use official apps or saved numbers to verify, and save messages or receipts if something seems suspicious.\"",
            tier: "best",
            feedback:
              "You created a supportive safety plan covering all five parts — People, Phrase, Pause, Paths, Proof — and made safety feel normal instead of embarrassing."
          },
          {
            text: "\"Let's make it normal to ask for help before clicking, paying, or sharing private information.\"",
            tier: "safe",
            feedback:
              "Normalizing the ask is arguably the most important part of any plan."
          },
          {
            text: "\"Let's shame anyone who clicks a suspicious message so they never do it again.\"",
            tier: "unsafe",
            feedback:
              "Shame doesn't prevent clicking — it prevents telling anyone afterward, which is far more dangerous."
          }
        ],
        spotted: []
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Make a Family or Friend Safety Plan.",
      habit: "Make a plan before pressure happens: people, phrase, pause, paths, proof.",
      warningSign: "A plan works best when it feels supportive, not controlling.",
      skills: [
        "Chose trusted helpers",
        "Created a safe phrase",
        "Built a money pause rule",
        "Prepared official contact paths"
      ],
      next: "Know When to Bring in More Help"
    }
  },

  // ============================================================
  // LESSON 9.5
  // ============================================================
  {
    id: "scam-more-help",
    track: "scam",
    phase: 109,
    order: 5,
    lessonNumber: "9.5",
    title: "Know When to Bring in More Help",
    pathTitle: "More Help",
    badge: "Safety Guide",
    xp: 20,
    goals: [
      "Use notice, name, records, route, stay.",
      "Recognize recovery-fee scams targeting past victims."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Know When to Bring in More Help",
        question: "When should I get someone else involved?",
        objective:
          "Learn when a situation is too serious to handle alone and how to guide someone toward the right trusted help.",
        warningSigns: ["Notice — is this serious?", "Name — say it calmly", "Records — save what matters", "Route — choose the right helper", "Stay — support them through it"],
        text: "Being a helpful person does not mean you must know every answer. Sometimes the safest thing you can do is help someone reach the right person, company, office, or support team. A problem may need extra help if it involves money sent, bank or card information shared, passwords or verification codes shared, identity information shared, a suspicious download, a threat, or a legal, medical, insurance, tax, or government issue. Use official apps, official websites, saved contacts, or numbers from cards, bills, statements, or paperwork. The goal is not to take over — it's to help them reach the right support safely."
      },
      {
        type: "tiered",
        title: "Too big to handle alone",
        scenario:
          "Your friend says, \"I gave my debit card number to a website from a text message.\" They ask if they should just wait and see.",
        question: "Which response is the best?",
        options: [
          {
            text: "\"Let's contact your card company through the number on the card or official app.\"",
            tier: "best",
            feedback:
              "When card information may have been shared, official card support is the right helper."
          },
          {
            text: "\"Let's save the message and check recent charges.\"",
            tier: "safe",
            feedback: "Useful preparation for that call."
          },
          {
            text: "\"Wait a few weeks and see what happens.\"",
            tier: "unsafe",
            feedback:
              "Card companies often have time limits for disputes, and waiting only helps whoever has the number."
          }
        ]
      },
      {
        type: "tiered",
        title: "Name the problem calmly",
        scenario:
          "Your neighbor says, \"I read a verification code to someone on the phone. Am I in trouble?\" They look scared.",
        question: "What should you say?",
        options: [
          {
            text: "\"Let's stay calm. A verification code may affect an account, so we should contact the real company through an official route.\"",
            tier: "best",
            feedback:
              "Calm wording helps the person take action instead of freezing or hiding the problem."
          },
          {
            text: "\"We can write down what happened before calling support.\"",
            tier: "safe",
            feedback: "Organizing the facts makes the call much easier."
          },
          {
            text: "\"That was terrible. Your account is definitely ruined.\"",
            tier: "unsafe",
            feedback:
              "It may not be, and panic makes people freeze rather than act."
          }
        ]
      },
      {
        type: "tiered",
        title: "Save records first",
        scenario:
          "A family member sent money through a payment app to someone they now think was fake. They still have the messages and payment receipt.",
        question: "Which response is the best?",
        options: [
          {
            text: "Help them save the messages and receipt, then contact payment-app support through the official app.",
            tier: "best",
            feedback: "Records can help support teams understand what happened."
          },
          {
            text: "Encourage them to act promptly and use official support.",
            tier: "safe",
            feedback: "Speed matters with payment apps."
          },
          {
            text: "Delete everything because the messages are upsetting.",
            tier: "unsafe",
            feedback:
              "Those messages are the evidence support will need."
          }
        ]
      },
      {
        type: "tiered",
        title: "Right helper, right route",
        scenario:
          "Someone receives an email: \"We can recover your lost money. Call this number and pay a recovery fee.\" They already lost money to a scam.",
        question: "Which response is the best?",
        options: [
          {
            text: "Do not call the number or pay a recovery fee. Use the bank, card company, payment app, marketplace, or official reporting route instead.",
            tier: "best",
            feedback:
              "After a scam, people are often targeted again. The safest route is official support, not a new stranger promising recovery."
          },
          {
            text: "Be cautious because scammers may target people again after money is lost.",
            tier: "safe",
            feedback:
              "Victim lists get resold. The second approach is often more convincing than the first."
          },
          {
            text: "Pay the recovery fee because the email promises help.",
            tier: "unsafe",
            feedback:
              "This is the second scam, aimed at the same person. Nobody legitimate charges a fee to return your own money."
          }
        ]
      },
      {
        type: "confidence",
        question:
          "How confident do you feel knowing when to guide someone toward official or trusted help?",
        practice: [
          {
            scenario:
              "Someone downloaded an attachment from a suspicious email and doesn't know what happened.",
            question: "Which response is the best?",
            options: [
              {
                text: "Stop opening the file and ask a trusted tech helper or official device support for help.",
                tier: "best",
                feedback:
                  "A suspicious download may need trusted technical help. The person doesn't need to solve it alone."
              },
              {
                text: "Save details about the email if support needs to review it.",
                tier: "safe",
                feedback: "Helpful context."
              },
              {
                text: "Keep clicking the file to figure out what it does.",
                tier: "unsafe",
                feedback: "Every click is another opportunity for it to run."
              }
            ]
          },
          {
            scenario:
              "A friend receives a confusing letter about benefits and a deadline. They ask AI, which gives a confident answer.",
            question: "Which response is the best?",
            options: [
              {
                text: "Use AI only as a starting point, then verify the deadline and action steps with the official benefits office.",
                tier: "best",
                feedback:
                  "Official issues and deadlines should be checked through official or trusted sources."
              },
              {
                text: "Help them prepare questions before calling.",
                tier: "safe",
                feedback: "An excellent use of the AI answer."
              },
              {
                text: "Trust AI completely because it sounded clear.",
                tier: "unsafe",
                feedback: "Benefits rules vary and change; AI can't see their case."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 9.3 — Help After Someone Clicked or Shared Information",
            note: "If someone already clicked or shared, help them stop, separate, list, secure, and report."
          },
          {
            lesson: "Lesson 9.4 — Make a Family or Friend Safety Plan",
            note: "A safety plan should include trusted people and official contact paths before pressure happens."
          },
          {
            lesson: "Lesson 8.2 — Check AI Before You Act",
            note: "AI can help prepare questions, but official sources confirm serious information."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The right help at the right time",
        setup:
          "Your friend Robert comes to you and says, \"I think I made a mistake. Please don't judge me.\"",
        messages: [
          {
            from: "Robert explains",
            body:
              "I got a text saying my bank card was locked — it even used my first name. I clicked the link. I entered my online banking username. I entered my debit card number. Then someone called and told me to read a code from my phone, so I did. Now I see two charges I don't recognize."
          },
          {
            from: "Email · \"Fund Recovery Services\"",
            body:
              "We can recover your lost money for a small fee. Call us now."
          },
          {
            from: "Robert",
            body: "Maybe I should just pay the recovery fee so this goes away."
          }
        ],
        question: "What should you do?",
        options: [
          {
            text: "\"Robert, I'm glad you told me. Let's not use the link, caller number, or recovery email. We should save the texts, email, charges, and call details, then contact your bank through the official app or the number on your card. Do not pay the recovery fee.\"",
            tier: "best",
            feedback:
              "You helped Robert with kindness and practical action. You didn't shame him, didn't use any of the suspicious contact routes, saved records, routed the problem to the right helper, and protected him from a second scam."
          },
          {
            text: "\"Let's write down exactly what happened and use official bank support right away.\"",
            tier: "safe",
            feedback:
              "The right instinct — and speed matters with unrecognized charges."
          },
          {
            text: "\"Pay the recovery fee first because they promise to get the money back.\"",
            tier: "unsafe",
            feedback:
              "That email arrived because he was already targeted. Recovery-fee offers after a scam are almost always a second scam aimed at the same person."
          }
        ],
        spotted: [
          "Link clicked",
          "Banking username shared",
          "Card number shared",
          "Verification code shared",
          "Unrecognized charges",
          "Recovery-fee follow-up scam"
        ]
      }
    ],
    quiz: [],
    complete: {
      title: "Phase 9 complete!",
      subtitle: "You completed Know When to Bring in More Help — and all of Phase 9.",
      habit: "When the risk is serious, don't solve it alone: notice, name, records, route, stay.",
      warningSign: "A stranger offering to recover money you already lost.",
      skills: [
        "Recognized when extra help was needed",
        "Responded without blame",
        "Saved useful records",
        "Chose official support routes",
        "Avoided a recovery-fee scam"
      ],
      learned: [
        "Help without embarrassing someone.",
        "After a mistake: stop, separate, list, secure, report.",
        "Make a plan before pressure: people, phrase, pause, paths, proof.",
        "Know when to bring in more help: notice, name, records, route, stay.",
        "A good safety helper is calm, kind, practical, and willing to bring in the right help."
      ],
      next: "Phase 10: Living Confidently Online"
    }
  }
];

export default scamPhase9Lessons;
