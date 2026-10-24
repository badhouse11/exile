// EXILE card data. Hidden scoring line format:
// "Name|BODY|MIND|SUPPLY|tags|kind|note|battery"
// BODY = health/safety, MIND = morale/enjoyment, SUPPLY = how long it keeps you going. All 1-5.
// tags: c = good in the cold, h = good in the heat, w = good near water, p = perishable (spoils in heat),
//       d = back from the dead (a legendary partner), l = legendary
// kind = small label; note = the card's line (the upside, then the catch); battery = days of power, or "solar"
// kind = small category label; note = one-line subheading; battery = days of power, or "solar"

export type Category = "PARTNER" | "TOOL" | "FOOD" | "ANIMAL" | "ENJOYMENT";
export type Temp = "FREEZING" | "MILD" | "SCORCHING";
export interface Location { name: string; temp: Temp; water: boolean }
export interface Card {
  id: string; category: Category; name: string;
  body: number; mind: number; supply: number; tags: string;
  kind: string; note: string; battery: string;
  dead: boolean; // back from the dead (partners)
  legendary: boolean; // rare: at most one per category per round
}

export const LOCATIONS: Location[] = [
  { name: "Snowbound Peak", temp: "FREEZING", water: false },
  { name: "Arctic Ice Shelf", temp: "FREEZING", water: true },
  { name: "Frozen Tundra", temp: "FREEZING", water: false },
  { name: "Highland Moor", temp: "MILD", water: false },
  { name: "Ancient Forest", temp: "MILD", water: false },
  { name: "Fenland Bog", temp: "MILD", water: true },
  { name: "Rocky Sea Stack", temp: "MILD", water: true },
  { name: "Remote Fjord", temp: "MILD", water: true },
  { name: "Desert Island", temp: "SCORCHING", water: true },
  { name: "Endless Dunes", temp: "SCORCHING", water: false },
  { name: "Steaming Jungle", temp: "SCORCHING", water: false },
  { name: "Mangrove Swamp", temp: "SCORCHING", water: true },
  { name: "Volcanic Island", temp: "SCORCHING", water: true },
];

