export interface NCERTTopic {
  id: string
  title: string
  class: number
  subject: string
  content: string
  keyPoints: string[]
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: string[]
  /** Key points from retrieved NCERT curriculum (for assistant messages) */
  keyPoints?: string[]
  /** Structured: Chapter – Class – Subject (one subject/chapter per answer) */
  title?: string
  /** Collapsible section; chapter-specific examples */
  examples?: string[]
  seen?: boolean
}

export interface ChatSession {
  id: string
  title: string
  class: number
  subject: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

/** NCERT classes supported: 6 to 12 */
export const NCERT_CLASSES = [6, 7, 8, 9, 10, 11, 12] as const

/** All NCERT subjects, ordered for clear display (Math, Science, Languages, Humanities) */
export const NCERT_SUBJECTS = [
  'Mathematics',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Hindi',
  'History',
  'Geography',
  'Civics',
  'Economics',
] as const

// Pre-loaded NCERT curriculum data
export const CURRICULUM_DATA: NCERTTopic[] = [
  {
    id: 'ncert-class6-math-fractions',
    title: 'Fractions and Decimals',
    class: 6,
    subject: 'Mathematics',
    content: `Fractions represent parts of a whole. A fraction is written as a/b where a is the numerator and b is the denominator (b ≠ 0).

Types of fractions: proper (numerator < denominator), improper (numerator ≥ denominator), mixed (whole + fraction).
Decimals are another way to write fractions with denominators 10, 100, 1000, etc. Conversion between fractions and decimals is important for comparison and operations.`,
    keyPoints: [
      'Fraction = numerator/denominator',
      'Proper, improper, and mixed fractions',
      'Decimals and place value',
      'Converting between fractions and decimals',
    ]
  },
  {
    id: 'ncert-class6-science-components',
    title: 'Components of Food',
    class: 6,
    subject: 'Science',
    content: `Food contains nutrients that our body needs: carbohydrates (energy), proteins (growth and repair), fats (energy storage), vitamins and minerals (protection and regulation), roughage (digestion), and water.

A balanced diet includes all these in the right amounts. Deficiency diseases result from lack of specific nutrients (e.g. scurvy – vitamin C, rickets – vitamin D).`,
    keyPoints: [
      'Major nutrients: carbohydrates, proteins, fats, vitamins, minerals',
      'Balanced diet and its importance',
      'Deficiency diseases',
    ]
  },
  {
    id: 'ncert-class7-math-integers',
    title: 'Integers',
    class: 7,
    subject: 'Mathematics',
    content: `Integers are whole numbers that can be positive, negative, or zero: ..., -2, -1, 0, 1, 2, ...

Number line helps visualize integers. Rules for addition and subtraction: same sign add and keep sign; different signs subtract and take sign of larger absolute value. Multiplication and division of integers: like signs give positive, unlike signs give negative.`,
    keyPoints: [
      'Integers include negative numbers and zero',
      'Number line representation',
      'Rules for addition, subtraction, multiplication, division',
    ]
  },
  {
    id: 'ncert-class7-science-acids',
    title: 'Acids, Bases and Salts',
    class: 7,
    subject: 'Science',
    content: `Acids are sour (e.g. lemon, vinegar), turn blue litmus red. Bases are bitter and soapy, turn red litmus blue. Neutral substances do not change litmus colour.

Neutralisation: acid + base → salt + water. Salts are formed when acids and bases react. pH scale (0–14) measures acidity or alkalinity; 7 is neutral.`,
    keyPoints: [
      'Acids and bases: properties and litmus test',
      'Neutralisation reaction',
      'pH scale',
    ]
  },
  {
    id: 'ncert-class10-math-quad',
    title: 'Quadratic Equations',
    class: 10,
    subject: 'Mathematics',
    content: `Quadratic Equations are polynomial equations of degree 2. A quadratic equation is of the form ax² + bx + c = 0, where a ≠ 0.

Key characteristics:
- The highest power of the variable is 2
- Coefficients a, b, c are real numbers
- 'a' is called the leading coefficient and must be non-zero

Methods to solve:
1. Factorization Method
2. Completing the Square
3. Quadratic Formula: x = (-b ± √(b² - 4ac)) / 2a

The discriminant (Δ = b² - 4ac) determines the nature of roots:
- If Δ > 0: Two distinct real roots
- If Δ = 0: One real root (repeated)
- If Δ < 0: No real roots (two complex roots)`,
    keyPoints: [
      'Quadratic equations have degree 2',
      'Standard form: ax² + bx + c = 0',
      'Discriminant determines nature of roots',
      'Three methods: factorization, completing square, quadratic formula',
      'Sum of roots = -b/a, Product of roots = c/a'
    ]
  },
  {
    id: 'ncert-class10-science-photosyn',
    title: 'Photosynthesis',
    class: 10,
    subject: 'Biology',
    content: `Photosynthesis is the process by which plants, algae, and some bacteria use sunlight, water, and carbon dioxide to produce oxygen and energy in the form of glucose.

Overall Equation: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂

Two main stages:
1. Light-dependent reactions (Thylakoid membrane):
   - Occurs in the presence of light
   - Splits water molecules
   - Produces ATP and NADPH
   - Releases oxygen as byproduct

2. Light-independent reactions/Calvin Cycle (Stroma):
   - Doesn't directly require light
   - Uses ATP and NADPH from light reactions
   - Produces glucose using CO₂

Importance:
- Primary source of oxygen in atmosphere
- Converts light energy to chemical energy
- Forms the base of most food chains`,
    keyPoints: [
      'Occurs in chloroplasts of plant cells',
      'Requires sunlight, water, and CO₂',
      'Produces glucose and oxygen',
      'Light reactions in thylakoids, Calvin cycle in stroma',
      'Essential for life on Earth'
    ]
  },
  {
    id: 'ncert-class9-english-poetry',
    title: 'Poetry Appreciation - The Road Not Taken',
    class: 9,
    subject: 'English',
    content: `"The Road Not Taken" by Robert Frost is one of the most famous poems in American literature.

Central Theme:
The poem explores themes of individual choice, divergence, and the decisions that shape our lives. The speaker encounters a fork in a yellow wood and must choose between two paths.

Literary Devices:
- Metaphor: The roads represent life choices and paths
- Symbolism: The yellow wood represents autumn, a time of change
- Tone: Initially contemplative, becomes reflective
- Rhyme Scheme: ABAAB in each stanza

Deeper Meaning:
While often interpreted as celebrating unconventional choices, the poem is more nuanced. The speaker suggests that both paths were "really about the same" and that the difference lies in the telling of the story afterward.

Key Lines:
"Two roads diverged in a yellow wood"
"I took the one less traveled by, And that has made all the difference"`,
    keyPoints: [
      'Theme of individual choice and consequence',
      'Written in four quatrains',
      'Uses extended metaphor of roads and travel',
      'Explores how choices define our identity',
      'Often misinterpreted as straightforwardly celebrating nonconformity'
    ]
  },
  {
    id: 'ncert-class9-history-frenchrev',
    title: 'French Revolution - Causes and Consequences',
    class: 9,
    subject: 'History',
    content: `The French Revolution (1789-1799) fundamentally transformed French society and had global impact.

Major Causes:
1. Economic Crisis: Poor harvests, inflation, heavy taxation
2. Enlightenment Ideas: Concepts of liberty, equality, fraternity
3. Absolute Monarchy: Excessive power concentrated in monarchy
4. Social Inequality: Rigid class system (Estate System)
5. Debt Crisis: Government bankruptcy

Key Events:
- 1789: Storming of Bastille (July 14) - symbol of tyranny's fall
- 1789: Declaration of Rights of Man and Citizen
- 1793: Execution of King Louis XVI
- Reign of Terror (1793-1794): Revolutionary tribunal executions
- 1799: Rise of Napoleon Bonaparte

Consequences:
- End of feudalism
- Rise of nationalism
- Establishment of constitutional government
- Spread of democratic ideals across Europe
- Formation of modern nation-states`,
    keyPoints: [
      'Occurred in late 18th century France',
      'Resulted from economic, political, and social factors',
      'Challenged absolute monarchy and feudalism',
      'Promoted ideas of liberty and equality',
      'Influenced democratic movements worldwide'
    ]
  },
  {
    id: 'ncert-class10-bio-transport',
    title: 'Transport in Plants - Xylem and Phloem',
    class: 10,
    subject: 'Biology',
    content: `Plants have two types of vascular tissues for transport: xylem and phloem.

Xylem:
- Role: Transports water and minerals from roots to leaves and other parts of the plant.
- Direction: Unidirectional (roots → shoots).
- Components: Vessels, tracheids, xylem parenchyma, xylem fibres.
- Mechanism: Water is pulled up by transpiration (evaporation from leaves) and root pressure.
- No energy expenditure by the plant for water transport; it is passive.

Phloem:
- Role: Transports organic nutrients (e.g. sucrose, amino acids) from leaves (sites of photosynthesis) to roots, fruits, and growing parts.
- Direction: Bidirectional (source to sink).
- Components: Sieve tubes, companion cells, phloem parenchyma, phloem fibres.
- Mechanism: Requires energy (active transport at sieve tubes).
- Source: Leaves (photosynthesis). Sink: Roots, fruits, seeds.

Summary:
- Xylem = water and minerals, roots to leaves.
- Phloem = food and nutrients, leaves to other parts.
Together they form the vascular bundle and are essential for the survival of plants.`,
    keyPoints: [
      'Xylem transports water and minerals from roots to leaves',
      'Phloem transports organic nutrients (food) from leaves to other parts',
      'Xylem is unidirectional; phloem can be bidirectional',
      'Transpiration and root pressure help in upward movement of water',
      'Vascular tissues are present in roots, stems, and leaves'
    ]
  },
  {
    id: 'ncert-class10-physics-refraction',
    title: 'Refraction of Light',
    class: 10,
    subject: 'Physics',
    content: `Refraction is the bending of light when it passes from one transparent medium to another.

Laws of Refraction:
1. The incident ray, the refracted ray, and the normal at the point of incidence lie in the same plane.
2. Snell's Law: The ratio of the sine of the angle of incidence to the sine of the angle of refraction is constant for a given pair of media. n₁ sin i = n₂ sin r (where n is refractive index).

Refractive Index:
- Refractive index of a medium = speed of light in vacuum / speed of light in the medium.
- When light enters a denser medium (e.g. air to glass), it bends towards the normal; when it enters a rarer medium, it bends away from the normal.

Applications:
- Lenses (convex and concave) use refraction to form images.
- Mirages, twinkling of stars, and apparent depth in water are due to refraction.`,
    keyPoints: [
      'Refraction is bending of light at the interface of two media',
      'Snell\'s law: n₁ sin i = n₂ sin r',
      'Refractive index = c / v',
      'Light bends towards normal in denser medium',
      'Lenses and many optical phenomena use refraction'
    ]
  },
  {
    id: 'ncert-class8-geography-climate',
    title: 'Climate and Weather',
    class: 8,
    subject: 'Geography',
    content: `Weather and Climate are related but distinct concepts in studying Earth\'s atmosphere.

Weather:
- Short-term atmospheric conditions
- Changes rapidly (hourly, daily, weekly)
- Affects immediate environment
- Measured by temperature, humidity, pressure, wind

Climate:
- Long-term average weather patterns (30+ years)
- Changes slowly over longer periods
- Determined by latitude, altitude, ocean currents
- Relatively stable for a region

Factors Affecting Climate:
1. Latitude: Distance from equator affects temperature
2. Altitude: Higher elevation = cooler temperatures
3. Ocean Currents: Warm/cold currents influence coastal regions
4. Wind Patterns: Trade winds, monsoons affect precipitation
5. Proximity to Water: Moderates temperature extremes
6. Topography: Mountains affect rainfall patterns

Climate Zones:
- Tropical: Hot, humid, near equator
- Temperate: Moderate, between tropics and poles
- Polar: Cold, extreme conditions near poles
- Arid: Dry, minimal precipitation`,
    keyPoints: [
      'Weather is short-term, climate is long-term average',
      'Latitude is primary climate determinant',
      'Ocean currents influence coastal climates',
      'Altitude decreases temperature',
      'Different climate zones support different ecosystems'
    ]
  },
  {
    id: 'ncert-class11-physics-motion',
    title: 'Motion in a Plane',
    class: 11,
    subject: 'Physics',
    content: `Motion in a plane involves position, velocity, and acceleration as vectors in two dimensions. Projectile motion: an object thrown with initial velocity at an angle follows a parabolic path under gravity. Horizontal and vertical motions are independent. Key equations use components along x and y axes.`,
    keyPoints: [
      'Scalars and vectors in two dimensions',
      'Projectile motion and parabolic path',
      'Relative velocity',
    ]
  },
  {
    id: 'ncert-class11-chemistry-structure',
    title: 'Structure of Atom',
    class: 11,
    subject: 'Chemistry',
    content: `Atoms consist of a nucleus (protons and neutrons) and electrons. Atomic number (Z) = number of protons; mass number (A) = protons + neutrons. Isotopes have same Z, different A. Bohr model and quantum numbers describe electron arrangement. Electronic configuration follows Aufbau principle, Hund\'s rule, and Pauli exclusion principle.`,
    keyPoints: [
      'Atomic structure: nucleus and electrons',
      'Atomic number and mass number',
      'Electronic configuration and quantum numbers',
    ]
  },
  {
    id: 'ncert-class11-economics-indian',
    title: 'Indian Economy on the Eve of Independence',
    class: 11,
    subject: 'Economics',
    content: `At independence (1947), India was an agrarian economy with low growth, poor infrastructure, and dependence on primary sector. Colonial policies had led to deindustrialisation and export of raw materials. Understanding this baseline helps analyse post-independence development and planning.`,
    keyPoints: [
      'Agrarian dominance and low industrialisation',
      'Impact of colonial rule',
      'Baseline for economic planning',
    ]
  },
  {
    id: 'ncert-class12-math-matrices',
    title: 'Matrices',
    class: 12,
    subject: 'Mathematics',
    content: `A matrix is a rectangular array of numbers. Order of a matrix is m × n (m rows, n columns). Operations: addition (same order), scalar multiplication, matrix multiplication (columns of first = rows of second). Transpose, symmetric and skew-symmetric matrices. Determinants and inverse of square matrices.`,
    keyPoints: [
      'Matrix order and types',
      'Addition, multiplication, transpose',
      'Determinants and inverse',
    ]
  },
  {
    id: 'ncert-class12-chemistry-solutions',
    title: 'Solutions',
    class: 12,
    subject: 'Chemistry',
    content: `Solutions are homogeneous mixtures. Concentration expressed as molarity, molality, mole fraction. Colligative properties depend on number of solute particles: lowering of vapour pressure, elevation in boiling point, depression in freezing point, osmotic pressure. Raoult\'s law for ideal solutions.`,
    keyPoints: [
      'Concentration terms: molarity, molality, mole fraction',
      'Colligative properties',
      'Raoult\'s law',
    ]
  },
  {
    id: 'ncert-class12-civics-constitution',
    title: 'Indian Constitution - Rights and Duties',
    class: 12,
    subject: 'Civics',
    content: `The Indian Constitution guarantees Fundamental Rights (Right to Equality, Freedom, against Exploitation, Religion, Cultural and Educational, Constitutional Remedies) and lays down Fundamental Duties for citizens. These ensure dignity, liberty, and accountability in a democracy.`,
    keyPoints: [
      'Fundamental Rights (Articles 14–32)',
      'Fundamental Duties',
      'Constitutional remedies',
    ]
  }
]

export function searchCurriculum(query: string, classFilter?: number, subjectFilter?: string): NCERTTopic[] {
  return CURRICULUM_DATA.filter(topic => {
    const queryLower = query.toLowerCase()
    const matchesQuery = 
      topic.title.toLowerCase().includes(queryLower) ||
      topic.content.toLowerCase().includes(queryLower) ||
      topic.keyPoints.some(point => point.toLowerCase().includes(queryLower))
    
    const matchesClass = classFilter ? topic.class === classFilter : true
    const matchesSubject = subjectFilter ? topic.subject === subjectFilter : true
    
    return matchesQuery && matchesClass && matchesSubject
  })
}

export function getTopicById(id: string): NCERTTopic | undefined {
  return CURRICULUM_DATA.find(topic => topic.id === id)
}

/** Get classes 6–12 and all NCERT subjects in a clear order. Adds any subject from data not in the default list. */
export function getClassesAndSubjects() {
  const dataSubjects = new Set(CURRICULUM_DATA.map(t => t.subject))
  const subjects = [...NCERT_SUBJECTS]
  dataSubjects.forEach(s => {
    if (!subjects.includes(s)) subjects.push(s)
  })
  return {
    classes: [...NCERT_CLASSES],
    subjects,
  }
}
