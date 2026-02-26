import { CURRICULUM_DATA, searchCurriculum, type NCERTTopic } from './curriculum'

/** Result of processing a query through the RAG pipeline */
export interface RAGResult {
  context: string
  sources: NCERTTopic[]
  prompt: string
}

/** Related terms for better retrieval (e.g. "xylem" → topic about transport in plants) */
const RELATED_TERMS: Record<string, string[]> = {
  xylem: ['xylem', 'phloem', 'transport', 'water', 'minerals', 'vascular', 'plants'],
  phloem: ['phloem', 'xylem', 'transport', 'nutrients', 'sugar', 'vascular', 'plants'],
  'transport in plants': ['xylem', 'phloem', 'transport', 'water', 'vascular'],
  quadratic: ['quadratic', 'equation', 'discriminant', 'roots', 'factorization'],
  photosynthesis: ['photosynthesis', 'chloroplast', 'glucose', 'oxygen', 'light', 'calvin'],
  'french revolution': ['french', 'revolution', 'bastille', 'napoleon', 'monarchy'],
  climate: ['climate', 'weather', 'latitude', 'altitude', 'atmosphere'],
  poetry: ['poetry', 'poem', 'stanza', 'metaphor', 'frost', 'road not taken'],
  refraction: ['refraction', 'light', 'snell', 'lens', 'refractive index'],
  light: ['refraction', 'light', 'lens', 'refractive', 'angle'],
}

/**
 * Simple RAG (Retrieval-Augmented Generation) engine
 * Retrieves relevant NCERT content based on user query
 * Then formats context for LLM to generate response
 */
export class RAGEngine {
  private curriculum: NCERTTopic[] = CURRICULUM_DATA

  /**
   * Retrieve relevant documents. Filter by class and subject for one-subject-one-chapter accuracy.
   */
  retrieveRelevantDocuments(
    query: string,
    limit: number = 5,
    classFilter?: number,
    subjectFilter?: string
  ): NCERTTopic[] {
    let pool = this.curriculum
    if (classFilter != null) pool = pool.filter((t) => t.class === classFilter)
    if (subjectFilter != null && subjectFilter.trim() !== '')
      pool = pool.filter((t) => t.subject === subjectFilter)

    const results = pool.map((topic) => ({
      topic,
      score: this.calculateRelevance(query, topic),
    }))

    const sorted = results
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((r) => r.topic)

    if (sorted.length === 0 && pool.length > 0) {
      return pool.slice(0, 2)
    }
    if (sorted.length === 0 && this.curriculum.length > 0 && (classFilter != null || subjectFilter != null)) {
      return this.curriculum.filter((t) => {
        if (classFilter != null && t.class !== classFilter) return false
        if (subjectFilter != null && subjectFilter.trim() !== '' && t.subject !== subjectFilter) return false
        return true
      }).slice(0, 2)
    }
    return sorted
  }

  /**
   * Calculate relevance score between query and topic
   */
  private calculateRelevance(query: string, topic: NCERTTopic): number {
    const queryLower = query.toLowerCase().trim()
    // Filter out common question words for better matching
    const stopWords = ['what', 'is', 'are', 'the', 'a', 'an', 'how', 'why', 'when', 'where', 'which', 'tell', 'me', 'about', 'explain', 'define']
    const queryWords = queryLower
      .split(/\s+/)
      .filter((w) => w.length > 1 && !stopWords.includes(w))
    let score = 0

    const titleLower = topic.title.toLowerCase()
    const contentLower = topic.content.toLowerCase()
    const keyPointsText = topic.keyPoints.join(' ').toLowerCase()
    const topicText = (topic.title + ' ' + topic.content + ' ' + topic.keyPoints.join(' ')).toLowerCase()

    // Exact title match (highest weight)
    if (titleLower === queryLower) score += 100
    else if (titleLower.includes(queryLower)) score += 50

    // Check for meaningful words in query (after filtering)
    const cleanQuery = queryWords.join(' ')
    if (cleanQuery.length > 0) {
      if (titleLower.includes(cleanQuery)) score += 80
      if (contentLower.includes(cleanQuery)) score += 40
      if (keyPointsText.includes(cleanQuery)) score += 35
    }

    // Title word matches (high priority)
    for (const word of queryWords) {
      if (word.length > 2) {
        if (titleLower.includes(word)) score += 25
      }
    }

    // Content and key points: word matches
    for (const word of queryWords) {
      if (word.length <= 2) continue
      if (contentLower.includes(word)) score += 12
      if (topic.keyPoints.some((kp) => kp.toLowerCase().includes(word))) score += 15
    }

    // Related-term boost: if query mentions known terms, boost relevant topics
    for (const [term, related] of Object.entries(RELATED_TERMS)) {
      if (!queryLower.includes(term)) continue
      const matchCount = related.filter((r) => topicText.includes(r)).length
      if (matchCount > 0) score += 30 + matchCount * 10
    }

    // Word frequency in content (cap per word)
    const contentWords = contentLower.split(/\s+/)
    for (const word of queryWords) {
      if (word.length > 3) {
        const occurrences = contentWords.filter((w) => w.includes(word)).length
        score += Math.min(occurrences, 5) * 3
      }
    }

    return score
  }
  
  /**
   * Build context from retrieved documents for the LLM
   */
  buildContext(documents: NCERTTopic[]): string {
    if (documents.length === 0) {
      return 'No relevant educational content found in curriculum database.'
    }
    
    const contextParts = documents.map((doc, index) => {
      return `
Document ${index + 1}: ${doc.title} (Class ${doc.class}, ${doc.subject})
---
${doc.content}

Key Points:
${doc.keyPoints.map(point => `• ${point}`).join('\n')}
---`
    })
    
    return contextParts.join('\n\n')
  }
  
  /**
   * Generate a prompt for the LLM with context
   */
  generatePrompt(userQuery: string, documents: NCERTTopic[]): string {
    const context = this.buildContext(documents)
    
    return `You are ShikshaSahayak, an expert educational tutor helping Indian students understand NCERT curriculum.

Educational Context:
${context}

Student Question: ${userQuery}

Guidelines for your response:
1. Answer based on the provided educational material
2. Use simple, clear language appropriate for students
3. Break complex concepts into smaller parts
4. Use examples and analogies when helpful
5. If the question is not covered in provided content, acknowledge it politely
6. Be encouraging and supportive of the student's learning
7. Suggest related topics for deeper understanding when relevant

Please provide a helpful, educational response:`
  }
  
  /**
   * Process a query. Optionally filter by class and subject (one query = one subject + one chapter).
   */
  processQuery(
    userQuery: string,
    classFilter?: number,
    subjectFilter?: string
  ): {
    context: string
    sources: NCERTTopic[]
    prompt: string
  } {
    const sources = this.retrieveRelevantDocuments(userQuery, 5, classFilter, subjectFilter)
    const context = this.buildContext(sources)
    const prompt = this.generatePrompt(userQuery, sources)
    return { context, sources, prompt }
  }
}

// Export singleton instance
export const ragEngine = new RAGEngine()