const PARTNER = `
Bear Grylls|5|2|5|ch|Survivalist|Will get you out alive. Will make you drink something first.
Robert Irwin|4|4|3|h|Survivalist|Crocodiles love him. Everything else does too.
Alex Honnold|4|2|2|c|Survivalist|Can climb anything. Can’t talk about anything else.
David Attenborough|2|5|3|h|Brains|Knows every creature by name. Will narrate your decline.
Neil deGrasse Tyson|2|4|2||Brains|Navigates by the stars. Will correct you about them.
Hannah Fry|2|4|3||Brains|Will calculate your exact odds. You won’t like them.
Stephen Fry|1|5|1||Brains|Knows everything. Has never once made a fire.
Barack Obama|3|5|2||Power player|Calm in any crisis. Great speeches, audience of one.
Michelle Obama|3|5|4||Power player|Plants a garden by day two. Higher standards than you.
Donald Trump|1|3|1||Power player|Will call it the best island ever. Won’t build the shelter.
Elon Musk|2|2|3||Power player|Promises a rocket home. Delivery date TBC.
Oprah Winfrey|2|5|3||Power player|You get a coconut! Morale through the roof.
Kim Kardashian|1|3|1|h|Power player|Runs an empire from her phone. You don’t have signal.
Dwayne Johnson|5|4|3|h|Muscle|Can carry the whole camp. Charisma keeps the fire going.
Chris Hemsworth|5|4|3|h|Muscle|Thor’s arms. Thor’s appetite.
Jason Momoa|5|4|3|w|Muscle|At home in the sea. Brings the party.
Tom Hanks|3|5|3|hw|Actor|Survived Cast Away. Still talks to volleyballs.
Keanu Reeves|4|5|2||Actor|Kind, calm, lethal. Shares his last biscuit.
Jennifer Lawrence|4|4|4||Actor|Handy with a bow. Trips on the way to get it.
Zendaya|3|4|2|h|Actor|Survived the desert in Dune. Mostly in costume.
Viola Davis|3|5|3||Actor|The most formidable person on any island. Nobody argues.
Michelle Yeoh|4|4|2||Actor|Does her own stunts. Can fight with whatever’s to hand.
Idris Elba|4|4|2||Actor|Cool head, useful hands. Will DJ every sunset.
Sandra Bullock|3|4|3||Actor|Survived space alone in Gravity. An island’s a holiday.
Jackie Chan|5|5|2||Actor|Can win any fight with a ladder. Bring a ladder.
Danny DeVito|1|5|1||Actor|Excellent company. Will eat anything. Anything.
Beyoncé|3|5|1||Musician|Flawless at everything. Expects the same of your hut.
Taylor Swift|2|5|1||Musician|Morale ten out of ten. Fall out and you’re the next single.
Rihanna|2|5|1|h|Musician|Completely unbothered. Has the sun cream sorted.
Snoop Dogg|1|5|1|h|Musician|Nothing stresses him. Including the tide coming in.
Serena Williams|5|4|2||Athlete|Unbreakable. Will turn foraging into a competition.
Simone Biles|5|4|2||Athlete|Can reach any coconut. Gravity is optional.
Usain Bolt|5|4|1|h|Athlete|Outruns most predators. Over 100 metres.
LeBron James|5|4|2||Athlete|Reaches the high branches. Needs a shelter twice the size.
Michael Phelps|5|3|3|w|Athlete|Basically lives in water. Eats 10,000 calories a day.
Gordon Ramsay|3|2|5||Cook|Turns anything into dinner. Shouts at it first.
Nigella Lawson|2|5|4||Cook|Makes beans on a rock sound sinful.
Martha Stewart|2|4|4||Cook|Builds a log cabin. With matching napkins.
Kevin Hart|3|5|2||Comedian|Tiny, loud and very fit. Never stops talking.
Tina Fey|2|5|2||Comedian|Quickest wit going. Will write a sitcom about your misery.
Bob Mortimer|2|5|3|w|Comedian|Goes fishing for real. Morale unbeatable.
James Acaster|1|3|1||Comedian|Very funny. Very existential. Day three is rough.
Dolly Parton|3|5|3|d|Legend|1946–2026. Morale for days. Will write a hit about your hut.
Ernest Shackleton|5|4|5|cd|Legend|1874–1922. Got his whole crew home from the Antarctic.
Steve Irwin|5|5|4|hd|Legend|1962–2006. Fearless with anything that bites. Crikey.
Napoleon Bonaparte|3|3|4|d|Legend|1769–1821. Exiled twice. Knows the drill.
Harry Houdini|4|4|2|d|Legend|1874–1926. Can escape anything. Except maybe this.
Amelia Earhart|4|4|2|d|Legend|1897–1937. Can fly you out. Navigation slightly patchy.
Muhammad Ali|5|5|2|d|Legend|1942–2016. Floats like a butterfly. Will box the bear.
Cleopatra|2|4|3|hd|Legend|69–30 BC. Ruled Egypt. Will rule the island by Tuesday.
`;

