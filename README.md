# Certification Mastery Suite

A modern, feature-rich web application for preparing for multiple certification exams including SnowPro Core, Databricks Data Engineer Associate, and more. Built with vanilla JavaScript and Tailwind CSS, this single-page application provides an interactive quiz experience with practice and exam simulator modes.

## 🎯 Supported Certifications

- **Snowflake SnowPro Core** - Complete question bank
- **Databricks Certified Data Engineer Associate** - 50 comprehensive questions
- **Extensible** - Easy to add more certification exams

## ✨ Features

### Core Functionality
- **Multi-Certification Support**: Import and manage question banks for different certifications
- **Question Bank Library**: Organize exams by vendor and certification type
- **Dual Mode Testing**:
  - **Practice Mode**: Untimed sessions with instant feedback
  - **Simulator Mode**: Timed exam sessions that mimic real testing conditions
- **Focus Mode**: Distraction-free interface for concentrated studying
- **Dark/Light Theme**: Toggle between themes for comfortable viewing
- **Markdown Support**: Rich text formatting in questions and explanations

### Quiz Features
- **Multiple Question Types**:
  - Single-answer questions
  - Multiple-answer questions (select all that apply)
  - Sequence-based questions (order the steps)
- **Keyboard Shortcuts**: Full keyboard navigation for efficient studying (press `?` for help)
- **Right-Click to Eliminate**: Strike-through option answers (process of elimination)
- **Step Indicators**: Visual badges for sequence ordering questions
- **Instant Feedback**: Real-time pass/fail indicators after answering
- **Detailed Explanations**: View reasoning with markdown formatting for each question
- **Question Navigation Grid**: Jump between questions and see status at a glance
- **Sticky Navigation**: Sidebar stays visible while scrolling through long questions
- **Progress Tracking**: Visual progress bar showing exam completion
- **Smart Randomization**: Shuffle questions and answers for varied practice

### Analytics & Review
- **Dashboard Statistics**: Track total banks, attempts, and average accuracy
- **Topic Proficiency**: Visual breakdown of performance by category
- **Exam History Log**: Complete record of all sessions with pass/fail status
- **Audit Tool**: Review every question from past attempts with correct/incorrect answers
- **Retake Errors**: Create custom sessions from incorrectly answered questions
- **Performance Trends**: Track improvement over time

### Data Persistence
- **IndexedDB Storage**: All data stored locally using Dexie.js
- **No Server Required**: Fully client-side application
- **Import/Export**: Load question banks from JSON files
- **Persistent Settings**: Theme and preferences saved across sessions

## 📁 Project Structure

```
snowpro-core-mastery/
├── index.html                  # Main application HTML
├── assets/
│   ├── css/
│   │   └── styles.css          # Custom CSS variables and styles
│   └── js/
│       ├── app.js              # UI management, navigation, analytics
│       └── quiz.js             # Quiz logic, timer, scoring
└── exams/
    ├── snowflake/
    │   └── pro core/           # SnowPro Core exam files
    │       └── New folder/
    └── databricks/
        └── Data Eng/           # Databricks Data Engineer exams
            └── markdown/
                └── tests/
                    └── databricks-certified-data-engineer-associate.json
```

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **Tailwind CSS** (CDN) - Utility-first styling
- **Vanilla JavaScript** - No framework dependencies
- **Dexie.js** (CDN) - IndexedDB wrapper for data persistence
- **Marked.js** (CDN) - Markdown parsing for rich text
- **Canvas Confetti** (CDN) - Celebration effects for passing scores

## 📝 Question Bank Format

Create JSON files with the following structure:

### Basic Structure
```json
{
  "exam": "Certification Name",
  "questions": [
    {
      "text": "Question text here?",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "answer": "A",
      "answer_type": "single",
      "category1": "Category Name",
      "explanation": "Why this answer is correct"
    }
  ]
}
```

### Question Types

#### Single Answer
```json
{
  "text": "What is the primary architecture model?",
  "options": {
    "A": "Multi-cluster shared data",
    "B": "Shared-nothing architecture",
    "C": "Shared-disk architecture",
    "D": "Hybrid model"
  },
  "answer": "A",
  "answer_type": "single",
  "category1": "Architecture",
  "explanation": "Multi-cluster shared data provides separation of storage and compute."
}
```

#### Multiple Answer
```json
{
  "text": "Select all valid editions:\n\n> Select all that apply",
  "options": {
    "A": "Standard Edition",
    "B": "Enterprise Edition",
    "C": "Business Critical Edition",
    "D": "Professional Edition"
  },
  "answer": ["A", "B", "C"],
  "answer_type": "multiple",
  "category1": "Editions",
  "explanation": "Standard, Enterprise, and Business Critical are valid editions."
}
```

