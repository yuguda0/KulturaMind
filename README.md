# KulturaMind - Interactive Cultural Heritage Platform

A modern web application for exploring African cultural artifacts with AI-powered storytelling and semantic search capabilities. KulturaMind combines a production-grade AI stack with an intuitive user interface to provide intelligent access to verified cultural heritage information.

## Overview

KulturaMind is an intelligent cultural heritage platform that leverages advanced AI technologies to provide semantic search, knowledge graph reasoning, and context-aware responses about African cultures. The platform covers diverse African cultures across the continent including West African cultures (Yoruba, Igbo, Hausa, Edo, Fulani, Ijaw, Kanuri, Tiv, Efik, Ibibio, Akan), East African cultures (Maasai, Amhara), Southern African cultures (Zulu, Xhosa), and North African cultures (Berber). Each culture includes verified data on festivals, art forms, traditions, languages, and proverbs.

### Status

Production-ready MVP with full frontend-backend integration, real AI stack implementation, and comprehensive cultural knowledge base.

### Key Capabilities

- Semantic search with ASI:One embeddings
- Knowledge graph reasoning with MeTTa
- Intelligent response generation with ASI:One LLM
- Interactive artifact exploration with Mapbox integration
- Real-time chat interface with Heritage Keeper agent
- Web enrichment for cultural data
- Responsive dark mode interface

## Project Structure

```
KulturaMind/
├── backend/
│   ├── api.py                      # FastAPI REST API server
│   ├── agent.py                    # Fetch.ai uAgent implementation
│   ├── rag_pipeline.py             # RAG pipeline orchestration
│   ├── llm_engine.py               # ASI:One LLM integration
│   ├── metta_reasoning.py          # MeTTa knowledge graph reasoning
│   ├── vector_db.py                # Qdrant vector database client
│   ├── web_agent.py                # Web enrichment agent
│   ├── cultural_data.json          # Cultural knowledge base
│   ├── cultural_knowledge_base.metta # MeTTa predicates reference
│   ├── requirements.txt            # Python dependencies
│   └── wsgi.py                     # WSGI configuration
├── frontend/
│   ├── src/
│   │   ├── components/             # React components
│   │   ├── pages/                  # Page components
│   │   ├── services/               # API client services
│   │   └── App.tsx                 # Main application
│   ├── package.json                # Node dependencies
│   ├── vite.config.ts              # Vite configuration
│   └── tailwind.config.ts          # Tailwind CSS configuration
└── README.md                       # This file
```

## Technology Stack

### Backend
- **FastAPI**: REST API framework with async support
- **ASI:One**: LLM for intelligent response generation
- **MeTTa**: Knowledge graph and reasoning engine
- **Qdrant**: Vector database for semantic search
- **Fetch.ai uAgents**: Agent framework for autonomous operations
- **Pydantic**: Data validation and serialization

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type-safe development
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Mapbox GL**: Interactive map visualization
- **Radix UI**: Accessible component library
- **React Query**: Server state management

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn package manager

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Configure environment variables in `.env`:
```
ASI_ONE_API_KEY=your_api_key
ASI_ONE_BASE_URL=https://api.asi.one
QDRANT_URL=http://localhost:6333
```

Start the backend server:
```bash
python api.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Running Both Services

Use the provided startup scripts:

**Linux/Mac:**
```bash
./start-dev.sh
```

**Windows:**
```bash
start-dev.bat
```

## API Endpoints

### Cultural Data Queries

- `GET /api/cultures` - List all cultures
- `GET /api/cultures/{id}` - Get culture details
- `GET /api/festivals?culture=` - Get festivals by culture
- `GET /api/art-forms?culture=` - Get art forms by culture
- `GET /api/traditions?culture=` - Get traditions by culture
- `GET /api/search?q=` - Semantic search across knowledge base

### Chat Interface

- `POST /api/chat` - Send message to Heritage Keeper agent
- `GET /api/chat/history` - Retrieve chat history
- `POST /api/chat/stream` - Stream responses in real-time

## Knowledge Base

The platform includes comprehensive verified cultural data for 16+ African cultures:

**West African Cultures**: Yoruba, Igbo, Hausa, Edo, Fulani, Ijaw, Kanuri, Tiv, Efik, Ibibio, Akan

**East African Cultures**: Maasai, Amhara

**Southern African Cultures**: Zulu, Xhosa

**North African Cultures**: Berber

**Content Categories** (for each culture):
- Festivals and celebrations
- Art forms and crafts
- Traditions and customs
- Languages and communication
- Proverbs and wisdom

**Data Coverage**: 50+ festivals, 30+ art forms, 40+ traditions, 16+ languages, 40+ proverbs

**Data Sources**: UNESCO archives, cultural institutions, verified heritage databases, academic research

## Architecture

### RAG Pipeline

The Retrieval-Augmented Generation pipeline combines:

1. **Vector Search**: Semantic retrieval using ASI:One embeddings (top_k=10 for comprehensive context)
2. **Semantic Filtering**: LLM-based relevance filtering
3. **Knowledge Graph Reasoning**: MeTTa inference for relationship discovery
4. **Web Enrichment**: Mandatory Wikipedia and web source integration for enriched responses
5. **Response Generation**: ASI:One LLM generates contextual responses (max_tokens=800 for detailed answers)

**Response Quality Improvements**:
- Increased context window (top_k=10) for more comprehensive information retrieval
- Mandatory web enrichment ensures responses are grounded in verified sources
- Enhanced system prompt ensures informative responses without "I don't know" fallbacks
- Larger token budget (800 tokens) enables detailed, nuanced explanations

### Agent Architecture

The Fetch.ai uAgent provides:
- Autonomous query processing
- Distributed reasoning capabilities
- Integration with external data sources
- Scalable multi-agent coordination

## Development

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Specific test file
pytest test_asi_one_stack.py
```

### Code Quality

```bash
# Linting (frontend)
cd frontend
npm run lint

# Type checking
npm run build
```

## Deployment

### Backend Deployment

The backend is configured for deployment on PythonAnywhere:

```bash
cd backend
bash pythonanywhere_setup.sh
```

### Frontend Deployment

Deploy to Vercel:

```bash
cd frontend
npm run build
vercel deploy
```

## Configuration

### Environment Variables

**Backend (.env)**:
- `ASI_ONE_API_KEY`: API key for ASI:One LLM
- `ASI_ONE_BASE_URL`: Base URL for ASI:One API
- `QDRANT_URL`: Qdrant vector database URL
- `QDRANT_API_KEY`: Qdrant API key (if required)

**Frontend (.env.local)**:
- `VITE_API_URL`: Backend API base URL
- `VITE_MAPBOX_TOKEN`: Mapbox GL access token

## Performance Optimization

- Semantic search with vector embeddings for fast retrieval
- Response caching for frequently asked queries
- Streaming responses for real-time chat
- Lazy loading of cultural artifacts
- CDN delivery for static assets

## Security

- CORS middleware for cross-origin requests
- Input validation with Pydantic
- Environment-based configuration management
- Secure API key handling
- Rate limiting on API endpoints

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

This project is part of the BGI25 Hackathon initiative.

## Support

For issues, questions, or contributions, please open an issue on the repository.