const TOOL = `
Bow and arrows|4|3|5||Hunting|Dinner, eventually. Have you ever fired one?
Spear gun|3|3|5|w|Hunting|Fish supper every night. Mind your feet.
Fishing rod and tackle|2|4|5|w|Hunting|Patience feeds you. You’ll need loads.
Fishing net|2|2|5|w|Hunting|Catches more than a rod. Mostly seaweed.
Slingshot|3|3|3||Hunting|Good for birds. Better for annoying people.
Rabbit snares|2|1|4||Hunting|Set and forget. Then remember where.
Machete|4|2|4|h|Blade|Clears jungle, builds shelter, opens coconuts. Keep fingers clear.
Axe|4|2|4|c|Blade|Firewood for life. Blisters for a week.
Swiss Army knife|4|2|3||Blade|A tool for everything. Mostly the toothpick.
Multitool|3|2|3||Blade|Pliers, blade, screwdriver. Nothing big enough to matter.
Folding saw|3|2|3||Blade|Shelter in an afternoon. Quiet, at least.
Chainsaw (one tank)|3|2|2||Blade|A cabin by lunch. Then a very heavy paperweight.
Shovel|3|1|3||Blade|Dig a well, a shelter, a toilet. Hopefully in that order.
Flint and steel|5|3|3|c|Fire|Fire forever, even when wet. Takes practice. Lots.
Box of 200 matches|5|3|2|c|Fire|Instant fire. Exactly 200 times.
Storm lighter|5|3|3|c|Fire|Lights in a gale. Runs dry eventually.
Magnifying glass|3|2|2|h|Fire|Free fire when it’s sunny. Useless when it isn’t.
Solar torch|3|3|3||Light|Light every night. Only if you remember to charge it.|solar
Head torch and 40 batteries|3|3|2||Light|Hands-free light. The batteries are a countdown.|20
Hurricane lamp|3|4|2|c|Light|A cosy glow. Smells like a garage.
Four-season tent|5|3|4|c|Shelter|Bombproof. Putting it up is a two-person argument.
Tarpaulin and rope|4|2|3||Shelter|A roof, a rain-catcher, a sail. Flaps all night.
Hammock with mosquito net|4|3|3|h|Shelter|Off the ground, away from snakes. Good luck getting out.
Minus 20 sleeping bag|5|3|4|c|Shelter|Survives any night. Sweltering in a jungle.
Down jacket|5|3|3|c|Shelter|Warm anywhere cold. Useless once it’s soaked.
Foil blankets|4|1|2|c|Shelter|Keep the heat in. Rustle like crisp packets all night.
Water filter straw|5|1|4||Water|Drink from any puddle. One sip at a time.
Gravity water filter|5|1|5||Water|10 litres of clean water a day. Needs a tree to hang from.
Purification tablets (x200)|5|1|4||Water|Safe water, guaranteed. Tastes like a swimming pool.
Solar still|4|1|4|hw|Water|Drinking water from seawater. About a cupful a day.
Inflatable kayak|3|4|4|w|Travel|Explore the coast. One puncture from swimming.
Small rowing boat|4|3|4|w|Travel|Fish further out, maybe even leave. Arms of steel required.
Snowshoes|4|1|3|c|Travel|Walk on top of the snow. Look ridiculous doing it.
Compass and map|3|2|3||Travel|You’ll know exactly where you are. Nowhere.
Satellite phone (one bar)|3|3|1||Rescue|Could call for rescue. Could die mid-sentence.|2
Flare gun (3 flares)|3|3|1||Rescue|Three chances to be seen. Choose wisely.
Signal mirror|2|1|2|h|Rescue|Visible for miles. When it’s sunny.
Wind-up radio|2|4|2||Rescue|News from home and the shipping forecast. Your arm will ache.
First aid kit|5|2|3||Kit|Fixes the small stuff. Hope that’s all you get.
Duct tape (10 rolls)|3|2|3||Kit|Fixes everything else.
Paracord (100m)|3|1|4||Kit|Shelter, snares, a washing line. Tangles instantly.
Cast-iron pot|3|3|4||Kit|Cooks anything, lasts forever. Weighs a ton.
Toilet roll (48 pack)|2|5|3||Kit|Sheer luxury. Also very flammable.
Insect repellent (20 bottles)|4|3|3|h|Kit|Saves your sanity in the swamp. Smells awful.
Binoculars|2|3|2||Kit|Spot ships, storms and dinner. Can’t reach any of them.
Seed planting kit|2|3|5||Kit|Food for years. Starting in about four months.
Complete fire kit|6|4|5|cl|Legendary|Flint, storm lighters, firelighters and a year of kindling. Fire whenever you need it, for a year.
The ultimate survival pack|6|3|5|l|Legendary|Knife, fire, water filter, shelter and first aid in one bag. Everything you need, nothing you want.
Solar water purifier|6|2|6|hl|Legendary|40 litres of clean water a day, even from the sea. Only when the sun’s out.
Flat-pack log cabin|6|5|4|cl|Legendary|A proper roof, walls and a door. Assembly instructions may be missing.
`;

