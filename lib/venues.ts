/*
 * Content of the Swimming, Restaurant and Bars pages. Edit the text here.
 *
 * Photos: files in /public. A photo that doesn't exist is skipped, so you can
 * list e.g. "/venues/restaurant-1.jpg" now and drop the file in later; until a
 * venue has a photo, its page shows a designed sand-coloured panel instead.
 *
 * Details with value null show "Ask at reception", so the site never shows
 * opening hours or prices that haven't been confirmed.
 */

export type Venue = {
  slug: "swimming" | "restaurant" | "bars";
  /** Header and card label. */
  label: string;
  eyebrow: string;
  title: string;
  /** Italic line under the title. */
  lead: string;
  /** Intro paragraphs. */
  intro: string[];
  highlights: { title: string; text: string }[];
  details: { label: string; value: string | null }[];
  photos: { src: string; alt: string }[];
  /** Optional extra section, e.g. swimming lessons. */
  feature?: {
    eyebrow: string;
    title: string;
    text: string[];
    points: { title: string; text: string }[];
    details: { label: string; value: string | null }[];
    /** How to sign up. */
    action: string;
  };
};

export const VENUES: Venue[] = [
  {
    slug: "swimming",
    label: "Swimming",
    eyebrow: "Leisure",
    title: "The pool",
    lead: "Blue water, warm tiles, shade whenever you want it, and lessons for anyone learning to swim.",
    intro: [
      "At the heart of Royal Kamak lies the pool, framed by a terracotta sun terrace and the hotel's arched façade.",
      "Spend a slow morning on a lounger under the canopy, take a cooling swim in the afternoon heat, and watch the light change over the water as evening falls.",
    ],
    highlights: [
      { title: "Shaded loungers", text: "Rows of sun loungers under blue canopies, for sun or shade as you prefer." },
      { title: "Sun terrace", text: "A wide tiled terrace around the water, steps from the hotel." },
      { title: "Swimming lessons", text: "Learn to swim, or grow in confidence, with lessons at our pool." },
    ],
    details: [
      { label: "Opening hours", value: null },
      { label: "Location", value: "Main courtyard, in front of the hotel" },
      { label: "Towels", value: null },
      { label: "Access", value: null },
    ],
    photos: [
      { src: "/venues/swimming-1.jpg", alt: "The Royal Kamak pool with shaded loungers in front of the hotel" },
      { src: "/venues/swimming-2.jpg", alt: "Loungers under a blue canopy beside the pool" },
      { src: "/hero.jpg", alt: "The pool and sun terrace in front of Royal Kamak Hotel" },
    ],
    feature: {
      eyebrow: "Swimming lessons",
      title: "Learn to swim with us",
      text: [
        "It's never too early or too late to learn. At the Royal Kamak pool we teach people how to swim: from first splashes for complete beginners to building the strength and technique of more confident swimmers.",
        "Lessons are calm, patient and focused on safety, so every learner can make progress at their own pace in the water.",
      ],
      points: [
        { title: "Beginners welcome", text: "Start from the very first steps: getting comfortable in the water, floating and breathing." },
        { title: "Safety first", text: "Learn the skills that keep you safe in and around water." },
        { title: "Build confidence", text: "Improve your strokes and stamina, one lesson at a time." },
      ],
      details: [
        { label: "Who can learn", value: null },
        { label: "Lesson times", value: null },
        { label: "Group or private", value: null },
        { label: "Fees", value: null },
      ],
      action: "To book a lesson or ask about times and fees, speak to our reception team.",
    },
  },
  {
    slug: "restaurant",
    label: "Restaurant",
    eyebrow: "Dining",
    title: "The restaurant",
    lead: "Generous plates, unhurried meals and a warm welcome.",
    intro: [
      "From the first coffee of the morning to a long dinner with friends, the Royal Kamak restaurant is where the day gathers.",
      "Our kitchen cooks Ghanaian favourites alongside international classics, prepared fresh and served with care. Hotel guests and visitors are equally welcome.",
    ],
    highlights: [
      { title: "Breakfast", text: "Start the day well before a meeting, an excursion or the road home." },
      { title: "Lunch & dinner", text: "Local dishes and familiar classics, made to order by our kitchen." },
      { title: "Private dining", text: "Celebrations and business lunches, arranged with our team in advance." },
    ],
    details: [
      { label: "Opening hours", value: null },
      { label: "Reservations", value: null },
      { label: "Dress code", value: "Smart casual" },
      { label: "Room service", value: null },
    ],
    photos: [
      { src: "/venues/restaurant-1.jpg", alt: "The Royal Kamak restaurant" },
      { src: "/venues/restaurant-2.jpg", alt: "A dish from the Royal Kamak kitchen" },
      { src: "/venues/restaurant-3.jpg", alt: "Tables set for dinner" },
    ],
  },
  {
    slug: "bars",
    label: "Bars",
    eyebrow: "Drinks",
    title: "Bars & lounge",
    lead: "A cool drink by day, good company by night.",
    intro: [
      "Whether it's a chilled drink after a swim or a nightcap at the end of the day, our bar is the easiest place in the hotel to unwind.",
      "Choose from cold beers, soft drinks, wines and spirits, mixed by our bar team and served at the bar or out on the terrace.",
    ],
    highlights: [
      { title: "Poolside drinks", text: "Cold drinks brought to you on the terrace while you enjoy the sun." },
      { title: "Evening lounge", text: "Relaxed seating to meet friends, talk business or simply wind down." },
      { title: "Events", text: "Birthdays, after-work gatherings and celebrations, arranged with our team." },
    ],
    details: [
      { label: "Opening hours", value: null },
      { label: "Location", value: null },
      { label: "Happy hour", value: null },
      { label: "Private events", value: null },
    ],
    photos: [
      { src: "/venues/bars-1.jpg", alt: "The Royal Kamak bar" },
      { src: "/venues/bars-2.jpg", alt: "Drinks at the bar" },
      { src: "/venues/bars-3.jpg", alt: "The lounge in the evening" },
    ],
  },
];

export function getVenue(slug: Venue["slug"]) {
  return VENUES.find((v) => v.slug === slug)!;
}

/** Header links, in order. */
export const SITE_LINKS = [
  { href: "/rooms", label: "Rooms" },
  { href: "/restaurant", label: "Restaurant" },
  { href: "/bars", label: "Bars" },
  { href: "/swimming", label: "Swimming" },
] as const;
