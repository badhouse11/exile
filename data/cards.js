// EXILE card data. Hidden scoring: "Name|BODY|MIND|SUPPLY|tags|kind"
// BODY = health/safety, MIND = morale/enjoyment, SUPPLY = how long it keeps you going. All 1-5.
// tags: c = good in the cold, h = good in the heat, w = good near water, p = perishable (spoils in heat)

export const LOCATIONS = [
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
Bear Grylls|5|2|5|ch|Survivalist
Ray Mears|5|3|5|c|Survivalist
Megan Hine|5|3|4||Survivalist
Ant Middleton|5|2|4||Survivalist
Wim Hof|4|3|2|c|Survivalist
Alex Honnold|4|2|2||Survivalist
Robert Irwin|4|4|3|h|Survivalist
David Attenborough|2|5|3|h|Nature
Monty Don|3|4|4||Nature
King Charles III|2|3|3||Nature
Hannah Fry|2|4|3||Brains
Brian Cox|2|4|2||Brains
Neil deGrasse Tyson|2|4|2||Brains
Bill Nye|2|4|3||Brains
Stephen Fry|1|5|1||Brains
Tim Peake|4|4|3|c|Brains
Chris Hadfield|4|5|3|c|Brains
Barack Obama|3|5|2||Leader
Michelle Obama|3|5|3||Leader
Donald Trump|1|3|1||Leader
Boris Johnson|2|4|1|w|Leader
Elon Musk|2|2|3||Mogul
Bill Gates|2|3|3||Mogul
Jeff Bezos|3|2|3||Mogul
Mark Zuckerberg|3|1|3||Mogul
Oprah Winfrey|2|5|3||Mogul
Richard Branson|3|4|3|w|Mogul
Martha Stewart|2|4|4||Mogul
Kim Kardashian|1|3|1|h|Mogul
Paris Hilton|1|3|1|h|Mogul
Dwayne Johnson|5|4|3|h|Muscle
Chris Hemsworth|5|4|3|h|Muscle
Jason Momoa|5|4|3|w|Muscle
Arnold Schwarzenegger|5|3|2||Muscle
Sylvester Stallone|4|3|2||Muscle
Eddie Hall|5|3|2|c|Muscle
Hugh Jackman|4|5|2||Muscle
Tom Cruise|5|2|3||Actor
Liam Neeson|4|2|3|c|Actor
Harrison Ford|4|3|3||Actor
Matt Damon|3|4|5||Actor
Leonardo DiCaprio|4|3|3|c|Actor
Tom Hanks|3|5|3|hw|Actor
Jennifer Lawrence|4|4|4||Actor
Keanu Reeves|4|5|2||Actor
Idris Elba|4|4|2||Actor
Pedro Pascal|3|5|2||Actor
Ryan Reynolds|2|5|1||Actor
Ryan Gosling|3|4|2||Actor
Zendaya|2|4|1||Actor
Margot Robbie|3|4|2|w|Actor
Meryl Streep|2|5|2||Actor
Judi Dench|1|5|1||Actor
Morgan Freeman|1|5|2||Actor
Jackie Chan|5|5|2||Actor
Danny DeVito|1|5|1||Actor
Jim Carrey|2|5|1||Actor
Kate Winslet|3|4|2|w|Actor
Benedict Cumberbatch|2|4|1||Actor
Joanna Lumley|3|5|3|hw|Actor
Taylor Swift|2|5|1||Musician
Beyoncé|3|5|1||Musician
Rihanna|2|5|1|h|Musician
Lady Gaga|2|5|1||Musician
Dua Lipa|2|4|1||Musician
Ed Sheeran|2|5|1||Musician
Harry Styles|2|5|1||Musician
Paul McCartney|2|5|2||Musician
Mick Jagger|3|4|1||Musician
Dolly Parton|3|5|3||Musician
Snoop Dogg|1|5|1|h|Musician
Willie Nelson|2|5|2||Musician
Bruce Springsteen|3|5|2||Musician
Stormzy|4|4|2||Musician
Cristiano Ronaldo|5|2|2||Athlete
Lionel Messi|4|3|1||Athlete
David Beckham|4|4|2||Athlete
LeBron James|5|4|2||Athlete
Usain Bolt|5|4|1|h|Athlete
Serena Williams|5|4|2||Athlete
Simone Biles|5|4|2||Athlete
Roger Federer|4|4|2||Athlete
Lewis Hamilton|4|3|1||Athlete
Michael Phelps|5|3|3|w|Athlete
Mo Farah|5|3|2|h|Athlete
Ross Edgley|5|3|3|w|Athlete
Mike Tyson|5|3|2||Athlete
Tyson Fury|5|4|2||Athlete
Ronda Rousey|5|3|3||Athlete
Kelly Slater|4|4|3|hw|Athlete
Gordon Ramsay|3|2|5||Cook
Jamie Oliver|3|4|5||Cook
Nigella Lawson|2|5|4||Cook
Mary Berry|1|5|4||Cook
Guy Fieri|2|5|4|h|Cook
Jeremy Clarkson|2|4|3||Comic
Bob Mortimer|2|5|3|w|Comic
Billy Connolly|3|5|2|c|Comic
Ricky Gervais|1|4|1||Comic
James Acaster|1|3|1||Comic
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
Solar torch|3|3|3|
Head torch and 40 batteries|3|3|2|
Hurricane lamp and paraffin|3|4|2|c
Four-season tent|5|3|4|c
Tarpaulin and bungees|4|2|3|
Jungle hammock with mozzie net|4|3|3|h
Minus 20 sleeping bag|5|3|4|c
Bivvy bag|4|2|3|c
Emergency foil blankets (x10)|4|1|2|c
Merino base layers|4|2|3|c
Down jacket|5|3|3|c
Wellies|3|2|3|w
Waterproof poncho|3|2|2|
Mosquito net and DEET|4|3|3|h
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
GPS (solar charging)|3|2|3|
Wind-up radio|2|4|2|
Satellite phone (one bar)|3|3|1|
Flare gun (3 flares)|3|3|1|
Signal mirror|2|1|2|h
Whistle|2|1|1|
Binoculars|2|3|2|
Telescope sight|2|2|2|
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
Gaffer and super glue|2|1|2|
Hammer and nails|3|1|3|
Cordless drill (one battery)|1|2|1|
Chainsaw (one tank)|3|2|2|
Wheelbarrow|2|1|3|
Bucket|2|1|3|
Seed planting kit and trowel|2|3|5|
Beekeeping suit|2|2|3|
Solar panel and power bank|2|4|3|h
Portable fan|1|3|1|h
Hot water bottle|2|4|1|c
Electric blanket (no plug)|1|1|1|
Umbrella|1|2|1|
Selfie stick|1|2|1|
Leaf blower|1|1|1|
Ladder|2|1|2|
Metal detector|1|4|1|
Pickaxe|3|1|3|
Bear spray|4|2|1|c
Tent pegs and mallet|2|1|2|
Sledge|3|3|3|c
Shower bag|2|4|2|h
Hiking boots|4|2|4|
`;

const FOOD = `
3 ribeye steaks|3|5|1|p
A whole roast chicken|3|5|1|p
1kg smoked salmon|3|5|1|p
A side of fresh salmon|3|5|2|p
2 weeks of chocolate bars|2|5|2|c
A wheel of Parmesan|3|5|3|
A Christmas pudding|2|5|2|
A box of 20 doughnuts|1|5|1|p
A tray of 12 Scotch eggs|3|4|1|p
A jar of Nutella|2|5|1|
A whole cheesecake|1|5|1|p
2kg of caviar|2|5|1|p
A leg of Iberico ham|3|5|3|
12 lobsters|3|5|1|pw
A tin of Quality Street|1|5|1|
A box of Krispy Kremes|1|5|1|p
A birthday cake|1|5|1|p
10 pork pies|3|4|1|p
20 sausage rolls|2|5|1|p
A crate of Guinness (24 cans)|1|5|2|c
A crate of lager (24 cans)|1|5|2|
12 bottles of Champagne|1|5|1|
A case of red wine (12)|1|5|2|c
A bottle of whisky|1|5|1|c
A keg of cider|1|5|2|
A bottle of tequila|1|4|1|h
A crate of Coca-Cola (48 cans)|1|4|2|h
40 potatoes|4|2|4|c
25kg sack of rice|4|1|5|
20kg sack of oats|4|2|5|c
50 tins of baked beans|4|3|5|
10kg dried lentils|4|1|5|
15 tins of tuna|4|2|4|
30 tins of sardines|4|2|4|
20 tins of soup|4|3|4|c
24 tins of corned beef|4|2|4|
6 tins of Spam|3|3|3|
5kg beef jerky|4|3|4|
100 energy bars|4|3|4|
30 Pot Noodles|2|4|3|
12 jars of peanut butter|4|4|4|
150 bagels|3|4|3|p
20 loaves of sourdough|3|4|2|p
200 cream crackers|3|2|4|
A crate of Ryvita|3|1|4|
A wheel of cheddar|4|4|3|
40 eggs|4|3|2|p
20 tomatoes|2|3|1|p
30 onions|3|1|3|
50 carrots|3|1|3|
A sack of 100 apples|3|3|3|
40 bananas|3|3|1|p
A crate of 50 lemons|3|2|2|
30 oranges|3|3|2|
10 coconuts|3|3|3|h
5 pineapples|2|4|1|p
A jar of honey (never goes off)|3|4|5|
1kg salt|3|1|5|
A big tub of mixed spices|1|4|4|
2kg coffee beans|1|5|3|
500 teabags|1|5|4|c
10 litres of UHT milk|3|3|3|
Powdered milk (5kg)|3|1|5|
Flour, yeast and olive oil|3|3|5|
20kg pasta and 10 jars of sauce|4|4|4|
5kg porridge oats and golden syrup|4|4|4|c
Seed kit: tomatoes, beans and squash|3|3|5|h
Potato seed sacks|3|1|5|
A bag of 1,000 sunflower seeds|3|2|4|
5kg mixed nuts|4|3|4|
3kg dried fruit|3|3|4|
50 tins of peaches|3|4|4|h
Ten boxes of cereal|2|4|3|
20 packets of Super Noodles|2|4|3|
A sack of dried beans|4|1|5|
A tub of protein powder|4|1|3|
100 vitamin tablets|4|1|4|
A vat of pickled onions|2|3|4|
24 jars of jam|2|4|4|
A big bag of marshmallows|1|5|1|c
A tub of Haribo|1|5|2|
5kg of Cheddars and Hula Hoops|1|5|2|
10 bags of crisps|1|4|1|
50 packets of instant mash|3|3|4|c
A frozen turkey (thawing)|3|4|1|p
A bucket of fried chicken|3|5|1|p
A dozen oysters|2|5|1|pw
4 pizzas (cold)|2|5|1|p
A crate of avocados|3|4|1|p
A watermelon|2|4|1|h
3kg of kimchi|3|3|4|
A tin of 100 Oxo cubes|2|3|5|c
A sack of 50 sweet potatoes|4|2|3|h
10 jars of Marmite|2|3|5|
Lard (5kg)|4|1|4|c
Pemmican (5kg)|5|1|5|c
Military ration packs (x30)|4|2|4|
A drum of olive oil|3|2|5|
A box of 40 Mars bars|2|5|2|c
A bag of 200 Yorkshire puddings|2|5|2|
`;

const ANIMAL = `
Golden retriever|2|5|1|
Border collie|3|5|2|
Husky|4|4|2|c
St Bernard|4|4|1|c
German shepherd|5|4|2|
Labrador|3|5|2|w
Dachshund|1|5|1|
French bulldog|1|5|1|
Greyhound|3|4|3|
Jack Russell|2|4|3|
Bloodhound|3|3|3|
A wolf (probably tame)|5|2|3|c
A coyote|3|1|3|h
A fox|2|3|2|
House cat|1|4|1|
Maine Coon|2|4|2|c
Lynx|3|2|3|c
Chicken|1|3|4|
A rooster and four hens|1|3|5|
Duck|1|3|3|w
Goose (guard goose)|3|2|3|
Turkey|1|2|3|
Quail (x6)|1|2|3|
Goat|2|3|4|
Sheep|2|2|3|c
Dairy cow|3|2|5|
Pig|2|3|4|
Donkey|3|3|3|h
Horse|4|4|3|
Shetland pony|3|4|2|c
Mule|4|2|3|
Camel|4|2|4|h
Llama|3|3|3|c
Alpaca|2|4|3|c
Reindeer|4|2|4|c
Yak|4|2|4|c
Water buffalo|4|2|4|hw
Ox|4|1|3|
Rabbit (x2, they multiply)|1|4|4|
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
Bat|1|2|1|
Wild boar|4|1|3|
Highland cow|4|3|4|c
Arctic fox|2|4|2|c
Shire horse|5|3|3|c
`;

const ENJOYMENT = `
Complete Works of Shakespeare|1|5|5|
The Bible|1|5|5|
War and Peace|1|4|5|
Pride and Prejudice|1|5|4|
Robinson Crusoe|1|4|4|
Moby-Dick|1|3|4|w
The Odyssey|1|4|4|
The Complete Sherlock Holmes|1|5|5|
Jane Eyre|1|4|4|
Great Expectations|1|4|4|
Frankenstein|1|4|3|
Dracula|1|4|3|
Treasure Island|1|4|3|
The Count of Monte Cristo|1|5|5|
Don Quixote|1|4|5|
Alice's Adventures in Wonderland|1|4|3|
Little Women|1|4|4|
The Art of War|2|3|3|
Grimms' Fairy Tales|1|4|4|
The Complete Works of Dickens|1|5|5|
An SAS survival handbook|4|2|4|
A field guide to edible plants|4|2|4|
A solar Kindle with 1,000 classics|1|5|5|h
A football|3|5|4|
A rugby ball|3|4|4|
A basketball and hoop|3|4|4|
Tennis rackets and 20 balls|3|4|3|
A cricket bat and ball|2|4|4|
Frisbee|2|4|4|
Boules set|1|4|4|
Kite|1|4|3|
Skipping rope|3|3|4|
Yoga mat|3|4|5|
Dumbbells|4|3|5|
A surfboard|3|5|4|hw
A skateboard|2|4|3|
Rollerskates|1|4|2|
A pogo stick|1|4|2|
Golf clubs and 50 balls|1|4|2|
Fishing magazine collection|1|3|3|w
Chess set|1|5|5|
Deck of cards|1|5|5|
Backgammon|1|5|5|
Scrabble|1|5|5|
Monopoly|1|4|4|
Dominoes|1|4|5|
Dice and a book of dice games|1|4|5|
Jenga|1|4|3|
Rubik's Cube|1|4|4|
1,000-piece jigsaw|1|4|2|
10 crossword books|1|4|4|
20 sudoku books|1|4|4|
A bucket of Lego|1|5|5|
Acoustic guitar|1|5|5|
Ukulele|1|5|4|
Harmonica|1|4|5|
Bongo drums|1|4|5|
Violin|1|4|4|
Tin whistle|1|3|5|
Accordion|1|4|4|c
Bagpipes|1|3|4|c
A trumpet|1|4|4|
Paints and 4 canvases|1|5|2|
Sketchbook and 50 pencils|1|5|4|
Journal and 20 pens|1|5|4|
Watercolour set|1|5|3|
Pottery kit|1|4|3|
Whittling knife and wood|2|4|5|
Knitting kit and 20 balls of wool|2|4|4|c
Embroidery kit|1|4|4|
Origami paper (1,000 sheets)|1|4|3|
Telescope|1|5|5|
Polaroid camera and 50 films|1|5|2|
Wind-up gramophone and 10 records|1|5|3|
A portable record player and 20 vinyls|1|5|2|
A Walkman and 30 cassettes|1|5|2|
A solar radio|1|4|4|
A Game Boy and solar charger|1|5|3|
A Nintendo Switch (no charger)|1|4|1|
A Tamagotchi|1|3|1|
A magic set|1|4|3|
Juggling balls|1|4|4|
A unicycle|1|3|3|
A karaoke machine (solar)|1|5|3|
A hot tub (inflatable, cold)|1|3|2|
A hammock for reading|2|5|4|h
A deckchair and parasol|2|4|4|h
A cosy armchair|2|5|4|c
A fluffy dressing gown|2|5|3|c
An electric blanket (solar)|2|5|2|c
A bubble machine|1|4|1|
A set of bird-watching guides|1|4|4|
A bonsai tree|1|4|4|
A box of 1,000 scented candles|1|5|3|c
A bath bomb collection|1|4|1|
A spa kit and face masks|1|4|2|
A portable DVD player, 5 hours of battery, only The Shawshank Redemption|1|3|1|
A 5,000-piece jigsaw of a clear blue sky|1|2|5|
A sudoku book someone has already finished|1|1|1|
A rubber duck|1|4|5|w
`;

function parse(block, category) {
  return block.trim().split("\n").map((line, i) => {
    const [name, body, mind, supply, tags = "", kind = ""] = line.split("|");
    return { id: `${category}-${i}`, category, name, body: +body, mind: +mind, supply: +supply, tags, kind };
  });
}

export const CATEGORIES = ["PARTNER", "TOOL", "FOOD", "ANIMAL", "ENJOYMENT"];
export const CATEGORY_LABELS = { PARTNER: "Partner", TOOL: "Survival tool", FOOD: "Food", ANIMAL: "Animal", ENJOYMENT: "Enjoyment" };

export const CARDS = {
  PARTNER: parse(PARTNER, "PARTNER"),
  TOOL: parse(TOOL, "TOOL"),
  FOOD: parse(FOOD, "FOOD"),
  ANIMAL: parse(ANIMAL, "ANIMAL"),
  ENJOYMENT: parse(ENJOYMENT, "ENJOYMENT"),
};