const FOOD = `
3 ribeye steaks|3|5|1|p|Luxury|The best dinner of your life. Three times.
1kg smoked salmon|3|5|1|p|Luxury|Pure luxury. Gone by Wednesday.
2 weeks of chocolate|2|5|2|c|Luxury|Morale fixed. Melts in the heat.
A wheel of Parmesan|3|5|3||Luxury|Lasts months, makes everything better. Weighs a ton.
A Christmas pudding|2|5|2||Luxury|Christmas, wherever you are. Once.
12 lobsters|3|5|1|pw|Luxury|A feast for kings. Who then have no lobsters.
20 doughnuts|1|5|1|p|Luxury|Incredible for a day. Grim by day three.
A jar of Nutella|2|5|1||Luxury|Spoonfuls of joy. One jar.
A bucket of fried chicken|3|5|1|p|Luxury|Perfect first night. Then just bones.
12 Scotch eggs|3|4|1|p|Luxury|Picnic perfection. Picnics end.
A crate of Guinness (24 cans)|1|5|2|c|Drink|Good for you, they say. Not for 24 days.
A crate of lager (24 cans)|1|5|2||Drink|Instant party. Instant dehydration.
12 bottles of Champagne|1|5|1||Drink|Celebrate surviving, every night for 12 nights.
A bottle of whisky|1|5|1|c|Drink|Warms you up. Cleans wounds, technically.
500 teabags|1|5|4|c|Drink|A proper cuppa every day for a year. Needs clean water.
2kg coffee beans|1|5|3||Drink|Mornings sorted. Grind them with a rock.
48 cans of Coca-Cola|1|4|2|h|Drink|Sugar and fizz. Not much else.
40 potatoes|4|2|4|c|Staple|Boil, bake, mash or plant. Very reliable. Very beige.
25kg sack of rice|4|1|5||Staple|Feeds you for months. Every single meal.
20kg porridge oats|4|2|5|c|Staple|Warm breakfast for half a year. The same breakfast.
50 tins of baked beans|4|3|5||Staple|Protein and comfort. Your neighbours will suffer.
15 tins of tuna|4|2|4||Staple|Protein for weeks. Your breath for weeks.
5kg beef jerky|4|3|4||Staple|Lasts forever, weighs nothing. Jaw ache.
100 energy bars|4|3|4||Staple|Fuel on the go. Tastes of cardboard and ambition.
30 Pot Noodles|2|4|3||Staple|Hot food in three minutes. Needs boiling water.
12 jars of peanut butter|4|4|4||Staple|Calories, protein, happiness. Thirsty work.
150 bagels|3|4|3|p|Staple|Breakfast for months. Mouldy within a fortnight.
200 cream crackers|3|2|4||Staple|They never go off. Neither does the dryness.
A wheel of cheddar|4|4|3||Staple|Keeps for months. Smells like it.
40 eggs|4|3|2|p|Staple|Brilliant protein. Fragile cargo.
30 tins of soup|4|3|4|c|Staple|A hot dinner in a tin. The same three flavours.
20kg pasta and 10 jars of sauce|4|4|4||Staple|Italian night, every night.
A jar of honey|3|4|5||Staple|Never goes off, heals cuts, sweetens anything. One jar.
1kg salt|3|1|5||Staple|Keeps fish and meat for months. Not a meal.
10 jars of Marmite|2|3|5||Staple|Love it or hate it. There’s nothing else.
5kg mixed nuts|4|3|4||Staple|Energy that lasts. The monkeys want them.
10 coconuts|3|3|3|h|Staple|Food and drink in one. You need something to open them.
A crate of 50 lemons|3|2|2||Staple|Stops scurvy. Not exactly dinner.
Seed potatoes|3|1|5||Grow|Plant once, eat forever. First harvest in three months.
Vegetable seed vault (40 varieties)|3|3|5||Grow|A whole allotment. No rain, no veg.
Fruit tree saplings|2|3|5||Grow|Apples one day. Not this year.
Mushroom growing kit|3|3|4|w|Grow|Grows in the dark and damp. Know which ones you’re eating.
Sourdough starter and 50kg flour|4|4|5||Make|Fresh bread daily. Needs feeding like a pet.
Home-brew kit|1|5|4||Make|Beer in four weeks. Four long weeks.
Smoking and curing kit|3|2|5|c|Make|Keeps meat and fish for months. You’ll smell of bonfire forever.
A wormery|1|1|4|w|Make|Endless fishing bait. It’s a box of worms.
A year of ration packs|6|2|6|l|Legendary|Every meal for 365 days, sorted. Very, very samey.
The full allotment|5|4|6|l|Legendary|Seeds, tools, compost and a polytunnel. Food for life, if you put the work in.
A solar fridge full of food|5|5|5|hl|Legendary|Fresh meat and veg for weeks, in any heat. Then it’s just a fridge.
The chef’s hamper|4|6|3|l|Legendary|Cheeses, cured meats, wine, chocolate, the works. Pure joy, while it lasts.
`;

