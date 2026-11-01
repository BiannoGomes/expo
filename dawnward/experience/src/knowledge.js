// The Knowledge galaxy as a Tree of Life: from the world we can see (the root)
// to inner knowing (the crown). Science and wisdom traditions side by side, each
// labelled for what it is. Everything here is original writing from public sources:
// The Kybalion (1908, public domain), Plato's Timaeus, Kepler, and well-established
// science. All of it is a draft until Bianno (and, for science, a reviewer) checks it.

/** What kind of knowledge a planet holds. Shown on every row, so nothing passes as what it isn't. */
export const KINDS = { science: "Science", wisdom: "Wisdom tradition", both: "Science and tradition", practice: "Practice", map: "The map" };

/** The ten spheres (sefirot) of the Tree of Life, laid out as in the classic Western diagram. x: -1 left, 0 middle, 1 right. */
export const SEFIROT = [
  { id: "keter", name: "Keter", english: "Crown", meaning: "The source, beyond words.", x: 0, y: 0 },
  { id: "chokmah", name: "Chokmah", english: "Wisdom", meaning: "The first spark of insight.", x: 1, y: 0.7 },
  { id: "binah", name: "Binah", english: "Understanding", meaning: "Giving the spark a form.", x: -1, y: 0.7 },
  { id: "chesed", name: "Chesed", english: "Loving-kindness", meaning: "Giving and expanding.", x: 1, y: 2.1 },
  { id: "gevurah", name: "Gevurah", english: "Strength", meaning: "Limits, discipline, the wisdom of no.", x: -1, y: 2.1 },
  { id: "tiferet", name: "Tiferet", english: "Beauty", meaning: "Harmony and balance at the heart.", x: 0, y: 2.8 },
  { id: "netzach", name: "Netzach", english: "Endurance", meaning: "Feeling, desire, persistence.", x: 1, y: 4.2 },
  { id: "hod", name: "Hod", english: "Splendour", meaning: "Thought, language and order.", x: -1, y: 4.2 },
  { id: "yesod", name: "Yesod", english: "Foundation", meaning: "The bridge between inner and outer.", x: 0, y: 4.9 },
  { id: "malkuth", name: "Malkuth", english: "Kingdom", meaning: "The physical world, here and now.", x: 0, y: 6.2 },
];
/** The twenty-two paths between them. */
export const PATHS = [["keter", "chokmah"], ["keter", "binah"], ["keter", "tiferet"], ["chokmah", "binah"], ["chokmah", "tiferet"], ["chokmah", "chesed"], ["binah", "tiferet"], ["binah", "gevurah"],
  ["chesed", "gevurah"], ["chesed", "tiferet"], ["chesed", "netzach"], ["gevurah", "tiferet"], ["gevurah", "hod"], ["tiferet", "netzach"], ["tiferet", "yesod"], ["tiferet", "hod"],
  ["netzach", "hod"], ["netzach", "yesod"], ["netzach", "malkuth"], ["hod", "yesod"], ["hod", "malkuth"], ["yesod", "malkuth"]];

export const TREE_LESSON = [
  "The Tree of Life is a diagram from Kabbalah, a Jewish mystical tradition. It shows ten spheres, called sefirot, joined by twenty-two paths. Western Hermetic schools later adopted it as a map of creation and of the self.",
  "Here it's a map for learning. Its root, Kingdom, is the world we can see and measure. Its heart, Beauty, is balance. Its crown is inner knowing. Climbing it moves from outside to inside.",
  "It's offered with respect, as a way to explore, not as religious instruction. Each sphere below says what it traditionally means, and which world of this galaxy sits there.",
];

