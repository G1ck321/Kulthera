# African Cultural Imagery Strategy for Kultr MVP

**Document Purpose**: Guide for sourcing, curating, and optimizing authentic African cultural images for the MVP  
**Target Audience**: Design team, Product team, Junior image editors  
**Date**: May 29, 2026

---

## 🎨 Image Strategy Overview

### Why Images Matter for MVP Success

For Kultr's MVP, images are **not decorative**—they're the first touchpoint for cultural authenticity:

1. **First Impression**: Visitor lands on home page → sees African imagery → understands cultural focus
2. **Creator Context**: Each exhibit needs artist photo/cultural imagery → builds trust
3. **Cultural Education**: Image selection tells the story (Kente cloth, masks, instruments)
4. **Low-Bandwidth Design**: Optimized images are critical for 3G networks (target: <200KB per image)

---

## 🏛️ Image Categories & Sourcing

### **1. Hero Images** (Home page, room headers)

**Characteristics**:
- High-impact, culturally representative
- Human element (people, not just objects)
- Size: 1200x600px (landscape)
- Optimized: <150KB

**Target Images**:

| Image | Purpose | Source | Notes |
|-------|---------|--------|-------|
| African Museum Entrance | Homepage hero | Wikimedia Commons | Choose building with cultural artifacts visible |
| Music Performance | Sound Roots hero | Unsplash/Pexels | Drummer, griots, or musicians performing |
| Artist at Work | Gallery hero | Photographer credit | Local artists (textile worker, sculptor) |
| Community Gathering | Explore hero | CC-licensed | Market scene, cultural celebration |

**Where to Find**:
1. **Wikimedia Commons** (High quality, public domain)
   - Search: "African museum", "African performance", "African market"
   - Filter: "Used Files" > "Public Domain"

2. **Unsplash** (High resolution, photographer credited)
   - Search: "African art", "African music", "African culture"
   - Download "Original" size, compress locally

3. **Pexels** (Similar to Unsplash, curated)
   - Search: "Africa", "African marketplace"

---

### **2. Creator Profile Images** (50x50px to 200x200px)

**For Kokari Walker (Flagship Artist)**:

```
Ideal Image:
- Portrait of musician with kora
- Or close-up of kora instrument
- Or performance photo
- Professional quality
- Size: 200x200px (square)
- Format: JPG, optimized <30KB
```

**Sources for Kokari Walker**:
1. Contact artist directly (best option)
2. Search: "Kokari Walker kora" on:
   - Artist websites
   - World Music Festival sites
   - African music databases
3. If unavailable, use generic "kora player" portrait (Unsplash/Commons)

**For Other Creators** (seed database):
- Vary gender, age, origin
- Show cultural diversity (different regions/traditions)
- Mix: 50% performance photos, 50% portraits

---

### **3. Exhibit Cover Images** (Gallery cards + lightbox)

**Music Exhibits** (Sound Roots):

| Exhibit | Ideal Image | Size | Rationale |
|---------|------------|------|-----------|
| Kokari Walker - Kora Master | Kora close-up or performance | 400x400px | Shows instrument/tradition |
| Yoruba Talking Drum | Drum photography | 400x400px | Visual recognition of instrument |
| Griot Oral Tradition | Elder speaking/performing | 400x400px | Captures storytelling essence |

**Where to source**:
- Wikimedia Commons: Search "kora", "talking drum", "African instruments"
- Natural History Museum APIs (British Museum, Met Museum)
- Music archive photos (Smithsonian Folklife)

**Painting/Artifact Exhibits**:

| Type | Source | Example |
|------|--------|---------|
| Textile Art | Textile museums, museum APIs | Kente cloth, Bogolan (mud cloth) |
| Sculpture | Museum public collections | Benin bronzes, Dogon figures |
| Mask | Ethnographic museums | Venetian masks, African ceremonial masks |
| Photography | Photographer archives | Contemporary African photography |

---

### **4. Room Header Images** (1200x300px)

