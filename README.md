# 🎨 KulturaMind - Interactive Cultural Heritage Platform

> A beautifully redesigned, modern web application for exploring African cultural artifacts with AI-powered storytelling.

## ✨ Latest Updates (v2.1)

**Status**: ✅ **PRODUCTION READY**

### Recent Changes
- ✅ Complete UI redesign with modern dark mode
- ✅ Fixed all bugs (map color switching, artifact display)
- ✅ Added 3D mind map visualization
- ✅ Added "Click to explore" guidance
- ✅ Removed UI clutter
- ✅ Enhanced empty state with interactive elements

### Key Features
- 🌙 Complete dark mode support
- 📖 Story-focused interface
- 🔗 3D mind map visualization
- 🗺️ Interactive artifact map
- 💬 AI Heritage Keeper chat
- ✨ Professional design
- 📱 Fully responsive

## Project Overview

**Goal:** Build a working MVP for the BGI25 Hackathon that demonstrates:
- Real MeTTa knowledge graph with cultural predicates
- Fetch.ai agent with RAG (Retrieval-Augmented Generation)
- Beautiful, modern web interface
- Verified cultural data from UNESCO and archives

**Focus:** 3 Nigerian cultures (Yoruba, Igbo, Hausa) with 19+ cultural items

## Project Structure

```
KulturaMind/
├── backend/
│   ├── cultural_data.json          # Knowledge base with cultural items
│   ├── cultural_knowledge_base.metta # MeTTa predicates (reference)
│   ├── metta_kb.py                 # Knowledge base manager
│   ├── agent.py                    # Fetch.ai agent implementation
│   ├── api.py                      # FastAPI backend
│   ├── requirements.txt            # Python dependencies
│   └── test_metta.py              # MeTTa tests
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.tsx
│   └── package.json
├── venv/                           # Python virtual environment
├── Tools.md                        # ASI Stack documentation
└── README.md                       # This file
```

## 📚 Documentation

### Quick Start
- **[START_HERE.md](./START_HERE.md)** - Quick start guide
- **[FINAL_STATUS.md](./FINAL_STATUS.md)** - Current project status
- **[LATEST_UPDATES.md](./LATEST_UPDATES.md)** - Recent changes & new features

### Detailed Guides
- **[REDESIGN_README.md](./REDESIGN_README.md)** - Complete overview
- **[REDESIGN_FEATURES.md](./REDESIGN_FEATURES.md)** - Feature documentation
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick reference

### Technical
- **[REDESIGN_IMPLEMENTATION_GUIDE.md](./REDESIGN_IMPLEMENTATION_GUIDE.md)** - Technical details
- **[CHANGES_MADE.md](./CHANGES_MADE.md)** - All code changes
- **[BUG_FIX_REPORT.md](./BUG_FIX_REPORT.md)** - Bug fixes

### Deployment
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Production deployment
- **[VERIFICATION_REPORT.md](./VERIFICATION_REPORT.md)** - QA report

---

## 🚀 Quick Start (Integrated)

### One-Command Startup

**Linux/Mac:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

**Windows:**
```bash
start-dev.bat
```

This will start both backend and frontend automatically!

---

## Setup Instructions

### 1. Backend Setup

```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Test MeTTa installation
python backend/test_metta.py

# Test knowledge base
python backend/metta_kb.py
```

### 2. Knowledge Base

The knowledge base contains:
- **3 Cultures:** Yoruba, Igbo, Hausa
- **4 Festivals:** Sango, Osun-Osogbo, Iri-Ji, Durbar
- **5 Art Forms:** Adire, Beadwork, Mbari, Uli, Hausa Textiles
- **4 Traditions:** Masquerades, Naming Ceremonies, Bride Price
- **3 Languages:** Yoruba, Igbo, Hausa
- **4 Proverbs:** Traditional wisdom sayings

### 3. Fetch.ai Agentverse Setup

1. Create account at https://agentverse.ai/
2. Create a new agent in the dashboard
3. Configure agent with RAG integration
4. Deploy to Agentverse

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Technology Stack

- **MeTTa:** Knowledge graph and reasoning
- **Fetch.ai Agentverse:** Agent hosting and deployment
- **FastAPI:** Backend API
- **React + Vite:** Frontend
- **Pydantic:** Data validation

## API Endpoints

### Knowledge Base Queries

```
GET /api/cultures              # Get all cultures
GET /api/cultures/{id}         # Get culture details
GET /api/festivals?culture=    # Get festivals by culture
GET /api/art-forms?culture=    # Get art forms by culture
GET /api/traditions?culture=   # Get traditions by culture
GET /api/search?q=             # Search by keyword
```

### Chat Interface

```
POST /api/chat                 # Send message to agent
GET /api/chat/history          # Get chat history
```

## Running the Application

### Terminal 1: Backend API
```bash
source venv/bin/activate
python backend/api.py
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

Visit http://localhost:5173 to access the chat interface.

## Development Roadmap

- [x] Phase 1: Environment Setup & Data Collection
  - [x] MeTTa environment setup
  - [x] Knowledge base schema design
  - [x] Cultural data collection
- [ ] Phase 2: Knowledge Graph Implementation
  - [ ] MeTTa predicates implementation
  - [ ] RAG integration
- [ ] Phase 3: Fetch.ai Agent Development
  - [ ] Agent creation in Agentverse
  - [ ] Agent-backend integration
- [ ] Phase 4: Frontend & Integration
  - [ ] React chat UI
  - [ ] End-to-end integration
- [ ] Phase 5: Testing & Demo Preparation
  - [ ] Unit tests
  - [ ] Integration tests
  - [ ] Demo preparation

## Key Features

1. **Verified Cultural Data:** All information sourced from UNESCO and cultural archives
2. **Real MeTTa Integration:** Actual knowledge graph, not mocks
3. **RAG-Powered Responses:** Responses grounded in knowledge base
4. **Multi-Culture Support:** Yoruba, Igbo, Hausa cultures
5. **Interactive Chat:** User-friendly web interface

## Testing

```bash
# Test MeTTa
python backend/test_metta.py

# Test knowledge base
python backend/metta_kb.py

# Run pytest
pytest backend/
```

## 🔗 Frontend-Backend Integration

The application now features **full frontend-backend integration**:

### Architecture
- **Frontend**: React + TypeScript + Vite (Interactive UI with Mapbox)
- **Backend**: FastAPI + Python (Real AI Stack with ASI:One + MeTTa)
- **Communication**: REST API with proper error handling

### Key Features
✅ Real-time API communication
✅ Semantic search with ASI:One embeddings
✅ Knowledge graph reasoning with MeTTa
✅ Intelligent response generation
✅ Error handling and connection status
✅ Environment-based configuration

### Running the Integrated App

**Automatic (Recommended):**
```bash
# Linux/Mac
./start-dev.sh

# Windows
start-dev.bat
```

**Manual:**
```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
python api.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### API Endpoints
- `GET /health` - Health check
- `GET /api/info` - System information
- `POST /api/search` - Semantic search
- `POST /api/query` - Intelligent query with RAG

### Documentation
- **Integration Guide**: See `FRONTEND_BACKEND_INTEGRATION.md`
- **Testing Guide**: See `TESTING_GUIDE.md`

## References

- MeTTa: https://metta-lang.dev/
- Fetch.ai Agentverse: https://docs.agentverse.ai/home
- ASI Alliance: https://docs.asi1.ai/
- BGI25 Hackathon: https://bgihackathon.com/

## Team

Built for BGI25 Hackathon - Connecting the Dots: ASI + Agentverse

## License

MIT