/** The seven principles, quoted from The Kybalion (1908, public domain), then explained in plain words. */
export const PRINCIPLES = [
  { name: "Mentalism", axiom: "THE ALL is MIND; The Universe is Mental.",
    means: "The Kybalion teaches that everything begins in mind. You don't have to take that as a claim about physics to use it. As a lens: your thoughts shape what you notice, what you try, and who you become.",
    practise: "Notice one thought that keeps returning today. Ask: is it true, is it useful, is it mine?",
    honest: "A philosophical teaching, not a scientific finding. Psychology does show that how we interpret events changes how we feel and act." },
  { name: "Correspondence", axiom: "As above, so below; as below, so above.",
    means: "Patterns repeat across scales: the small mirrors the large. The way you do one thing often shows how you do everything.",
    practise: "Pick one small habit, like how you start your morning. What larger pattern in your life does it echo?",
    honest: "Nature does repeat patterns at different scales, like the branching of rivers, trees and lungs. The teaching uses this as a metaphor for inner and outer life." },
  { name: "Vibration", axiom: "Nothing rests; everything moves; everything vibrates.",
    means: "Nothing is truly still. In this teaching, moods and states have their own pace, and you can shift yours.",
    practise: "Notice your state right now as if it had a pace: fast, slow, heavy, light. Change one thing (your breath, posture or music) and notice what shifts.",
    honest: "Physics does find motion everywhere, from atoms to galaxies. Talk of emotional frequencies is a metaphor, not a measurement." },
  { name: "Polarity", axiom: "Everything is Dual; everything has poles; everything has its pair of opposites; like and unlike are the same; opposites are identical in nature, but different in degree; extremes meet; all truths are but half-truths; all paradoxes may be reconciled.",
    means: "Opposites are two ends of one line. Hot and cold are degrees of temperature; fear and courage, the teaching says, are degrees of one thing. You can move along the line instead of leaping to the other end.",
    practise: "Name one feeling you'd like to change. What's one small step along the line toward its opposite, not the whole way?",
    honest: "A way of thinking from philosophy. Research on reappraisal, changing how you see a feeling, supports the idea that this can change the feeling itself." },
  { name: "Rhythm", axiom: "Everything flows, out and in; everything has its tides; all things rise and fall; the pendulum-swing manifests in everything; the measure of the swing to the right is the measure of the swing to the left; rhythm compensates.",
    means: "Everything moves in cycles: tides, seasons, energy, mood. The teaching invites you to expect the swing back, and not be thrown by it.",
    practise: "Look at your last week. When did your energy rise and fall? Plan one thing to suit the rhythm instead of fighting it.",
    honest: "Biology is full of real rhythms, like the roughly 24-hour circadian rhythm. The rest is a philosophy of patience." },
  { name: "Cause and Effect", axiom: "Every Cause has its Effect; every Effect has its Cause; everything happens according to Law; Chance is but a name for Law not recognized; there are many planes of causation, but nothing escapes the Law.",
    means: "Nothing happens without a cause. The teaching asks you to become a cause in your own life, not only an effect of everything around you.",
    practise: "Choose one small cause you control today, like a message sent or a walk taken, and watch for its effect.",
    honest: "Cause and effect is a basis of science too, though at the smallest scales physics finds that some events can only be predicted as probabilities." },
  { name: "Gender", axiom: "Gender is in everything; everything has its Masculine and Feminine Principles; Gender manifests on all planes.",
    means: "The Kybalion uses masculine and feminine for two creative forces in everyone, whatever their gender: one that acts and directs, one that receives and creates. Many people today call them active and receptive.",
    practise: "Where in your life do you need to act, and where do you need to receive or wait? Name one of each.",
    honest: "This is the book's 1908 language for an old idea of balance, not a statement about men and women." },
];
export const HALL_INTRO = "The seven principles come from The Kybalion, a book published in 1908 by anonymous authors calling themselves Three Initiates. It presents them as ancient Hermetic teaching, named after the legendary Hermes Trismegistus. Historians generally trace the book's ideas to the New Thought movement of its own time. Read them as a philosophy to try, not as facts.";

/** The Flower of Life, grown one step at a time. */
export const FLOWER = [
  { name: "One circle", text: "Everything here grows from one circle. Many traditions use the circle for wholeness: no beginning, no end." },
  { name: "The Seed of Life", text: "Six circles around the first, each passing through its centre: seven in all. Some modern teachers link it to the seven days of creation." },
  { name: "The Flower of Life", text: "Keep adding circles the same way and nineteen overlap inside a larger ring. The pattern appears in many places, in ancient sites, medieval art and Leonardo da Vinci's notebooks, where he studied its geometry. One famous example is drawn on a pillar of the Temple of Osiris at Abydos in Egypt; how old it is, is debated." },
  { name: "The Fruit of Life", text: "Thirteen circles that just touch, taken from the same grid. Sacred geometry teaching treats it as a blueprint hidden inside the flower." },
  { name: "Metatron's Cube", text: "Join the centres of those thirteen circles with straight lines: 78 lines in all. Teachers often say all five Platonic solids hide inside it. Three of them, the tetrahedron, cube and octahedron, can be traced exactly; the other two only roughly. Next door, in the Five Solids, they come to life." },
];

