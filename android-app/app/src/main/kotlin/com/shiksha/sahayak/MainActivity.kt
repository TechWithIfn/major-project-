package com.shiksha.sahayak

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
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
    private lateinit var splashOverlay: View

    private lateinit var dashboardScreen: View
    private lateinit var chatScreen: View
    private lateinit var quizScreen: View
    private lateinit var bookmarksScreen: View
    private lateinit var settingsScreen: View

    private lateinit var chatHistory: LinearLayout
    private lateinit var chatScroll: ScrollView
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

    private val bookmarks = mutableListOf<String>()
    private lateinit var progressBar: ProgressBar
    private val prefs by lazy { getSharedPreferences("shiksha_mobile", MODE_PRIVATE) }

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
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        splashOverlay = findViewById(R.id.splashOverlay)
        dashboardScreen = findViewById(R.id.dashboardScreen)
        chatScreen = findViewById(R.id.chatScreen)
        quizScreen = findViewById(R.id.quizScreen)
        bookmarksScreen = findViewById(R.id.bookmarksScreen)
        settingsScreen = findViewById(R.id.settingsScreen)

        // Bind Views
        chatScroll = findViewById(R.id.chatScroll)
        chatHistory = findViewById(R.id.chatHistory)
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

        findViewById<Button>(R.id.openChatFromDashboard).setOnClickListener { showScreen("chat") }
        findViewById<Button>(R.id.openQuizFromDashboard).setOnClickListener { showScreen("quiz") }
        findViewById<Button>(R.id.openBookmarksFromDashboard).setOnClickListener { showScreen("bookmarks") }

        navDashboard.setOnClickListener { showScreen("dashboard") }
        navChat.setOnClickListener { showScreen("chat") }
        navQuiz.setOnClickListener { showScreen("quiz") }
        navBookmarks.setOnClickListener { showScreen("bookmarks") }
        navSettings.setOnClickListener { showScreen("settings") }

        configureProfileSettings()

        lifecycleScope.launch {
            kotlinx.coroutines.delay(1200)
            splashOverlay.visibility = View.GONE
        }
        
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
        
        addMessage("🎓", "Namaste! I am Shiksha Sahayak, your AI tutor. Ask me anything from your NCERT textbooks.", false)
        showScreen("dashboard")
        renderBookmarks()
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
    }

    private fun startVoiceInput() {
        val intent = Intent(android.speech.RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(android.speech.RecognizerIntent.EXTRA_LANGUAGE_MODEL, android.speech.RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(android.speech.RecognizerIntent.EXTRA_LANGUAGE, "en-IN")
            putExtra(android.speech.RecognizerIntent.EXTRA_PROMPT, "Speak your question")
        }
        try {
            speechResultLauncher.launch(intent)
        } catch (e: Exception) {
            Toast.makeText(this, "Voice input unavailable on this device", Toast.LENGTH_SHORT).show()
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
                addMessage("🎓", response.answer, false)
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

    private fun addMessage(icon: String, text: String, isUser: Boolean) {
        val bubble = TextView(this).apply {
            this.text = "$icon $text"
            this.setPadding(24, 16, 24, 16)
            this.textSize = 16f
            this.setTextColor(android.graphics.Color.WHITE)
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                setMargins(16, 8, 16, 8)
                gravity = if (isUser) android.view.Gravity.END else android.view.Gravity.START
            }
            this.layoutParams = params
            this.setBackgroundResource(if (isUser) R.drawable.user_bubble else R.drawable.ai_bubble)
        }
        chatHistory.addView(bubble)
        
        // Auto-scroll to bottom
        chatScroll.post {
            chatScroll.fullScroll(View.FOCUS_DOWN)
        }
    }
}