**Sound Roots Room**:
- Musical performance or instrument-focused
- Suggestion: Musician playing in performance setting
- Source: Unsplash "African music performance"

**Gallery Room**:
- Art studio or gallery setting
- Suggestion: Artist working on painting/textile
- Source: Unsplash "African artist"

**Stories Room** (Phase 2):
- Community gathering or elderly person speaking
- Suggestion: Group listening to story
- Source: Unsplash "African community"

---

## 📥 Image Acquisition Workflow

### Step 1: Research & Selection

```
For each image needed:
1. Define exact purpose (hero, card, header, profile)
2. List search keywords (e.g., "kora musician", "Kente weaving")
3. Check 3 sources: Wikimedia, Unsplash, Museums
4. Document source URL + license
```

### Step 2: Rights & Attribution

**Always check**:
- [ ] Public domain OR
- [ ] Creative Commons (note which license)
- [ ] Direct photographer permission
- [ ] Commercial use allowed

**Document for each image**:
```
Image: kokari_walker_kora.jpg
Source: Wikimedia Commons / Unsplash [url]
License: Public Domain / CC-BY-4.0
Attribution: "Credit: [Artist Name]" or "Public Domain"
Usage: Exhibit cover, backend storage
```

### Step 3: Optimization

**For Web** (reduce file size):

```bash
# Using ImageOptim (Mac) or similar:
# Before: image.jpg (2.4MB)
# After: image_optimized.jpg (84KB)

# Recommended tool: TinyPNG or local optimization

Targets:
- Hero images: <150KB
- Profile images: <30KB
- Card cover images: <80KB
- Lightbox full-res: <200KB
```

**Optimization Steps**:
1. Export from source at exact pixel size (avoid upscaling)
2. Compress using TinyPNG or ImageOptim
3. Test: Verify image looks good on mobile
4. Store optimized version

### Step 4: Storage Organization

```
frontend/public/images/
├── heroes/
│   ├── home-hero.jpg (1200x600, <150KB)
│   ├── music-hero.jpg
│   └── gallery-hero.jpg
│
├── rooms/
│   ├── soundroots-header.jpg (1200x300, <120KB)
│   └── gallery-header.jpg
│
├── creators/
│   ├── kokari-walker.jpg (200x200, <30KB)
│   ├── creator-2.jpg
│   └── placeholder-creator.jpg
│
├── exhibits/
│   ├── kokari-kora-master.jpg (400x400, <80KB)
│   ├── yoruba-drum.jpg
│   ├── benin-bronze.jpg
│   ├── kente-cloth.jpg
│   └── ... (more exhibits)
│
└── README.md (document all image sources)
```

---

## 📋 Image Specifications by Usage

### **Profile Images** (Creator avatars)

```
Format: JPG or WebP
Dimensions: 200x200px (1:1 square)
Max Size: 30KB
Color Profile: sRGB
Quality: 85%

Use Case: Header menu, creator cards, dashboard
Aspect Ratio: Square (will be cropped if needed)
```

### **Card Cover Images** (Gallery thumbnails)

```
Format: JPG or WebP
Dimensions: 400x400px (1:1 square)
Max Size: 80KB
Color Profile: sRGB
Quality: 85%

Use Case: Gallery grid, playlist items
Aspect Ratio: Square (consistent with gallery UX)
Note: Will have hover overlay, keep center content clear
```

### **Hero Images** (Landing pages)

```
Format: JPG (WebP for modern browsers)
Dimensions: 1200x600px (2:1 landscape)
Max Size: 150KB
Color Profile: sRGB
Quality: 80%

Use Case: Homepage, room pages, featured sections
Aspect Ratio: 2:1 widescreen
Note: Mobile will show cropped center (use safe area)
```

### **Lightbox Images** (Full-size viewing)

```
Format: JPG (WebP fallback)
Dimensions: 1200x800px to 1600x1000px
Max Size: 200KB
Color Profile: sRGB
Quality: 85%

Use Case: Lightbox modal, detailed viewing
Aspect Ratio: Depends on artwork (portrait or landscape)
Note: Responsive, will scale down on mobile
```

