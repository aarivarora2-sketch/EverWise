// Everwise - Digital Literacy Track
// Phase 4: Digital Finance
// Biome: Harvest | Color: #C08B3E
//
// All lessons exactly as written by the team.
// Exports: phase4Lessons (array), phase4Challenge (object), phase4Exam (object)

export const phase4Lessons = [
  // ============================================================
  // LESSON 4.1
  // ============================================================
  {
    id: "online-banking",
    track: "literacy",
    phase: 4,
    order: 27,
    lessonNumber: "4.1",
    title: "Online Banking",
    badge: "Online Banking Beginner",
    xp: 20,
    goals: [
      "Explain what online banking is.",
      "Safely log in to a bank account.",
      "Understand common online banking features.",
      "Recognize online banking scams.",
      "Know what to do if something seems suspicious."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Is Online Banking?",
        text: "Online banking allows you to manage your bank account using a phone, tablet, or computer instead of visiting a bank branch.",
        bullets: [
          "Check your account balance",
          "Transfer money between your own accounts",
          "Pay bills",
          "View recent transactions",
          "Lock or unlock a debit card (at many banks)",
          "Download bank statements",
          "Deposit checks using your phone (at many banks)"
        ],
        footer: "Online banking is available 24 hours a day, making it convenient to manage your money."
      },
      {
        type: "learn",
        heading: "Logging In Safely",
        text: "Always access your bank through the bank's official mobile app, or the bank's official website that you type into your browser yourself or access from a saved bookmark.\n\nBefore logging in: make sure the website address is correct, look for the padlock icon in your browser, and avoid logging in from links in unexpected emails or text messages."
      },
      {
        type: "learn",
        heading: "Common Banking Scams",
        text: "Scammers often pretend to be your bank. Examples:",
        bullets: [
          "\"Your account has been locked. Click here.\"",
          "\"Verify your password immediately.\"",
          "\"This is your bank. Please tell us your security code.\""
        ],
        footer: "Legitimate banks generally will not ask you for your password or one-time verification code through an unexpected phone call, email, or text message. If you're unsure, call the phone number on the back of your debit card or use the official banking app."
      },
      {
        type: "learn",
        heading: "What Can You Do in Online Banking?",
        text: "Here are some common features:",
        bullets: [
          "View your balance",
          "Review purchases",
          "Pay bills",
          "Download statements",
          "Set up account alerts"
        ],
        footer: "Alerts can notify you when a purchase is made, a deposit arrives, or your balance drops below a certain amount. These alerts can help you notice suspicious activity quickly."
      },
      {
        type: "multiselect",
        title: "Which Are Safe Ways to Access Your Bank?",
        prompt: "Tap every safe choice.",
        options: [
          { text: "Open your bank's official app.", correct: true },
          { text: "Type your bank's website into your browser yourself.", correct: true },
          { text: "Use a saved bookmark you created.", correct: true },
          { text: "Click a banking link from an unexpected text message.", correct: false },
          { text: "Log in through an email asking you to verify your account.", correct: false },
          { text: "Give your password to someone claiming to work at the bank.", correct: false }
        ],
        feedback: "Excellent! The safest way to access your bank is by using the official app, typing the website yourself, or using a trusted bookmark."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Online Banking", back: "Managing your bank account using the internet." },
          { front: "Bank App", back: "The official mobile application from your bank." },
          { front: "Transaction", back: "Money moving into or out of your account." },
          { front: "Account Alert", back: "A notification about activity in your account." },
          { front: "Official Website", back: "The real website belonging to your bank." }
        ]
      },
      {
        type: "match",
        title: "Match the Banking Feature",
        pairs: [
          { word: "Check Balance", match: "Shows how much money is in your account" },
          { word: "Transaction History", match: "Lists recent deposits and purchases" },
          { word: "Pay Bills", match: "Sends payments electronically" },
          { word: "Account Alerts", match: "Notifies you of account activity" },
          { word: "Mobile Check Deposit", match: "Lets you deposit a check using your phone" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Official App", "Transactions", "Alerts", "Balance"],
        questions: [
          { text: "The safest way to check your bank account is through your bank's ______.", answer: "Official App" },
          { text: "Your account ______ show money coming into and leaving your account.", answer: "Transactions" },
          { text: "Bank ______ can notify you when purchases or withdrawals happen.", answer: "Alerts" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret receives this text: \"Your bank account is locked. Click here immediately to restore access.\" What should she do?",
        options: [
          "Click the link.",
          "Reply with her password.",
          "Open her bank's official app or call the phone number on the back of her debit card to check her account.",
          "Forward the text to everyone she knows."
        ],
        correctIndex: 2,
        explanation: "Banks generally do not ask customers to verify passwords through unexpected text messages."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert wants to see if his Social Security payment was deposited. What should he do?",
        options: [
          "Wait for someone to text him.",
          "Click a link from an email.",
          "Log in using his bank's official app or website to check his recent transactions.",
          "Share his password with a family member."
        ],
        correctIndex: 2,
        explanation: "Online banking lets you safely check deposits whenever you need."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda notices a $27 purchase she doesn't recognize. What should she do?",
        options: [
          "Ignore it.",
          "Post about it on social media.",
          "Contact her bank using the official phone number or secure messaging in the bank's app as soon as possible.",
          "Reply to a random email asking about the charge."
        ],
        correctIndex: 2,
        explanation: "Reporting unfamiliar transactions quickly can help your bank investigate them."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Before logging into your bank, ask yourself: Am I using the official app or website? Did I type the website myself or use a trusted bookmark? Am I avoiding links from unexpected emails or texts? Am I keeping my password private? If all four answers are yes, you're making safer choices."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          {
            label: "Safer Choices",
            items: [
              "Use the official banking app",
              "Review your transactions regularly",
              "Turn on account alerts",
              "Contact your bank using trusted phone numbers"
            ]
          },
          {
            label: "Less Safe Choices",
            items: [
              "Click banking links from unexpected messages",
              "Share your password or verification codes",
              "Ignore unfamiliar charges",
              "Log in using websites you're not sure are real"
            ]
          }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You notice a purchase for $8.99 that you don't recognize.",
        options: [
          "Ignore it because it's a small amount.",
          "Wait a few months.",
          "Contact your bank using the official phone number or secure messaging in the app.",
          "Post about it online."
        ],
        correctIndex: 2,
        explanation: "Scammers sometimes start with small purchases to see if anyone notices. Report unfamiliar charges, even if they're small."
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "A caller says they're from your bank and asks for your one-time verification code.",
        options: [
          "Read them the code.",
          "Tell them your password too.",
          "Do not share the code. Hang up and call your bank using the number on the back of your card if you're concerned.",
          "Text the code instead."
        ],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You want to check your checking account while waiting at a coffee shop. What's the safest option?",
        options: [
          "Click the first banking link you find in a search result.",
          "Borrow a stranger's phone.",
          "Use your own device and your bank's official app. If you're using public Wi-Fi, avoid banking unless you're on a trusted connection like cellular data.",
          "Ask someone nearby to log in for you."
        ],
        correctIndex: 2
      },
      {
        type: "learn",
        heading: "Remember",
        text: "Online banking is a safe and convenient way to manage your money when you use it carefully. Use your bank's official app, review your account regularly, turn on account alerts, and report unfamiliar transactions quickly. Never share your password, share one-time verification codes, click unexpected banking links, or ignore unfamiliar charges."
      }
    ],
    quiz: [
      { question: "What is online banking?", options: ["Shopping online.", "Sending text messages.", "Managing your bank account over the internet.", "Using social media."], correctIndex: 2 },
      { question: "Which are safe ways to access your bank?", options: ["Clicking unexpected banking links in texts", "Using the official app, typing the website yourself, or using a trusted bookmark"], correctIndex: 1 },
      { question: "True or False: A bank may call unexpectedly and ask you to read them your password or one-time verification code.", options: ["True", "False"], correctIndex: 1 },
      { question: "Bank ______ can notify you when money enters or leaves your account.", options: ["Alerts", "Games", "Photos"], correctIndex: 0 },
      { question: "You notice a purchase you don't recognize. What should you do?", options: ["Ignore it.", "Wait until next year.", "Contact your bank using its official phone number or app as soon as possible.", "Reply to the suspicious email about it."], correctIndex: 2 },
      { question: "Which information should you never share with someone who unexpectedly contacts you claiming to be your bank?", options: ["Your favorite color", "Your password, one-time verification codes, debit card PIN, and security question answers"], correctIndex: 1 },
      { question: "Why are account alerts helpful?", options: ["They make your phone louder.", "They increase your bank balance.", "They notify you about account activity, helping you spot suspicious transactions quickly.", "They automatically stop all scams."], correctIndex: 2 },
      { question: "If you're unsure whether a message from your bank is real, what's the safest next step?", options: ["Click the link to find out.", "Reply to the message.", "Open your bank's official app or call the phone number on the back of your debit or credit card.", "Share your password to confirm your identity."], correctIndex: 2 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 1: Online Banking!",
      learned: [
        "Use online banking safely.",
        "Log in through trusted methods.",
        "Review account activity.",
        "Recognize banking scams.",
        "Respond to unfamiliar transactions."
      ],
      next: "Credit Cards"
    }
  },

  // ============================================================
  // LESSON 4.2
  // ============================================================
  {
    id: "credit-cards",
    track: "literacy",
    phase: 4,
    order: 28,
    lessonNumber: "4.2",
    title: "Credit Cards",
    badge: "Credit Card Safety Star",
    xp: 20,
    goals: [
      "Explain what a credit card is.",
      "Understand the difference between a credit card and a debit card.",
      "Use a credit card safely online and in stores.",
      "Recognize signs of credit card fraud.",
      "Know what to do if a card is lost, stolen, or used without permission."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Is a Credit Card?",
        text: "A credit card lets you borrow money from a bank or credit card company to make purchases. You agree to pay the money back later.\n\nEvery month, you'll receive a statement showing what you bought, how much you owe, and when your payment is due. If you don't pay the full balance by the due date, you may be charged interest, which is an extra fee for borrowing money."
      },
      {
        type: "learn",
        heading: "Credit Card vs. Debit Card",
        text: "Although they look similar, they work differently.\n\nA credit card borrows money from the credit card company. You pay later, and you get a monthly bill.\n\nA debit card uses money directly from your bank account. Money is taken out immediately, and there's no monthly bill for purchases.\n\nExample: Sarah buys groceries for $75. With a credit card, she'll pay the credit card company later. With a debit card, the $75 comes out of her bank account right away."
      },
      {
        type: "learn",
        heading: "Using Credit Cards Safely",
        text: "Good habits include:",
        bullets: [
          "Keep your card in a safe place",
          "Cover the keypad when entering your PIN",
          "Use secure websites when shopping online",
          "Review your monthly statement",
          "Turn on purchase alerts if your card offers them"
        ],
        footer: "Never share your card number with someone who unexpectedly contacts you, give your security code (CVV) over the phone unless you initiated the call, or save your card on websites you don't trust."
      },
      {
        type: "learn",
        heading: "Signs of Credit Card Fraud",
        text: "Fraud happens when someone uses your card without your permission. Warning signs include:",
        bullets: [
          "Purchases you don't recognize",
          "Charges from stores you've never visited",
          "Several small charges you didn't make",
          "Notifications about purchases you didn't authorize"
        ],
        footer: "If something looks wrong, contact your credit card company immediately."
      },
      {
        type: "multiselect",
        title: "Which Are Safe Credit Card Habits?",
        prompt: "Tap every safe habit.",
        options: [
          { text: "Check your monthly statement.", correct: true },
          { text: "Turn on purchase alerts.", correct: true },
          { text: "Use trusted websites.", correct: true },
          { text: "Keep your card in a safe place.", correct: true },
          { text: "Give your card number to someone who unexpectedly calls you.", correct: false },
          { text: "Share your security code in a text message.", correct: false },
          { text: "Leave your card on a restaurant table after paying.", correct: false }
        ],
        feedback: "Excellent! Safe habits help protect your money and make fraud easier to spot."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Credit Card", back: "A card that lets you borrow money to make purchases." },
          { front: "Debit Card", back: "A card that uses money directly from your bank account." },
          { front: "Statement", back: "A monthly record of your purchases and payments." },
          { front: "Interest", back: "An extra fee charged if you don't pay your full credit card balance by the due date." },
          { front: "Fraud", back: "When someone uses your card without your permission." }
        ]
      },
      {
        type: "match",
        title: "Match the Term",
        pairs: [
          { word: "Credit Card", match: "Borrow money to pay later" },
          { word: "Debit Card", match: "Uses your own bank money" },
          { word: "Statement", match: "Monthly list of purchases" },
          { word: "Interest", match: "Cost of borrowing money" },
          { word: "Fraud", match: "Unauthorized use of your card" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Statement", "Debit", "Fraud", "Interest"],
        questions: [
          { text: "Your monthly list of purchases is called a ______.", answer: "Statement" },
          { text: "Money taken directly from your checking account uses a ______ card.", answer: "Debit" },
          { text: "Someone using your card without permission is called ______.", answer: "Fraud" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret receives a text: \"Suspicious purchase detected. Reply with your full credit card number to verify your account.\" What should she do?",
        options: [
          "Reply with her card number.",
          "Reply with the security code too.",
          "Do not reply. Contact her credit card company using the phone number on the back of her card or through its official app.",
          "Forward the message to friends."
        ],
        correctIndex: 2,
        explanation: "Credit card companies generally won't ask you to verify your full card number through an unexpected text message."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert checks his statement and notices a $3.42 charge from a store he's never used. What should he do?",
        options: [
          "Ignore it because it's a small amount.",
          "Wait until next month.",
          "Contact his credit card company to report the unfamiliar charge.",
          "Buy something from the same store."
        ],
        correctIndex: 2,
        explanation: "Scammers sometimes make small purchases first to see whether the card is active."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda is shopping online. One website begins with https:// and another begins with http://. Which is generally the safer choice?",
        options: [
          "The website using https:// (along with making sure it's the correct website).",
          "The website using http://",
          "Either one is always equally safe.",
          "Choose whichever loads faster."
        ],
        correctIndex: 0,
        explanation: "HTTPS means the connection is encrypted, but you should also make sure you're on the real website."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Before using your credit card online, ask yourself: Is this a website I trust? Does the address begin with https://? Am I making this purchase myself? Am I comfortable sharing my card information with this business? If any answer is no, stop and investigate before continuing."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          {
            label: "Safer Choices",
            items: ["Review your statement every month", "Report unfamiliar charges quickly", "Use trusted websites", "Turn on purchase alerts"]
          },
          {
            label: "Less Safe Choices",
            items: ["Share your card number through unexpected texts", "Ignore unfamiliar charges", "Save your card on websites you don't trust", "Leave your card unattended"]
          }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You lose your credit card while shopping.",
        options: [
          "Wait a few weeks to see if someone returns it.",
          "Keep using it if you find it later.",
          "Contact your credit card company immediately to report it lost.",
          "Post your card number online asking if anyone found it."
        ],
        correctIndex: 2,
        explanation: "Reporting a lost card quickly helps prevent unauthorized purchases."
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You receive a purchase alert for $189, but you didn't buy anything today.",
        options: [
          "Ignore it.",
          "Wait until next year.",
          "Contact your credit card company immediately using the phone number on the back of your card or its official app.",
          "Reply to the alert with your card PIN."
        ],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "A website asks you to enter your credit card number, but the address is spelled slightly differently from the company you expected, like amaz0n-example.com instead of amazon.com.",
        options: [
          "Continue because the logo looks correct.",
          "Enter your card information anyway.",
          "Do not enter your card information. Leave the website and go to the company's official website by typing the address yourself.",
          "Share your Social Security number too."
        ],
        correctIndex: 2,
        explanation: "Scammers often create fake websites with addresses that look very similar to real companies."
      },
      {
        type: "learn",
        heading: "Remember",
        text: "Using a credit card safely means reviewing your statements, reporting unfamiliar charges immediately, using trusted websites, and keeping your card information private. Never share your card number in response to unexpected messages, ignore suspicious purchases, enter your information on websites you're unsure about, or share your PIN or security code with unexpected callers."
      }
    ],
    quiz: [
      { question: "What is a credit card?", options: ["A gift card.", "A library card.", "A card that lets you borrow money to make purchases and pay it back later.", "A driver's license."], correctIndex: 2 },
      { question: "Which are safe credit card habits?", options: ["Sharing your card number when asked", "Reviewing your statement, turning on alerts, reporting unfamiliar charges, and using trusted websites"], correctIndex: 1 },
      { question: "True or False: It's okay to give your full credit card number to someone who unexpectedly texts you claiming to be your bank.", options: ["True", "False"], correctIndex: 1 },
      { question: "The extra money charged if you don't pay your full credit card balance by the due date is called ______.", options: ["Interest", "Password", "Photo"], correctIndex: 0 },
      { question: "You notice a purchase you don't recognize on your statement. What should you do?", options: ["Ignore it.", "Wait until next month.", "Contact your credit card company as soon as possible.", "Post about it on social media."], correctIndex: 2 },
      { question: "What's one difference between a credit card and a debit card?", options: ["They are exactly the same.", "A credit card borrows money to pay later, while a debit card uses money directly from your bank account.", "A debit card can only be used at ATMs.", "A credit card can never be used online."], correctIndex: 1 },
      { question: "Which website is generally safer for entering your payment information?", options: ["A website using http://", "A website using https://, after confirming it's the correct website.", "Any website that has colorful logos.", "The first search result you find."], correctIndex: 1 },
      { question: "You lose your credit card. What should you do first?", options: ["Wait a week.", "Ask strangers if they've seen it.", "Contact your credit card company immediately to report it lost.", "Buy a new wallet first."], correctIndex: 2 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 2: Credit Cards!",
      learned: [
        "Understand how credit cards work.",
        "Tell the difference between credit and debit cards.",
        "Protect your credit card information.",
        "Recognize fraud and fake payment requests.",
        "Respond quickly if your card is lost or used without permission."
      ],
      next: "Mobile Payments"
    }
  },

  // ============================================================
  // LESSON 4.3
  // ============================================================
  {
    id: "mobile-payments",
    track: "literacy",
    phase: 4,
    order: 29,
    lessonNumber: "4.3",
    title: "Mobile Payments",
    badge: "Digital Wallet Defender",
    xp: 20,
    goals: [
      "Explain what mobile payments are.",
      "Understand how Apple Pay, Google Pay, and Samsung Wallet work.",
      "Make safe purchases using a phone or smartwatch.",
      "Recognize common mobile payment scams.",
      "Know what to do if their phone is lost or stolen."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Are Mobile Payments?",
        text: "Mobile payments let you pay for purchases using your phone or smartwatch instead of taking out a physical credit or debit card. Popular services include Apple Pay, Google Pay, and Samsung Wallet.\n\nThese services store a digital version of your credit or debit card in a secure wallet on your device. You can use them at many stores, restaurants, gas stations, and in some apps and online stores."
      },
      {
        type: "learn",
        heading: "How Do Mobile Payments Work?",
        text: "When you pay with your phone:",
        bullets: [
          "Unlock your phone",
          "Confirm it's really you using your face, fingerprint, or passcode",
          "Hold your phone near the payment terminal",
          "Wait for the confirmation that your payment was accepted"
        ],
        footer: "Your actual card number is usually not shared with the store, helping protect your information."
      },
      {
        type: "learn",
        heading: "Why Are Mobile Payments Secure?",
        text: "Mobile payment apps include several security features:",
        bullets: [
          "Face ID or facial recognition",
          "Fingerprint recognition",
          "Device passcode",
          "Encrypted payment information"
        ],
        footer: "Even if someone picks up your phone, they usually cannot make a payment without unlocking it first."
      },
      {
        type: "learn",
        heading: "Mobile Payment Scams",
        text: "Scammers may try to trick you by asking you to:",
        bullets: [
          "Add their credit card to your digital wallet",
          "Send money using a payment app to claim a prize",
          "Approve a payment you didn't make",
          "Share one-time verification codes"
        ],
        footer: "Never approve a payment you don't recognize."
      },
      {
        type: "multiselect",
        title: "Which Are Safe Mobile Payment Habits?",
        prompt: "Tap every safe choice.",
        options: [
          { text: "Lock your phone with a passcode, fingerprint, or Face ID.", correct: true },
          { text: "Only add your own credit or debit cards to your wallet.", correct: true },
          { text: "Check payment confirmations before leaving the store.", correct: true },
          { text: "Keep your phone with you.", correct: true },
          { text: "Approve payments you don't recognize.", correct: false },
          { text: "Add someone else's credit card because they asked you to.", correct: false },
          { text: "Share your phone passcode with strangers.", correct: false }
        ],
        feedback: "Excellent! Mobile payments are safest when your phone is protected and you only approve payments you recognize."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Mobile Payment", back: "Paying with a phone or smartwatch instead of a physical card." },
          { front: "Digital Wallet", back: "A secure app that stores payment cards on your device." },
          { front: "Face ID / Fingerprint", back: "Security features that verify your identity before making a payment." },
          { front: "Payment Terminal", back: "The device at a store that accepts card or phone payments." },
          { front: "Verification Code", back: "A temporary security code that should never be shared with unexpected callers." }
        ]
      },
      {
        type: "match",
        title: "Match the Item",
        pairs: [
          { word: "Apple Pay", match: "Lets you pay with an Apple device" },
          { word: "Google Pay", match: "Lets you pay with many Android devices" },
          { word: "Samsung Wallet", match: "Lets you pay with Samsung devices" },
          { word: "Face ID / Fingerprint", match: "Confirms your identity" },
          { word: "Payment Terminal", match: "Receives your payment at a store" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Wallet", "Fingerprint", "Phone", "Secure"],
        questions: [
          { text: "Apple Pay, Google Pay, and Samsung Wallet are examples of a digital ______.", answer: "Wallet" },
          { text: "Many phones use your face or ______ to verify it's really you.", answer: "Fingerprint" },
          { text: "Always keep your ______ protected with a passcode.", answer: "Phone" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret receives a text saying: \"To claim your prize, send $5 through Apple Pay.\" What should she do?",
        options: [
          "Send the money.",
          "Reply with her credit card number.",
          "Ignore the message and delete it. If it seems like a scam, block or report the sender.",
          "Send $10 instead."
        ],
        correctIndex: 2,
        explanation: "Legitimate prizes do not require you to send money first."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert is shopping at a grocery store. He unlocks his phone with his fingerprint and taps it on the terminal. The phone says \"Payment Approved.\" What should he do next?",
        options: [
          "Put his phone away and take his receipt if he wants one.",
          "Tap the terminal five more times.",
          "Give the cashier his phone password.",
          "Delete his digital wallet."
        ],
        correctIndex: 0,
        explanation: "Once the payment is approved, your purchase is complete."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda loses her phone while shopping. What should she do first?",
        options: [
          "Hope someone returns it eventually.",
          "Post her passcode on social media.",
          "Use another trusted device to mark the phone as lost, contact her mobile provider if needed, and monitor her payment accounts.",
          "Tell everyone her banking password."
        ],
        correctIndex: 2,
        explanation: "Acting quickly can help protect your personal and financial information."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Before paying with your phone, ask yourself: Is this the correct store? Is my phone unlocked by me? Am I approving a purchase I recognize? Is anyone asking for my passcode or verification code? If something doesn't feel right, stop before completing the payment."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          {
            label: "Safer Choices",
            items: ["Use Face ID, a fingerprint, or a passcode", "Keep your phone with you", "Review payment confirmations", "Monitor your card statements regularly"]
          },
          {
            label: "Less Safe Choices",
            items: ["Share your passcode", "Approve unknown payments", "Let strangers add their cards to your phone", "Ignore payment notifications"]
          }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "Someone says: \"I'll give you cash if you add my credit card to your Apple Pay.\"",
        options: [
          "Add their card.",
          "Let them use your phone.",
          "Do not add someone else's card to your digital wallet.",
          "Share your passcode too."
        ],
        correctIndex: 2,
        explanation: "Your digital wallet should only contain payment methods that belong to you or that you are authorized to use."
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You receive a notification asking you to approve a payment you didn't make.",
        options: [
          "Approve it quickly.",
          "Ignore it forever.",
          "Do not approve it. Contact your bank or card issuer through its official app or phone number if you're concerned.",
          "Give the notification your password."
        ],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You accidentally leave your phone at a restaurant. What should you do?",
        options: [
          "Wait several days before doing anything.",
          "Post your passcode online.",
          "Try to locate your phone using \"Find My\" or a similar service, mark it as lost if needed, and monitor your payment accounts.",
          "Cancel all your bank accounts immediately without checking."
        ],
        correctIndex: 2
      },
      {
        type: "learn",
        heading: "Remember",
        text: "Mobile payments are convenient and secure when used correctly. Protect your phone with a passcode, fingerprint, or Face ID. Only add payment cards you own. Check payment notifications and monitor your statements. Never share your phone passcode, approve payments you didn't make, send money to claim prizes, or add someone else's card."
      }
    ],
    quiz: [
      { question: "What is a mobile payment?", options: ["Paying with cash.", "Mailing a check.", "Paying with a phone or smartwatch using a digital wallet.", "Writing a money order."], correctIndex: 2 },
      { question: "Which are examples of digital wallets?", options: ["Netflix and Spotify", "Apple Pay, Google Pay, and Samsung Wallet"], correctIndex: 1 },
      { question: "True or False: You should approve a payment notification even if you didn't make the purchase.", options: ["True", "False"], correctIndex: 1 },
      { question: "Many phones use your ______ to confirm it's really you before paying.", options: ["Fingerprint", "Camera", "Speaker"], correctIndex: 0 },
      { question: "Someone asks you to send money through Apple Pay to claim a prize. What should you do?", options: ["Send the money.", "Send your card number too.", "Do not send money. Ignore, block, or report the message if it appears to be a scam.", "Ask if they'll accept more money."], correctIndex: 2 },
      { question: "Why do mobile payment apps use Face ID, a fingerprint, or a passcode?", options: ["To make purchases slower.", "To improve internet speed.", "To verify that the authorized user is making the payment.", "To increase your phone's storage."], correctIndex: 2 },
      { question: "What should you do if you lose your phone?", options: ["Share your passcode online.", "Wait several days.", "Use your phone's location service to find or secure it, and monitor your payment accounts.", "Approve every payment notification you receive."], correctIndex: 2 },
      { question: "Which habits help keep mobile payments safe?", options: ["Sharing your passcode with family", "Keeping your phone locked, reviewing notifications, monitoring statements, and only approving purchases you recognize"], correctIndex: 1 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 3: Mobile Payments!",
      learned: [
        "Use Apple Pay, Google Pay, and Samsung Wallet safely.",
        "Protect your digital wallet.",
        "Recognize mobile payment scams.",
        "Respond appropriately if your phone is lost."
      ],
      next: "Venmo, PayPal & Zelle"
    }
  },

  // ============================================================
  // LESSON 4.4
  // ============================================================
  {
    id: "payment-apps",
    track: "literacy",
    phase: 4,
    order: 30,
    lessonNumber: "4.4",
    title: "Venmo, PayPal & Zelle",
    badge: "Safe Money Sender",
    xp: 20,
    goals: [
      "Explain what Venmo, PayPal, and Zelle are.",
      "Know when it's safe to send money.",
      "Understand the differences between these payment services.",
      "Recognize common payment app scams.",
      "Know what to do if they accidentally send money to the wrong person."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Are Payment Apps?",
        text: "Venmo, PayPal, and Zelle are apps that let you send and receive money electronically. People use them to split a dinner bill, pay a friend back, pay rent (if accepted), send money to family, and pay some businesses. Money is transferred much faster than mailing a check."
      },
      {
        type: "learn",
        heading: "What's the Difference?",
        text: "Although they all send money, they work a little differently.\n\nVenmo is popular for paying friends and family. Payments can happen almost instantly. Some transactions may appear in a social feed unless you change your privacy settings.\n\nPayPal is used for both personal payments and many online stores. It offers different payment options depending on how you send money.\n\nZelle is often built directly into many banking apps. It sends money directly between bank accounts and transfers are usually very fast.",
        footer: "Important: With all three services, it can be difficult or impossible to recover money after it's sent to the wrong person or to a scammer."
      },
      {
        type: "learn",
        heading: "Only Send Money to People You Trust",
        text: "These apps are designed for sending money to family, friends, and people you know personally. Always double-check the person's name, their email address, and their phone number. Once money is sent, you may not be able to get it back."
      },
      {
        type: "learn",
        heading: "Common Payment App Scams",
        text: "Scammers often use these apps because money moves quickly. Common scams include:",
        bullets: [
          "\"Send $20 to claim your prize.\"",
          "Fake apartment deposits",
          "Fake concert tickets",
          "Fake online sellers",
          "Romance scams asking for money",
          "Someone \"accidentally\" sends you money and asks you to send it back"
        ],
        footer: "If you receive unexpected money from someone you don't know, contact the payment app's support instead of sending the money back yourself."
      },
      {
        type: "multiselect",
        title: "Which Payments Are Safe?",
        prompt: "Tap every payment that is usually safe.",
        options: [
          { text: "Paying your daughter back for lunch.", correct: true },
          { text: "Sending your grandson birthday money.", correct: true },
          { text: "Paying a trusted friend for concert tickets they already bought.", correct: true },
          { text: "Sending money to claim a prize.", correct: false },
          { text: "Paying someone you met online yesterday.", correct: false },
          { text: "Sending money because someone says they're \"stranded\" but you've never met them.", correct: false }
        ],
        feedback: "Excellent! Payment apps are safest when you send money only to people you know and trust."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Venmo", back: "A payment app often used to send money to friends and family." },
          { front: "PayPal", back: "A payment service used for personal payments and many online purchases." },
          { front: "Zelle", back: "A money transfer service often available through banking apps." },
          { front: "Transfer", back: "Sending money electronically." },
          { front: "Scam", back: "Someone trying to trick you into sending money or sharing information." }
        ]
      },
      {
        type: "match",
        title: "Match the Situation",
        pairs: [
          { word: "Paying your sister back for dinner", match: "Any payment app works if you both use it" },
          { word: "Shopping on a trusted website", match: "Pay with the method the business accepts" },
          { word: "Stranger asks for money to claim a prize", match: "Do not send money" },
          { word: "Unknown person \"accidentally\" sends you money", match: "Contact the payment app's support" },
          { word: "Sending birthday money to your grandson", match: "Use a payment app if you know it's really his account" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Trust", "Transfer", "Support", "Verify"],
        questions: [
          { text: "Only send money to people you ______.", answer: "Trust" },
          { text: "Money sent through these apps is called a ______.", answer: "Transfer" },
          { text: "If you receive unexpected money from a stranger, contact the payment app's ______.", answer: "Support" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret receives this message: \"Congratulations! Send $15 through Venmo to claim your $500 prize!\" What should she do?",
        options: [
          "Send the $15.",
          "Send $30 to get a bigger prize.",
          "Do not send any money. Delete or report the message if it appears to be a scam.",
          "Ask if they accept gift cards instead."
        ],
        correctIndex: 2,
        explanation: "If someone asks you to pay money to receive money, it's often a scam."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert wants to send $50 to his daughter. He notices two similar names in Venmo: \"Emily Johnson\" and \"Emily Johnson 2.\" What should he do?",
        options: [
          "Pick one quickly.",
          "Send $25 to each.",
          "Verify it's the correct account by checking with his daughter before sending the money.",
          "Cancel his bank account."
        ],
        correctIndex: 2,
        explanation: "Sending money to the wrong account can be difficult to reverse."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda receives $100 in PayPal from someone she doesn't know. A minute later they message: \"That was an accident. Please send it back right away.\" What should she do?",
        options: [
          "Send the money back immediately.",
          "Keep the money forever.",
          "Contact PayPal support and follow their instructions instead of sending the money back herself.",
          "Give the sender her bank password."
        ],
        correctIndex: 2,
        explanation: "This is a common scam. The original payment could later be reversed if it came from a stolen account."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Before sending money, ask yourself: Do I personally know this person? Have I verified their account? Am I expecting to send this payment? Would I be okay if I couldn't get this money back? If you're unsure, pause before sending."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          {
            label: "Safer Choices",
            items: ["Verify the recipient", "Double-check the amount", "Send money only to trusted people", "Contact support if something seems suspicious"]
          },
          {
            label: "Less Safe Choices",
            items: ["Rush through a payment", "Send money to claim prizes", "Trust strangers online", "Return unexpected payments without contacting the app first"]
          }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "A stranger on Facebook Marketplace asks you to pay a deposit before you've seen the item.",
        options: [
          "Send the money immediately.",
          "Send half now and half later.",
          "Be cautious. If something feels suspicious, don't send money before you've verified the seller.",
          "Give them your debit card PIN."
        ],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You accidentally send $40 to the wrong person. What should you do?",
        options: [
          "Ignore it.",
          "Send another $40.",
          "Contact the payment app's support immediately. You can also request the money back through the app if that option is available.",
          "Delete the app forever."
        ],
        correctIndex: 2,
        explanation: "Act quickly. Some payment apps have options to request money back or report mistaken transfers."
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "A text says: \"Your grandson needs money immediately. Send it through Zelle.\"",
        options: [
          "Send the money right away.",
          "Reply asking how much they want.",
          "Contact your grandson using a phone number you already know is his before sending any money.",
          "Send your bank password too."
        ],
        correctIndex: 2,
        explanation: "Scammers often pretend to be family members during emergencies. Always verify through a trusted contact method."
      },
      {
        type: "learn",
        heading: "Remember",
        text: "Payment apps make sending money easy, but they require careful attention. Double-check the recipient, send money only to people you trust, verify emergency requests independently, and contact support if something seems suspicious. Never pay money to claim a prize, rush because someone pressures you, share your banking password, or return unexpected payments directly to strangers."
      }
    ],
    quiz: [
      { question: "What are Venmo, PayPal, and Zelle used for?", options: ["Editing photos.", "Watching movies.", "Sending and receiving money electronically.", "Searching the internet."], correctIndex: 2 },
      { question: "Who should you usually send money to?", options: ["Anyone who asks", "Trusted family members, friends you know personally, and businesses you intended to pay"], correctIndex: 1 },
      { question: "True or False: If someone asks you to send money to claim a prize, it's probably a scam.", options: ["False", "True"], correctIndex: 1 },
      { question: "Before sending money, always ______ the recipient.", options: ["Verify", "Camera", "Speaker"], correctIndex: 0 },
      { question: "You receive unexpected money from someone you don't know. What should you do?", options: ["Send it back immediately.", "Spend it.", "Contact the payment app's support and follow their instructions.", "Give the sender your bank information."], correctIndex: 2 },
      { question: "Why should you double-check the recipient before sending money?", options: ["It makes your phone faster.", "It changes your password.", "Money sent to the wrong person can be difficult or impossible to recover.", "It increases your bank balance."], correctIndex: 2 },
      { question: "Someone texts saying they're your grandchild and need emergency money immediately. What should you do?", options: ["Send the money immediately.", "Reply asking for their password.", "Contact your grandchild using a phone number you already know is theirs before sending any money.", "Ignore every future family message."], correctIndex: 2 },
      { question: "Which habits help you use payment apps safely?", options: ["Sending quickly to save time", "Verifying the recipient, double-checking the amount, being cautious of urgent requests, and contacting support if suspicious"], correctIndex: 1 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 4: Venmo, PayPal & Zelle!",
      learned: [
        "Send money safely.",
        "Verify recipients before paying.",
        "Recognize payment app scams.",
        "Handle mistaken transfers and suspicious requests."
      ],
      next: "Secure Online Shopping"
    }
  },

  // ============================================================
  // LESSON 4.5
  // ============================================================
  {
    id: "online-shopping",
    track: "literacy",
    phase: 4,
    order: 31,
    lessonNumber: "4.5",
    title: "Secure Online Shopping",
    badge: "Smart Online Shopper",
    xp: 20,
    goals: [
      "Shop safely on trusted websites.",
      "Recognize secure online stores.",
      "Avoid fake shopping websites.",
      "Protect their payment information.",
      "Know what to do if an online purchase seems suspicious."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Is Online Shopping?",
        text: "Online shopping means buying products using a website or mobile app. People shop online for clothing, books, pharmacy items, household supplies, gifts, and groceries. Online shopping is convenient, but scammers sometimes create fake websites or fake listings to steal money or personal information."
      },
      {
        type: "learn",
        heading: "How to Shop Safely",
        text: "Before buying something online:",
        bullets: [
          "Shop from stores you know or have researched",
          "Type the website address yourself or use the store's official app",
          "Read the website address carefully",
          "Make sure the website begins with https://",
          "Review the total price before paying",
          "Save your receipt or order confirmation"
        ]
      },
      {
        type: "learn",
        heading: "Warning Signs of a Fake Store",
        text: "Be cautious if a website:",
        bullets: [
          "Sells expensive items for unbelievably low prices",
          "Pressures you with messages like \"Only 2 minutes left!\"",
          "Accepts only unusual payment methods like gift cards or cryptocurrency",
          "Has many spelling mistakes",
          "Doesn't list a customer service phone number or contact information",
          "Has a website address that looks strange"
        ],
        footer: "Examples: amaz0n-deals.com or best-buy-sale.net. A fake website may look very similar to a real one."
      },
      {
        type: "learn",
        heading: "Paying Safely",
        text: "When paying online, use a credit card or another trusted payment method, double-check the total amount, never pay with gift cards because someone tells you to, never send cash through the mail, and keep your payment information private.\n\nAfter your purchase, save your confirmation email and track your package through the official store or shipping company."
      },
      {
        type: "multiselect",
        title: "Which Shopping Habits Are Safe?",
        prompt: "Tap every safe habit.",
        options: [
          { text: "Shop from websites you know or have researched.", correct: true },
          { text: "Look for https://.", correct: true },
          { text: "Save your receipt.", correct: true },
          { text: "Review the final price before paying.", correct: true },
          { text: "Pay with gift cards because someone demanded it.", correct: false },
          { text: "Buy from a website with no contact information.", correct: false },
          { text: "Enter your payment information on a website with a suspicious address.", correct: false }
        ],
        feedback: "Excellent! Safe shopping starts with choosing trustworthy websites and protecting your payment information."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Online Shopping", back: "Buying products through a website or app." },
          { front: "HTTPS", back: "A secure website connection." },
          { front: "Receipt", back: "Proof that you made a purchase." },
          { front: "Order Confirmation", back: "A message confirming your purchase." },
          { front: "Fake Website", back: "A website pretending to be a real store." }
        ]
      },
      {
        type: "match",
        title: "Match the Shopping Term",
        pairs: [
          { word: "HTTPS", match: "Secure website connection" },
          { word: "Receipt", match: "Proof of purchase" },
          { word: "Order Confirmation", match: "Confirms your order" },
          { word: "Fake Website", match: "Pretends to be a real store" },
          { word: "Customer Service", match: "Helps customers with questions or problems" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["HTTPS", "Price", "Receipt", "Official"],
        questions: [
          { text: "A secure shopping website usually begins with ______.", answer: "HTTPS" },
          { text: "Always review the final ______ before paying.", answer: "Price" },
          { text: "After buying something online, save your ______.", answer: "Receipt" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret finds a website selling a $200 coffee maker for only $15. The website has many spelling mistakes and no customer service phone number. What should she do?",
        options: [
          "Buy it immediately before it sells out.",
          "Enter her credit card information.",
          "Leave the website and shop from a trusted retailer instead.",
          "Send the seller a gift card."
        ],
        correctIndex: 2,
        explanation: "Prices that seem too good to be true often are. Fake stores lure shoppers with extremely low prices."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert is shopping online. The checkout page begins with https:// and the website is one he has used before. What should he do?",
        options: [
          "Continue if everything else looks correct and he intends to make the purchase.",
          "Send his password by email.",
          "Ignore the total price.",
          "Pay with gift cards because it's faster."
        ],
        correctIndex: 0,
        explanation: "HTTPS and using a trusted retailer are good signs, but always review your order before paying."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda receives an email saying \"Your package cannot be delivered. Pay a $2 delivery fee here.\" She wasn't expecting any packages. What should she do?",
        options: [
          "Click the link immediately.",
          "Enter her credit card number.",
          "Don't click the link. Go directly to the retailer's or shipping company's official website to check her order.",
          "Send her Social Security number."
        ],
        correctIndex: 2,
        explanation: "Scammers often send fake delivery messages to steal payment information."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Before buying online, ask yourself: Do I recognize this store? Does the website begin with https://? Does the price seem reasonable? Does the website provide customer support information? If something feels unusual, stop and research the store before buying."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          {
            label: "Safer Choices",
            items: ["Buy from trusted websites", "Save your receipts", "Review your order before paying", "Check your statement after making purchases"]
          },
          {
            label: "Less Safe Choices",
            items: ["Trust unbelievably low prices", "Pay with gift cards because someone requested it", "Ignore strange website addresses", "Enter payment information on suspicious websites"]
          }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You find a television that usually costs $900 selling for $49 on a website you've never heard of.",
        options: [
          "Buy it immediately.",
          "Enter your credit card information.",
          "Be cautious. Research the seller and consider shopping with a trusted retailer instead.",
          "Send the seller a gift card."
        ],
        correctIndex: 2,
        explanation: "Deals that seem too good to be true often are."
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "A website asks you to pay using gift cards only.",
        options: [
          "Buy the gift cards and pay.",
          "Send cash instead.",
          "Do not continue with the purchase. This is a major warning sign of a scam.",
          "Give the website your banking password."
        ],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You receive a text saying: \"Your package is waiting. Click here to pay a delivery fee.\" You aren't expecting a package.",
        options: [
          "Click the link.",
          "Enter your payment information.",
          "Do not click the link. Check directly with the retailer or shipping company using its official website or app.",
          "Reply with your credit card number."
        ],
        correctIndex: 2,
        explanation: "Scammers frequently send fake package delivery texts to steal money or payment information."
      },
      {
        type: "learn",
        heading: "Remember",
        text: "Shopping online can be safe when you take your time. Buy from trusted stores, check the website address, look for https://, save receipts and order confirmations, and monitor your statements after purchases. Never pay with gift cards because someone tells you to, enter payment information on suspicious websites, trust unbelievable deals, or click unexpected delivery links."
      }
    ],
    quiz: [
      { question: "What is online shopping?", options: ["Sending emails.", "Watching videos.", "Buying products through a website or app.", "Using GPS."], correctIndex: 2 },
      { question: "Which habits help you shop safely?", options: ["Buying from the cheapest site you find", "Shopping from trusted websites, looking for https://, saving your receipt, and reviewing the total"], correctIndex: 1 },
      { question: "True or False: A website asking you to pay only with gift cards is a warning sign.", options: ["False", "True"], correctIndex: 1 },
      { question: "After buying something online, save your ______.", options: ["Receipt", "Camera", "Speaker"], correctIndex: 0 },
      { question: "You receive an unexpected text asking you to pay a delivery fee for a package. What should you do?", options: ["Click the link immediately.", "Enter your credit card information.", "Don't click the link. Check directly with the retailer or shipping company.", "Reply with your Social Security number."], correctIndex: 2 },
      { question: "Which website is generally safer?", options: ["http://shop-example.com", "https://shop-example.com, after confirming it's the correct website", "A website with lots of pop-up ads.", "Any website with the cheapest prices."], correctIndex: 1 },
      { question: "You find a luxury handbag worth $1,200 being sold for $25 on a website you've never heard of. What should you do?", options: ["Buy it immediately.", "Share your payment information.", "Be cautious and research the website before making a purchase.", "Tell your friends to buy it too."], correctIndex: 2 },
      { question: "Which habits help protect you after shopping online?", options: ["Deleting all your emails", "Saving your confirmation, monitoring your statements, and tracking your package through the official retailer"], correctIndex: 1 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 5: Secure Online Shopping!",
      learned: [
        "Shop safely online.",
        "Recognize trustworthy websites.",
        "Protect your payment information.",
        "Avoid fake delivery and shopping scams.",
        "Keep records of your purchases."
      ],
      next: "Refund Scams"
    }
  },

  // ============================================================
  // LESSON 4.6
  // ============================================================
  {
    id: "refund-scams",
    track: "literacy",
    phase: 4,
    order: 32,
    lessonNumber: "4.6",
    title: "Refund Scams",
    badge: "Refund Scam Detective",
    xp: 20,
    goals: [
      "Explain what a refund scam is.",
      "Recognize common refund scam tactics.",
      "Know how legitimate refunds usually work.",
      "Avoid giving scammers access to their money or devices.",
      "Know what to do if someone contacts them about an unexpected refund."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Is a Refund Scam?",
        text: "A refund scam is when someone pretends to owe you money and uses that story to steal your money or personal information. Scammers may pretend to be from Amazon, Microsoft, Apple, UPS, FedEx, streaming services, or your bank.\n\nThey might say: \"You were accidentally charged.\" \"You're owed a refund.\" \"We need your banking information to send your money.\" The goal is to trick you into sending money or giving them access to your accounts."
      },
      {
        type: "learn",
        heading: "How Real Refunds Usually Work",
        text: "A legitimate business usually sends a refund back to the original payment method (such as your credit card), through your online account with the company, and after you request or qualify for a refund.\n\nMost companies do not unexpectedly call you asking for your password, bank account number, or remote access to your computer to process a refund. If you're unsure, contact the company using its official website, app, or customer service number, not the phone number or link in the unexpected message."
      },
      {
        type: "learn",
        heading: "Common Refund Scam Tricks",
        text: "Scammers often say:",
        bullets: [
          "\"We accidentally refunded you too much.\"",
          "\"Let us connect to your computer.\"",
          "\"Install this app so we can process the refund.\"",
          "\"Buy gift cards to return the extra money.\"",
          "\"Move money to a 'safe account.'\""
        ],
        footer: "These are all major warning signs."
      },
      {
        type: "multiselect",
        title: "Which Are Warning Signs?",
        prompt: "Tap every warning sign.",
        options: [
          { text: "Someone asks you to install software so they can issue a refund.", correct: true },
          { text: "Someone asks you to buy gift cards to \"return\" money.", correct: true },
          { text: "Someone asks for your online banking password.", correct: true },
          { text: "Someone pressures you to act immediately.", correct: true },
          { text: "A store refunds money to your original credit card after you returned an item.", correct: false },
          { text: "You requested a refund through the company's official website and received confirmation.", correct: false }
        ],
        feedback: "Excellent! Scammers often create urgency and ask for unusual payment methods or remote access."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Refund Scam", back: "A scam where someone pretends to owe you money to steal your information or money." },
          { front: "Remote Access", back: "Allowing someone else to control your computer or phone." },
          { front: "Gift Card Scam", back: "A scam that asks you to pay with gift cards." },
          { front: "Official Customer Support", back: "The company's real help service found on its official website or app." },
          { front: "Urgency", back: "Pressure to act immediately without thinking." }
        ]
      },
      {
        type: "match",
        title: "Match the Situation",
        pairs: [
          { word: "\"We accidentally refunded you $2,000.\"", match: "Contact the company through its official website" },
          { word: "Someone wants remote access to your computer", match: "Do not allow access" },
          { word: "Someone asks for gift cards to fix a refund", match: "Refuse and end the conversation" },
          { word: "You returned shoes to a trusted store", match: "Expect the refund to go back to your original payment method" },
          { word: "You're unsure if a refund message is real", match: "Contact the company using official contact information" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Original", "Gift Cards", "Official", "Password"],
        questions: [
          { text: "Most refunds are sent back to your ______ payment method.", answer: "Original" },
          { text: "Legitimate companies generally will not ask you to pay with ______ to receive a refund.", answer: "Gift Cards" },
          { text: "If you're unsure about a refund, contact the company's ______ customer support.", answer: "Official" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret receives a call: \"Hello, this is Microsoft. We accidentally charged you $399. Let us connect to your computer so we can issue your refund.\" What should she do?",
        options: [
          "Let them connect to her computer.",
          "Give them her banking password.",
          "Hang up and contact Microsoft using its official website or customer support if she's concerned.",
          "Buy gift cards to speed up the refund."
        ],
        correctIndex: 2,
        explanation: "Legitimate companies generally don't need remote access to your computer to issue a refund."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert receives an email: \"We accidentally refunded you $900 instead of $90. Please send the extra $810 back immediately using gift cards.\" What should he do?",
        options: [
          "Buy the gift cards.",
          "Send the money.",
          "Do not send anything. Contact the company using its official website or app if he believes the message might be legitimate.",
          "Give them his debit card PIN."
        ],
        correctIndex: 2,
        explanation: "Gift cards are one of the biggest warning signs of a refund scam."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda returns a sweater to a department store. Three days later, the refund appears on the same credit card she used to buy it. What should she do?",
        options: [
          "That's normal. Keep her receipt until the refund is complete.",
          "Call a stranger to confirm the refund.",
          "Send money back to the store.",
          "Download software to verify the refund."
        ],
        correctIndex: 0,
        explanation: "This is how many legitimate refunds work. Most stores simply return the money to your original payment method."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Before accepting a refund, ask yourself: Did I actually request or expect this refund? Is this company contacting me through an official method? Is anyone asking for my password, gift cards, or remote access? Can I verify this by contacting the company myself? If anything feels unusual, pause and verify before taking action."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          {
            label: "Safer Choices",
            items: ["Contact the company using its official website", "Verify unexpected refund messages", "Keep receipts until your refund is complete", "Hang up on suspicious callers"]
          },
          {
            label: "Less Safe Choices",
            items: ["Allow strangers to control your computer", "Buy gift cards for a refund", "Share banking passwords", "Rush because someone says \"act now\""]
          }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "Someone says they accidentally refunded you too much and wants you to send the difference back immediately.",
        options: [
          "Send the money.",
          "Buy gift cards.",
          "Stop communicating with the caller and contact the company using its official customer support if you think the claim might be real.",
          "Give them your online banking password."
        ],
        correctIndex: 2,
        explanation: "This is one of the most common refund scam tactics."
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "A caller asks to install software so they can process your refund.",
        options: [
          "Install it immediately.",
          "Let them control your computer.",
          "Refuse and end the conversation.",
          "Give them your Wi-Fi password."
        ],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You receive an unexpected email about a refund from a company you don't recognize.",
        options: [
          "Click the link immediately.",
          "Enter your bank account information.",
          "Don't click the link. Go directly to the company's official website or contact them using verified contact information.",
          "Reply with your password."
        ],
        correctIndex: 2,
        explanation: "Unexpected refund emails are a common phishing tactic."
      },
      {
        type: "learn",
        heading: "Remember",
        text: "Legitimate refunds are usually simple. They go back to your original payment method, you can verify them through the company's official website or app, and you can take your time before responding. Never buy gift cards to receive a refund, give strangers remote access to your computer, share your banking passwords or verification codes, or rush because someone says your refund will disappear."
      }
    ],
    quiz: [
      { question: "What is a refund scam?", options: ["A store returning your money after a return.", "A scam where someone pretends to owe you money to steal your information or money.", "Paying a bill online.", "Checking your bank balance."], correctIndex: 1 },
      { question: "Which are common warning signs of a refund scam?", options: ["A refund appearing on your credit card", "Someone asking for gift cards, remote access, your banking password, or pressuring you to act immediately"], correctIndex: 1 },
      { question: "True or False: Legitimate companies usually ask customers to buy gift cards to complete a refund.", options: ["True", "False"], correctIndex: 1 },
      { question: "Most refunds go back to your ______ payment method.", options: ["Original", "Speaker", "Camera"], correctIndex: 0 },
      { question: "Someone wants remote access to your computer to process a refund. What should you do?", options: ["Allow it.", "Give them your password.", "Refuse, end the conversation, and contact the company directly if needed.", "Install the software anyway."], correctIndex: 2 },
      { question: "Why should you contact the company using its official website instead of replying to an unexpected message?", options: ["It makes refunds faster.", "It guarantees free products.", "It helps you verify you're communicating with the real company rather than a scammer.", "It increases your bank balance."], correctIndex: 2 },
      { question: "Which payment method is a major warning sign in refund scams?", options: ["Credit card.", "Debit card.", "Gift cards.", "Cash back on your original purchase."], correctIndex: 2 },
      { question: "If you're unsure whether a refund offer is real, what's the safest next step?", options: ["Click the email link.", "Reply with your banking information.", "Contact the company directly using verified contact information from its official website or app.", "Ignore every future email from every company."], correctIndex: 2 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 6: Refund Scams!",
      learned: [
        "Recognize refund scams.",
        "Avoid giving scammers remote access to your devices.",
        "Spot gift card refund scams.",
        "Verify refunds safely through official company channels."
      ],
      next: "Recognizing Fake Websites"
    }
  },

  // ============================================================
  // LESSON 4.7
  // ============================================================
  {
    id: "fake-websites",
    track: "literacy",
    phase: 4,
    order: 33,
    lessonNumber: "4.7",
    title: "Recognizing Fake Websites",
    badge: "Digital Finance Expert",
    xp: 20,
    phaseBadge: true,
    goals: [
      "Recognize signs of a fake website.",
      "Understand how scammers copy real websites.",
      "Verify a website before entering personal or payment information.",
      "Avoid phishing websites.",
      "Know what to do if they accidentally visit a fake website."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Is a Fake Website?",
        text: "A fake website is a website designed to look like a real one so it can trick people into giving away credit card numbers, passwords, email addresses, banking information, or personal information. Some fake websites look almost identical to real ones. Their goal is to steal your information."
      },
      {
        type: "learn",
        heading: "Check the Website Address (URL)",
        text: "One of the easiest ways to spot a fake website is by looking at the web address, also called the URL.",
        bullets: [
          "Real: amazon.com | Fake: amaz0n-support.com",
          "Real: paypal.com | Fake: paypaI-login.com (uses a capital I instead of lowercase l)",
          "Real: irs.gov | Fake: irs-refund-now.com"
        ],
        footer: "Scammers often change just one or two letters hoping people won't notice."
      },
      {
        type: "learn",
        heading: "Look for HTTPS",
        text: "Secure websites usually begin with https://. The \"S\" stands for Secure.\n\nHowever, HTTPS alone does NOT mean a website is legitimate. Scammers can also create fake websites that use HTTPS.\n\nAlways check the full website address, the company name, and whether you reached the website intentionally."
      },
      {
        type: "learn",
        heading: "Warning Signs of Fake Websites",
        text: "Be cautious if a website:",
        bullets: [
          "Has many spelling mistakes",
          "Uses blurry logos or poor-quality images",
          "Pressures you with countdown timers",
          "Says you've won something unexpectedly",
          "Asks for personal information that doesn't make sense",
          "Doesn't provide customer service information",
          "Has a strange web address"
        ],
        footer: "If something feels wrong, leave the website."
      },
      {
        type: "multiselect",
        title: "Which Website Looks Legitimate?",
        prompt: "Tap every website that looks legitimate.",
        options: [
          { text: "https://amazon.com", correct: true },
          { text: "https://irs.gov", correct: true },
          { text: "https://paypal.com", correct: true },
          { text: "https://amaz0n-deals.com", correct: false },
          { text: "https://paypaI-login.net", correct: false },
          { text: "https://irs-refund-fast.com", correct: false }
        ],
        feedback: "Excellent! Small differences in website addresses can make a big difference."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "URL", back: "The website address shown in your browser." },
          { front: "HTTPS", back: "A secure connection between your browser and a website." },
          { front: "Phishing Website", back: "A fake website designed to steal information." },
          { front: "Domain Name", back: "The main name of a website, such as amazon.com or paypal.com." },
          { front: "Scam Website", back: "A fake website pretending to be a real business or organization." }
        ]
      },
      {
        type: "match",
        title: "Match the Warning Sign",
        pairs: [
          { word: "Strange website address", match: "May be a fake website" },
          { word: "Countdown timer", match: "Creates pressure to rush" },
          { word: "Many spelling mistakes", match: "Can be a sign of a scam" },
          { word: "Requests unnecessary personal information", match: "May be trying to steal information" },
          { word: "Unexpected prize message", match: "Common scam tactic" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["URL", "Verify", "HTTPS", "Fake"],
        questions: [
          { text: "The website address is called the ______.", answer: "URL" },
          { text: "Before entering payment information, always ______ the website.", answer: "Verify" },
          { text: "______ helps provide a secure connection, but it doesn't guarantee a website is legitimate.", answer: "HTTPS" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret receives an email: \"Your Amazon account has been suspended. Click here to log in.\" The link goes to amaz0n-login-help.com. What should she do?",
        options: [
          "Click the link and sign in.",
          "Enter her password.",
          "Do not click the link. Open her browser and type amazon.com herself or use the official Amazon app.",
          "Forward the email to friends."
        ],
        correctIndex: 2,
        explanation: "Never trust unexpected login links. Go directly to the official website instead."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert wants to renew his driver's license. He sees dmv.ca.gov and california-dmv-renew-license.com. Which should he choose?",
        options: ["dmv.ca.gov", "california-dmv-renew-license.com"],
        correctIndex: 0,
        explanation: "Government websites in the U.S. typically use .gov domains. Scammers often create websites that sound official but are not."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda is shopping online. A website asks for her Social Security number, her bank password, and her credit card PIN, just to buy a sweater. What should she do?",
        options: [
          "Enter the information.",
          "Call the number on the page.",
          "Leave the website immediately and shop somewhere else.",
          "Continue because the price is good."
        ],
        correctIndex: 2,
        explanation: "A clothing store should never ask for your bank password or credit card PIN. Requests for unnecessary personal information are a major warning sign."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Before entering personal information, ask yourself: Did I type the website address myself? Does the website address look correct? Does the request for information make sense? Am I being rushed? If you're unsure, close the page and visit the company's official website yourself."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          {
            label: "Safer Choices",
            items: ["Type the website address yourself", "Read the URL carefully", "Look for contact information", "Take your time before entering personal information"]
          },
          {
            label: "Less Safe Choices",
            items: ["Click unexpected login links", "Ignore strange website addresses", "Rush because of countdown timers", "Enter your password without checking the website"]
          }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You receive an email that says: \"Your PayPal account has been locked. Click here.\"",
        options: [
          "Click the link.",
          "Reply with your password.",
          "Go directly to paypal.com or use the official PayPal app to check your account.",
          "Send your Social Security number."
        ],
        correctIndex: 2,
        explanation: "Unexpected emails often contain links to fake websites."
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "A website has dozens of spelling mistakes and blurry logos.",
        options: [
          "Trust it because it has low prices.",
          "Enter your credit card information.",
          "Leave the website and look for a trusted retailer instead.",
          "Download software from the website."
        ],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You're not sure if a website is real. What should you do?",
        options: [
          "Enter your information to test it.",
          "Trust it because it looks professional.",
          "Search for the company's official website yourself or use its official app before entering any information.",
          "Ignore the website address completely."
        ],
        correctIndex: 2,
        explanation: "Taking a few extra seconds to verify a website can help protect your personal information."
      },
      {
        type: "learn",
        heading: "Remember",
        text: "Fake websites are designed to look convincing. Read the website address carefully, type important website addresses yourself, be cautious of unusual requests for personal information, and leave websites that make you uncomfortable. Never enter passwords on websites you don't trust, click unexpected login links, rush because of countdown timers, or ignore suspicious website addresses."
      }
    ],
    quiz: [
      { question: "What is a fake website?", options: ["A website that loads slowly.", "A website with colorful pictures.", "A website designed to look real so it can steal information.", "A website with online games."], correctIndex: 2 },
      { question: "Which website looks legitimate?", options: ["https://amaz0n-deals.com", "https://amazon.com"], correctIndex: 1 },
      { question: "True or False: If a website uses https://, it is automatically safe and legitimate.", options: ["True", "False"], correctIndex: 1 },
      { question: "The website address is called a ______.", options: ["URL", "Camera", "Photo"], correctIndex: 0 },
      { question: "You receive an email asking you to log in to your bank using a link in the message. What should you do?", options: ["Click the link.", "Reply with your password.", "Go directly to your bank's official website or app instead of using the email link.", "Forward the email to everyone you know."], correctIndex: 2 },
      { question: "Which of these is a warning sign of a fake website?", options: ["Clear customer support information.", "A familiar website address.", "Requests for your bank password or other unnecessary personal information.", "A website you've used safely before."], correctIndex: 2 },
      { question: "Why should you read a website's URL carefully?", options: ["It changes your password.", "It speeds up your internet.", "Scammers often create website addresses that closely resemble real ones.", "It helps your phone battery last longer."], correctIndex: 2 },
      { question: "If you're unsure whether a website is legitimate, what should you do?", options: ["Enter your information to see what happens.", "Trust it because it looks professional.", "Leave the site and go to the company's official website or app yourself.", "Ignore the warning signs."], correctIndex: 2 }
    ],
    complete: {
      title: "Phase 4 Complete!",
      subtitle: "You completed Lesson 7: Recognizing Fake Websites, and all of Phase 4: Digital Finance!",
      learned: [
        "Online Banking",
        "Credit Cards",
        "Mobile Payments",
        "Venmo, PayPal & Zelle",
        "Secure Online Shopping",
        "Refund Scams",
        "Recognizing Fake Websites"
      ],
      next: "Phase 4 Final Challenge"
    }
  }
];

// ============================================================
// PHASE 4 FINAL CHALLENGE (mixed-format review, ungraded)
// ============================================================
export const phase4Challenge = {
  id: "phase4-challenge",
  track: "literacy",
  phase: 4,
  order: 34,
  title: "Phase 4 Final Challenge",
  blocks: [
    {
      type: "multiselect",
      title: "Mixed Review",
      prompt: "Which actions are safe? Select all that apply.",
      options: [
        { text: "Use your bank's official app to check your balance.", correct: true },
        { text: "Review your credit card statement every month.", correct: true },
        { text: "Verify the recipient before sending money with Venmo or Zelle.", correct: true },
        { text: "Type important website addresses yourself instead of clicking unexpected links.", correct: true },
        { text: "Pay with gift cards because someone says it's required.", correct: false }
      ],
      feedback: "Excellent! These habits protect both your money and your information."
    },
    {
      type: "match",
      title: "Match the Scam",
      pairs: [
        { word: "\"Buy gift cards to receive your refund.\"", match: "Refund Scam" },
        { word: "Fake website asking for your bank password", match: "Phishing / Fake Website" },
        { word: "\"Send money to claim your prize.\"", match: "Payment App Scam" },
        { word: "Tiny charge you don't recognize on your credit card", match: "Possible Credit Card Fraud" },
        { word: "Unexpected text saying your bank account is locked", match: "Banking Phishing Scam" }
      ]
    },
    {
      type: "fillblank",
      title: "Fill in the Blank",
      wordBank: ["Verify", "Official", "HTTPS", "Statement"],
      questions: [
        { text: "Always ______ the website before entering payment information.", answer: "Verify" },
        { text: "Review your monthly credit card ______ to look for unfamiliar charges.", answer: "Statement" },
        { text: "Access your bank through its ______ app or website.", answer: "Official" },
        { text: "______ helps create a secure connection, but it doesn't guarantee a website is real.", answer: "HTTPS" }
      ]
    },
    {
      type: "scenario",
      title: "Real-Life Scenario",
      text: "Susan receives a text: \"Your bank account has been locked. Click this link immediately.\" What should she do?",
      options: [
        "Click the link quickly.",
        "Reply with her password.",
        "Open her bank's official app or type the bank's website into her browser herself to check her account.",
        "Buy gift cards to unlock her account."
      ],
      correctIndex: 2,
      explanation: "Banks generally don't ask customers to verify accounts through unexpected text links."
    },
    {
      type: "scenario",
      title: "Real-Life Scenario",
      text: "John wants to send $100 to his grandson using Zelle. He notices there are two contacts with similar names. What should he do?",
      options: [
        "Pick one and hope it's correct.",
        "Send $50 to each.",
        "Contact his grandson using a trusted phone number to verify the correct account before sending the money.",
        "Cancel his bank account."
      ],
      correctIndex: 2
    }
  ]
};

// ============================================================
// PHASE 4 FINAL EXAM
// ============================================================
export const phase4Exam = {
  id: "phase4-exam",
  track: "literacy",
  phase: 4,
  order: 35,
  title: "Phase 4 Final Exam: Digital Finance",
  topics: [
    "Online Banking",
    "Credit Cards",
    "Mobile Payments",
    "Venmo / PayPal / Zelle",
    "Secure Shopping",
    "Refund Scams",
    "Fake Websites"
  ],
  passingScore: 8,
  totalQuestions: 10,
  questions: [
    {
      question: "What's the safest way to access your bank?",
      options: ["Through a random email link", "Through a text message", "Using your bank's official app or by typing the official website yourself", "Through social media"],
      correctIndex: 2
    },
    {
      question: "True or False: You should send gift cards to receive a refund.",
      options: ["True", "False"],
      correctIndex: 1
    },
    {
      question: "Which are warning signs of a fake shopping website?",
      options: [
        "Clear return policy and contact information",
        "Prices that seem too good to be true, strange addresses, no customer support, and unusual payment methods"
      ],
      correctIndex: 1
    },
    {
      question: "Review your monthly credit card ______.",
      options: ["Statement", "Camera", "Browser"],
      correctIndex: 0
    },
    {
      question: "Someone unexpectedly asks for your one-time banking verification code.",
      options: ["Share it.", "Text it later.", "Never share it.", "Email it."],
      correctIndex: 2
    },
    {
      question: "Before sending money with Venmo or Zelle, you should:",
      options: ["Rush.", "Guess the recipient.", "Verify the recipient.", "Send two payments."],
      correctIndex: 2
    },
    {
      question: "A website asks for your bank password to buy shoes.",
      options: ["Enter it.", "Continue shopping.", "Leave the website immediately.", "Call the seller."],
      correctIndex: 2
    },
    {
      question: "You notice a purchase you don't recognize.",
      options: ["Ignore it.", "Wait a month.", "Contact your bank or credit card company.", "Post it on Facebook."],
      correctIndex: 2
    },
    {
      question: "True or False: HTTPS alone guarantees a website is legitimate.",
      options: ["True", "False"],
      correctIndex: 1
    },
    {
      question: "Someone says you accidentally received too much refund money and asks you to send gift cards.",
      options: [
        "Buy the gift cards.",
        "Send cash.",
        "Do not send anything. Contact the company through official channels if you think the message might be legitimate.",
        "Give your password."
      ],
      correctIndex: 2
    }
  ],
  results: [
    { minScore: 10, title: "Digital Finance Master", xp: 50, trophy: true },
    { minScore: 8, title: "Excellent!", xp: 40, trophy: false },
    { minScore: 6, title: "Great Job!", xp: 25, trophy: false }
  ],
  nextPhase: "Phase 5: Health & Government"
};

export default phase4Lessons;
