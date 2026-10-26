export const PRODUCTS = Object.freeze([
  ['Happy Gut Goli', 'Food', 18, 'A spiced botanical bite for a mindful pantry.', 'Energized', 'happy-gut-goli'],
  ['Evening Unwind Herbal Tea', 'Food', 16, 'A loose leaf blend for a slower evening.', 'Rested', 'evening-unwind-tea'],
  ['Cleanergizer Water Restorer', 'Lifestyle', 39, 'A reusable object for your daily water ritual.', 'Grounded', 'cleanergizer'],
  ['Organic Super Seeds Butter', 'Food', 14, 'A richly textured spread for everyday nourishment.', 'Energized', 'super-seeds-butter'],
  ['Orange Berry Victoria Cake', 'Food', 22, 'A bright, celebratory cake for sharing.', 'Energized', 'orange-berry-cake'],
  ['Organic Raw Khandsari Sugar', 'Food', 12, 'A traditional pantry sweetener with a warm character.', 'Grounded', 'khandsari-sugar'],
  ['Protein Balls', 'Food', 15, 'Seven grain sweet bites for an easy pause.', 'Energized', 'protein-balls'],
  ['Primal Helix Tensor Clasps', 'Lifestyle', 26, 'Sculptural copper details for a personal ritual.', 'Grounded', 'tensor-clasps'],
  ['Clara Dress · Tulip Print', 'Fashion', 68, 'An expressive silhouette with a soft floral note.', 'Energized', 'clara-dress'],
  ['Blair Vest Top · Black', 'Fashion', 52, 'A versatile layer with considered lines.', 'Grounded', 'blair-vest'],
  ['Macrame Storage Baskets · Set of 3', 'Home', 42, 'Handcrafted texture to bring order to a room.', 'Grounded', 'macrame-baskets'],
  ['Organic Homemade Hair Oil', 'Lifestyle', 19, 'A botanical addition to a quiet care routine.', 'Rested', 'hair-oil'],
  ['Fenugreek Nettle Ginger Hair Pack', 'Lifestyle', 17, 'An herbal blend for your hair care ritual.', 'Rested', 'hair-pack'],
  ['Urli Soy Wax Candle', 'Home', 24, 'A warm glow for the spaces where you slow down.', 'Rested', 'urli-candle']
].map(([name, category, price, description, mood, image], index) => Object.freeze({
  id: index + 1, name, category, price, description, mood,
  image: `./assets/products/${image}.jpg`
})));
