// Everwise - Scam Protection track
// Phase 14: Safe Online Shopping & Money
//
// One clear idea: Before money moves, check the details.
// Each lesson carries its own short checklist so learners have something
// concrete to hold onto rather than a vague instruction to "be careful."

const MONEY_HABITS = [
  "Pause before paying",
  "Check who is asking and what for",
  "Check how they want you to pay",
  "Make sure you'll have a record",
];

export const scamPhase7Lessons = [
  // ============================================================
  // LESSON 7.1
  // ============================================================
  {
    id: "scam-check-before-money-moves",
    track: "scam",
    phase: 14,
    order: 1,
    lessonNumber: "7.1",
    title: "Check Before Money Moves",
    pathTitle: "Before Money Moves",
    badge: "Payment Checker",
    xp: 20,
    goals: [
      "Review the five payment details before paying.",
      "Recognize urgency as a substitute for proof."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Check Before Money Moves",
        question: "What should I check before I pay?",
        objective:
          "Learn to review the key details of a payment request before sending money or entering payment information.",
        warningSigns: MONEY_HABITS,
        text: "Before you send money or enter payment information, check the details. A safe payment request should make sense. You should understand who is asking, what the money is for, how much is being requested, how they want you to pay, and whether you'll have a record. Scammers try to skip these checks by creating urgency. The simple check is: Who? What? How much? How? Record? If any answer feels unclear, unusual, rushed, or secret, verify before paying."
      },
      {
        type: "tiered",
        title: "The five payment details",
        scenario:
          "You receive a message that says, \"Your account is in danger. Pay now.\" It doesn't explain the account, the bill, or the payment method.",
        question: "What is missing?",
        options: [
          {
            text: "Clear payment details: who, what, amount, payment method, and record.",
            tier: "best",
            feedback:
              "A serious payment request should include clear details. Urgency is not a replacement for proof."
          },
          {
            text: "A trusted way to verify the account problem.",
            tier: "safe",
            feedback: "Also missing — and easy to supply yourself."
          },
          {
            text: "Nothing is missing because the message says it is urgent.",
            tier: "unsafe",
            feedback:
              "Urgency is the only thing the message provides, and it isn't evidence."
          }
        ]
      },
      {
        type: "tiered",
        title: "The payment method matters",
        scenario:
          "A caller says you owe a fee: \"Do not use your normal account. Go buy gift cards and read me the numbers.\"",
        question: "What should you notice?",
        options: [
          {
            text: "The payment method is unusual and hard to recover once shared.",
            tier: "best",
            feedback:
              "Gift card numbers can be used quickly, and the money may be difficult to get back."
          },
          {
            text: "Gift cards are not a normal way to pay fees, bills, or fines.",
            tier: "safe",
            feedback: "Correct — no legitimate fee is settled this way."
          },
          {
            text: "Gift cards are safer because they do not use a credit card.",
            tier: "unsafe",
            feedback:
              "The opposite is true. A credit card can be disputed; a spent gift card usually cannot."
          }
        ]
      },
      {
        type: "tiered",
        title: "The small fee",
        scenario:
          "A delivery text says, \"Pay $1.25 to release your package.\" You are expecting a package. The page asks for your card number, expiration date, security code, name, and billing address.",
        question: "What is the real risk?",
        options: [
          {
            text: "The small fee may be used to collect your payment information.",
            tier: "best",
            feedback:
              "The amount may be small, but the card information behind it is valuable."
          },
          {
            text: "You should check the package through the retailer or delivery company's official app.",
            tier: "safe",
            feedback: "The safer route to the same answer."
          },
          {
            text: "The fee is too small to be risky.",
            tier: "unsafe",
            feedback:
              "The $1.25 was never the goal — the full card details were."
          }
        ]
      },
      {
        type: "tiered",
        title: "Payment record",
        scenario:
          "A seller online says, \"Send me money directly. I do not provide receipts, but I promise I will ship the item.\"",
        question: "Which response is the best?",
        options: [
          {
            text: "Do not pay without a trusted checkout process or clear purchase record.",
            tier: "best",
            feedback:
              "Receipts, order numbers, and account statements help you prove what happened if there is a problem."
          },
          {
            text: "Use a platform or payment method that gives you confirmation and order details.",
            tier: "safe",
            feedback: "That's exactly the alternative to offer."
          },
          {
            text: "Pay because a receipt is not important if the seller sounds honest.",
            tier: "unsafe",
            feedback:
              "Sounding honest costs nothing. A record is what protects you if they aren't."
          }
        ]
      },
      {
        type: "confidence",
        question:
          "How confident do you feel checking payment details before sending money?",
        practice: [
          {
            scenario:
              "A message says, \"Pay today or your service will be shut off.\" You already paid your bill last week.",
            question: "Which response is the best?",
            options: [
              {
                text: "Check your account through the company's official app, website, or trusted phone number.",
                tier: "best",
                feedback:
                  "Your own records can help you slow down and verify the claim."
              },
              {
                text: "Compare the message with your own payment records.",
                tier: "safe",
                feedback: "Your records already contradict the message."
              },
              {
                text: "Pay again because losing service would be stressful.",
                tier: "unsafe",
                feedback: "The stress is precisely what's being used."
              }
            ]
          },
          {
            scenario:
              "A charity caller asks for your card number immediately. You care about the cause but weren't expecting the call.",
            question: "Which response is the best?",
            options: [
              {
                text: "Donate later through the charity's official website or trusted phone number if you choose.",
                tier: "best",
                feedback:
                  "You can still be generous while choosing a safer payment route."
              },
              {
                text: "Take time to verify the organization before giving payment information.",
                tier: "safe",
                feedback: "A real charity will welcome your donation tomorrow."
              },
              {
                text: "Give your card number because helping quickly is polite.",
                tier: "unsafe",
                feedback:
                  "Politeness is being used as leverage here."
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
            note: "Payment pressure is a reason to slow down."
          },
          {
            lesson: "Lesson 6.2 — A Link Is an Invitation",
            note: "If a payment message contains a link, use the official app or website instead."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The account payment warning",
        setup:
          "You remember paying your internet bill last week. An email arrives, then a text a few minutes later.",
        messages: [
          {
            from: "Email · \"Your Internet Company\"",
            body:
              "FINAL NOTICE: Your internet account is overdue. Service will be disconnected tonight unless payment is made immediately. Questions? Call 1-888-555-0173.",
            fakeButton: "Pay balance"
          },
          {
            from: "Text · Unknown number",
            body:
              "This is billing support. We see you have not paid yet. Please use the link before 5 PM."
          }
        ],
        question: "What should you do?",
        options: [
          {
            text: "Do not use the link or the phone number in the message. Check your bill through the company's official app or a number from your bill statement, and compare with your own payment records.",
            tier: "best",
            feedback:
              "You checked the payment details before money moved. The message created urgency, used its own link and phone number, involved money — and conflicted with your own records."
          },
          {
            text: "Pause because the request is urgent, unexpected, and payment-related.",
            tier: "safe",
            feedback: "All three together is more than enough reason to stop."
          },
          {
            text: "Pay through the link because the message says your service will be disconnected.",
            tier: "unsafe",
            feedback:
              "You already have a record showing you paid. That record is stronger evidence than any message threatening you."
          }
        ],
        spotted: [
          "Urgent payment deadline",
          "Link inside the message",
          "Unverified phone number",
          "Follow-up pressure",
          "Conflict with your own records"
        ]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Check Before Money Moves.",
      habit: "Before money moves, check: Who? What? How much? How? Record?",
      warningSign: "Urgency used in place of proof.",
      skills: [
        "Reviewed payment details",
        "Checked payment method risk",
        "Used your own records",
        "Verified through official sources"
      ],
      next: "Choose a Safer Payment Method"
    }
  },

  // ============================================================
  // LESSON 7.2
  // ============================================================
  {
    id: "scam-safer-payment-method",
    track: "scam",
    phase: 14,
    order: 2,
    lessonNumber: "7.2",
    title: "Choose a Safer Payment Method",
    pathTitle: "Payment Methods",
    badge: "Payment Chooser",
    xp: 20,
    goals: [
      "Judge a payment method by control, proof, and help.",
      "Recognize hard-to-reverse payments as a warning sign."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Choose a Safer Payment Method",
        question: "Why does the payment method matter?",
        objective:
          "Learn that different payment methods carry different levels of risk, control, and record-keeping.",
        warningSigns: ["Control — you choose where and how you pay", "Proof — you get a receipt or confirmation", "Help — there's someone to contact if it goes wrong"],
        text: "A payment method is the way money moves — credit cards, debit cards, bank transfers, payment apps, gift cards, wire transfers, cryptocurrency, checks, and online checkout. These are not all the same. A safer method usually gives you three things: control, proof, and help. Riskier requests remove those protections. Gift cards, wire transfers, cryptocurrency, and direct payment-app transfers may be fast, but they can be very difficult to reverse. If someone pressures you to use only one unusual payment method, pause and verify before paying."
      },
      {
        type: "tiered",
        title: "Control, proof, and help",
        scenario: "You are deciding whether a payment method is safe enough to use.",
        question: "What three things should you look for?",
        options: [
          {
            text: "Control, proof, and help.",
            tier: "best",
            feedback:
              "A safer payment method gives you more control, better records, and a trusted place to go for help."
          },
          {
            text: "A receipt, confirmation number, or trusted support path.",
            tier: "safe",
            feedback: "That's the \"proof\" and \"help\" half of it."
          },
          {
            text: "Speed, pressure, and secrecy.",
            tier: "unsafe",
            feedback:
              "Those are the three things a scammer wants, not you."
          }
        ]
      },
      {
        type: "tiered",
        title: "Credit card checkout",
        scenario:
          "You buy from a store's official website. The checkout page shows the final price, tax, shipping, and return information, then sends an order confirmation.",
        question: "What makes this payment method stronger?",
        options: [
          {
            text: "It gives clear details and a purchase record.",
            tier: "best",
            feedback:
              "A safe-looking design isn't enough. The stronger signs are clear details, official checkout, and a record."
          },
          {
            text: "You can save the receipt and contact the store or card company if there's a problem.",
            tier: "safe",
            feedback: "That's the \"help\" part working for you."
          },
          {
            text: "It is safe only because the website looks nice.",
            tier: "unsafe",
            feedback: "Appearance is the weakest signal of all."
          }
        ]
      },
      {
        type: "tiered",
        title: "Debit card caution",
        scenario:
          "You are unsure about an online store you have never used before, and you're deciding whether to enter your debit card number.",
        question: "What should you remember?",
        options: [
          {
            text: "A debit card connects more directly to money in your bank account, so extra caution is wise.",
            tier: "best",
            feedback:
              "Debit cards can be useful, but they deserve caution online because they're connected to bank funds."
          },
          {
            text: "It may be safer to use a more protected checkout method, or avoid the purchase if the store feels suspicious.",
            tier: "safe",
            feedback: "A reasonable way to handle the doubt."
          },
          {
            text: "Debit cards are always safer online because they use your own money.",
            tier: "unsafe",
            feedback:
              "Using your own money directly is the risk, not the protection."
          }
        ]
      },
      {
        type: "tiered",
        title: "Hard-to-reverse payments",
        scenario:
          "A seller says, \"I only accept wire transfer, cryptocurrency, or gift cards. No regular checkout.\"",
        question: "Which response is the best?",
        options: [
          {
            text: "Do not pay this way unless you can fully verify the seller and the payment reason.",
            tier: "best",
            feedback:
              "Some payment methods are difficult to reverse. That makes them risky with strangers or unexpected requests."
          },
          {
            text: "Treat the limited payment method as a warning sign.",
            tier: "safe",
            feedback: "The restriction itself is the signal."
          },
          {
            text: "Pay because unusual payment methods are always more private and secure.",
            tier: "unsafe",
            feedback:
              "Private for them, not protective for you. That's the appeal from their side."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel choosing safer payment methods?",
        practice: [
          {
            scenario:
              "A caller says, \"To fix your account, buy gift cards and read the numbers to me.\"",
            question: "Which response is the best?",
            options: [
              {
                text: "Do not buy the cards or share the numbers. Verify through the official company.",
                tier: "best",
                feedback:
                  "Gift card numbers can be spent quickly. They are not a normal way to fix accounts or pay bills."
              },
              {
                text: "Remember that gift card codes work like money once shared.",
                tier: "safe",
                feedback: "Reading the numbers aloud is the same as handing over cash."
              },
              {
                text: "Read the numbers because gift cards do not reveal your bank account.",
                tier: "unsafe",
                feedback:
                  "Your bank account is safe, but your money is gone all the same."
              }
            ]
          },
          {
            scenario:
              "An online seller offers a discount if you leave the marketplace and pay through a payment app.",
            question: "Which response is the best?",
            options: [
              {
                text: "Stay inside the marketplace checkout or do not buy.",
                tier: "best",
                feedback:
                  "A discount is not helpful if it removes your proof and support options."
              },
              {
                text: "Leaving the platform may remove purchase records and support options.",
                tier: "safe",
                feedback: "That's exactly what the discount is buying — from them."
              },
              {
                text: "Pay outside the marketplace because the discount saves money.",
                tier: "unsafe",
                feedback:
                  "You'd save a little and lose every protection you had."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 7.1 — Check Before Money Moves",
            note: "Before choosing a payment method, check the details of the request."
          },
          {
            lesson: "Lesson 5.1 — Your Information Is Valuable",
            note: "Payment information is personal information and should be protected carefully."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The online marketplace deal",
        setup:
          "You find a used tablet on an online marketplace. The price is much lower than other listings, and the seller has friendly photos, a normal-looking profile, and several positive comments.",
        messages: [
          {
            from: "Marketplace message · Seller",
            body: "I can hold it for you if you pay right now."
          },
          {
            from: "Marketplace message · Seller",
            body:
              "No, don't use marketplace checkout — it charges too many fees. Send the money directly through a payment app and mark it as a personal payment so there are no delays."
          },
          {
            from: "Marketplace message · Seller",
            body: "Do not message me here again. Text my personal number."
          }
        ],
        question: "What should you do?",
        options: [
          {
            text: "Do not send direct payment outside the marketplace. Stay inside trusted checkout or walk away from the purchase.",
            tier: "best",
            feedback:
              "You compared the payment method, not just the product. You protected your money by choosing control, proof, and help."
          },
          {
            text: "Notice that leaving the platform may remove proof, support, and buyer protections.",
            tier: "safe",
            feedback:
              "That's precisely why they want you off the platform."
          },
          {
            text: "Send the payment because the seller has friendly photos and positive comments.",
            tier: "unsafe",
            feedback:
              "Profiles and comments can be bought or faked. Marking a payment as \"personal\" specifically removes buyer protection — that request alone gives it away."
          }
        ],
        spotted: [
          "Unusually low price",
          "Pressure to pay quickly",
          "Refusal to use trusted checkout",
          "Request to mark payment as personal",
          "Request to leave the marketplace"
        ]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Choose a Safer Payment Method.",
      habit: "Choose payment methods that give you control, proof, and help.",
      warningSign: "Someone insisting on one unusual payment method.",
      skills: [
        "Compared payment methods",
        "Recognized hard-to-reverse payments",
        "Stayed inside trusted checkout"
      ],
      next: "Check the Store Before You Buy"
    }
  },

  // ============================================================
  // LESSON 7.3
  // ============================================================
  {
    id: "scam-check-the-store",
    track: "scam",
    phase: 14,
    order: 3,
    lessonNumber: "7.3",
    title: "Check the Store Before You Buy",
    pathTitle: "Check the Store",
    badge: "Store Inspector",
    xp: 20,
    goals: [
      "Check store, seller, site, support, and summary before buying.",
      "Know the limits of a lock symbol and a professional design."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Check the Store Before You Buy",
        question: "How do I know if an online store is safe enough to buy from?",
        objective:
          "Learn how to check an online store, seller, or shopping page before entering payment information.",
        warningSigns: ["Store — do you recognize it?", "Seller — who is actually selling?", "Site — does the address look right?", "Support — is there contact and return information?", "Summary — does checkout show the full total?"],
        text: "Online stores can look polished even when they are not trustworthy. Before buying, check more than the pictures and price. Look at the store name, website address, contact information, return policy, shipping information, and checkout process. A real store should make it clear who is selling the item, how much you will pay, when it should arrive, and what happens if there is a problem. A lock symbol or nice-looking website can be helpful, but it does not prove the store is honest — it's only one small piece of the picture."
      },
      {
        type: "tiered",
        title: "The pretty website",
        scenario:
          "You find a store you've never heard of. The website looks professional with beautiful product photos, and the prices are very low.",
        question: "What should you do before buying?",
        options: [
          {
            text: "Check the store, seller, website address, support information, and checkout summary.",
            tier: "best",
            feedback:
              "A polished website can still be unsafe. A trustworthy store provides clear details, not just attractive pictures."
          },
          {
            text: "Search for signs that the store is real before entering payment information.",
            tier: "safe",
            feedback: "A few minutes of searching often settles it."
          },
          {
            text: "Trust the store because the website looks expensive.",
            tier: "unsafe",
            feedback:
              "Professional website templates cost very little. Design proves nothing."
          }
        ]
      },
      {
        type: "tiered",
        title: "The website address",
        scenario:
          "You want to buy from a store called Bright Home Market. You receive a link to brighthome-market-discount-shop.example. The page uses the store logo, but the address looks different from what you expected.",
        question: "Which response is the best?",
        options: [
          {
            text: "Do not enter payment information until you verify the official website address.",
            tier: "best",
            feedback:
              "A logo can be copied. The website address is an important detail to check before paying."
          },
          {
            text: "Search for the store yourself or use a trusted bookmark if you have one.",
            tier: "safe",
            feedback: "Choosing your own route to the store is always safer."
          },
          {
            text: "Buy from the page because it displays the correct logo.",
            tier: "unsafe",
            feedback:
              "The logo is an image anyone can save and re-upload."
          }
        ]
      },
      {
        type: "tiered",
        title: "Seller information",
        scenario:
          "You're shopping on a large marketplace. The item page shows the product, but the seller name is unfamiliar, with few reviews and no clear return information.",
        question: "What should you notice?",
        options: [
          {
            text: "The seller information and return details are unclear.",
            tier: "best",
            feedback:
              "A trusted marketplace can contain many different sellers. It's still wise to check who is selling the item."
          },
          {
            text: "Buying from a marketplace still requires checking the seller.",
            tier: "safe",
            feedback: "The marketplace vouches for itself, not for every seller."
          },
          {
            text: "Everything on a large marketplace is equally safe.",
            tier: "unsafe",
            feedback:
              "Marketplaces host thousands of independent sellers of varying quality."
          }
        ]
      },
      {
        type: "tiered",
        title: "The lock symbol",
        scenario:
          "A shopping website has a lock symbol near the address. It asks for your card number, but has no return policy, no phone number, and no clear company information.",
        question: "What should you remember?",
        options: [
          {
            text: "A lock symbol does not prove the store is trustworthy.",
            tier: "best",
            feedback:
              "The lock can show that the connection is protected, but it does not prove the seller is honest."
          },
          {
            text: "You should still check the store's identity, support information, and checkout details.",
            tier: "safe",
            feedback: "Those missing details matter far more than the lock."
          },
          {
            text: "The lock symbol means it is always safe to buy.",
            tier: "unsafe",
            feedback:
              "A scam site can have a lock too. It protects the connection, not you."
          }
        ]
      },
      {
        type: "confidence",
        question:
          "How confident do you feel checking an online store before entering payment information?",
        practice: [
          {
            scenario:
              "A store offers a popular item for 80% less than every other website. It says \"Today only. No returns.\"",
            question: "Which response is the best?",
            options: [
              {
                text: "Pause and check whether the store, seller, and return policy are trustworthy.",
                tier: "best",
                feedback:
                  "A large discount can be real sometimes, but it should make you check more carefully."
              },
              {
                text: "Treat the huge discount and no-return rule as warning signs.",
                tier: "safe",
                feedback: "Together they're a strong signal."
              },
              {
                text: "Buy immediately because the discount is too good to miss.",
                tier: "unsafe",
                feedback: "\"Too good to miss\" is doing exactly what it's designed to do."
              }
            ]
          },
          {
            scenario:
              "At checkout, the store shows the item price, shipping cost, taxes, delivery estimate, return policy, and sends an order confirmation.",
            question: "What is good about this?",
            options: [
              {
                text: "The store is giving a clearer record of the purchase details.",
                tier: "best",
                feedback:
                  "Clear checkout details help you understand what you're paying for and what record you'll have."
              },
              {
                text: "You can save the confirmation if you decide to buy.",
                tier: "safe",
                feedback: "That record is your protection later."
              },
              {
                text: "Checkout details do not matter as long as the item looks nice.",
                tier: "unsafe",
                feedback: "The details are what you'd rely on if anything went wrong."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 7.1 — Check Before Money Moves",
            note: "Before paying, check who is asking, what for, how much, how you pay, and what record you'll have."
          },
          {
            lesson: "Lesson 6.2 — A Link Is an Invitation",
            note: "When shopping, it's safer to visit the store directly instead of trusting a surprise link."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The discount store",
        setup:
          "You see an advertisement for a new website selling patio furniture. The website name looks similar to a famous furniture brand, but not exactly the same.",
        messages: [
          {
            from: "Advertisement",
            body: "Warehouse Closeout — 85% Off Today Only!"
          },
          {
            from: "The website",
            body:
              "Beautiful product photos, a professional logo, a lock symbol near the address, and a countdown clock. No phone number. No physical address. No clear return policy. Checkout asks for your card information immediately.",
            fakeButton: "Checkout — 00:04:12 remaining"
          }
        ],
        question: "What should you do?",
        options: [
          {
            text: "Do not enter payment information yet. Check the store, seller, website address, support information, return policy, and checkout details before deciding whether to buy.",
            tier: "best",
            feedback:
              "You looked beyond the pictures and price. You protected your payment information by checking the store before buying."
          },
          {
            text: "Treat the huge discount, countdown clock, unclear support information, and look-alike address as warning signs.",
            tier: "safe",
            feedback: "Four signals at once is more than enough."
          },
          {
            text: "Buy quickly because the website has a lock symbol and professional photos.",
            tier: "unsafe",
            feedback:
              "The lock and the photos are the two weakest signals available — and the countdown exists precisely so you don't check the strong ones."
          }
        ],
        spotted: [
          "Huge discount",
          "Countdown pressure",
          "Look-alike website address",
          "Missing contact information",
          "Missing return policy",
          "Immediate card request"
        ]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Check the Store Before You Buy.",
      habit: "Before buying online, check the store behind the shopping page.",
      warningSign: "A store that wants payment before it has earned trust.",
      skills: [
        "Checked store and seller details",
        "Looked at website-address clues",
        "Understood the limits of a lock symbol"
      ],
      next: "Read the Checkout Details"
    }
  },

  // ============================================================
  // LESSON 7.4
  // ============================================================
  {
    id: "scam-checkout-details",
    track: "scam",
    phase: 14,
    order: 4,
    lessonNumber: "7.4",
    title: "Read the Checkout Details",
    pathTitle: "Checkout Details",
    badge: "Fine Print Reader",
    xp: 20,
    goals: [
      "Check item, quantity, total, timing, and terms before buying.",
      "Spot subscriptions, trials, and pre-checked add-ons."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Read the Checkout Details",
        question: "What should I check before I press Buy?",
        objective:
          "Learn to review checkout details, subscriptions, shipping, returns, and recurring charges before completing a purchase.",
        warningSigns: ["Item — is this what you meant to buy?", "Quantity — is it the right number?", "Total — does it include shipping, tax, fees?", "Timing — when does it arrive or renew?", "Terms — subscriptions, trials, cancellation, returns"],
        text: "Before you press Buy, review the checkout page carefully. It should show what you're buying, the quantity, the total price, shipping, taxes, delivery timing, payment method, and return information. Some purchases also include subscriptions, free trials, automatic renewals, or extra fees. These details may appear in small print, checkboxes, or order summaries. A careful review helps you avoid surprise charges and gives you a better record if something goes wrong."
      },
      {
        type: "tiered",
        title: "Final price",
        scenario:
          "A product page says \"Only $19.99!\" At checkout the total is: item $19.99, shipping $12.99, handling fee $4.99, tax $2.40.",
        question: "What should you check before buying?",
        options: [
          {
            text: "The final total, not just the first price you saw.",
            tier: "best",
            feedback:
              "The first price can be very different from the final price. Checkout shows what you'll actually pay."
          },
          {
            text: "Whether the shipping and fees still make the purchase worth it.",
            tier: "safe",
            feedback: "$40.37 is a different decision than $19.99."
          },
          {
            text: "Only the product price, because fees do not matter.",
            tier: "unsafe",
            feedback: "The fees doubled the cost here."
          }
        ]
      },
      {
        type: "tiered",
        title: "Quantity mistake",
        scenario:
          "You meant to order one bottle of vitamins. At checkout, the quantity says 3.",
        question: "Which response is the best?",
        options: [
          {
            text: "Change the quantity before buying.",
            tier: "best",
            feedback:
              "A quick quantity check can prevent unwanted charges and extra products."
          },
          {
            text: "Review the order summary carefully.",
            tier: "safe",
            feedback: "That's where you'd catch it."
          },
          {
            text: "Press Buy because the website probably knows what you wanted.",
            tier: "unsafe",
            feedback: "The website has no idea what you wanted."
          }
        ]
      },
      {
        type: "tiered",
        title: "Free trial",
        scenario:
          "A website offers \"Free trial today.\" Small text below says: \"After 7 days, your card will be charged $39.99 per month unless canceled.\"",
        question: "What should you notice?",
        options: [
          {
            text: "The free trial can become a recurring monthly charge.",
            tier: "best",
            feedback:
              "A free trial may still require payment information and may become a paid subscription later."
          },
          {
            text: "You should check the cancellation rules before signing up.",
            tier: "safe",
            feedback: "Including exactly when you'd need to cancel by."
          },
          {
            text: "Free trial means you will never be charged.",
            tier: "unsafe",
            feedback:
              "The small print says otherwise — that's why it's there."
          }
        ]
      },
      {
        type: "tiered",
        title: "Return rules",
        scenario:
          "You want to buy shoes online. The checkout page says \"Final sale. No returns or exchanges.\"",
        question: "Which response is the best?",
        options: [
          {
            text: "Decide whether you're comfortable buying without returns before pressing Buy.",
            tier: "best",
            feedback:
              "Return rules matter before you buy, not after you discover a problem."
          },
          {
            text: "Check size, shipping, and refund rules carefully.",
            tier: "safe",
            feedback: "Especially size, with no returns available."
          },
          {
            text: "Buy first and worry about returns later.",
            tier: "unsafe",
            feedback: "There is no later — the page already told you."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel reviewing checkout details before buying?",
        practice: [
          {
            scenario:
              "At checkout, a box is already checked that says \"Add monthly protection plan for $8.99 per month.\"",
            question: "Which response is the best?",
            options: [
              {
                text: "Uncheck it if you do not want the recurring charge.",
                tier: "best",
                feedback:
                  "Checked boxes can add services, subscriptions, or extra fees. Review them before paying."
              },
              {
                text: "Review checked boxes before buying.",
                tier: "safe",
                feedback: "Pre-checked boxes are designed to be missed."
              },
              {
                text: "Leave it checked because checked boxes are always required.",
                tier: "unsafe",
                feedback: "Optional add-ons are frequently pre-checked."
              }
            ]
          },
          {
            scenario:
              "You receive an order confirmation after buying online, with an order number and total price.",
            question: "What should you do?",
            options: [
              {
                text: "Save the confirmation or receipt.",
                tier: "best",
                feedback:
                  "A receipt or confirmation number can help if you need support, a return, or a refund."
              },
              {
                text: "Keep it until the item arrives and you're satisfied.",
                tier: "safe",
                feedback: "At minimum until then."
              },
              {
                text: "Delete it immediately because the purchase is finished.",
                tier: "unsafe",
                feedback: "It's your only proof of what you agreed to."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 7.2 — Choose a Safer Payment Method",
            note: "A good checkout should provide proof and a path for help."
          },
          {
            lesson: "Lesson 7.3 — Check the Store Before You Buy",
            note: "After checking the store, check the purchase itself before pressing Buy."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The almost-free trial",
        setup:
          "You see an ad for a health app: \"Try it today for $1.\" You're interested, but you were expecting to pay only $1.",
        messages: [
          {
            from: "Checkout page",
            body:
              "Trial today: $1.00 · Subscription after 7 days: $49.99/month · Cancellation: must cancel at least 24 hours before renewal · ☑ Add coaching plan for $14.99/month · Payment method: debit card · No refunds after renewal",
            fakeButton: "Start trial now"
          }
        ],
        question: "What should you do?",
        options: [
          {
            text: "Do not press Start Trial until you review the full terms, uncheck anything you don't want, understand the monthly charges, and decide whether you're comfortable with the cancellation and refund rules.",
            tier: "best",
            feedback:
              "You checked the real checkout details, not just the advertisement. The $1 trial could have become $64.98 per month."
          },
          {
            text: "Notice that the $1 trial can become more expensive through renewal and add-ons.",
            tier: "safe",
            feedback: "That's the whole design of the page."
          },
          {
            text: "Press Start Trial because the ad said it costs only $1.",
            tier: "unsafe",
            feedback:
              "The ad said $1. The checkout page said $49.99/month plus a pre-checked $14.99 add-on, with a cancellation deadline and no refunds. The checkout page is what you'd actually be agreeing to."
          }
        ],
        spotted: [
          "Low trial price",
          "Monthly renewal",
          "Cancellation deadline",
          "Pre-checked paid add-on",
          "Limited refund policy"
        ]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Read the Checkout Details.",
      habit: "Before pressing Buy, check: Item. Quantity. Total. Timing. Terms.",
      warningSign: "A headline price that isn't the real price.",
      skills: [
        "Reviewed the final price",
        "Identified recurring charges",
        "Noticed pre-checked add-ons",
        "Saved purchase records"
      ],
      next: "When a Purchase Goes Wrong"
    }
  },

  // ============================================================
  // LESSON 7.5
  // ============================================================
  {
    id: "scam-purchase-goes-wrong",
    track: "scam",
    phase: 14,
    order: 5,
    lessonNumber: "7.5",
    title: "When a Purchase Goes Wrong",
    pathTitle: "Purchase Problems",
    badge: "Problem Solver",
    xp: 20,
    goals: [
      "Follow record, review, request, escalate, secure.",
      "Recognize fake refund processes."
    ],
    blocks: [
      {
        type: "reading",
        heading: "When a Purchase Goes Wrong",
        question: "What should I do when there's a problem with an online purchase?",
        objective:
          "Learn how to respond when an online order is missing, incorrect, damaged, charged incorrectly, or possibly unauthorized.",
        warningSigns: ["Record — keep receipts and order numbers", "Review — check what actually happened", "Request — contact the seller officially", "Escalate — go to the payment provider", "Secure — protect the account if needed"],
        text: "Sometimes an online purchase doesn't go as planned. An item may arrive late, damaged, wrong, or never arrive at all. You may also notice a charge you don't recognize. Different problems need different responses, but a simple process helps: Record, Review, Request, Escalate, Secure. Keep your order confirmation, receipt, tracking, and messages. Check exactly what happened. Contact the seller through the official order page. If they can't resolve it, contact the marketplace, bank, or card company through official channels. Refund and dispute rules differ by seller and payment method, so acting promptly and keeping records is important."
      },
      {
        type: "tiered",
        title: "The late package",
        scenario:
          "Your package hasn't arrived on the day you expected. Your order confirmation shows an estimated delivery window that ends two days from now.",
        question: "What should you do first?",
        options: [
          {
            text: "Check the official order page and tracking information before taking further action.",
            tier: "best",
            feedback:
              "The package may still be within its delivery window. Reviewing the official order information helps you understand the situation safely."
          },
          {
            text: "Keep the receipt and order number available.",
            tier: "safe",
            feedback: "You'll want those if it really is late."
          },
          {
            text: "Call the phone number in an unrelated delivery text and give them your card information.",
            tier: "unsafe",
            feedback:
              "That text has nothing to do with your order — and now you'd have handed over your card."
          }
        ]
      },
      {
        type: "tiered",
        title: "The wrong item",
        scenario:
          "You ordered a blue sweater in size medium. The package contains a red sweater in size small.",
        question: "Which response is the best?",
        options: [
          {
            text: "Photograph the item and contact the seller through the official order page.",
            tier: "best",
            feedback:
              "The photograph and order record help show what you ordered and what you received."
          },
          {
            text: "Keep the packaging, receipt, and order number until the issue is resolved.",
            tier: "safe",
            feedback: "Sellers often need the packaging for a return."
          },
          {
            text: "Send the item to an address from an unexpected email without checking it.",
            tier: "unsafe",
            feedback:
              "Now you'd have neither the sweater nor a refund."
          }
        ]
      },
      {
        type: "tiered",
        title: "The fake refund helper",
        scenario:
          "After requesting a refund, you receive a call from someone claiming to be the store's refund department: \"To release your refund, read me the verification code we just sent to your phone.\"",
        question: "Which response is the best?",
        options: [
          {
            text: "Do not share the code. End the call and check the refund through the official store account.",
            tier: "best",
            feedback:
              "Expecting a refund does not make an unexpected caller trustworthy. Verification codes are still private."
          },
          {
            text: "Contact the store using the official app, website, or trusted customer-service number.",
            tier: "safe",
            feedback: "They can tell you the real refund status."
          },
          {
            text: "Share the code because you really are waiting for a refund.",
            tier: "unsafe",
            feedback:
              "That's exactly what makes this work — they targeted you because you're expecting contact. A refund never requires a code from you."
          }
        ]
      },
      {
        type: "tiered",
        title: "The unrecognized charge",
        scenario:
          "Your card statement shows a $74.99 charge from a company name you don't recognize.",
        question: "Which response is the best?",
        options: [
          {
            text: "Review your receipts and subscriptions, then contact the card company through its official app or the number on the card if the charge remains unfamiliar.",
            tier: "best",
            feedback:
              "You reviewed the charge without delaying action. If it remains unfamiliar, the card company can explain next steps."
          },
          {
            text: "Ask whether another authorized household member recognizes the purchase, when appropriate.",
            tier: "safe",
            feedback: "Often the simplest explanation."
          },
          {
            text: "Ignore the charge because it may disappear on its own.",
            tier: "unsafe",
            feedback:
              "Charges don't disappear, and many card companies have time limits for disputes."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel responding when an online purchase goes wrong?",
        practice: [
          {
            scenario:
              "A product arrives damaged. The seller asks you to send a photograph through the official order page.",
            question: "Which response is the best?",
            options: [
              {
                text: "Save photographs and communicate through the official order system.",
                tier: "best",
                feedback:
                  "Photographs, packaging, and order records help support your request."
              },
              {
                text: "Keep the item and packaging until the seller explains the return process.",
                tier: "safe",
                feedback: "Don't discard anything until it's resolved."
              },
              {
                text: "Throw everything away before contacting the seller.",
                tier: "unsafe",
                feedback: "You'd lose your evidence and your ability to return it."
              }
            ]
          },
          {
            scenario:
              "A seller says your refund was approved. Then an email asks you to enter your full card number through a new link to receive the money.",
            question: "Which response is the best?",
            options: [
              {
                text: "Do not use the link. Check the refund status through the official store account or payment provider.",
                tier: "best",
                feedback:
                  "A legitimate refund is usually handled through the original transaction. Do not trust unexpected refund links."
              },
              {
                text: "Contact official support if the refund information is unclear.",
                tier: "safe",
                feedback: "They can confirm how the refund will actually arrive."
              },
              {
                text: "Enter the card number because refunds always require new payment details.",
                tier: "unsafe",
                feedback:
                  "Refunds go back to the card that paid. No new details are needed."
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
            note: "Receipts, totals, return rules, and confirmation numbers become important when resolving a problem."
          },
          {
            lesson: "Lesson 5.6 — A Second Lock on Your Account",
            note: "A refund representative should never need your private verification code."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The missing laptop",
        setup:
          "You ordered a laptop through an online marketplace. The official order page says \"Delivered Tuesday at 2:14 PM.\" You were home that afternoon, but no package arrived. You check around your home and ask a neighbor — nobody has seen it.",
        messages: [
          {
            from: "Marketplace message · Seller",
            body:
              "I cannot help through this website. Send me your phone number and email address so I can process the refund privately."
          },
          {
            from: "Email · \"Refund Department\", minutes later",
            body:
              "Click below to receive your refund. We'll need your full debit card number, expiration date, security code, online banking username, and the verification code sent to your phone.",
            fakeButton: "Refund now"
          }
        ],
        question: "What should you do?",
        options: [
          {
            text: "Do not use the refund link or provide the requested information. Save the order and delivery records, report through the marketplace's official support, and contact your payment provider through a trusted channel if needed.",
            tier: "best",
            feedback:
              "You separated the real purchase problem from the suspicious refund request. You kept records, stayed inside official support channels, and escalated safely."
          },
          {
            text: "Keep screenshots and messages showing the delivery status and seller response.",
            tier: "safe",
            feedback: "Essential evidence for the marketplace's support team."
          },
          {
            text: "Enter the information because the seller already agreed to provide a refund.",
            tier: "unsafe",
            feedback:
              "No refund needs your banking username or a verification code. The seller wanting to leave the marketplace was the first sign — the real problem is genuine, but the \"refund\" is a second scam layered on top."
          }
        ],
        spotted: [
          "Seller asked to leave the marketplace",
          "Unexpected refund link",
          "Request for full card information",
          "Request for online banking information",
          "Request for a verification code"
        ]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed When a Purchase Goes Wrong.",
      habit: "When a purchase goes wrong: record, review, request, escalate, secure.",
      warningSign: "A refund that asks you for information.",
      skills: [
        "Saved purchase records",
        "Contacted the seller officially",
        "Recognized a fake refund process",
        "Escalated safely"
      ],
      next: "Donate Safely"
    }
  },

  // ============================================================
  // LESSON 7.6
  // ============================================================
  {
    id: "scam-donate-safely",
    track: "scam",
    phase: 14,
    order: 6,
    lessonNumber: "7.6",
    title: "Donate Safely",
    pathTitle: "Donate Safely",
    badge: "Careful Giver",
    xp: 20,
    goals: [
      "Check cause, collector, channel, choice, and confirmation.",
      "Give generously without being rushed."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Donate Safely",
        question: "How do I know whether a donation request is safe?",
        objective:
          "Learn how to check a charity, fundraiser, or donation request before giving money online or by phone.",
        warningSigns: ["Cause — what is the money for?", "Collector — who is actually collecting it?", "Channel — is this an official route?", "Choice — are you being pressured?", "Confirmation — will you get a receipt?"],
        text: "Donating money can be a wonderful thing. Scammers know this, so they sometimes use real emotions to create fake donation requests. They may mention disasters, sick children, veterans, animals, churches, schools, or families in need. The cause may sound important, but the request still needs to be checked. A safe donation should allow you time to think, verify, choose your own payment method, and keep a record."
      },
      {
        type: "tiered",
        title: "The pressure donation",
        scenario:
          "A caller says, \"This charity helps local families. We need your card number before you hang up.\" You've never heard of the organization.",
        question: "Which response is the best?",
        options: [
          {
            text: "Do not give your card number on the call. Look up the organization and donate through a trusted route if you choose.",
            tier: "best",
            feedback:
              "You can care about the cause without giving payment information during an unexpected call."
          },
          {
            text: "Ask for the charity name, website, and written information before deciding.",
            tier: "safe",
            feedback: "A real charity will happily provide all of it."
          },
          {
            text: "Give your card number because helping families is important.",
            tier: "unsafe",
            feedback:
              "The importance of the cause is exactly the lever being used."
          }
        ]
      },
      {
        type: "tiered",
        title: "The look-alike fundraiser",
        scenario:
          "You see a social media post with a photo of a sick dog: \"Donate now. Every minute matters.\" The page doesn't say who is collecting the money or where the funds will go.",
        question: "What should you notice?",
        options: [
          {
            text: "The fundraiser doesn't clearly identify the collector or how the money will be used.",
            tier: "best",
            feedback:
              "A real need may exist, but you still need to know who is collecting and how it will be used."
          },
          {
            text: "Emotional photos should still be verified before donating.",
            tier: "safe",
            feedback: "Photos are the easiest part to fake."
          },
          {
            text: "The photo proves the fundraiser is legitimate.",
            tier: "unsafe",
            feedback: "A photo proves only that a photo exists."
          }
        ]
      },
      {
        type: "tiered",
        title: "The monthly donation box",
        scenario:
          "You decide to donate $25 to a charity. At checkout, a box is already checked: \"Make this a monthly donation.\"",
        question: "What should you do?",
        options: [
          {
            text: "Uncheck the box if you only want to donate once.",
            tier: "best",
            feedback:
              "Recurring donations are not always bad, but they should be your choice."
          },
          {
            text: "Review the total, frequency, payment method, and receipt before donating.",
            tier: "safe",
            feedback: "All worth a glance before confirming."
          },
          {
            text: "Leave it checked because all charity checkboxes are required.",
            tier: "unsafe",
            feedback: "It's optional — that's why it can be unchecked."
          }
        ]
      },
      {
        type: "tiered",
        title: "The unusual payment method",
        scenario:
          "Someone claiming to represent a charity says, \"We only accept donations through gift cards. Please read the card numbers to me.\"",
        question: "Which response is the best?",
        options: [
          {
            text: "Do not donate this way. Verify the charity and use a trusted payment route if you choose to give.",
            tier: "best",
            feedback:
              "A real charity should not pressure you to donate through gift card numbers."
          },
          {
            text: "Treat the gift card request as a warning sign.",
            tier: "safe",
            feedback: "It settles the question on its own."
          },
          {
            text: "Buy the gift cards because the cause sounds meaningful.",
            tier: "unsafe",
            feedback:
              "No registered charity collects donations as gift card numbers read aloud."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel checking a donation request before giving money?",
        practice: [
          {
            scenario:
              "A message says, \"Donate in the next 10 minutes or this family will lose help.\"",
            question: "Which response is the best?",
            options: [
              {
                text: "Pause and verify the fundraiser before donating.",
                tier: "best",
                feedback:
                  "A real cause should not require you to skip careful thinking."
              },
              {
                text: "Treat the deadline as pressure.",
                tier: "safe",
                feedback: "Ten minutes is an invented number."
              },
              {
                text: "Donate immediately because ten minutes is almost over.",
                tier: "unsafe",
                feedback: "The countdown exists only to prevent checking."
              }
            ]
          },
          {
            scenario:
              "You want to support a well-known organization after a natural disaster.",
            question: "Which response is the best?",
            options: [
              {
                text: "Visit the organization's official website yourself instead of using a random donation link.",
                tier: "best",
                feedback:
                  "Using the official route helps you avoid look-alike pages and suspicious links."
              },
              {
                text: "Review the donation amount, frequency, and receipt before submitting payment.",
                tier: "safe",
                feedback: "Especially the frequency."
              },
              {
                text: "Click the first donation link you see online.",
                tier: "unsafe",
                feedback:
                  "Fake charity pages appear in large numbers after any disaster."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 7.1 — Check Before Money Moves",
            note: "Before donating, check who is collecting, what for, how much, how you're paying, and what record you'll get."
          },
          {
            lesson: "Lesson 6.5 — Don't Keep Suspicious Messages Secret",
            note: "If a donation request feels emotional or urgent, talk to someone you trust before giving."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The storm relief donation",
        setup:
          "A major storm has affected a nearby town. You want to help, but something feels rushed.",
        messages: [
          {
            from: "Text · Unknown number",
            body:
              "URGENT: Families need help tonight. Donate now to Storm Relief Support.",
            fakeButton: "Donate now"
          },
          {
            from: "The donation page",
            body:
              "Photos of damaged homes. $100 suggested donation. ☑ Make this a monthly donation. No address or phone number for the organization. No explanation of who runs the fundraiser. \"Gift cards accepted for fastest help.\""
          }
        ],
        question: "What should you do?",
        options: [
          {
            text: "Do not donate through the text link. Verify the organization, use an official donation channel, review whether the donation is one-time or monthly, and save the receipt if you choose to give.",
            tier: "best",
            feedback:
              "You stayed kind without being rushed. You chose to verify first and donate through a trusted route."
          },
          {
            text: "Treat the urgency, unclear collector, pre-checked monthly donation, and gift card option as warning signs.",
            tier: "safe",
            feedback: "Four signals in a single page."
          },
          {
            text: "Donate immediately because the photos are sad and the families need help.",
            tier: "unsafe",
            feedback:
              "The sadness is real and the need may be too — but this page can't tell you who gets the money, and gift cards for disaster relief is not a thing any real charity does."
          }
        ],
        spotted: [
          "Unexpected donation link",
          "Emotional pressure",
          "Unclear organization",
          "Pre-checked recurring donation",
          "Gift card payment option"
        ]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Donate Safely.",
      habit: "Before donating, check the cause, collector, channel, choice, and confirmation.",
      warningSign: "Kindness still deserves caution.",
      skills: [
        "Identified the collector",
        "Avoided suspicious donation links",
        "Reviewed recurring donation settings",
        "Saved proof of giving"
      ],
      next: "Be Careful with Easy Money Offers"
    }
  },

  // ============================================================
  // LESSON 7.7
  // ============================================================
  {
    id: "scam-easy-money",
    track: "scam",
    phase: 14,
    order: 7,
    lessonNumber: "7.7",
    title: "Be Careful with Easy Money Offers",
    pathTitle: "Easy Money",
    badge: "Money Guardian",
    xp: 20,
    goals: [
      "Check promise, proof, payment, pressure, and privacy.",
      "Recognize upfront fees and money-forwarding requests."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Be Careful with Easy Money Offers",
        question: "How do I know when a money offer is risky?",
        objective:
          "Learn to recognize money offers that promise easy income, guaranteed returns, prizes, refunds, or payments that seem too good to be true.",
        warningSigns: ["Promise — what are they promising?", "Proof — can it be verified?", "Payment — must you pay first?", "Pressure — are you being rushed or sworn to secrecy?", "Privacy — are they asking for bank details or codes?"],
        text: "Not every money risk begins with someone asking you to pay a bill. Sometimes the message promises that money will come to you. It may say you won a prize, qualified for a refund, were selected for a special investment, or can earn money from home with little effort. Be especially cautious when an offer promises guaranteed profit, asks for an upfront fee, asks you to move money for someone else, or requires private financial information before you understand why."
      },
      {
        type: "tiered",
        title: "The prize fee",
        scenario:
          "You receive a message: \"You won $10,000. Pay a $75 processing fee today to claim your prize.\"",
        question: "What should you notice?",
        options: [
          {
            text: "You are being asked to pay money before receiving money.",
            tier: "best",
            feedback:
              "A request to pay first before receiving a prize is a major warning sign."
          },
          {
            text: "The prize should be verified through an official source before doing anything.",
            tier: "safe",
            feedback: "Starting with: did you enter anything?"
          },
          {
            text: "Paying $75 is safe because the prize is much larger.",
            tier: "unsafe",
            feedback:
              "That comparison is exactly what makes the fee feel reasonable. There is no prize."
          }
        ]
      },
      {
        type: "tiered",
        title: "Guaranteed returns",
        scenario:
          "A social media message says, \"Invest $500 today and receive $5,000 next week. Guaranteed.\"",
        question: "Which response is the best?",
        options: [
          {
            text: "Treat guaranteed fast profit as a warning sign and do not send money.",
            tier: "best",
            feedback:
              "Real investments involve risk. A promise of guaranteed fast profit should make you pause."
          },
          {
            text: "Talk to a trusted person or financial professional before considering any investment.",
            tier: "safe",
            feedback: "A second opinion costs nothing."
          },
          {
            text: "Send the money because the return is guaranteed.",
            tier: "unsafe",
            feedback:
              "Nobody can guarantee a tenfold return in a week. The word \"guaranteed\" is the tell."
          }
        ]
      },
      {
        type: "tiered",
        title: "The fake refund",
        scenario:
          "An email says, \"You are owed a refund. Enter your debit card number, online banking username, and verification code to receive it.\"",
        question: "Which response is the best?",
        options: [
          {
            text: "Do not enter the information. Check the refund through the official company or payment provider.",
            tier: "best",
            feedback:
              "A refund should not require your online banking username or private verification code."
          },
          {
            text: "Treat the request for banking login information and a verification code as unsafe.",
            tier: "safe",
            feedback: "Either one alone would be enough to stop."
          },
          {
            text: "Enter the information because refunds require full account access.",
            tier: "unsafe",
            feedback:
              "Refunds never require account access. That request is the entire purpose of the email."
          }
        ]
      },
      {
        type: "tiered",
        title: "Moving money for someone else",
        scenario:
          "A stranger offers you a job: \"We will send money to your account. Keep part of it and send the rest to another person.\"",
        question: "What should you do?",
        options: [
          {
            text: "Do not move money for someone you do not know. Verify the job through trusted sources.",
            tier: "best",
            feedback:
              "Being asked to receive and forward money for someone else is a serious warning sign — and can carry legal consequences for you."
          },
          {
            text: "Be cautious because you are being asked to receive and forward money.",
            tier: "safe",
            feedback: "That structure is the whole warning."
          },
          {
            text: "Accept because keeping part of the money sounds easy.",
            tier: "unsafe",
            feedback:
              "The money sent to you is usually stolen. Forwarding it can make you responsible for it."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel spotting risky easy-money offers?",
        practice: [
          {
            scenario:
              "A message says, \"Secret opportunity. Do not tell anyone. You can double your money by tonight.\"",
            question: "Which response is the best?",
            options: [
              {
                text: "Do not send money. Talk to someone you trust before acting.",
                tier: "best",
                feedback: "Secrecy and fast-profit promises are a risky combination."
              },
              {
                text: "Treat secrecy and guaranteed profit as warning signs.",
                tier: "safe",
                feedback: "Both appear in one sentence here."
              },
              {
                text: "Keep it secret because special opportunities are private.",
                tier: "unsafe",
                feedback:
                  "Real opportunities survive being discussed with your family."
              }
            ]
          },
          {
            scenario:
              "A work-from-home offer asks you to buy equipment from one specific website before you can start. You haven't had an interview or signed paperwork.",
            question: "Which response is the best?",
            options: [
              {
                text: "Verify the company and job through official sources before buying anything.",
                tier: "best",
                feedback:
                  "A real job should be clear about who is hiring, what work is required, and why any cost is necessary."
              },
              {
                text: "Be cautious about upfront costs before the job is confirmed.",
                tier: "safe",
                feedback: "Real employers don't charge you to start."
              },
              {
                text: "Buy the equipment immediately so you can start earning money.",
                tier: "unsafe",
                feedback: "The equipment purchase is the scam."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 7.1 — Check Before Money Moves",
            note: "Money coming in can still involve money moving out or private information being exposed."
          },
          {
            lesson: "Lesson 5.6 — A Second Lock on Your Account",
            note: "Verification codes protect your accounts. They shouldn't be shared to receive a prize, refund, or payment."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The work-from-home payment",
        setup:
          "The job sounds helpful, and you could use the extra money. The company name sounds professional.",
        messages: [
          {
            from: "Email · \"Remote Staffing Solutions\"",
            body:
              "You have been selected. No interview needed. Earn $900 per week working from home."
          },
          {
            from: "Email · Follow-up",
            body:
              "We will send you a check for office equipment. Deposit it, keep $200 for your first payment, and send the rest to our approved equipment vendor. Do this today so we can activate your employee account. Please reply with your full name, address, bank name, a copy of your ID, and confirmation when the money appears."
          }
        ],
        question: "What should you do?",
        options: [
          {
            text: "Do not deposit or move money for the sender. Do not send private documents. Verify the company and job through official sources, and talk to someone you trust before continuing.",
            tier: "best",
            feedback:
              "You recognized that this was not just a job offer — it was a money-movement request. You protected both your money and your personal information."
          },
          {
            text: "Treat the no-interview job, fast pay, money forwarding, personal information request, and urgency as warning signs.",
            tier: "safe",
            feedback: "Five signals in two emails."
          },
          {
            text: "Deposit the check and send the rest because the company promised you can keep $200.",
            tier: "unsafe",
            feedback:
              "The check will bounce after you've already forwarded real money — leaving you owing the bank the full amount. The $200 you \"keep\" is the bait."
          }
        ],
        spotted: [
          "No interview",
          "Easy weekly income",
          "Payment before real work begins",
          "Request to send money elsewhere",
          "Request for private documents",
          "Urgency"
        ]
      }
    ],
    quiz: [],
    complete: {
      title: "Phase 14 complete!",
      subtitle: "You completed Be Careful with Easy Money Offers — and all of Phase 14.",
      habit: "Before trusting an easy-money offer, check: Promise. Proof. Payment. Pressure. Privacy.",
      warningSign: "Money coming in can still put your money at risk.",
      skills: [
        "Recognized upfront fees",
        "Questioned guaranteed profit",
        "Avoided money-forwarding requests",
        "Protected banking information"
      ],
      learned: [
        "Before money moves: Who? What? How much? How? Record?",
        "Safer payment methods give you control, proof, and help.",
        "Check the store before you buy, and the checkout before you press Buy.",
        "When a purchase goes wrong: record, review, request, escalate, secure.",
        "Kindness still deserves caution.",
        "Money coming in deserves the same caution as money going out."
      ],
      next: "Phase 15: AI in Everyday Life"
    }
  }
];

export default scamPhase7Lessons;
