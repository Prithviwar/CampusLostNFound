// ============================================================
// Campus Lost & Found Intelligence System
// MongoDB Seed Script
// Run: node database/mongodb/seed.js
// ============================================================

const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME   = 'campus_lnf';

const itemDetails = [
  {
    item_id: 1,
    description: 'Black laptop bag with a small PES University sticker on the front pocket.',
    visual_attributes: { color: 'black', brand: 'Wildcraft', identifying_marks: ['PES sticker', 'small tear on zipper'] },
    category_attributes: { item_type: 'laptop bag', size: 'medium', compartment_count: 3 },
    keywords: ['black', 'laptop', 'bag', 'PES', 'wildcraft'],
    image_url: null,
    search_metadata: { normalized_text: 'black laptop bag pes sticker wildcraft' },
    updated_at: new Date('2026-10-22T08:00:00Z'),
  },
  {
    item_id: 2,
    description: 'Black bag found near the library entrance, contains laptop sleeve.',
    visual_attributes: { color: 'black', brand: 'Unknown', identifying_marks: ['laptop sleeve inside'] },
    category_attributes: { item_type: 'laptop bag', size: 'medium', compartment_count: 2 },
    keywords: ['black', 'bag', 'laptop', 'library'],
    image_url: null,
    search_metadata: { normalized_text: 'black bag laptop sleeve library found' },
    updated_at: new Date('2026-10-23T09:00:00Z'),
  },
  {
    item_id: 3,
    description: 'Silver Dell laptop, 15-inch screen, sticker on back cover. Serial number on base: DL5P123.',
    visual_attributes: { color: 'silver', brand: 'Dell', identifying_marks: ['serial DL5P123', 'campus sticker'] },
    category_attributes: { item_type: 'laptop', screen_size: '15 inch', model: 'Dell Inspiron' },
    keywords: ['laptop', 'dell', 'silver', '15 inch', 'DL5P123'],
    image_url: null,
    search_metadata: { normalized_text: 'silver dell laptop 15 inch inspiron serial dl5p123' },
    updated_at: new Date('2026-10-20T10:00:00Z'),
  },
  {
    item_id: 4,
    description: 'Laptop found in Lab 301, appears to be a Dell, has a campus ID sticker.',
    visual_attributes: { color: 'silver', brand: 'Dell', identifying_marks: ['campus ID sticker'] },
    category_attributes: { item_type: 'laptop', screen_size: '15 inch', model: 'Dell Inspiron' },
    keywords: ['laptop', 'dell', 'silver', 'lab', 'found'],
    image_url: null,
    search_metadata: { normalized_text: 'dell laptop silver lab 301 found campus' },
    updated_at: new Date('2026-10-21T11:00:00Z'),
  },
  {
    item_id: 5,
    description: 'PES University student ID card, roll number 1PE22CS045.',
    visual_attributes: { color: 'white', brand: 'PES University', identifying_marks: ['roll 1PE22CS045', 'photo'] },
    category_attributes: { item_type: 'ID card', institution: 'PES University' },
    keywords: ['id', 'card', 'PES', '1PE22CS045', 'student'],
    image_url: null,
    search_metadata: { normalized_text: 'pes university id card student 1pe22cs045' },
    updated_at: new Date('2026-10-18T07:00:00Z'),
  },
  {
    item_id: 6,
    description: 'Student ID card found in cafeteria on a table.',
    visual_attributes: { color: 'white', brand: 'PES University', identifying_marks: ['lanyard attached'] },
    category_attributes: { item_type: 'ID card', institution: 'PES University' },
    keywords: ['id', 'card', 'student', 'PES', 'cafeteria'],
    image_url: null,
    search_metadata: { normalized_text: 'student id card pes university cafeteria found' },
    updated_at: new Date('2026-10-19T12:00:00Z'),
  },
  {
    item_id: 7,
    description: 'Blue Nalgene water bottle with name sticker "Sara T." under the cap.',
    visual_attributes: { color: 'blue', brand: 'Nalgene', identifying_marks: ['Sara T. sticker under cap'] },
    category_attributes: { item_type: 'water bottle', capacity: '1L' },
    keywords: ['bottle', 'water', 'blue', 'nalgene', 'sara'],
    image_url: null,
    search_metadata: { normalized_text: 'blue nalgene water bottle 1l sara sports' },
    updated_at: new Date('2026-10-15T07:00:00Z'),
  },
  {
    item_id: 8,
    description: 'Blue water bottle found at basketball court with sticker.',
    visual_attributes: { color: 'blue', brand: 'Nalgene', identifying_marks: ['name sticker'] },
    category_attributes: { item_type: 'water bottle', capacity: '1L' },
    keywords: ['bottle', 'water', 'blue', 'court', 'sports'],
    image_url: null,
    search_metadata: { normalized_text: 'blue water bottle basketball court sports found' },
    updated_at: new Date('2026-10-15T09:00:00Z'),
  },
  {
    item_id: 9,
    description: 'Slim brown leather wallet, contains SBI debit card and Rs 250 cash.',
    visual_attributes: { color: 'brown', brand: 'Unknown', identifying_marks: ['SBI debit card inside'] },
    category_attributes: { item_type: 'wallet', material: 'leather' },
    keywords: ['wallet', 'brown', 'leather', 'SBI', 'cash'],
    image_url: null,
    search_metadata: { normalized_text: 'brown leather wallet sbi debit card cash' },
    updated_at: new Date('2026-10-10T06:00:00Z'),
  },
  {
    item_id: 10,
    description: 'Thin brown wallet found in hostel common room.',
    visual_attributes: { color: 'brown', brand: 'Unknown', identifying_marks: [] },
    category_attributes: { item_type: 'wallet', material: 'leather' },
    keywords: ['wallet', 'brown', 'thin', 'hostel'],
    image_url: null,
    search_metadata: { normalized_text: 'brown wallet thin hostel common room found' },
    updated_at: new Date('2026-10-11T08:00:00Z'),
  },
  {
    item_id: 12,
    description: 'White Apple AirPods with charging case, right earbud has small scratch.',
    visual_attributes: { color: 'white', brand: 'Apple', identifying_marks: ['scratch on right earbud'] },
    category_attributes: { item_type: 'earphones', model: 'AirPods Gen 2', wireless: true },
    keywords: ['airpods', 'apple', 'white', 'earphones', 'wireless'],
    image_url: null,
    search_metadata: { normalized_text: 'apple airpods white wireless earphones gen 2' },
    updated_at: new Date('2026-09-30T10:00:00Z'),
  },
  {
    item_id: 13,
    description: 'Apple AirPods lost at auditorium during event, white case with small mark.',
    visual_attributes: { color: 'white', brand: 'Apple', identifying_marks: ['black mark on case'] },
    category_attributes: { item_type: 'earphones', model: 'AirPods Gen 2', wireless: true },
    keywords: ['airpods', 'apple', 'white', 'auditorium', 'lost'],
    image_url: null,
    search_metadata: { normalized_text: 'apple airpods white auditorium lost wireless' },
    updated_at: new Date('2026-10-01T14:00:00Z'),
  },
  {
    item_id: 14,
    description: 'Car keys with Maruti keychain found near parking lot entrance.',
    visual_attributes: { color: 'silver', brand: 'Maruti', identifying_marks: ['Maruti keychain'] },
    category_attributes: { item_type: 'car keys', key_count: 2 },
    keywords: ['keys', 'car', 'maruti', 'parking', 'silver'],
    image_url: null,
    search_metadata: { normalized_text: 'car keys maruti parking lot silver found' },
    updated_at: new Date('2026-10-05T07:00:00Z'),
  },
  {
    item_id: 15,
    description: 'Bunch of keys with a distinctive red keychain, about 4 keys.',
    visual_attributes: { color: 'red', brand: 'Unknown', identifying_marks: ['red keychain', '4 keys'] },
    category_attributes: { item_type: 'keys', key_count: 4 },
    keywords: ['keys', 'bunch', 'red', 'keychain', 'lost'],
    image_url: null,
    search_metadata: { normalized_text: 'keys bunch red keychain 4 keys lost' },
    updated_at: new Date('2026-10-06T08:00:00Z'),
  },
  {
    item_id: 16,
    description: 'Blue college backpack covered in various stickers, laptop compartment inside.',
    visual_attributes: { color: 'blue', brand: 'American Tourister', identifying_marks: ['stickers on front', 'laptop compartment'] },
    category_attributes: { item_type: 'backpack', size: 'large', compartment_count: 3 },
    keywords: ['backpack', 'blue', 'stickers', 'college', 'american tourister'],
    image_url: null,
    search_metadata: { normalized_text: 'blue backpack stickers college american tourister large' },
    updated_at: new Date('2026-10-08T08:00:00Z'),
  },
  {
    item_id: 17,
    description: 'Blue backpack found in seminar hall with stickers, appears to be a student bag.',
    visual_attributes: { color: 'blue', brand: 'Unknown', identifying_marks: ['multiple stickers'] },
    category_attributes: { item_type: 'backpack', size: 'large' },
    keywords: ['backpack', 'blue', 'seminar', 'stickers', 'found'],
    image_url: null,
    search_metadata: { normalized_text: 'blue backpack stickers seminar hall found student' },
    updated_at: new Date('2026-10-08T09:00:00Z'),
  },
  {
    item_id: 18,
    description: 'Samsung Galaxy S21, cracked screen on the right side, blue case.',
    visual_attributes: { color: 'blue', brand: 'Samsung', identifying_marks: ['cracked screen right side', 'blue case'] },
    category_attributes: { item_type: 'mobile phone', model: 'Galaxy S21', os: 'Android' },
    keywords: ['phone', 'samsung', 'galaxy', 'cracked', 'android'],
    image_url: null,
    search_metadata: { normalized_text: 'samsung galaxy s21 android phone cracked screen blue case' },
    updated_at: new Date('2026-10-12T07:00:00Z'),
  },
  {
    item_id: 19,
    description: 'Android phone found in cafeteria, Samsung brand, has a blue protective case.',
    visual_attributes: { color: 'blue', brand: 'Samsung', identifying_marks: ['blue case', 'scratched screen'] },
    category_attributes: { item_type: 'mobile phone', os: 'Android' },
    keywords: ['phone', 'android', 'samsung', 'cafeteria', 'blue'],
    image_url: null,
    search_metadata: { normalized_text: 'android samsung phone cafeteria blue case found' },
    updated_at: new Date('2026-10-12T08:00:00Z'),
  },
  {
    item_id: 20,
    description: 'Black leather wallet, contains HDFC and Axis bank cards, no cash.',
    visual_attributes: { color: 'black', brand: 'Fossil', identifying_marks: ['Fossil branding', 'HDFC card'] },
    category_attributes: { item_type: 'wallet', material: 'leather' },
    keywords: ['wallet', 'black', 'fossil', 'leather', 'HDFC'],
    image_url: null,
    search_metadata: { normalized_text: 'black fossil leather wallet hdfc axis card' },
    updated_at: new Date('2026-10-16T07:00:00Z'),
  },
];

