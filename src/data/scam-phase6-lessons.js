// Everwise - Scam Protection track
// Phase 13: Smart Communication
//
// ⚠️ MISSING LESSON — 6.4 "You Are Allowed to Hang Up"
// The source curriculum references Lesson 6.4 in the memory connections of
// 6.5 and 6.6 and in the phase summary, but its full text was never written.
// The slot below (order 4) is intentionally left empty. When 6.4 is written,
// insert it there; the memory-connection references already point to it.

const COMM_HABITS = [
  "Look beyond the sender's name",
  "Notice whether the request makes sense",
  "Verify unusual messages another way",
  "You are allowed to stop responding",
];

export const scamPhase6Lessons = [
  // ============================================================
  // LESSON 6.1
  // ============================================================
  {
    id: "scam-know-who",
    track: "scam",
    phase: 13,
    order: 1,
    lessonNumber: "6.1",
    title: "Know Who You're Talking To",
    pathTitle: "Know Who",
    badge: "Sender Checker",
    xp: 20,
    goals: [
      "Understand that names, photos, and numbers can all be copied.",
      "Verify unusual messages outside the conversation."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Know Who You're Talking To",
        question: "How can I tell who really sent a message?",
        objective:
          "Learn that a name, photograph, phone number, or email address does not always prove who sent a message.",
        warningSigns: COMM_HABITS,
        text: "A message can appear to come from someone you know even when it does not. Scammers may copy a person's name and photograph, take control of an existing account, or use technology that makes a phone number look familiar. The message may still display the correct name on your screen. Instead of trusting the name alone, pay attention to what the person is asking you to do. If the request is unusual, contact the person through a phone number, account, or method you already trust."
      },
      {
        type: "tiered",
        title: "A familiar name",
        scenario:
          "You receive a social media message from an account displaying your cousin's name and photograph: \"I made a new account. Can you send me your phone number?\"",
        question: "Which response is the best?",
        options: [
          {
            text: "Contact your cousin through the phone number you already have before sharing anything.",
            tier: "best",
            feedback:
              "A familiar name and photograph can be copied. Contacting your cousin another way helps you verify the account."
          },
          {
            text: "Wait until you can confirm that the new account belongs to your cousin.",
            tier: "safe",
            feedback: "Waiting costs nothing."
          },
          {
            text: "Send your phone number because the account uses your cousin's photograph.",
            tier: "unsafe",
            feedback:
              "Profile photographs are public and take seconds to copy."
          }
        ]
      },
      {
        type: "tiered",
        title: "Does the request make sense?",
        scenario:
          "An email appears to come from a friend you speak with regularly: \"I'm having trouble buying a gift card. Can you purchase one and email me the numbers?\" Your friend has never asked you for money before.",
        question: "What should you notice?",
        options: [
          {
            text: "The request is unusual for this person.",
            tier: "best",
            feedback:
              "The sender's name may look correct, but an unusual request is a reason to verify before responding."
          },
          {
            text: "The message should be verified through a trusted contact method.",
            tier: "safe",
            feedback: "One phone call resolves it."
          },
          {
            text: "The email must be real because it contains your friend's name.",
            tier: "unsafe",
            feedback:
              "Their account may have been taken over — the name would still be correct."
          }
        ]
      },
      {
        type: "tiered",
        title: "A saved contact",
        scenario:
          "Your phone displays your bank's saved name when a call comes in. The caller asks for your online banking password.",
        question: "Which response is the best?",
        options: [
          {
            text: "End the call and contact the bank using the number printed on your card.",
            tier: "best",
            feedback:
              "The name shown on your phone does not prove that the caller is actually from the bank."
          },
          {
            text: "Refuse to share your password.",
            tier: "safe",
            feedback: "Correct regardless of who is calling."
          },
          {
            text: "Trust the call because your phone displayed the bank's name.",
            tier: "unsafe",
            feedback:
              "Caller information can be made to display almost anything."
          }
        ]
      },
      {
        type: "tiered",
        title: "Verify outside the message",
        scenario:
          "You receive a text from someone claiming to be your grandson: \"My phone broke, so this is my temporary number. Please don't call. I need help paying a bill today.\"",
        question: "Which response is the best?",
        options: [
          {
            text: "Call your grandson using the number you already have, or contact another trusted family member.",
            tier: "best",
            feedback:
              "You moved outside the suspicious conversation and used a contact method you already trusted."
          },
          {
            text: "Ask a personal question only your grandson would know, while still verifying another way.",
            tier: "safe",
            feedback:
              "Reasonable — though answers to personal questions can sometimes be found online, so verifying another way is stronger."
          },
          {
            text: "Continue texting the new number because the sender says it is an emergency.",
            tier: "unsafe",
            feedback:
              "\"Please don't call\" is the giveaway. A call would end the deception instantly."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel confirming who sent an unusual message?",
        practice: [
          {
            scenario:
              "A social media account using your neighbor's photograph sends you a friend request. You're already connected to your neighbor's original account.",
            question: "Which response is the best?",
            options: [
              {
                text: "Ask your neighbor in person or through the original account whether the new request is real.",
                tier: "best",
                feedback: "Photographs and names can be copied. Verification is safer."
              },
              {
                text: "Leave the request unanswered until you can verify it.",
                tier: "safe",
                feedback: "No harm in leaving it pending."
              },
              {
                text: "Accept it because the photograph is correct.",
                tier: "unsafe",
                feedback:
                  "Duplicate accounts using stolen photos are extremely common."
              }
            ]
          },
          {
            scenario:
              "A message from your friend's email account contains writing that doesn't sound like them.",
            question: "Which response is the best?",
            options: [
              {
                text: "Contact your friend through a different trusted method.",
                tier: "best",
                feedback:
                  "A real account can sometimes be taken over. The message should still make sense for the person sending it."
              },
              {
                text: "Consider that someone may have gained access to the account.",
                tier: "safe",
                feedback: "That's very often exactly what has happened."
              },
              {
                text: "Ignore the unusual writing because the email address is familiar.",
                tier: "unsafe",
                feedback:
                  "The address being genuine is what makes a hijacked account convincing."
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
            note: "A familiar name is a clue, but it is not complete proof."
          },
          {
            lesson: "Lesson 3.1 — Anyone Can Pretend",
            note: "Scammers can pretend to be organizations, professionals, friends, or relatives."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The new phone number",
        setup:
          "You receive a text from an unfamiliar number. Your grandson's name is Daniel, and the profile picture appears to show him.",
        messages: [
          {
            from: "Text · Unknown number",
            body: "Hi Grandma! It's Daniel. I dropped my phone and had to get a temporary number."
          },
          {
            from: "Text · Unknown number",
            body:
              "I'm trying to pay for a replacement phone, but my card isn't working. Could you send me $300? Please don't call Mom because she'll be upset that I broke it."
          }
        ],
        question: "What should you do?",
        options: [
          {
            text: "Do not send money. Call Daniel using the number already saved in your contacts, or contact his mother directly.",
            tier: "best",
            feedback:
              "The message contained convincing personal details, but those details did not prove who was sending it. You verified the person outside the suspicious conversation instead of letting the message control how you communicated."
          },
          {
            text: "Stop responding until you can confirm the situation through a trusted family contact.",
            tier: "safe",
            feedback: "Stopping the conversation is a strong move on its own."
          },
          {
            text: "Trust the message because it includes correct family details and a photograph.",
            tier: "unsafe",
            feedback:
              "Names, relationships, and photos are often gathered from social media. Notice they also discouraged you from calling anyone."
          }
        ],
        spotted: [
          "Unexpected contact from a new number",
          "Familiar personal details used to gain trust",
          "Request for money",
          "Pressure to keep it secret",
          "Discouragement from calling another family member"
        ]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Know Who You're Talking To.",
      habit: "When a message feels unusual, verify the person another way.",
      warningSign: "Recognizing a name is not the same as confirming a person.",
      skills: [
        "Looked beyond the displayed name",
        "Evaluated whether a request made sense",
        "Left a suspicious conversation",
        "Verified through a trusted contact method"
      ],
      next: "A Link Is an Invitation, Not a Command"
    }
  },

  // ============================================================
  // LESSON 6.2
  // ============================================================
  {
    id: "scam-links",
    track: "scam",
    phase: 13,
    order: 2,
    lessonNumber: "6.2",
    title: "A Link Is an Invitation, Not a Command",
    pathTitle: "Links",
    badge: "Link Handler",
    xp: 20,
    goals: [
      "Know that displayed link text doesn't prove where it leads.",
      "Reach important accounts through official apps or addresses you enter."
    ],
    blocks: [
      {
        type: "reading",
        heading: "A Link Is an Invitation, Not a Command",
        question: "What should I do when a message contains a link?",
        objective:
          "Learn to handle unexpected links safely by using trusted ways to reach websites and online accounts.",
        warningSigns: COMM_HABITS,
        text: "A link is a shortcut to another place online, but the words displayed in a message do not always reveal where the link will take you. A link may show the name of a bank, delivery company, or familiar website while leading somewhere else. You do not have to open it to investigate the message. For an important account, it is often safer to open the company's official app, use a trusted bookmark, or enter the website address yourself."
      },
      {
        type: "tiered",
        title: "You do not have to open it",
        scenario:
          "A friend sends you an unexpected message that says \"Look at this!\" with a link and no explanation.",
        question: "Which response is the best?",
        options: [
          {
            text: "Ask your friend what the link is and confirm that they sent it.",
            tier: "best",
            feedback:
              "A friend's account could be compromised, or the message might have been sent without their knowledge."
          },
          {
            text: "Leave the link unopened until you know more.",
            tier: "safe",
            feedback: "Nothing is lost by waiting."
          },
          {
            text: "Open it immediately because it came from a friend's account.",
            tier: "unsafe",
            feedback:
              "Messages like this are a very common sign of a hijacked account."
          }
        ]
      },
      {
        type: "tiered",
        title: "Use a safer route",
        scenario:
          "You receive a text saying a payment on your credit card was declined. It includes a link to sign in.",
        question: "Which response is the best?",
        options: [
          {
            text: "Open the credit card company's official app or visit its trusted website yourself.",
            tier: "best",
            feedback:
              "You can investigate the warning without trusting the link that delivered it."
          },
          {
            text: "Call the number printed on the back of your card.",
            tier: "safe",
            feedback: "A number you already have is always trustworthy."
          },
          {
            text: "Use the link in the text because it is the fastest option.",
            tier: "unsafe",
            feedback:
              "Speed is what the message is selling. Your own app takes only moments longer."
          }
        ]
      },
      {
        type: "tiered",
        title: "Familiar words can mislead",
        scenario:
          "An email contains a blue link labeled \"Track Your Package.\" You were not expecting a delivery.",
        question: "What should you remember?",
        options: [
          {
            text: "The words displayed on a link do not guarantee where it leads.",
            tier: "best",
            feedback:
              "The words on a link can look trustworthy while hiding a different destination."
          },
          {
            text: "You can visit the delivery company's official website yourself.",
            tier: "safe",
            feedback: "The safer route to the same information."
          },
          {
            text: "The link must be safe because it contains a familiar phrase.",
            tier: "unsafe",
            feedback:
              "The visible text and the actual destination are two separate things."
          }
        ]
      },
      {
        type: "tiered",
        title: "Caution without panic",
        scenario:
          "You receive an appointment reminder from your dental office. The date and time look correct, and it includes a link to confirm. You recognize the office but are unsure about opening the link.",
        question: "Which response is the best?",
        options: [
          {
            text: "Call the office using the number you already have, or open its official patient portal yourself.",
            tier: "best",
            feedback:
              "You did not have to decide whether the message was real or fake. You simply chose a safer way to respond."
          },
          {
            text: "Confirm the appointment through a trusted communication method.",
            tier: "safe",
            feedback: "Same idea, equally safe."
          },
          {
            text: "Decide the appointment must be fake simply because the reminder includes a link.",
            tier: "unsafe",
            feedback:
              "Plenty of genuine reminders include links. The goal isn't suspicion of everything — it's choosing a safer route."
          }
        ]
      },
      {
        type: "confidence",
        question:
          "How confident do you feel deciding what to do with a link in a message?",
        practice: [
          {
            scenario:
              "A social media message says you won a free prize and includes a shortened link.",
            question: "Which response is the best?",
            options: [
              {
                text: "Do not open the link. Verify the offer through the organization's official page.",
                tier: "best",
                feedback:
                  "An unclear destination combined with urgency deserves extra caution."
              },
              {
                text: "Be cautious because the link's destination is unclear.",
                tier: "safe",
                feedback: "Shortened links hide where they go."
              },
              {
                text: "Open it because the message says the prize expires today.",
                tier: "unsafe",
                feedback: "The deadline exists to stop you thinking."
              }
            ]
          },
          {
            scenario: "Your bank sends a message asking you to review recent account activity.",
            question: "Which response is the best?",
            options: [
              {
                text: "Open the bank's official app yourself.",
                tier: "best",
                feedback:
                  "You reached your account without depending on the link inside the message."
              },
              {
                text: "Call the verified number on your bank card if anything appears unusual.",
                tier: "safe",
                feedback: "Also completely safe."
              },
              {
                text: "Sign in through the message link without checking it.",
                tier: "unsafe",
                feedback: "Sign-in pages are the most commonly faked pages."
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
            note: "Investigate the request without depending on the link being offered."
          },
          {
            lesson: "Lesson 6.1 — Know Who You're Talking To",
            note: "Before opening a link, consider who sent the message and whether the request makes sense."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The package problem",
        setup:
          "You ordered a birthday gift several days ago and are waiting for it to arrive. Because you really are expecting a package, the timing seems believable.",
        messages: [
          {
            from: "Text · Unknown number",
            body:
              "DELIVERY ATTEMPT FAILED. Your address must be confirmed before your package can be delivered. A $1.25 redelivery fee is required. Tracking: 9K22841. Package will be returned tonight.",
            fakeButton: "Confirm address"
          }
        ],
        question: "What should you do?",
        options: [
          {
            text: "Do not use the text link. Open the retailer's order page or the delivery company's official app and check the tracking information there.",
            tier: "best",
            feedback:
              "This message was convincing because it matched something happening in your real life. But expecting a package didn't prove the message was real, and you found the information you needed through a safer route."
          },
          {
            text: "Contact the delivery company through independently verified information if the package status remains unclear.",
            tier: "safe",
            feedback: "A reliable second route."
          },
          {
            text: "Open the link and pay the fee because $1.25 is a small amount.",
            tier: "unsafe",
            feedback:
              "The small amount is deliberate — you're less likely to question it. What they capture is your full card number, not the $1.25."
          }
        ],
        spotted: [
          "Unexpected message",
          "Pressure and urgency",
          "An unverified link",
          "Request for payment information",
          "A believable situation used to gain trust"
        ]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed A Link Is an Invitation, Not a Command.",
      habit: "For important accounts, open the official app or website yourself.",
      warningSign: "A link is an invitation. You are allowed to decline it.",
      skills: [
        "Handled an unexpected link safely",
        "Used an official app instead",
        "Resisted urgency",
        "Protected payment information"
      ],
      next: "Be Careful with Attachments"
    }
  },

  // ============================================================
  // LESSON 6.3
  // ============================================================
  {
    id: "scam-attachments",
    track: "scam",
    phase: 13,
    order: 3,
    lessonNumber: "6.3",
    title: "Be Careful with Attachments",
    pathTitle: "Attachments",
    badge: "File Checker",
    xp: 20,
    goals: [
      "Ask whether an attachment was expected before opening it.",
      "Verify unusual files through a trusted route."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Be Careful with Attachments",
        question: "Should I open this attachment?",
        objective:
          "Learn to pause before opening unexpected files, photos, forms, invoices, or downloads sent through messages.",
        warningSigns: COMM_HABITS,
        text: "An attachment is a file sent with a message. It might look like a photo, receipt, invoice, form, document, or delivery notice. Many attachments are normal, but unexpected attachments should be treated carefully. Scammers may send files that make you curious, worried, or rushed. Before opening an attachment, ask yourself: Was I expecting this? Do I know the sender? Does the message explain what the file is? If something feels unusual, contact the person or company another way first."
      },
      {
        type: "tiered",
        title: "Were you expecting it?",
        scenario:
          "You receive an email from a name you recognize. The message says only \"Please see attached\" with a file attached and no explanation.",
        question: "What should you do first?",
        options: [
          {
            text: "Pause and verify what the attachment is before opening it.",
            tier: "best",
            feedback:
              "Recognizing the sender's name is helpful, but it does not explain why the file was sent."
          },
          {
            text: "Contact the sender another way if the file seems unexpected.",
            tier: "safe",
            feedback: "A quick message or call settles it."
          },
          {
            text: "Open the attachment immediately because you recognize the sender's name.",
            tier: "unsafe",
            feedback:
              "A bare \"see attached\" with no context is a classic pattern from hijacked accounts."
          }
        ]
      },
      {
        type: "tiered",
        title: "The fake invoice",
        scenario:
          "You receive an email saying, \"Your invoice is attached. Payment is due today.\" You don't remember buying anything from this company.",
        question: "Which response is the best?",
        options: [
          {
            text: "Do not open the attachment. Verify the charge through a trusted source first.",
            tier: "best",
            feedback:
              "A message about money should be checked carefully, especially when you were not expecting it."
          },
          {
            text: "Check your own records to see whether the invoice makes sense.",
            tier: "safe",
            feedback: "Your own bank or card statement is the reliable answer."
          },
          {
            text: "Open the attachment quickly because payment is due today.",
            tier: "unsafe",
            feedback:
              "The deadline is there to make you open the file before thinking."
          }
        ]
      },
      {
        type: "tiered",
        title: "A friend's account",
        scenario:
          "A friend sends you a message with a file attached: \"Open this. You'll love it.\" That doesn't sound like how your friend usually writes.",
        question: "What should you remember?",
        options: [
          {
            text: "Your friend's account may have sent the message without your friend's knowledge.",
            tier: "best",
            feedback:
              "A real account can still send unsafe messages if someone else has access to it."
          },
          {
            text: "You can ask your friend through another trusted method before opening it.",
            tier: "safe",
            feedback: "One text to their phone answers it."
          },
          {
            text: "The attachment is safe because it came from your friend's account.",
            tier: "unsafe",
            feedback:
              "The account being real is exactly what makes this convincing."
          }
        ]
      },
      {
        type: "tiered",
        title: "Safe curiosity",
        scenario:
          "An email says, \"We found old photos of you. Open the attachment to see them.\" You don't recognize the sender.",
        question: "Which response is the best?",
        options: [
          {
            text: "Do not open the attachment. Delete or ignore the message if you cannot verify it.",
            tier: "best",
            feedback:
              "Curiosity is normal, but it should not make you open an unexpected file from an unknown sender."
          },
          {
            text: "Be cautious because the message is trying to make you curious.",
            tier: "safe",
            feedback: "Recognizing the tactic is the skill."
          },
          {
            text: "Open the attachment because it might really contain old photos.",
            tier: "unsafe",
            feedback:
              "Curiosity is the hook here, precisely because it's hard to resist."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel deciding whether to open an attachment?",
        practice: [
          {
            scenario:
              "A delivery company appears to send you an attached form. You were not expecting a delivery.",
            question: "Which response is the best?",
            options: [
              {
                text: "Do not open the form. Visit the delivery company's official website or app if needed.",
                tier: "best",
                feedback: "You used a safer route instead of trusting the attachment."
              },
              {
                text: "Verify the delivery notice another way.",
                tier: "safe",
                feedback: "Same protective instinct."
              },
              {
                text: "Open the form because delivery companies often send documents.",
                tier: "unsafe",
                feedback:
                  "They do — which is exactly why this disguise is used."
              }
            ]
          },
          {
            scenario:
              "A relative says they're sending you family photos. A few minutes later, you receive a photo attachment from their usual email address.",
            question: "Which response is the best?",
            options: [
              {
                text: "Since you were expecting it and the message makes sense, it is more reasonable to open carefully.",
                tier: "best",
                feedback:
                  "The goal is not to fear every attachment. The goal is to be careful when something is unexpected or unusual."
              },
              {
                text: "You can still ask your relative if anything seems unusual.",
                tier: "safe",
                feedback: "Never wrong to check."
              },
              {
                text: "Never open any attachment from anyone, even when expected.",
                tier: "unsafe",
                feedback:
                  "That would cut you off from normal life. Expected files from known senders are usually fine."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 6.1 — Know Who You're Talking To",
            note: "A familiar sender name does not always prove that the message is safe."
          },
          {
            lesson: "Lesson 6.2 — A Link Is an Invitation, Not a Command",
            note: "Links and attachments are both things a message invites you to open. You are allowed to pause first."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The attached receipt",
        setup:
          "You do not recognize the store name and don't remember placing an order. You feel worried because you don't want to be charged for something you didn't buy.",
        messages: [
          {
            from: "Email · \"Receipt for Your Recent Purchase\"",
            body:
              "Thank you for your order. Your receipt is attached. Please open the file to review your purchase details. Reply today if this purchase was not yours.",
            fakeButton: "receipt_4471.pdf"
          }
        ],
        question: "What should you do?",
        options: [
          {
            text: "Do not open the attachment or reply. Check your own bank or credit card account through the official app or website, and contact the card company directly if you see a problem.",
            tier: "best",
            feedback:
              "You handled the worry without letting the email control your next step. Instead of opening the file, you checked the situation through a trusted account."
          },
          {
            text: "Pause and verify the charge through a trusted source.",
            tier: "safe",
            feedback: "Your own statement is the definitive answer."
          },
          {
            text: "Open the attached receipt immediately so you can see what happened.",
            tier: "unsafe",
            feedback:
              "The worry about being charged is manufactured for exactly this reason. If a real charge existed, it would appear on your statement."
          }
        ],
        spotted: [
          "Unexpected attachment",
          "Unfamiliar company",
          "A money-related worry",
          "Pressure to respond",
          "Unverified contact information inside the message"
        ]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Be Careful with Attachments.",
      habit: "Before opening an attachment, ask: \"Was I expecting this?\"",
      warningSign: "An attachment you didn't expect.",
      skills: [
        "Paused before opening a file",
        "Checked whether a message made sense",
        "Verified through a trusted account",
        "Responded to worry without rushing"
      ],
      next: "Don't Keep Suspicious Messages Secret"
    }
  },

  // ============================================================
  // LESSON 6.4 — NOT YET WRITTEN
  // "You Are Allowed to Hang Up"
  // Referenced by 6.5 and 6.6. Insert here when the text exists.
  // ============================================================

  // ============================================================
  // LESSON 6.5
  // ============================================================
  {
    id: "scam-no-secrets",
    track: "scam",
    phase: 13,
    order: 5,
    lessonNumber: "6.5",
    title: "Don't Keep Suspicious Messages Secret",
    pathTitle: "No Secrets",
    badge: "Help Asker",
    xp: 20,
    goals: [
      "Treat secrecy requests as a warning sign.",
      "Feel comfortable asking a trusted person for help."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Don't Keep Suspicious Messages Secret",
        question: "What should I do if a message tells me not to tell anyone?",
        objective:
          "Learn that secrecy is a warning sign and that talking to a trusted person can help you make a safer decision.",
        warningSigns: COMM_HABITS,
        text: "Scammers often try to keep people alone in the conversation. They may say, \"Don't tell your family,\" \"This must stay private,\" or \"You'll be embarrassed if anyone finds out.\" Secrecy gives the scammer more control because no one else gets a chance to help you think clearly. A safe message usually does not require you to hide it from people you trust. If a message involves money, fear, family emergencies, passwords, codes, or personal information, pause and talk to someone you trust before acting."
      },
      {
        type: "tiered",
        title: "The secret request",
        scenario:
          "You receive a message that says, \"Please don't tell anyone about this. It has to stay between us.\"",
        question: "What should you think?",
        options: [
          {
            text: "Secrecy can be a warning sign.",
            tier: "best",
            feedback:
              "A polite message can still be unsafe if it tries to isolate you from people who could help."
          },
          {
            text: "I should pause before responding.",
            tier: "safe",
            feedback: "The pause is what creates room to think."
          },
          {
            text: "It must be safe because they asked politely.",
            tier: "unsafe",
            feedback: "Politeness makes the request easier to accept, not safer."
          }
        ]
      },
      {
        type: "tiered",
        title: "Family emergency",
        scenario:
          "Someone claiming to be your nephew texts: \"I'm in trouble. Please don't call my parents. I need money today.\"",
        question: "Which response is the best?",
        options: [
          {
            text: "Contact your nephew or another family member using a number you already trust.",
            tier: "best",
            feedback:
              "A real emergency can still be checked safely. Verifying protects both you and your family."
          },
          {
            text: "Do not send money until the situation is verified.",
            tier: "safe",
            feedback: "Nothing needs to move before you know."
          },
          {
            text: "Keep the secret because the sender asked you to.",
            tier: "unsafe",
            feedback:
              "The request not to call his parents is the loudest signal in the message."
          }
        ]
      },
      {
        type: "tiered",
        title: "Embarrassment pressure",
        scenario:
          "A message says, \"If you tell anyone about this, they'll think you were careless.\" You feel embarrassed and unsure.",
        question: "What is the best response?",
        options: [
          {
            text: "Talk to a trusted person anyway.",
            tier: "best",
            feedback:
              "Embarrassment is one way scammers keep people isolated. A trusted person can help you think clearly."
          },
          {
            text: "Remember that asking for help is a smart safety step.",
            tier: "safe",
            feedback: "It is, and it always has been."
          },
          {
            text: "Stay silent because embarrassment means you should handle it alone.",
            tier: "unsafe",
            feedback:
              "That feeling is being deliberately created so you stay alone with it."
          }
        ]
      },
      {
        type: "tiered",
        title: "Safe people help you slow down",
        scenario:
          "A caller says, \"Do not discuss this with anyone. If you do, the offer will disappear.\"",
        question: "Which response is the best?",
        options: [
          {
            text: "End the conversation and discuss it with someone you trust.",
            tier: "best",
            feedback:
              "A safe opportunity should survive careful thinking. A dangerous one often depends on secrecy and speed."
          },
          {
            text: "Treat the secrecy and deadline as warning signs.",
            tier: "safe",
            feedback: "Two warning signs in a single sentence."
          },
          {
            text: "Stay on the call because you might lose the offer.",
            tier: "unsafe",
            feedback:
              "An offer that vanishes when examined was never worth having."
          }
        ]
      },
      {
        type: "confidence",
        question:
          "How confident do you feel talking to someone you trust before acting on a secretive message?",
        practice: [
          {
            scenario: "A message says, \"Don't show this to anyone. They won't understand.\"",
            question: "Which response is the best?",
            options: [
              {
                text: "Show or describe the message to someone you trust before acting.",
                tier: "best",
                feedback:
                  "A message that discourages outside advice deserves extra caution."
              },
              {
                text: "Pause because the message is trying to isolate you.",
                tier: "safe",
                feedback: "Naming the tactic weakens it."
              },
              {
                text: "Keep it private because the sender said others won't understand.",
                tier: "unsafe",
                feedback:
                  "Others would understand perfectly well — that's the worry."
              }
            ]
          },
          {
            scenario:
              "You feel unsure about a message asking for money, but you don't want to bother anyone.",
            question: "Which response is the best?",
            options: [
              {
                text: "Ask a trusted person to help you review it.",
                tier: "best",
                feedback:
                  "You are not bothering someone by protecting yourself."
              },
              {
                text: "Remember that asking for help is responsible.",
                tier: "safe",
                feedback: "It's one of the most protective things you can do."
              },
              {
                text: "Send the money first and ask questions later.",
                tier: "unsafe",
                feedback: "Money sent this way is rarely recoverable."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 2.2 — Keep It a Secret",
            note: "Secrecy often appears alongside pressure. Both are warning signs."
          },
          {
            lesson: "Lesson 6.1 — Know Who You're Talking To",
            note: "If you're not sure who sent a message, verify through someone or something you already trust."
          }
        ]
      },
      {
        type: "finalboss",
        title: "\"Please don't tell anyone\"",
        setup:
          "You receive a text from an unfamiliar number. Your grandson's name is Daniel. You feel worried and want to help.",
        messages: [
          {
            from: "Text · Unknown number",
            body: "Hi Grandma, it's Daniel. I'm using my friend's phone."
          },
          {
            from: "Text · Unknown number",
            body: "I made a mistake and I'm really embarrassed. Please don't tell Mom or Dad."
          },
          {
            from: "Text · Unknown number",
            body:
              "I need $450 today to fix it. Please send it quickly. I promise I'll explain later."
          }
        ],
        question: "What should you do?",
        options: [
          {
            text: "Do not send money. Stop texting the unfamiliar number and contact Daniel or another family member using a number you already trust.",
            tier: "best",
            feedback:
              "You cared about your family member without letting the message control you. You broke the secrecy pressure and verified through trusted family contact."
          },
          {
            text: "Treat the secrecy and money request as warning signs.",
            tier: "safe",
            feedback: "Both appeared within three short messages."
          },
          {
            text: "Send the money because family problems should stay private.",
            tier: "unsafe",
            feedback:
              "That belief is precisely what the message was built to exploit. Real family problems survive a phone call."
          }
        ],
        spotted: [
          "New or unfamiliar number",
          "Emotional pressure",
          "Request for money",
          "Request for secrecy",
          "Discouragement from contacting others"
        ]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Don't Keep Suspicious Messages Secret.",
      habit: "If a message says \"Don't tell anyone,\" tell someone you trust before acting.",
      warningSign: "Secrecy gives scammers power. Trusted people take it back.",
      skills: [
        "Recognized secrecy as a warning sign",
        "Asked a trusted person for help",
        "Verified a family emergency safely",
        "Resisted embarrassment and pressure"
      ],
      next: "Stop, Save, Block, and Report"
    }
  },

  // ============================================================
  // LESSON 6.6
  // ============================================================
  {
    id: "scam-stop-save-block-report",
    track: "scam",
    phase: 13,
    order: 6,
    lessonNumber: "6.6",
    title: "Stop, Save, Block, and Report",
    pathTitle: "Stop & Report",
    badge: "Communication Guardian",
    xp: 20,
    goals: [
      "Know the full routine after spotting suspicious communication.",
      "Stop responding without needing to argue or explain."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Stop, Save, Block, and Report",
        question: "What do I do after I realize something might be a scam?",
        objective:
          "Learn what to do after receiving a suspicious message, call, email, or social media contact.",
        warningSigns: [
          "Stop responding",
          "Save useful evidence",
          "Block the sender",
          "Report the message",
          "Verify through a trusted method",
        ],
        text: "Once you realize a message, call, email, or social media contact may be unsafe, your goal is to regain control. You do not need to argue, explain yourself, or prove that the sender is lying. Stop responding. If the message involves money, threats, or an account problem, save a screenshot so a trusted person, company, or bank can review it. Then block the sender if needed and report the message through the app, phone provider, email service, or organization. If the issue might be real, contact the real company using a trusted method."
      },
      {
        type: "tiered",
        title: "Stop responding",
        scenario:
          "You realize a text message asking for money may not be from your relative. The sender keeps writing, \"Why aren't you answering?\"",
        question: "Which response is the best?",
        options: [
          {
            text: "Stop responding and verify through a trusted contact method.",
            tier: "best",
            feedback:
              "You do not need to convince a suspicious sender of anything. Stop and verify another way."
          },
          {
            text: "Do not explain or argue with the suspicious sender.",
            tier: "safe",
            feedback: "Explaining only keeps the conversation alive."
          },
          {
            text: "Keep texting until they admit whether they are real.",
            tier: "unsafe",
            feedback:
              "They will never admit it, and every reply confirms your number is active."
          }
        ]
      },
      {
        type: "tiered",
        title: "Save useful evidence",
        scenario:
          "You receive a suspicious email claiming to be from your bank. It asks for your password and includes a phone number.",
        question: "What should you do before deleting everything?",
        options: [
          {
            text: "Save or keep the message if you may need to show it to your bank or a trusted helper.",
            tier: "best",
            feedback:
              "Keeping the message can help a trusted person or organization understand what happened."
          },
          {
            text: "Avoid clicking links or calling numbers inside the suspicious email.",
            tier: "safe",
            feedback: "Save it, but don't interact with anything in it."
          },
          {
            text: "Reply and ask whether the email is real.",
            tier: "unsafe",
            feedback: "The sender will always say yes."
          }
        ]
      },
      {
        type: "tiered",
        title: "Blocking is allowed",
        scenario: "A suspicious caller keeps calling after you hang up.",
        question: "Which response is the best?",
        options: [
          {
            text: "Block the number if your phone allows it.",
            tier: "best",
            feedback:
              "You do not owe repeated access to someone who is pressuring or bothering you."
          },
          {
            text: "Ask a trusted person or your phone provider for help blocking repeated calls.",
            tier: "safe",
            feedback: "There's no shame in asking for help with the settings."
          },
          {
            text: "Keep answering so the caller does not get upset.",
            tier: "unsafe",
            feedback:
              "Their feelings are not your responsibility, and they are not real anyway."
          }
        ]
      },
      {
        type: "tiered",
        title: "Report through the right place",
        scenario:
          "You receive a fake-looking email pretending to be from a delivery company.",
        question: "Which response is the best?",
        options: [
          {
            text: "Use the email app's report or spam option, and check delivery information through the official website or app if needed.",
            tier: "best",
            feedback:
              "Reporting helps reduce future suspicious messages, and checking through an official route keeps you safe."
          },
          {
            text: "Report the message if the app gives you that option.",
            tier: "safe",
            feedback: "Most email apps have this built in."
          },
          {
            text: "Forward the email to friends to warn them without checking it first.",
            tier: "unsafe",
            feedback:
              "Forwarding spreads the links further, and your friends may click them."
          }
        ]
      },
      {
        type: "confidence",
        question:
          "How confident do you feel stopping, saving, blocking, or reporting suspicious communication?",
        practice: [
          {
            scenario:
              "A social media account sends repeated messages asking for personal information.",
            question: "Which response is the best?",
            options: [
              {
                text: "Stop replying, block the account, and report it if possible.",
                tier: "best",
                feedback:
                  "Protecting yourself is more important than being polite to an unsafe account."
              },
              {
                text: "Ask a trusted person for help if you are unsure how to block it.",
                tier: "safe",
                feedback: "A perfectly good reason to ask."
              },
              {
                text: "Keep answering because ignoring messages is rude.",
                tier: "unsafe",
                feedback:
                  "There is no rudeness in refusing a stranger who wants your information."
              }
            ]
          },
          {
            scenario:
              "You receive a suspicious message about your credit card. You're worried it might be real.",
            question: "Which response is the best?",
            options: [
              {
                text: "Do not use the message's link or phone number. Open your card's official app or call the number on the card.",
                tier: "best",
                feedback:
                  "You can investigate the concern without continuing the suspicious conversation."
              },
              {
                text: "Save the message if you may need to show it to the credit card company.",
                tier: "safe",
                feedback: "Useful for their fraud team."
              },
              {
                text: "Reply to the message and ask them to prove who they are.",
                tier: "unsafe",
                feedback: "They'll happily produce convincing 'proof.'"
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 6.2 — A Link Is an Invitation",
            note: "You can avoid suspicious links and use official apps or websites instead."
          },
          {
            lesson: "Lesson 6.3 — Be Careful with Attachments",
            note: "You can stop before opening unexpected files."
          },
          {
            lesson: "Lesson 6.5 — Don't Keep Suspicious Messages Secret",
            note: "A trusted person can help you decide what to save, block, or report."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The suspicious message chain",
        setup:
          "You remember that you already paid your internet bill. You're worried because you don't want your service shut off.",
        messages: [
          {
            from: "Email · \"Your Internet Company\"",
            body:
              "Your account will be closed today unless you confirm your payment information. Do not ignore this message. Questions? Call 1-800-555-0148.",
            fakeButton: "Update payment"
          },
          {
            from: "Text · Unknown number, minutes later",
            body:
              "This is support. We noticed you haven't updated your payment yet. Please act now."
          }
        ],
        question: "What should you do?",
        options: [
          {
            text: "Do not click the link, call the number in the message, or reply to the text. Save the messages if needed, block or report them, and contact the internet company through its official website, app, or your bill statement.",
            tier: "best",
            feedback:
              "You used a complete smart communication plan. You didn't argue with the sender, didn't use the contact information they provided, and reached the company through a trusted route instead."
          },
          {
            text: "Stop responding and verify through a trusted source.",
            tier: "safe",
            feedback: "The core of the routine, correctly applied."
          },
          {
            text: "Click the link quickly because losing internet service would be stressful.",
            tier: "unsafe",
            feedback:
              "The fear of losing service is the entire lever. Notice the coordinated email and text — that pairing exists to overwhelm you."
          }
        ],
        spotted: [
          "Unexpected account threat",
          "Urgency",
          "An unverified link and phone number",
          "Follow-up pressure from an unknown number",
          "Request for payment information"
        ]
      }
    ],
    quiz: [],
    complete: {
      title: "Phase 13 complete!",
      subtitle: "You completed Stop, Save, Block, and Report — and all of Phase 13.",
      habit: "When communication feels unsafe: stop, save, block, report, and verify.",
      warningSign: "You do not have to continue a conversation to solve the problem.",
      skills: [
        "Stopped responding",
        "Avoided suspicious links and numbers",
        "Saved useful evidence",
        "Blocked and reported",
        "Verified through trusted sources"
      ],
      learned: [
        "Verify who you're talking to.",
        "A link is an invitation you can decline.",
        "Pause before opening attachments.",
        "Break secrecy pressure by telling someone you trust.",
        "Stop, save, block, report, and verify.",
        "You do not have to answer every message, open every link, or keep every secret."
      ],
      next: "More lessons coming soon"
    }
  }
];

export default scamPhase6Lessons;
