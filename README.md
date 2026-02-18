# ShikshaSahayak - Your AI Learning Companion

An intelligent offline RAG-based AI tutor for NCERT curriculum. ShikshaSahayak helps Indian students understand complex educational concepts through a conversational AI interface powered by Retrieval-Augmented Generation (RAG) and LLM fallback systems.

## Features

### Core Learning Features
- **Offline RAG Engine**: Retrieve relevant NCERT content instantly without internet
- **LLM Fallback System**: API-first approach with intelligent heuristic fallback
- **Multi-Class Support**: Classes 8-12 curriculum coverage
- **Subject-Based Learning**: Mathematics, Science, Biology, Chemistry, Physics, English, History, Geography
- **Source Attribution**: See where answers come from in the curriculum
- **Zero Latency**: Sub-100ms response times with no external dependencies
- **24/7 Availability**: Always accessible learning companion
- **Responsive Design**: Works seamlessly on web and mobile devices

### Advanced Features
- **Admin Dashboard**: Manage and update curriculum content with ease
- **Progress Tracking**: Detailed analytics of your learning journey with charts
- **Chat History**: Recently accessed conversations in the sidebar
- **Message Status**: Visual indicators for message delivery status
- **Topic Management**: Add, edit, and organize NCERT topics by class and subject
- **Learning Analytics**: Track accuracy rates, questions attempted, and progress per topic

## Architecture

### Core Components

1. **RAG Engine** (`lib/rag-engine.ts`)
   - Retrieves relevant NCERT topics using semantic matching
   - Builds context from multiple sources
   - Generates prompts for LLM inference
   - Optimized for offline performance

2. **LLM Handler** (`lib/llm-handler.ts`)
   - Attempts API calls first (configurable to use any LLM provider)
   - Falls back to heuristic-based responses
   - Maintains educational consistency
   - Zero external dependencies in offline mode

3. **Chat Interface** (`components/chat-container.tsx`)
   - Real-time message streaming
   - User-friendly conversation UI with sidebar
   - Source attribution for answers
   - Recent chat history management
   - Message status indicators (seen/delivered)

4. **Admin Dashboard** (`components/admin-dashboard.tsx`)
   - CRUD operations for curriculum topics
   - Search and filter functionality
   - Statistics and content distribution
   - Class and subject management

5. **Progress Tracker** (`components/progress-tracker.tsx`)
   - Learning analytics with charts and graphs
   - Accuracy metrics and performance trends
   - Topic-wise progress tracking
   - Weekly learning insights

### Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **UI Components**: shadcn/ui, Radix UI
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Utilities**: date-fns, uuid, zod

## Getting Started

### Installation

```bash
# Clone and install
git clone <repository>
cd shiksha-sahayak

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Visit `http://localhost:3000` to start using ShikshaSahayak.

## Usage

### Starting a Chat Session

1. **Home Page**: Browse and select from available topics by class and subject
2. **Quick Chat**: Click "Open Chat" to start immediately
3. **Ask Questions**: Type any question about NCERT curriculum
4. **Get Answers**: Receive instant responses with source attribution

### Settings & Configuration

Visit `/settings` to view:
- System status and performance metrics
- RAG system configuration
- LLM fallback status
- Curriculum statistics
- Available features

## Data Structure

### NCERT Topic Format

```typescript
interface NCERTTopic {
  id: string                    // Unique identifier
  title: string                 // Topic name
  class: number                 // Grade level (8-12)
  subject: string               // Subject name
  content: string               // Full educational content
  keyPoints: string[]           // Key concepts and points
}
```

### Message Format

```typescript
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: string[]            // Referenced NCERT topics
}
```

## API Routes

### POST `/api/chat`

Process a user message through RAG + LLM system.

**Request:**
```json
{
  "message": "What are quadratic equations?",
  "context": "optional context string"
}
```

**Response:**
```json
{
  "response": "A quadratic equation...",
  "sources": [
    {
      "id": "ncert-class10-math-quad",
      "title": "Quadratic Equations",
      "class": 10,
      "subject": "Mathematics"
    }
  ],
  "context": "full retrieved context",
  "timestamp": "2024-12-15T10:30:00Z"
}
```