async function seed() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db  = client.db(DB_NAME);
    const col = db.collection('item_details');

    // Drop existing collection to start fresh
    await col.drop().catch(() => {});
    console.log('Dropped existing item_details collection (if existed)');

    // Insert seed documents
    const result = await col.insertMany(itemDetails);
    console.log(`Inserted ${result.insertedCount} item_details documents`);

    // Create indexes
    await col.createIndex({ item_id: 1 }, { unique: true });
    await col.createIndex({ keywords: 1 });
    await col.createIndex({ 'visual_attributes.color': 1 });
    await col.createIndex({ 'visual_attributes.brand': 1 });
    await col.createIndex({ 'category_attributes.item_type': 1 });
    await col.createIndex(
      { 'search_metadata.normalized_text': 'text' },
      { name: 'idx_fulltext_search' }
    );
    console.log('Created all MongoDB indexes');

    // -------------------------------------------------------
    // Demo Aggregation 1: Category type distribution
    // -------------------------------------------------------
    console.log('\n--- Aggregation 1: Items by category_attributes.item_type ---');
    const byType = await col.aggregate([
      { $group: { _id: '$category_attributes.item_type', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]).toArray();
    console.table(byType);

    // -------------------------------------------------------
    // Demo Aggregation 2: Top 10 keywords
    // -------------------------------------------------------
    console.log('\n--- Aggregation 2: Top 10 keywords ---');
    const topKeywords = await col.aggregate([
      { $unwind: '$keywords' },
      { $group: { _id: '$keywords', frequency: { $sum: 1 } } },
      { $sort: { frequency: -1 } },
      { $limit: 10 },
    ]).toArray();
    console.table(topKeywords);

    // -------------------------------------------------------
    // Demo Aggregation 3: Color distribution
    // -------------------------------------------------------
    console.log('\n--- Aggregation 3: Color distribution ---');
    const byColor = await col.aggregate([
      { $group: { _id: '$visual_attributes.color', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).toArray();
    console.table(byColor);

    console.log('\nMongoDB seeding complete!');
  } finally {
    await client.close();
  }
}

seed().catch(console.error);
