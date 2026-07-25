// Everwise - Digital Literacy Track
// Phase 6: Social Media
// Biome: Orchard | Color: #7A8B4A
//
// All 7 lessons plus the Phase 6 Final Exam.
// Exports: phase6Lessons (array), phase6Exam (object)

export const phase6Lessons = [
  // ============================================================
  // LESSON 6.1
  // ============================================================
  {
    id: "facebook-privacy",
    track: "literacy",
    phase: 6,
    order: 44,
    lessonNumber: "6.1",
    title: "Facebook Privacy",
    badge: "Facebook Privacy Pro",
    xp: 20,
    goals: [
      "Explain what Facebook privacy settings are.",
      "Decide who should see their posts.",
      "Protect personal information.",
      "Recognize why oversharing can be risky.",
      "Adjust privacy settings to make their account safer."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Are Privacy Settings?",
        text: "Think of your Facebook profile like your house. You probably wouldn't leave your front door wide open with a sign that says \"Come on in! My birthday is on the fridge and my vacation starts tomorrow!\"\n\nPrivacy settings are like locking your front door. They let you decide who can see your:",
        bullets: [
          "Photos",
          "Posts",
          "Friends list",
          "Location",
          "Birthday",
          "Contact information"
        ],
        footer: "The fewer strangers who can see your personal information, the safer you'll be."
      },
      {
        type: "learn",
        heading: "Who Can See Your Posts?",
        text: "Facebook lets you choose who sees what you post. Common options include:",
        bullets: [
          "Friends - only people you've accepted as friends",
          "Public - anyone on or off Facebook",
          "Only Me - only you",
          "Specific Friends - only people you choose"
        ],
        footer: "For most personal updates, Friends is usually the safest choice."
      },
      {
        type: "learn",
        heading: "Think Before You Post",
        text: "Before posting something, ask yourself: Would I be okay if my family saw this? Would I be okay if my neighbors saw this? Would I be okay if a scammer saw this?\n\nIf the answer is no, don't post it."
      },
      {
        type: "learn",
        heading: "Fun Fact",
        text: "Your vacation photos are beautiful, but it's usually safer to post them after you get home instead of announcing \"Nobody's home for the next two weeks!\""
      },
      {
        type: "choice",
        title: "Who Should See This?",
        text: "\"Happy Birthday to my granddaughter!\"",
        options: ["Public", "Friends", "Only Me"],
        correctIndex: 1,
        explanation: "Personal updates are usually safest shared with friends."
      },
      {
        type: "choice",
        title: "Who Should See This?",
        text: "\"My phone number is 555-1234.\"",
        options: ["Public", "Friends", "Don't post it at all."],
        correctIndex: 2,
        explanation: "Contact information should stay private."
      },
      {
        type: "choice",
        title: "Who Should See This?",
        text: "\"Family reunion photos.\"",
        options: ["Public", "Friends", "Everyone on Facebook"],
        correctIndex: 1
      },
      {
        type: "choice",
        title: "Who Should See This?",
        text: "\"My home address.\"",
        options: ["Friends", "Public", "Don't post it."],
        correctIndex: 2,
        explanation: "Ask yourself: Would I want a stranger to know this? If not, don't post it publicly."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Privacy Settings", back: "Controls who can see your information on Facebook." },
          { front: "Public", back: "Anyone can see your post." },
          { front: "Friends", back: "Only people you've accepted as Facebook friends can see your post." },
          { front: "Personal Information", back: "Information like your address, phone number, birthday, or Social Security number." },
          { front: "Oversharing", back: "Posting more personal information than is safe." }
        ]
      },
      {
        type: "match",
        title: "Match the Privacy Setting",
        pairs: [
          { word: "Friends", match: "Only your Facebook friends can see it" },
          { word: "Public", match: "Anyone can see it" },
          { word: "Only Me", match: "Only you can see it" },
          { word: "Privacy Settings", match: "Controls who can view your information" },
          { word: "Personal Information", match: "Details you should protect" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Friends", "Information", "Private", "Public"],
        questions: [
          { text: "For most personal posts, choosing ______ is usually the safest option.", answer: "Friends" },
          { text: "Your home address is personal ______.", answer: "Information" },
          { text: "Privacy settings help keep your account ______.", answer: "Private" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret is leaving for a two-week vacation. She wants to post: \"Leaving tomorrow! My house will be empty until June 20!\" What should she do?",
        options: [
          "Post it publicly.",
          "Post it for everyone.",
          "Wait until she gets home to share vacation photos.",
          "Include her home address too."
        ],
        correctIndex: 2,
        explanation: "Sharing travel plans publicly can tell strangers when you're away."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Tom receives a Facebook message asking \"What's your phone number? I found your profile!\" He doesn't know the person. What should Tom do?",
        options: [
          "Give his phone number.",
          "Give his address too.",
          "Ignore the message or block the person if it seems suspicious.",
          "Send his birthday."
        ],
        correctIndex: 2,
        explanation: "Don't share personal information with strangers online."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda is updating her Facebook profile. Which information is okay to make public?",
        options: [
          "Her Social Security number.",
          "Her banking information.",
          "Her home address.",
          "A photo of her favorite flower."
        ],
        correctIndex: 3,
        explanation: "It's okay to share hobbies and interests, but keep sensitive information private."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Before posting anything, ask yourself: Would I share this with a stranger? Does this reveal where I live? Does it include my phone number or birthday? Could someone use this information to scam me? If you're unsure, it's okay not to post it.\n\nRemember: the internet never forgets, unlike where we left our reading glasses."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          {
            label: "Safer Choices",
            items: [
              "Share family photos with Friends",
              "Review your privacy settings regularly",
              "Keep your phone number private",
              "Post vacation pictures after you return home"
            ]
          },
          {
            label: "Less Safe Choices",
            items: [
              "Share your address publicly",
              "Tell everyone when you'll be away",
              "Accept every friend request",
              "Post your banking information"
            ]
          }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You notice your birthday, phone number, and address are visible to everyone. What should you do?",
        options: [
          "Leave them public.",
          "Add more personal information.",
          "Change your privacy settings so only trusted people can see them.",
          "Post your bank account too."
        ],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "Before posting something online, what should you ask yourself?",
        options: [
          "\"Will this get lots of likes?\"",
          "\"Is this funny?\"",
          "\"Am I comfortable with strangers seeing this?\"",
          "\"Can I post even more information?\""
        ],
        correctIndex: 2,
        explanation: "Thinking before you post helps protect your privacy."
      }
    ],
    quiz: [
      { question: "What do privacy settings do?", options: ["Make your phone charge faster.", "Create new Facebook friends.", "Control who can see your information.", "Change your password automatically."], correctIndex: 2 },
      { question: "Which information should you avoid posting publicly?", options: ["Your favorite hobby", "Home address, phone number, banking information, and Social Security number"], correctIndex: 1 },
      { question: "True or False: It's usually safer to share personal posts with Friends instead of Public.", options: ["True", "False"], correctIndex: 0 },
      { question: "For most personal Facebook posts, choosing ______ is usually the safest option.", options: ["Friends", "Public", "Camera"], correctIndex: 0 },
      { question: "You're going on vacation for two weeks. What is the safest choice?", options: ["Announce you're leaving tomorrow.", "Post your travel plans publicly.", "Wait until you return home before posting vacation photos.", "Share your hotel room number."], correctIndex: 2 },
      { question: "Someone you don't know asks for your phone number through Facebook Messenger. What should you do?", options: ["Give them your number.", "Give them your address too.", "Don't share your personal information and ignore or block the message if it seems suspicious.", "Ask for their phone number first."], correctIndex: 2 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 1: Facebook Privacy!",
      learned: [
        "Explain what Facebook privacy settings are.",
        "Decide who should see your posts.",
        "Protect personal information.",
        "Recognize why oversharing can be risky."
      ],
      next: "Friend Request Scams"
    }
  },

  // ============================================================
  // LESSON 6.2
  // ============================================================
  {
    id: "friend-request-scams",
    track: "literacy",
    phase: 6,
    order: 45,
    lessonNumber: "6.2",
    title: "Friend Request Scams",
    badge: "Scam Spotter",
    xp: 20,
    goals: [
      "Explain what a friend request scam is.",
      "Recognize fake Facebook profiles.",
      "Decide when to accept or decline friend requests.",
      "Protect their personal information from strangers.",
      "Report and block suspicious accounts."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Is a Friend Request Scam?",
        text: "On Facebook, anyone can send you a friend request. Most are from real people, but some are fake accounts created by scammers. Scammers create fake profiles to:",
        bullets: [
          "Start conversations",
          "See your personal photos",
          "Learn where you live",
          "Ask for money later",
          "Steal personal information"
        ],
        footer: "Just because someone has a profile picture doesn't mean they're a real person."
      },
      {
        type: "learn",
        heading: "How to Spot a Fake Profile",
        text: "Here are some warning signs:",
        bullets: [
          "You don't know the person",
          "You have no mutual friends",
          "Their profile was recently created",
          "They have very few photos",
          "Their profile has almost no posts",
          "They immediately send private messages",
          "They quickly ask for money or personal information"
        ],
        footer: "One warning sign alone doesn't always mean it's fake, but several together should make you cautious."
      },
      {
        type: "learn",
        heading: "Fun Fact",
        text: "Some fake profiles use photos of very handsome doctors or glamorous models. If someone you've never met says \"Hello beautiful! I'm a famous surgeon who accidentally fell in love with your profile,\" it's probably not your lucky day."
      },
      {
        type: "choice",
        title: "Should You Accept the Friend Request?",
        text: "Mary receives a friend request from her granddaughter. She recognizes the profile.",
        options: ["Accept", "Decline"],
        correctIndex: 0
      },
      {
        type: "choice",
        title: "Should You Accept the Friend Request?",
        text: "John receives a request from someone he has never met. No mutual friends. Only one profile picture.",
        options: ["Accept", "Decline"],
        correctIndex: 1
      },
      {
        type: "choice",
        title: "Should You Accept the Friend Request?",
        text: "Susan receives a request from her next-door neighbor. She knows them personally.",
        options: ["Accept", "Decline"],
        correctIndex: 0
      },
      {
        type: "choice",
        title: "Should You Accept the Friend Request?",
        text: "Bob receives a request from someone claiming to be a celebrity asking to be friends.",
        options: ["Accept", "Decline"],
        correctIndex: 1,
        explanation: "Only accept friend requests from people you know and trust."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Friend Request", back: "An invitation to connect with someone on Facebook." },
          { front: "Fake Profile", back: "A profile pretending to be someone else or created for scams." },
          { front: "Mutual Friends", back: "People who are friends with both you and another person." },
          { front: "Block", back: "Prevent someone from contacting or viewing your profile." },
          { front: "Report", back: "Tell Facebook about fake or suspicious accounts." }
        ]
      },
      {
        type: "match",
        title: "Match the Situation",
        pairs: [
          { word: "Friend request from someone you know", match: "Accept" },
          { word: "Stranger with one photo and no friends", match: "Decline" },
          { word: "Someone immediately asks for money", match: "Block and report" },
          { word: "Fake celebrity account", match: "Ignore or report" },
          { word: "Unsure about a profile", match: "Look at the profile carefully before accepting" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Know", "Money", "Report", "Friends"],
        questions: [
          { text: "Only accept friend requests from people you ______.", answer: "Know" },
          { text: "If a fake account asks for ______, it is likely a scam.", answer: "Money" },
          { text: "If you find a fake account, you should ______ it to Facebook.", answer: "Report" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret receives a friend request from David Williams. No mutual friends, one profile picture, joined Facebook last week. What should she do?",
        options: [
          "Accept.",
          "Send him her phone number.",
          "Decline or ignore the request.",
          "Ask for his banking information."
        ],
        correctIndex: 2,
        explanation: "Several warning signs suggest this could be a fake account."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "After accepting a friend request, someone immediately sends this message: \"Hi! I'm stranded overseas. Can you send me $500?\" What should you do?",
        options: [
          "Send the money.",
          "Give them your credit card number.",
          "Stop responding, block the account, and report it.",
          "Share the message on your profile."
        ],
        correctIndex: 2,
        explanation: "Asking for money soon after connecting is a common scam."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda receives a friend request from someone with 25 mutual friends. She still doesn't recognize the person's name. What should she do?",
        options: [
          "Accept because there are mutual friends.",
          "Give them her address.",
          "Check who the person is or ask a mutual friend before accepting.",
          "Accept first and ask questions later."
        ],
        correctIndex: 2,
        explanation: "Mutual friends don't automatically mean someone is trustworthy."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Before accepting a friend request, ask yourself: Do I actually know this person? Does their profile seem real? Would I recognize them if I met them in person? Why do they want to connect with me? If you're unsure, it's perfectly okay to ignore the request.\n\nRemember: you don't get extra points for collecting Facebook friends."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          {
            label: "Safer Choices",
            items: ["Accept requests from people you know", "Review profiles before accepting", "Block suspicious accounts", "Report fake profiles"]
          },
          {
            label: "Less Safe Choices",
            items: ["Accept every friend request", "Send money to online strangers", "Share your phone number with unknown people", "Assume every profile is real"]
          }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "Someone has no profile picture, no posts, and no friends. What should you do?",
        options: [
          "Accept because they might be shy.",
          "Send them your email address.",
          "Be cautious and avoid accepting unless you can verify who they are.",
          "Invite them to all your family events."
        ],
        correctIndex: 2,
        explanation: "Fake accounts often have very little information on their profiles."
      }
    ],
    quiz: [
      { question: "What is a friend request scam?", options: ["A problem with your internet connection.", "A Facebook update.", "A fake account trying to gain your trust or steal your information.", "A password reset."], correctIndex: 2 },
      { question: "Which are warning signs of a fake profile?", options: ["A long friends list", "Very few photos, no mutual friends, immediately asking for money, and very little activity"], correctIndex: 1 },
      { question: "True or False: You should accept every friend request because Facebook removes fake accounts automatically.", options: ["True", "False"], correctIndex: 1 },
      { question: "Only accept friend requests from people you ______.", options: ["Know", "Camera", "Password"], correctIndex: 0 },
      { question: "A new Facebook friend asks you to send them money. What should you do?", options: ["Send the money.", "Give them your banking information.", "Stop responding, block them, and report the account.", "Ask them for your password."], correctIndex: 2 },
      { question: "You receive a friend request from someone with many mutual friends, but you don't recognize their name. What is the safest action?", options: ["Accept immediately.", "Send them your phone number.", "Verify who they are or ask a mutual friend before accepting.", "Assume they're trustworthy because of the mutual friends."], correctIndex: 2 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 2: Friend Request Scams!",
      learned: [
        "Recognize fake Facebook profiles.",
        "Decide when to accept or decline friend requests.",
        "Protect your personal information from strangers.",
        "Report and block suspicious accounts."
      ],
      next: "Fake Giveaways"
    }
  },

  // ============================================================
  // LESSON 6.3
  // ============================================================
  {
    id: "fake-giveaways",
    track: "literacy",
    phase: 6,
    order: 46,
    lessonNumber: "6.3",
    title: "Fake Giveaways",
    badge: "Giveaway Detective",
    xp: 20,
    goals: [
      "Recognize fake giveaway scams on social media.",
      "Explain why scammers create fake giveaways.",
      "Identify common warning signs.",
      "Know what information should never be shared.",
      "Report fake giveaway posts."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Is a Fake Giveaway?",
        text: "You've probably seen posts like \"Congratulations! You've won a FREE iPhone!\" or \"The first 100 people to comment 'ME!' win $500!\"\n\nSome giveaways are real, but many are scams. Scammers create fake giveaways to:",
        bullets: [
          "Steal your personal information",
          "Collect your credit card or banking information",
          "Get your email address",
          "Get lots of likes, comments, and shares"
        ],
        footer: "Sometimes they even ask you to pay a \"shipping fee\" for a prize that doesn't exist. If you didn't enter a contest, it's very unlikely that you won one."
      },
      {
        type: "learn",
        heading: "Warning Signs",
        text: "Be cautious if a giveaway:",
        bullets: [
          "Says you've won something you never entered",
          "Asks you to pay money to receive a prize",
          "Requests your Social Security number or bank information",
          "Tells you to \"Act NOW!\" because the offer expires in minutes",
          "Has lots of spelling or grammar mistakes",
          "Comes from a page that you've never heard of"
        ]
      },
      {
        type: "choice",
        title: "Is This Giveaway Safe?",
        text: "\"Win a $25 gift card! Enter through our official grocery store website.\"",
        options: [
          "Could be legitimate. Verify it's really the store's official page before entering.",
          "Definitely fake."
        ],
        correctIndex: 0
      },
      {
        type: "choice",
        title: "Is This Giveaway Safe?",
        text: "\"You've won a brand-new laptop! Just pay a $50 shipping fee.\"",
        options: ["Safe", "Scam"],
        correctIndex: 1
      },
      {
        type: "choice",
        title: "Is This Giveaway Safe?",
        text: "\"Click here immediately or you'll lose your prize in five minutes!\"",
        options: ["Safe", "Scam"],
        correctIndex: 1
      },
      {
        type: "choice",
        title: "Is This Giveaway Safe?",
        text: "\"Send us your Social Security number to claim your prize.\"",
        options: ["Safe", "Scam"],
        correctIndex: 1,
        explanation: "Real giveaways don't ask for highly sensitive information or pressure you into acting immediately."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Giveaway", back: "A promotion where prizes may be awarded to participants." },
          { front: "Scam", back: "A dishonest attempt to steal money or personal information." },
          { front: "Urgency", back: "Pressure to act quickly without thinking." },
          { front: "Official Account", back: "The verified or legitimate social media page for a business or organization." },
          { front: "Personal Information", back: "Information like your Social Security number, bank account, passwords, or home address." }
        ]
      },
      {
        type: "match",
        title: "Match the Situation",
        pairs: [
          { word: "Asked to pay a fee to receive a prize", match: "Don't continue" },
          { word: "Giveaway from the official store page", match: "Verify it's the real account before entering" },
          { word: "Asked for your Social Security number", match: "Never provide it" },
          { word: "Message says \"You won!\" but you never entered", match: "Ignore or report it" },
          { word: "Unsure if the giveaway is real", match: "Check the official company's website" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Entered", "Information", "Official", "Money"],
        questions: [
          { text: "If you never ______ a contest, be skeptical if someone says you've won.", answer: "Entered" },
          { text: "Never share personal ______ to claim a prize.", answer: "Information" },
          { text: "Always verify that a giveaway comes from the company's ______ account.", answer: "Official" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret sees a Facebook post: \"Target is giving away $1,000 gift cards! Just share this post 20 times and send us your credit card to verify your identity.\" What should she do?",
        options: [
          "Share the post.",
          "Send her credit card number.",
          "Ignore the post and check Target's official Facebook page or website to see if the giveaway is real.",
          "Tell her friends to enter immediately."
        ],
        correctIndex: 2,
        explanation: "Legitimate giveaways should not require your credit card just to claim a prize."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert receives a Facebook message: \"Congratulations! You've won a cruise. Just pay a $99 processing fee.\" What should he do?",
        options: [
          "Pay the fee.",
          "Give his banking information.",
          "Ignore the message and report it if it appears to be a scam.",
          "Forward it to his family."
        ],
        correctIndex: 2,
        explanation: "Paying to receive a \"free\" prize is a common scam tactic."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda sees a giveaway on the official page of her local library. It asks people to comment with their favorite book for a chance to win a tote bag. What should she do?",
        options: [
          "Ignore it because all giveaways are scams.",
          "If she wants to participate, verify it's really the library's official page and follow the entry instructions.",
          "Send her Social Security number.",
          "Pay a shipping fee."
        ],
        correctIndex: 1,
        explanation: "Not every giveaway is fake. The key is making sure it's from a trusted, official source."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Before entering a giveaway, ask yourself: Did I choose to enter this contest? Is it from the company's official page? Is anyone asking me to pay money? Are they requesting sensitive personal information? If something feels suspicious, don't enter. Verify first.\n\nRemember: the only thing you should win by giving away your Social Security number is absolutely nothing."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          {
            label: "Safer Choices",
            items: [
              "Verify giveaways on the company's official page",
              "Ignore giveaways asking for payment",
              "Report suspicious giveaway posts",
              "Keep personal information private"
            ]
          },
          {
            label: "Less Safe Choices",
            items: [
              "Pay shipping fees for unexpected prizes",
              "Share your banking information",
              "Believe every \"Congratulations, you won!\" message",
              "Rush because the countdown says \"Only 2 minutes left!\""
            ]
          }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You receive a message saying: \"You won a free TV! Click here in 30 seconds or you'll lose it!\"",
        options: [
          "Click immediately.",
          "Give your credit card number.",
          "Ignore the message and verify through the company's official website if you're interested.",
          "Send your password."
        ],
        correctIndex: 2,
        explanation: "Urgency is one of the most common tricks scammers use."
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "A giveaway asks you to pay a $20 shipping fee before claiming your \"free\" prize.",
        options: [
          "Pay the fee.",
          "Give your debit card.",
          "Do not pay and leave the website or conversation.",
          "Send cash by mail."
        ],
        correctIndex: 2,
        explanation: "Real giveaways shouldn't pressure you into paying unexpected fees to claim a prize."
      }
    ],
    quiz: [
      { question: "What is a common sign of a fake giveaway?", options: ["It comes from a verified company page.", "It clearly explains the contest rules.", "It asks you to pay money to receive your prize.", "It gives you time to read the rules."], correctIndex: 2 },
      { question: "Which information should you never share to claim a prize?", options: ["Your favorite color", "Social Security number, bank account information, passwords, and credit card information"], correctIndex: 1 },
      { question: "True or False: If you never entered a contest, you should be skeptical if someone says you've won.", options: ["True", "False"], correctIndex: 0 },
      { question: "If you never ______ a contest, it's unlikely you won.", options: ["Entered", "Money", "Camera"], correctIndex: 0 },
      { question: "Someone says you've won a free laptop but asks for a $50 shipping fee. What should you do?", options: ["Pay the fee.", "Give your credit card information.", "Do not pay and ignore or report the giveaway.", "Share it with friends."], correctIndex: 2 },
      { question: "What's the best way to verify whether a giveaway is real?", options: ["Trust the comments.", "Believe the number of shares.", "Check the company's official website or verified social media page.", "Assume all giveaways are real."], correctIndex: 2 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 3: Fake Giveaways!",
      learned: [
        "Recognize fake giveaway scams.",
        "Identify common warning signs.",
        "Know what information should never be shared.",
        "Report fake giveaway posts."
      ],
      next: "Fake News"
    }
  },

  // ============================================================
  // LESSON 6.4
  // ============================================================
  {
    id: "fake-news",
    track: "literacy",
    phase: 6,
    order: 47,
    lessonNumber: "6.4",
    title: "Fake News",
    badge: "Fact Checker",
    xp: 20,
    goals: [
      "Explain what fake news is.",
      "Recognize signs that a story may be false or misleading.",
      "Verify information before sharing it.",
      "Find trustworthy news sources.",
      "Avoid spreading misinformation."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Is Fake News?",
        text: "Fake news is false or misleading information that is made to look like real news. Sometimes fake news is created to:",
        bullets: [
          "Get lots of clicks",
          "Make money from advertisements",
          "Shock or scare people",
          "Influence opinions"
        ],
        footer: "Not every incorrect story is intentional. Sometimes people simply share information without checking if it's true. The good news is that you can learn how to spot fake news before sharing it."
      },
      {
        type: "learn",
        heading: "How to Spot Fake News",
        text: "Here are some warning signs:",
        bullets: [
          "The headline sounds shocking or unbelievable",
          "The article doesn't list reliable sources",
          "It asks you to \"Share this immediately!\"",
          "The website name looks unfamiliar",
          "The story has many spelling or grammar mistakes",
          "Other trusted news organizations are not reporting the same story"
        ],
        footer: "Before sharing, take a moment to ask: \"How do I know this is true?\""
      },
      {
        type: "learn",
        heading: "How to Check If News Is Real",
        text: "Before believing or sharing a story:",
        bullets: [
          "Read more than just the headline",
          "Look for the author and publication date",
          "Check whether trusted news organizations are reporting it",
          "Visit official websites if the story involves a government agency or public health",
          "If you're unsure, don't share it"
        ],
        footer: "Taking one minute to verify a story can prevent misinformation from spreading."
      },
      {
        type: "choice",
        title: "Is This News Trustworthy?",
        text: "\"Scientists discover a cure for every disease!\" The article has no author and asks you to share it immediately.",
        options: ["Trust it.", "Be skeptical and verify it with trusted news sources."],
        correctIndex: 1
      },
      {
        type: "choice",
        title: "Is This News Trustworthy?",
        text: "A local newspaper reports that a road will be closed tomorrow, and your city's official website has the same information.",
        options: ["More likely to be trustworthy.", "Fake news."],
        correctIndex: 0
      },
      {
        type: "choice",
        title: "Is This News Trustworthy?",
        text: "A social media post says \"Forward this to everyone you know before midnight!\"",
        options: ["Trust it.", "Verify the information before sharing."],
        correctIndex: 1
      },
      {
        type: "choice",
        title: "Is This News Trustworthy?",
        text: "An article includes reliable sources, the author's name, and similar reporting from other news organizations.",
        options: ["More likely to be trustworthy.", "Fake news."],
        correctIndex: 0,
        explanation: "Looking for evidence and trusted sources helps you avoid fake news."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Fake News", back: "False or misleading information presented as real news." },
          { front: "Reliable Source", back: "A trusted organization that checks facts before publishing information." },
          { front: "Headline", back: "The title of a news story." },
          { front: "Fact-Check", back: "The process of verifying whether information is accurate." },
          { front: "Misinformation", back: "False or inaccurate information that may be shared without intending to deceive." }
        ]
      },
      {
        type: "match",
        title: "Match the Situation",
        pairs: [
          { word: "Shocking headline", match: "Read the full article before believing it" },
          { word: "Unknown website", match: "Verify with trusted sources" },
          { word: "Trusted news organizations report the same story", match: "More likely to be accurate" },
          { word: "Social media says \"Share now!\"", match: "Verify before sharing" },
          { word: "Unsure if a story is true", match: "Don't share until you check" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Headline", "Sources", "Verify", "Share"],
        questions: [
          { text: "Don't believe a story based only on the ______.", answer: "Headline" },
          { text: "Look for reliable ______ to support a news story.", answer: "Sources" },
          { text: "If you're unsure whether a story is true, ______ it before sharing.", answer: "Verify" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret sees a Facebook post saying: \"Starting tomorrow, all banks in America are closing permanently! Share this before it's deleted!\" What should she do?",
        options: [
          "Share it immediately.",
          "Tell everyone it's true.",
          "Check trusted news organizations and official sources before believing or sharing it.",
          "Save the post and ignore all bank emails."
        ],
        correctIndex: 2,
        explanation: "Urgent messages encouraging you to share immediately are common signs of misinformation."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert reads an article about a new health recommendation. He finds the same information on several trusted news websites and an official government health website. What should he do?",
        options: [
          "Feel more confident that the information is accurate.",
          "Assume it's fake.",
          "Ignore the official website.",
          "Share it without reading it."
        ],
        correctIndex: 0,
        explanation: "Seeing the same information from multiple trusted sources increases confidence in its accuracy."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda sees a headline: \"You Won't Believe What Happened Next!\" The headline gives no details. What should she do?",
        options: [
          "Share it based on the title.",
          "Believe it immediately.",
          "Read the full article and verify the information before sharing.",
          "Assume it's true because many people liked it."
        ],
        correctIndex: 2,
        explanation: "Headlines are designed to grab attention. Always read the full story."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Before sharing news, ask yourself: Did I read the entire article? Is it from a trusted news organization? Are other reliable sources reporting the same story? Does the article provide evidence? If you're not sure, pause, verify, then decide whether to share."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          {
            label: "Safer Choices",
            items: ["Read the full article", "Check multiple trusted sources", "Look for the publication date", "Verify information before sharing"]
          },
          {
            label: "Less Safe Choices",
            items: ["Share articles after reading only the headline", "Believe every viral post", "Trust information because many people shared it", "Ignore warning signs"]
          }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "A headline says: \"Breaking News! Share This Before It's Deleted!\"",
        options: [
          "Share immediately.",
          "Assume it's true.",
          "Read the article and verify it with trusted sources first.",
          "Send it to all your friends."
        ],
        correctIndex: 2,
        explanation: "Urgency is often used to encourage people to share misinformation without checking it."
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You find a story on an unfamiliar website.",
        options: [
          "Believe it automatically.",
          "Share it because it sounds interesting.",
          "Check whether trusted news organizations are reporting the same story.",
          "Ignore all news forever."
        ],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You aren't sure if a story is true.",
        options: [
          "Share it anyway.",
          "Believe the comments.",
          "Wait until you've verified the information.",
          "Assume it's fake without checking."
        ],
        correctIndex: 2,
        explanation: "Taking a few minutes to verify information helps prevent misinformation from spreading."
      }
    ],
    quiz: [
      { question: "What is fake news?", options: ["A weather forecast.", "An opinion you disagree with.", "False or misleading information presented as real news.", "A private message."], correctIndex: 2 },
      { question: "Which is a sign that a story may not be trustworthy?", options: ["It lists its sources and author", "It tells you to \"Share immediately!\", has no reliable sources, and isn't reported by trusted organizations"], correctIndex: 1 },
      { question: "True or False: You should read the full article before deciding whether it's true.", options: ["True", "False"], correctIndex: 0 },
      { question: "Don't judge a story by only reading the ______.", options: ["Headline", "Password", "Camera"], correctIndex: 0 },
      { question: "A social media post says all banks are closing tomorrow and tells you to share it immediately. What should you do?", options: ["Share it.", "Believe it automatically.", "Verify it with trusted news organizations and official sources before sharing.", "Ignore your bank forever."], correctIndex: 2 },
      { question: "What's the best way to decide whether a news story is trustworthy?", options: ["Count how many likes it has.", "Read only the comments.", "Check multiple trusted sources and look for evidence.", "Believe it because a friend shared it."], correctIndex: 2 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 4: Fake News!",
      learned: [
        "Explain what fake news is.",
        "Recognize signs that a story may be false.",
        "Verify information before sharing it.",
        "Avoid spreading misinformation."
      ],
      next: "Political Misinformation"
    }
  },

  // ============================================================
  // LESSON 6.5
  // ============================================================
  {
    id: "political-misinformation",
    track: "literacy",
    phase: 6,
    order: 48,
    lessonNumber: "6.5",
    title: "Political Misinformation",
    badge: "Critical Thinker",
    xp: 20,
    goals: [
      "Explain what political misinformation is.",
      "Recognize common signs of misleading political posts.",
      "Verify election and government information using trusted sources.",
      "Avoid sharing unverified political content.",
      "Understand why thinking critically is more important than reacting quickly."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Is Political Misinformation?",
        text: "Political misinformation is false or misleading information about:",
        bullets: [
          "Elections",
          "Government officials",
          "Laws",
          "Government programs",
          "Voting dates and locations"
        ],
        footer: "Sometimes misinformation is shared accidentally by people who believe it's true. Other times, it is spread intentionally to confuse or influence people. No matter who a post supports or criticizes, it's important to check whether it's accurate before sharing it."
      },
      {
        type: "learn",
        heading: "Common Warning Signs",
        text: "Be cautious if a political post:",
        bullets: [
          "Says \"Share this before it's deleted!\"",
          "Doesn't mention where the information came from",
          "Uses very emotional language to make you angry or scared",
          "Shows edited images without evidence",
          "Claims only one website knows \"the truth\"",
          "Doesn't match information from official government sources"
        ]
      },
      {
        type: "learn",
        heading: "How to Verify Political Information",
        text: "Before sharing political information:",
        bullets: [
          "Read the entire article, not just the headline",
          "Check if several trusted news organizations are reporting the same information",
          "Visit your state's official election website for voting information",
          "Use official government websites for election dates and polling locations",
          "If you're unsure, wait until you can verify it"
        ],
        footer: "Remember: it's okay to say, \"I don't know if this is true yet.\""
      },
      {
        type: "choice",
        title: "Should You Trust This Post?",
        text: "\"Election Day has been moved to next week! Share this immediately!\"",
        options: ["Share it.", "Check your state's official election website before believing it."],
        correctIndex: 1
      },
      {
        type: "choice",
        title: "Should You Trust This Post?",
        text: "Several trusted news organizations and your state's election office report the same voting information.",
        options: ["More likely to be accurate.", "Fake."],
        correctIndex: 0
      },
      {
        type: "choice",
        title: "Should You Trust This Post?",
        text: "A post has no sources but says \"Only I know the real truth.\"",
        options: ["Believe it.", "Look for information from trusted sources."],
        correctIndex: 1
      },
      {
        type: "choice",
        title: "Should You Trust This Post?",
        text: "An article links to official government documents and multiple trusted news organizations report the same story.",
        options: ["More likely to be trustworthy.", "Fake."],
        correctIndex: 0,
        explanation: "Verifying information before sharing helps stop misinformation."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Political Misinformation", back: "False or misleading information about politics, elections, or government." },
          { front: "Official Source", back: "A trusted government agency or reliable news organization." },
          { front: "Election Information", back: "Official details about voting dates, locations, and registration." },
          { front: "Verify", back: "To check whether information is accurate before believing or sharing it." },
          { front: "Reliable Source", back: "A source with a reputation for checking facts before publishing information." }
        ]
      },
      {
        type: "match",
        title: "Match the Situation",
        pairs: [
          { word: "A post says \"Share before it's deleted!\"", match: "Verify before sharing" },
          { word: "Unsure when Election Day is", match: "Check your state's official election website" },
          { word: "Story has no sources", match: "Be skeptical" },
          { word: "Several trusted news organizations report the same event", match: "More likely to be accurate" },
          { word: "Unsure if a claim is true", match: "Wait until you verify it" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Verify", "Sources", "Official", "Share"],
        questions: [
          { text: "Always ______ political information before sharing it.", answer: "Verify" },
          { text: "Look for reliable ______ when reading political news.", answer: "Sources" },
          { text: "For voting dates and locations, use ______ government websites.", answer: "Official" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret sees a Facebook post saying \"Your polling place changed today! Share this with everyone!\" The post doesn't say where the information came from. What should she do?",
        options: [
          "Share it immediately.",
          "Assume it's true.",
          "Check her state's official election website before believing or sharing it.",
          "Ignore future election information."
        ],
        correctIndex: 2,
        explanation: "Election information should come from official sources. Voting information can affect many people, so always verify it first."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert receives a message claiming \"This law goes into effect tomorrow!\" He can't find the same information anywhere else. What should he do?",
        options: [
          "Share it because it sounds important.",
          "Believe it immediately.",
          "Wait and verify it using official government websites or trusted news organizations.",
          "Assume it's true because a friend sent it."
        ],
        correctIndex: 2,
        explanation: "If reliable sources don't confirm the information, don't share it. Important news is usually reported by multiple trusted organizations."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda reads an article from a trusted news organization. She also finds the same information on an official government website. What should she conclude?",
        options: [
          "The information is more likely to be accurate.",
          "It's probably fake.",
          "She should ignore both.",
          "She should only trust social media."
        ],
        correctIndex: 0,
        explanation: "Multiple trusted sources increase confidence in the information."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Before sharing political information, ask yourself: Did I read the whole article? Does it include reliable sources? Are trusted news organizations reporting it? Does an official government website confirm it? If you're unsure, pause, verify, and then decide whether to share."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          {
            label: "Safer Choices",
            items: ["Read the full article", "Check official election websites", "Compare multiple trusted sources", "Wait before sharing uncertain information"]
          },
          {
            label: "Less Safe Choices",
            items: ["Share emotional posts without checking", "Believe information because many people shared it", "Trust headlines without reading the article", "Assume every viral post is true"]
          }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "A social media post says Election Day has changed.",
        options: [
          "Share it immediately.",
          "Believe it because many people shared it.",
          "Verify it using your state's official election website.",
          "Ignore official websites."
        ],
        correctIndex: 2,
        explanation: "Official election websites are the best place to confirm voting information."
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "A friend sends you a political post you're unsure about.",
        options: [
          "Share it because they're your friend.",
          "Believe it immediately.",
          "Verify it before sharing or discussing it.",
          "Assume it's false without checking."
        ],
        correctIndex: 2,
        explanation: "Friends can unintentionally share inaccurate information. Always verify first."
      }
    ],
    quiz: [
      { question: "What is political misinformation?", options: ["Any political opinion.", "A campaign advertisement.", "False or misleading information about politics, elections, or government.", "A newspaper subscription."], correctIndex: 2 },
      { question: "Which is a warning sign that a political post may not be trustworthy?", options: ["It cites official government documents", "It tells you to share immediately, provides no sources, uses emotional pressure, and doesn't match official sources"], correctIndex: 1 },
      { question: "True or False: It's okay to wait until you've verified political information before sharing it.", options: ["True", "False"], correctIndex: 0 },
      { question: "Always ______ political information before sharing it.", options: ["Verify", "Password", "Camera"], correctIndex: 0 },
      { question: "You see a post claiming your polling location changed today. What should you do?", options: ["Share it immediately.", "Believe it because a friend posted it.", "Check your state's official election website before acting or sharing.", "Ignore all election information."], correctIndex: 2 },
      { question: "What is the best way to decide whether political information is trustworthy?", options: ["Count the number of likes.", "Read only the comments.", "Check official government sources and multiple trusted news organizations.", "Believe it because it agrees with your opinions."], correctIndex: 2 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 5: Political Misinformation!",
      learned: [
        "Explain what political misinformation is.",
        "Recognize common signs of misleading political posts.",
        "Verify election and government information using trusted sources.",
        "Avoid sharing unverified political content."
      ],
      next: "Deepfake Videos"
    }
  },

  // ============================================================
  // LESSON 6.6
  // ============================================================
  {
    id: "deepfakes",
    track: "literacy",
    phase: 6,
    order: 49,
    lessonNumber: "6.6",
    title: "Deepfake Videos",
    badge: "Deepfake Detective",
    xp: 20,
    goals: [
      "Explain what a deepfake video is.",
      "Recognize common warning signs of deepfakes.",
      "Understand why deepfakes are created.",
      "Verify videos before believing or sharing them.",
      "Know what to do if they see a suspicious video online."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Is a Deepfake?",
        text: "A deepfake is a photo, video, or audio recording that has been changed using artificial intelligence (AI) to make it look or sound like someone said or did something they never actually said or did.",
        bullets: [
          "A celebrity made an announcement",
          "A government official said something shocking",
          "A family member is asking for money"
        ],
        footer: "Sometimes deepfakes are made for entertainment, but scammers also use them to trick people. That's why it's important not to believe every video you see online."
      },
      {
        type: "learn",
        heading: "Warning Signs of a Deepfake",
        text: "A deepfake isn't always easy to spot, but watch for these clues:",
        bullets: [
          "The person's lips don't match the words",
          "Their voice sounds strange or robotic",
          "Facial movements look unnatural",
          "Lighting or shadows look inconsistent",
          "The video is blurry around the face",
          "The video comes from an unfamiliar account"
        ],
        footer: "Remember: a realistic-looking video isn't always a real video."
      },
      {
        type: "learn",
        heading: "What Should You Do?",
        text: "If you see a surprising video:",
        bullets: [
          "Pause before reacting",
          "Check whether trusted news organizations are reporting it",
          "Look for the original source of the video",
          "Ask yourself if the claim seems reasonable",
          "Don't share it until you've verified it's real"
        ]
      },
      {
        type: "choice",
        title: "Is This a Warning Sign?",
        text: "The person's mouth doesn't match the words they're speaking.",
        options: ["Possible deepfake", "Probably real"],
        correctIndex: 0
      },
      {
        type: "choice",
        title: "Is This a Warning Sign?",
        text: "The video comes from a verified news organization with clear reporting.",
        options: ["Fake", "More likely to be trustworthy"],
        correctIndex: 1
      },
      {
        type: "choice",
        title: "Is This a Warning Sign?",
        text: "A video asks you to \"Share before it gets deleted!\"",
        options: ["Trust it", "Be cautious and verify it first"],
        correctIndex: 1
      },
      {
        type: "choice",
        title: "Is This a Warning Sign?",
        text: "The person's face flickers and looks blurry throughout the video.",
        options: ["Possible deepfake", "Definitely real"],
        correctIndex: 0,
        explanation: "Deepfakes often have visual or audio clues that something isn't right."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Deepfake", back: "A photo, video, or audio recording altered with AI to appear real." },
          { front: "AI", back: "Technology that can create or change images, videos, voices, and text." },
          { front: "Verify", back: "Check whether information is true before believing or sharing it." },
          { front: "Original Source", back: "The first trusted place where a video or story was published." },
          { front: "Misinformation", back: "False or misleading information that can spread online." }
        ]
      },
      {
        type: "match",
        title: "Match the Situation",
        pairs: [
          { word: "Strange-looking video", match: "Verify before sharing" },
          { word: "Lips don't match the voice", match: "Possible deepfake" },
          { word: "Video from an official news source", match: "More likely to be trustworthy" },
          { word: "Unsure if a video is real", match: "Check trusted sources" },
          { word: "Unexpected celebrity announcement", match: "Verify before believing it" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["AI", "Verify", "Source", "Share"],
        questions: [
          { text: "A deepfake is often created using ______.", answer: "AI" },
          { text: "Before sharing a surprising video, always ______ it.", answer: "Verify" },
          { text: "Look for the original ______ of the video.", answer: "Source" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret sees a video of a famous actor promoting a new investment opportunity. The video came from an unfamiliar account. What should she do?",
        options: [
          "Invest immediately.",
          "Share the video.",
          "Verify whether the actor actually made the video by checking trusted news or the actor's official account.",
          "Enter her credit card information."
        ],
        correctIndex: 2,
        explanation: "Deepfake videos are sometimes used to promote investment scams."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert watches a video of a government official making a surprising announcement. No trusted news organizations are reporting it. What should he do?",
        options: [
          "Believe it immediately.",
          "Share it because it's important.",
          "Wait and verify the information before believing or sharing it.",
          "Assume it's true because it looks real."
        ],
        correctIndex: 2,
        explanation: "Just because a video looks convincing doesn't mean it's authentic."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda receives a video from a friend. The person's face looks blurry, and the voice sounds unnatural. What should she do?",
        options: [
          "Share it with more friends.",
          "Assume it's funny and real.",
          "Be cautious and verify whether it's authentic before sharing.",
          "Ignore all videos forever."
        ],
        correctIndex: 2,
        explanation: "Unusual visual or audio quality can be a warning sign of a deepfake."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Before believing a video, ask yourself: Who posted this video? Does the account seem trustworthy? Are trusted news organizations reporting the same information? Does anything about the video seem unusual? If you're unsure, pause, verify, then decide whether to share it."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          {
            label: "Safer Choices",
            items: ["Verify surprising videos", "Check trusted news sources", "Look for the original source", "Be cautious with videos from unfamiliar accounts"]
          },
          {
            label: "Less Safe Choices",
            items: ["Believe every realistic-looking video", "Share videos without checking", "Trust celebrity videos automatically", "Assume AI-generated videos are always easy to spot"]
          }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You see a video of a celebrity promoting an investment.",
        options: [
          "Invest immediately.",
          "Share it with friends.",
          "Verify it using the celebrity's official account or trusted news sources.",
          "Enter your banking information."
        ],
        correctIndex: 2,
        explanation: "Scammers sometimes use deepfake videos to make fake investments seem trustworthy."
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "A video's voice sounds robotic and the person's lips don't match the words.",
        options: [
          "It's definitely real.",
          "Ignore the warning signs.",
          "Be cautious - it could be a deepfake.",
          "Share it anyway."
        ],
        correctIndex: 2
      },
      {
        type: "learn",
        heading: "Spot the Difference: Real vs. AI-Generated",
        text: "Sometimes it's difficult to tell if an image or video is real. AI has become very good at creating realistic-looking people and scenes. Small details in hands, jewelry, teeth, and backgrounds often reveal that an image isn't real.",
        bullets: [
          "Extra or missing fingers",
          "Earrings that don't match",
          "Teeth that look too perfect or unnatural",
          "Glasses that bend or float",
          "Jewelry that changes shape",
          "Eyes looking in different directions",
          "Strange lighting or shadows",
          "Objects or clothing blending together"
        ],
        footer: "Not every AI image has these mistakes, and some real photos have unusual angles or lighting. Look for multiple clues rather than relying on just one."
      },
      {
        type: "choice",
        title: "Real or AI-Generated?",
        text: "Picture A: A smiling woman standing in a garden. Five fingers on each hand, natural lighting, clear background, normal facial features.",
        options: ["AI-generated", "Likely real"],
        correctIndex: 1
      },
      {
        type: "choice",
        title: "Real or AI-Generated?",
        text: "Picture B: A man holding a coffee mug. Six fingers, the mug handle blends into his hand, and his watch looks blurry.",
        options: ["AI-generated", "Real"],
        correctIndex: 0
      },
      {
        type: "choice",
        title: "Real or AI-Generated?",
        text: "Picture C: A family taking a selfie. Everyone looks natural, shadows match the sunlight, and the background looks consistent.",
        options: ["AI-generated", "Likely real"],
        correctIndex: 1
      },
      {
        type: "choice",
        title: "Real or AI-Generated?",
        text: "Picture D: A businessman shaking someone's hand. Fingers overlap unnaturally, his tie blends into his jacket, and one ear disappears.",
        options: ["AI-generated", "Real"],
        correctIndex: 0,
        explanation: "You looked for multiple clues, not just one - check hands, fingers, jewelry, clothing, shadows, and the background, not only the face."
      },
      {
        type: "learn",
        heading: "Remember",
        text: "Even experts can be fooled by AI images. If a photo or video seems shocking, unbelievable, or is being used to convince you to send money, donate, invest, or share personal information, pause and verify it using trusted sources before acting."
      }
    ],
    quiz: [
      { question: "What is a deepfake?", options: ["A slow internet connection.", "A broken video file.", "A photo, video, or audio recording changed with AI to appear real.", "A computer virus."], correctIndex: 2 },
      { question: "Which is a possible warning sign of a deepfake?", options: ["Consistent lighting and natural movement", "The lips don't match the words, the voice sounds unnatural, and the face looks blurry or flickers"], correctIndex: 1 },
      { question: "True or False: Just because a video looks real doesn't mean it's real.", options: ["True", "False"], correctIndex: 0 },
      { question: "Deepfakes are often created using ______.", options: ["AI", "Camera", "Password"], correctIndex: 0 },
      { question: "You see a shocking video of a public official making an unexpected announcement. What should you do?", options: ["Share it immediately.", "Assume it's true because it looks realistic.", "Check trusted news organizations or official government sources before believing or sharing it.", "Ignore all future videos."], correctIndex: 2 },
      { question: "What's the best first step when you're unsure if a video is real?", options: ["Count the number of views.", "Read only the comments.", "Verify it using trusted sources before sharing.", "Share it so others can decide."], correctIndex: 2 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 6: Deepfake Videos!",
      learned: [
        "Explain what a deepfake video is.",
        "Recognize common warning signs of deepfakes.",
        "Verify videos before believing or sharing them.",
        "Know what to do if you see a suspicious video online."
      ],
      next: "Reporting Fake Accounts"
    }
  },

  // ============================================================
  // LESSON 6.7
  // ============================================================
  {
    id: "reporting-fake-accounts",
    track: "literacy",
    phase: 6,
    order: 50,
    lessonNumber: "6.7",
    title: "Reporting Fake Accounts",
    badge: "Community Guardian",
    xp: 20,
    goals: [
      "Recognize fake or scam social media accounts.",
      "Know when to report an account.",
      "Know when to block someone.",
      "Understand what happens after reporting.",
      "Help keep social media safer for everyone."
    ],
    blocks: [
      {
        type: "learn",
        heading: "Why Report Fake Accounts?",
        text: "Not every suspicious account is dangerous, but many fake accounts are created to:",
        bullets: [
          "Steal personal information",
          "Trick people into sending money",
          "Send scam messages",
          "Pretend to be someone else"
        ],
        footer: "When you report a fake account, you help the social media platform investigate it. If the account breaks the rules, it may be removed to help protect other users. Reporting isn't being rude - it's helping keep the online community safe."
      },
      {
        type: "learn",
        heading: "Block vs. Report",
        text: "Blocking means: they can't message you, they can't see much of your profile, and they can't send you another friend request. Use Block when you don't want someone contacting you.\n\nReporting means: the platform reviews the account, checks whether it is fake or breaking the rules, and may take action if necessary. You can report and block the same account."
      },
      {
        type: "learn",
        heading: "When Should You Report Someone?",
        text: "Consider reporting an account if it:",
        bullets: [
          "Pretends to be someone else",
          "Asks strangers for money",
          "Sends suspicious links",
          "Tries to steal personal information",
          "Harasses or threatens people",
          "Creates fake giveaways or scams"
        ],
        footer: "Not every disagreement online should be reported, but scams and impersonation should be."
      },
      {
        type: "choice",
        title: "Should You Report It?",
        text: "Someone pretending to be your grandson asks you to send money.",
        options: ["Ignore it forever.", "Report and block the account."],
        correctIndex: 1
      },
      {
        type: "choice",
        title: "Should You Report It?",
        text: "A friend posts pictures of their vacation.",
        options: ["Report them.", "No need to report."],
        correctIndex: 1
      },
      {
        type: "choice",
        title: "Should You Report It?",
        text: "An account keeps sending links promising free gift cards.",
        options: ["Report and block.", "Accept the offers."],
        correctIndex: 0
      },
      {
        type: "choice",
        title: "Should You Report It?",
        text: "Someone creates a fake profile using your photo.",
        options: ["Report it immediately.", "Do nothing."],
        correctIndex: 0,
        explanation: "Reporting scams helps protect both you and other users."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Report", back: "Tell the social media platform about suspicious or fake accounts." },
          { front: "Block", back: "Prevent someone from contacting or viewing your profile." },
          { front: "Impersonation", back: "Pretending to be another person online." },
          { front: "Scam Account", back: "A fake profile created to steal money or information." },
          { front: "Suspicious Link", back: "A link that may lead to a scam or fake website." }
        ]
      },
      {
        type: "match",
        title: "Match the Situation",
        pairs: [
          { word: "Fake account pretending to be a family member", match: "Report and block" },
          { word: "Friend shares vacation photos", match: "No report needed" },
          { word: "Stranger repeatedly sends scam links", match: "Report and block" },
          { word: "Fake giveaway account", match: "Report it" },
          { word: "Someone is bothering you with unwanted messages", match: "Block them" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Report", "Block", "Fake", "Money"],
        questions: [
          { text: "If an account is pretending to be someone else, you should ______ it.", answer: "Report" },
          { text: "If someone keeps sending unwanted messages, you can ______ them.", answer: "Block" },
          { text: "Many scam accounts try to steal your ______.", answer: "Money" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret receives a friend request from someone using her daughter's name. The profile has only one photo and immediately asks for $200. What should Margaret do?",
        options: [
          "Send the money.",
          "Accept the request first.",
          "Report the account, block it, and contact her daughter another way to make sure she's okay.",
          "Reply with her bank account number."
        ],
        correctIndex: 2,
        explanation: "If someone claims to be a family member and asks for money, verify their identity by calling or texting them using a phone number you already know."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert receives the same suspicious message from one account every day. It says: \"Click here to claim your free prize!\" What should he do?",
        options: [
          "Keep clicking the link.",
          "Reply with personal information.",
          "Block the account and report it.",
          "Share it with friends."
        ],
        correctIndex: 2,
        explanation: "Blocking stops future messages, and reporting helps protect others."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda notices an account using her profile picture and pretending to be her. Friends begin asking if it's really her. What should Linda do?",
        options: [
          "Ignore it.",
          "Make a second fake account.",
          "Report the fake account and let her friends know it's not her.",
          "Send the fake account her password."
        ],
        correctIndex: 2,
        explanation: "Reporting impersonation quickly can help prevent scammers from fooling your friends and family."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "If you think an account is fake: don't send money, don't click suspicious links, block the account, report it to the platform, and tell a trusted friend or family member if you're unsure. You don't have to solve the mystery yourself - reporting suspicious accounts helps the platform investigate them."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          {
            label: "Safer Choices",
            items: ["Report fake profiles", "Block people who send scams", "Verify a family member's identity before sending money", "Ignore suspicious links"]
          },
          {
            label: "Less Safe Choices",
            items: ["Send money to online strangers", "Reply to scam messages", "Share personal information with suspicious accounts", "Assume every profile is real"]
          }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "An account pretending to be your grandson asks for $500.",
        options: [
          "Send the money immediately.",
          "Reply asking for their bank account.",
          "Contact your grandson using a phone number you already have, then report and block the account.",
          "Ignore it without telling anyone."
        ],
        correctIndex: 2,
        explanation: "Always verify unexpected requests for money through another trusted method."
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You accidentally accepted a fake friend request.",
        options: [
          "Keep them as a friend.",
          "Send them your address.",
          "Remove them as a friend, block them, and report the account if it appears fake.",
          "Give them another chance by sending your phone number."
        ],
        correctIndex: 2
      },
      {
        type: "learn",
        heading: "Remember",
        text: "Reporting an account alerts the platform that it may be fake or breaking the rules. You can block and report the same account. If someone claiming to be family asks for money, verify their identity using a phone number you already know before doing anything else."
      }
    ],
    quiz: [
      { question: "What does reporting an account do?", options: ["Deletes your Facebook account.", "Sends money to Facebook.", "Alerts the platform that an account may be fake or breaking the rules.", "Automatically blocks every user."], correctIndex: 2 },
      { question: "Which situation should you report?", options: ["A friend sharing vacation photos", "Someone pretending to be another person, asking strangers for money, sending scam links, or running a fake giveaway"], correctIndex: 1 },
      { question: "True or False: You can block and report the same account.", options: ["True", "False"], correctIndex: 0 },
      { question: "If an account is pretending to be someone else, you should ______ it.", options: ["Report", "Camera", "Password"], correctIndex: 0 },
      { question: "Someone claiming to be your granddaughter asks for $300 through Facebook Messenger. What should you do?", options: ["Send the money.", "Reply with your credit card number.", "Contact your granddaughter using a phone number you already know, then report and block the account if it's fake.", "Ignore it but keep chatting."], correctIndex: 2 },
      { question: "What's the safest response to repeated scam messages from the same account?", options: ["Keep replying.", "Click the links to see if they're real.", "Block the account and report it.", "Forward the messages to everyone you know."], correctIndex: 2 }
    ],
    complete: {
      title: "Congratulations!",
      subtitle: "You completed Lesson 7: Reporting Fake Accounts!",
      learned: [
        "Recognize fake or scam social media accounts.",
        "Know when to report an account and when to block someone.",
        "Understand what happens after reporting.",
        "Help keep social media safer for everyone."
      ],
      next: "Phase 6 Final Exam"
    }
  }
];

// ============================================================
// PHASE 6 FINAL EXAM
// ============================================================
export const phase6Exam = {
  id: "phase6-exam",
  track: "literacy",
  phase: 6,
  order: 51,
  title: "Phase 6 Final Exam: Social Media",
  topics: [
    "Facebook Privacy",
    "Friend Request Scams",
    "Fake Giveaways",
    "Fake News",
    "Political Misinformation",
    "Deepfake Videos",
    "Reporting Fake Accounts"
  ],
  passingScore: 8,
  totalQuestions: 10,
  phaseBadge: "Social Media Safety Expert",
  phaseBadgeXp: 100,
  questions: [
    {
      question: "Which Facebook privacy setting is usually the safest for sharing personal photos with family and friends?",
      options: ["Public", "Everyone", "Friends", "Anyone with the link"],
      correctIndex: 2,
      explanation: "Choosing Friends helps limit who can see your personal posts."
    },
    {
      question: "Which of the following are warning signs of a fake Facebook profile?",
      options: ["A long history of posts and mutual friends", "Very few photos, no mutual friends, a newly created account, and immediately asking for money"],
      correctIndex: 1,
      explanation: "Scammers often create new profiles with little information and quickly ask for money or personal information."
    },
    {
      question: "Margaret sees this Facebook post: \"Congratulations! You won a $1,000 gift card! Just pay a $25 processing fee to claim it.\" What should she do?",
      options: ["Pay the fee.", "Enter her credit card information.", "Ignore the post and verify any giveaway through the company's official website.", "Share it with friends."],
      correctIndex: 2,
      explanation: "Legitimate giveaways should not require payment just to receive a prize."
    },
    {
      question: "Before sharing surprising news or videos online, always ______ the information.",
      options: ["Verify", "Friends", "AI"],
      correctIndex: 0,
      explanation: "Checking information before sharing helps prevent misinformation from spreading."
    },
    {
      question: "True or False: If a political post tells you to \"Share this before it's deleted!\", you should verify the information before sharing it.",
      options: ["True", "False"],
      correctIndex: 0,
      explanation: "Urgent language is a common tactic used in misinformation and scams."
    },
    {
      question: "Which of the following may be signs that a video is a deepfake?",
      options: ["Consistent lighting and natural lip movement", "Lips that don't match the words, a flickering or blurry face, and an unnatural voice"],
      correctIndex: 1,
      explanation: "Deepfakes often contain several unusual visual or audio clues, although not every deepfake has all of these signs."
    },
    {
      question: "Robert receives a Facebook message from someone pretending to be his grandson asking for $500. What should he do?",
      options: ["Send the money.", "Reply asking for more information.", "Contact his grandson using a phone number he already knows, then report and block the account if it's fake.", "Ignore it but keep chatting."],
      correctIndex: 2,
      explanation: "Always verify unexpected requests for money through another trusted method before taking action."
    },
    {
      question: "Which information should you avoid posting publicly on social media?",
      options: ["Your favorite hobby", "Home address, phone number, banking information, and Social Security number"],
      correctIndex: 1,
      explanation: "Personal and financial information should never be shared publicly."
    },
    {
      question: "You read a shocking news story on an unfamiliar website, but no trusted news organizations are reporting it. What should you do?",
      options: ["Share it because it sounds important.", "Believe it immediately.", "Wait and verify the information using trusted news organizations or official sources.", "Assume it's true because it has many comments."],
      correctIndex: 2,
      explanation: "Reliable news is often reported by multiple trusted organizations."
    },
    {
      question: "Someone repeatedly sends you scam links on Facebook Messenger. What is the best response?",
      options: ["Keep replying.", "Click one of the links to see if it's real.", "Ignore it but leave the conversation open.", "Block the account and report it."],
      correctIndex: 3,
      explanation: "Blocking protects you from future messages, and reporting helps protect other users from scams."
    }
  ],
  results: [
    { minScore: 10, title: "Social Media Master", xp: 100, trophy: true, message: "Outstanding! You know how to protect yourself from scams, fake accounts, misinformation, and unsafe sharing online." },
    { minScore: 8, title: "Social Media Safety Pro", xp: 80, trophy: false, message: "Great work! You have strong social media safety skills and know how to think before you click or share." },
    { minScore: 6, title: "Keep Practicing", xp: 40, trophy: false, message: "You're making excellent progress. Review the lessons you missed and try the exam again." },
    { minScore: 0, title: "Review Recommended", xp: 0, trophy: false, message: "Go back through the Phase 6 lessons and retake the exam when you're ready. Every lesson builds important skills for staying safe online." }
  ],
  nextPhase: "Phase 7: Emergency Skills"
};

export default phase6Lessons;
