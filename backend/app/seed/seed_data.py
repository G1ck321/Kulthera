import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

# Import database core assets
from app.core.database import async_engine, Base, async_session_factory
from app.models import Room, Creator, Exhibit

# --- SEED DATA DEFINITIONS ---

ROOMS_SEED = [
    {
        "slug": "sound-roots",
        "name": "Sound Roots",
        "tagline": "Rhythms and voices that shaped a continent",
        "description": "Step into a deep acoustic sanctuary featuring traditional West African percussion, highlife strings, and celebrated regional praise recordings.",
        "image_url": "/assets/rooms/sound_roots.jpg",
        "display_order": 1
    },
    {
        "slug": "painted-memory",
        "name": "Painted Memory",
        "tagline": "Contemporary canvases reflecting historical depth",
        "description": "Explore digital renderings and contemporary paintings leveraging rich natural pigments, Sahel-inspired ochres, and traditional Adire textile strokes.",
        "image_url": "/assets/rooms/painted_memory.jpg",
        "display_order": 2
    },
    {
        "slug": "artifact-house",
        "name": "Artifact House",
        "tagline": "Living archives and physical dimensions",
        "description": "Interact with dynamic rotating perspectivas representing sacred bronzes, hand-woven royal Kente cloth, and authentic Yoruba spiritual carvings.",
        "image_url": "/assets/rooms/artifact_house.jpg",
        "display_order": 3
    },
    {
        "slug": "living-stories",
        "name": "Living Stories",
        "tagline": "Oral histories and written memories",
        "description": "Read and listen to traditional oral history compilations, festival accounts, and deep reflective essays on community memory.",
        "image_url": "/assets/rooms/living_stories.jpg",
        "display_order": 4
    }
]

CREATORS_SEED = [
    {
        "name": "Master Drummer Kunle",
        "role": "Traditional Percussionist & Custodian",
        "bio": "Kunle is a fifth-generation Yoruba talking drum specialist who has toured globally, dedicated to preserving rhythmic oral speech drumming dialects.",
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
        "wallet_address": "$ilp.interledger-test.dev/kunle_drums",
        "country": "Nigeria",
        "language": "Yoruba",
        "email": "kunle@kultr.dev"
    },
    {
        "name": "Sani Kokari (The Kokari Walker)",
        "role": "Wandering Minstrel & Kora Master",
        "bio": "Sani Kokari, known as 'The Kokari Walker', traveled extensively across West Africa by foot, playing his Kora. His music captures the essence of his journey, documenting the diverse cultures and landscapes he encountered.",
        "avatar_url": "https://images.unsplash.com/photo-1531384370597-859faa8ce332?auto=format&fit=crop&q=80&w=150",
        "wallet_address": "$ilp.interledger-test.dev/kokari_walker",
        "country": "Mali",
        "language": "Bambara",
        "email": "kokari@kultr.dev"
    },
    {
        "name": "Amina Bello",
        "role": "Sahel Fine Artist",
        "bio": "Amina Bello is a fine arts graduate combining natural clay paints and mineral pigments to capture contemporary Sahelian migration narratives.",
        "avatar_url": "https://images.unsplash.com/photo-1531123897727-8f129e1bfa82?auto=format&fit=crop&q=80&w=150",
        "wallet_address": "$ilp.interledger-test.dev/amina_paintings",
        "country": "Niger",
        "language": "Hausa",
        "email": "amina@kultr.dev"
    },
    {
        "name": "Nana Kwame",
        "role": "Master Kente Weaver",
        "bio": "Kwame operates a family weaving compound in Bonwire, keeping the complex geometric patterns of traditional royal Kente textiles alive.",
        "avatar_url": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150",
        "wallet_address": "$ilp.interledger-test.dev/nana_kente",
        "country": "Ghana",
        "language": "Akan",
        "email": "nana@kultr.dev"
    },
    {
        "name": "Chidi Nwachukwu",
        "role": "Community Storyteller & Historian",
        "bio": "Chidi documents agricultural festivals and generational yam celebrations, writing narrative essays designed to preserve community folklore.",
        "avatar_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150",
        "wallet_address": "$ilp.interledger-test.dev/chidi_stories",
        "country": "Nigeria",
        "language": "Igbo",
        "email": "chidi@kultr.dev"
    }
]

