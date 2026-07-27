// Everwise - Scam Protection track
// Phase 15: AI in Everyday Life
//
// Phase 11 taught what AI can be misused for. This phase teaches learners to
// actually use AI well: confidence and caution together.
//   AI can help you think, organize, and practice — but you remain the
//   decision maker.
//
// Note on language: the curriculum deliberately says "AI guesses," never
// "AI lies." AI isn't trying to trick anyone; it can simply be wrong,
// incomplete, outdated, or overconfident.

const AI_EVERYDAY = [
  "Use AI as a helper",
  "Protect private information",
  "Give clear instructions",
  "Check important answers",
  "Make the final decision yourself",
];

export const scamPhase8Lessons = [
  // ============================================================
  // LESSON 8.1
  // ============================================================
  {
    id: "scam-ai-clear-questions",
    track: "scam",
    phase: 15,
    order: 1,
    lessonNumber: "8.1",
    title: "Ask AI Clear Questions",
    pathTitle: "Clear Questions",
    badge: "Prompt Writer",
    xp: 20,
    goals: [
      "Write a prompt with task, context, format, and limits.",
      "Use follow-up questions to improve an answer."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Ask AI Clear Questions",
        question: "How do I get better help from AI?",
        objective:
          "Learn how to ask AI better questions by giving clear instructions, useful context, and the kind of answer you want.",
        warningSigns: AI_EVERYDAY,
        text: "A question or instruction you give to AI is called a prompt. A helpful prompt includes: Task (what do you want AI to do?), Context (what safe background information helps?), Format (a list, steps, a short answer, a draft?), and Limits (simple, friendly, short, beginner-level?). Instead of \"Help with this,\" try \"Help me write a short, polite text to my neighbor asking if they received my package by mistake.\" You don't need perfect prompts. You can start simple and follow up: \"Make it shorter.\" \"Explain that in simpler words.\" \"Give me three options.\""
      },
      {
        type: "tiered",
        title: "The clear prompt",
        scenario:
          "You want AI to help you write a message to your doctor's office asking about an appointment time.",
        question: "Which prompt is the best?",
        options: [
          {
            text: "\"Write a short, polite message asking my doctor's office to confirm my appointment time.\"",
            tier: "best",
            feedback: "The best prompt explains the task, audience, and tone."
          },
          {
            text: "\"Help me write a message about an appointment.\"",
            tier: "safe",
            feedback:
              "Workable — you'd just need a follow-up to shape the result."
          },
          {
            text: "\"Do it.\"",
            tier: "unsafe",
            feedback: "AI has no idea what \"it\" refers to."
          }
        ]
      },
      {
        type: "tiered",
        title: "Giving safe context",
        scenario: "You want AI to help write a grocery list for a simple dinner.",
        question: "Which information is useful and safe to include?",
        options: [
          {
            text: "\"I need a grocery list for a simple dinner for four people.\"",
            tier: "best",
            feedback: "AI needs useful context, not private payment or identity information."
          },
          {
            text: "\"Please keep the list budget-friendly and easy to cook.\"",
            tier: "safe",
            feedback: "Helpful limits that shape a better answer."
          },
          {
            text: "Your credit card number and home address.",
            tier: "unsafe",
            feedback:
              "Neither has anything to do with a grocery list."
          }
        ]
      },
      {
        type: "tiered",
        title: "Asking for format",
        scenario: "AI gives you a long explanation that feels hard to follow.",
        question: "What should you ask next?",
        options: [
          {
            text: "\"Can you explain this in three simple steps?\"",
            tier: "best",
            feedback:
              "You can guide AI. Asking for a clearer format often improves the answer."
          },
          {
            text: "\"Can you make this shorter and easier to read?\"",
            tier: "safe",
            feedback: "Equally effective."
          },
          {
            text: "\"I guess AI cannot help me.\"",
            tier: "unsafe",
            feedback:
              "The first answer is rarely the final answer. One follow-up usually fixes it."
          }
        ]
      },
      {
        type: "tiered",
        title: "Follow-up questions",
        scenario:
          "AI gives you a recipe, but it includes an ingredient you don't have.",
        question: "Which response is the best?",
        options: [
          {
            text: "Ask AI for a version of the recipe without that ingredient.",
            tier: "best",
            feedback:
              "AI answers can be adjusted. Follow-up questions help you get something more useful."
          },
          {
            text: "Tell AI what ingredients you do have.",
            tier: "safe",
            feedback: "Often produces an even better result."
          },
          {
            text: "Give up because the first answer was not perfect.",
            tier: "unsafe",
            feedback: "Good AI use is a conversation, not a single question."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel asking AI a clear question?",
        practice: [
          {
            scenario:
              "You want AI to explain a confusing letter from your insurance company, without sharing private account numbers.",
            question: "Which prompt is the best?",
            options: [
              {
                text: "\"Explain this paragraph in simple words. I removed my name, address, and account number.\"",
                tier: "best",
                feedback:
                  "You can use AI to understand confusing language while protecting private details."
              },
              {
                text: "\"Tell me what questions I should ask the insurance company.\"",
                tier: "safe",
                feedback: "An excellent use — preparing for the real conversation."
              },
              {
                text: "\"Here is my full account number, password, and personal information.\"",
                tier: "unsafe",
                feedback:
                  "None of that helps AI explain a paragraph."
              }
            ]
          },
          {
            scenario: "You want AI to help plan a birthday dinner.",
            question: "Which prompt is the best?",
            options: [
              {
                text: "\"Make a simple dinner plan for six adults with easy recipes and a grocery list.\"",
                tier: "best",
                feedback:
                  "The more clearly you explain the task, the more useful the answer."
              },
              {
                text: "\"Keep it beginner-friendly and not too expensive.\"",
                tier: "safe",
                feedback: "Useful limits to add."
              },
              {
                text: "\"Dinner.\"",
                tier: "unsafe",
                feedback: "You'd get something, but almost certainly not what you wanted."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 4.8 — Making AI Your Helper",
            note: "AI is useful as a helper, but you stay in charge."
          },
          {
            lesson: "Lesson 5.1 — Your Information Is Valuable",
            note: "Only share information AI needs. Leave out private details when possible."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The better AI question",
        setup:
          "You received a confusing email from your cable company. It includes your full name, home address, account number, a paragraph about a price change, a paragraph about a new service option, a customer-service phone number, and a due date. You want to know what it means and what to ask.",
        question: "Which prompt is the best?",
        options: [
          {
            text: "\"Explain this cable-company email in simple words. I removed my name, address, and account number. Then give me three questions I can ask customer service.\"",
            tier: "best",
            feedback:
              "You created a strong prompt: a clear task, safe context, a simple format, a useful next step, and privacy protection. You used AI as a helper without giving it unnecessary private information."
          },
          {
            text: "\"Summarize the email and tell me what seems important.\"",
            tier: "safe",
            feedback:
              "A reasonable prompt — just remember to remove the private details first."
          },
          {
            text: "\"Here is my full name, address, account number, and the email. Tell me what to do.\"",
            tier: "unsafe",
            feedback:
              "None of those details help AI explain the wording, and \"tell me what to do\" hands over a decision that should stay yours."
          }
        ],
        spotted: []
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Ask AI Clear Questions.",
      habit: "When asking AI for help, include: Task. Context. Format. Limits.",
      warningSign: "A vague prompt gives a vague answer.",
      skills: [
        "Built a clear prompt",
        "Gave safe context",
        "Requested a helpful format",
        "Used follow-up questions"
      ],
      next: "Check AI Before You Act"
    }
  },

  // ============================================================
  // LESSON 8.2
  // ============================================================
  {
    id: "scam-ai-check-before-act",
    track: "scam",
    phase: 15,
    order: 2,
    lessonNumber: "8.2",
    title: "Check AI Before You Act",
    pathTitle: "Check Before Acting",
    badge: "Risk Reviewer",
    xp: 20,
    goals: [
      "Use \"risk decides review\" to judge when to verify.",
      "Keep AI out of the final authority seat on serious topics."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Check AI Before You Act",
        question: "Can I trust what AI tells me?",
        objective:
          "Learn when to trust, check, or avoid acting on AI answers, especially when money, health, safety, legal issues, or personal information are involved.",
        warningSigns: AI_EVERYDAY,
        text: "AI can give helpful answers, but it doesn't always know what's true. AI predicts likely answers based on patterns, which means it can sound confident while being incomplete, outdated, misunderstood, or wrong. A simple rule: risk decides review. Low-risk help — dinner ideas, rewording a friendly message, a packing list — needs only light checking. Higher-risk help — money, health, legal documents, account problems, taxes, benefits — needs careful checking. For important topics, use AI to prepare questions and explain language, then verify with a trusted source."
      },
      {
        type: "tiered",
        title: "Low-risk AI help",
        scenario:
          "You ask AI, \"Give me three easy dinner ideas using eggs and vegetables.\"",
        question: "How risky is this?",
        options: [
          {
            text: "Low risk. You can use the ideas and adjust them to your needs.",
            tier: "best",
            feedback:
              "AI can be useful for low-risk brainstorming. You still use common sense."
          },
          {
            text: "Check ingredients and cooking safety as you normally would.",
            tier: "safe",
            feedback: "Exactly the level of care needed here."
          },
          {
            text: "High risk because every AI answer is dangerous.",
            tier: "unsafe",
            feedback:
              "Treating everything as dangerous makes AI useless. Risk decides review."
          }
        ]
      },
      {
        type: "tiered",
        title: "Health question",
        scenario:
          "You ask AI about a new pain in your chest. AI gives a calm explanation and says it is probably nothing.",
        question: "Which response is the best?",
        options: [
          {
            text: "Do not rely on AI for urgent health symptoms. Contact a medical professional or emergency service if needed.",
            tier: "best",
            feedback:
              "AI should not be the final authority for serious or urgent health concerns."
          },
          {
            text: "Use AI only to help prepare questions for a doctor or nurse.",
            tier: "safe",
            feedback: "That's an appropriate role for it."
          },
          {
            text: "Trust AI because it sounded confident.",
            tier: "unsafe",
            feedback:
              "Chest pain is exactly the kind of symptom where a calm, confident, wrong answer could cause real harm."
          }
        ]
      },
      {
        type: "tiered",
        title: "Money question",
        scenario:
          "You ask AI, \"Should I invest $2,000 in this offer that promises guaranteed profit?\" AI says, \"It sounds like a great opportunity.\"",
        question: "What should you do?",
        options: [
          {
            text: "Do not rely on AI alone. Verify the offer and talk to a trusted financial professional or knowledgeable person.",
            tier: "best",
            feedback:
              "AI can miss warning signs. Serious money decisions need trusted review."
          },
          {
            text: "Treat guaranteed profit as a warning sign, even if AI sounds positive.",
            tier: "safe",
            feedback:
              "You already learned that in Phase 14 — and AI just missed it."
          },
          {
            text: "Send the money because AI approved it.",
            tier: "unsafe",
            feedback:
              "AI cannot investigate the offer, and it just endorsed something with a classic warning sign in it."
          }
        ]
      },
      {
        type: "tiered",
        title: "Official information",
        scenario:
          "You ask AI, \"What phone number should I call for my bank?\" AI gives you a phone number.",
        question: "Which response is the best?",
        options: [
          {
            text: "Check the number on your bank card, bank statement, official app, or official website before calling.",
            tier: "best",
            feedback:
              "AI may provide incorrect or outdated contact information. For accounts and money, use trusted official sources."
          },
          {
            text: "Use AI to remind you where to look for the number.",
            tier: "safe",
            feedback: "A good use — pointing you to the real source."
          },
          {
            text: "Call the number from AI without checking it.",
            tier: "unsafe",
            feedback:
              "A wrong number could reach anyone. The number on your card is definitive."
          }
        ]
      },
      {
        type: "confidence",
        question:
          "How confident do you feel knowing when to check an AI answer before acting?",
        practice: [
          {
            scenario: "You ask AI to rewrite a birthday message to a friend.",
            question: "What should you do?",
            options: [
              {
                text: "Read it and make sure it sounds like you before sending.",
                tier: "best",
                feedback: "Even low-risk AI writing should be reviewed before sending."
              },
              {
                text: "Edit anything that feels too formal, incorrect, or personal.",
                tier: "safe",
                feedback: "Your friend will notice if it doesn't sound like you."
              },
              {
                text: "Send it without reading because AI wrote it.",
                tier: "unsafe",
                feedback: "It goes out under your name."
              }
            ]
          },
          {
            scenario:
              "You ask AI what documents are needed for a government benefit application. AI gives a list.",
            question: "Which response is the best?",
            options: [
              {
                text: "Use AI's list as a starting point, then check the official government website or office.",
                tier: "best",
                feedback:
                  "Rules and requirements can change. Official sources matter for benefits, taxes, and legal forms."
              },
              {
                text: "Ask AI to help you prepare questions for the office.",
                tier: "safe",
                feedback: "A genuinely good use of it."
              },
              {
                text: "Rely only on AI's list because government rules never change.",
                tier: "unsafe",
                feedback: "They change frequently and vary by location."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 4.6 — When AI Sounds Certain",
            note: "Confidence is a style of speaking, not proof of accuracy."
          },
          {
            lesson: "Lesson 7.1 — Check Before Money Moves",
            note: "AI should not be the only source you use before sending money."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The AI answer that sounds certain",
        setup:
          "You receive a confusing letter about a possible change to your health insurance. You remove your name, address, member number, and personal details, then ask AI to explain it and tell you what to do next. The letter mentions a deadline, a plan change, a phone number, a possible cost difference, and a choice you may need to make. You feel relieved because AI sounded confident.",
        messages: [
          {
            from: "AI chatbot",
            body:
              "You do not need to call anyone. Your coverage will stay the same."
          }
        ],
        question: "What should you do?",
        options: [
          {
            text: "Use AI's explanation as a starting point, but verify the deadline, plan change, cost, and next steps through the official insurance company or benefits office before deciding.",
            tier: "best",
            feedback:
              "You let AI help you understand the letter, but you did not let AI make the final decision. The topic affected health coverage, involved a deadline, and might require a choice — all reasons to verify."
          },
          {
            text: "Ask AI to help you list questions to ask the insurance company.",
            tier: "safe",
            feedback: "An excellent way to turn the AI answer into useful preparation."
          },
          {
            text: "Trust AI completely because it sounded certain and made you feel better.",
            tier: "unsafe",
            feedback:
              "AI cannot see your specific plan and has no way to know whether your coverage changes. The relief it gave you is exactly why this answer is worth checking."
          }
        ],
        spotted: []
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Check AI Before You Act.",
      habit: "Use AI to help you think, then check before you act.",
      warningSign: "Risk decides review.",
      skills: [
        "Identified low-risk and high-risk AI use",
        "Verified AI information with trusted sources",
        "Used AI to prepare better questions"
      ],
      next: "Use AI to Understand Confusing Information"
    }
  },

  // ============================================================
  // LESSON 8.3
  // ============================================================
  {
    id: "scam-ai-understand-confusing",
    track: "scam",
    phase: 15,
    order: 3,
    lessonNumber: "8.3",
    title: "Use AI to Understand Confusing Information",
    pathTitle: "Explain It Simply",
    badge: "Plain Language",
    xp: 20,
    goals: [
      "Remove private details before sharing text with AI.",
      "Ask AI to explain, summarize, and prepare questions."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Use AI to Understand Confusing Information",
        question: "Can AI help me understand something confusing?",
        objective:
          "Learn how to use AI to explain confusing messages, letters, forms, instructions, or notices while protecting private information.",
        warningSigns: ["Remove — take out private details", "Explain — ask for plain words", "Summarize — get the main idea", "Questions — what should you ask the real company?", "Verify — check important details"],
        text: "AI can be very helpful when something is hard to understand. It can explain a confusing email, summarize a letter, define unfamiliar words, or help you prepare questions before calling a company, doctor, bank, or government office. But before sharing text with AI, remove private information when possible — full name, address, account number, member number, Social Security number, card number, passwords, verification codes, medical record numbers. AI can help you understand, but you stay in charge of what happens next."
      },
      {
        type: "tiered",
        title: "Removing private details",
        scenario:
          "You want AI to explain a confusing insurance letter that includes your name, address, member number, and a paragraph about a plan change.",
        question: "What should you do before sharing it with AI?",
        options: [
          {
            text: "Remove private details like your name, address, and member number if they are not needed.",
            tier: "best",
            feedback: "AI can often explain the meaning without needing private details."
          },
          {
            text: "Share only the confusing paragraph when possible.",
            tier: "safe",
            feedback: "Even better — share the minimum needed."
          },
          {
            text: "Include everything, including account numbers and private identifiers.",
            tier: "unsafe",
            feedback:
              "None of that helps AI explain the wording."
          }
        ]
      },
      {
        type: "tiered",
        title: "Asking for a simple explanation",
        scenario: "AI gives you a long explanation full of complicated words.",
        question: "What should you ask next?",
        options: [
          {
            text: "\"Explain this in simple words and list the main points.\"",
            tier: "best",
            feedback: "You can ask AI to simplify, shorten, and organize the answer."
          },
          {
            text: "\"Give me the three most important things to understand.\"",
            tier: "safe",
            feedback: "A good way to cut through length."
          },
          {
            text: "\"I guess I cannot understand this.\"",
            tier: "unsafe",
            feedback:
              "The problem is the explanation, not you. Ask for a simpler one."
          }
        ]
      },
      {
        type: "tiered",
        title: "Questions to ask a real person",
        scenario:
          "You're reading a confusing bill. AI explains it, but you still aren't sure whether the amount is correct.",
        question: "Which response is the best?",
        options: [
          {
            text: "Ask AI to help make a list of questions to ask the billing office.",
            tier: "best",
            feedback:
              "AI can help you prepare, but the real billing office should confirm the actual account details."
          },
          {
            text: "Contact the billing office through a trusted phone number or official website.",
            tier: "safe",
            feedback: "The only place that can confirm your actual balance."
          },
          {
            text: "Pay immediately because AI explained part of the bill.",
            tier: "unsafe",
            feedback:
              "Understanding the wording isn't the same as confirming the amount is right."
          }
        ]
      },
      {
        type: "tiered",
        title: "Important details need verification",
        scenario:
          "AI summarizes a letter and says \"It looks like there is no deadline.\" But the letter has a small section that mentions a date.",
        question: "Which response is the best?",
        options: [
          {
            text: "Check the deadline through the official company, office, or trusted support person before ignoring it.",
            tier: "best",
            feedback:
              "AI can miss details. Deadlines, payments, benefits, health coverage, and legal issues should be checked carefully."
          },
          {
            text: "Ask AI to help identify any dates or action steps in the letter.",
            tier: "safe",
            feedback: "A good follow-up — and you already spotted one it missed."
          },
          {
            text: "Ignore the date because AI said there was no deadline.",
            tier: "unsafe",
            feedback:
              "You can see the date with your own eyes. AI missed it, which is exactly why review matters."
          }
        ]
      },
      {
        type: "confidence",
        question:
          "How confident do you feel using AI to explain confusing information safely?",
        practice: [
          {
            scenario:
              "You receive a message from a company with a paragraph you don't understand.",
            question: "Which prompt is the best?",
            options: [
              {
                text: "\"Explain this paragraph in simple words. I removed my personal information.\"",
                tier: "best",
                feedback:
                  "You gave AI what it needs for understanding without sharing private information."
              },
              {
                text: "\"Tell me what questions I should ask the company.\"",
                tier: "safe",
                feedback: "Turns confusion into a plan."
              },
              {
                text: "\"Here is my password and account number. Tell me what this means.\"",
                tier: "unsafe",
                feedback: "Neither is needed to explain a paragraph."
              }
            ]
          },
          {
            scenario:
              "You ask AI to explain a government benefits notice. AI gives a helpful summary.",
            question: "What should you do before making an important decision?",
            options: [
              {
                text: "Check the official notice, website, office, or trusted helper before acting.",
                tier: "best",
                feedback:
                  "Important benefit decisions should be verified through official sources."
              },
              {
                text: "Use AI's summary as a starting point.",
                tier: "safe",
                feedback: "A starting point, not a conclusion."
              },
              {
                text: "Let AI decide whether you should apply, cancel, or ignore the notice.",
                tier: "unsafe",
                feedback:
                  "That decision affects your benefits and belongs to you."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 8.1 — Ask AI Clear Questions",
            note: "A clear prompt helps AI explain confusing information better."
          },
          {
            lesson: "Lesson 8.2 — Check AI Before You Act",
            note: "If the information affects money, health, benefits, or accounts, verify before acting."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The confusing notice",
        setup:
          "You receive a letter from your health insurance company. It includes your full name, home address, member number, plan name, a paragraph about a possible cost change, a deadline, a customer-service phone number, and a chart comparing two plan options. The language is confusing, and you want AI's help before calling.",
        question: "Which prompt is the best?",
        options: [
          {
            text: "\"Explain this insurance letter in simple words. I removed my name, address, and member number. Please summarize the main point, list any deadline, and give me three questions to ask customer service.\"",
            tier: "best",
            feedback:
              "You used AI safely and usefully: a clear task, privacy protection, a simple explanation request, a deadline check, a request for questions, and a plan to verify with the real company. You used AI to prepare, not to decide."
          },
          {
            text: "\"Summarize the letter and tell me what parts I should verify with the insurance company.\"",
            tier: "safe",
            feedback:
              "A good prompt — just remove the private details first."
          },
          {
            text: "\"Here is my full member number, address, and letter. Tell me whether I should change plans.\"",
            tier: "unsafe",
            feedback:
              "The private details don't help, and choosing a health plan is a decision AI cannot make for you — it doesn't know your doctors, medications, or budget."
          }
        ],
        spotted: []
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Use AI to Understand Confusing Information.",
      habit: "Before using AI on a document: remove, explain, summarize, questions, verify.",
      warningSign: "Sharing more than AI needs to know.",
      skills: [
        "Protected private information",
        "Asked for plain-language explanation",
        "Prepared questions for customer service",
        "Verified important details"
      ],
      next: "Use AI to Practice Conversations"
    }
  },

  // ============================================================
  // LESSON 8.4
  // ============================================================
  {
    id: "scam-ai-practice-conversations",
    track: "scam",
    phase: 15,
    order: 4,
    lessonNumber: "8.4",
    title: "Use AI to Practice Conversations",
    pathTitle: "Practice Calls",
    badge: "Call Rehearser",
    xp: 20,
    goals: [
      "Use goal, role, questions, practice, notes to rehearse.",
      "Keep real private details out of practice."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Use AI to Practice Conversations",
        question: "Can AI help me prepare for a conversation?",
        objective:
          "Learn how to use AI to practice phone calls, appointments, customer-service conversations, and difficult questions before having the real conversation.",
        warningSigns: ["Goal — what should the call accomplish?", "Role — who should AI pretend to be?", "Questions — what do you need to ask?", "Practice — act it out", "Notes — a short list for the real call"],
        text: "Many real-life conversations can feel stressful. You may need to call a company, ask a doctor's office a question, talk to a bank, cancel a subscription, or ask a family member for help. AI can help you prepare. A strong prompt might be: \"Help me practice calling my internet company about a bill I don't understand. Pretend to be a customer-service agent. Ask me simple questions. Then give me a short list of what to say during the real call.\" AI practice can make you feel more prepared — but AI is not the real company. Use it to rehearse, then confirm real answers through trusted sources."
      },
      {
        type: "tiered",
        title: "Preparing for a call",
        scenario:
          "You need to call your internet company about a charge you don't understand. You feel nervous.",
        question: "Which AI prompt is the best?",
        options: [
          {
            text: "\"Help me practice calling customer service about a confusing charge. Pretend to be the agent and help me prepare questions.\"",
            tier: "best",
            feedback:
              "AI can help you practice and prepare, but the real company must confirm the actual account information."
          },
          {
            text: "\"Make a short list of what I should ask during the call.\"",
            tier: "safe",
            feedback: "A checklist alone is genuinely useful."
          },
          {
            text: "\"Call the company for me and fix it.\"",
            tier: "unsafe",
            feedback: "AI cannot make phone calls on your behalf."
          }
        ]
      },
      {
        type: "tiered",
        title: "Safe practice information",
        scenario:
          "AI is helping you practice calling your bank. AI asks, \"What is your full card number?\"",
        question: "What should you do?",
        options: [
          {
            text: "Do not provide the real card number. Use a pretend example, or say you'll only share that with the real bank.",
            tier: "best",
            feedback: "Practice does not require real private information."
          },
          {
            text: "Continue practicing the conversation without private details.",
            tier: "safe",
            feedback: "The rehearsal works just as well."
          },
          {
            text: "Type your real card number so the practice feels realistic.",
            tier: "unsafe",
            feedback:
              "Realism isn't worth putting your card number into a chat window."
          }
        ]
      },
      {
        type: "tiered",
        title: "Asking for a script",
        scenario:
          "You want to cancel a subscription but are worried you'll forget what to say.",
        question: "Which request is the best?",
        options: [
          {
            text: "\"Write a short, polite cancellation script and a checklist of questions to ask.\"",
            tier: "best",
            feedback:
              "AI can help you prepare clear, honest wording and stay focused on your goal."
          },
          {
            text: "\"Help me practice saying no if they offer me another deal.\"",
            tier: "safe",
            feedback:
              "Very practical — retention offers are exactly where people waver."
          },
          {
            text: "\"Give me a fake excuse so they cannot ask questions.\"",
            tier: "unsafe",
            feedback:
              "You don't need an excuse at all. \"I'd like to cancel\" is a complete sentence."
          }
        ]
      },
      {
        type: "tiered",
        title: "Real answers come from real sources",
        scenario:
          "During practice, AI says, \"Your company probably allows refunds for this.\"",
        question: "Which response is the best?",
        options: [
          {
            text: "Ask the real company about the refund policy through official customer service.",
            tier: "best",
            feedback:
              "AI can help you prepare questions, but real policies must be confirmed by the real organization."
          },
          {
            text: "Use AI's suggestion as a question to ask, not as final proof.",
            tier: "safe",
            feedback: "Turning it into a question is exactly right."
          },
          {
            text: "Assume the refund is guaranteed because AI said it probably is.",
            tier: "unsafe",
            feedback:
              "AI has no access to that company's policy. \"Probably\" was doing a lot of work."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel using AI to prepare for a real conversation?",
        practice: [
          {
            scenario:
              "You want to ask your doctor's office about appointment instructions and don't want to forget anything.",
            question: "Which AI request is the best?",
            options: [
              {
                text: "\"Help me make a short list of questions for my doctor's office about my appointment instructions.\"",
                tier: "best",
                feedback:
                  "AI can help you prepare questions, but it cannot know what the doctor's office will say."
              },
              {
                text: "\"Help me practice asking these questions politely.\"",
                tier: "safe",
                feedback: "Rehearsal builds confidence."
              },
              {
                text: "\"Tell me exactly what my doctor will say.\"",
                tier: "unsafe",
                feedback: "AI cannot know that."
              }
            ]
          },
          {
            scenario:
              "You need to tell a seller that your order arrived damaged, and want to be clear but polite.",
            question: "Which AI request is the best?",
            options: [
              {
                text: "\"Help me write a polite message saying my order arrived damaged and asking for the next steps.\"",
                tier: "best",
                feedback:
                  "Clear and polite communication is usually more effective than aggressive wording."
              },
              {
                text: "\"Make the message short and include that I have photos.\"",
                tier: "safe",
                feedback: "Mentioning photos is a strong addition."
              },
              {
                text: "\"Threaten the seller so they respond faster.\"",
                tier: "unsafe",
                feedback:
                  "Threats usually slow things down and can end the conversation entirely."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 8.1 — Ask AI Clear Questions",
            note: "A good practice prompt includes the task, context, format, and limits."
          },
          {
            lesson: "Lesson 7.5 — When a Purchase Goes Wrong",
            note: "AI can help you prepare a clear message to a seller or customer-service department."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The subscription cancellation call",
        setup:
          "You signed up for a free trial last month. Now you see a monthly charge on your card. You want to call to cancel and ask whether a refund is possible, but you feel nervous because customer service calls can be confusing.",
        question: "Which AI prompt is the best?",
        options: [
          {
            text: "\"Help me practice calling customer service to cancel a subscription and ask whether a refund is possible. Pretend to be the agent. Do not ask me for real card numbers or passwords. After practice, give me a short checklist for the real call.\"",
            tier: "best",
            feedback:
              "You used AI to prepare safely: a clear goal, a role for AI, a practice conversation, a privacy limit, a checklist request, and the understanding that the real company must confirm the refund."
          },
          {
            text: "\"Write a polite script for canceling a subscription and asking about refund options.\"",
            tier: "safe",
            feedback: "A script alone still helps a great deal."
          },
          {
            text: "\"Pretend to be customer service and tell me that my refund is guaranteed.\"",
            tier: "unsafe",
            feedback:
              "Asking AI to role-play a guaranteed outcome just rehearses a false expectation — and could leave you more frustrated on the real call."
          }
        ],
        spotted: []
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Use AI to Practice Conversations.",
      habit: "Before a stressful call, use AI to practice: goal, role, questions, practice, notes.",
      warningSign: "Practice doesn't need real private details.",
      skills: [
        "Set a clear conversation goal",
        "Asked AI to role-play safely",
        "Created a call checklist",
        "Protected account information"
      ],
      next: "Use AI to Break Big Tasks Into Steps"
    }
  },

  // ============================================================
  // LESSON 8.5
  // ============================================================
  {
    id: "scam-ai-break-tasks",
    track: "scam",
    phase: 15,
    order: 5,
    lessonNumber: "8.5",
    title: "Use AI to Break Big Tasks Into Steps",
    pathTitle: "Small Steps",
    badge: "Task Organizer",
    xp: 20,
    goals: [
      "Turn an overwhelming task into small steps.",
      "Keep official decisions out of AI's hands."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Use AI to Break Big Tasks Into Steps",
        question: "Can AI help me figure out where to start?",
        objective:
          "Learn how to use AI to turn a big, confusing, or stressful task into smaller, manageable steps.",
        warningSigns: ["Goal — what are you trying to finish?", "Situation — safe background", "Steps — break it down", "Time — today, this week, later", "Check — what needs official verification?"],
        text: "Sometimes a task feels hard because there are too many pieces — cleaning out a closet, preparing for a trip, organizing paperwork, calling several offices, planning a family gathering. AI can help by turning the task into a step-by-step plan. Instead of \"Help me with my paperwork,\" try \"Help me organize a pile of household paperwork. Give me simple steps for sorting bills, receipts, medical papers, and documents I may need to keep. Do not ask for private account numbers.\" AI can help you start, but it should not decide what important documents to throw away or what official deadline matters."
      },
      {
        type: "tiered",
        title: "The big task",
        scenario: "You need to organize a stack of papers, but you feel overwhelmed.",
        question: "Which AI prompt is the best?",
        options: [
          {
            text: "\"Help me sort household paperwork into simple categories and give me the first three steps.\"",
            tier: "best",
            feedback: "AI can help organize the task without needing private information."
          },
          {
            text: "\"Make a checklist for organizing papers without using private account details.\"",
            tier: "safe",
            feedback: "The privacy limit is a good habit to state upfront."
          },
          {
            text: "\"Here are all my account numbers. Tell me what to throw away.\"",
            tier: "unsafe",
            feedback:
              "AI doesn't need the numbers, and deciding what to discard should be yours."
          }
        ]
      },
      {
        type: "tiered",
        title: "First, next, later",
        scenario:
          "You're planning for a trip. AI gives you a long list of things to do, and it feels like too much.",
        question: "What should you ask next?",
        options: [
          {
            text: "\"Can you divide this into what to do today, this week, and the day before the trip?\"",
            tier: "best",
            feedback:
              "AI can help sort tasks by timing, which makes a big list feel easier."
          },
          {
            text: "\"Can you make this into a short checklist?\"",
            tier: "safe",
            feedback: "Shorter is often enough."
          },
          {
            text: "\"I guess the trip is too complicated.\"",
            tier: "unsafe",
            feedback: "The list was too long, not the trip."
          }
        ]
      },
      {
        type: "tiered",
        title: "Important steps need checking",
        scenario:
          "AI helps you make a checklist for renewing an important document and says, \"You probably do not need to bring identification.\"",
        question: "Which response is the best?",
        options: [
          {
            text: "Check the official office website or call the office through a trusted number before going.",
            tier: "best",
            feedback:
              "For official documents, appointments, benefits, money, health, or legal issues, important steps should be checked."
          },
          {
            text: "Use AI's answer as a starting point, not final proof.",
            tier: "safe",
            feedback: "\"Probably\" is not a plan."
          },
          {
            text: "Trust AI because it sounded confident.",
            tier: "unsafe",
            feedback:
              "Arriving without required ID means the trip was wasted."
          }
        ]
      },
      {
        type: "tiered",
        title: "Privacy while planning",
        scenario:
          "You ask AI to help organize medical paperwork. AI asks for your full medical record number and insurance member number.",
        question: "What should you do?",
        options: [
          {
            text: "Do not provide private numbers. Ask AI to help with general categories and questions instead.",
            tier: "best",
            feedback:
              "AI can help you organize categories without needing private medical or account numbers."
          },
          {
            text: "Use labels like \"insurance paper\" or \"doctor bill\" without sharing private identifiers.",
            tier: "safe",
            feedback: "Categories work perfectly well as labels."
          },
          {
            text: "Type the numbers because AI needs them to make folders.",
            tier: "unsafe",
            feedback: "Folders don't require record numbers."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel using AI to turn a big task into smaller steps?",
        practice: [
          {
            scenario: "You want to clean out a closet but don't know where to begin.",
            question: "Which prompt is the best?",
            options: [
              {
                text: "\"Give me a simple closet-cleaning plan with small steps I can do over three days.\"",
                tier: "best",
                feedback:
                  "AI can help you plan the task, even when it cannot physically do the task."
              },
              {
                text: "\"Make the steps easy and not overwhelming.\"",
                tier: "safe",
                feedback: "A useful limit to add."
              },
              {
                text: "\"Clean my closet for me.\"",
                tier: "unsafe",
                feedback: "That one's still on you."
              }
            ]
          },
          {
            scenario:
              "You need to call three companies about bills and are unsure what order to do things in.",
            question: "Which AI request is the best?",
            options: [
              {
                text: "\"Help me make a call plan: what information to gather, what questions to ask, and what notes to write down.\"",
                tier: "best",
                feedback: "Preparation makes the calls much easier."
              },
              {
                text: "\"Remind me not to share passwords or verification codes during the calls.\"",
                tier: "safe",
                feedback: "A good self-imposed guardrail."
              },
              {
                text: "\"Tell me which bills are fake without checking official accounts.\"",
                tier: "unsafe",
                feedback:
                  "AI cannot see your accounts and cannot know which bills are real."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 8.3 — Use AI to Understand Confusing Information",
            note: "AI can help explain confusing paperwork before you organize it."
          },
          {
            lesson: "Lesson 8.4 — Use AI to Practice Conversations",
            note: "AI can turn a task plan into questions for a real call or appointment."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The overwhelming paperwork pile",
        setup:
          "You have a pile of paperwork on your kitchen table: utility bills, medical papers, insurance letters, store receipts, old appointment reminders, bank envelopes, a notice with a deadline, and papers with account numbers. You feel overwhelmed and want AI to help you get started.",
        question: "Which AI prompt is the best?",
        options: [
          {
            text: "\"Help me organize household paperwork into simple categories. Give me small steps for what to sort first, what to save for review, and what questions to ask a trusted person. Do not ask for account numbers, medical numbers, passwords, or private codes.\"",
            tier: "best",
            feedback:
              "You used AI to organize the task safely: a clear goal, safe categories, small steps, a privacy limit, a plan to ask for trusted help, and awareness that deadlines need review."
          },
          {
            text: "\"Make a simple checklist for sorting bills, receipts, medical papers, and official notices.\"",
            tier: "safe",
            feedback: "A solid, privacy-safe request."
          },
          {
            text: "\"Here are my full account numbers and private papers. Tell me what to throw away.\"",
            tier: "unsafe",
            feedback:
              "AI cannot know which of your documents matter legally or financially — and it certainly doesn't need your account numbers to suggest categories."
          }
        ],
        spotted: []
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Use AI to Break Big Tasks Into Steps.",
      habit: "When a task feels too big: goal, situation, steps, time, check.",
      warningSign: "Letting AI decide what to discard.",
      skills: [
        "Turned a big task into small steps",
        "Asked for first, next, and later",
        "Protected private information",
        "Flagged steps needing verification"
      ],
      next: "Use AI to Compare Choices"
    }
  },

  // ============================================================
  // LESSON 8.6
  // ============================================================
  {
    id: "scam-ai-compare-choices",
    track: "scam",
    phase: 15,
    order: 6,
    lessonNumber: "8.6",
    title: "Use AI to Compare Choices",
    pathTitle: "Compare Choices",
    badge: "Decision Maker",
    xp: 20,
    goals: [
      "Use options, criteria, pros, cons, questions.",
      "Keep your own priorities in charge of \"best.\""
    ],
    blocks: [
      {
        type: "reading",
        heading: "Use AI to Compare Choices",
        question: "Can AI help me compare my options?",
        objective:
          "Learn how to use AI to compare options with pros, cons, questions, and risks while keeping the final decision in your hands.",
        warningSigns: ["Options — what are you comparing?", "Criteria — what matters to you?", "Pros — what's good about each?", "Cons — what's risky or unclear?", "Questions — what should you verify?"],
        text: "AI can help compare choices when you feel unsure. It can organize information into pros and cons, list questions to ask, and help you notice what matters. Try: \"Compare these two internet plans in simple language. Focus on monthly cost, speed, contract length, fees, and cancellation rules. Make a table with pros, cons, and questions I should ask before choosing.\" AI is helpful for organizing a comparison, but it may not know current prices, rules, availability, or your full situation. For important choices, verify through official sources."
      },
      {
        type: "tiered",
        title: "Better comparison prompt",
        scenario: "You want AI to help compare two phone plans.",
        question: "Which prompt is the best?",
        options: [
          {
            text: "\"Compare these two phone plans by monthly cost, data, fees, contract length, and customer support. Give pros, cons, and questions to ask.\"",
            tier: "best",
            feedback:
              "The best prompt tells AI what matters and asks for information that helps you decide."
          },
          {
            text: "\"Make a simple table comparing the plans.\"",
            tier: "safe",
            feedback: "A table helps — naming your criteria helps more."
          },
          {
            text: "\"Which plan should I buy? Just choose for me.\"",
            tier: "unsafe",
            feedback:
              "AI doesn't know your budget, your usage, or your coverage area."
          }
        ]
      },
      {
        type: "tiered",
        title: "AI needs current details checked",
        scenario:
          "AI compares two travel options and says \"The train is cheaper.\" But you haven't checked the current ticket prices.",
        question: "Which response is the best?",
        options: [
          {
            text: "Check the current prices on the official travel websites before deciding.",
            tier: "best",
            feedback:
              "AI may not know current prices, schedules, fees, or availability."
          },
          {
            text: "Use AI's comparison as a starting point.",
            tier: "safe",
            feedback: "The structure is useful; the numbers need checking."
          },
          {
            text: "Buy the train ticket because AI said it is cheaper.",
            tier: "unsafe",
            feedback: "Travel prices change by the day, sometimes by the hour."
          }
        ]
      },
      {
        type: "tiered",
        title: "Pros and cons aren't a decision",
        scenario:
          "AI gives a pros-and-cons list for two medical insurance options. One is cheaper, but the other may include your doctor.",
        question: "What should you do?",
        options: [
          {
            text: "Verify the doctor, costs, coverage, and deadlines through official insurance sources before choosing.",
            tier: "best",
            feedback:
              "For health coverage, the details matter. AI can organize the comparison, but official sources must confirm important facts."
          },
          {
            text: "Use AI to make a list of questions for the insurance company.",
            tier: "safe",
            feedback: "\"Is Dr. — in network?\" is the whole question."
          },
          {
            text: "Choose the cheaper option because AI listed more pros.",
            tier: "unsafe",
            feedback:
              "Keeping your doctor may matter far more than the price difference — and AI doesn't know that about you."
          }
        ]
      },
      {
        type: "tiered",
        title: "Personal values matter",
        scenario:
          "You ask AI to compare two grocery delivery services. AI says one is \"best\" because it's fastest. But you care more about lower fees than speed.",
        question: "Which response is the best?",
        options: [
          {
            text: "Tell AI to compare again, focusing on fees instead of speed.",
            tier: "best",
            feedback:
              "AI does not always know your priorities. You can tell it what matters most."
          },
          {
            text: "Remember that \"best\" depends on what matters to you.",
            tier: "safe",
            feedback: "There is no universal best."
          },
          {
            text: "Accept AI's choice because faster is always better.",
            tier: "unsafe",
            feedback: "Not if you're paying for speed you don't need."
          }
        ]
      },
      {
        type: "confidence",
        question:
          "How confident do you feel using AI to compare options without letting it decide for you?",
        practice: [
          {
            scenario:
              "You're comparing two walkers. One is lighter; the other has a seat and storage pouch.",
            question: "Which AI prompt is the best?",
            options: [
              {
                text: "\"Compare these two walkers by weight, stability, seat, storage, ease of folding, and questions to ask before buying.\"",
                tier: "best",
                feedback:
                  "AI can help compare features, but comfort and safety should be checked in real life."
              },
              {
                text: "\"Make a table with pros and cons for each walker.\"",
                tier: "safe",
                feedback: "A clear way to see the tradeoff."
              },
              {
                text: "\"Tell me which walker is perfect for me without knowing my needs.\"",
                tier: "unsafe",
                feedback: "It cannot, and mobility equipment is worth trying in person."
              }
            ]
          },
          {
            scenario:
              "You ask AI to compare two subscription services. AI forgets to mention cancellation rules.",
            question: "What should you ask next?",
            options: [
              {
                text: "\"Add cancellation rules, renewal price, and refund policy to the comparison.\"",
                tier: "best",
                feedback:
                  "Cancellation rules and renewal prices can matter as much as the starting price."
              },
              {
                text: "\"List questions I should ask before signing up.\"",
                tier: "safe",
                feedback: "Turns the gap into a plan."
              },
              {
                text: "\"Ignore cancellation rules because the monthly price is all that matters.\"",
                tier: "unsafe",
                feedback:
                  "Phase 14 covered exactly why that's the detail that catches people."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 7.4 — Read the Checkout Details",
            note: "When comparing purchases, include total price, timing, terms, subscriptions, and return rules."
          },
          {
            lesson: "Lesson 8.2 — Check AI Before You Act",
            note: "When a comparison involves money, health, or accounts, verify important details."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The two internet plans",
        setup:
          "Plan A: lower monthly price, installation fee, one-year contract, price increases after 12 months, basic support. Plan B: higher monthly price, no installation fee, no annual contract, price stays the same for 24 months, better support. You want AI to help you compare them.",
        question: "Which AI prompt is the best?",
        options: [
          {
            text: "\"Compare Plan A and Plan B in a simple table. Focus on monthly price, installation fee, contract length, price increases, customer support, and questions I should ask the internet company before choosing. Do not decide for me.\"",
            tier: "best",
            feedback:
              "You used AI as a comparison helper, not a decision maker: both options, clear criteria, a table, pros and cons, questions to verify, and an explicit reminder not to decide for you."
          },
          {
            text: "\"List the pros, cons, and unclear details for each plan.\"",
            tier: "safe",
            feedback: "Asking for unclear details is a smart addition."
          },
          {
            text: "\"Pick the best plan for me and assume the prices are current.\"",
            tier: "unsafe",
            feedback:
              "Both halves are problems: AI doesn't know your priorities, and assuming prices are current is exactly the mistake to avoid."
          }
        ],
        spotted: []
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Use AI to Compare Choices.",
      habit: "When comparing with AI: options, criteria, pros, cons, questions.",
      warningSign: "Letting AI define what \"best\" means for you.",
      skills: [
        "Chose criteria that matter",
        "Asked for pros and cons",
        "Checked current details",
        "Kept the final decision"
      ],
      next: "Build Your Everyday AI Routine"
    }
  },

  // ============================================================
  // LESSON 8.7
  // ============================================================
  {
    id: "scam-ai-everyday-routine",
    track: "scam",
    phase: 15,
    order: 7,
    lessonNumber: "8.7",
    title: "Build Your Everyday AI Routine",
    pathTitle: "Everyday Routine",
    badge: "AI Routine",
    xp: 20,
    goals: [
      "Use purpose, privacy, prompt, review, verify, decide.",
      "Combine every Phase 15 skill into one habit."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Build Your Everyday AI Routine",
        question: "What should I remember every time I use AI?",
        objective:
          "Learn a simple routine for using AI safely and confidently in everyday life.",
        warningSigns: ["Purpose — know what you want help with", "Privacy — remove details AI doesn't need", "Prompt — give a clear instruction", "Review — read the answer before using it", "Verify — check important information", "Decide — you make the final call"],
        text: "AI can explain confusing information, help write messages, make checklists, organize plans, compare options, and help you practice conversations. Safe AI use follows a routine: Purpose, Privacy, Prompt, Review, Verify, Decide. Know why you're using AI. Remove private details it doesn't need. Ask clearly. Read the answer and ask whether it makes sense or missed something. Verify anything involving money, health, safety, legal issues, benefits, accounts, or deadlines. Then make the final decision yourself. AI should not be the final authority for serious choices."
      },
      {
        type: "tiered",
        title: "The everyday AI routine",
        scenario: "You want to use AI to help with a confusing letter.",
        question: "Which routine is the best?",
        options: [
          {
            text: "Purpose, privacy, prompt, review, verify, decide.",
            tier: "best",
            feedback: "Safe AI use means getting help while staying in control."
          },
          {
            text: "Remove private details and check important information before acting.",
            tier: "safe",
            feedback: "The two most important steps of the six."
          },
          {
            text: "Copy everything into AI and do exactly what it says.",
            tier: "unsafe",
            feedback: "That skips both privacy and your own judgment."
          }
        ]
      },
      {
        type: "tiered",
        title: "Privacy first",
        scenario:
          "You want AI to explain a bank notice that includes your name, account number, and part of your card number.",
        question: "What should you do first?",
        options: [
          {
            text: "Remove private account and card information before asking AI for help.",
            tier: "best",
            feedback:
              "AI usually does not need private banking details to explain general wording."
          },
          {
            text: "Share only the confusing paragraph if possible.",
            tier: "safe",
            feedback: "The minimum needed is always the right amount."
          },
          {
            text: "Include all banking details so AI has everything.",
            tier: "unsafe",
            feedback: "\"Everything\" is not what makes an explanation better."
          }
        ]
      },
      {
        type: "tiered",
        title: "Review before using",
        scenario:
          "You ask AI to write a message to your neighbor. AI writes one, but it sounds too formal and includes a detail that isn't true.",
        question: "Which response is the best?",
        options: [
          {
            text: "Edit the message before sending it.",
            tier: "best",
            feedback:
              "AI writing should be reviewed. You are allowed to correct, shorten, or change it."
          },
          {
            text: "Ask AI to make it shorter, warmer, and remove the incorrect detail.",
            tier: "safe",
            feedback: "One follow-up usually fixes both problems."
          },
          {
            text: "Send it immediately because AI wrote it.",
            tier: "unsafe",
            feedback:
              "Your neighbor would receive an untrue statement with your name on it."
          }
        ]
      },
      {
        type: "tiered",
        title: "Verify serious topics",
        scenario:
          "You ask AI about a notice involving health insurance, a deadline, and possible cost changes. AI gives a confident answer.",
        question: "What should you do before making a decision?",
        options: [
          {
            text: "Verify the deadline, cost, and coverage details with the official insurance company or a trusted support person.",
            tier: "best",
            feedback:
              "AI can explain and organize, but important health, money, and deadline information should be verified."
          },
          {
            text: "Use AI to make a list of questions to ask.",
            tier: "safe",
            feedback: "Preparation that leads straight to verification."
          },
          {
            text: "Trust AI completely because it sounded certain.",
            tier: "unsafe",
            feedback:
              "Health coverage plus a deadline plus a cost change is about as high-risk as everyday paperwork gets."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel using the everyday AI routine?",
        practice: [
          {
            scenario:
              "You want AI to compare two internet plans but aren't sure if the prices are current.",
            question: "Which response is the best?",
            options: [
              {
                text: "Ask AI to compare the plans, then verify current prices and fees with the internet company.",
                tier: "best",
                feedback: "AI can compare choices, but current prices and rules should be checked."
              },
              {
                text: "Tell AI which details matter to you, such as cost, contract length, and support.",
                tier: "safe",
                feedback: "Your criteria shape a better comparison."
              },
              {
                text: "Let AI choose the plan without checking current information.",
                tier: "unsafe",
                feedback: "Two mistakes at once."
              }
            ]
          },
          {
            scenario: "You want AI to help you practice calling customer service.",
            question: "Which prompt is the best?",
            options: [
              {
                text: "\"Help me practice this call. Do not ask me for real passwords, card numbers, account numbers, or verification codes.\"",
                tier: "best",
                feedback:
                  "AI can help you rehearse, but the real company must confirm real account answers."
              },
              {
                text: "\"After practice, give me a short checklist for the real call.\"",
                tier: "safe",
                feedback: "The checklist is what you'll actually use."
              },
              {
                text: "\"Pretend to be the company and guarantee my refund.\"",
                tier: "unsafe",
                feedback: "Rehearsing a false promise helps nobody."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 8.1 — Ask AI Clear Questions",
            note: "A strong prompt gives AI the task, context, format, and limits."
          },
          {
            lesson: "Lesson 8.2 — Check AI Before You Act",
            note: "Risk decides review. Serious topics need trusted verification."
          },
          {
            lesson: "Lesson 8.6 — Use AI to Compare Choices",
            note: "AI can organize options, but your priorities and verified facts guide the decision."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The everyday AI helper",
        setup:
          "You receive a confusing email about your phone plan. It includes your full name, phone number, account number, a paragraph about a price change, a paragraph about a new plan option, a deadline, a link to update your plan, and a customer-service phone number. You want AI to help you understand it, compare your options, and prepare for a call.",
        question: "Which AI prompt is the best?",
        options: [
          {
            text: "\"Explain this phone-plan email in simple words. I removed my name, phone number, and account number. Summarize the main point, list any deadline, compare the current plan and new option, and give me questions to ask the phone company. Do not decide for me.\"",
            tier: "best",
            feedback:
              "You used the full routine — Purpose, Privacy, Prompt, Review, Verify, Decide — in a single prompt. You used AI as a helper while staying in control."
          },
          {
            text: "\"Help me understand this email and prepare questions for customer service.\"",
            tier: "safe",
            feedback:
              "A good prompt — just remove the private details first."
          },
          {
            text: "\"Here is my full account number and phone number. Use the link and tell me which plan to choose.\"",
            tier: "unsafe",
            feedback:
              "Three problems: private details AI doesn't need, trusting a link from an unexpected email, and handing over a decision that's yours."
          }
        ],
        spotted: []
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Build Your Everyday AI Routine.",
      habit: "Use AI with this routine: purpose, privacy, prompt, review, verify, decide.",
      warningSign: "AI can help you think clearly, but you remain the decision maker.",
      skills: [
        "Used AI safely in everyday life",
        "Protected personal information",
        "Reviewed AI's answer",
        "Verified important details",
        "Made AI useful without giving it control"
      ],
      next: "Phase 15 Big Review"
    }
  },

  // ============================================================
  // LESSON 8.8 — BIG REVIEW
  // ============================================================
  {
    id: "scam-ai-big-review",
    track: "scam",
    phase: 15,
    order: 8,
    lessonNumber: "8.8",
    title: "Phase 15 Big Review",
    pathTitle: "AI Big Review",
    badge: "AI Everyday Expert",
    xp: 20,
    goals: [
      "Recall every Phase 15 routine.",
      "Apply them together across three situations."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Phase 15 Big Review",
        question: "Can I use AI as a helpful everyday tool while staying safe?",
        objective:
          "Review all Phase 15 skills and make sure you can use AI safely, practically, and confidently in daily life.",
        warningSigns: ["8.1 Task. Context. Format. Limits.", "8.2 Risk decides review.", "8.3 Remove. Explain. Summarize. Questions. Verify.", "8.4 Goal. Role. Questions. Practice. Notes.", "8.5 Goal. Situation. Steps. Time. Check.", "8.6 Options. Criteria. Pros. Cons. Questions.", "8.7 Purpose. Privacy. Prompt. Review. Verify. Decide."],
        text: "Phase 15 taught one big idea: AI can help, but you decide. Each lesson added one part of safe everyday AI use — writing better prompts, knowing when to verify, understanding confusing documents, rehearsing conversations, breaking down tasks, comparing options, and finally combining it all into one routine. This review pulls those together. There's no score here and nothing to fail."
      },
      {
        type: "tiered",
        title: "Review — better prompt",
        scenario:
          "You want AI to help write a polite message to a store about a missing order.",
        question: "Which prompt is the best?",
        options: [
          {
            text: "\"Write a short, polite message to a store saying my order has not arrived and asking for the next steps.\"",
            tier: "best",
            feedback: "The best prompt gives AI the task, situation, tone, and goal."
          },
          {
            text: "\"Help me write a message about an order.\"",
            tier: "safe",
            feedback: "Workable, with a follow-up."
          },
          {
            text: "\"Fix it.\"",
            tier: "unsafe",
            feedback: "AI has nothing to work with."
          }
        ]
      },
      {
        type: "tiered",
        title: "Review — private information",
        scenario:
          "You want AI to explain a letter that includes your account number and address.",
        question: "What should you do first?",
        options: [
          {
            text: "Remove private details that AI does not need.",
            tier: "best",
            feedback: "AI can often explain general language without private identifiers."
          },
          {
            text: "Share only the confusing section when possible.",
            tier: "safe",
            feedback: "Even better."
          },
          {
            text: "Include the full account number to make the answer more accurate.",
            tier: "unsafe",
            feedback: "It doesn't make the explanation any more accurate."
          }
        ]
      },
      {
        type: "tiered",
        title: "Review — AI confidence",
        scenario: "AI gives a confident answer about a medical bill deadline.",
        question: "What should you remember?",
        options: [
          {
            text: "AI can sound confident and still need checking.",
            tier: "best",
            feedback: "AI can be useful and still wrong. Important deadlines should be checked."
          },
          {
            text: "Verify the deadline through the official billing office.",
            tier: "safe",
            feedback: "The action that follows from it."
          },
          {
            text: "Confidence means the answer is definitely correct.",
            tier: "unsafe",
            feedback: "Confidence is a writing style, not evidence."
          }
        ]
      },
      {
        type: "tiered",
        title: "Review — final decision",
        scenario: "AI compares two insurance options and recommends one.",
        question: "Who should make the final decision?",
        options: [
          {
            text: "You, after checking important details through official or trusted sources.",
            tier: "best",
            feedback: "AI can help you think, but the final decision belongs to you."
          },
          {
            text: "AI can help organize the comparison.",
            tier: "safe",
            feedback: "Organizing is its strength; deciding is yours."
          },
          {
            text: "AI should decide because it sounds smart.",
            tier: "unsafe",
            feedback:
              "It doesn't know your doctors, your budget, or your circumstances."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel using AI safely for everyday tasks?",
        practice: [
          {
            scenario: "You want AI to help explain a confusing bill.",
            question: "Which prompt is strongest?",
            options: [
              {
                text: "\"Explain this bill paragraph in simple words. I removed my name, address, account number, and payment information. Then give me questions to ask the billing office.\"",
                tier: "best",
                feedback:
                  "A useful task, privacy protection, and preparation for official verification."
              },
              {
                text: "\"Summarize the bill and list anything I should verify.\"",
                tier: "safe",
                feedback: "Good — remove the private details first."
              },
              {
                text: "\"Here is my full account number and card number. Tell me what to do.\"",
                tier: "unsafe",
                feedback: "Neither is needed, and the decision is yours."
              }
            ]
          },
          {
            scenario: "AI gives advice about a legal document.",
            question: "What should you do?",
            options: [
              {
                text: "Use AI to understand the language, then verify with a qualified professional.",
                tier: "best",
                feedback:
                  "Legal documents are high-risk. AI can help explain, but shouldn't be the final authority."
              },
              {
                text: "Ask AI to list questions to ask.",
                tier: "safe",
                feedback: "Excellent preparation for the professional."
              },
              {
                text: "Sign the document because AI said it looks fine.",
                tier: "unsafe",
                feedback: "A signature has consequences AI cannot assess."
              }
            ]
          },
          {
            scenario: "You ask AI to create a grocery list for soup.",
            question: "What level of checking is needed?",
            options: [
              {
                text: "Light checking: review the list, adjust for your needs, use normal food-safety habits.",
                tier: "best",
                feedback: "Not every AI answer needs heavy review. Risk decides review."
              },
              {
                text: "Make sure the ingredients fit your diet, budget, and preferences.",
                tier: "safe",
                feedback: "A sensible glance."
              },
              {
                text: "Call an official office before buying carrots.",
                tier: "unsafe",
                feedback:
                  "Over-checking low-risk tasks makes AI useless. Save the effort for what matters."
              }
            ]
          }
        ]
      },
      {
        type: "finalboss",
        title: "The AI safety challenge",
        setup:
          "A three-part challenge. You receive a confusing email about your utility bill — it includes your full name, home address, account number, a payment deadline, a link to pay, and a paragraph about a possible rate change. You want AI's help understanding it, then practicing the call, then comparing the payment plans offered.",
        messages: [
          {
            from: "Part 1 · Understanding",
            body: "You want AI to help you understand the confusing email."
          },
          {
            from: "Part 2 · Practice",
            body: "You need to call the utility company and feel nervous."
          },
          {
            from: "Part 3 · Comparing",
            body: "The company offers two payment plans and you want to compare them."
          }
        ],
        question:
          "Which approach handles all three parts safely?",
        options: [
          {
            text: "Remove private details and ask AI to explain the email plus list the deadline and questions; ask AI to role-play the call without requesting real account numbers or codes; ask AI to compare both plans by cost, fees, due dates, and cancellation rules — while telling it not to decide for you.",
            tier: "best",
            feedback:
              "You used AI for confusing information, removed private details first, asked clear prompts, prepared real questions, practiced safely, compared with criteria, and kept every decision your own. That is smart AI use."
          },
          {
            text: "Use AI for each step but verify the deadline, the company's real policy, and the current plan prices through official sources before acting.",
            tier: "safe",
            feedback:
              "The verification instinct is exactly right across all three parts."
          },
          {
            text: "Give AI your full account number, use the payment link it suggests, let it guarantee the refund policy, and let it choose the plan.",
            tier: "unsafe",
            feedback:
              "Every one of those is a Phase 15 mistake: oversharing, trusting a link from an unexpected email, treating role-play as real policy, and handing over your decision."
          }
        ],
        spotted: [
          "Unexpected email with a payment link",
          "Private details not needed by AI",
          "A deadline requiring verification",
          "A decision that belongs to you"
        ]
      }
    ],
    quiz: [],
    complete: {
      title: "Phase 15 complete!",
      subtitle: "You completed the Phase 15 Big Review — and all of AI in Everyday Life.",
      habit: "Use AI to help you think, prepare, organize, and practice — then review, verify, and decide for yourself.",
      warningSign: "AI can help, but you decide.",
      skills: [
        "Asked clear questions",
        "Removed private details",
        "Reviewed and verified answers",
        "Practiced conversations",
        "Broke tasks into steps",
        "Compared options",
        "Kept final decisions"
      ],
      learned: [
        "8.1 — Task. Context. Format. Limits.",
        "8.2 — Risk decides review.",
        "8.3 — Remove. Explain. Summarize. Questions. Verify.",
        "8.4 — Goal. Role. Questions. Practice. Notes.",
        "8.5 — Goal. Situation. Steps. Time. Check.",
        "8.6 — Options. Criteria. Pros. Cons. Questions.",
        "8.7 — Purpose. Privacy. Prompt. Review. Verify. Decide."
      ],
      next: "Phase 16: Helping Others Stay Safe"
    }
  }
];

export default scamPhase8Lessons;