#### Sequence/Ordering
```json
{
  "text": "Order the steps to load data:",
  "options": {
    "A": "Create a stage",
    "B": "Upload files",
    "C": "Create a table",
    "D": "Execute COPY INTO"
  },
  "answer": ["C", "A", "B", "D"],
  "answer_type": "sequence",
  "category1": "Data Loading",
  "explanation": "First create table, then stage, upload files, and finally copy data."
}
```

### Markdown Support

Questions and explanations support markdown formatting:

```json
{
  "text": "What is **Time Travel**?\n\n> Time Travel is a powerful feature",
  "options": {
    "A": "Query *historical data* within retention period",
    "B": "Schedule queries for future",
    "C": "Database `migration` tool",
    "D": "Real-time streaming"
  },
  "answer": "A",
  "answer_type": "single",
  "category1": "Features",
  "explanation": "**Time Travel** enables:\n\n1. Query data at specific point\n2. Restore dropped objects\n3. Create clones\n\n**Retention periods**:\n- Standard: Up to **1 day**\n- Enterprise+: Up to **90 days**\n\n```sql\nSELECT * FROM my_table \nAT(TIMESTAMP => '2024-01-01'::timestamp);\n```"
}
```

### Question Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `text` | string | Yes | Question text (supports markdown) |
| `options` | object | Yes | Key-value pairs of answer choices |
| `answer` | string/array | Yes | Correct answer(s) - key(s) from options |
| `answer_type` | string | No | `single`, `multiple`, or `sequence` (default: single) |
| `category1` | string | No | Primary category for analytics grouping |
| `category2` | string | No | Secondary category (optional) |
| `explanation` | string | No | Explanation shown after answering (supports markdown) |

## 🚀 Quick Start

### For Non-Technical Users

**The easiest way to run the application:**

#### Windows Users:
1. Double-click `start.bat`
2. Wait for the browser to open automatically
3. That's it! 🎉

#### Mac/Linux Users:
1. Double-click `start.sh` (or run `./start.sh` in terminal)
2. Wait for the browser to open automatically
3. That's it! 🎉

#### VS Code Users:
1. Open the project in VS Code
2. Press `Cmd+Shift+B` (Mac) or `Ctrl+Shift+B` (Windows/Linux)
3. Select "🚀 Start Certification Mastery Suite"
4. Or press `F5` to launch with debugger

The scripts will automatically:
- ✅ Install Python package manager (uv) if needed
- ✅ Create a virtual environment
- ✅ Find an available port
- ✅ Start the web server
- ✅ Show you the URL to open

### For Developers

#### Option 1: Direct File Access
1. Open `index.html` in any modern web browser
2. No build process or server required

#### Option 2: Manual Server Start
```bash
# Using Python 3
python3 -m http.server 8080

# Using Node.js
npx http-server -p 8080

# Then open http://localhost:8080
```

#### Option 3: With uv (Recommended)
```bash
# First time setup
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Start server
python -m http.server 8080
```

### Importing Question Banks

1. Navigate to the **Library** view
2. Click **Import JSON**
3. Select one or more `.json` files containing questions
4. Banks are automatically organized by exam name

### Taking an Exam

1. From the **Home** dashboard, select a question bank
2. Choose **Practice** (untimed) or **Simulator** (timed) mode
3. Configure session settings:
   - Time limit (minutes) - Simulator mode only
   - Number of questions (or use all)
   - Randomize questions toggle
4. Answer questions using:
   - **Left-click** to select/deselect answers
   - **Right-click** to strike-through (eliminate) options
   - **Drag and drop** for sequence questions
5. Click **Confirm** to lock in your answer
6. Review feedback and explanation before proceeding
7. Use navigation grid to jump between questions

### Keyboard Shortcuts

Press `?` during a quiz to view all available shortcuts, or use these commands:

#### Navigation
- `←` / `→` - Previous/Next question
- `S` - Skip current question
- `A-Z` - Select option by letter (matches visible option labels)

#### Answer Controls
- `Enter` or `Space` - Submit answer
- `N` - Next question (after submitting)
- `C` - Clear current selection

#### View Controls
- `F` - Toggle focus mode
- `Esc` - Exit focus mode
- `?` - Show keyboard shortcuts help

### Reviewing Results

After completing a session:
- View scaled score (out of 1000)
- See pass/fail status (700+ to pass)
- Review raw score and percentage
- Access **The Lab** for detailed analytics
- Use **Audit** to review each question with your answers
- **Retake** only incorrect questions for focused practice

## 📊 Scoring

Scores are calculated as follows:

```
Scaled Score = (Correct Answers / Total Questions) × 1000
Passing Score = 700 (70%)
```

