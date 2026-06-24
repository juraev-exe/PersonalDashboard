// ============================================
// LifeOS — Motivational Quotes
// ============================================

export interface Quote {
  text: string;
  author: string;
  category: 'productivity' | 'coding' | 'cybersecurity' | 'discipline';
}

export const quotes: Quote[] = [
  {
    text: "First, solve the problem. Then, write the code.",
    author: "John Johnson",
    category: "coding"
  },
  {
    text: "Clean code always looks like it was written by someone who cares.",
    author: "Michael Feathers",
    category: "coding"
  },
  {
    text: "Discipline is choosing between what you want now and what you want most.",
    author: "Abraham Lincoln",
    category: "discipline"
  },
  {
    text: "Simplicity is the soul of efficiency.",
    author: "Austin Freeman",
    category: "productivity"
  },
  {
    text: "The only truly secure system is one that is powered off, cast in a block of concrete, and sealed in a lead-lined room.",
    author: "Gene Spafford",
    category: "cybersecurity"
  },
  {
    text: "One machine can do the work of fifty ordinary men. No machine can do the work of one extraordinary man.",
    author: "Elbert Hubbard",
    category: "productivity"
  },
  {
    text: "Talk is cheap. Show me the code.",
    author: "Linus Torvalds",
    category: "coding"
  },
  {
    text: "Today's preparation determines tomorrow's achievement.",
    author: "Unknown",
    category: "discipline"
  },
  {
    text: "It is not that I'm so smart. But I stay with the questions much longer.",
    author: "Albert Einstein",
    category: "discipline"
  },
  {
    text: "If you spend too much time thinking about a thing, you'll never get it done.",
    author: "Bruce Lee",
    category: "productivity"
  },
  {
    text: "Security is not a product, but a process.",
    author: "Bruce Schneier",
    category: "cybersecurity"
  },
  {
    text: "Focus is a matter of deciding what things you're not going to do.",
    author: "John Carmack",
    category: "productivity"
  },
  {
    text: "Make it work, make it right, make it fast.",
    author: "Kent Beck",
    category: "coding"
  },
  {
    text: "A disciplined mind leads to happiness, and an undisciplined mind leads to suffering.",
    author: "Buddha",
    category: "discipline"
  },
  {
    text: "Amateurs hack systems, professionals hack people.",
    author: "Bruce Schneier",
    category: "cybersecurity"
  }
];

export function getRandomQuote(): Quote {
  const index = Math.floor(Math.random() * quotes.length);
  return quotes[index];
}
