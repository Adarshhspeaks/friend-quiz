export const CATEGORIES = [
  { id: 'all', label: '✨ All Themes', icon: '✨' },
  { id: 'food', label: '🍕 Food & Munchies', icon: '🍕' },
  { id: 'habits', label: '😴 Habits & Sleep', icon: '😴' },
  { id: 'social', label: '💬 Social & Texting', icon: '💬' },
  { id: 'pop', label: '🎬 Entertainment', icon: '🎬' },
  { id: 'quirks', label: '🧠 Quirks & Secrets', icon: '🧠' },
];

export const QUESTION_BANK = [
  // --- 🍕 Food & Munchies ---
  {
    id: 'f1',
    category: 'food',
    text: "What is my absolute favorite food?",
    options: ["Pizza with extra cheese", "Biryani or Tacos", "Crispy Burgers & Fries", "Mom's home cooking"],
    correctIndex: 0,
  },
  {
    id: 'f2',
    category: 'food',
    text: "What's my go-to drink order when we hang out?",
    options: ["Iced Coffee / Boba", "Hot Chai / Creamy Latte", "Cold Soda / Energy Drink", "Just water, I'm broke"],
    correctIndex: 0,
  },
  {
    id: 'f3',
    category: 'food',
    text: "What's my midnight snack of choice?",
    options: ["Instant spicy ramen / noodles", "Chips & dip", "Leftover food cold from fridge", "Ice cream straight from the tub"],
    correctIndex: 0,
  },
  {
    id: 'f4',
    category: 'food',
    text: "How spicy do I actually like my food?",
    options: ["Mild only, I have zero tolerance", "Medium spicy", "Nuclear spicy, bring the sweat!", "Depends on who's cooking"],
    correctIndex: 0,
  },
  {
    id: 'f5',
    category: 'food',
    text: "Do I share food or protect my plate?",
    options: ["Take anything you want, bestie", "You can have ONE bite only", "Touch my food and it's war", "I offer before you even ask"],
    correctIndex: 0,
  },

  // --- 😴 Habits & Sleep ---
  {
    id: 'h1',
    category: 'habits',
    text: "Am I an early bird or a night owl?",
    options: ["Total night owl (3 AM gang)", "Early bird (up with the sun)", "Permanently exhausted 24/7", "Depends entirely on the weekend"],
    correctIndex: 0,
  },
  {
    id: 'h2',
    category: 'habits',
    text: "What's my morning mood before talking to people?",
    options: ["Radiant sunshine & talkative", "Do not dare look at me yet", "Half-asleep zombie roaming around", "Already stressed and running late"],
    correctIndex: 0,
  },
  {
    id: 'h3',
    category: 'habits',
    text: "How many alarms do I set to wake up?",
    options: ["Just 1, I wake up immediately", "3 to 5 alarms every 5 minutes", "10+ alarms spaced out", "Alarms go off, I sleep through all"],
    correctIndex: 0,
  },
  {
    id: 'h4',
    category: 'habits',
    text: "How do I usually cope with stress?",
    options: ["Blasting music on full blast", "Venting / ranting to friends", "Eating favorite comfort food", "Taking an ungodly long nap"],
    correctIndex: 0,
  },
  {
    id: 'h5',
    category: 'habits',
    text: "What do I spend way too much time doing?",
    options: ["Doomscrolling TikTok & Reels", "Taking 3-hour accidental naps", "Overthinking random scenarios", "Binge-watching entire seasons"],
    correctIndex: 0,
  },

  // --- 💬 Social & Texting ---
  {
    id: 's1',
    category: 'social',
    text: "What is my biggest pet peeve?",
    options: ["People arriving super late", "Loud chewing or talking over me", "Slow Wi-Fi / buffering", "Being left on seen / read"],
    correctIndex: 0,
  },
  {
    id: 's2',
    category: 'social',
    text: "What is my texting style usually like?",
    options: ["Replies in 0.2 seconds", "Leaves on delivered for 3 business days", "Sends 10 short texts in a row", "Only communicates via memes"],
    correctIndex: 0,
  },
  {
    id: 's3',
    category: 'social',
    text: "If someone cancels plans last-minute, how do I feel?",
    options: ["Secretly relieved, staying in bed!", "Genuinely heartbroken & annoyed", "Already found alternative fun plans", "Was about to cancel myself anyway"],
    correctIndex: 0,
  },
  {
    id: 's4',
    category: 'social',
    text: "How do I react when someone gives me a compliment?",
    options: ["Awkward laugh & look away", "Immediately compliment them back", "Smile proudly like a boss", "Get suspicious about what they want"],
    correctIndex: 0,
  },
  {
    id: 's5',
    category: 'social',
    text: "What percentage is my phone battery usually at?",
    options: ["95%+ (always prepared)", "40% - 70% (normal human)", "Under 10% (living dangerously)", "Constantly attached to a powerbank"],
    correctIndex: 0,
  },

  // --- 🎬 Entertainment & Pop Culture ---
  {
    id: 'p1',
    category: 'pop',
    text: "What genre of movies or shows do I love most?",
    options: ["Horror & Mind-bending Thrillers", "Cheesy Rom-Coms & Drama", "Action, Marvel & Sci-Fi", "True Crime Documentaries & Anime"],
    correctIndex: 0,
  },
  {
    id: 'p2',
    category: 'pop',
    text: "If I could fly anywhere tomorrow, where would I go?",
    options: ["Japan (Tokyo & Kyoto)", "Switzerland & the Alps", "Tropical Beach Resort (Bali/Maldives)", "Paris, Rome & London"],
    correctIndex: 0,
  },
  {
    id: 'p3',
    category: 'pop',
    text: "What music genre dominates my headphones?",
    options: ["Pop & mainstream chart hits", "Hip-Hop, Rap & Trap", "Indie, Lo-Fi & Bedroom pop", "Classic Rock, Metal & R&B"],
    correctIndex: 0,
  },
  {
    id: 'p4',
    category: 'pop',
    text: "What's my ideal Friday night plan?",
    options: ["Going out to a wild party / club", "Cozy movie night with blankets & food", "Exploring new cafes or late night drive", "Gaming or talking on Discord all night"],
    correctIndex: 0,
  },

  // --- 🧠 Quirks & Secrets ---
  {
    id: 'q1',
    category: 'quirks',
    text: "If I won $1,000,000 today, what's my first move?",
    options: ["Travel the world indefinitely", "Buy my dream sports car / house", "Invest & save it all quietly", "Disappear and fake my identity"],
    correctIndex: 0,
  },
  {
    id: 'q2',
    category: 'quirks',
    text: "What is my most iconic superpower or personality trait?",
    options: ["Always making everyone laugh", "Giving actually top-tier advice", "Always being hungry / craving snacks", "Fluent in world-class sarcasm"],
    correctIndex: 0,
  },
  {
    id: 'q3',
    category: 'quirks',
    text: "If I were an animal, which one would I be?",
    options: ["A lazy, pampered house cat", "A loyal, hyperactive golden retriever", "A nocturnal, observant owl", "A dramatic, chaotic raccoon"],
    correctIndex: 0,
  },
  {
    id: 'q4',
    category: 'quirks',
    text: "What is my hidden talent?",
    options: ["Finding memes in seconds", "Master chef / baker in kitchen", "Sleeping in any moving vehicle", "FBI-level social media detective"],
    correctIndex: 0,
  },
  {
    id: 'q5',
    category: 'quirks',
    text: "What is my biggest irrational fear?",
    options: ["Spiders and creepy crawlies", "Heights and glass skywalks", "Calling strangers on phone", "Horror movies in a dark room"],
    correctIndex: 0,
  },
];

// 10 curated starter questions covering every theme
export const DEFAULT_10_QUESTIONS = [
  QUESTION_BANK.find((q) => q.id === 'f1'),
  QUESTION_BANK.find((q) => q.id === 'p2'),
  QUESTION_BANK.find((q) => q.id === 's1'),
  QUESTION_BANK.find((q) => q.id === 'h5'),
  QUESTION_BANK.find((q) => q.id === 'h1'),
  QUESTION_BANK.find((q) => q.id === 'f2'),
  QUESTION_BANK.find((q) => q.id === 'p1'),
  QUESTION_BANK.find((q) => q.id === 'h4'),
  QUESTION_BANK.find((q) => q.id === 'q1'),
  QUESTION_BANK.find((q) => q.id === 'q2'),
].map(({ text, options, correctIndex, category }) => ({
  text,
  options: [...options],
  correctIndex,
  category,
}));
