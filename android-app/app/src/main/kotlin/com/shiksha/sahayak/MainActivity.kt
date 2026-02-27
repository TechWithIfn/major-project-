package com.shiksha.sahayak

import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.*
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.lifecycle.lifecycleScope
import com.google.android.material.button.MaterialButton
import com.google.android.material.card.MaterialCardView
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST

// Data models for API
data class QueryRequest(val question: String, val voice: Boolean = false)
data class QueryResponse(val answer: String, val sources: List<Map<String, Any>>?)

// Retrofit Interface
interface ShikshaApi {
    @POST("ask")
    suspend fun getAnswer(@Body request: QueryRequest): QueryResponse
}

class MainActivity : AppCompatActivity() {
    private var isAppContentReady = false

    private lateinit var dashboardScreen: View
    private lateinit var chatScreen: View
    private lateinit var quizScreen: View
    private lateinit var bookmarksScreen: View
    private lateinit var settingsScreen: View
    private lateinit var ocrScreen: View
    private lateinit var bottomNav: View
    private lateinit var ocrBackButton: ImageButton
    private lateinit var ocrShutterButton: ImageButton

    private lateinit var chatHistory: LinearLayout
    private lateinit var chatScroll: ScrollView
    private lateinit var aiSearchInput: EditText
    private lateinit var aiSearchButton: MaterialButton
    private lateinit var questionInput: EditText
    private lateinit var sendButton: ImageButton
    private lateinit var voiceButton: ImageButton

    private lateinit var quizTopicInput: EditText
    private lateinit var generateQuizButton: Button
    private lateinit var quizOutput: TextView

    private lateinit var bookmarksList: LinearLayout

    private lateinit var studentNameInput: EditText
    private lateinit var classSpinner: Spinner
    private lateinit var saveProfileButton: Button

    private lateinit var navDashboard: Button
    private lateinit var navChat: Button
    private lateinit var navQuiz: Button
    private lateinit var navBookmarks: Button
    private lateinit var navSettings: Button

    private lateinit var onboardingContainer: View
    private lateinit var onboardingFlipper: ViewFlipper
    private lateinit var onboardingSkipButton: MaterialButton
    private lateinit var onboardingBackButton: MaterialButton
    private lateinit var onboardingNextButton: MaterialButton
    private lateinit var onboardingDot1: View
    private lateinit var onboardingDot2: View
    private lateinit var onboardingDot3: View

    private lateinit var languageHindiCard: MaterialCardView
    private lateinit var languageEnglishCard: MaterialCardView
    private lateinit var languageUrduCard: MaterialCardView
    private lateinit var languageTamilCard: MaterialCardView
    private lateinit var languageBengaliCard: MaterialCardView

    private val bookmarks = mutableListOf<String>()
    private lateinit var progressBar: ProgressBar
    private val prefs by lazy { getSharedPreferences("shiksha_mobile", MODE_PRIVATE) }
    private var onboardingStep = 0
    private var selectedLanguage = "English"
    private var appLanguage = "English"