---

## 🎨 African Cultural Image Examples

### **Sound Roots Music Collection**

#### **Kokari Walker - Featured Exhibit**
```
Title: "Kokari Walker - Kora Master"
Suggested Images:
1. Kora close-up (instrument beauty)
   Source: Wikimedia "Kora instrument"
   
2. Performer in traditional dress
   Source: World music festival photography
   
3. Hands playing kora (action shot)
   Source: Performance documentation

Color Palette: Gold, earth tones, natural lighting
Cultural Significance: Mandinka griot tradition, multi-generational heritage
```

#### **Other Music Exhibits**
```
- Yoruba Talking Drum: Ornate wooden drum with carvings
- Griots Oral Tradition: Elder or group in storytelling pose
- Kora Players: Musicians in performance setting
- African Percussion: Various drums, instruments close-up
```

### **Art Gallery Collection**

#### **Textiles**
```
Kente Cloth (Ghana)
- Source: Wikimedia Commons / Museum collections
- Colors: Royal blues, golds, reds
- Photography: Flat lay with natural light

Bogolan (Mali - Mud Cloth)
- Source: Ethnographic museums
- Colors: Earth tones (browns, blacks, whites)
- Photography: Pattern detail shots

Adire (Nigeria - Indigo Resist)
- Source: African textile museums
- Colors: Deep indigo and white patterns
- Photography: Woven textile detail
```

#### **Sculpture & Masks**
```
Benin Bronze Plaques
- Source: British Museum public collection
- Photography: Professional museum lighting
- Subject: Royal/ceremonial scenes

Dogon Figures (Mali)
- Source: Ethnographic museums
- Photography: Multiple angles
- Subject: Ancestral or spiritual significance

African Ceremonial Masks
- Source: Smithsonian, Natural History museums
- Photography: Three-quarter view to show dimension
- Subject: Varied by culture (Yoruba, Igbo, Fulani, etc.)
```

#### **Contemporary African Art**
```
Modern Painters
- Source: Gallery websites, artist portfolios
- Get permission where possible
- Photography: Studio/gallery setting

Photography
- Source: African photographers (Flickr, Unsplash)
- Search: "Contemporary African photography"
- Subject: Street scenes, portraits, landscapes
```

---

## 🔗 Recommended Image Sources (Ranked by Quality)

### **Tier 1: Best for Authenticity** (Rank: Use First)

1. **Wikimedia Commons** (wikimedia.org)
   - ✅ Public domain + CC-licensed
   - ✅ High quality, museum-backed
   - ✅ Search: "African [instrument/art]"
   - ❌ Slower interface
   - Images: 2-4 stars, professional photography

2. **Museum Public Collections**
   - British Museum (collection.britishmuseum.org)
   - Metropolitan Museum (metmuseum.org)
   - African Art Museum (americanart.si.edu)
   - ✅ Professionally documented
   - ✅ Detailed cultural context
   - ❌ May have restrictions
   - Images: 5 stars, museum quality

3. **Smithsonian Folklife Archive**
   - folklife.si.edu
   - ✅ Anthropologically accurate
   - ✅ Cultural documentation
   - ✅ Performance/music focus
   - Images: 4-5 stars

### **Tier 2: Good for General Use** (Rank: Use Second)

4. **Unsplash** (unsplash.com)
   - ✅ High resolution
   - ✅ Free commercial use
   - ✅ Photographer credited
   - Search: "Africa", "African music", "African art"
   - Images: 3-4 stars

5. **Pexels** (pexels.com)
   - ✅ Similar to Unsplash
   - ✅ Curated collection
   - Search: "African culture"
   - Images: 3 stars

---

## 📊 MVP Image Inventory Checklist

**Total Images Needed for MVP**: ~20-25 images

