// EXILE card data. Hidden scoring line format:
// "Name|BODY|MIND|SUPPLY|tags|kind|note|battery"
// BODY = health/safety, MIND = morale/enjoyment, SUPPLY = how long it keeps you going. All 1-5.
// tags: c = good in the cold, h = good in the heat, w = good near water, p = perishable (spoils in heat), d = back from the dead
// kind = small category label; note = one-line subheading; battery = days of power, or "solar"

export type Category = "PARTNER" | "TOOL" | "FOOD" | "ANIMAL" | "ENJOYMENT";
export type Temp = "FREEZING" | "MILD" | "SCORCHING";
export interface Location { name: string; temp: Temp; water: boolean }
export interface Card {
  id: string; category: Category; name: string;
  body: number; mind: number; supply: number; tags: string;
  kind: string; note: string; battery: string; dead: boolean;
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
Bear Grylls|5|2|5|ch|Survivalist|Ex-SAS. Will drink anything
Ray Mears|5|3|5|c|Survivalist|Bushcraft legend. Fire from nothing
Megan Hine|5|3|4||Survivalist|The guide who keeps Bear Grylls alive
Ant Middleton|5|2|4||Survivalist|Ex-special forces. Shouts a lot
Wim Hof|4|3|2|c|Survivalist|The Iceman. Sits in ice for fun
Alex Honnold|4|2|2||Survivalist|Climbed El Capitan with no ropes
Robert Irwin|4|4|3|h|Survivalist|Steve's son. Croc wrangler
David Attenborough|2|5|3|h|Nature|Knows every living creature by name
Monty Don|3|4|4||Nature|Gardeners' World. Grows anything
King Charles III|2|3|3||Nature|The King. Talks to his plants
Michael Palin|3|5|3|h|Nature|Python turned round-the-world traveller
Hannah Fry|2|4|3||Brains|Mathematician. Will calculate your odds
Brian Cox|2|4|2||Brains|Physicist. Navigates by the stars
Stephen Fry|1|5|1||Brains|Knows everything except how to fish
Chris Hadfield|4|5|3|c|Brains|Astronaut. Sang Bowie in space
Barack Obama|3|5|2||Leader|44th US President
Michelle Obama|3|5|3||Leader|Former First Lady
Donald Trump|1|3|1||Leader|45th and 47th US President
Boris Johnson|2|4|1|w|Leader|Former UK Prime Minister
Elon Musk|2|2|3||Mogul|Tesla, SpaceX and X
Bill Gates|2|3|3||Mogul|Microsoft founder. Thinks in spreadsheets
Jeff Bezos|3|2|3||Mogul|Amazon founder. Owns a rocket
Oprah Winfrey|2|5|3||Mogul|Talk show queen. You get a coconut!
Richard Branson|3|4|3|w|Mogul|Virgin founder. Owns his own island
Martha Stewart|2|4|4||Mogul|Lifestyle mogul. Centrepieces from twigs
Dwayne Johnson|5|4|3|h|Muscle|Ex-wrestler. Hollywood's biggest man
Chris Hemsworth|5|4|3|h|Muscle|Thor. Unreasonably fit
Jason Momoa|5|4|3|w|Muscle|Aquaman. Good with water
Arnold Schwarzenegger|5|3|2||Muscle|The Terminator. He'll be back
Sylvester Stallone|4|3|2||Muscle|Rocky and Rambo
Hugh Jackman|4|5|2||Muscle|Wolverine. Also sings
Tom Cruise|5|2|3||Actor|Does every stunt himself
Liam Neeson|4|2|3|c|Actor|Has a particular set of skills
Harrison Ford|4|3|3||Actor|Indiana Jones. A real-life pilot
Matt Damon|3|4|5||Actor|Grew potatoes on Mars in The Martian
Leonardo DiCaprio|4|3|3|c|Actor|Survived The Revenant
Tom Hanks|3|5|3|hw|Actor|Survived Cast Away with a volleyball
Jennifer Lawrence|4|4|4||Actor|Hunger Games archer
Keanu Reeves|4|5|2||Actor|John Wick. Nicest man alive
Ryan Reynolds|2|5|1||Actor|Deadpool. Never stops talking
Meryl Streep|2|5|2||Actor|Can play any role, including survivor
Judi Dench|1|5|1||Actor|M in James Bond
Morgan Freeman|1|5|2||Actor|Has played God twice
Jackie Chan|5|5|2||Actor|Martial artist. Fights with ladders
Danny DeVito|1|5|1||Actor|Will happily eat from a bin
Joanna Lumley|3|5|3|hw|Actor|Absolutely Fabulous. Did a desert island for TV
Taylor Swift|2|5|1||Musician|Biggest pop star on earth
Beyoncé|3|5|1||Musician|Queen Bey
Rihanna|2|5|1|h|Musician|Pop star and beauty mogul
Lady Gaga|2|5|1||Musician|Once wore a meat dress
Ed Sheeran|2|5|1||Musician|Never puts the guitar down
Harry Styles|2|5|1||Musician|Ex-One Direction
Paul McCartney|2|5|2||Musician|The Beatles
Mick Jagger|3|4|1||Musician|The Rolling Stones. Indestructible
Dolly Parton|3|5|3||Musician|Country legend. Endlessly kind
Snoop Dogg|1|5|1|h|Musician|Rapper. Very, very relaxed
Cristiano Ronaldo|5|2|2||Athlete|Footballer. Mostly abs
Lionel Messi|4|3|1||Athlete|Footballer. Quietly the GOAT
David Beckham|4|4|2||Athlete|Footballer turned style icon
LeBron James|5|4|2||Athlete|Basketball legend
Usain Bolt|5|4|1|h|Athlete|Fastest man ever
Serena Williams|5|4|2||Athlete|23 Grand Slams
Simone Biles|5|4|2||Athlete|Greatest gymnast of all time
Michael Phelps|5|3|3|w|Athlete|Most decorated Olympian ever
Mike Tyson|5|3|2||Athlete|Boxing legend. Keeps pigeons
Gordon Ramsay|3|2|5||Cook|Will shout at the fish
Jamie Oliver|3|4|5||Cook|Pukka with any ingredient
Nigella Lawson|2|5|4||Cook|Midnight feasts from nothing
Mary Berry|1|5|4||Cook|Bake Off queen
Bob Mortimer|2|5|3|w|Comedian|Would I Lie To You? Gone Fishing
Billy Connolly|3|5|2|c|Comedian|The Big Yin. Great storyteller
Ricky Gervais|1|4|1||Comedian|The Office. Will mock your shelter
James Acaster|1|3|1||Comedian|Stand-up. Very existential
Jeremy Clarkson|2|4|3||Comedian|Top Gear, now a farmer
Rowan Atkinson|2|5|2||Comedian|Mr Bean
Peter Kay|2|5|2||Comedian|Bolton's finest. Garlic bread?
Sarah Millican|2|5|3|c|Comedian|Stand-up. Brings snacks
Lee Mack|2|5|2||Comedian|Not Going Out. Quickest wit in Britain
Greg Davies|3|5|2||Comedian|Taskmaster. Very tall
Kevin Hart|3|5|2||Comedian|Tiny, loud and very fit
Eddie Murphy|2|5|2||Comedian|Beverly Hills Cop. Voice of Donkey
Dawn French|2|5|3||Comedian|The Vicar of Dibley
Ant and Dec|2|5|2||Comedian|Two for the price of one
Ernest Shackleton|5|4|5|cd|Legend|1874–1922. Polar explorer who got his whole crew home
Edmund Hillary|5|3|4|cd|Legend|1919–2008. First to the top of Everest
Napoleon Bonaparte|3|3|3|d|Legend|1769–1821. Emperor. Exiled twice, so has form
Charles Darwin|3|4|3|hd|Legend|1809–1882. Studied island life up close
Albert Einstein|1|4|2|d|Legend|1879–1955. Genius. Hair suggests no comb
Marie Curie|2|4|2|d|Legend|1867–1934. Double Nobel winner
Leonardo da Vinci|3|5|4|d|Legend|1452–1519. Invented the helicopter on paper
Steve Irwin|5|5|4|hd|Legend|1962–2006. The Crocodile Hunter
Amelia Earhart|4|4|2|d|Legend|1897–1937. Pioneering pilot. Vanished over the Pacific
Harry Houdini|4|4|2|d|Legend|1874–1926. Can escape anything
Jacques Cousteau|4|4|4|wd|Legend|1910–1997. Ocean explorer
Freddie Mercury|1|5|1|d|Legend|1946–1991. Queen frontman
Elvis Presley|2|5|1|d|Legend|1935–1977. The King of Rock and Roll
Muhammad Ali|5|5|2|d|Legend|1942–2016. The Greatest
Bob Marley|2|5|2|hd|Legend|1945–1981. Every little thing will be alright
Jane Goodall|3|5|3|hd|Legend|1934–2025. Lived among chimpanzees
Cleopatra|2|4|2|hd|Legend|69–30 BC. Last pharaoh of Egypt
`;

const TOOL = `
Bow and arrow set|4|3|5|
Crossbow and 20 bolts|4|2|4|
Slingshot and pouch of stones|3|3|3|
Spear gun|3|3|5|w
Fishing rod and tackle box|2|4|5|w
Fishing net|2|2|5|w
Lobster pots (x3)|2|2|4|w
Rabbit snare wire|2|1|4|
Machete|4|2|4|h
Woodsman's axe|4|2|4|c
Swiss Army knife|4|2|3|
Hunting knife and whetstone|4|2|4|
Ice axe|4|1|2|c
Folding shovel|3|1|3|
Hand saw|3|1|3|
Multitool|3|2|3|
Flint and steel|5|3|3|c
Box of 200 matches|5|3|2|c
Magnifying glass|3|2|2|h
Bow drill fire kit|4|2|3|
Storm lighter (refillable)|5|3|3|c
Solar torch|3|3|3||||solar
Head torch and 40 batteries|3|3|2||||20
Hurricane lamp and paraffin|3|4|2|c
Four-season tent|5|3|4|c
Tarpaulin and bungees|4|2|3|
Jungle hammock with mosquito net|4|3|3|h
Minus 20 sleeping bag|5|3|4|c
Bivvy bag|4|2|3|c
Emergency foil blankets (x10)|4|1|2|c
Merino base layers|4|2|3|c
Down jacket|5|3|3|c
Wellies|3|2|3|w
Waterproof poncho|3|2|2|
Insect repellent (20 bottles)|4|3|3|h
Sunhat and factor 50|3|2|2|h
Sunglasses (polarised)|2|2|2|h
Snow goggles|3|1|2|c
Snowshoes|4|1|3|c
Crampons|4|1|2|c
Cross-country skis|4|3|3|c
Inflatable kayak and paddle|3|4|4|w
Small rowing boat|4|3|4|w
Life jacket|4|1|2|w
Snorkel, mask and fins|2|4|4|w
50m climbing rope|4|1|3|
Carabiners and harness|3|1|2|
Water filter straw|5|1|4|
Gravity water filter|5|1|5|
Water purification tablets (x200)|5|1|4|
Solar still kit|4|1|4|h
Two 20-litre jerrycans|4|1|4|h
Cast-iron pot|3|3|4|
Camping stove and gas|3|4|3|c
Kettle|2|4|2|
Frying pan|2|3|3|
Dutch oven|3|4|4|
Compass and map|3|2|3|
GPS|3|2|3||||solar
Wind-up radio|2|4|2|
Satellite phone (one bar)|3|3|1||||2
Flare gun (3 flares)|3|3|1|
Signal mirror|2|1|2|h
Whistle|2|1|1|
Binoculars|2|3|2|
Night-vision goggles|3|2|2||||5
First aid kit|5|2|3|
Snake bite kit|4|1|2|h
Suture kit and painkillers|5|2|3|
Toothbrush and 10 tubes of toothpaste|3|3|3|
Bar of soap (x20)|3|3|3|
Toilet roll (x48)|2|5|3|
Sewing kit|2|2|3|
Ten rolls of duct tape|3|2|3|
Paracord (100m)|3|1|4|
Bin bags (x100)|3|1|3|
Zip ties (x500)|2|1|3|
Super glue (x20)|2|1|2|
Hammer and nails|3|1|3|
Cordless drill|1|2|1||||1
Chainsaw (one tank)|3|2|2|
Wheelbarrow|2|1|3|
Bucket|2|1|3|
Seed planting kit and trowel|2|3|5|
Beekeeping suit|2|2|3|
Solar panel and power bank|2|4|3|h|||solar
Portable fan|1|3|1|h|||3
Hot water bottle|2|4|1|c
Umbrella|1|2|1|
Ladder|2|1|2|
Metal detector|1|4|1||||4
Pickaxe|3|1|3|
Bear spray|4|2|1|c
Tent pegs and mallet|2|1|2|
Sledge|3|3|3|c
Shower bag|2|4|2|h
Hiking boots|4|2|4|
Rain-catcher and water butt|4|1|5|
Sharpened spade|3|1|3|
Fishing hooks and line (500)|2|2|5|w
`;

const FOOD = `
3 ribeye steaks|3|5|1|p|Luxury
A whole roast chicken|3|5|1|p|Luxury
1kg smoked salmon|3|5|1|p|Luxury
A side of fresh salmon|3|5|2|p|Luxury
2 weeks of chocolate bars|2|5|2|c|Luxury
A wheel of Parmesan|3|5|3||Luxury
A Christmas pudding|2|5|2||Luxury
A box of 20 doughnuts|1|5|1|p|Luxury
A tray of 12 Scotch eggs|3|4|1|p|Luxury
A jar of Nutella|2|5|1||Luxury
A whole cheesecake|1|5|1|p|Luxury
2kg of caviar|2|5|1|p|Luxury
A leg of Iberico ham|3|5|3||Luxury
12 lobsters|3|5|1|pw|Luxury
10 pork pies|3|4|1|p|Luxury
20 sausage rolls|2|5|1|p|Luxury
A bucket of fried chicken|3|5|1|p|Luxury
A dozen oysters|2|5|1|pw|Luxury
A box of 40 Mars bars|2|5|2|c|Luxury
200 Yorkshire puddings|2|5|2||Luxury
A crate of Guinness (24 cans)|1|5|2|c|Drink
A crate of lager (24 cans)|1|5|2||Drink
12 bottles of Champagne|1|5|1||Drink
A case of red wine (12)|1|5|2|c|Drink
A bottle of whisky|1|5|1|c|Drink
A keg of cider|1|5|2||Drink
A bottle of tequila|1|4|1|h|Drink
A crate of Coca-Cola (48 cans)|1|4|2|h|Drink
2kg coffee beans|1|5|3||Drink
500 teabags|1|5|4|c|Drink
40 potatoes|4|2|4|c|Staple
25kg sack of rice|4|1|5||Staple
20kg sack of oats|4|2|5|c|Staple
50 tins of baked beans|4|3|5||Staple
10kg dried lentils|4|1|5||Staple
15 tins of tuna|4|2|4||Staple
30 tins of sardines|4|2|4||Staple
20 tins of soup|4|3|4|c|Staple
24 tins of corned beef|4|2|4||Staple
5kg beef jerky|4|3|4||Staple
100 energy bars|4|3|4||Staple
30 Pot Noodles|2|4|3||Staple
12 jars of peanut butter|4|4|4||Staple
150 bagels|3|4|3|p|Staple
200 cream crackers|3|2|4||Staple
A wheel of cheddar|4|4|3||Staple
40 eggs|4|3|2|p|Staple
A sack of 100 apples|3|3|3||Staple
40 bananas|3|3|1|p|Staple
30 oranges|3|3|2||Staple
10 coconuts|3|3|3|h|Staple
10 litres of UHT milk|3|3|3||Staple
20kg pasta and 10 jars of sauce|4|4|4||Staple
5kg mixed nuts|4|3|4||Staple
3kg dried fruit|3|3|4||Staple
50 tins of peaches|3|4|4|h|Staple
A sack of dried beans|4|1|5||Staple
100 vitamin tablets|4|1|4||Staple
24 jars of jam|2|4|4||Staple
A tub of Haribo|1|5|2||Staple
50 packets of instant mash|3|3|4|c|Staple
3kg of kimchi|3|3|4||Staple
10 jars of Marmite|2|3|5||Staple
Pemmican (5kg)|5|1|5|c|Staple
Military ration packs (x30)|4|2|4||Staple
A jar of honey (never goes off)|3|4|5||Staple
1kg salt|3|1|5||Staple
A big tub of mixed spices|1|4|4||Staple
A drum of olive oil|3|2|5||Staple
A tin of 100 Oxo cubes|2|3|5|c|Staple
Seed potatoes (a sack to plant)|3|1|5||Grow
Vegetable seed vault (40 varieties)|3|3|5||Grow
Tomato, bean and squash seeds|3|3|5|h|Grow
A bag of 1,000 sunflower seeds|3|2|4|h|Grow
Fruit tree saplings (apple and pear)|2|3|5||Grow
Strawberry plants (x20)|2|4|4||Grow
50 garlic bulbs to plant|3|2|4||Grow
A herb garden in a box|2|4|4||Grow
Mushroom growing kit|3|3|4|w|Grow
Chilli plants (x6)|1|4|4|h|Grow
Sweetcorn seeds|3|2|5|h|Grow
Rice paddy seed|3|1|5|hw|Grow
A tea plant|1|4|4||Grow
A coffee plant|1|4|4|h|Grow
Lemon tree in a pot|2|3|4|h|Grow
Sourdough starter and 50kg flour|4|4|5||Make
Flour, yeast and olive oil|3|3|5||Make
Home-brew kit with hops|1|5|4||Make
Cheese-making kit|3|3|4||Make
Yoghurt culture|3|2|4||Make
Smoking and curing kit|3|2|5|c|Make
Pickling kit and 10 litres of vinegar|2|2|5||Make
Fermenting crock and 20 cabbages|3|2|5||Make
A wormery for fishing bait|1|1|4|w|Make
Bean sprouting jars and 5kg beans|3|1|5||Make
Powdered milk (5kg)|3|1|5||Staple
A frozen turkey (thawing)|3|4|1|p|Luxury
A box of 50 sachets of hot chocolate|1|5|2|c|Drink
A bag of 50 pickled onions|2|3|4||Staple
Lard (5kg)|4|1|4|c|Staple
`;

const ANIMAL = `
A dog|3|5|2|
Two dogs|4|5|3|
Three dogs|4|5|3|c
A wolf (probably tame)|5|2|3|c
A coyote|3|1|3|h
A fox|2|3|2|
House cat|1|4|1|
Lynx|3|2|3|c
Chicken|1|3|4|
A rooster and four hens|1|3|5|
Duck|1|3|3|w
Goose (guard goose)|3|2|3|
Turkey|1|2|3|
Quail (x6)|1|2|3|
Goat|2|3|4|
Mountain goat|3|2|4|c
Sheep|2|2|3|c
Dairy cow|3|2|5|
Highland cow|4|3|4|c
Pig|2|3|4|
Donkey|3|3|3|h
Horse|4|4|3|
Shire horse|5|3|3|c
Shetland pony|3|4|2|c
Mule|4|2|3|
Camel|4|2|4|h
Llama|3|3|3|c
Alpaca|2|4|3|c
Reindeer|4|2|4|c
Yak|4|2|4|c
Moose|4|1|3|c
Bison|5|1|4|c
Water buffalo|4|2|4|hw
Ox|4|1|3|
Rabbits (x2, they multiply)|1|4|4|
Guinea pig|1|4|1|
Hamster|1|3|1|
Ferret|2|3|3|
Hedgehog|1|4|1|
Tortoise|1|3|1|h
Falcon|3|3|4|
Golden eagle|4|3|4|c
Barn owl|2|4|2|
Parrot (talks)|1|5|1|h
Crow (very clever)|2|4|2|
Carrier pigeon|3|3|1|
Raven|2|4|2|c
Pelican|2|3|3|w
Penguin|1|5|1|cw
Beehive|2|3|4|
Silkworms|1|2|1|
Ant farm|1|3|1|
Tarantula|1|2|1|h
Snake (non-venomous)|2|1|2|h
Komodo dragon|4|1|2|h
Monitor lizard|3|1|2|h
Armadillo|2|3|2|h
Otter|2|5|3|w
Beaver|3|3|3|w
Seal|2|4|2|cw
Sea lion|3|4|3|w
Dolphin (lives offshore)|3|5|3|w
Goldfish|1|3|1|
Koi carp|1|3|1|w
Crab|1|2|1|w
Octopus|2|4|2|w
Capybara|2|5|2|hw
Sloth|1|4|1|h
Lemur|1|5|1|h
Chimpanzee|3|4|3|h
Orangutan|4|5|3|h
Gorilla|5|3|3|h
Meerkat|2|4|2|h
Mongoose|3|3|2|h
Raccoon|2|4|3|
Squirrel|1|4|2|
Badger|3|2|2|
Polar bear (cub)|4|3|2|c
Grizzly bear|5|1|3|c
Panda|2|5|1|
Lion|5|2|3|h
Tiger|5|2|3|h
Cheetah|4|3|3|h
Giraffe|3|4|2|h
Zebra|3|3|2|h
Kangaroo|4|3|2|h
Koala|1|5|1|h
Elephant|5|4|3|h
Rhino|5|2|2|h
Hippo|5|1|2|hw
Ostrich|3|2|3|h
Emu|3|2|3|h
Peacock|1|4|2|
Flamingo|1|4|1|w
Swan|2|3|2|w
Albatross|2|4|2|w
Seagull|1|1|2|w
Wild boar|4|1|3|
Arctic fox|2|4|2|c
Puffin|1|5|1|cw
`;

const ENJOYMENT = `
Complete Works of Shakespeare|1|5|5||Book
The Bible|1|5|5||Book
War and Peace|1|4|5||Book
Pride and Prejudice|1|5|4||Book
Robinson Crusoe|1|4|4||Book
Moby-Dick|1|3|4|w|Book
The Odyssey|1|4|4||Book
The Complete Sherlock Holmes|1|5|5||Book
Jane Eyre|1|4|4||Book
Great Expectations|1|4|4||Book
Frankenstein|1|4|3||Book
Dracula|1|4|3||Book
Treasure Island|1|4|3||Book
The Count of Monte Cristo|1|5|5||Book
Don Quixote|1|4|5||Book
Little Women|1|4|4||Book
The Art of War|2|3|3||Book
Grimms' Fairy Tales|1|4|4||Book
The Complete Works of Dickens|1|5|5||Book
An SAS survival handbook|4|2|4||Book
A field guide to edible plants|4|2|4||Book
Kindle with 1,000 classics|1|5|5|h|Gadget||solar
A football|3|5|4||Sport
A rugby ball|3|4|4||Sport
Basketball and hoop|3|4|4||Sport
Tennis rackets and 20 balls|3|4|3||Sport
Cricket bat and ball|2|4|4||Sport
Frisbee|2|4|4||Sport
Boules set|1|4|4||Sport
Kite|1|4|3||Sport
Yoga mat|3|4|5||Sport
Dumbbells|4|3|5||Sport
Surfboard|3|5|4|hw|Sport
Golf clubs and 50 balls|1|4|2||Sport
Chess set|1|5|5||Game
Deck of cards|1|5|5||Game
Backgammon|1|5|5||Game
Scrabble|1|5|5||Game
Monopoly|1|4|4||Game
Dominoes|1|4|5||Game
Jenga|1|4|3||Game
Rubik's Cube|1|4|4||Game
1,000-piece jigsaw|1|4|2||Game
10 crossword books|1|4|4||Game
20 sudoku books|1|4|4||Game
A bucket of Lego|1|5|5||Game
Acoustic guitar|1|5|5||Music
Ukulele|1|5|4||Music
Harmonica|1|4|5||Music
Bongo drums|1|4|5||Music
Violin|1|4|4||Music
Accordion|1|4|4|c|Music
A trumpet|1|4|4||Music
Walkman and 30 mixtapes|1|5|2||Music||6
Record player and 20 vinyls|1|5|2||Music||4
Karaoke machine|1|5|3||Music||solar
Paints and 4 canvases|1|5|2||Make
Sketchbook and 50 pencils|1|5|4||Make
Journal and 20 pens|1|5|4||Make
Watercolour set|1|5|3||Make
Pottery kit|1|4|3||Make
Whittling knife and wood|2|4|5||Make
Knitting kit and 20 balls of wool|2|4|4|c|Make
Origami paper (1,000 sheets)|1|4|3||Make
Telescope|1|5|5||Make
Polaroid camera and 50 films|1|5|2||Make
Bird-watching guides and binoculars|1|4|4||Make
A bonsai tree|1|4|4||Make
Game Boy and 10 games|1|5|3||Gadget||solar
Nintendo Switch (no charger)|1|5|1||Gadget||1
Solar radio|1|4|4||Gadget||solar
Jaws|1|4|1|w|Film|DVD player|3
Cast Away|1|3|1|h|Film|DVD player|2
The Godfather|1|5|1||Film|DVD player|4
Paddington 2|1|5|1||Film|DVD player|5
Mamma Mia!|1|5|1|h|Film|DVD player|3
Star Wars|1|5|1||Film|DVD player|2
Titanic|1|4|1|c|Film|DVD player|6
Toy Story|1|5|1||Film|DVD player|4
Jurassic Park|1|5|1||Film|DVD player|3
The Lion King|1|5|1||Film|DVD player|5
Home Alone|1|5|1|c|Film|DVD player|2
Die Hard|1|4|1||Film|DVD player|3
Back to the Future|1|5|1||Film|DVD player|4
Forrest Gump|1|5|1||Film|DVD player|7
Love Actually|1|4|1|c|Film|DVD player|2
Shrek|1|5|1||Film|DVD player|5
Finding Nemo|1|5|1|w|Film|DVD player|3
The Martian|1|4|1||Film|DVD player|4
Gladiator|1|4|1||Film|DVD player|2
Top Gun|1|4|1||Film|DVD player|3
The Shawshank Redemption|1|5|1||Film|DVD player|1
Dirty Dancing|1|4|1||Film|DVD player|6
The Sound of Music|1|5|1|c|Film|DVD player|5
E.T.|1|5|1||Film|DVD player|3
Rocky|1|4|1||Film|DVD player|4
The Princess Bride|1|5|1||Film|DVD player|2
Ghostbusters|1|4|1||Film|DVD player|3
Bridget Jones's Diary|1|5|1||Film|DVD player|3
5,000-piece jigsaw of a clear blue sky|1|2|5||Game
`;

function parse(block: string, category: Category): Card[] {
  return block.trim().split("\n").map((line, i) => {
    const [name, body, mind, supply, tags = "", kind = "", note = "", battery = ""] = line.split("|");
    return { id: `${category}-${i}`, category, name, body: +body, mind: +mind, supply: +supply, tags, kind, note, battery, dead: tags.includes("d") };
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
