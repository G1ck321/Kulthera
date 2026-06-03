# Exhibit Seed Data Template for Kultr MVP

**Document Purpose**: JSON schema and examples for backend data seeding  
**Target Audience**: Backend engineers, database admins  
**Date**: May 29, 2026

---

## 📋 Overview

This document provides:
1. Complete database schema (Creator, Exhibit, Room, Analytics)
2. 10 exhibit examples ready for SQL insertion
3. 5 creator profiles (including Kokari Walker flagship)
4. 3 room definitions
5. Web Monetization wallet pointer format

**Key Principle**: All data is JSON-serializable and PostgreSQL-compatible.

---

## 🏛️ Database Schema

### **Rooms Table** (Container for exhibits)

```sql
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Creators Table** (Musicians, artists, storytellers)

```sql
CREATE TABLE creators (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    profile_image_url VARCHAR(500),
    country VARCHAR(100),
    cultural_heritage VARCHAR(255),
    payment_pointer VARCHAR(500) NOT NULL,  -- Interledger format
    is_featured BOOLEAN DEFAULT FALSE,
    social_links JSONB,  -- {twitter, instagram, website}
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Exhibits Table** (Individual artworks, music, stories)

```sql
CREATE TABLE exhibits (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    exhibit_type VARCHAR(50),  -- 'music', 'painting', 'artifact', 'story'
    image_url VARCHAR(500),
    media_url VARCHAR(500),  -- For audio/video
    room_id INT NOT NULL REFERENCES rooms(id),
    creator_id INT NOT NULL REFERENCES creators(id),
    cultural_context TEXT,
    location_origin VARCHAR(255),  -- "Ghana", "Mali", etc.
    year_created VARCHAR(20),
    medium VARCHAR(255),  -- "Kora", "Oil on Canvas", etc.
    duration_seconds INT,  -- For audio
    popularity_score INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Analytics Table** (View tracking)

```sql
CREATE TABLE analytics (
    id SERIAL PRIMARY KEY,
    session_id UUID NOT NULL,
    exhibit_id INT NOT NULL REFERENCES exhibits(id),
    user_id INT REFERENCES users(id),  -- NULL for anonymous
    view_duration_seconds INT,
    monetization_activated BOOLEAN,
    micropayment_amount DECIMAL(10, 8),  -- In XRP/USD
    heartbeat_count INT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎵 Room Definitions

### **Room 1: Sound Roots** (Music & Audio Heritage)

```json
{
  "id": 1,
  "name": "Sound Roots",
  "description": "Celebrate the living heritage of African music. From the ancient kora to contemporary rhythms, discover the soul of Africa through sound.",
  "image_url": "/images/rooms/soundroots-header.jpg",
  "order_index": 1,
  "cultural_focus": "Music, instruments, oral traditions"
}
```

### **Room 2: Art Gallery** (Visual & Textile Arts)

```json
{
  "id": 2,
  "name": "Art Gallery",
  "description": "Explore the vibrant visual traditions of Africa. From royal textiles to contemporary sculpture, witness the creativity that shapes African identity.",
  "image_url": "/images/rooms/gallery-header.jpg",
  "order_index": 2,
  "cultural_focus": "Painting, sculpture, textiles, artifacts"
}
```

### **Room 3: Stories** (Phase 2 - Not in MVP)

```json
{
  "id": 3,
  "name": "Stories",
  "description": "Listen to the narratives that bind communities. Griots, historians, and storytellers share the wisdom of generations.",
  "image_url": "/images/rooms/stories-header.jpg",
  "order_index": 3,
  "cultural_focus": "Oral history, narratives, traditions"
}
```

---

## 👥 Creator Profiles

### **Featured Creator: Kokari Walker** ⭐ (PRIMARY EXHIBIT)

```json
{
  "id": 1,
  "name": "Kokari Walker",
  "bio": "Kokari Walker is a legendary kora virtuoso from Mali, carrying on a 500-year tradition of griot musicianship. His compositions blend ancient Mandinka melodies with contemporary production, creating a bridge between heritage and modernity. Kokari has performed at world music festivals across 6 continents and is recognized as a Living Cultural Treasure.",
  "profile_image_url": "/images/creators/kokari-walker.jpg",
  "country": "Mali",
  "cultural_heritage": "Mandinka griot tradition",
  "payment_pointer": "$ilp.uphold.com/9h8G7K5m2X",
  "is_featured": true,
  "social_links": {
    "website": "https://kokariwalkerkora.com",
    "instagram": "@kokari_walker_kora",
    "twitter": "@KokariWalker"
  }
}
```

### **Creator 2: Ama Yeboah** (Textile Artist)

```json
{
  "id": 2,
  "name": "Ama Yeboah",
  "bio": "Ama Yeboah is a master weaver from Ashanti region, Ghana, specializing in Kente cloth. With 20+ years of experience, she preserves traditional weaving techniques while collaborating with contemporary designers. Her work is featured in museums across Africa and Europe.",
  "profile_image_url": "/images/creators/ama-yeboah.jpg",
  "country": "Ghana",
  "cultural_heritage": "Ashanti textile traditions",
  "payment_pointer": "$ilp.uphold.com/7f5h3K9n1Y",
  "is_featured": false,
  "social_links": {
    "instagram": "@amayeboahkente",
    "website": "https://amakente.com"
  }
}
```

### **Creator 3: Jabari Sow** (Drummer & Percussionist)

```json
{
  "id": 3,
  "name": "Jabari Sow",
  "bio": "Jabari Sow is a world-renowned percussionist from Senegal, master of the djembe, talking drum, and balafon. He has recorded 5 albums and performed with UNESCO-recognized ensembles. Jabari teaches at the Dakar Music Academy and leads community rhythm workshops.",
  "profile_image_url": "/images/creators/jabari-sow.jpg",
  "country": "Senegal",
  "cultural_heritage": "Wolof & Fulani percussion traditions",
  "payment_pointer": "$ilp.uphold.com/6c4j2L8p0T",
  "is_featured": false,
  "social_links": {
    "instagram": "@jabarisowdrums",
    "twitter": "@JabariDrums"
  }
}
```

### **Creator 4: Zara Okonkwo** (Contemporary Painter)

```json
{
  "id": 4,
  "name": "Zara Okonkwo",
  "bio": "Zara Okonkwo is a Lagos-based contemporary painter exploring themes of identity, migration, and African diaspora. Her abstract works blend traditional Yoruba visual language with modern expressionism. Featured in Zeitz MOCAA and Documenta galleries.",
  "profile_image_url": "/images/creators/zara-okonkwo.jpg",
  "country": "Nigeria",
  "cultural_heritage": "Yoruba visual traditions",
  "payment_pointer": "$ilp.uphold.com/8d5k3M9q1U",
  "is_featured": false,
  "social_links": {
    "instagram": "@zaraokonkwo",
    "website": "https://zaraokonkwo.art"
  }
}
```

### **Creator 5: Amani Kumbi** (Storyteller & Historian)

```json
{
  "id": 5,
  "name": "Amani Kumbi",
  "bio": "Amani Kumbi is a griot and oral historian from Mauritania, preserving ancient Fulani genealogies and epic stories. He is a UNESCO Intangible Cultural Heritage Fellow and leads the Pan-African Griot Network. Amani has documented over 200 hours of oral traditions.",
  "profile_image_url": "/images/creators/amani-kumbi.jpg",
  "country": "Mauritania",
  "cultural_heritage": "Fulani griot oral tradition",
  "payment_pointer": "$ilp.uphold.com/9e6l4N0r2V",
  "is_featured": false,
  "social_links": {
    "website": "https://amanikumbigriot.org",
    "instagram": "@amanikumbi_griot"
  }
}
```

---

## 🎨 Exhibit Definitions

### **Sound Roots Room: 5 Exhibits**

#### **Exhibit 1: Kokari Walker - Kora Master** ⭐⭐ (FLAGSHIP)

```json
{
  "id": 1,
  "title": "Kokari Walker - Kora Master",
  "description": "Listen to Kokari Walker's masterful kora performance, a living continuation of 500 years of Mandinka musical tradition. This 8-minute composition weaves ancient melodies with contemporary arrangement, showcasing the kora's capacity for both delicate lyricism and percussive intensity.",
  "exhibit_type": "music",
  "image_url": "/images/exhibits/kokari-kora-master.jpg",
  "media_url": "/audio/kokari-walker-kora-master.mp3",
  "room_id": 1,
  "creator_id": 1,
  "cultural_context": "The kora is a 21-string lute-harp from Mali and Senegal, played by griots (hereditary historians and musicians) for over 500 years. Kokari's family has maintained this tradition across generations. The kora's delicate sound is often called the 'voice of the ancestors.'",
  "location_origin": "Mali",
  "year_created": "2024",
  "medium": "Kora (21-string)",
  "duration_seconds": 480,
  "popularity_score": 950,
  "is_featured": true
}
```

**Audio Note**: File should be MP3, ~5MB, optimized for streaming

#### **Exhibit 2: Jabari's Djembe Journey**

```json
{
  "id": 2,
  "title": "Jabari's Djembe Journey",
  "description": "A rhythmic exploration of the djembe by Senegalese master percussionist Jabari Sow. This 6-minute piece begins with traditional Senegalese rhythms and evolves into contemporary fusion, demonstrating the djembe's versatility across styles.",
  "exhibit_type": "music",
  "image_url": "/images/exhibits/jabari-djembe.jpg",
  "media_url": "/audio/jabari-djembe-journey.mp3",
  "room_id": 1,
  "creator_id": 3,
  "cultural_context": "The djembe originated in Mali and is integral to West African celebration and healing rituals. Its distinctive goblet shape and rope-tuned head allow for precise tonal control. Jabari learned djembe from his father at age 5 in Dakar.",
  "location_origin": "Senegal",
  "year_created": "2023",
  "medium": "Djembe (goat-skin drum)",
  "duration_seconds": 360,
  "popularity_score": 780,
  "is_featured": false
}
```

#### **Exhibit 3: Talking Drum Traditions**

```json
{
  "id": 3,
  "title": "Talking Drum Traditions",
  "description": "The talking drum can be made to 'speak' words and phrases through pitch control, creating a form of musical language. This exhibit features a 4-minute performance showcasing how Yoruba talking drums communicate emotional and narrative content.",
  "exhibit_type": "music",
  "image_url": "/images/exhibits/talking-drum.jpg",
  "media_url": "/audio/talking-drum-traditions.mp3",
  "room_id": 1,
  "creator_id": 3,
  "cultural_context": "The talking drum (dundun) is a Yoruba instrument capable of mimicking human speech patterns and tones. Historically used for long-distance communication, the talking drum could relay news, warnings, and ceremonies across villages. Master drummers could 'compose' complex messages.",
  "location_origin": "Nigeria",
  "year_created": "2024",
  "medium": "Talking Drum (dundun)",
  "duration_seconds": 240,
  "popularity_score": 650,
  "is_featured": false
}
```

#### **Exhibit 4: Balafon Reverie**

```json
{
  "id": 4,
  "title": "Balafon Reverie",
  "description": "The balafon (African xylophone) creates crystalline tones that ripple with ancient resonance. This meditative 7-minute piece by Jabari Sow demonstrates the balafon's ability to evoke emotion and spiritual depth.",
  "exhibit_type": "music",
  "image_url": "/images/exhibits/balafon.jpg",
  "media_url": "/audio/balafon-reverie.mp3",
  "room_id": 1,
  "creator_id": 3,
  "cultural_context": "The balafon is a percussion instrument consisting of wooden bars arranged over gourds, creating resonance chambers. Originating from Mali and Guinea, the balafon is played by griots in both social and ceremonial contexts. Its name comes from Mandinka: 'bala' (say) + 'fon' (with).",
  "location_origin": "Mali",
  "year_created": "2023",
  "medium": "Balafon (wooden xylophone)",
  "duration_seconds": 420,
  "popularity_score": 720,
  "is_featured": false
}
```

#### **Exhibit 5: Griot Oral Tradition**

```json
{
  "id": 5,
  "title": "Griot Oral Tradition - Stories & Songs",
  "description": "Amani Kumbi recites traditional Fulani genealogies and epic stories, preserving centuries-old narratives through the griot tradition. This 12-minute audio recording captures the rhythmic speech, musical interjections, and ceremonial language of oral heritage.",
  "exhibit_type": "music",
  "image_url": "/images/exhibits/griot-oral.jpg",
  "media_url": "/audio/griot-oral-tradition.mp3",
  "room_id": 1,
  "creator_id": 5,
  "cultural_context": "Griots are West African historians, genealogists, and musicians who preserve knowledge through oral recitation, often accompanied by kora or other instruments. The griot tradition spans centuries and serves as the primary method of cultural transmission in many societies. Griots undergo years of training to memorize vast amounts of genealogical, historical, and cultural knowledge.",
  "location_origin": "Mauritania",
  "year_created": "2024",
  "medium": "Voice + Traditional Instruments",
  "duration_seconds": 720,
  "popularity_score": 820,
  "is_featured": false
}
```

---

### **Art Gallery Room: 5 Exhibits**

#### **Exhibit 6: Kente Cloth Heritage**

```json
{
  "id": 6,
  "title": "Kente Cloth Heritage",
  "description": "Ama Yeboah's hand-woven Kente cloth showcases the vibrant geometric patterns and rich colors of Ashanti weaving tradition. Royal gold, deep purples, and emerald greens tell stories of lineage, celebration, and cultural pride through intricate weaving.",
  "exhibit_type": "painting",
  "image_url": "/images/exhibits/kente-cloth.jpg",
  "media_url": null,
  "room_id": 2,
  "creator_id": 2,
  "cultural_context": "Kente cloth originated in the Ashanti Kingdom of Ghana and remains a symbol of cultural identity, worn during important ceremonies and celebrations. Each pattern has a name and meaning (Adweneasa = 'woven beauty', Gyedumasasa = 'master weaver'). Traditional Kente is hand-woven on narrow looms and can take weeks to complete.",
  "location_origin": "Ghana",
  "year_created": "2024",
  "medium": "Hand-woven cotton and silk",
  "duration_seconds": null,
  "popularity_score": 890,
  "is_featured": true
}
```

#### **Exhibit 7: Bogolan (Mud Cloth)**

```json
{
  "id": 7,
  "title": "Bogolan - Mali's Mud Cloth",
  "description": "Ancient patterns applied to cotton through natural dyes and fermented mud create Bogolan's distinctive aesthetic. This artwork features traditional geometric motifs that tell stories of protection, spiritual guidance, and artistic heritage.",
  "exhibit_type": "painting",
  "image_url": "/images/exhibits/bogolan.jpg",
  "media_url": null,
  "room_id": 2,
  "creator_id": 2,
  "cultural_context": "Bogolan (mud cloth) is produced primarily by women artisans in Mali. The fabric is first dyed with tannin from tree bark, then patterned with fermented mud that stains permanently. Patterns are traditionally applied by hand using sticks, creating unique variations. Each pattern traditionally holds meaning related to protection, prosperity, or spiritual themes.",
  "location_origin": "Mali",
  "year_created": "2023",
  "medium": "Cotton, natural dyes, mud pigment",
  "duration_seconds": null,
  "popularity_score": 760,
  "is_featured": false
}
```

#### **Exhibit 8: Benin Bronzes - Royal Heritage**

```json
{
  "id": 8,
  "title": "Benin Bronzes - Royal Heritage",
  "description": "The Benin Bronzes are extraordinary brass plaques created in the Kingdom of Benin (modern Nigeria) over centuries. These intricate works depict royal ceremonies, warrior cultures, and spiritual beliefs, representing one of Africa's most sophisticated artistic traditions.",
  "exhibit_type": "artifact",
  "image_url": "/images/exhibits/benin-bronze.jpg",
  "media_url": null,
  "room_id": 2,
  "creator_id": 4,
  "cultural_context": "Created from the 13th to 19th centuries, Benin Bronzes are actually brass (copper-zinc alloy), not true bronze. They adorned the royal palace walls of Benin City, narrating the history and power of the kingdom. Each plaque represents incredible metalworking skill and artistic vision. Many were removed during colonial times; repatriation efforts continue globally.",
  "location_origin": "Nigeria",
  "year_created": "1500-1800 (historical)",
  "medium": "Brass/bronze casting",
  "duration_seconds": null,
  "popularity_score": 920,
  "is_featured": false
}
```

#### **Exhibit 9: Dogon Figures - Mali's Spiritual Art**

```json
{
  "id": 9,
  "title": "Dogon Figures - Mali's Spiritual Art",
  "description": "The Dogon people of Mali created carved wooden figures serving spiritual and ceremonial functions. These abstract yet powerful sculptures embody the Dogon cosmology, representing ancestors, spirits, and the connection between the physical and spiritual worlds.",
  "exhibit_type": "artifact",
  "image_url": "/images/exhibits/dogon-figure.jpg",
  "media_url": null,
  "room_id": 2,
  "creator_id": 2,
  "cultural_context": "Dogon sculpture traditionally served ritualistic and spiritual purposes rather than purely aesthetic ones. Figures were kept in shrines, used in ceremonies, or passed down as family treasures. The minimalist, geometric aesthetic influenced modernist artists in Europe. Dogon philosophy, documented through their astronomical knowledge, suggests an ancient understanding of celestial mechanics.",
  "location_origin": "Mali",
  "year_created": "1800-1950 (historical)",
  "medium": "Carved wood, patina",
  "duration_seconds": null,
  "popularity_score": 840,
  "is_featured": false
}
```

#### **Exhibit 10: Contemporary African Abstraction**

```json
{
  "id": 10,
  "title": "Contemporary African Abstraction - Zara Okonkwo",
  "description": "Zara Okonkwo's large-scale abstract paintings explore themes of identity, displacement, and cultural memory. Using layered colors and bold gestural marks, she bridges traditional Yoruba visual language with contemporary expressionism.",
  "exhibit_type": "painting",
  "image_url": "/images/exhibits/zara-okonkwo-abstract.jpg",
  "media_url": null,
  "room_id": 2,
  "creator_id": 4,
  "cultural_context": "Contemporary African artists are redefining global art discourse by integrating ancestral knowledge with modern techniques. Zara's work responds to ongoing conversations about African identity in the diaspora, drawing inspiration from traditional Yoruba indigo patterns, masks, and spiritual symbolism while employing contemporary abstract methods.",
  "location_origin": "Nigeria",
  "year_created": "2024",
  "medium": "Acrylic and mixed media on canvas",
  "duration_seconds": null,
  "popularity_score": 710,
  "is_featured": false
}
```

---

## 💰 Web Monetization Payment Pointers

### **Format Specification**

All creators use **Interledger Protocol (ILP) payment pointers**:

```
$ilp.uphold.com/{unique-id}
$ilp.paywithnano.com/{unique-id}
$ilp.stronghold.co/{unique-id}
```

### **How Payment Pointers Work**

1. **Frontend injects**: `<link rel="monetization" href="$ilp.uphold.com/9h8G7K5m2X">`
2. **User browser extension** (Coil): Recognizes link, streams micropayments
3. **Payments flow** to creator's Uphold wallet
4. **Backend tracks** via Web Monetization events

### **Creating Payment Pointers**

Each creator needs:
1. ILP-compatible wallet (Uphold, Stronghold, etc.)
2. Register pointer at provider
3. Test with [ilp.uphold.com/test](https://ilp.uphold.com/test)

---

## 📊 SQL Insertion Script

**Save as**: `backend/app/seed/seed_data.sql`

```sql
-- ROOMS
INSERT INTO rooms (name, description, image_url, order_index) VALUES
('Sound Roots', 'Celebrate the living heritage of African music...', '/images/rooms/soundroots-header.jpg', 1),
('Art Gallery', 'Explore the vibrant visual traditions of Africa...', '/images/rooms/gallery-header.jpg', 2);

-- CREATORS (Kokari Walker first/featured)
INSERT INTO creators (name, bio, profile_image_url, country, cultural_heritage, payment_pointer, is_featured, social_links) VALUES
('Kokari Walker', 'Kokari Walker is a legendary kora virtuoso...', '/images/creators/kokari-walker.jpg', 'Mali', 'Mandinka griot tradition', '$ilp.uphold.com/9h8G7K5m2X', true, '{"website":"https://kokariwalkerkora.com","instagram":"@kokari_walker_kora"}'),
('Ama Yeboah', 'Ama Yeboah is a master weaver...', '/images/creators/ama-yeboah.jpg', 'Ghana', 'Ashanti textile traditions', '$ilp.uphold.com/7f5h3K9n1Y', false, '{"instagram":"@amayeboahkente"}'),
('Jabari Sow', 'Jabari Sow is a world-renowned percussionist...', '/images/creators/jabari-sow.jpg', 'Senegal', 'Wolof & Fulani percussion traditions', '$ilp.uphold.com/6c4j2L8p0T', false, '{"instagram":"@jabarisowdrums"}'),
('Zara Okonkwo', 'Zara Okonkwo is a Lagos-based contemporary painter...', '/images/creators/zara-okonkwo.jpg', 'Nigeria', 'Yoruba visual traditions', '$ilp.uphold.com/8d5k3M9q1U', false, '{"instagram":"@zaraokonkwo"}'),
('Amani Kumbi', 'Amani Kumbi is a griot and oral historian...', '/images/creators/amani-kumbi.jpg', 'Mauritania', 'Fulani griot oral tradition', '$ilp.uphold.com/9e6l4N0r2V', false, '{"website":"https://amanikumbigriot.org"}');

-- EXHIBITS (10 total: 5 music + 5 art)
INSERT INTO exhibits (title, description, exhibit_type, image_url, media_url, room_id, creator_id, cultural_context, location_origin, year_created, medium, duration_seconds, popularity_score, is_featured) VALUES
('Kokari Walker - Kora Master', 'Listen to Kokari Walker''s masterful kora performance...', 'music', '/images/exhibits/kokari-kora-master.jpg', '/audio/kokari-walker-kora-master.mp3', 1, 1, 'The kora is a 21-string lute-harp...', 'Mali', '2024', 'Kora (21-string)', 480, 950, true),
('Jabari''s Djembe Journey', 'A rhythmic exploration of the djembe...', 'music', '/images/exhibits/jabari-djembe.jpg', '/audio/jabari-djembe-journey.mp3', 1, 3, 'The djembe originated in Mali...', 'Senegal', '2023', 'Djembe (goat-skin drum)', 360, 780, false),
('Talking Drum Traditions', 'The talking drum can be made to speak words and phrases...', 'music', '/images/exhibits/talking-drum.jpg', '/audio/talking-drum-traditions.mp3', 1, 3, 'The talking drum (dundun) is a Yoruba instrument...', 'Nigeria', '2024', 'Talking Drum (dundun)', 240, 650, false),
('Balafon Reverie', 'The balafon (African xylophone) creates crystalline tones...', 'music', '/images/exhibits/balafon.jpg', '/audio/balafon-reverie.mp3', 1, 3, 'The balafon is a percussion instrument...', 'Mali', '2023', 'Balafon (wooden xylophone)', 420, 720, false),
('Griot Oral Tradition - Stories & Songs', 'Amani Kumbi recites traditional Fulani genealogies and epic stories...', 'music', '/images/exhibits/griot-oral.jpg', '/audio/griot-oral-tradition.mp3', 1, 5, 'Griots are West African historians...', 'Mauritania', '2024', 'Voice + Traditional Instruments', 720, 820, false),
('Kente Cloth Heritage', 'Ama Yeboah''s hand-woven Kente cloth showcases vibrant geometric patterns...', 'painting', '/images/exhibits/kente-cloth.jpg', NULL, 2, 2, 'Kente cloth originated in the Ashanti Kingdom...', 'Ghana', '2024', 'Hand-woven cotton and silk', NULL, 890, true),
('Bogolan - Mali''s Mud Cloth', 'Ancient patterns applied to cotton through natural dyes...', 'painting', '/images/exhibits/bogolan.jpg', NULL, 2, 2, 'Bogolan (mud cloth) is produced primarily by women artisans...', 'Mali', '2023', 'Cotton, natural dyes, mud pigment', NULL, 760, false),
('Benin Bronzes - Royal Heritage', 'The Benin Bronzes are extraordinary brass plaques...', 'artifact', '/images/exhibits/benin-bronze.jpg', NULL, 2, 4, 'Created from the 13th to 19th centuries...', 'Nigeria', '1500-1800', 'Brass/bronze casting', NULL, 920, false),
('Dogon Figures - Mali''s Spiritual Art', 'The Dogon people of Mali created carved wooden figures...', 'artifact', '/images/exhibits/dogon-figure.jpg', NULL, 2, 2, 'Dogon sculpture traditionally served ritualistic purposes...', 'Mali', '1800-1950', 'Carved wood, patina', NULL, 840, false),
('Contemporary African Abstraction - Zara Okonkwo', 'Zara Okonkwo''s large-scale abstract paintings explore themes...', 'painting', '/images/exhibits/zara-okonkwo-abstract.jpg', NULL, 2, 4, 'Contemporary African artists are redefining global art discourse...', 'Nigeria', '2024', 'Acrylic and mixed media on canvas', NULL, 710, false);
```

---

## 🔄 Python Seed Script Alternative

**File**: `backend/app/seed/seed_data.py`

```python
from app.models import Room, Creator, Exhibit
from app.core.database import SessionLocal

def seed_database():
    db = SessionLocal()
    
    # Clear existing data
    db.query(Exhibit).delete()
    db.query(Creator).delete()
    db.query(Room).delete()
    
    # Create rooms
    rooms = [
        Room(name="Sound Roots", description="...", image_url="..."),
        Room(name="Art Gallery", description="...", image_url="..."),
    ]
    db.add_all(rooms)
    db.commit()
    
    # Create creators
    creators = [
        Creator(name="Kokari Walker", bio="...", payment_pointer="$ilp.uphold.com/9h8G7K5m2X", is_featured=True),
        Creator(name="Ama Yeboah", bio="...", payment_pointer="$ilp.uphold.com/7f5h3K9n1Y"),
        # ... more creators
    ]
    db.add_all(creators)
    db.commit()
    
    # Create exhibits
    exhibits = [
        Exhibit(title="Kokari Walker - Kora Master", exhibit_type="music", room_id=1, creator_id=1, ...),
        # ... more exhibits
    ]
    db.add_all(exhibits)
    db.commit()
    
    print("✅ Database seeded with 10 exhibits, 5 creators, 2 rooms")

if __name__ == "__main__":
    seed_database()
```

---

## ✅ Validation Checklist

Before inserting seed data, verify:

- [ ] All creator payment pointers are valid ILP format
- [ ] All image URLs point to existing files
- [ ] All audio URLs are valid (or will be uploaded)
- [ ] Kokari Walker is marked `is_featured: true`
- [ ] At least 2 exhibits marked `is_featured: true`
- [ ] Room IDs match exhibit room_id references
- [ ] Creator IDs match exhibit creator_id references
- [ ] No SQL injection in description fields (use parameterized queries)
- [ ] All cultural_context descriptions are accurate and respectful
- [ ] Audio durations are in seconds (e.g., 480 = 8 minutes)

---

## 🚀 Next Steps

1. **Backend Team**: Copy schema + seed script into database migrations
2. **Design Team**: Begin image curation using IMAGERY_STRATEGY.md
3. **Audio Production**: Record or source high-quality audio for 5 music exhibits
4. **Testing**: Run seed script in development, verify all relationships
5. **Frontend Team**: Update API calls to match actual database IDs

---

**Questions?**

- **"How do I test payment pointers?"** → Use Coil browser extension + test wallet
- **"What if audio files aren't ready?"** → Use `media_url: null`, implement fallback UI
- **"Can I add more exhibits?"** → Yes, follow same schema and increment IDs
- **"How do I handle creator updates?"** → Use `updated_at` timestamp for versioning

---

**Document Version**: 1.0  
**Last Updated**: May 29, 2026  
**Status**: Ready for Backend Implementation
