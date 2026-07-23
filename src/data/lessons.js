// Everwise lesson data
// Phase 1: Foundations (digital literacy)
//
// FORMAT NOTES FOR THE TEAM:
// - Each lesson = 1 teach screen + 3 practice questions + 4 quiz questions
// - That is about 5 minutes, which matches what we promise users
// - Every question is multiple choice so the app only needs ONE question component
// - options can be 2, 3, or 4 items. correctIndex is zero-based (0 = first option)
// - Add new lessons by copying an object and changing the content

export const lessons = [
  {
    id: "internet",
    phase: 1,
    type: "skill",
    title: "What is the Internet?",
    badge: "Internet Explorer",
    xp: 20,

    learnText:
      "The internet is a worldwide network that connects millions of phones, computers, and tablets. Think of it like a system of roads. Instead of cars, information travels between devices. It lets you send email, watch videos, video call family, read news, and shop. The internet is not inside your phone. Your phone connects to it using Wi-Fi or cellular data.",

    practice: [
      {
        question: "Which one of these uses the internet?",
        options: ["Reading a printed newspaper", "Watching a video on YouTube"],
        correctIndex: 1,
        explanation: "Videos are sent to your device over the internet. A printed newspaper is already in your hands, so it needs no connection."
      },
      {
        question: "Susan wants to look up a cookie recipe. What should she use?",
        options: ["Television", "The internet", "A calculator"],
        correctIndex: 1,
        explanation: "Recipes live on websites, and you reach websites through the internet."
      },
      {
        question: "True or false: the internet only works on computers.",
        options: ["True", "False"],
        correctIndex: 1,
        explanation: "Phones, tablets, TVs, and even some doorbells connect to the internet."
      }
    ],

    quiz: [
      {
        question: "What is the internet?",
        options: [
          "A phone",
          "A worldwide network that connects devices",
          "A password"
        ],
        correctIndex: 1,
        explanation: "It connects devices all over the world so they can share information."
      },
      {
        question: "What is a website?",
        options: [
          "A page you visit on the internet",
          "A Wi-Fi password",
          "A charger"
        ],
        correctIndex: 0,
        explanation: "A website is one place on the internet, like one building in a city."
      },
      {
        question: "What app do you use to visit websites?",
        options: ["Calculator", "Camera", "A browser like Chrome or Safari"],
        correctIndex: 2,
        explanation: "A browser is the app that opens websites for you."
      },
      {
        question: "Linda wants to send an email. What does she need?",
        options: ["A television", "An internet connection", "A calculator"],
        correctIndex: 1,
        explanation: "Email travels over the internet, so she needs Wi-Fi or cellular data."
      }
    ]
  },

  {
    id: "ai",
    phase: 1,
    type: "skill",
    title: "What is AI?",
    badge: "AI Explorer",
    xp: 20,

    learnText:
      "AI stands for Artificial Intelligence. It is technology that can answer questions, help you write, translate languages, and recognize pictures. Think of it as a very smart assistant. You already use it: Siri, Netflix suggestions, and Google Maps picking your route all use AI. But AI can be wrong, and it can sound confident even when it is. For anything about your health, money, or legal matters, always check with a real professional.",

    practice: [
      {
        question: "Which of these uses AI?",
        options: ["A printed cookbook", "Netflix recommending a movie", "A flashlight"],
        correctIndex: 1,
        explanation: "Netflix uses AI to look at what you have watched and suggest something similar."
      },
      {
        question: "Margaret wants help writing a birthday card. Is AI a good tool for that?",
        options: ["Yes", "No"],
        correctIndex: 0,
        explanation: "Writing help is one of the things AI does best. You can always edit what it gives you."
      },
      {
        question: "Nancy has chest pain and asks AI whether it is serious. What should she do?",
        options: [
          "Follow whatever the AI says",
          "Call a doctor or emergency services"
        ],
        correctIndex: 1,
        explanation: "AI can explain general information, but it cannot examine you. Chest pain needs a real doctor right away."
      }
    ],

    quiz: [
      {
        question: "What does AI stand for?",
        options: ["Automatic Internet", "Artificial Intelligence", "Advanced Information"],
        correctIndex: 1,
        explanation: "Artificial Intelligence: technology that learns patterns and helps with tasks."
      },
      {
        question: "True or false: AI is always correct.",
        options: ["True", "False"],
        correctIndex: 1,
        explanation: "AI makes mistakes and can sound sure of itself while being wrong."
      },
      {
        question: "Which is a good use of AI?",
        options: [
          "Sharing your banking password with it",
          "Asking it to help write an email",
          "Letting it make your medical decisions"
        ],
        correctIndex: 1,
        explanation: "Writing, explaining, and brainstorming are safe. Never give it passwords or account numbers."
      },
      {
        question: "When should you double-check what AI tells you?",
        options: [
          "Never",
          "When it involves your health, money, or legal matters",
          "Only on weekends"
        ],
        correctIndex: 1,
        explanation: "Anything that could cost you money or affect your health is worth confirming with a real person."
      }
    ]
  },

  {
    id: "chatgpt",
    phase: 1,
    type: "skill",
    title: "What is ChatGPT?",
    badge: "ChatGPT Communicator",
    xp: 20,

    learnText:
      "ChatGPT is an AI assistant you can have a conversation with. You type a question, and it answers in seconds. It can help write emails, explain confusing topics, suggest recipes, and plan trips. What you type is called a prompt. The clearer your prompt, the better the answer. Instead of typing 'help', try 'help me write a thank-you note to my neighbor'. Never give it passwords, your Social Security number, or bank information.",

    practice: [
      {
        question: "Which prompt would get a better answer?",
        options: ["Help", "Explain how to connect my phone to Wi-Fi"],
        correctIndex: 1,
        explanation: "The more specific you are, the more useful the answer. One word gives it nothing to work with."
      },
      {
        question: "Carol wants help writing an email inviting friends to lunch. Should she ask ChatGPT?",
        options: ["Yes", "No"],
        correctIndex: 0,
        explanation: "Writing invitations and emails is exactly what it is good at."
      },
      {
        question: "Which of these should you never type into ChatGPT?",
        options: [
          "A recipe question",
          "Your bank password",
          "A request to explain a news story"
        ],
        correctIndex: 1,
        explanation: "Never share passwords, account numbers, or Social Security numbers with any AI service."
      }
    ],

    quiz: [
      {
        question: "What is ChatGPT?",
        options: [
          "A search engine",
          "An AI assistant that answers questions",
          "A Wi-Fi network"
        ],
        correctIndex: 1,
        explanation: "It is an assistant you can have a back-and-forth conversation with."
      },
      {
        question: "What is a prompt?",
        options: [
          "A password",
          "The question or instruction you type in",
          "A website"
        ],
        correctIndex: 1,
        explanation: "Your prompt is your message to it. Clear prompts get better answers."
      },
      {
        question: "True or false: ChatGPT always gives perfect answers.",
        options: ["True", "False"],
        correctIndex: 1,
        explanation: "It makes mistakes. Check anything important."
      },
      {
        question: "You need help writing to your insurance company. What is the best approach?",
        options: [
          "Give ChatGPT your password so it can log in",
          "Ask it to draft the email, then read it over before sending",
          "Avoid it completely"
        ],
        correctIndex: 1,
        explanation: "Let it write the first draft, then you check it. It cannot and should not log into your accounts."
      }
    ]
  }
];

export default lessons;