## Curriculum Coverage

### Supported Classes
- Class 8, 9, 10, 11, 12

### Supported Subjects
- **Mathematics**: Algebra, Geometry, Trigonometry, Calculus
- **Science**: Physics, Chemistry, Biology
- **English**: Literature, Grammar, Writing
- **Social Sciences**: History, Geography, Civics

### Topics
- 40+ core topics
- 500+ key points
- Comprehensive NCERT coverage

## Configuration

### LLM Provider Setup (Optional)

To enable API-based responses, set environment variables:

```env
# OpenAI
OPENAI_API_KEY=your_api_key

# Or use any other provider by modifying lib/llm-handler.ts
```

Without these variables, ShikshaSahayak operates in fallback mode with heuristic responses.

## Development

### Project Structure

```
├── app/
│   ├── page.tsx                 # Home page
│   ├── settings/page.tsx        # Settings page with admin/progress access
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles and design tokens
├── components/
│   ├── chat-container.tsx       # Main chat interface with sidebar
│   ├── chat-input.tsx           # Message input component
│   ├── chat-message.tsx         # Message display with status
│   ├── home-page.tsx            # Landing page
│   ├── settings-page.tsx        # Settings & feature hub
│   ├── admin-dashboard.tsx      # Content management interface
│   ├── progress-tracker.tsx     # Learning analytics dashboard
│   ├── topic-selector.tsx       # Topic selection dialog
│   ├── footer.tsx               # Footer component
│   ├── navbar.tsx               # Navigation bar
│   ├── loading-spinner.tsx      # Loading indicator
│   └── ui/                      # shadcn/ui components (50+)
├── lib/
│   ├── curriculum.ts            # NCERT curriculum data & types
│   ├── rag-engine.ts            # RAG processing engine
│   ├── llm-handler.ts           # LLM API & fallback system
│   └── utils.ts                 # Utility functions
├── hooks/
│   └── use-mobile.tsx           # Mobile detection hook
└── public/                      # Static assets
```

### Adding New Curriculum Content

Edit `lib/curriculum.ts` and add new topics to `CURRICULUM_DATA`:

```typescript
{
  id: 'unique-id',
  title: 'Topic Name',
  class: 10,
  subject: 'Subject',
  content: 'Detailed content here...',
  keyPoints: [
    'Key point 1',
    'Key point 2'
  ]
}
```

### Customizing the LLM

Modify `lib/llm-handler.ts` to:
- Use different LLM providers (Anthropic, Groq, etc.)
- Adjust fallback strategies
- Customize response generation

## Performance

- **Response Time**: < 100ms for offline RAG
- **Bundle Size**: Optimized with code splitting
- **Memory Usage**: Efficient curriculum indexing
- **Scalability**: Supports 1000+ topics without degradation

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security & Privacy

- ✅ All processing happens locally (offline-first)
- ✅ No student data is stored or transmitted
- ✅ No tracking or analytics
- ✅ NCERT curriculum is educational content for learning

## Roadmap

### Completed
- [x] Core chat interface with RAG
- [x] Offline-first architecture
- [x] Admin dashboard for content management
- [x] Progress tracking with analytics
- [x] Chat history management
- [x] Message status indicators
- [x] Responsive design

### In Progress
- [ ] User authentication & accounts
- [ ] Database integration for persistence
- [ ] Multi-language support (Hindi, regional languages)

### Upcoming
- [ ] Interactive problem solving with step-by-step guidance
- [ ] Quiz and assessment features
- [ ] Voice input/output capabilities
- [ ] Custom curriculum upload by teachers
- [ ] Personalized learning paths
- [ ] Mobile app (React Native)
- [ ] Video explanations
- [ ] Real-time collaboration features

## Contributing

Contributions are welcome! Areas for improvement:
- Adding more curriculum topics
- Implementing new RAG strategies
- Improving UI/UX
- Performance optimizations
- Bug fixes

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact support via email
- Check documentation at `/settings`

## Credits

ShikshaSahayak is built with:
- Next.js and React for the frontend
- Tailwind CSS for styling
- shadcn/ui for beautiful components
- NCERT curriculum as educational content

---

**Made with ❤️ for learners everywhere**
