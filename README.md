# 🌍 KulturaMind - Decentralized AGI for African Cultural Heritage

> **Preserving African Heritage Through Decentralized Artificial General Intelligence**

[![BGI25 Hackathon](https://img.shields.io/badge/BGI25-Hackathon-purple)](https://bgi25.ai)
[![ASI Cloud](https://img.shields.io/badge/ASI-Cloud%20Compute-blue)](https://asi.cloud)
[![Fetch.AI](https://img.shields.io/badge/Fetch.AI-Agentverse-green)](https://fetch.ai)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 📖 Overview

**KulturaMind** is a groundbreaking decentralized AGI platform that preserves and shares African cultural heritage through:

- 🤖 **Multi-Agent System**: 5 specialized AI agents working collaboratively
- 🌐 **Decentralized Architecture**: Deployed on Fetch.AI Agentverse
- 🧠 **Knowledge Graph**: MeTTa-powered reasoning over cultural data
- 🗣️ **Multilingual Support**: 8 African languages supported
- 👥 **Community-Driven**: Token-incentivized contributions and expert validation
- 📱 **Mobile-First**: Accessible design for global south users
- 🎤 **Voice Interface**: Support for low-literacy communities

---

## 🎯 BGI25 Hackathon Theme Alignment

**Theme**: *"AGI + Cultural Memory - Decentralized AGI for All"*

### How KulturaMind Addresses the Theme:

#### 1. **Decentralized AGI** ✅
- Multi-agent system with 5 specialized agents
- Deployed on Fetch.AI Agentverse for global accessibility
- Inter-agent communication protocols
- Community governance through smart contracts

#### 2. **Cultural Memory Preservation** ✅
- 16+ African cultures documented
- 160+ verified cultural items
- MeTTa knowledge graph for cultural reasoning
- UNESCO-sourced data with expert validation

#### 3. **AGI for All** ✅
- Multilingual support (8 languages)
- Mobile-first design for accessibility
- Voice interface for low-literacy users
- Free and open access
- Token incentives for community contributions

#### 4. **ASI Cloud Compute** ✅
- Google Gemma 27B model integration
- Production-grade AI stack
- Real-time semantic search
- RAG pipeline for accurate responses

---

## 🏗️ Architecture

### **Multi-Agent System**

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    Coordinator Agent                         │
│                      (Port 8000)                             │
│              Multi-agent orchestration                       │
└──────────────┬──────────────────────────────────────────────┘
               │
       ┌───────┴───────┬───────────┬───────────┬──────────┐
       │               │           │           │          │
┌──────▼──────┐ ┌─────▼─────┐ ┌──▼────┐ ┌────▼────┐ ┌──▼──────┐
│  Heritage   │ │ Research  │ │Verify │ │Translate│ │Community│
│   Keeper    │ │   Agent   │ │ Agent │ │ Agent   │ │ System  │
│ (Port 8001) │ │(Port 8002)│ │(8003) │ │ (8004)  │ │         │
│             │ │           │ │       │ │         │ │         │
│ Knowledge   │ │    Web    │ │ Fact  │ │   8     │ │  Token  │
│   Base      │ │Enrichment │ │Check  │ │Languages│ │Incentive│
└─────────────┘ └───────────┘ └───────┘ └─────────┘ └─────────┘
\`\`\`

### **Technology Stack**

#### **Backend**
- **Framework**: FastAPI (Python 3.10+)
- **LLM**: ASI Cloud Compute (Google Gemma 27B)
- **Vector DB**: Qdrant (semantic search)
- **Knowledge Graph**: MeTTa (reasoning engine)
- **Multi-Agent**: Fetch.AI uAgents
- **Web Enrichment**: Wikipedia API + BeautifulSoup

#### **Frontend**
- **Framework**: React + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **3D Visualization**: Canvas API
- **State Management**: React Hooks

#### **Blockchain**
- **Network**: Fetch.AI Mainnet
- **Token**: FET (for rewards)
- **Smart Contracts**: CosmWasm

---

## 🚀 Quick Start

### **Prerequisites**
- Python 3.10+
- Node.js 18+
- Git

### **1. Clone Repository**
\`\`\`bash
git clone https://github.com/yourusername/KulturaMind.git
cd KulturaMind
\`\`\`

### **2. Backend Setup**
\`\`\`bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your ASI Cloud API key

# Start backend
python3 api.py
\`\`\`

Backend will run on \`http://localhost:8000\`

### **3. Frontend Setup**
\`\`\`bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

Frontend will run on \`http://localhost:8081\`

### **4. Access Application**
Open your browser to \`http://localhost:8081\`

---

## 🌟 Key Features

### **1. Multi-Agent Collaboration**
- **Coordinator**: Routes queries to appropriate agents
- **Heritage Keeper**: Queries cultural knowledge base
- **Research Agent**: Enriches with web data
- **Verification Agent**: Fact-checks information
- **Translation Agent**: Supports 8 languages

### **2. Community Contribution System**
- Submit new cultural artifacts
- Expert validation workflow
- Token rewards for contributions
- Decentralized knowledge curation

### **3. Impact Metrics**
- Cultures preserved count
- Queries answered
- Community engagement metrics
- Knowledge graph growth
- Global south reach tracking

### **4. Accessibility**
- **Mobile-First**: Responsive design for all devices
- **Voice Interface**: Speech-to-text for queries
- **Multilingual**: English, French, Swahili, Hausa, Yoruba, Igbo, Zulu, Amharic
- **Low-Literacy Support**: Visual and audio cues

---

## 📊 API Endpoints

### **Chat & Query**
- \`POST /api/chat\` - Send chat message
- \`POST /api/chat/multi-agent\` - Multi-agent query processing
- \`POST /api/chat/stream\` - Streaming chat response

### **Multi-Agent System**
- \`GET /api/agents\` - Get agent information
- \`GET /api/languages\` - Get supported languages

### **Community Contributions**
- \`POST /api/community/contribute\` - Submit contribution
- \`POST /api/community/register-expert\` - Register as expert
- \`POST /api/community/review\` - Submit expert review
- \`GET /api/community/pending\` - Get pending contributions
- \`GET /api/community/stats\` - Get contribution statistics

### **Metrics & Impact**
- \`GET /api/metrics\` - Get usage metrics
- \`GET /api/metrics/impact\` - Get impact summary

### **Health**
- \`GET /health\` - Health check

---

## 🎨 Supported Cultures

- **West Africa**: Yoruba, Igbo, Hausa, Edo, Fulani, Ijaw, Kanuri, Tiv, Efik, Ibibio, Akan
- **East Africa**: Maasai
- **North Africa**: Berber
- **Southern Africa**: Zulu, Xhosa
- **Horn of Africa**: Amhara

---

## 🗣️ Supported Languages

1. **English** (en)
2. **French** (fr)
3. **Swahili** (sw)
4. **Hausa** (ha)
5. **Yoruba** (yo)
6. **Igbo** (ig)
7. **Zulu** (zu)
8. **Amharic** (am)

---

## 💰 Token Economics

### **Contribution Rewards** (FET Tokens)
- New Artifact: **100 FET**
- Artifact Update: **50 FET**
- Cultural Context: **75 FET**
- Translation: **60 FET**
- Verification: **40 FET**
- Expert Review: **80 FET**

### **How to Earn**
1. Connect Fetch.AI wallet
2. Submit cultural contributions
3. Get expert validation
4. Receive FET token rewards

---

## 🌐 Agentverse Deployment

Deploy to Fetch.AI Agentverse for global accessibility:

\`\`\`bash
# See detailed guide
cat AGENTVERSE_INTEGRATION_GUIDE.md

# Quick deploy
cd backend
python3 deploy_to_agentverse.py
\`\`\`

**Benefits**:
- Global agent discovery
- Decentralized hosting
- Inter-agent communication
- Community governance
- Token integration

---

## 📈 Impact Metrics

### **Cultural Preservation**
- 16+ cultures preserved
- 160+ cultural items documented
- 50+ MeTTa reasoning predicates
- Growing through community contributions

### **Community Impact**
- Queries answered: Real-time tracking
- Countries reached: Global south focus
- Languages supported: 8 African languages
- Expert validators: Community-driven

### **AGI Capabilities**
- 5 specialized agents
- Decentralized architecture
- Multi-agent collaboration
- Knowledge graph reasoning

---

## 🤝 Contributing

We welcome contributions from the community!

### **Ways to Contribute**
1. **Cultural Content**: Submit artifacts, traditions, stories
2. **Expert Validation**: Review and validate contributions
3. **Translations**: Add support for more languages
4. **Code**: Improve agents, UI, or infrastructure
5. **Documentation**: Enhance guides and tutorials

---

## 📚 Documentation

- **[BGI25 Implementation Complete](BGI25_IMPLEMENTATION_COMPLETE.md)** - Full implementation details
- **[Agentverse Integration Guide](AGENTVERSE_INTEGRATION_GUIDE.md)** - Deploy to Agentverse
- **[Frontend UX Fixes](FRONTEND_UX_FIXES.md)** - UI/UX improvements
- **[API Documentation](http://localhost:8000/docs)** - Interactive API docs

---

## 🏆 Hackathon Highlights

1. **Real Implementation**: No mocks, production-grade code
2. **Decentralized AGI**: Multi-agent system on Agentverse
3. **Cultural Impact**: Preserving 16+ African cultures
4. **Community-Driven**: Token incentives for contributions
5. **Accessibility**: Mobile-first, voice interface, 8 languages
6. **Measurable Impact**: Comprehensive metrics tracking
7. **Hackathon Compliance**: Uses required ASI Cloud Compute

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **BGI25 Hackathon** - For the opportunity to build beneficial AGI
- **Fetch.AI** - For the Agentverse platform and uAgents framework
- **ASI Cloud** - For providing compute infrastructure
- **UNESCO** - For cultural heritage data
- **African Communities** - For preserving and sharing their heritage

---

**Built with ❤️ for African Cultural Heritage Preservation**

*Empowering communities through decentralized AGI*