# We link exhibits dynamically by indexing seeded Room slugs and Creator names during execution
EXHIBITS_SEED = [
    # 🎵 Sound Roots Wing
    {
        "room_slug": "sound-roots",
        "creator_name": "Sani Kokari (The Kokari Walker)",
        "title": "Footsteps in the Dust - The Kokari Journey",
        "description": "An acoustic Kora recording capturing the steady rhythm of walking across the Sahel. This track gained immense attention for documenting the exact tempo of Sani's historic trek.",
        "cultural_context": "The Kora is a 21-string lute-bridge-harp used extensively in West Africa. The Kokari Walker used its rhythms to pace his walking, turning travel into a musical meditation.",
        "media_type": "audio",
        "media_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", # Placeholder for the Kora music
        "preview_url": "",
        "country": "Mali",
        "region": "Segou",
        "language_code": "bm",
        "tags": ["kora", "journey", "acoustic"],
        "display_order": 1
    },
    {
        "room_slug": "sound-roots",
        "creator_name": "Sani Kokari (The Kokari Walker)",
        "title": "Nightfall at the Oasis",
        "description": "A slower, reflective piece composed during a rest stop. It features complex fingerpicking that mimics the wind moving through palm leaves.",
        "cultural_context": "Rest stops along historical trade routes were places of intense cultural exchange, where musicians shared techniques and stories.",
        "media_type": "audio",
        "media_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        "preview_url": "",
        "country": "Mali",
        "region": "Timbuktu",
        "language_code": "bm",
        "tags": ["kora", "night", "reflection"],
        "display_order": 2
    },
    {
        "room_slug": "sound-roots",
        "creator_name": "Master Drummer Kunle",
        "title": "Ayan Talking Drum Recital",
        "description": "A high-fidelity traditional West African percussion recording mapping complex tonal speech phrases.",
        "cultural_context": "The Yoruba talking drum (Gan-gan) is a biological telephone, imitating the pitch, rhythm, and inflections of spoken language to communicate announcements across miles.",
        "media_type": "audio",
        "media_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        "preview_url": "",
        "country": "Nigeria",
        "region": "Oyo State",
        "language_code": "yo",
        "tags": ["percussion", "traditional", "performance"],
        "display_order": 3
    },
    
    # 🎨 Painted Memory Wing
    {
        "room_slug": "painted-memory",
        "creator_name": "Amina Bello",
        "title": "Sahel Ochres Color Study",
        "description": "A striking contemporary oil rendering capturing migration and weather changes in deep yellow ochres and desert clay.",
        "cultural_context": "Utilizes mineral dust extracted directly from clay cliffs in Niger, reflecting the exact physical landscape in the visual canvas itself.",
        "media_type": "painting",
        "media_url": "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800",
        "preview_url": "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=80&blur=10",
        "country": "Niger",
        "region": "Agadez",
        "language_code": "ha",
        "tags": ["painting", "clay", "contemporary"],
        "display_order": 1
    },
    {
        "room_slug": "painted-memory",
        "creator_name": "Amina Bello",
        "title": "Market Day Intersections",
        "description": "A complex layered digital illustration reflecting the color and motion density of trading days.",
        "cultural_context": "Market days (Ahia) are major socio-economic and spiritual pillars across West Africa, determining community calendars and communal exchanges.",
        "media_type": "painting",
        "media_url": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=800",
        "preview_url": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=80&blur=10",
        "country": "Nigeria",
        "region": "Kano",
        "language_code": "en",
        "tags": ["digital", "market", "vibrant"],
        "display_order": 2
    },
    
    # 🏺 Artifact House Wing (Rotational Frames perspectives)
    {
        "room_slug": "artifact-house",
        "creator_name": "Nana Kwame",
        "title": "Royal Kente Cloth Geometric Study",
        "description": "A deep rotational perspective study of a 19th-century royal Kente cloth, displaying elaborate hand-woven threads.",
        "cultural_context": "Kente cloth (known as Nwentoma in Akan) is a ceremonial textile where every woven square, thread grid, and pigment holds a precise historic proverb or royal lineage meaning.",
        "media_type": "artifact",
        "media_url": "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=800", # Fallback base image
        "preview_url": "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=80&blur=10",
        "country": "Ghana",
        "region": "Ashanti Region",
        "language_code": "ak",
        "tags": ["textile", "kente", "weaving"],
        "display_order": 1
    },
    {
        "room_slug": "artifact-house",
        "creator_name": "Master Drummer Kunle",
        "title": "Benin Bronze Head Study",
        "description": "A close-up perspective analysis detailing the brass casting technology of historic ceremonial heads.",
        "cultural_context": "Cast using the highly sophisticated lost-wax process by the guild of royal brass-casters (Igun Eronmwon) in the historic Kingdom of Benin.",
        "media_type": "artifact",
        "media_url": "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&q=80&w=800",
        "preview_url": "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&q=80&w=80&blur=10",
        "country": "Nigeria",
        "region": "Edo State",
        "language_code": "en",
        "tags": ["bronze", "casting", "sculpture"],
        "display_order": 2
    },
    
    # 📖 Living Stories Wing
    {
        "room_slug": "living-stories",
        "creator_name": "Chidi Nwachukwu",
        "title": "Sacred Yam Festival Chronicles",
        "description": "A reflective narrative essay mapping the agricultural dances and communal feeding during the annual new harvest cycles.",
        "cultural_context": "The New Yam Festival (Iri Ji) is a cultural thanksgiving festival marking the harvest, establishing the spiritual and physical calendar for communities.",
        "media_type": "story",
        "media_url": "", # Stories load direct narrative text rather than static external files
        "preview_url": "",
        "country": "Nigeria",
        "region": "Anambra State",
        "language_code": "ig",
        "tags": ["harvest", "festival", "folklore"],
        "display_order": 1
    }
]

