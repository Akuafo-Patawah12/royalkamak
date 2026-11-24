/*
 * Questions the website chat bot (components/faq-chat.tsx) can answer.
 * Edit freely: add an entry, or change an answer. The bot shows the answer of
 * the entry whose keywords best match what the guest typed.
 *
 * keywords: word starts ("cancel" also matches "cancelled", "cancellation")
 * or short phrases. Include the words guests are likely to use.
 *
 * Only state what is true for the hotel; for anything not confirmed (times,
 * prices) the answers point to reception or the hotel's email.
 */

export type FaqLink = { href: string; label: string };

export type Faq = {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  links?: FaqLink[];
};

export const FAQS: Faq[] = [
  {
    id: "book",
    question: "How do I book a room?",
    answer:
      "Choose your arrival and departure dates on the Rooms page, pick a room type and press Reserve. Fill in your details and confirm. You don't need an account, and you get a booking reference straight away.",
    keywords: ["book", "reserve a", "make a reservation", "how do i book", "make a booking", "room for"],
    links: [{ href: "/rooms", label: "See rooms & book" }],
  },
  {
    id: "account",
    question: "Do I need an account to book?",
    answer:
      "No. Anyone can book as a guest with just a name, phone number and email. Royal Kamak partners can sign in to book for their guests on their partner account.",
    keywords: ["account", "sign up", "signing up", "signup", "register", "login", "log in", "sign in", "signing in", "password", "without"],
    links: [{ href: "/login", label: "Partner sign in" }],
  },
  {
    id: "availability",
    question: "How can I see which rooms are free?",
    answer:
      "Open a room type to see its availability calendar: crossed-out nights are fully booked. Or enter your dates on the Rooms page to see what's free for your stay and the price.",
    keywords: ["availab", "free", "vacan", "calendar", "dates", "full", "sold out", "booked up"],
    links: [{ href: "/rooms", label: "Check availability" }],
  },
  {
    id: "rooms",
    question: "What types of rooms do you have?",
    answer:
      "You can see every room type with its photos and nightly price on the Rooms page. Each type shows how many rooms of that kind we have and when they're free.",
    keywords: ["room type", "types of room", "suite", "deluxe", "standard", "single", "double", "bed", "what rooms"],
    links: [{ href: "/rooms", label: "Rooms & suites" }],
  },
  {
    id: "price",
    question: "How much does a room cost?",
    answer:
      "Prices are per room per night and shown on each room type. Once you choose your dates, you'll see the total for your whole stay before you confirm.",
    keywords: ["price", "cost", "how much", "rate", "cheap", "expensive", "fee", "charge", "tariff"],
    links: [{ href: "/rooms", label: "See prices" }],
  },
  {
    id: "pay",
    question: "How can I pay?",
    answer:
      "You can pay online when you book, by card or Mobile Money, securely through Paystack. You can also choose to pay at the hotel. Partners can also choose an invoice.",
    keywords: ["pay", "momo", "mobile money", "card", "visa", "mastercard", "paystack", "cash", "transfer", "deposit"],
  },
  {
    id: "pay-later",
    question: "I didn't finish paying. Can I pay later?",
    answer:
      "Yes. Your booking is saved even if the payment wasn't completed. Open My booking, and if it hasn't been paid yet you'll see a Pay button there.",
    keywords: ["pay later", "didn't pay", "did not pay", "payment failed", "not complete", "abandon", "pay now", "unpaid"],
    links: [{ href: "/my-booking", label: "My booking" }],
  },
  {
    id: "confirm",
    question: "When is my booking confirmed?",
    answer:
      "If you pay online, your booking is confirmed as soon as the payment goes through. If you choose to pay at the hotel, the hotel confirms it and you'll see the status on My booking.",
    keywords: ["confirm", "status", "approved", "pending", "accepted"],
    links: [{ href: "/my-booking", label: "Check my booking" }],
  },
  {
    id: "find",
    question: "How do I find my booking?",
    answer:
      "Go to My booking and enter your booking reference (it starts with RK-) and the email address you booked with.",
    keywords: ["find", "my booking", "reference", "lookup", "look up", "check booking", "lost", "where is my", "view"],
    links: [{ href: "/my-booking", label: "Find my booking" }],
  },
  {
    id: "cancel",
    question: "Can I cancel my booking?",
    answer:
      "Bookings that haven't been paid can be cancelled online from My booking. If you've already paid, please contact the hotel to cancel and arrange a refund.",
    keywords: ["cancel", "refund", "money back", "remove booking", "delete booking"],
    links: [{ href: "/my-booking", label: "My booking" }],
  },
  {
    id: "change",
    question: "Can I change my dates?",
    answer:
      "Changes to dates or rooms can't be made online yet. Please contact the hotel with your booking reference, or cancel an unpaid booking and book again.",
    keywords: ["change", "modify", "amend", "extend", "reschedul", "move my", "different date"],
  },
  {
    id: "group",
    question: "Can I book for a group?",
    answer:
      "Online guest bookings can include up to 5 rooms. For larger groups or events, please contact the hotel and we'll arrange it for you.",
    keywords: ["group", "many rooms", "several rooms", "event", "wedding", "conference", "team", "family"],
  },
  {
    id: "long-stay",
    question: "How long can I stay?",
    answer: "A single online booking can be up to 60 nights. For longer stays, please contact the hotel.",
    keywords: ["how long", "long stay", "nights", "month", "maximum", "weeks"],
  },
  {
    id: "checkin",
    question: "What time is check-in and check-out?",
    answer: "Please contact the hotel or ask at reception for today's check-in and check-out times.",
    keywords: ["check in", "check-in", "checkin", "check out", "check-out", "checkout", "arrival time", "what time", "early", "late"],
  },
  {
    id: "pool",
    question: "Is there a swimming pool?",
    answer:
      "Yes. Our pool sits in the main courtyard in front of the hotel, with shaded loungers and a tiled sun terrace. Ask at reception for opening hours.",
    keywords: ["pool", "swim", "lounger", "sun"],
    links: [{ href: "/swimming", label: "The pool" }],
  },
  {
    id: "lessons",
    question: "Do you teach swimming?",
    answer:
      "Yes, we teach people how to swim at our pool, from complete beginners to more confident swimmers. Ask at reception, or contact the hotel, about lesson times and fees.",
    keywords: ["lesson", "learn", "teach", "class", "coach", "instructor", "beginner", "kids", "children swim"],
    links: [{ href: "/swimming#swimming-lessons", label: "Swimming lessons" }],
  },
  {
    id: "restaurant",
    question: "Is there a restaurant?",
    answer:
      "Yes, the Royal Kamak restaurant welcomes hotel guests and visitors. Ask at reception for opening hours and today's menu.",
    keywords: ["restaurant", "food", "eat", "breakfast", "lunch", "dinner", "menu", "meal", "dining", "room service"],
    links: [{ href: "/restaurant", label: "The restaurant" }],
  },
  {
    id: "bar",
    question: "Is there a bar?",
    answer: "Yes, our bar serves drinks at the bar and out on the terrace. Ask at reception for opening hours.",
    keywords: ["bar", "drink", "beer", "wine", "cocktail", "lounge", "alcohol"],
    links: [{ href: "/bars", label: "Bars & lounge" }],
  },
  {
    id: "partner",
    question: "I'm a partner. How do I book for my guests?",
    answer:
      "Sign in with your partner account, then book as usual: reservations are saved on your account and listed under My bookings. Ask the hotel if you need a partner account.",
    keywords: ["partner", "agent", "agency", "travel agent", "corporate", "company account", "my guests"],
    links: [{ href: "/login", label: "Partner sign in" }],
  },
];

/** Shown as tappable suggestions when the chat opens. */
export const STARTER_QUESTIONS = ["book", "pay", "cancel", "lessons"];

const normalise = (text: string) =>
  text
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9'\- ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Best matching FAQs for a question, best first. A multi-word keyword counts
 * when the phrase appears; a single keyword when a word starts with it.
 */
export function matchFaqs(question: string, limit = 3): { faq: Faq; score: number }[] {
  const text = normalise(question);
  if (!text) return [];
  const words = text.split(" ");
  const scored = FAQS.map((faq) => {
    let score = 0;
    for (const raw of faq.keywords) {
      const keyword = normalise(raw);
      const hit = keyword.includes(" ") || keyword.includes("-")
        ? ` ${text} `.includes(` ${keyword}`)
        : words.some((w) => w.startsWith(keyword));
      // Longer, more specific keywords count for more.
      if (hit) score += 1 + keyword.length / 10;
    }
    if (normalise(faq.question) === text) score += 10;
    return { faq, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