const ANIMAL = `
A dog|3|5|2||Dog|Best friend, guard and hot water bottle. Eats your food.
Two dogs|4|5|3||Dog|Double the loyalty. Double the dinner.
Three dogs|4|5|3|c|Dog|A proper pack. A hungry pack.
Chicken|1|3|4||Farm|An egg a day. Gives up in the cold.
A rooster and four hens|1|3|5||Farm|Eggs for life. Woken at dawn for life.
Dairy cow|3|2|5||Farm|Milk every day. Needs a field of grass.
Goat|2|3|4||Farm|Milk, and eats anything. Including your tent.
Sheep|2|2|3|c|Farm|Wool for jumpers. Not the brightest.
Pig|2|3|4||Farm|Eats your scraps, sniffs out truffles. You’ll get attached.
Duck|1|3|3|w|Farm|Eggs, and happy in a swamp. Very loud.
Beehive|2|3|4||Farm|Honey for life. Stings for life.
Rabbits (a pair)|1|4|4||Farm|Food for the future. A lot of future.
Donkey|3|3|3|h|Working|Carries anything, anywhere. On its own schedule.
Mule|4|2|3||Working|Stronger than a donkey, tougher than a horse. Stubborn.
Water buffalo|4|2|4|hw|Working|Ploughs, pulls and gives milk. Wallows in everything.
Reindeer|4|2|4|c|Working|Built for snow, pulls a sledge. Useless in a heatwave.
Llama|3|3|3|c|Working|Carries your kit up mountains. Very judgemental.
Alpaca|2|4|3|c|Working|The softest wool going. Also spits.
Ox|4|1|3||Working|Pulls a plough and never tires. Not a talker.
Yak|4|2|4|c|Working|Milk, wool and transport at altitude. Smells like a yak.
Falcon|3|3|4||Hunter|Hunts for you. Comes back if it likes you.
Golden eagle|4|3|4|c|Hunter|Catches rabbits, even foxes. Terrifying.
Barn owl|2|4|2||Hunter|Keeps rats off the food. Silent and slightly spooky.
Ferret|2|3|3||Hunter|Your rabbiting partner. Gets into everything.
Cat|1|4|2||Hunter|Keeps mice off the stores. Strictly on its own terms.
Otter|2|5|3|w|Hunter|Catches fish, holds your hand. Steals the fish.
Cormorant|2|3|4|w|Hunter|Fishes for you, the old-fashioned way. Eats half.
Parrot|1|5|1|h|Company|Someone to talk to. Repeats everything you say.
Crow|2|4|2||Company|Cleverer than you. Might bring you gifts.
Raven|2|4|2|c|Company|Brilliant and loyal. A bit gothic.
Carrier pigeon|3|3|1||Company|A message home. One message.
Tortoise|1|3|1|h|Company|Lives forever, no trouble. No help either.
Capybara|2|5|2|hw|Company|The calmest animal on earth. Everything loves it.
Guinea pig|1|4|1||Company|Tiny, cheerful, squeaks when happy. Useless in a crisis.
Meerkat|2|4|2|h|Company|Lookout duty, day and night. Easily distracted.
Hedgehog|1|4|1||Company|Eats your slugs, endlessly sweet. Prickly cuddles.
A wolf (probably tame)|5|2|3|c|Wild|Protection like nothing else. Probably.
Gorilla|5|3|3|h|Wild|Gentle giant bodyguard. Don’t annoy it.
Orangutan|4|5|3|h|Wild|Builds a better nest than you. Smarter than you.
Chimpanzee|3|4|3|h|Wild|Uses tools and finds fruit. Uses your tools.
Seal|2|4|2|cw|Wild|Fun company on the shore. Smells of fish.
Dolphin|3|5|3|w|Wild|Guides you to fish, chases off sharks. Lives in the sea.
Kangaroo|4|3|2|h|Wild|A boxing bodyguard. Bad at sharing a tent.
Grizzly bear|5|1|3|c|Wild|Nothing will ever bother you again. Including the bear, hopefully.
Polar bear cub|4|3|2|c|Wild|Adorable now. Not in six months.
Lion|5|2|3|h|Wild|King of the jungle and your bodyguard. Also hungry.
Horse|5|5|4|l|Legendary|Travel, hauling, warmth and a friend. Eats like a horse.
A mountain-rescue St Bernard|6|5|4|cl|Legendary|Finds people in the snow, carries supplies, keeps you warm. Drools.
A trained elephant|6|4|5|hl|Legendary|Clears land, carries logs, guards camp, never forgets where the water is. Eats 150kg a day.
A trained camel|5|3|6|hl|Legendary|Weeks without water, carries everything, knows the desert. Still spits.
`;