### Score Interpretation
- **850-1000**: Excellent - Ready for certification
- **750-849**: Good - Minor review recommended
- **700-749**: Pass - Additional practice suggested
- **Below 700**: Fail - More study required

## ⌨️ Keyboard Shortcuts & Interactions

| Action | Method |
|--------|--------|
| Toggle Dark Mode | 🌙 button in navigation |
| Focus Mode | Toggle button during quiz |
| Navigate Questions | Click number in navigation grid |
| Eliminate Answer | Right-click on option |
| Select Answer | Left-click on option |
| Reorder Sequence | Drag and drop options |

## 🌐 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

### Requirements
- IndexedDB support
- ES6 JavaScript support
- CSS Custom Properties support
- Modern browser (2020+)

## 💾 Data Storage

All data is stored locally in your browser's IndexedDB:

| Store | Purpose |
|-------|---------|
| `examVault` | Imported question banks |
| `examHistory` | Completed exam sessions and results |

### Clear All Data
Open browser dev tools console and run:
```javascript
indexedDB.deleteDatabase('SnowProMasteryDB')
```

### Export Data
```javascript
// Export all exam history
const history = await db.examHistory.toArray();
console.log(JSON.stringify(history, null, 2));
```

## 🎨 Customization

### Theme Colors

Edit CSS variables in `assets/css/styles.css`:

```css
:root {
    --app-bg: #f8fafc;      /* Background color */
    --card-bg: #ffffff;     /* Card background */
    --accent: #2563eb;      /* Primary accent color */
    --txt-main: #1e293b;    /* Main text color */
    --txt-muted: #64748b;   /* Muted text color */
    --border-clr: #e2e8f0;  /* Border color */
}

[data-theme="dark"] {
    --app-bg: #0f172a;
    --card-bg: #1e293b;
    --accent: #3b82f6;
    --txt-main: #f1f5f9;
    --txt-muted: #94a3b8;
    --border-clr: #334155;
}
```

### Timer Settings

Modify default time in the config modal:
```javascript
// In quiz.js or HTML
const defaultTime = 115; // minutes
```

### Passing Score Threshold

Change in `quiz.js`:
```javascript
const PASSING_SCORE = 700; // Adjust threshold (out of 1000)
```

### Add New Certification

1. Create exam folder structure:
```
exams/
└── vendor-name/
    └── certification-name/
        └── exam-file.json
```

2. Create JSON file following the format above
3. Import via Library interface

## 📚 Example Question Banks

### Snowflake SnowPro Core
- Location: `exams/snowflake/pro core/`
- Topics: Architecture, Storage, Virtual Warehouses, Security, Data Sharing

### Databricks Data Engineer Associate
- Location: `exams/databricks/Data Eng/markdown/tests/`
- Topics: Auto Loader, Unity Catalog, Delta Live Tables, Medallion Architecture, Performance Tuning

## 🔧 Development

### File Structure
```
assets/
├── css/
│   └── styles.css          # Custom styles and CSS variables
└── js/
    ├── app.js              # Main application logic
    │   ├── Database initialization
    │   ├── Navigation management
    │   ├── Library management
    │   ├── Analytics dashboard
    │   └── Theme management
    └── quiz.js             # Quiz engine
        ├── Question rendering
        ├── Answer validation
        ├── Timer management
        ├── Score calculation
        └── Result display
```

### Adding Features

1. **New Question Type**: Modify `quiz.js` `renderQuestion()` function
2. **New Analytics**: Add to `app.js` `renderAnalytics()` function
3. **New Theme**: Add CSS variables in `styles.css`

## 🐛 Troubleshooting

### Questions Not Loading
- Check JSON file format
- Verify file is valid JSON (use JSONLint)
- Check browser console for errors

### Data Not Persisting
- Ensure browser allows IndexedDB
- Check browser storage settings
- Try clearing cache and reimporting

### Timer Issues
- Ensure browser tab remains active
- Check browser performance settings
- Disable browser extensions that may interfere

## 📄 License

This project is provided as-is for educational purposes.

## 🙏 Acknowledgments

- **SnowPro** is a trademark of Snowflake Inc.
- **Databricks Certified Data Engineer Associate** is a trademark of Databricks Inc.
- This application is not affiliated with or endorsed by Snowflake Inc. or Databricks Inc.
- Built with ❤️ for certification candidates

## 🤝 Contributing

To add new question banks:
1. Follow the JSON format specification
2. Organize files in appropriate vendor/certification folders
3. Test thoroughly before sharing
4. Ensure questions are original or properly licensed

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review the question bank format
- Verify browser compatibility
- Check browser console for errors

---

**Happy Studying! 🎓**