    private val api: ShikshaApi by lazy {
        Retrofit.Builder()
            .baseUrl("http://10.0.2.2:5000/") // Android emulator -> host machine localhost
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ShikshaApi::class.java)
    }

    private val speechResultLauncher =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            if (result.resultCode == RESULT_OK) {
                val spokenText = result.data
                    ?.getStringArrayListExtra(android.speech.RecognizerIntent.EXTRA_RESULTS)
                    ?.firstOrNull()
                    ?.trim()
                    .orEmpty()
                if (spokenText.isNotEmpty()) {
                    questionInput.setText(spokenText)
                    questionInput.setSelection(spokenText.length)
                }
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        val splashScreen = installSplashScreen()
        splashScreen.setKeepOnScreenCondition { !isAppContentReady }

        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        dashboardScreen = findViewById(R.id.dashboardScreen)
        chatScreen = findViewById(R.id.chatScreen)
        quizScreen = findViewById(R.id.quizScreen)
        bookmarksScreen = findViewById(R.id.bookmarksScreen)
        settingsScreen = findViewById(R.id.settingsScreen)
        ocrScreen = findViewById(R.id.ocrScreen)
        bottomNav = findViewById(R.id.bottomNav)
        ocrBackButton = findViewById(R.id.ocrBackButton)
        ocrShutterButton = findViewById(R.id.ocrShutterButton)

        // Bind Views
        chatScroll = findViewById(R.id.chatScroll)
        chatHistory = findViewById(R.id.chatHistory)
        aiSearchInput = findViewById(R.id.aiSearchInput)
        aiSearchButton = findViewById(R.id.aiSearchButton)
        questionInput = findViewById(R.id.questionInput)
        sendButton = findViewById(R.id.sendButton)
        voiceButton = findViewById(R.id.voiceButton)

        quizTopicInput = findViewById(R.id.quizTopicInput)
        generateQuizButton = findViewById(R.id.generateQuizButton)
        quizOutput = findViewById(R.id.quizOutput)

        bookmarksList = findViewById(R.id.bookmarksList)

        studentNameInput = findViewById(R.id.studentNameInput)
        classSpinner = findViewById(R.id.classSpinner)
        saveProfileButton = findViewById(R.id.saveProfileButton)

        navDashboard = findViewById(R.id.navDashboard)
        navChat = findViewById(R.id.navChat)
        navQuiz = findViewById(R.id.navQuiz)
        navBookmarks = findViewById(R.id.navBookmarks)
        navSettings = findViewById(R.id.navSettings)

        onboardingContainer = findViewById(R.id.onboardingContainer)
        onboardingFlipper = findViewById(R.id.onboardingFlipper)
        onboardingSkipButton = findViewById(R.id.onboardingSkipButton)
        onboardingBackButton = findViewById(R.id.onboardingBackButton)
        onboardingNextButton = findViewById(R.id.onboardingNextButton)
        onboardingDot1 = findViewById(R.id.onboardingDot1)
        onboardingDot2 = findViewById(R.id.onboardingDot2)
        onboardingDot3 = findViewById(R.id.onboardingDot3)

        languageHindiCard = findViewById(R.id.languageHindiCard)
        languageEnglishCard = findViewById(R.id.languageEnglishCard)
        languageUrduCard = findViewById(R.id.languageUrduCard)
        languageTamilCard = findViewById(R.id.languageTamilCard)
        languageBengaliCard = findViewById(R.id.languageBengaliCard)

        findViewById<View>(R.id.openChatFromDashboard).setOnClickListener { showScreen("chat") }
        findViewById<View>(R.id.openQuizFromDashboard).setOnClickListener { showScreen("quiz") }
        findViewById<View>(R.id.openBookmarksFromDashboard).setOnClickListener { showScreen("bookmarks") }
        findViewById<View>(R.id.openOcrFromDashboard).setOnClickListener { showScreen("ocr") }

        ocrBackButton.setOnClickListener { showScreen("dashboard") }
        ocrShutterButton.setOnClickListener {
            Toast.makeText(this, "Paragraph captured with Offline OCR", Toast.LENGTH_SHORT).show()
        }

        aiSearchButton.setOnClickListener {
            submitDashboardSearch()
        }

        aiSearchInput.setOnEditorActionListener { _, _, _ ->
            submitDashboardSearch()
            true
        }

        navDashboard.setOnClickListener { showScreen("dashboard") }
        navChat.setOnClickListener { showScreen("chat") }
        navQuiz.setOnClickListener { showScreen("quiz") }
        navBookmarks.setOnClickListener { showScreen("bookmarks") }
        navSettings.setOnClickListener { showScreen("settings") }

        appLanguage = prefs.getString("app_language", "English") ?: "English"

        configureProfileSettings()
        
        // Add a progress bar programmatically for better UX
        progressBar = ProgressBar(this, null, android.R.attr.progressBarStyleSmall)
        progressBar.visibility = View.GONE
        (findViewById<View>(R.id.inputLayout) as LinearLayout).addView(progressBar, 0)

        sendButton.setOnClickListener {
            val query = questionInput.text.toString().trim()
            if (query.isNotEmpty()) {
                handleUserQuery(query)
            }
        }

        voiceButton.setOnClickListener {
            startVoiceInput()
        }

        generateQuizButton.setOnClickListener {
            val topic = quizTopicInput.text.toString().trim()
            if (topic.isNotEmpty()) {
                generateQuiz(topic)
            } else {
                Toast.makeText(this, "Enter a topic first", Toast.LENGTH_SHORT).show()
            }
        }
        
        addMessage("🎓", getLocalizedGreeting(appLanguage), false)
        showScreen("dashboard")
        renderBookmarks()
        configureOnboarding()

        findViewById<View>(R.id.rootContent).post {
            isAppContentReady = true
        }
    }

    private fun configureOnboarding() {
        selectedLanguage = prefs.getString("app_language", "English") ?: "English"

        languageHindiCard.setOnClickListener { selectLanguage("Hindi") }
        languageEnglishCard.setOnClickListener { selectLanguage("English") }
        languageUrduCard.setOnClickListener { selectLanguage("Urdu") }
        languageTamilCard.setOnClickListener { selectLanguage("Tamil") }
        languageBengaliCard.setOnClickListener { selectLanguage("Bengali") }

        onboardingSkipButton.setOnClickListener {
            completeOnboarding(saveAsComplete = true)
        }

        onboardingBackButton.setOnClickListener {
            if (onboardingStep > 0) {
                onboardingStep -= 1
                onboardingFlipper.displayedChild = onboardingStep
                updateOnboardingUiState()
            }
        }

        onboardingNextButton.setOnClickListener {
            if (onboardingStep < 2) {
                onboardingStep += 1
                onboardingFlipper.displayedChild = onboardingStep
                updateOnboardingUiState()
                return@setOnClickListener
            }
            completeOnboarding(saveAsComplete = true)
        }

        selectLanguage(selectedLanguage)

        val alreadyCompleted = prefs.getBoolean("onboarding_completed", false)
        if (alreadyCompleted) {
            onboardingContainer.visibility = View.GONE
        } else {
            onboardingContainer.visibility = View.VISIBLE
            onboardingStep = 0
            onboardingFlipper.displayedChild = onboardingStep
            updateOnboardingUiState()
        }
    }

    private fun completeOnboarding(saveAsComplete: Boolean) {
        prefs.edit()
            .putBoolean("onboarding_completed", saveAsComplete)
            .putString("app_language", selectedLanguage)
            .apply()

        appLanguage = selectedLanguage
        chatHistory.removeAllViews()
        addMessage("🎓", getLocalizedGreeting(appLanguage), false)

        onboardingContainer.visibility = View.GONE
        Toast.makeText(this, "Language set to $selectedLanguage", Toast.LENGTH_SHORT).show()
    }

    private fun updateOnboardingUiState() {
        onboardingBackButton.visibility = if (onboardingStep == 0) View.GONE else View.VISIBLE
        onboardingSkipButton.visibility = if (onboardingStep == 2) View.INVISIBLE else View.VISIBLE
        onboardingNextButton.text = if (onboardingStep == 2) "Get Started" else "Next"

        updateDot(onboardingDot1, onboardingStep == 0)
        updateDot(onboardingDot2, onboardingStep == 1)
        updateDot(onboardingDot3, onboardingStep == 2)
    }

    private fun updateDot(dot: View, isActive: Boolean) {
        val drawable = GradientDrawable().apply {
            shape = GradientDrawable.OVAL
            setColor(
                ContextCompat.getColor(
                    this@MainActivity,
                    if (isActive) R.color.white else R.color.onboarding_dot_inactive
                )
            )
        }
        dot.background = drawable
    }

    private fun selectLanguage(language: String) {
        selectedLanguage = language
        updateLanguageCard(languageHindiCard, language == "Hindi")
        updateLanguageCard(languageEnglishCard, language == "English")
        updateLanguageCard(languageUrduCard, language == "Urdu")
        updateLanguageCard(languageTamilCard, language == "Tamil")
        updateLanguageCard(languageBengaliCard, language == "Bengali")
    }

    private fun updateLanguageCard(card: MaterialCardView, selected: Boolean) {
        card.strokeColor = ContextCompat.getColor(
            this,
            if (selected) R.color.onboarding_accent else android.R.color.transparent
        )
        card.setCardBackgroundColor(
            ContextCompat.getColor(
                this,
                if (selected) R.color.onboarding_card_selected else R.color.onboarding_card_bg
            )
        )
        card.cardElevation = if (selected) 12f else 8f
    }

    private fun configureProfileSettings() {
        val classes = listOf("Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12")
        classSpinner.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, classes)

        studentNameInput.setText(prefs.getString("student_name", ""))
        classSpinner.setSelection(prefs.getInt("student_class_index", 4))

        saveProfileButton.setOnClickListener {
            prefs.edit()
                .putString("student_name", studentNameInput.text.toString().trim())
                .putInt("student_class_index", classSpinner.selectedItemPosition)
                .apply()
            Toast.makeText(this, "Profile saved", Toast.LENGTH_SHORT).show()
        }
    }

    private fun showScreen(screen: String) {
        dashboardScreen.visibility = if (screen == "dashboard") View.VISIBLE else View.GONE
        chatScreen.visibility = if (screen == "chat") View.VISIBLE else View.GONE
        quizScreen.visibility = if (screen == "quiz") View.VISIBLE else View.GONE
        bookmarksScreen.visibility = if (screen == "bookmarks") View.VISIBLE else View.GONE
        settingsScreen.visibility = if (screen == "settings") View.VISIBLE else View.GONE
        ocrScreen.visibility = if (screen == "ocr") View.VISIBLE else View.GONE
        bottomNav.visibility = if (screen == "ocr") View.GONE else View.VISIBLE

        setNavItemState(navDashboard, screen == "dashboard" || screen == "ocr")
        setNavItemState(navChat, screen == "chat")
        setNavItemState(navQuiz, screen == "quiz")
        setNavItemState(navBookmarks, screen == "bookmarks")
        setNavItemState(navSettings, screen == "settings")
    }

    private fun setNavItemState(button: Button, active: Boolean) {
        button.setBackgroundResource(
            if (active) R.drawable.nav_item_active_bg else R.drawable.nav_item_inactive_bg
        )
        button.setTextColor(
            ContextCompat.getColor(
                this,
                if (active) android.R.color.white else android.R.color.darker_gray
            )
        )
    }

    private fun startVoiceInput() {
        val languageLocale = getSpeechLocale(appLanguage)
        val intent = Intent(android.speech.RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(android.speech.RecognizerIntent.EXTRA_LANGUAGE_MODEL, android.speech.RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(android.speech.RecognizerIntent.EXTRA_LANGUAGE, languageLocale)
            putExtra(android.speech.RecognizerIntent.EXTRA_PROMPT, "Speak your question")
        }
        try {
            speechResultLauncher.launch(intent)
        } catch (e: Exception) {
            Toast.makeText(this, "Voice input unavailable on this device", Toast.LENGTH_SHORT).show()
        }
    }

    private fun submitDashboardSearch() {
        val query = aiSearchInput.text.toString().trim()
        if (query.isEmpty()) {
            showScreen("chat")
            questionInput.requestFocus()
            return
        }

        showScreen("chat")
        handleUserQuery(query)
        aiSearchInput.text.clear()
    }

    private fun getSpeechLocale(language: String): String {
        return when (language) {
            "Hindi" -> "hi-IN"
            "Urdu" -> "ur-PK"
            "Tamil" -> "ta-IN"
            "Bengali" -> "bn-IN"
            else -> "en-IN"
        }
    }

    private fun getLocalizedGreeting(language: String): String {
        return when (language) {
            "Hindi" -> "नमस्ते! मैं शिक्षा सहायक हूँ, आपका एआई ट्यूटर। अपने NCERT प्रश्न पूछें।"
            "Urdu" -> "السلام علیکم! میں شکشا سہایک ہوں، آپ کا اے آئی ٹیوٹر۔ اپنے NCERT سوالات پوچھیں۔"
            "Tamil" -> "வணக்கம்! நான் Shiksha Sahayak, உங்கள் AI டியூட்டர். உங்கள் NCERT கேள்விகளை கேளுங்கள்."
            "Bengali" -> "নমস্কার! আমি শিক্ষা সহায়ক, আপনার AI টিউটর। আপনার NCERT প্রশ্ন জিজ্ঞাসা করুন।"
            else -> "Namaste! I am Shiksha Sahayak, your AI tutor. Ask me anything from your NCERT textbooks."
        }
    }

    private fun handleUserQuery(query: String) {
        addMessage("👤", query, true)
        questionInput.text.clear()
        
        lifecycleScope.launch {
            progressBar.visibility = View.VISIBLE
            sendButton.isEnabled = false
            
            try {
                val response = withContext(Dispatchers.IO) {
                    api.getAnswer(QueryRequest(query))
                }
                addMessage("🎓", response.answer, false, response.sources?.isNotEmpty() == true)
                addBookmark(response.answer)
            } catch (e: Exception) {
                addMessage("❌", "Error: Brain unreachable. Ensure local backend is running on port 5000.", false)
            } finally {
                progressBar.visibility = View.GONE
                sendButton.isEnabled = true
            }
        }
    }

    private fun generateQuiz(topic: String) {
        lifecycleScope.launch {
            progressBar.visibility = View.VISIBLE
            generateQuizButton.isEnabled = false
            try {
                val prompt = "Generate 5 NCERT MCQs with options and answers for: $topic"
                val response = withContext(Dispatchers.IO) {
                    api.getAnswer(QueryRequest(prompt))
                }
                quizOutput.text = response.answer
                addBookmark("Quiz ($topic): ${response.answer.take(220)}")
            } catch (e: Exception) {
                quizOutput.text = "Unable to generate quiz. Check backend connectivity."
            } finally {
                progressBar.visibility = View.GONE
                generateQuizButton.isEnabled = true
            }
        }
    }

    private fun addBookmark(text: String) {
        bookmarks.add(0, text)
        if (bookmarks.size > 30) {
            bookmarks.removeLast()
        }
        renderBookmarks()
    }

    private fun renderBookmarks() {
        bookmarksList.removeAllViews()
        if (bookmarks.isEmpty()) {
            val empty = TextView(this).apply {
                text = "No saved notes yet."
                setTextColor(android.graphics.Color.parseColor("#C7D2FE"))
                textSize = 15f
            }
            bookmarksList.addView(empty)
            return
        }

        bookmarks.forEach { item ->
            val note = TextView(this).apply {
                text = "• $item"
                setTextColor(android.graphics.Color.WHITE)
                textSize = 14f
                setPadding(12, 10, 12, 10)
                setBackgroundColor(android.graphics.Color.parseColor("#233554"))
            }

            val wrapper = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                setMargins(0, 0, 0, 8)
            }
            note.layoutParams = wrapper
            bookmarksList.addView(note)
        }
    }

    private fun addMessage(icon: String, text: String, isUser: Boolean, showSourceBadge: Boolean = false) {
        val messageContainer = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = if (isUser) Gravity.END else Gravity.START
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                setMargins(8, 8, 8, 8)
            }
        }

        val bubble = TextView(this).apply {
            this.text = "$icon $text"
            this.setPadding(24, 16, 24, 16)
            this.textSize = 15f
            this.setLineSpacing(0f, 1.15f)
            this.setTextColor(if (isUser) Color.WHITE else Color.parseColor("#1E293B"))
            this.maxWidth = resources.displayMetrics.widthPixels - 180
            this.layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            this.setBackgroundResource(if (isUser) R.drawable.user_bubble else R.drawable.ai_bubble)
        }

        messageContainer.addView(bubble)

        if (!isUser && showSourceBadge) {
            val sourceBadge = TextView(this).apply {
                text = "NCERT Source"
                textSize = 11f
                setTextColor(Color.parseColor("#4338CA"))
                setPadding(14, 6, 14, 6)
                setBackgroundResource(R.drawable.ncert_source_badge_bg)
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply {
                    topMargin = 6
                }
            }
            messageContainer.addView(sourceBadge)
        }

        chatHistory.addView(messageContainer)
        
        // Auto-scroll to bottom
        chatScroll.post {
            chatScroll.fullScroll(View.FOCUS_DOWN)
        }
    }
}