const ENJOYMENT = `
Complete Works of Shakespeare|1|5|5||Book|Every story ever told, basically. Some of it in verse.
The Bible|1|5|5||Book|The best-selling book of all time. Long nights, sorted.
War and Peace|1|4|5||Book|Will last you months. That’s the point.
Pride and Prejudice|1|5|4||Book|Romance, wit and manners. Not many manners where you’re going.
Robinson Crusoe|1|4|4||Book|A how-to guide, basically. He was there for 28 years.
The Odyssey|1|4|4||Book|The original long journey home. Ten years of it.
The Complete Sherlock Holmes|1|5|5||Book|60 mysteries. You’ll solve the first by day two.
The Count of Monte Cristo|1|5|5||Book|A prisoner escapes and gets revenge. Very motivating.
SAS survival handbook|4|2|4||Book|Genuinely useful. Zero fun.
A field guide to edible plants|4|2|4||Book|Tells you what’s safe to eat. Doesn’t make it taste nice.
A football|3|5|4||Sport|Kickabouts for life. Lose it once and that’s that.
Frisbee|2|4|4||Sport|Throw, catch, repeat. The wind wins eventually.
Surfboard|3|5|4|hw|Sport|The best day of your life on a good swell. Wet the rest of the time.
Dumbbells|4|3|5||Sport|Stay strong. Heavy to bring.
Yoga mat|3|4|5||Sport|Inner peace and loose hamstrings. Still on an island.
Kite|1|4|3||Sport|Flies all day on a windy beach. Might even catch a plane’s eye.
Chess set|1|5|5||Game|A lifetime of strategy. You need someone to play.
Deck of cards|1|5|5||Game|Hundreds of games in your pocket. Mostly patience.
Scrabble|1|5|5||Game|Brilliant for arguments. Missing the Q.
Monopoly|1|4|4||Game|Hours of fun. Ends friendships.
A bucket of Lego|1|5|5||Game|Build anything. Stand on it barefoot.
1,000-piece jigsaw|1|4|2||Game|A week of focus. Then it’s done.
Acoustic guitar|1|5|5||Music|Campfire songs every night. Snap a string and it’s over.
Ukulele|1|5|4||Music|Impossible to be sad playing it. Very possible to annoy everyone.
Harmonica|1|4|5||Music|Fits in your pocket and plays the blues. You’ll feel the blues.
Bongo drums|1|4|5||Music|Rhythm, morale and signalling. Everyone else hates them.
Violin|1|4|4||Music|Beautiful in the right hands. Are yours?
Wind-up gramophone and 10 records|1|5|3||Music|Music with no batteries. Ten records.
Paints and 4 canvases|1|5|2||Make|Four masterpieces. Then just paint.
Sketchbook and 50 pencils|1|5|4||Make|Draw your new world. Months of pages.
Journal and pens|1|5|4||Make|Write your memoir. Everyone’s the hero of their own.
Whittling knife|2|4|5||Make|Carve spoons, figures, anything. Also a knife.
Telescope|1|5|5||Make|The night sky like you’ve never seen it. Only at night.
Walkman and 30 mixtapes|1|5|2||Gadget|Your songs. For six days.|6
Nintendo Switch, no charger|1|5|1||Gadget|The best day of the trip.|1
Game Boy and 40 batteries|1|5|3||Gadget|Tetris for weeks. Then never again.|20
Karaoke machine|1|5|2||Gadget|Every night’s a party. Mainly for you.|5
Polaroid camera and 50 films|1|5|2||Gadget|Photos of your adventure. Fifty of them.
Cast Away|1|4|1|h|Film|An instruction manual, basically. Bring a volleyball.|2
Jaws|1|4|1|w|Film|An all-time classic. You’ll never swim again.|3
The Shawshank Redemption|1|5|1||Film|Hope is a good thing. One viewing.|1
Paddington 2|1|5|1||Film|The nicest film ever made. Five days of joy.|5
The Lion King|1|5|1||Film|Everyone cries. Even the Adjudicator.|4
Home Alone|1|5|1|c|Film|A kid surviving alone with booby traps. Basically training.|3
Mamma Mia!|1|5|1|h|Film|Sunshine and singalongs. On repeat.|3
The Martian|1|4|1||Film|Science your way out. Very motivating.|4
E-reader with 10,000 books|1|6|4|l|Legendary|A library in your pocket. Until the battery dies.|30
Projector and 100 films|1|6|3|l|Legendary|Cinema under the stars, every night. For about a fortnight.|10
Guitar and a 1,000-song songbook|1|6|5|l|Legendary|The campfire never ends. Your voice might.
A complete art studio|1|6|4|l|Legendary|Easel, oils, 50 canvases. A whole career’s worth.
`;

