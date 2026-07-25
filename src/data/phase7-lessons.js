// Everwise - Digital Literacy Track
// Phase 7: Emergency Skills
// Biome: Twilight | Color: #4E4A7D
//
// All 6 lessons plus the Phase 7 Final Exam.
// Exports: phase7Lessons (array), phase7Exam (object)

export const phase7Lessons = [
  // ============================================================
  // LESSON 7.1
  // ============================================================
  {
    id: "clicked-a-scam",
    track: "literacy",
    phase: 7,
    order: 52,
    lessonNumber: "7.1",
    title: "What to Do If You Clicked a Scam",
    badge: "Quick Responder",
    xp: 20,
    goals: [
      "Stay calm after clicking a suspicious link.",
      "Know the immediate steps to take.",
      "Understand when to change passwords.",
      "Know when to contact their bank.",
      "Know when to ask for help."
    ],
    blocks: [
      {
        type: "learn",
        heading: "First Things First...",
        text: "Accidentally clicking a scam link does not automatically mean you've been hacked. Many people accidentally click suspicious links every day. The important thing is what you do next. Instead of panicking:",
        bullets: ["Stay calm", "Stop interacting with the website", "Don't enter any personal information", "Close the webpage"],
        footer: "The sooner you act, the better."
      },
      {
        type: "learn",
        heading: "Situation A: You Clicked but Didn't Type Anything",
        text: "This is usually less serious. You should:",
        bullets: ["Close the page", "Don't click anything else", "Run a security scan if you have antivirus software", "Stay alert for unusual activity"]
      },
      {
        type: "learn",
        heading: "Situation B: You Entered a Password",
        text: "This is more serious. You should:",
        bullets: ["Change that password immediately", "Change it anywhere else you used the same password", "Turn on two-factor authentication (2FA) if available"]
      },
      {
        type: "learn",
        heading: "Situation C: You Entered a Debit or Credit Card Number",
        text: "You should:",
        bullets: ["Contact your bank or credit card company immediately", "Explain what happened", "Ask if they recommend freezing or replacing your card", "Watch your account for unfamiliar charges"]
      },
      {
        type: "learn",
        heading: "Situation D: You Entered Your Social Security Number or Other Sensitive Information",
        text: "You should:",
        bullets: ["Monitor your accounts carefully", "Consider placing a fraud alert or freezing your credit", "Report identity theft if needed"]
      },
      {
        type: "learn",
        heading: "What NOT to Do",
        text: "After clicking a scam:",
        bullets: ["Don't keep clicking around the website", "Don't download files from the page", "Don't enter more information", "Don't ignore the situation if you shared sensitive information"],
        footer: "Taking action quickly can make a big difference."
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You accidentally click a suspicious link but immediately realize it's fake. What should you do first?",
        options: ["Close the webpage.", "Enter your email to \"unsubscribe.\"", "Keep clicking to see what happens.", "Download the file it offers."],
        correctIndex: 0
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You accidentally typed your email password into a fake login page. What should you do?",
        options: ["Wait a few days.", "Ignore it.", "Change your password immediately and enable 2FA if available.", "Use the same password everywhere."],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You entered your debit card number on a fake shopping website. What should you do?",
        options: ["Buy another item.", "Wait until next month.", "Contact your bank or card issuer immediately.", "Post about it on social media first."],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You clicked a suspicious link but didn't type any information. What is the safest next step?",
        options: ["Click it again to double-check.", "Close the page and monitor your device.", "Enter your phone number to be safe.", "Ignore everything forever."],
        correctIndex: 1,
        explanation: "Acting quickly helps reduce the chance that scammers can misuse your information."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Phishing Link", back: "A fake link designed to steal your information." },
          { front: "Change Password", back: "Replace your old password with a new, strong one if you think it may have been stolen." },
          { front: "Monitor Your Account", back: "Regularly check for unusual charges or activity." },
          { front: "Sensitive Information", back: "Information like passwords, Social Security numbers, banking details, or credit card numbers." },
          { front: "Stay Calm", back: "Taking quick, thoughtful action is more effective than panicking." }
        ]
      },
      {
        type: "match",
        title: "Match the Situation",
        pairs: [
          { word: "Clicked a suspicious link", match: "Close the webpage" },
          { word: "Entered your password", match: "Change your password immediately" },
          { word: "Entered your credit card number", match: "Contact your bank or card issuer" },
          { word: "Entered your Social Security number", match: "Consider a fraud alert or credit freeze" },
          { word: "Unsure what happened", match: "Ask a trusted family member or professional for help" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Close", "Password", "Bank", "Calm"],
        questions: [
          { text: "If you click a suspicious link, first ______ the webpage.", answer: "Close" },
          { text: "If you entered your login information, change your ______ immediately.", answer: "Password" },
          { text: "If you entered your debit or credit card number, contact your ______.", answer: "Bank" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret receives an email saying: \"Your package couldn't be delivered. Click here to update your payment information.\" She clicks the link but realizes the website looks strange before entering anything. What should she do?",
        options: ["Enter her credit card number anyway.", "Keep exploring the website.", "Close the webpage and avoid interacting with it further.", "Share the link with friends."],
        correctIndex: 2,
        explanation: "Since she didn't provide any information, closing the page is the safest first step."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert accidentally enters his email password into a fake website. What should he do first?",
        options: ["Wait until tomorrow.", "Continue browsing.", "Change his password immediately and enable 2FA if available.", "Create another email account and ignore the old one."],
        correctIndex: 2,
        explanation: "The faster you change your password, the less time scammers have to misuse it."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda accidentally enters her credit card number into a fake shopping website. She notices a few minutes later. What should she do?",
        options: ["Wait to see if anything happens.", "Buy another item from the website.", "Contact her credit card company or bank immediately to report what happened.", "Delete her browser history and do nothing else."],
        correctIndex: 2,
        explanation: "Reporting it quickly gives your bank the best chance to protect your account."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "If you clicked a scam, remember these four steps:",
        bullets: ["Stop interacting with the website", "Think about what information you shared", "Protect your accounts by changing passwords or contacting your bank if needed", "Ask for help if you're unsure what to do"],
        footer: "Mistakes happen. What matters most is responding quickly and calmly."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          { label: "Safer Choices", items: ["Close suspicious websites immediately", "Change compromised passwords", "Contact your bank after sharing card information", "Monitor your accounts for unusual activity"] },
          { label: "Less Safe Choices", items: ["Keep clicking around the scam website", "Ignore stolen passwords", "Wait weeks before checking your bank account", "Download files from suspicious websites"] }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You click a suspicious email link but don't enter any information.",
        options: ["Keep browsing the website.", "Download a file.", "Close the webpage and monitor for any unusual activity.", "Click the link again."],
        correctIndex: 2,
        explanation: "Closing the page limits further interaction with the suspicious site."
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You aren't sure whether the website was fake.",
        options: ["Assume everything is fine.", "Enter more information to check.", "Stop using the website and ask a trusted family member, friend, or professional for help if you're unsure.", "Download everything on the page."],
        correctIndex: 2,
        explanation: "When you're uncertain, it's always safer to stop and get help before taking any more actions."
      }
    ],
    quiz: [
      { question: "What should you do first after realizing you've clicked a suspicious link?", options: ["Keep browsing the website.", "Download any files it offers.", "Close the webpage.", "Share it with your friends."], correctIndex: 2 },
      { question: "Which actions are appropriate if you entered your password on a fake website?", options: ["Keep the same password to avoid confusion", "Change your password immediately, turn on 2FA, update it anywhere else you used it, and monitor your account"], correctIndex: 1 },
      { question: "True or False: Clicking a suspicious link always means your device has been hacked.", options: ["True", "False"], correctIndex: 1 },
      { question: "If you entered your debit or credit card number into a scam website, contact your ______ immediately.", options: ["Bank", "Close", "Camera"], correctIndex: 0 },
      { question: "Linda entered her Social Security number into a fake website. What should she consider doing?", options: ["Ignore it.", "Keep entering more information.", "Monitor her accounts and consider placing a fraud alert or freezing her credit.", "Change her phone wallpaper."], correctIndex: 2 },
      { question: "What is the best attitude to have after accidentally clicking a scam?", options: ["Panic immediately.", "Ignore the situation.", "Stay calm and take the appropriate safety steps.", "Assume nothing can be done."], correctIndex: 2 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 1: What to Do If You Clicked a Scam!",
      learned: [
        "Stay calm after clicking a suspicious link.",
        "Know the immediate steps to take.",
        "Understand when to change passwords or contact your bank.",
        "Know when to ask for help."
      ],
      next: "What to Do If Money Was Stolen"
    }
  },

  // ============================================================
  // LESSON 7.2
  // ============================================================
  {
    id: "money-stolen",
    track: "literacy",
    phase: 7,
    order: 53,
    lessonNumber: "7.2",
    title: "What to Do If Money Was Stolen",
    badge: "Fraud Fighter",
    xp: 20,
    goals: [
      "Recognize signs that money has been stolen.",
      "Know what to do immediately.",
      "Contact their bank or credit card company.",
      "Protect their accounts from additional fraud.",
      "Understand why acting quickly is important."
    ],
    blocks: [
      {
        type: "learn",
        heading: "You Notice a Charge You Didn't Make...",
        text: "Imagine you check your bank account and see a coffee shop charge for $4.50 that you didn't make. Then you notice an electronics store charge for $689.99 that you definitely didn't make. This is called an unauthorized transaction - a purchase or withdrawal you didn't approve.",
        footer: "The faster you act, the easier it is for your bank to help protect your money. Don't wait to \"see if it fixes itself.\""
      },
      {
        type: "learn",
        heading: "Step 1: Contact Your Bank Immediately",
        text: "If you notice money missing, call your bank or credit card company using the phone number on the back of your card or from their official website. Tell them:",
        bullets: ["You found a charge you didn't make", "When you noticed it", "Whether your card is still in your possession"],
        footer: "The bank may lock your card, issue a replacement card, investigate the charges, or help recover your money if possible."
      },
      {
        type: "learn",
        heading: "Step 2: Protect Your Accounts",
        text: "After contacting your bank:",
        bullets: ["Change your online banking password", "Turn on two-factor authentication (2FA), if available", "Review recent transactions", "Check if any other accounts were affected"],
        footer: "If you used the same password elsewhere, change those passwords too."
      },
      {
        type: "learn",
        heading: "Step 3: Monitor Your Accounts",
        text: "Even after reporting the fraud:",
        bullets: ["Check your account regularly for new charges", "Read your monthly bank statements", "Respond quickly if you notice anything unusual"],
        footer: "Sometimes scammers try a small purchase first (like $1.00 or $2.00) before attempting a larger one."
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You notice a $250 purchase you didn't make.",
        options: ["Wait until next month.", "Ignore it.", "Contact your bank immediately.", "Buy something else with your card."],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "After reporting the fraud, what should you do?",
        options: ["Never check your account again.", "Continue using the same password.", "Change your banking password and monitor your account.", "Throw away your phone."],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "Your bank freezes your card after suspicious activity. What should you do?",
        options: ["Work with the bank to receive a replacement card.", "Tell them to ignore the fraud.", "Post your card number online.", "Continue trying to use the frozen card."],
        correctIndex: 0
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You notice a $1.00 charge you don't recognize.",
        options: ["Ignore it because it's only $1.", "Contact your bank if you don't recognize the charge.", "Spend more money before your card stops working.", "Cancel your internet service."],
        correctIndex: 1,
        explanation: "Scammers sometimes test whether a card works by making very small purchases before attempting larger ones."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Unauthorized Transaction", back: "A purchase or withdrawal you didn't approve." },
          { front: "Fraud", back: "Using someone else's money or information without permission." },
          { front: "Bank Fraud Department", back: "The team that investigates suspicious activity on your account." },
          { front: "Replacement Card", back: "A new debit or credit card issued after fraud or loss." },
          { front: "Monitor", back: "Check your account regularly for unusual activity." }
        ]
      },
      {
        type: "match",
        title: "Match the Situation",
        pairs: [
          { word: "Unknown charge on your card", match: "Contact your bank" },
          { word: "Banking password may be stolen", match: "Change your password" },
          { word: "Fraud reported", match: "Monitor your account" },
          { word: "Bank freezes your card", match: "Request a replacement card" },
          { word: "Small charge you don't recognize", match: "Contact your bank if it's unfamiliar" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Bank", "Password", "Monitor", "Fraud"],
        questions: [
          { text: "If money is stolen from your account, contact your ______ immediately.", answer: "Bank" },
          { text: "After fraud, change your online banking ______.", answer: "Password" },
          { text: "Continue to ______ your account after reporting the fraud.", answer: "Monitor" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret checks her credit card statement and sees a $985 furniture purchase she didn't make. What should she do first?",
        options: ["Wait a week to see if it disappears.", "Call the furniture store.", "Contact her credit card company immediately.", "Close her email account."],
        correctIndex: 2,
        explanation: "Your card issuer can stop additional charges and begin investigating right away."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert notices two small charges - $1.25 and $2.00 - that he doesn't recognize. What should he do?",
        options: ["Ignore them because they're small.", "Spend more money before his card is blocked.", "Contact his bank to ask about the unfamiliar charges.", "Delete his banking app."],
        correctIndex: 2,
        explanation: "Small charges can sometimes be \"test transactions\" made by scammers."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda reports fraud to her bank. The bank cancels her debit card and says a new one will arrive in a few days. What should she do?",
        options: ["Keep using the canceled card.", "Give her old card to a friend.", "Wait for the new card and update any automatic payments when it arrives.", "Ignore messages from the bank."],
        correctIndex: 2,
        explanation: "Once a card is canceled, it should no longer be used."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "If you think money was stolen:",
        bullets: ["Contact your bank or credit card company immediately", "Change your banking password", "Turn on 2FA if available", "Check recent transactions", "Continue monitoring your accounts"],
        footer: "The sooner you report fraud, the sooner your bank can help protect your account."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          { label: "Safer Choices", items: ["Report unfamiliar charges right away", "Review your bank statements", "Change your banking password after fraud", "Monitor your account regularly"] },
          { label: "Less Safe Choices", items: ["Ignore unfamiliar charges", "Continue using a canceled card", "Share your banking password", "Wait weeks before contacting your bank"] }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You notice a $742.18 purchase you didn't make.",
        options: ["Ignore it.", "Wait until next month.", "Contact your bank or credit card company immediately.", "Buy something else with your card."],
        correctIndex: 2,
        explanation: "Large unauthorized purchases should be reported as soon as possible."
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You find a charge for $3.49 that you don't recognize.",
        options: ["Ignore it because it's a small amount.", "Assume someone in your family made it.", "Contact your bank if you can't identify the charge.", "Wait until more money disappears."],
        correctIndex: 2,
        explanation: "Even small unfamiliar charges can be warning signs of fraud."
      }
    ],
    quiz: [
      { question: "What should you do first if you notice a charge you didn't make?", options: ["Wait a few days.", "Delete your banking app.", "Contact your bank or credit card company.", "Buy something with the same card."], correctIndex: 2 },
      { question: "Which actions should you take after reporting fraud?", options: ["Keep using the same password everywhere", "Change your password, turn on 2FA, monitor your account, and review recent transactions"], correctIndex: 1 },
      { question: "True or False: Small unfamiliar charges should always be ignored because they aren't important.", options: ["True", "False"], correctIndex: 1 },
      { question: "If you notice an unauthorized transaction, contact your ______ immediately.", options: ["Bank", "Password", "Camera"], correctIndex: 0 },
      { question: "Your bank cancels your debit card after fraud. What should you do?", options: ["Continue using the canceled card.", "Ignore the bank.", "Activate the replacement card when it arrives and update your automatic payments.", "Give the canceled card to a friend."], correctIndex: 2 },
      { question: "Why is it important to act quickly after discovering stolen money?", options: ["To get more reward points.", "So your phone charges faster.", "Because your bank can help stop additional fraud and begin investigating.", "Because the charges disappear automatically."], correctIndex: 2 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 2: What to Do If Money Was Stolen!",
      learned: [
        "Recognize signs that money has been stolen.",
        "Contact your bank or credit card company quickly.",
        "Protect your accounts from additional fraud.",
        "Understand why acting quickly is important."
      ],
      next: "Who to Call"
    }
  },

  // ============================================================
  // LESSON 7.3
  // ============================================================
  {
    id: "who-to-call",
    track: "literacy",
    phase: 7,
    order: 54,
    lessonNumber: "7.3",
    title: "Who to Call",
    badge: "Help Seeker",
    xp: 20,
    goals: [
      "Know who to contact after different types of scams.",
      "Choose the correct organization based on what happened.",
      "Understand when to contact banks, companies, family members, or law enforcement.",
      "Feel confident taking action instead of waiting."
    ],
    blocks: [
      {
        type: "learn",
        heading: "You're Not Alone",
        text: "If you've been scammed, you don't have to solve everything by yourself. Different scams require different people to help. The most important thing is to contact the right person as soon as possible. The faster you act, the more likely you can protect your money and personal information."
      },
      {
        type: "learn",
        heading: "Your Bank or Credit Card Company",
        text: "Call immediately if you notice charges you didn't make, you gave someone your card number, or your banking account was accessed without permission.",
        bullets: ["Freeze your card", "Stop new transactions", "Send a replacement card", "Investigate the fraud"]
      },
      {
        type: "learn",
        heading: "The Company That Owns Your Account",
        text: "Contact the company if someone accessed your email, your Facebook account was hacked, your Amazon account was compromised, or someone changed your password. The company can help you:",
        bullets: ["Recover your account", "Secure your account", "Change your password", "Log out unknown devices"]
      },
      {
        type: "learn",
        heading: "Trusted Family Member or Friend",
        text: "If you're unsure what happened: tell someone you trust, ask them to help review messages or websites, and ask them to stay with you while contacting your bank or changing passwords.",
        footer: "Scammers often want you to feel rushed and isolated. Talking to someone you trust can help you make safe decisions."
      },
      {
        type: "learn",
        heading: "Local Police",
        text: "Contact your local police if money was stolen, your identity was stolen, someone threatened you, or a crime occurred in person.",
        footer: "Police reports may also help when working with banks or insurance companies."
      },
      {
        type: "learn",
        heading: "Emergency Services (911)",
        text: "Only call 911 if there is an immediate emergency, such as someone in immediate danger, a crime happening right now, or a medical or safety emergency.",
        footer: "Most online scams are not 911 emergencies, but they should still be reported to the appropriate organization."
      },
      {
        type: "choice",
        title: "Who Should You Contact?",
        text: "You notice three purchases on your debit card that you didn't make.",
        options: ["Your neighbor", "Facebook", "Your bank", "The grocery store"],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "Who Should You Contact?",
        text: "Someone changed the password to your email account.",
        options: ["The weather station", "Your bank", "Your email provider", "Your dentist"],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "Who Should You Contact?",
        text: "Someone pretending to be your grandson asks for money. You aren't sure if it's real.",
        options: ["Send the money.", "Call your grandson using a phone number you already know.", "Ignore it forever.", "Post about it online first."],
        correctIndex: 1
      },
      {
        type: "choice",
        title: "Who Should You Contact?",
        text: "Someone breaks into your house and steals your computer.",
        options: ["Your cable company", "Facebook", "Local police", "A restaurant"],
        correctIndex: 2,
        explanation: "Knowing who to contact saves valuable time."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Bank", back: "Call if money or card information may have been stolen." },
          { front: "Email Provider", back: "Helps recover hacked email accounts." },
          { front: "Trusted Family Member", back: "Someone who can help you make safe decisions if you're unsure what to do." },
          { front: "Local Police", back: "Respond to crimes and identity theft situations." },
          { front: "911", back: "For immediate emergencies involving danger to people or property." }
        ]
      },
      {
        type: "match",
        title: "Match the Situation",
        pairs: [
          { word: "Unauthorized bank charges", match: "Your bank" },
          { word: "Hacked Facebook account", match: "Facebook support" },
          { word: "Forgotten email password after a scam", match: "Your email provider" },
          { word: "Identity theft", match: "Local police and your financial institutions" },
          { word: "Unsure if a family emergency message is real", match: "Call the family member directly" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Bank", "Police", "Provider", "Family"],
        questions: [
          { text: "If someone steals money from your account, call your ______.", answer: "Bank" },
          { text: "If your email account is hacked, contact your email ______.", answer: "Provider" },
          { text: "If you're confused about a suspicious message, talk to a trusted ______ member or friend.", answer: "Family" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret receives a call from someone claiming to be her bank. They ask her to transfer all of her money to a \"safe account.\" She hangs up because it sounds suspicious. What should she do next?",
        options: ["Call the number that just called her.", "Transfer the money anyway.", "Call her bank using the phone number on the back of her debit card or from the bank's official website.", "Wait a month to see what happens."],
        correctIndex: 2,
        explanation: "Always contact your bank using a trusted phone number, not one provided by a suspicious caller."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert accidentally gives his email password to a scam website. What should he do first?",
        options: ["Buy a new computer.", "Call the electric company.", "Contact his email provider and change his password immediately.", "Delete all his emails."],
        correctIndex: 2,
        explanation: "Your email account is often connected to many other accounts, making it important to secure right away."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda receives a text from her daughter asking for $800. The message says: \"Don't call me. My phone is broken.\" What should Linda do?",
        options: ["Send the money immediately.", "Reply asking for her bank account.", "Call her daughter using the phone number she already has or contact another trusted family member to verify the message.", "Ignore it forever."],
        correctIndex: 2,
        explanation: "Scammers often tell victims not to call because they don't want to be discovered."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Consider saving these contacts in your phone: your bank, credit card company, a trusted family member, your primary doctor, and the local police non-emergency number.",
        footer: "If something happens, you'll already know who to call."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          { label: "Safer Choices", items: ["Call your bank using the number on your card", "Contact companies through their official websites or apps", "Ask a trusted family member for help", "Verify emergency requests before sending money"] },
          { label: "Less Safe Choices", items: ["Call phone numbers from suspicious text messages", "Send money before verifying", "Keep scams secret because you're embarrassed", "Assume you'll figure everything out later"] }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You receive a suspicious call claiming to be from your bank.",
        options: ["Give them your account number.", "Stay on the call.", "Hang up and call your bank using the official number on your card or their official website.", "Send them your password."],
        correctIndex: 2,
        explanation: "Always contact organizations using contact information you know is legitimate."
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "Someone sends you a message saying they're a family member in trouble and asks you not to call them.",
        options: ["Send the money.", "Believe the message.", "Call the family member using a phone number you already know to verify the story.", "Ignore all family messages forever."],
        correctIndex: 2,
        explanation: "Verifying directly can stop many impersonation scams."
      }
    ],
    quiz: [
      { question: "Who should you contact first if you notice unauthorized charges on your debit card?", options: ["Your internet provider", "A friend", "Your bank", "Your local library"], correctIndex: 2 },
      { question: "Which situations should be reported to your bank?", options: ["A friend sharing vacation photos", "Unauthorized charges, sharing your card number with a scam site, or your account being accessed without permission"], correctIndex: 1 },
      { question: "True or False: If someone claiming to be your family member asks for money and tells you not to call them, you should verify the request by contacting them another way.", options: ["True", "False"], correctIndex: 0 },
      { question: "If your email account is hacked, contact your email ______.", options: ["Provider", "Bank", "Camera"], correctIndex: 0 },
      { question: "A caller says they're from your bank and asks you to move your money to a \"safe account.\" What should you do?", options: ["Follow their instructions.", "Give them your online banking password.", "Hang up and call your bank using the official phone number on your debit or credit card.", "Send them your Social Security number."], correctIndex: 2 },
      { question: "What is the best reason to ask a trusted family member or friend for help after a possible scam?", options: ["They can always recover your money.", "They know every answer.", "They can help you think through the situation and make safer decisions.", "They should talk to the scammer for you."], correctIndex: 2 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 3: Who to Call!",
      learned: [
        "Know who to contact after different types of scams.",
        "Choose the correct organization based on what happened.",
        "Understand when to contact banks, companies, family, or police.",
        "Feel confident taking action instead of waiting."
      ],
      next: "Freezing Your Credit"
    }
  },

  // ============================================================
  // LESSON 7.4
  // ============================================================
  {
    id: "credit-freeze",
    track: "literacy",
    phase: 7,
    order: 55,
    lessonNumber: "7.4",
    title: "Freezing Your Credit",
    badge: "Identity Protector",
    xp: 20,
    goals: [
      "Understand what a credit freeze is.",
      "Know when to freeze their credit.",
      "Learn how a credit freeze protects them.",
      "Know when to remove or temporarily lift a freeze.",
      "Understand that a credit freeze is free."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Is a Credit Freeze?",
        text: "Imagine someone steals your personal information, like your Social Security number, and tries to open a new credit card or loan in your name. A credit freeze helps stop this. A credit freeze prevents most lenders from viewing your credit report - if they can't view your credit, they usually won't approve a new credit card or loan. Think of it like putting a lock on your credit file. Even if someone has your information, a freeze makes it much harder for them to open new accounts in your name."
      },
      {
        type: "learn",
        heading: "What a Credit Freeze Does",
        text: "A credit freeze can help protect you if your Social Security number was stolen, your identity was stolen, you were part of a data breach, or you believe someone is trying to open accounts in your name.\n\nA credit freeze does NOT lock your bank account, cancel your credit cards, lower your credit score, or stop you from using your existing credit cards."
      },
      {
        type: "learn",
        heading: "When Should You Freeze Your Credit?",
        text: "Consider freezing your credit if:",
        bullets: ["You shared sensitive personal information with a scammer", "Your identity has been stolen", "You receive bills for accounts you didn't open", "A company tells you your information was exposed in a data breach"],
        footer: "If you're not sure whether you need a credit freeze, you can contact your bank or the credit bureaus for guidance."
      },
      {
        type: "learn",
        heading: "Can You Remove the Freeze?",
        text: "Yes! A credit freeze is not permanent. If you apply for a mortgage, a car loan, or a new credit card, you can temporarily lift the freeze so the lender can check your credit. Afterward, you can freeze it again."
      },
      {
        type: "truefalse",
        title: "True or False?",
        questions: [
          { text: "A credit freeze lowers your credit score.", answer: false },
          { text: "A credit freeze helps prevent criminals from opening new credit accounts in your name.", answer: true },
          { text: "A credit freeze cancels all of your credit cards.", answer: false },
          { text: "You can remove or temporarily lift a credit freeze later.", answer: true }
        ]
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Credit Freeze", back: "A free security tool that helps prevent new credit accounts from being opened in your name." },
          { front: "Identity Theft", back: "When someone uses your personal information without your permission." },
          { front: "Credit Report", back: "A record of your borrowing and repayment history." },
          { front: "Data Breach", back: "When personal information is exposed because a company or organization was hacked or experienced a security incident." },
          { front: "Lift a Freeze", back: "Temporarily allow lenders to access your credit report when you apply for new credit." }
        ]
      },
      {
        type: "match",
        title: "Match the Situation",
        pairs: [
          { word: "Identity stolen", match: "Freeze your credit" },
          { word: "Applying for a new credit card", match: "Temporarily lift the freeze" },
          { word: "Existing credit card", match: "Continue using it normally" },
          { word: "Data breach exposed your Social Security number", match: "Consider freezing your credit" },
          { word: "Concern about identity theft", match: "Freeze your credit" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Freeze", "Credit", "Score", "Identity"],
        questions: [
          { text: "A credit ______ helps prevent new accounts from being opened in your name.", answer: "Freeze" },
          { text: "A credit freeze does not lower your credit ______.", answer: "Score" },
          { text: "A credit freeze helps protect you from ______ theft.", answer: "Identity" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret learns that a large company where she has an account experienced a data breach. The company says her Social Security number may have been exposed. What should Margaret do?",
        options: ["Ignore the notice.", "Apply for a new credit card.", "Consider placing a credit freeze to help protect against identity theft.", "Delete all her emails."],
        correctIndex: 2,
        explanation: "A credit freeze can help stop criminals from opening new credit accounts in your name."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert wants to apply for a car loan, but his credit is frozen. What should he do?",
        options: ["Cancel all his credit cards.", "Leave the freeze in place forever.", "Temporarily lift the freeze so the lender can access his credit report.", "Create a new Social Security number."],
        correctIndex: 2,
        explanation: "A credit freeze is flexible - you can lift it and freeze it again later."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda notices a credit card account on her credit report that she never opened. What should she do?",
        options: ["Ignore it because it might disappear.", "Open another credit card.", "Contact the credit card company, report the suspicious account, and consider freezing her credit.", "Close her email account."],
        correctIndex: 2,
        explanation: "An account you don't recognize could be a sign of identity theft."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "A credit freeze is a smart safety tool. You should consider freezing your credit if your Social Security number was stolen, your identity was stolen, you were affected by a data breach, or you discover someone opened an account in your name.",
        footer: "A credit freeze is free and can be lifted whenever you need to apply for new credit."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          { label: "Safer Choices", items: ["Freeze your credit after identity theft", "Lift the freeze only when applying for new credit", "Continue monitoring your credit and financial accounts", "Keep your freeze in place if you don't need new credit"] },
          { label: "Less Safe Choices", items: ["Ignore signs of identity theft", "Assume a credit freeze hurts your credit score", "Think a freeze protects your bank account from every scam", "Leave suspicious accounts unreported"] }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "A company tells you your Social Security number may have been exposed in a data breach.",
        options: ["Do nothing.", "Apply for several new credit cards.", "Consider freezing your credit to help protect yourself.", "Share the email with strangers online."],
        correctIndex: 2,
        explanation: "A credit freeze can help stop criminals from opening new credit accounts using your information."
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You already froze your credit but now need a new credit card.",
        options: ["You're permanently locked out of getting credit.", "Your credit score will disappear.", "Temporarily lift the freeze, apply for the card, then freeze it again if you choose.", "Cancel every credit card you own."],
        correctIndex: 2,
        explanation: "A credit freeze is designed to be temporary when you need access to new credit."
      }
    ],
    quiz: [
      { question: "What is the main purpose of a credit freeze?", options: ["To lower your credit card interest rate.", "To improve your credit score.", "To help prevent criminals from opening new credit accounts in your name.", "To close all your bank accounts."], correctIndex: 2 },
      { question: "Which situations might make a credit freeze a good idea?", options: ["Getting a routine credit card statement", "Your identity was stolen, your Social Security number was exposed in a breach, or someone opened an account in your name"], correctIndex: 1 },
      { question: "True or False: A credit freeze prevents you from using your existing credit cards.", options: ["True", "False"], correctIndex: 1 },
      { question: "A credit ______ helps stop criminals from opening new accounts in your name.", options: ["Freeze", "Bank", "Camera"], correctIndex: 0 },
      { question: "You want to apply for a mortgage, but your credit is frozen. What should you do?", options: ["Cancel all your credit cards.", "Leave the freeze in place and hope the lender can see your credit.", "Temporarily lift the freeze so the lender can access your credit report.", "Open a new bank account instead."], correctIndex: 2 },
      { question: "Which statement about a credit freeze is correct?", options: ["It lowers your credit score.", "It costs hundreds of dollars.", "It closes all your financial accounts.", "It is free and can be lifted when you need to apply for new credit."], correctIndex: 3 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 4: Freezing Your Credit!",
      learned: [
        "Understand what a credit freeze is.",
        "Know when to freeze your credit.",
        "Know how to temporarily lift a freeze.",
        "Understand that a credit freeze is free."
      ],
      next: "Changing Passwords After a Scam"
    }
  },

  // ============================================================
  // LESSON 7.5
  // ============================================================
  {
    id: "password-after-scam",
    track: "literacy",
    phase: 7,
    order: 56,
    lessonNumber: "7.5",
    title: "Changing Passwords After a Scam",
    badge: "Password Protector",
    xp: 20,
    goals: [
      "Know when a password should be changed.",
      "Create a new strong password.",
      "Avoid reusing old passwords.",
      "Turn on two-factor authentication (2FA).",
      "Understand which accounts should be updated first."
    ],
    blocks: [
      {
        type: "learn",
        heading: "When Should You Change Your Password?",
        text: "Change your password immediately if you entered it on a suspicious website, you clicked a fake login page, you received a message saying your account was accessed from a new device, you shared it with someone by mistake, or a company tells you your account was part of a data breach.",
        footer: "The sooner you change it, the less time a scammer has to use it."
      },
      {
        type: "learn",
        heading: "Which Accounts Should You Change First?",
        text: "Start with the accounts that are most important. First, your email account - your email is the master key to many other accounts. If someone controls your email, they may be able to reset passwords for your bank, shopping sites, and social media.\n\nSecond, banking and financial accounts: online banking, credit card accounts, payment apps.\n\nThird, shopping and social media accounts: Amazon, Facebook, Instagram, YouTube."
      },
      {
        type: "learn",
        heading: "Create a Strong New Password",
        text: "A strong password is long (12+ characters), unique, hard to guess, and not used on any other account.\n\nGood examples: Sunset!CoffeeTrain42, BlueRiver$Garden88, Piano#MapleCloud71.\n\nWeak examples: password123, 123456, qwerty, your birthday, your pet's name."
      },
      {
        type: "learn",
        heading: "Never Reuse Passwords",
        text: "If your old password was RoseGarden2025, don't change it to RoseGarden2026 or RoseGarden2027! Create a completely different password instead."
      },
      {
        type: "learn",
        heading: "Turn On Two-Factor Authentication (2FA)",
        text: "2FA adds an extra layer of protection. After entering your password, you'll also enter a code sent to your phone or generated by an app. This means: if your password is stolen, that's not enough - a scammer would also need your phone or authentication app.",
        footer: "Whenever available, turn on 2FA."
      },
      {
        type: "choice",
        title: "Which Password Is Strongest?",
        text: "Choose the strongest password.",
        options: ["password123", "12345678", "Sunset!CoffeeTrain42", "mary1948"],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "Which Password Is Strongest?",
        text: "Choose the strongest password.",
        options: ["qwerty", "abc123", "football", "BlueRiver$Garden88"],
        correctIndex: 3
      },
      {
        type: "choice",
        title: "Which Password Is Strongest?",
        text: "Choose the strongest password.",
        options: ["your birthday", "your phone number", "your pet's name", "Piano#MapleCloud71"],
        correctIndex: 3
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You used RoseGarden2025 on a fake website. What should you do?",
        options: ["Keep using it.", "Change it to RoseGarden2026.", "Create a completely different password.", "Add one exclamation mark and keep it."],
        correctIndex: 2,
        explanation: "Long, unique passwords are much harder for scammers to guess."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Strong Password", back: "A long, unique password that is hard to guess." },
          { front: "Unique Password", back: "A password used for only one account." },
          { front: "2FA", back: "Two-factor authentication, an extra security step after entering your password." },
          { front: "Data Breach", back: "When a company's stored information is exposed or stolen." },
          { front: "Password Reuse", back: "Using the same password on multiple accounts." }
        ]
      },
      {
        type: "match",
        title: "Match the Situation",
        pairs: [
          { word: "Entered password on a fake website", match: "Change it immediately" },
          { word: "Used the same password on multiple accounts", match: "Change it everywhere" },
          { word: "Important account like email", match: "Update it first" },
          { word: "2FA is available", match: "Turn it on" },
          { word: "Old password was exposed", match: "Create a completely new password" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Email", "Unique", "Password", "2FA"],
        questions: [
          { text: "Your ______ account should usually be updated first.", answer: "Email" },
          { text: "A strong password should be ______ and not used on other accounts.", answer: "Unique" },
          { text: "Turning on ______ adds an extra security step after entering your password.", answer: "2FA" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret accidentally enters her email password on a fake website. What should she do first?",
        options: ["Wait until tomorrow.", "Change her Facebook password first.", "Change her email password immediately and turn on 2FA if available.", "Create a new email address and ignore the old one."],
        correctIndex: 2,
        explanation: "Your email account is often the most important account to secure first."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert uses the same password for his email, bank, and shopping accounts. That password was exposed in a scam. What should he do?",
        options: ["Change only one account.", "Keep using the password until something happens.", "Change the password on all accounts that used it and make each new password unique.", "Add \"123\" to the end of the old password."],
        correctIndex: 2,
        explanation: "Reusing passwords means one stolen password can unlock multiple accounts."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda creates the new password \"Linda1955\". Is this a strong password?",
        options: ["Yes", "No"],
        correctIndex: 1,
        explanation: "It uses her name and birth year, which are easier for scammers to guess. A better password would be something like BlueRiver$Garden88."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Your password recovery checklist: change the exposed password immediately, update any other accounts that used the same password, create a completely new password, turn on 2FA, and watch for suspicious login alerts.",
        footer: "Think of passwords like house keys: if a key is lost or copied, replace the lock, not just the keychain."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          { label: "Safer Choices", items: ["Use a unique password for each account", "Turn on 2FA", "Change passwords immediately after a scam", "Use long passwords with a mix of words, numbers, and symbols"] },
          { label: "Less Safe Choices", items: ["Reuse the same password everywhere", "Use your birthday", "Make tiny changes to an exposed password", "Ignore data breach notifications"] }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You entered your banking password on a fake website.",
        options: ["Keep using it.", "Wait until the bank contacts you.", "Change the password immediately and contact your bank if needed.", "Write the password on paper and keep it."],
        correctIndex: 2,
        explanation: "A stolen banking password should be changed right away."
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You realize your email and Facebook use the same password.",
        options: ["That's fine.", "Change only Facebook.", "Change both passwords and make them different.", "Add one number to one of them."],
        correctIndex: 2
      }
    ],
    quiz: [
      { question: "Which account should you usually secure first after a password is exposed?", options: ["Social media", "Streaming services", "Email", "Weather app"], correctIndex: 2 },
      { question: "Which are signs that you should change a password?", options: ["You received a routine newsletter", "You entered it on a suspicious website, shared it by mistake, got a data breach notice, or received an unfamiliar login alert"], correctIndex: 1 },
      { question: "True or False: Using the same password on multiple accounts is a safe practice.", options: ["True", "False"], correctIndex: 1 },
      { question: "A strong password should be ______ and used for only one account.", options: ["Unique", "Camera", "Browser"], correctIndex: 0 },
      { question: "You used the password RoseGarden2025 on a fake website. What should you do?", options: ["Keep using it.", "Change it to RoseGarden2026.", "Create a completely different password and update any accounts that used the old one.", "Add an exclamation mark and keep it."], correctIndex: 2 },
      { question: "What is the main benefit of two-factor authentication (2FA)?", options: ["It makes your internet faster.", "It removes the need for a password.", "It adds an extra security step after entering your password.", "It automatically changes your password every day."], correctIndex: 2 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 5: Changing Passwords After a Scam!",
      learned: [
        "Know when a password should be changed.",
        "Create a new strong, unique password.",
        "Turn on two-factor authentication (2FA).",
        "Understand which accounts should be updated first."
      ],
      next: "Reporting Scams to the FBI IC3"
    }
  },

  // ============================================================
  // LESSON 7.6
  // ============================================================
  {
    id: "reporting-ic3",
    track: "literacy",
    phase: 7,
    order: 57,
    lessonNumber: "7.6",
    title: "Reporting Scams to the FBI IC3",
    badge: "Scam Reporter",
    xp: 20,
    goals: [
      "Understand what the FBI Internet Crime Complaint Center (IC3) is.",
      "Know when a scam should be reported.",
      "Learn what information is helpful when making a report.",
      "Understand that reporting a scam can help protect others.",
      "Know that reporting a scam does not guarantee lost money will be recovered."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Is the FBI IC3?",
        text: "The FBI Internet Crime Complaint Center (IC3) is a website where people in the United States can report internet-related crimes and scams. Examples include online shopping scams, phishing emails and text messages, investment scams, romance scams, tech support scams, and identity theft.",
        footer: "Reporting a scam helps law enforcement identify patterns and investigate criminals. Even if you didn't lose money, your report may help prevent someone else from becoming a victim."
      },
      {
        type: "learn",
        heading: "When Should You Report a Scam?",
        text: "You should consider reporting a scam if:",
        bullets: ["Someone tried to steal your money", "You gave personal information to a scammer", "You lost money online", "Someone pretended to be a government agency or business", "You received a phishing email or text"],
        footer: "You don't need to know who the scammer is to file a report."
      },
      {
        type: "learn",
        heading: "What Information Should You Save?",
        text: "If it's safe to do so, keep the date the scam happened, emails or text messages, website addresses (URLs), phone numbers, the amount of money involved, and receipts or payment confirmations.",
        footer: "Don't keep communicating with the scammer just to collect more information. Only save what you already have."
      },
      {
        type: "learn",
        heading: "What Happens After You Report?",
        text: "After submitting a report, the FBI reviews the information, your report may be combined with similar reports, and the information may help investigators identify scam patterns.",
        footer: "Submitting a report does not guarantee that lost money will be recovered, but it can help law enforcement investigate and may protect future victims."
      },
      {
        type: "choice",
        title: "Should You Report It?",
        text: "You lost $800 in an online investment scam.",
        options: ["Yes, report it.", "No, it's too late."],
        correctIndex: 0
      },
      {
        type: "choice",
        title: "Should You Report It?",
        text: "You received a phishing email asking for your password but deleted it without responding.",
        options: ["You can still report it if you believe it was a scam.", "There's never a reason to report phishing attempts."],
        correctIndex: 0
      },
      {
        type: "choice",
        title: "Should You Report It?",
        text: "Someone pretending to be the IRS asked you to buy gift cards.",
        options: ["Report the scam.", "Ignore it and tell no one."],
        correctIndex: 0
      },
      {
        type: "choice",
        title: "Should You Report It?",
        text: "You accidentally clicked a suspicious link but didn't lose money.",
        options: ["You can still report suspicious online scams if appropriate.", "You must lose money before reporting."],
        correctIndex: 0,
        explanation: "Reporting suspicious activity helps law enforcement understand scam trends."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "IC3", back: "The FBI's Internet Crime Complaint Center for reporting internet-related crimes." },
          { front: "Phishing", back: "A scam that tries to steal your passwords or personal information." },
          { front: "Evidence", back: "Helpful information like emails, phone numbers, or receipts related to a scam." },
          { front: "Internet Scam", back: "A scam that happens online through websites, emails, texts, or social media." },
          { front: "Report", back: "Tell the appropriate organization about suspicious or criminal activity." }
        ]
      },
      {
        type: "match",
        title: "Match the Situation",
        pairs: [
          { word: "Phishing email", match: "Report if appropriate and delete it" },
          { word: "Lost money in an online scam", match: "Report to IC3 and contact your bank" },
          { word: "Fake online store", match: "Report the scam" },
          { word: "Suspicious text asking for passwords", match: "Report if appropriate and don't respond" },
          { word: "Fake government website", match: "Report the scam" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["IC3", "Evidence", "Money", "Report"],
        questions: [
          { text: "The FBI's Internet Crime Complaint Center is called ______.", answer: "IC3" },
          { text: "Emails, receipts, and screenshots can be useful ______ when reporting a scam.", answer: "Evidence" },
          { text: "If you lose ______ in an online scam, contact your bank immediately and consider reporting it to IC3.", answer: "Money" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret buys a kitchen appliance from a website she's never used before. The item never arrives, and the website disappears a week later. What should she do?",
        options: ["Order another one from the same website.", "Ignore it.", "Contact her credit card company or bank and consider reporting the scam to IC3.", "Keep emailing the scammer for months."],
        correctIndex: 2,
        explanation: "Reporting the scam and contacting your financial institution are important first steps."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert receives an email claiming to be from his bank asking him to \"verify\" his password. He realizes it's fake and deletes it. What should he do?",
        options: ["Reply with his password.", "Ignore all future emails forever.", "Delete the email and consider reporting the phishing attempt.", "Click the link to make sure it's fake."],
        correctIndex: 2,
        explanation: "Never click links or provide information in suspicious emails."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda receives a phone call from someone pretending to be a government agency demanding payment with gift cards. She hangs up without paying. What should she do?",
        options: ["Call them back.", "Buy the gift cards anyway.", "Report the scam if appropriate and tell trusted family or friends so they're aware of the scam.", "Give the caller her address."],
        correctIndex: 2,
        explanation: "Sharing information about scams with people you trust can help prevent others from becoming victims."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Before reporting a scam: save any emails or text messages, keep receipts or payment confirmations, write down dates and phone numbers if available, contact your bank immediately if money or financial information was involved, and don't continue communicating with the scammer."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          { label: "Safer Choices", items: ["Report internet scams", "Save helpful information about the scam", "Contact your bank if money was involved", "Stop communicating with the scammer"] },
          { label: "Less Safe Choices", items: ["Send more money to \"recover\" your original payment", "Click additional links from the scammer", "Delete important evidence before contacting your bank", "Assume reporting won't help anyone"] }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You paid $250 to a fake online store.",
        options: ["Buy another item.", "Wait six months.", "Contact your bank or credit card company and consider reporting the scam to IC3.", "Send the website more money."],
        correctIndex: 2,
        explanation: "Acting quickly gives your financial institution the best chance to help."
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You want to report an online scam. Which information would be helpful?",
        options: ["Your favorite TV show.", "The weather that day.", "Emails, text messages, website addresses, receipts, and phone numbers related to the scam.", "Your grocery list."],
        correctIndex: 2,
        explanation: "Details related to the scam can help investigators identify patterns and connect reports."
      }
    ],
    quiz: [
      { question: "What is IC3?", options: ["A computer virus.", "A password manager.", "The FBI's Internet Crime Complaint Center for reporting internet-related crimes.", "A social media website."], correctIndex: 2 },
      { question: "Which situations should you consider reporting to IC3?", options: ["Only crimes with a known suspect", "Online shopping scams, phishing emails, investment scams, and fake government impersonation scams"], correctIndex: 1 },
      { question: "True or False: You must lose money before you can report an internet scam.", options: ["True", "False"], correctIndex: 1 },
      { question: "Emails, receipts, and screenshots can serve as ______ when reporting a scam.", options: ["Evidence", "Camera", "Grocery"], correctIndex: 0 },
      { question: "What should you do if you paid money to a fake online store?", options: ["Keep shopping there.", "Wait a year before taking action.", "Contact your bank or credit card company immediately and consider reporting the scam to IC3.", "Send another payment."], correctIndex: 2 },
      { question: "Why is reporting internet scams important?", options: ["It guarantees your money will be returned.", "It automatically arrests the scammer.", "It helps law enforcement identify scam patterns and may help protect others.", "It permanently blocks the internet."], correctIndex: 2 }
    ],
    complete: {
      title: "Congratulations!",
      subtitle: "You completed Lesson 6: Reporting Scams to the FBI IC3!",
      learned: [
        "Understand what the FBI Internet Crime Complaint Center (IC3) is.",
        "Know when a scam should be reported.",
        "Learn what information is helpful when making a report.",
        "Understand that reporting a scam can help protect others."
      ],
      next: "Phase 7 Final Exam"
    }
  }
];

// ============================================================
// PHASE 7 FINAL EXAM
// ============================================================
export const phase7Exam = {
  id: "phase7-exam",
  track: "literacy",
  phase: 7,
  order: 58,
  title: "Phase 7 Final Exam: Emergency Skills",
  topics: [
    "What to Do If You Clicked a Scam",
    "What to Do If Money Was Stolen",
    "Who to Call",
    "Freezing Your Credit",
    "Changing Passwords After a Scam",
    "Reporting Scams to the FBI IC3"
  ],
  passingScore: 8,
  totalQuestions: 10,
  phaseBadge: "Digital Emergency Expert",
  phaseBadgeXp: 100,
  questions: [
    {
      question: "You accidentally entered your email password on a fake website. What should you do first?",
      options: ["Wait a few days to see what happens.", "Delete your email account.", "Change your email password immediately and enable 2FA if available.", "Buy antivirus software before changing anything."],
      correctIndex: 2,
      explanation: "Your email account should be secured immediately because it can be used to reset passwords for many other accounts."
    },
    {
      question: "Which of these are good first steps after discovering money was stolen from your bank account?",
      options: ["Wait to see if the bank notices on its own", "Contact your bank immediately, change your banking password, monitor your account, and turn on 2FA if available"],
      correctIndex: 1,
      explanation: "Quick action gives your bank the best chance to stop additional fraud."
    },
    {
      question: "True or False: A credit freeze prevents criminals from opening most new credit accounts in your name.",
      options: ["True", "False"],
      correctIndex: 0,
      explanation: "A credit freeze protects your credit file. It does not affect your existing credit cards or lower your credit score."
    },
    {
      question: "If someone steals your debit card information, contact your ______ immediately.",
      options: ["Bank", "Password", "Freeze"],
      correctIndex: 0,
      explanation: "Your bank can lock your card, investigate fraud, and issue a replacement if needed."
    },
    {
      question: "Someone claiming to be your grandson texts: \"I'm in trouble. Don't call me. Just send me $2,000.\" What should you do?",
      options: ["Send the money quickly.", "Reply asking for more details.", "Call your grandson using a phone number you already know to verify the story.", "Ignore all future messages forever."],
      correctIndex: 2,
      explanation: "Scammers often tell victims not to call because they don't want to be exposed."
    },
    {
      question: "Which password is the strongest?",
      options: ["password123", "Linda1950", "Sunshine2025", "BlueRiver$Garden88"],
      correctIndex: 3,
      explanation: "Strong passwords are long, unique, and difficult to guess."
    },
    {
      question: "You lose money in an online shopping scam. Which organization should you also consider reporting it to?",
      options: ["DMV", "USPS", "FBI Internet Crime Complaint Center (IC3)", "Weather Service"],
      correctIndex: 2,
      explanation: "IC3 collects reports of internet-related crimes and helps law enforcement identify scam patterns."
    },
    {
      question: "True or False: Small charges you don't recognize should always be ignored.",
      options: ["True", "False"],
      correctIndex: 1,
      explanation: "Scammers sometimes make small \"test charges\" before attempting larger fraudulent purchases."
    },
    {
      question: "Which actions help protect your accounts after a scam?",
      options: ["Keep the same passwords to avoid confusion", "Change exposed passwords, turn on 2FA, monitor your accounts, and contact your bank if payment information was shared"],
      correctIndex: 1,
      explanation: "These actions reduce the risk of additional fraud after a scam."
    },
    {
      question: "Which statement is the best advice if you think you've been scammed?",
      options: ["Panic because it's too late.", "Keep talking to the scammer until they explain.", "Ignore the situation and hope it goes away.", "Stay calm, stop communicating with the scammer, protect your accounts, and ask for help if needed."],
      correctIndex: 3,
      explanation: "The best response is to stay calm, secure your accounts, and contact the appropriate people or organizations."
    }
  ],
  results: [
    { minScore: 10, title: "Emergency Response Master", xp: 100, trophy: true, message: "Outstanding! You know exactly what to do if a scam happens, from the first click to reporting it." },
    { minScore: 8, title: "Emergency Ready", xp: 80, trophy: false, message: "Great work! You have strong emergency response skills for handling scams and fraud." },
    { minScore: 6, title: "Keep Practicing", xp: 40, trophy: false, message: "You're making excellent progress. Review the lessons you missed and try the exam again." },
    { minScore: 0, title: "Review Recommended", xp: 0, trophy: false, message: "Go back through the Phase 7 lessons and retake the exam when you're ready. Every lesson builds important skills for responding to scams." }
  ],
  nextPhase: "Section 2: Advanced Scam Protection"
};

export default phase7Lessons;