| Category | Count | Size | Status |
|----------|-------|------|--------|
| Hero images | 4 | 1200x600 | ⏳ To find |
| Room headers | 3 | 1200x300 | ⏳ To find |
| Creator profiles | 10 | 200x200 | ⏳ To source |
| Exhibit covers | 10 | 400x400 | ⏳ To curate |
| **TOTAL** | **~27** | **Various** | **In Progress** |

---

## 🚀 Image Workflow Timeline

```
WEEK 1: Research & Selection
Mon-Tue:  Define all exhibit titles + cultural contexts
Wed:      Research image sources for each
Thu-Fri:  Download candidates (3 options per image)

WEEK 2: Curation & Optimization
Mon-Tue:  Select best image for each exhibit
Wed-Thu:  Compress & optimize all images
Fri:      Upload to frontend/public/images/

WEEK 3: Integration
Mon:      Update backend seed data with image URLs
Tue-Wed:  Test on mobile + 3G speed
Thu-Fri:  Final review + adjustments
```

---

## 🎓 Technical Integration

### **In Frontend** (React):

```typescript
// Import optimized images
import kokariWalkerImage from '@/images/creators/kokari-walker.jpg';

// Use in component
<img 
  src={kokariWalkerImage}
  alt="Kokari Walker, Kora Musician"
  loading="lazy"  // Lazy load for performance
/>
```

### **In Backend** (Seed data):

```python
exhibit = Exhibit(
    title="Kokari Walker - Kora Master",
    image_url="/images/exhibits/kokari-kora-master.jpg",
    creator_avatar="/images/creators/kokari-walker.jpg",
    cultural_context="Mandinka griot tradition...",
    # ... other fields
)
```

### **Lazy Loading Strategy**:

```html
<!-- Use native lazy loading for below-the-fold images -->
<img src="image.jpg" loading="lazy" />

<!-- Or use Intersection Observer for custom behavior -->
```

---

## ✅ Quality Checklist

Before adding any image to the frontend:

- [ ] Image is high quality (not blurry)
- [ ] File size is optimized (meets max KB)
- [ ] Aspect ratio is correct for usage
- [ ] Attribution is documented
- [ ] License allows commercial use
- [ ] Image represents authentic African culture
- [ ] Cultural context is accurate (researched)
- [ ] Tested on mobile view
- [ ] Tested at 3G speed

---

## 📞 When to Reach Out to Creators

For the best results, contact African artists directly:

### **Kokari Walker (Kora musician)**
- Research: Search "Kokari Walker kora" + social media
- Pitch: "We're building a platform for African creators using Web Monetization"
- Request: Performance photo permission + artist bio
- Offer: Featured exhibit on MVP launch

### **Other Creators**
- Search African art communities
- Contact through galleries or artist associations
- Offer: Revenue-sharing model + platform exposure

---

## 🎯 Success Metrics

By end of Phase 3, we should have:
- ✅ 10 unique, curated exhibits with compelling images
- ✅ All images optimized for low-bandwidth
- ✅ Kokari Walker featured prominently with high-quality photography
- ✅ Cultural context accurate and researched
- ✅ Images load in <2 seconds on 3G
- ✅ No copyright issues or missing attributions

---

## 📚 Reference: Museum APIs with Public Collections

These institutions offer free, documented APIs for accessing cultural images:

1. **Rijksmuseum API** (Dutch museum, African collection)
2. **Cooper Hewitt API** (Design & craft objects)
3. **Cleveland Museum of Art API** (African art collection)
4. **Art Institute of Chicago API** (African artifacts)

All offer CC0 or public domain images.

---

## Questions?

- **"Can I use any image from Google Images?"** → NO. Must verify license.
- **"What if I can't find a specific cultural artifact?"** → Use similar/related image. Document the substitution.
- **"How do I credit an image?"** → Include artist/photographer name + source URL in metadata.
- **"What format should I use?"** → JPG for photos, PNG for graphics, WebP for modern browsers (with JPG fallback).

---

**Next Step**: Form image curation team and begin Week 1 research.  
**Questions**: Review this guide → Check museum APIs → Ask product team.