/** The five Platonic solids, and the star tetrahedron. */
export const SOLIDS = [
  { id: "tetra", name: "The tetrahedron", counts: "4 triangle faces, 4 corners, 6 edges.", text: "Plato's fire: the sharpest. In chemistry, a methane molecule and the carbon atoms in diamond really do bond in this shape." },
  { id: "cube", name: "The cube", counts: "6 square faces, 8 corners, 12 edges.", text: "Plato's earth: the steadiest. Grains of table salt grow as tiny cubes." },
  { id: "octa", name: "The octahedron", counts: "8 triangle faces, 6 corners, 12 edges.", text: "Plato's air. Diamond and fluorite crystals often grow in this shape." },
  { id: "icosa", name: "The icosahedron", counts: "20 triangle faces, 12 corners, 30 edges.", text: "Plato's water: the roundest. Many viruses build their shells in this shape." },
  { id: "dodeca", name: "The dodecahedron", counts: "12 pentagon faces, 20 corners, 30 edges.", text: "Plato gave it to the whole cosmos: in his Timaeus, the fifth shape is the one used for the arrangement of the heavens." },
  { id: "star", name: "The star tetrahedron", counts: "Two tetrahedra, one pointing up, one down, interlocked.", text: "Johannes Kepler named it the stella octangula, the eight-pointed star. In some modern spiritual teaching it's called the Merkaba, a vehicle of light; that meaning is a belief, not geometry." },
];
export const SOLIDS_INTRO = [
  "There are exactly five solids whose faces are all the same regular shape, meeting the same way at every corner. Mathematicians proved there can be no more. For each one, corners minus edges plus faces always equals 2.",
  "Plato, in his dialogue Timaeus (around 360 BCE), matched four of them to the elements and the fifth to the whole cosmos.",
  "In 1596 Johannes Kepler tried to explain the spacing of the six planets known then by nesting these solids between their orbits. It was beautiful, and wrong: his own later work showed the orbits are ellipses. A good lesson in letting evidence win.",
];

/** Inner knowing: a careful, simple practice. */
export const KNOWING_STEPS = [
  { name: "Settle", text: "Breathe slowly for a minute. Let your shoulders drop and your jaw soften." },
  { name: "Ask", text: "Write one honest question, in a single sentence." },
  { name: "Notice", text: "Read your question back slowly. Before any thought arrives, notice your body's first response." },
  { name: "Write", text: "Write what you noticed, and anything you sense, without judging it." },
  { name: "Let it rest", text: "Keep it. Come back in a day and see what still feels true. Inner knowing grows clearer with time, not pressure." },
];
export const FELT = ["Tight", "Open", "Heavy", "Light", "Warm", "Nothing yet"];
export const KNOWING_NOTE = [
  "Inner knowing is the quiet sense of what's right for you, underneath the noise. Every tradition in this galaxy points toward it.",
  "Researchers study interoception, our sense of signals from inside the body. Some studies link it with decision-making; the findings are still developing.",
  "Inner knowing works best alongside facts and people you trust, not instead of them. For health, money or safety, get proper advice too.",
];

/** The Cosmic Calendar: the whole history of the universe squeezed into one year (an idea made famous by Carl Sagan). Ages in years. */
export const AGE = 13.8e9;
export const CALENDAR = [
  [13.8e9, "The Big Bang", "Space, time and everything in them begin."],
  [13.6e9, "The first stars light up", "Roughly 100 to 200 million years after the start."],
  [4.6e9, "The Sun and Earth form", "From a cloud of gas and dust."],
  [3.7e9, "The earliest signs of life", "Tiny single cells. The oldest evidence is still debated."],
  [2.4e9, "Oxygen fills the air", "Cyanobacteria, tiny life using sunlight, change the planet's air."],
  [538e6, "Complex animals spread", "The Cambrian explosion: eyes, shells, legs."],
  [230e6, "The first dinosaurs", ""],
  [66e6, "The dinosaurs' age ends", "An asteroid impact ends most of them. Birds are their survivors."],
  [300e3, "The first modern humans", "Homo sapiens, in Africa."],
  [12e3, "Farming begins", ""],
  [5.2e3, "Writing begins", "All of recorded history starts here."],
  [0, "Now", "You, reading this."],
];
/** Where an event falls in the one-year calendar: { month, day, time }. */
export function calendarDate(age) {
  const secs = ((AGE - age) / AGE) * 365 * 86400;
  const d = new Date(Date.UTC(2001, 0, 1) + Math.min(secs, 365 * 86400 - 1) * 1000);
  return { month: d.getUTCMonth(), day: d.getUTCDate(), time: d.toISOString().slice(11, 19), frac: secs / (365 * 86400) };
}
export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Go deeper: works by others, named and linked, never copied. To confirm with Bianno. */
export const DEEPER = [
  ["The Kybalion", "Three Initiates, 1908. The source of the seven principles; free to read, it's in the public domain."],
  ["Cosmos and Pale Blue Dot", "Carl Sagan (series 1980; book 1994). The universe made personal."],
  ["Cosmos: A Spacetime Odyssey", "Neil deGrasse Tyson (series, 2014). Its Cosmic Calendar inspired the one here."],
  ["Astrophysics for People in a Hurry", "Neil deGrasse Tyson (book, 2017)."],
  ["Universe", "Brian Cox (BBC series, 2021)."],
  ["Breaking the Habit of Being Yourself", "Joe Dispenza (book, 2012). On meditation and changing habits of mind."],
];