# --- ASYNC EXECUTION ENGINE ---

async def seed_database():
    """
    Asynchronous data seeder.
    1. Instantiates database tables if they do not exist (saving manual Alembic commands during local runs).
    2. Inserts Rooms and Creators safely, checking slugs to prevent duplication.
    3. Links and inserts Exhibits dynamically based on room relationships.
    """
    print("[SeedEngine] Booting database seed transaction...")
    
    # 1. Autocreate tables on connection pool (Async engine requires run_sync for metadata binding)
    async with async_engine.begin() as conn:
        print("[SeedEngine] Running database schema compilation...")
        await conn.run_sync(Base.metadata.create_all)
        print("[SeedEngine] Schema compilation complete.")

    # Spawn thread-safe session contexts
    async with async_session_factory() as session:
        # 2. Seed Wing Rooms
        for room_data in ROOMS_SEED:
            existing = await session.execute(select(Room).where(Room.slug == room_data["slug"]))
            if not existing.scalar_one_or_none():
                print(f"[SeedEngine] Seeding Room: {room_data['name']}")
                session.add(Room(**room_data))
        
        # 3. Seed Creators
        for creator_data in CREATORS_SEED:
            existing = await session.execute(select(Creator).where(Creator.wallet_address == creator_data["wallet_address"]))
            if not existing.scalar_one_or_none():
                print(f"[SeedEngine] Seeding Creator: {creator_data['name']}")
                session.add(Creator(**creator_data))

        # Commit current entities to safely resolve foreign key constraints next
        await session.commit()

        # 4. Seed Exhibits
        for exhibit_data in EXHIBITS_SEED:
            # Query the dynamically created room and creator elements to extract their unique IDs
            room_slug = exhibit_data.pop("room_slug")
            creator_name = exhibit_data.pop("creator_name")
            
            room_res = await session.execute(select(Room).where(Room.slug == room_slug))
            creator_res = await session.execute(select(Creator).where(Creator.name == creator_name))
            
            room = room_res.scalar_one()
            creator = creator_res.scalar_one()
            
            # Check if this specific item has already been seeded to prevent redundancy
            existing = await session.execute(
                select(Exhibit).where(
                    (Exhibit.title == exhibit_data["title"]) & 
                    (Exhibit.creator_id == creator.id)
                )
            )
            
            if not existing.scalar_one_or_none():
                print(f"[SeedEngine] Seeding Exhibit: {exhibit_data['title']} (Linked to Creator: {creator.name})")
                exhibit = Exhibit(
                    room_id=room.id,
                    creator_id=creator.id,
                    wallet_address=creator.wallet_address, # Derive payment pointers directly
                    **exhibit_data
                )
                session.add(exhibit)
        
        await session.commit()
        print("[SeedEngine] Database seed transaction successfully finalized!")

if __name__ == "__main__":
    # Enable running the script directly from terminal
    asyncio.run(seed_database())