function parse(block: string, category: Category): Card[] {
  return block.trim().split("\n").map((line, i) => {
    const [name, body, mind, supply, tags = "", kind = "", note = "", battery = ""] = line.split("|");
    return {
      id: `${category}-${i}`, category, name, body: +body, mind: +mind, supply: +supply, tags, kind, note, battery,
      dead: tags.includes("d"),
      legendary: tags.includes("l") || tags.includes("d"),
    };
  });
}

export const CATEGORIES: Category[] = ["PARTNER", "TOOL", "FOOD", "ANIMAL", "ENJOYMENT"];
export const CATEGORY_LABELS: Record<Category, string> = { PARTNER: "Partner", TOOL: "Survival tool", FOOD: "Food", ANIMAL: "Animal", ENJOYMENT: "Enjoyment" };

export const CARDS: Record<Category, Card[]> = {
  PARTNER: parse(PARTNER, "PARTNER"),
  TOOL: parse(TOOL, "TOOL"),
  FOOD: parse(FOOD, "FOOD"),
  ANIMAL: parse(ANIMAL, "ANIMAL"),
  ENJOYMENT: parse(ENJOYMENT, "ENJOYMENT"),
};

const BY_ID = new Map<string, Card>(Object.values(CARDS).flat().map((c) => [c.id, c]));
export const cardById = (id: string): Card => {
  const c = BY_ID.get(id);
  if (!c) throw new Error(`Unknown card ${id}`);
  return c;
};
