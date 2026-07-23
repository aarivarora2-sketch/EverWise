// Everwise - Digital Literacy track
// Phase 1: Foundations (this file) + Phase 2: Safe Internet Habits (phase2-lessons.js)
// NOTE: Lesson 6 (What is Wi-Fi?) is referenced in the curriculum but was not in
// the source document. Add it here when written.
//
// BLOCK TYPES: learn, multiselect, flashcards, match, fillblank, sort,
//              scenario, truefalse, choice, builder

import { phase2Lessons } from "./phase2-lessons";
import { phase3Lessons, phase3Exam } from "./phase3-lessons";
import {
  phase4Lessons,
  phase4Challenge,
  phase4Exam,
} from "./phase4-lessons";
import { phase5Lessons, phase5Exam } from "./phase5-lessons";

export const lessons = [
  // ============================================================
  // LESSON 1
  // ============================================================
  {
    id: "internet",
    phase: 1,
    order: 1,
    title: "What is the Internet?",
    pathTitle: "The Internet",
    badge: "Internet Explorer",
    xp: 20,
    goals: [
      "Explain what the internet is in simple words.",
      "Recognize common ways people use the internet.",
      "Understand that the internet connects devices around the world.",
      "Know the difference between the internet and Wi-Fi."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What is the Internet?",
        text: "The internet is a worldwide network that connects millions of computers, phones, tablets, and other devices. Think of the internet like a giant system of roads. Instead of cars traveling on roads, information travels between devices.",
        bullets: ["Send emails", "Watch videos", "Talk with family", "Read the news", "Shop online", "Listen to music"],
        footer: "Without the internet, many apps and websites would not work."
      },
      {
        type: "learn",
        heading: "Imagine the Internet",
        text: "Think about calling a friend across the country. When you make a video call, your phone sends information through the internet. Your friend's phone receives it almost instantly. The internet makes the connection possible. The internet works all around the world, 24 hours a day."
      },
      {
        type: "learn",
        heading: "Everyday Internet Examples",
        text: "Which of these use the internet?",
        bullets: [
          "Watching YouTube",
          "Sending an email",
          "Using Google Maps",
          "Listening to Spotify",
          "Reading an online newspaper",
          "Making a FaceTime call"
        ],
        footer: "Even checking tomorrow's weather usually uses the internet."
      },
      {
        type: "learn",
        heading: "Did You Know?",
        text: "The internet is not inside your phone. Your phone connects to the internet using Wi-Fi or cellular data. You'll learn more about Wi-Fi in a later lesson."
      },
      {
        type: "multiselect",
        title: "What Uses the Internet?",
        prompt: "Tap every activity that uses the internet.",
        options: [
          { text: "Reading a printed newspaper", correct: false },
          { text: "Watching Netflix", correct: true },
          { text: "Sending an email", correct: true },
          { text: "Looking up directions", correct: true },
          { text: "Video calling your granddaughter", correct: true },
          { text: "Writing on paper", correct: false }
        ],
        feedback: "Great job! Streaming videos, searching online, sending emails, and video calling all use the internet."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Internet", back: "A worldwide network that connects devices and shares information." },
          { front: "Online", back: "Connected to the internet." },
          { front: "Offline", back: "Not connected to the internet." },
          { front: "Website", back: "A page you visit on the internet." },
          { front: "Browser", back: "An app used to visit websites. Examples: Chrome, Safari, Firefox." }
        ]
      },
      {
        type: "match",
        title: "Match the Word",
        pairs: [
          { word: "Internet", match: "Connects devices around the world" },
          { word: "Website", match: "A page you visit online" },
          { word: "Browser", match: "Lets you open websites" },
          { word: "Online", match: "Connected to the internet" },
          { word: "Offline", match: "Not connected to the internet" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Internet", "Website", "Phone", "Book"],
        questions: [
          { text: "The ______ connects millions of devices around the world.", answer: "Internet" },
          { text: "Google.com is a ______.", answer: "Website" },
          { text: "You can use your ______ to access the internet.", answer: "Phone" }
        ]
      },
      {
        type: "sort",
        title: "Internet or Not?",
        prompt: "Drag each activity into the correct box.",
        categories: [
          { label: "Uses the Internet", items: ["Watch YouTube", "Send an email", "Video call family", "Use Google Maps", "Check the weather"] },
          { label: "Does NOT Need the Internet", items: ["Read a paper book", "Write in a notebook", "Play with a deck of cards", "Solve a crossword puzzle"] }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Susan wants to look up a cookie recipe. What should she use?",
        options: ["Television", "Internet", "Calculator", "Flashlight"],
        correctIndex: 1,
        explanation: "Recipes are usually found on websites using the internet."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert wants to video chat with his grandson in another state. What makes this possible?",
        options: ["Bluetooth", "Camera", "Internet", "Flashlight"],
        correctIndex: 2
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Emily downloads today's weather forecast. Is she using the internet?",
        options: ["No", "Yes"],
        correctIndex: 1
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "The internet gives you access to millions of websites, videos, and services. Think of it like the world's largest library that's always open."
      },
      {
        type: "truefalse",
        title: "True or False?",
        questions: [
          { text: "The internet only works on computers.", answer: false, explanation: "Phones, tablets, TVs, and many smart devices can all use the internet." },
          { text: "You can send emails using the internet.", answer: true },
          { text: "A website is the same thing as the internet.", answer: false, explanation: "A website is one place on the internet." },
          { text: "You need some way to connect to the internet, like Wi-Fi or cellular data.", answer: true }
        ]
      },
      {
        type: "choice",
        title: "Detective Challenge",
        text: "Which activity does NOT use the internet?",
        options: ["Watching Netflix", "Searching Google", "FaceTiming family", "Reading a printed newspaper"],
        correctIndex: 3
      },
      {
        type: "sort",
        title: "Sorting Game",
        prompt: "Put each item into the correct group.",
        categories: [
          { label: "Internet", items: ["Google Maps", "Facebook", "YouTube", "Amazon", "Email"] },
          { label: "Not the Internet", items: ["Television remote", "Notebook", "Photo album", "Board game", "Printed newspaper"] }
        ]
      },
      {
        type: "learn",
        heading: "Remember",
        text: "The internet:",
        bullets: ["Connects devices", "Lets people communicate", "Helps you find information", "Works around the world"]
      }
    ],
    quiz: [
      { question: "What is the internet?", options: ["A phone", "A television", "A worldwide network that connects devices", "A password"], correctIndex: 2 },
      { question: "Which activity uses the internet?", options: ["Reading a printed newspaper", "Playing cards", "Watching YouTube", "Writing with a pencil"], correctIndex: 2 },
      { question: "What is a website?", options: ["A phone", "A Wi-Fi password", "A page you visit on the internet", "A charger"], correctIndex: 2 },
      { question: "What app helps you visit websites?", options: ["Calculator", "Camera", "Browser", "Flashlight"], correctIndex: 2 },
      { question: "True or False: The internet only works on computers.", options: ["True", "False"], correctIndex: 1 },
      { question: "The ______ connects millions of devices.", options: ["Internet", "Book", "Phone"], correctIndex: 0 },
      { question: "Linda wants to send an email. What does she need?", options: ["A flashlight", "A television", "An internet connection", "A calculator"], correctIndex: 2 },
      { question: "Which of these is NOT using the internet?", options: ["Looking up directions", "Watching Netflix", "Sending an email", "Reading a paper book"], correctIndex: 3 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed What is the Internet?",
      learned: [
        "Explain what the internet is.",
        "Recognize common internet activities.",
        "Understand that websites are part of the internet.",
        "Know that the internet connects people and devices around the world."
      ],
      next: "What is AI?"
    }
  },

  // ============================================================
  // LESSON 2
  // ============================================================
  {
    id: "ai",
    phase: 1,
    order: 2,
    title: "What is AI?",
    pathTitle: "AI",
    badge: "AI Explorer",
    xp: 20,
    goals: [
      "Explain what Artificial Intelligence (AI) is.",
      "Recognize everyday examples of AI.",
      "Understand that AI is a tool that can help people.",
      "Know that AI can make mistakes and should not always be trusted without checking."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What is AI?",
        text: "AI stands for Artificial Intelligence. Artificial Intelligence is technology that can learn patterns, answer questions, solve problems, and help people complete tasks. Think of AI like a very smart assistant. It can help you, but it doesn't think or feel like a person.",
        bullets: ["Answer questions", "Help write emails or letters", "Translate languages", "Summarize articles", "Recognize pictures", "Understand spoken words"],
        footer: "AI is becoming more common in everyday life."
      },
      {
        type: "learn",
        heading: "Where Can You Find AI?",
        text: "You may already use AI without realizing it!",
        bullets: ["Siri or Google Assistant", "Amazon product recommendations", "Netflix movie suggestions", "Google Maps suggesting the fastest route", "Gmail filtering spam emails", "ChatGPT answering questions"],
        footer: "AI helps make many apps smarter and easier to use."
      },
      {
        type: "learn",
        heading: "AI Is a Helper, Not an Expert",
        text: "AI can be very helpful, but it can also make mistakes. AI may give outdated information. AI may misunderstand your question. AI may sound confident even when it's wrong. For important decisions such as medical, legal, or financial advice, always check with a trusted professional or official source."
      },
      {
        type: "multiselect",
        title: "Which Ones Use AI?",
        prompt: "Tap every example that uses AI.",
        options: [
          { text: "Siri answering your question", correct: true },
          { text: "Netflix recommending a movie", correct: true },
          { text: "Google Maps suggesting a faster route", correct: true },
          { text: "ChatGPT helping write an email", correct: true },
          { text: "A printed cookbook", correct: false },
          { text: "A flashlight", correct: false }
        ],
        feedback: "Great job! Many apps use AI to make personalized suggestions or answer questions."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "AI", back: "Technology that can learn patterns and help complete tasks." },
          { front: "Artificial Intelligence", back: "The full name for AI." },
          { front: "Prompt", back: "A question or instruction you give to AI." },
          { front: "Response", back: "The answer AI gives back to you." },
          { front: "Chatbot", back: "A computer program that can have conversations with people." }
        ]
      },
      {
        type: "match",
        title: "Match the Word",
        pairs: [
          { word: "AI", match: "Technology that helps solve problems" },
          { word: "Prompt", match: "A question you ask AI" },
          { word: "Response", match: "AI's answer" },
          { word: "Chatbot", match: "A program that talks with people" },
          { word: "Artificial Intelligence", match: "The full name of AI" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Artificial", "Prompt", "Helpful", "Perfect", "Letter", "Picture", "Phone"],
        questions: [
          { text: "AI stands for ______ Intelligence.", answer: "Artificial" },
          { text: "You ask AI a ______.", answer: "Prompt" },
          { text: "AI can be very ______, but it can still make mistakes.", answer: "Helpful" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret wants help writing a birthday card for her granddaughter. Should she use AI?",
        options: ["No", "Yes"],
        correctIndex: 1,
        explanation: "AI can help write ideas or messages."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "David asks AI what he should eat for dinner based on what's in his refrigerator. Good use of AI?",
        options: ["No", "Yes"],
        correctIndex: 1
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Nancy asks AI if a pain in her chest is serious and follows the advice without talking to a doctor. Is this the safest choice?",
        options: ["Yes", "No"],
        correctIndex: 1,
        explanation: "AI can provide general information, but it should not replace professional medical advice for serious health concerns."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "AI works best when you ask clear questions. Instead of asking \"Help.\" try asking \"Help me write a thank-you email.\" or \"Explain what Wi-Fi is in simple words.\" The more specific your question is, the better AI can help."
      },
      {
        type: "choice",
        title: "Which Question Would AI Answer Best?",
        text: "\"I forgot how to bake cookies.\"",
        options: ["Ask AI", "Ask your dentist", "Call emergency services"],
        correctIndex: 0
      },
      {
        type: "choice",
        title: "Which Question Would AI Answer Best?",
        text: "\"I think I'm having a heart attack.\"",
        options: ["Ask AI", "Call emergency services or seek immediate medical help"],
        correctIndex: 1
      },
      {
        type: "choice",
        title: "Which Question Would AI Answer Best?",
        text: "\"Help me write a birthday invitation.\"",
        options: ["Ask AI", "Ask the weather app"],
        correctIndex: 0
      },
      {
        type: "choice",
        title: "Which Question Would AI Answer Best?",
        text: "\"My bank account was hacked.\"",
        options: ["Only ask AI", "Contact your bank immediately"],
        correctIndex: 1
      },
      {
        type: "truefalse",
        title: "True or False?",
        questions: [
          { text: "AI stands for Artificial Intelligence.", answer: true },
          { text: "AI is always correct.", answer: false, explanation: "AI can make mistakes." },
          { text: "AI can help write emails.", answer: true },
          { text: "You should always double-check important information from AI.", answer: true }
        ]
      },
      {
        type: "choice",
        title: "Detective Challenge",
        text: "Which answer is the best use of AI?",
        options: [
          "Asking AI to diagnose a serious illness",
          "Asking AI for your bank password",
          "Asking AI to explain a confusing topic",
          "Asking AI to make important legal decisions for you"
        ],
        correctIndex: 2
      },
      {
        type: "sort",
        title: "Sorting Game",
        prompt: "Drag each activity into the correct box.",
        categories: [
          { label: "Good Uses of AI", items: ["Summarizing an article", "Writing an email", "Brainstorming vacation ideas", "Translating a sentence", "Explaining a recipe"] },
          { label: "Not the Best Use of AI Alone", items: ["Diagnosing serious medical problems", "Sending money without verifying information", "Deciding legal matters without professional advice", "Sharing passwords or personal information", "Trusting every answer without checking"] }
        ]
      },
      {
        type: "learn",
        heading: "Remember",
        text: "AI can answer questions, explain ideas, help you write, and save time. But remember: AI can make mistakes. Always double-check important information. Never share passwords, Social Security numbers, or banking information with AI unless you fully trust the service and understand how your information will be used."
      }
    ],
    quiz: [
      { question: "What does AI stand for?", options: ["Automatic Internet", "Artificial Internet", "Artificial Intelligence", "Advanced Information"], correctIndex: 2 },
      { question: "Which of these uses AI?", options: ["Printed newspaper", "Flashlight", "Siri", "Pencil"], correctIndex: 2 },
      { question: "True or False: AI is always correct.", options: ["True", "False"], correctIndex: 1 },
      { question: "AI stands for ______ Intelligence.", options: ["Artificial", "Computer", "Internet"], correctIndex: 0 },
      { question: "Which is a good use of AI?", options: ["Sharing your banking password", "Letting AI make every medical decision", "Asking AI to help write an email", "Giving AI your Social Security number"], correctIndex: 2 },
      { question: "Which of these can AI NOT help with?", options: ["Writing letters", "Answering questions", "Translating languages", "Fixing a broken television"], correctIndex: 3 },
      { question: "Mary asks AI to explain what Wi-Fi is. Is this a good use of AI?", options: ["No", "Yes"], correctIndex: 1 },
      { question: "When should you double-check AI's answer?", options: ["Never", "Only if it's funny", "When the information is important, especially for health, money, or legal matters", "Only on weekends"], correctIndex: 2 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed What is AI?",
      learned: [
        "Explain what AI is.",
        "Recognize common examples of AI.",
        "Use AI for everyday tasks like writing and learning.",
        "Understand that AI can make mistakes and should be checked when the information is important."
      ],
      next: "What is ChatGPT?"
    }
  },

  // ============================================================
  // LESSON 3
  // ============================================================
  {
    id: "chatgpt",
    phase: 1,
    order: 3,
    title: "What is ChatGPT?",
    pathTitle: "ChatGPT",
    badge: "ChatGPT Communicator",
    xp: 20,
    goals: [
      "Explain what ChatGPT is.",
      "Understand what ChatGPT can and cannot do.",
      "Ask ChatGPT clear questions (called prompts).",
      "Use ChatGPT safely without sharing sensitive personal information."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What is ChatGPT?",
        text: "ChatGPT is an AI assistant that you can have a conversation with. You type a question, and ChatGPT responds in seconds. Think of ChatGPT as a helpful digital assistant that can:",
        bullets: ["Answer questions", "Help write emails and letters", "Explain difficult topics", "Translate languages", "Suggest recipes", "Help plan trips", "Give ideas for parties or events"],
        footer: "ChatGPT does not know everything and can sometimes make mistakes."
      },
      {
        type: "learn",
        heading: "What Can ChatGPT Help With?",
        text: "Here are some everyday examples.",
        bullets: [
          "\"Help me write an email to my doctor.\"",
          "\"Give me an easy chocolate chip cookie recipe.\"",
          "\"Explain what a hurricane is.\"",
          "\"Help me solve this crossword clue.\"",
          "\"Plan a road trip from San Diego to Los Angeles.\"",
          "\"Explain Wi-Fi in simple words.\""
        ]
      },
      {
        type: "learn",
        heading: "What ChatGPT Should NOT Be Used For",
        text: "ChatGPT should not replace professionals for important decisions. Avoid relying on ChatGPT alone for:",
        bullets: ["Medical emergencies", "Legal advice", "Financial decisions", "Passwords or account recovery"],
        footer: "Always verify important information with trusted sources."
      },
      {
        type: "multiselect",
        title: "Which Questions Could ChatGPT Help Answer?",
        prompt: "Tap every question that ChatGPT could help with.",
        options: [
          { text: "\"Can you explain what Wi-Fi is?\"", correct: true },
          { text: "\"Help me write a birthday card.\"", correct: true },
          { text: "\"Give me dinner ideas with chicken.\"", correct: true },
          { text: "\"What are some exercises I can do at home?\"", correct: true },
          { text: "\"Can you unlock my bank account?\"", correct: false },
          { text: "\"Can you tell me my Social Security number?\"", correct: false }
        ],
        feedback: "Great job! ChatGPT can help with information, writing, planning, and ideas, but it cannot access your personal accounts or private information."
      },
      {
        type: "learn",
        heading: "Example Conversation",
        text: "You: Hello! Can you help me write a thank-you note?\n\nChatGPT: Of course! Here's a friendly thank-you note: \"Thank you so much for your thoughtful gift. It meant a lot to me, and I truly appreciate your kindness.\"\n\nYou: Can you make it shorter?\n\nChatGPT: \"Thank you for your thoughtful gift. I really appreciate it!\""
      },
      {
        type: "learn",
        heading: "What Is a Prompt?",
        text: "A prompt is the message or question you type into ChatGPT. The clearer your prompt, the better the answer.\n\nInstead of: \"Help.\"\nTry: \"Help me write a grocery list for a family dinner.\"\n\nInstead of: \"Vacation.\"\nTry: \"Plan a three-day trip to San Diego with free activities.\""
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "ChatGPT", back: "An AI assistant that answers questions and helps with many everyday tasks." },
          { front: "Prompt", back: "The question or instruction you type into ChatGPT." },
          { front: "Response", back: "The answer ChatGPT gives." },
          { front: "Conversation", back: "Talking back and forth with ChatGPT." },
          { front: "AI Assistant", back: "A computer program that helps answer questions and complete tasks." }
        ]
      },
      {
        type: "match",
        title: "Match the Word",
        pairs: [
          { word: "ChatGPT", match: "AI assistant" },
          { word: "Prompt", match: "What you type" },
          { word: "Response", match: "ChatGPT's answer" },
          { word: "Conversation", match: "Talking back and forth" },
          { word: "AI Assistant", match: "Technology that helps answer questions" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Prompt", "Response", "Conversation", "Question", "Picture", "Password", "Phone", "Meeting", "Video"],
        questions: [
          { text: "The message you type to ChatGPT is called a ______.", answer: "Prompt" },
          { text: "ChatGPT gives a ______ to your prompt.", answer: "Response" },
          { text: "You and ChatGPT have a ______ when you talk back and forth.", answer: "Conversation" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Carol wants help writing an email inviting friends to lunch. Should she ask ChatGPT?",
        options: ["No", "Yes"],
        correctIndex: 1,
        explanation: "ChatGPT is great at helping write emails and invitations."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "George forgot how to cook rice. Should he ask ChatGPT for instructions?",
        options: ["No", "Yes"],
        correctIndex: 1
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda wants ChatGPT to tell her whether she should stop taking her heart medication without talking to her doctor. Is this the safest choice?",
        options: ["Yes", "No"],
        correctIndex: 1,
        explanation: "ChatGPT can provide general information, but medical decisions should be made with a healthcare professional."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "The more details you include, the better ChatGPT can help. Instead of \"Write an email.\" try \"Write a friendly email thanking my neighbor for watering my plants while I was on vacation.\""
      },
      {
        type: "choice",
        title: "Which Prompt Is Better?",
        text: "Choose the better prompt.",
        options: ["Help", "Explain how to connect my phone to Wi-Fi."],
        correctIndex: 1
      },
      {
        type: "choice",
        title: "Which Prompt Is Better?",
        text: "Choose the better prompt.",
        options: ["Vacation", "Plan a two-day trip to San Diego with museums and restaurants."],
        correctIndex: 1
      },
      {
        type: "choice",
        title: "Which Prompt Is Better?",
        text: "Choose the better prompt.",
        options: ["Food", "Give me three healthy dinner recipes with chicken and vegetables."],
        correctIndex: 1,
        explanation: "Excellent! Specific prompts help ChatGPT give more useful answers."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each item into the correct box.",
        categories: [
          { label: "Safe to Ask ChatGPT", items: ["Help write an email", "Explain a science topic", "Plan a vacation", "Translate a sentence", "Create a grocery list"] },
          { label: "Don't Rely on ChatGPT Alone For", items: ["Medical emergencies", "Legal decisions", "Investment advice", "Passwords", "Social Security numbers"] }
        ]
      },
      {
        type: "learn",
        heading: "Remember",
        text: "ChatGPT can answer questions, explain ideas, help you write, give suggestions, and save time. But remember: ChatGPT can make mistakes. Double-check important information. Never share passwords, Social Security numbers, or banking information."
      }
    ],
    quiz: [
      { question: "What is ChatGPT?", options: ["A search engine", "A phone app store", "An AI assistant that answers questions", "A Wi-Fi network"], correctIndex: 2 },
      { question: "What is a prompt?", options: ["A password", "A website", "The question or instruction you type into ChatGPT", "A picture"], correctIndex: 2 },
      { question: "True or False: ChatGPT always gives perfect answers.", options: ["True", "False"], correctIndex: 1 },
      { question: "The message you type into ChatGPT is called a ______.", options: ["Prompt", "Internet", "Phone"], correctIndex: 0 },
      { question: "Which is a good use of ChatGPT?", options: ["Recovering your bank password", "Diagnosing a medical emergency", "Helping write a thank-you letter", "Accessing your email account"], correctIndex: 2 },
      { question: "Which information should you NOT share with ChatGPT?", options: ["Your favorite recipe", "Passwords, Social Security numbers, and bank information", "A question about the weather"], correctIndex: 1 },
      { question: "Susan asks ChatGPT to explain what cybersecurity means. Is this a good use of ChatGPT?", options: ["No", "Yes"], correctIndex: 1 },
      { question: "You need help writing an email to your insurance company. What should you do?", options: ["Avoid ChatGPT completely.", "Give ChatGPT your password.", "Ask ChatGPT to help draft the email, then review it before sending.", "Ask ChatGPT to log in to your account for you."], correctIndex: 2 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed What is ChatGPT?",
      learned: [
        "Explain what ChatGPT is.",
        "Write clear prompts to get better answers.",
        "Use ChatGPT for everyday tasks like writing, learning, and planning.",
        "Use ChatGPT safely by protecting your personal information and checking important answers."
      ],
      next: "What is a Search Engine?"
    }
  },

  // ============================================================
  // LESSON 4
  // ============================================================
  {
    id: "search-engine",
    phase: 1,
    order: 4,
    title: "What is a Search Engine?",
    pathTitle: "Search Engines",
    badge: "Search Expert",
    xp: 20,
    goals: [
      "Explain what a search engine is.",
      "Understand the difference between the internet and a search engine.",
      "Search for information using simple keywords.",
      "Recognize that not every search result is trustworthy."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What is a Search Engine?",
        text: "A search engine is a tool that helps you find information on the internet. Think of it like the index of a library. Instead of searching through millions of websites yourself, you type what you're looking for, and the search engine finds websites that may have the answer.",
        bullets: ["Google", "Bing", "DuckDuckGo"],
        footer: "A search engine does not create the internet. It simply helps you find information on it."
      },
      {
        type: "learn",
        heading: "Internet vs. Search Engine",
        text: "Many people think Google is the internet, but they are different.\n\nInternet = The entire world of websites and information.\nSearch Engine = A tool that helps you find places on the internet.\n\nImagine the internet is a giant city. A search engine is like a GPS that helps you find the building you want."
      },
      {
        type: "learn",
        heading: "What Can You Search For?",
        text: "You can search for almost anything.",
        bullets: ["Weather", "Cookie recipes", "Nearby hospitals", "Movie times", "History facts", "Travel ideas", "News", "Information about medicines"]
      },
      {
        type: "learn",
        heading: "Good Searches Use Keywords",
        text: "Instead of typing \"I forgot how to make chocolate chip cookies.\" try \"Chocolate chip cookie recipe\".\n\nInstead of \"I need a place near me that sells flowers.\" try \"Flower shop near me\".\n\nShort, clear keywords often give better results."
      },
      {
        type: "multiselect",
        title: "Which One Is a Search Engine?",
        prompt: "Tap every search engine.",
        options: [
          { text: "Google", correct: true },
          { text: "Bing", correct: true },
          { text: "DuckDuckGo", correct: true },
          { text: "YouTube", correct: false },
          { text: "Facebook", correct: false },
          { text: "Netflix", correct: false }
        ],
        feedback: "Great job! Google, Bing, and DuckDuckGo help you search the internet."
      },
      {
        type: "learn",
        heading: "Example Search",
        text: "You want to know tomorrow's weather. You open Google. You type: Weather tomorrow San Diego. The search engine shows websites with the forecast. You choose one to read."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Search Engine", back: "A tool that helps you find information on the internet." },
          { front: "Search", back: "Typing words to find information." },
          { front: "Keyword", back: "An important word or phrase you type into a search engine." },
          { front: "Search Results", back: "The list of websites shown after you search." },
          { front: "Website", back: "A page you visit on the internet." }
        ]
      },
      {
        type: "match",
        title: "Match the Word",
        pairs: [
          { word: "Search Engine", match: "Finds websites" },
          { word: "Keyword", match: "Words you type to search" },
          { word: "Search Results", match: "List of websites" },
          { word: "Website", match: "A page on the internet" },
          { word: "Google", match: "A search engine" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Search Engine", "Websites", "Keywords", "Book", "Cars", "Passwords", "Photos", "Messages"],
        questions: [
          { text: "Google is a ______.", answer: "Search Engine" },
          { text: "A search engine helps you find ______.", answer: "Websites" },
          { text: "The words you type into Google are called ______.", answer: "Keywords" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret wants to find a banana bread recipe. What should she use?",
        options: ["Calculator", "Camera", "Search engine", "Calendar"],
        correctIndex: 2,
        explanation: "A search engine helps you find recipes and websites."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "John needs directions to the nearest pharmacy. What should he search?",
        options: ["My television", "Password", "Pharmacy near me", "Flashlight"],
        correctIndex: 2
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Susan types \"Today's weather\" into Google. What will happen?",
        options: ["Her phone turns off.", "She sends a text.", "Google shows websites with today's weather.", "Nothing happens."],
        correctIndex: 2
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "The first result is not always the best one. Before clicking, read the title, look at the website address, and choose websites you recognize and trust. You'll learn more about spotting trustworthy websites in later lessons."
      },
      {
        type: "choice",
        title: "Choose the Best Search",
        text: "You want spaghetti recipes.",
        options: ["Food", "Dinner", "Easy spaghetti recipe", "Kitchen"],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "Choose the Best Search",
        text: "You want today's weather.",
        options: ["Outside", "Clouds", "Weather today", "Rain"],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "Choose the Best Search",
        text: "You need your bank's phone number.",
        options: ["Bank", "First National Bank customer service", "Money", "Card"],
        correctIndex: 1,
        explanation: "Excellent! Specific searches usually give better results."
      },
      {
        type: "sort",
        title: "Search Engine or Website?",
        prompt: "Drag each item into the correct box.",
        categories: [
          { label: "Search Engines", items: ["Google", "Bing", "DuckDuckGo"] },
          { label: "Websites", items: ["YouTube", "Wikipedia", "Amazon", "Weather.com", "ESPN"] }
        ]
      },
      {
        type: "learn",
        heading: "Remember",
        text: "A search engine helps you find information, searches millions of websites, works using keywords, and makes finding information easier. But remember: not every website is trustworthy. Read carefully before clicking."
      }
    ],
    quiz: [
      { question: "What does a search engine do?", options: ["Connects your Wi-Fi", "Sends text messages", "Helps you find information on the internet", "Stores your passwords"], correctIndex: 2 },
      { question: "Which of these is a search engine?", options: ["Amazon", "Netflix", "Google", "YouTube"], correctIndex: 2 },
      { question: "True or False: Google is the internet.", options: ["True", "False"], correctIndex: 1 },
      { question: "The words you type into a search engine are called ______.", options: ["Keywords", "Password", "Photo"], correctIndex: 0 },
      { question: "You want to find a nearby pizza restaurant. What should you search?", options: ["Pizza", "Restaurant", "Pizza near me", "Dinner"], correctIndex: 2 },
      { question: "Which website would you be more likely to trust for weather information?", options: ["A website with many pop-up ads and no organization name", "A well-known weather website or your local weather service"], correctIndex: 1 },
      { question: "Mary wants to learn how to knit. What should she use?", options: ["Flashlight", "Calculator", "Search engine", "Camera"], correctIndex: 2 },
      { question: "When using a search engine, what should you do before clicking a result?", options: ["Click the first result without looking", "Click every result", "Read the title and make sure the website looks trustworthy", "Ignore the website address"], correctIndex: 2 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed What is a Search Engine?",
      learned: [
        "Explain what a search engine is.",
        "Understand the difference between the internet and a search engine.",
        "Use keywords to find information.",
        "Think carefully before clicking search results."
      ],
      next: "What is an App?"
    }
  },

  // ============================================================
  // LESSON 5
  // ============================================================
  {
    id: "app",
    phase: 1,
    order: 5,
    title: "What is an App?",
    pathTitle: "Apps",
    badge: "App Explorer",
    xp: 20,
    goals: [
      "Explain what an app is.",
      "Recognize common apps on a smartphone or tablet.",
      "Understand the difference between an app and a website.",
      "Open and use apps safely."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What is an App?",
        text: "An app (short for application) is a program you use on your phone, tablet, or computer to complete a task. Think of an app like a tool in a toolbox. Each app has a different job.",
        bullets: ["Send messages", "Read email", "Get directions", "Take photos", "Listen to music", "Check your bank account", "Check the weather"],
        footer: "You can open an app by tapping its icon."
      },
      {
        type: "learn",
        heading: "What Do Apps Look Like?",
        text: "Apps usually appear as small icons on your home screen. Some common apps include:",
        bullets: ["Phone", "Messages", "Mail", "Camera", "Maps", "Weather", "Spotify", "YouTube", "Facebook", "Banking App"],
        footer: "Each app is designed for one or more specific tasks."
      },
      {
        type: "learn",
        heading: "App vs. Website",
        text: "An app is installed on your phone or tablet and opened by tapping an icon. It may work even without the internet, depending on the app. Examples: Camera, Calculator, Weather App, Facebook App.\n\nA website is opened in a web browser like Chrome or Safari. It has a web address (such as www.weather.com) and usually requires an internet connection.\n\nThink of it this way: an app is like a TV remote. A website is like a TV channel you visit using the remote."
      },
      {
        type: "learn",
        heading: "Did You Know?",
        text: "Many companies have both an app and a website. For example, the Bank of America App and bankofamerica.com. You can often do the same tasks using either one."
      },
      {
        type: "multiselect",
        title: "Which of These Are Apps?",
        prompt: "Tap every app.",
        options: [
          { text: "Camera", correct: true },
          { text: "Messages", correct: true },
          { text: "Maps", correct: true },
          { text: "Weather", correct: true },
          { text: "Facebook", correct: true },
          { text: "Calculator", correct: true },
          { text: "The Internet", correct: false },
          { text: "Wi-Fi", correct: false }
        ],
        feedback: "Great job! Apps are programs you open on your device. The internet and Wi-Fi help apps connect online, but they are not apps."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "App", back: "A program that helps you complete a task on your device." },
          { front: "App Icon", back: "The picture you tap to open an app." },
          { front: "Website", back: "A page you visit using a web browser." },
          { front: "Browser", back: "An app used to visit websites." },
          { front: "Home Screen", back: "The main screen where your app icons appear." }
        ]
      },
      {
        type: "match",
        title: "Match the App to Its Job",
        pairs: [
          { word: "Camera", match: "Take pictures" },
          { word: "Messages", match: "Send text messages" },
          { word: "Maps", match: "Find directions" },
          { word: "Mail", match: "Send and receive email" },
          { word: "Weather", match: "Check the forecast" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["App", "Website", "Camera", "Browser"],
        questions: [
          { text: "A program on your phone is called an ______.", answer: "App" },
          { text: "You usually visit a ______ using a browser.", answer: "Website" },
          { text: "The ______ app lets you take pictures.", answer: "Camera" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Mary wants to check tomorrow's weather. What app should she open?",
        options: ["Camera", "Messages", "Weather", "Photos"],
        correctIndex: 2,
        explanation: "The Weather app shows forecasts and temperatures."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert wants directions to his doctor's office. Which app should he use?",
        options: ["Calculator", "Camera", "Maps", "Music"],
        correctIndex: 2
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda wants to send her granddaughter a text message. Which app should she open?",
        options: ["Photos", "Weather", "Maps", "Messages"],
        correctIndex: 3
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Only download apps from your device's official app store. For iPhone, use the App Store. For Android, use the Google Play Store. This helps reduce the risk of downloading fake or harmful apps."
      },
      {
        type: "sort",
        title: "App or Website?",
        prompt: "Drag each item into the correct box.",
        categories: [
          { label: "Apps", items: ["Camera", "Messages", "Maps", "Facebook App", "Calculator"] },
          { label: "Websites", items: ["weather.com", "irs.gov", "amazon.com", "wikipedia.org", "youtube.com"] }
        ]
      },
      {
        type: "choice",
        title: "Which App Would You Use?",
        text: "You want to call your daughter.",
        options: ["Camera", "Weather", "Phone", "Maps"],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "Which App Would You Use?",
        text: "You want to take a family picture.",
        options: ["Calendar", "Notes", "Camera", "Calculator"],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "Which App Would You Use?",
        text: "You want directions to the grocery store.",
        options: ["Clock", "Music", "Maps", "Photos"],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "Which App Would You Use?",
        text: "You want to read your new email.",
        options: ["Messages", "Camera", "Mail", "Maps"],
        correctIndex: 2
      },
      {
        type: "learn",
        heading: "Remember",
        text: "Apps help you complete everyday tasks: Phone, Camera, Messages, Weather, Maps. Many apps need the internet to work, but some (like the Calculator or Camera) can work without it. Always download apps from trusted app stores."
      }
    ],
    quiz: [
      { question: "What is an app?", options: ["A Wi-Fi password", "A website", "A program that helps you complete tasks on your device", "A search engine"], correctIndex: 2 },
      { question: "Which of these is an app?", options: ["Wi-Fi", "Internet", "Camera", "Google Search"], correctIndex: 2 },
      { question: "True or False: Every app needs the internet to work.", options: ["True", "False"], correctIndex: 1 },
      { question: "A program on your phone is called an ______.", options: ["App", "Phone", "Browser"], correctIndex: 0 },
      { question: "Which app helps you find directions?", options: ["Camera", "Calculator", "Maps", "Photos"], correctIndex: 2 },
      { question: "You want to send a text message. Which app should you open?", options: ["Weather", "Camera", "Messages", "Music"], correctIndex: 2 },
      { question: "Where is the safest place to download apps?", options: ["From a random website", "From a text message link", "From the App Store or Google Play Store", "From an email attachment"], correctIndex: 2 },
      { question: "Which statement is true?", options: ["The internet is an app.", "Every website is an app.", "Many companies have both an app and a website.", "Apps and websites are exactly the same."], correctIndex: 2 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed What is an App?",
      learned: [
        "Explain what an app is.",
        "Find and open apps on your device.",
        "Understand the difference between an app and a website.",
        "Download apps safely from trusted app stores."
      ],
      next: "What is Wi-Fi?"
    }
  },

  // ============================================================
  // LESSON 6 - What is Wi-Fi? (NOT YET WRITTEN)
  // Add here when the team writes it.
  // ============================================================

  // ============================================================
  // LESSON 7
  // ============================================================
  {
    id: "vpn",
    phase: 1,
    order: 7,
    title: "What is a VPN?",
    pathTitle: "VPNs",
    badge: "Connection Guard",
    xp: 20,
    goals: [
      "Explain what a VPN is in simple terms.",
      "Understand why some people use a VPN.",
      "Know when a VPN can be helpful.",
      "Recognize that a VPN adds privacy but does not make you completely safe online."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What is a VPN?",
        text: "VPN stands for Virtual Private Network. A VPN helps create a private and secure connection when you use the internet. Think of a VPN like a privacy tunnel. Normally, information travels directly between your device and the internet. When you use a VPN, your information travels through an extra secure tunnel before reaching the internet. This makes it harder for others on the same network to see your online activity."
      },
      {
        type: "learn",
        heading: "Think of a VPN Like a Tunnel",
        text: "Imagine you're driving on a busy highway. Without a VPN, everyone can easily see your car traveling. With a VPN, it's like driving through a private tunnel where people outside can't easily see where you're going. A VPN helps protect your privacy, but it doesn't make you invisible."
      },
      {
        type: "learn",
        heading: "When Might You Use a VPN?",
        text: "Many people use a VPN when they are:",
        bullets: ["Using Wi-Fi at a coffee shop", "Using airport Wi-Fi", "Staying at a hotel", "Using library Wi-Fi", "Working remotely"],
        footer: "At home, most people don't need a VPN for everyday internet use, although some choose to use one for added privacy."
      },
      {
        type: "learn",
        heading: "What a VPN Does NOT Do",
        text: "A VPN is helpful, but it cannot:",
        bullets: ["Stop you from clicking scam links", "Protect you if you share your password with a scammer", "Remove viruses from your device", "Guarantee complete privacy online"],
        footer: "You still need good online safety habits."
      },
      {
        type: "multiselect",
        title: "When Could a VPN Be Helpful?",
        prompt: "Tap every situation where a VPN may be useful.",
        options: [
          { text: "Using airport Wi-Fi", correct: true },
          { text: "Using hotel Wi-Fi", correct: true },
          { text: "Working from a coffee shop", correct: true },
          { text: "Using public library Wi-Fi", correct: true },
          { text: "Reading a paper book", correct: false },
          { text: "Watching television without the internet", correct: false }
        ],
        feedback: "Great job! VPNs are most useful when you're using public Wi-Fi or want extra privacy online."
      },
      {
        type: "learn",
        heading: "Did You Know?",
        text: "Many companies ask employees to use a VPN when working from home. This helps protect company information while employees work online."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "VPN", back: "A tool that creates a more private and secure internet connection." },
          { front: "Virtual Private Network", back: "The full name of VPN." },
          { front: "Public Wi-Fi", back: "Wi-Fi that many people can use." },
          { front: "Privacy", back: "Keeping your personal information and online activity protected." },
          { front: "Secure Connection", back: "A safer way for your information to travel over the internet." }
        ]
      },
      {
        type: "match",
        title: "Match the Word",
        pairs: [
          { word: "VPN", match: "Adds privacy to your internet connection" },
          { word: "Public Wi-Fi", match: "Shared internet used by many people" },
          { word: "Privacy", match: "Keeping information protected" },
          { word: "Secure Connection", match: "Helps protect your data online" },
          { word: "Virtual Private Network", match: "The full name of VPN" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["VPN", "Privacy", "Wi-Fi", "Internet", "Password", "Television", "Books", "Calculator"],
        questions: [
          { text: "A ______ helps create a more private internet connection.", answer: "VPN" },
          { text: "A VPN helps protect your ______ while using the internet.", answer: "Privacy" },
          { text: "Many people use a VPN when using public ______.", answer: "Wi-Fi" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Mary is traveling and wants to check her email while using hotel Wi-Fi. Would using a VPN be a good idea?",
        options: ["No", "Yes"],
        correctIndex: 1,
        explanation: "A VPN can add extra privacy when using public Wi-Fi."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert is sitting at home using his own password-protected Wi-Fi. Does he always need a VPN just to browse the internet?",
        options: ["Yes", "No"],
        correctIndex: 1,
        explanation: "Many people browse safely at home without a VPN, though some choose to use one for additional privacy."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda uses a VPN but clicks a fake email asking for her bank password. Will the VPN stop the scam?",
        options: ["Yes", "No"],
        correctIndex: 1,
        explanation: "A VPN protects your connection. It cannot stop you from giving information to a scammer."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "A VPN is one layer of protection, not a complete solution. You should still use strong passwords, keep your device updated, avoid suspicious links, and never share verification codes or passwords."
      },
      {
        type: "sort",
        title: "VPN or No VPN?",
        prompt: "Drag each situation into the correct box.",
        categories: [
          { label: "VPN Could Be Helpful", items: ["Airport Wi-Fi", "Hotel Wi-Fi", "Coffee Shop Wi-Fi", "Library Wi-Fi"] },
          { label: "Usually Less Important", items: ["Reading a downloaded book", "Using apps that don't need the internet", "Browsing at home on your own secure Wi-Fi"] }
        ]
      },
      {
        type: "truefalse",
        title: "True or False?",
        questions: [
          { text: "VPN stands for Virtual Private Network.", answer: true },
          { text: "A VPN makes you completely anonymous online.", answer: false, explanation: "A VPN improves privacy, but it does not make you invisible or protect against every online risk." },
          { text: "A VPN can be useful when using public Wi-Fi.", answer: true },
          { text: "A VPN replaces strong passwords and safe browsing habits.", answer: false }
        ]
      },
      {
        type: "learn",
        heading: "Remember",
        text: "A VPN adds privacy to your internet connection, can help protect your information on public Wi-Fi, and is useful when traveling or using shared networks. But a VPN does not stop scams and does not replace safe online habits. Always think before clicking links or sharing personal information."
      }
    ],
    quiz: [
      { question: "What does VPN stand for?", options: ["Very Private Network", "Verified Personal Network", "Virtual Private Network", "Virtual Protected Network"], correctIndex: 2 },
      { question: "What is a VPN used for?", options: ["Taking pictures", "Sending text messages", "Creating a more private internet connection", "Charging your phone"], correctIndex: 2 },
      { question: "True or False: A VPN protects you from every online scam.", options: ["True", "False"], correctIndex: 1 },
      { question: "A ______ can help make your internet connection more private.", options: ["VPN", "Camera", "Internet"], correctIndex: 0 },
      { question: "When is a VPN especially helpful?", options: ["Reading a printed newspaper", "Watching television", "Using public Wi-Fi at an airport", "Charging your phone"], correctIndex: 2 },
      { question: "Which statement is true?", options: ["A VPN replaces strong passwords.", "A VPN makes every website safe.", "A VPN adds privacy but does not replace safe online habits.", "A VPN removes viruses from your device."], correctIndex: 2 },
      { question: "Mary is using free Wi-Fi at a hotel. What could help protect her connection?", options: ["Turning up the screen brightness", "Opening the Camera app", "Using a VPN", "Restarting the phone"], correctIndex: 2 },
      { question: "What should you still do even if you're using a VPN?", options: ["Nothing else is needed", "Use strong passwords, avoid suspicious links, and keep your device updated"], correctIndex: 1 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed What is a VPN?",
      learned: [
        "Explain what a VPN is.",
        "Understand when a VPN can be useful.",
        "Know that a VPN improves privacy but doesn't stop every online threat.",
        "Combine a VPN with smart online habits for better security."
      ],
      next: "What is Cybersecurity?"
    }
  },

  // ============================================================
  // LESSON 8
  // ============================================================
  {
    id: "cybersecurity",
    phase: 1,
    order: 8,
    title: "What is Cybersecurity?",
    pathTitle: "Cybersecurity",
    badge: "Cyber Guardian",
    xp: 20,
    goals: [
      "Explain what cybersecurity is.",
      "Understand why cybersecurity is important.",
      "Recognize common online threats.",
      "Learn simple habits that keep devices and personal information safe."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What is Cybersecurity?",
        text: "Cybersecurity means protecting your devices, accounts, and personal information from people who want to steal, damage, or misuse them. Think of cybersecurity like locking the doors to your home. Just as you lock your house to protect your belongings, cybersecurity helps protect your digital information.",
        bullets: ["Phone", "Computer", "Email", "Bank accounts", "Photos", "Personal information"]
      },
      {
        type: "learn",
        heading: "Why is Cybersecurity Important?",
        text: "Every day, millions of people use the internet. Most people online are honest, but some people try to:",
        bullets: ["Steal passwords", "Pretend to be someone else", "Trick people into giving money", "Install harmful software", "Access private information"],
        footer: "Good cybersecurity habits can help prevent many of these problems."
      },
      {
        type: "learn",
        heading: "Common Online Threats",
        text: "Here are some common online threats you may encounter:",
        bullets: [
          "Phishing - Fake emails or text messages trying to steal your information.",
          "Viruses - Harmful software that can damage your device.",
          "Password Theft - Someone tries to steal your password.",
          "Identity Theft - Someone pretends to be you using your personal information."
        ],
        footer: "Don't worry, you'll learn about each of these in later lessons!"
      },
      {
        type: "multiselect",
        title: "Which Actions Help Keep You Safe?",
        prompt: "Tap every good cybersecurity habit.",
        options: [
          { text: "Use strong passwords", correct: true },
          { text: "Keep your phone updated", correct: true },
          { text: "Think before clicking links", correct: true },
          { text: "Lock your phone with a passcode", correct: true },
          { text: "Share your passwords with friends", correct: false },
          { text: "Click every pop-up you see", correct: false }
        ],
        feedback: "Great job! Simple habits like updating your device and protecting your passwords help keep your information safe."
      },
      {
        type: "learn",
        heading: "Think of Cybersecurity Like Home Security",
        text: "Imagine your house. Locking your doors protects your home. Likewise, locking your phone protects your information. Updating your computer helps fix security problems. Using strong passwords helps keep others out of your accounts. Small habits make a big difference."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Cybersecurity", back: "Protecting your devices and information from online threats." },
          { front: "Password", back: "A secret word or phrase used to protect your account." },
          { front: "Phishing", back: "A scam that tries to trick you into sharing personal information." },
          { front: "Virus", back: "Harmful software that can damage your device." },
          { front: "Update", back: "New software that improves your device and fixes security problems." }
        ]
      },
      {
        type: "match",
        title: "Match the Word",
        pairs: [
          { word: "Cybersecurity", match: "Protecting your devices" },
          { word: "Password", match: "Secret code for your account" },
          { word: "Phishing", match: "Fake message that tries to steal information" },
          { word: "Virus", match: "Harmful software" },
          { word: "Update", match: "Improves security and fixes problems" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Cybersecurity", "Password", "Update", "Virus"],
        questions: [
          { text: "______ helps protect your devices and personal information.", answer: "Cybersecurity" },
          { text: "A strong ______ helps protect your online accounts.", answer: "Password" },
          { text: "Installing an ______ helps fix security problems on your device.", answer: "Update" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret receives an email asking her to verify her bank password by clicking a link. What should she do?",
        options: [
          "Click the link immediately.",
          "Reply with her password.",
          "Do not click the link. Contact her bank using its official phone number or website."
        ],
        correctIndex: 2,
        explanation: "Banks do not ask for passwords through email."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert's phone says: \"Software Update Available.\" What should he do?",
        options: [
          "Ignore it forever.",
          "Delete the message.",
          "Install the update when he has time and a trusted internet connection."
        ],
        correctIndex: 2,
        explanation: "Updates often fix security problems and improve your device."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda uses the same password for every online account. Is this the safest choice?",
        options: ["Yes", "No"],
        correctIndex: 1,
        explanation: "If one account is hacked, all of her accounts could be at risk. Using different passwords makes your accounts safer."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "You don't need to be a computer expert to stay safe online. Remember these four simple habits: use strong passwords, keep your devices updated, think before clicking links, and ask for help if something seems suspicious."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each action into the correct box.",
        categories: [
          { label: "Safe", items: ["Use a strong password", "Install software updates", "Lock your phone", "Ask someone you trust if you're unsure"] },
          { label: "Unsafe", items: ["Share your password", "Ignore every software update", "Click links from unknown emails", "Use \"123456\" as your password"] }
        ]
      },
      {
        type: "truefalse",
        title: "True or False?",
        questions: [
          { text: "Cybersecurity helps protect your personal information.", answer: true },
          { text: "It's safe to share your password with anyone who asks.", answer: false },
          { text: "Software updates often improve your device's security.", answer: true },
          { text: "If something online seems suspicious, it's okay to stop and ask someone you trust.", answer: true }
        ]
      },
      {
        type: "learn",
        heading: "Remember",
        text: "Cybersecurity helps protect your phone, your computer, your passwords, and your personal information. Good cybersecurity habits include strong passwords, software updates, being cautious with links, and asking for help when you're unsure."
      }
    ],
    quiz: [
      { question: "What is cybersecurity?", options: ["A type of internet connection", "A search engine", "Protecting your devices and information from online threats", "A social media app"], correctIndex: 2 },
      { question: "Which of these is a good cybersecurity habit?", options: ["Share your password with friends", "Ignore software updates", "Use strong passwords", "Click every email link"], correctIndex: 2 },
      { question: "True or False: Cybersecurity is only important for businesses.", options: ["True", "False"], correctIndex: 1 },
      { question: "______ helps protect your devices and personal information.", options: ["Cybersecurity", "Phone", "Television"], correctIndex: 0 },
      { question: "You receive an email asking for your password. What should you do?", options: ["Reply with your password", "Click the link", "Ignore the email and contact the company using its official website or phone number", "Forward it to your friends"], correctIndex: 2 },
      { question: "Why are software updates important?", options: ["They only change the colors on your phone.", "They make your phone heavier.", "They fix problems and improve security.", "They delete your photos."], correctIndex: 2 },
      { question: "Which of these is an example of good cybersecurity?", options: ["Ignoring updates", "Locking your phone, installing updates, and using strong passwords"], correctIndex: 1 },
      { question: "If something online doesn't seem right, what should you do?", options: ["Ignore your concerns and continue.", "Give your personal information anyway.", "Stop, think, and ask someone you trust if you're unsure.", "Click the link to see what happens."], correctIndex: 2 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed What is Cybersecurity?",
      learned: [
        "Explain what cybersecurity is.",
        "Protect your devices with good habits.",
        "Recognize common online threats.",
        "Make safer choices when using the internet."
      ],
      next: "What is Personal Information?"
    }
  },

  // ============================================================
  // LESSON 9
  // ============================================================
  {
    id: "personal-information",
    phase: 1,
    order: 9,
    title: "What is Personal Information?",
    pathTitle: "Personal Information",
    badge: "Privacy Protector",
    xp: 20,
    goals: [
      "Explain what personal information is.",
      "Recognize what information is safe and unsafe to share online.",
      "Understand why protecting personal information is important.",
      "Know what to do if someone asks for private information."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What is Personal Information?",
        text: "Personal information is information that identifies you or could be used to access your accounts. Some personal information is safe to share, while other information should be kept private. Protecting your personal information helps prevent scams and identity theft. Think of your personal information like the keys to your house. You wouldn't hand your house keys to a stranger, and you shouldn't give your private information to someone you don't trust."
      },
      {
        type: "learn",
        heading: "What Should You Keep Private?",
        text: "These are examples of private information:",
        bullets: [
          "Passwords",
          "Bank account or credit card numbers",
          "Social Security number",
          "Verification codes (one-time codes sent by text or email)",
          "Driver's license number",
          "Medical information",
          "Home address (only share when necessary and with trusted organizations)",
          "Full birth date (be careful where you share it)"
        ]
      },
      {
        type: "learn",
        heading: "What Is Usually Safe to Share?",
        text: "Some information is generally okay to share, depending on the situation.",
        bullets: ["Your first name", "Your favorite hobby", "Your favorite sports team", "Your favorite food", "Pictures of your pets (if they don't reveal private information)"],
        footer: "Even information that seems harmless should only be shared with people you trust."
      },
      {
        type: "learn",
        heading: "Why Do Scammers Want Personal Information?",
        text: "Scammers may try to use your information to:",
        bullets: ["Steal money", "Open accounts in your name", "Take over your online accounts", "Pretend to be you"],
        footer: "This is called identity theft."
      },
      {
        type: "multiselect",
        title: "Safe to Share or Keep Private?",
        prompt: "Tap every item that should be kept private.",
        options: [
          { text: "Password", correct: true },
          { text: "Social Security number", correct: true },
          { text: "Credit card number", correct: true },
          { text: "Verification code", correct: true },
          { text: "Bank account number", correct: true },
          { text: "Favorite color", correct: false },
          { text: "Favorite movie", correct: false },
          { text: "Favorite hobby", correct: false }
        ],
        feedback: "Excellent! Passwords, banking information, Social Security numbers, and verification codes should never be shared with strangers or unexpected callers."
      },
      {
        type: "learn",
        heading: "Think About Your House Key",
        text: "Imagine someone knocks on your door and asks: \"Can I borrow your house key?\" Most people would say No. Your passwords and personal information are like digital house keys. Only share them when absolutely necessary and only with trusted organizations through secure methods."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Personal Information", back: "Information that identifies you or can access your accounts." },
          { front: "Password", back: "A secret code that protects your account." },
          { front: "Social Security Number", back: "A personal government identification number that should be protected." },
          { front: "Verification Code", back: "A temporary code sent by text or email to confirm your identity." },
          { front: "Identity Theft", back: "When someone uses your personal information without your permission." }
        ]
      },
      {
        type: "match",
        title: "Match the Word",
        pairs: [
          { word: "Password", match: "Protects your account" },
          { word: "Personal Information", match: "Information about you" },
          { word: "Verification Code", match: "Temporary security code" },
          { word: "Identity Theft", match: "Someone pretends to be you" },
          { word: "Social Security Number", match: "Sensitive personal information" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Password", "Personal Information", "Identity Theft", "Verification Code"],
        questions: [
          { text: "A ______ helps protect your online accounts.", answer: "Password" },
          { text: "Your Social Security number is ______.", answer: "Personal Information" },
          { text: "When someone uses your personal information without permission, it is called ______.", answer: "Identity Theft" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret receives a phone call from someone claiming to be her bank. They ask for her online banking password. What should she do?",
        options: [
          "Give them the password.",
          "Tell them her Social Security number too.",
          "Hang up and call the bank using the official phone number on her bank card or statement."
        ],
        correctIndex: 2,
        explanation: "Real banks will not ask for your password over the phone."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert receives a text message with a six-digit verification code. A stranger calls and asks him to read the code aloud. Should he?",
        options: ["Yes", "No"],
        correctIndex: 1,
        explanation: "Verification codes help protect your account. Never share them with someone who contacts you unexpectedly."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda wants to post a picture of her new driver's license on social media because she's excited she renewed it. Is this a good idea?",
        options: ["Yes", "No"],
        correctIndex: 1,
        explanation: "The photo could reveal personal information that scammers could misuse."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Before sharing information online, ask yourself: Who is asking? Why do they need it? Do I trust them? If you're unsure, stop and ask a trusted family member, friend, or organization before sharing."
      },
      {
        type: "sort",
        title: "Keep Private or Safe to Share?",
        prompt: "Drag each item into the correct box.",
        categories: [
          { label: "Keep Private", items: ["Password", "Social Security Number", "Credit Card Number", "Verification Code", "Bank Account Number"] },
          { label: "Usually Safe to Share", items: ["Favorite Food", "Favorite Color", "Favorite Hobby", "Favorite Book", "Favorite Movie"] }
        ]
      },
      {
        type: "choice",
        title: "Spot the Scam",
        text: "\"Hello! Your bank account is locked. Reply with your password to unlock it.\"",
        options: ["Safe", "Scam"],
        correctIndex: 1
      },
      {
        type: "choice",
        title: "Spot the Scam",
        text: "\"Your doctor's office asks you to confirm your appointment by calling the number on their official website.\"",
        options: ["Safe", "Scam"],
        correctIndex: 0
      },
      {
        type: "choice",
        title: "Spot the Scam",
        text: "\"Your grandson asks for your Wi-Fi password while visiting your house.\"",
        options: ["Safe", "Scam"],
        correctIndex: 0,
        explanation: "This is usually safe if you know and trust him in person."
      },
      {
        type: "choice",
        title: "Spot the Scam",
        text: "\"You receive a text asking for the six-digit code that was just sent to your phone.\"",
        options: ["Safe", "Scam"],
        correctIndex: 1
      },
      {
        type: "learn",
        heading: "Remember",
        text: "Protect these: passwords, Social Security number, credit card numbers, verification codes, and bank account information. If someone unexpectedly asks for this information: Stop. Think. Contact the organization using its official phone number or website, not the contact information in the message."
      }
    ],
    quiz: [
      { question: "What is personal information?", options: ["Your favorite ice cream flavor", "Information that identifies you or helps access your accounts", "A weather forecast", "A search engine"], correctIndex: 1 },
      { question: "Which should you keep private?", options: ["Favorite movie", "Favorite hobby", "Social Security number", "Favorite sports team"], correctIndex: 2 },
      { question: "True or False: You should share your passwords with anyone who says they work for your bank.", options: ["True", "False"], correctIndex: 1 },
      { question: "A ______ helps protect your online account.", options: ["Password", "Book", "Camera"], correctIndex: 0 },
      { question: "You receive a text asking for your six-digit verification code. What should you do?", options: ["Reply with the code", "Ignore it and send your password too", "Do not share the code and contact the company directly if you're concerned", "Post the code on social media"], correctIndex: 2 },
      { question: "Which of these is generally safe to share?", options: ["Credit card number", "Bank account number", "Social Security number", "Favorite hobby"], correctIndex: 3 },
      { question: "Which information should never be shared with someone who contacts you unexpectedly?", options: ["Your favorite color", "Passwords, verification codes, Social Security numbers, and bank account numbers"], correctIndex: 1 },
      { question: "If you're unsure whether a request for your personal information is real, what should you do?", options: ["Give the information just in case.", "Ignore your concerns.", "Stop and contact the organization using its official phone number or website.", "Post the question on social media."], correctIndex: 2 }
    ],
    complete: {
      title: "Congratulations!",
      subtitle: "You completed What is Personal Information?",
      learned: [
        "Recognize what counts as personal information.",
        "Protect sensitive information from scammers.",
        "Know what should never be shared unexpectedly.",
        "Make safer choices online to reduce the risk of identity theft."
      ],
      next: "Phase 1 Review & Final Challenge"
    }
  }
];

export default lessons;

// Full Digital Literacy track: Phase 1 → 2 → 3 → 4 → 5.
export const allLessons = [
  ...lessons,
  ...phase2Lessons,
  ...phase3Lessons,
  ...phase4Lessons,
  ...phase5Lessons,
];

// Lessons sorted by curriculum order for the path and player.
export const lessonsByOrder = [...allLessons].sort((a, b) => a.order - b.order);

// Ungraded phase challenges (after the phase's last lesson, before the exam).
export const challengesByOrder = [phase4Challenge].sort(
  (a, b) => a.order - b.order
);

// Phase exams (after the challenge, or after the last lesson if none).
export const examsByOrder = [phase3Exam, phase4Exam, phase5Exam].sort(
  (a, b) => a.order - b.order
);

export { phase3Exam, phase4Challenge, phase4Exam, phase5Exam };
