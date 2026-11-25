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

/** A dish shown on the restaurant page. Photos from Wikimedia Commons need their credit shown. */
export type Dish = {
  name: string;
  text: string;
  src: string;
  credit?: { author: string; license: string; licenseUrl: string; source: string };
  /** Shown large above the grid (the hotel's own photo). */
  featured?: boolean;
};

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
  /**
   * small: a low-resolution photo (under ~1200px wide, e.g. a frame from a
   * phone video). It is never stretched across the full-width banner.
   */
  photos: {
    src: string;
    alt: string;
    small?: boolean;
    /** Which part stays in view when the photo is cropped, as CSS object-position (e.g. "center 80%"). */
    focus?: string;
  }[];
  /** Dishes or drinks shown as a photo grid. */
  dishes?: Dish[];
  /** Heading above that grid (defaults to the restaurant's "Ghanaian favourites"). */
  dishesHeading?: { eyebrow: string; title: string; intro: string };
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
    dishes: [
      {
        name: "Jollof rice",
        text: "Rice cooked in a rich, spiced tomato and pepper sauce: West Africa's celebration dish.",
        src: "/venues/dishes/jollof.jpg",
        credit: { author: "Maame1Yaa", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", source: "https://commons.wikimedia.org/wiki/File:Jollof_rice_and_tomato_stew.jpg" },
      },
      {
        name: "Banku & grilled tilapia",
        text: "Smooth fermented corn and cassava dough with whole grilled tilapia, pepper and onions.",
        src: "/venues/dishes/banku.jpg",
        credit: { author: "sshreeves", license: "CC BY 2.0", licenseUrl: "https://creativecommons.org/licenses/by/2.0", source: "https://commons.wikimedia.org/wiki/File:Grilled_tilapia_with_banku.jpg" },
      },
      {
        name: "Fufu & light soup",
        text: "Pounded cassava and plantain served in a light, peppery tomato soup with meat or fish.",
        src: "/venues/dishes/fufu.jpg",
        credit: { author: "Umasoyee", license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0", source: "https://commons.wikimedia.org/wiki/File:Ghana_light_soup_and_fufu_01.jpg" },
      },
      {
        name: "Waakye",
        text: "Rice and beans cooked together, served with shito, stew, spaghetti, gari and egg.",
        src: "/venues/dishes/waakye.jpg",
        credit: { author: "Xibitgh", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", source: "https://commons.wikimedia.org/wiki/File:Waakye101.jpg" },
      },
      {
        name: "Kelewele",
        text: "Ripe plantain cubes spiced with ginger and pepper and fried until golden.",
        src: "/venues/dishes/kelewele.jpg",
        credit: { author: "Afimaame", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", source: "https://commons.wikimedia.org/wiki/File:Kelewele_and_chicken.jpg" },
      },
      {
        name: "Red red",
        text: "Black-eyed beans stewed in palm oil, served with sweet fried plantain.",
        src: "/venues/dishes/red-red.jpg",
        credit: { author: "Flixtey", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", source: "https://commons.wikimedia.org/wiki/File:Beans_with_Fried_Plantain.jpg" },
      },
    ],
    photos: [
      { src: "/venues/restaurant-hero.jpg", alt: "The covered terrace with tables, bar stools and menu boards", focus: "center 85%" },
      { src: "/venues/restaurant-2.jpg", alt: "The Royal Kamak restaurant" },
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
      "Our poolside bar sits beside the water, with stools at the counter and tables out on the lawn: the perfect spot for a cold drink between swims.",
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
    dishesHeading: {
      eyebrow: "At the bar",
      title: "Fine spirits & cocktails",
      intro: "Aged whisky, cognac, champagne, fine wines and classic cocktails. Ask the bar team for today's list.",
    },
    dishes: [
      {
        name: "Whisky",
        text: "Single malts and blended Scotch, served neat or over a large, slow-melting ice cube.",
        src: "/venues/drinks/whisky.jpg",
        credit: { author: "Personal Creations", license: "CC BY 2.0", licenseUrl: "https://creativecommons.org/licenses/by/2.0", source: "https://commons.wikimedia.org/wiki/File:Giant_ice_cube_in_whiskey_glass_(18495546988).jpg" },
      },
      {
        name: "Cognac",
        text: "Smooth, aged cognac and brandy, served in a warm snifter to end the evening.",
        src: "/venues/drinks/cognac.jpg",
        credit: { author: "Didier Descouens", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0", source: "https://commons.wikimedia.org/wiki/File:Cognac_glass.jpg" },
      },
      {
        name: "Champagne",
        text: "Chilled champagne and sparkling wine for celebrations, by the glass or the bottle.",
        src: "/venues/drinks/champagne-flute.jpg",
        credit: { author: "Jon Sullivan", license: "Public domain", licenseUrl: "https://commons.wikimedia.org/wiki/File:Champagne_flutes_glasses_bubbles.jpg", source: "https://commons.wikimedia.org/wiki/File:Champagne_flutes_glasses_bubbles.jpg" },
      },
      {
        name: "Fine wines",
        text: "Red, white and rosé wines, chosen to go with dinner or a quiet evening.",
        src: "/venues/drinks/red-wine.jpg",
        credit: { author: "Dave Gough", license: "CC BY 2.0", licenseUrl: "https://creativecommons.org/licenses/by/2.0", source: "https://commons.wikimedia.org/wiki/File:Pouring_red_wine_into_a_glass.jpg" },
      },
      {
        name: "Martini",
        text: "The timeless classic: ice-cold gin or vodka with a twist of lemon.",
        src: "/venues/drinks/martini.jpg",
        credit: { author: "Cocktailmarler", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", source: "https://commons.wikimedia.org/wiki/File:Martini_Cocktail.JPG" },
      },
      {
        name: "Old fashioned",
        text: "Whisky, bitters and a touch of sugar over ice, finished with orange peel.",
        src: "/venues/drinks/old-fashioned.jpg",
        credit: { author: "Erich Wagner", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", source: "https://commons.wikimedia.org/wiki/File:Whiskey_Old_Fashioned1.jpg" },
      },
    ],
    photos: [
      { src: "/venues/bars-hero-champagne.jpg", alt: "Two coupes of sparkling champagne against a dark background", focus: "center 40%" },
      { src: "/venues/bars-hero.jpg", alt: "The poolside bar beside the pool, with a high table and loungers under the canopy", focus: "20% center" },
      { src: "/venues/bars-1.jpg", alt: "The poolside bar, with bar stools and tables on the lawn", small: true },
      { src: "/venues/bars-2.jpg", alt: "Loungers under the canopy by the pool, with the poolside bar behind", small: true },
      { src: "/venues/bars-3.jpg", alt: "The bar in the evening" },
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
