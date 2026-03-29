# SnowPro Core Mastery Suite

A modern, feature-rich web application for preparing for the SnowPro Core Certification exam. Built with vanilla JavaScript and Tailwind CSS, this single-page application provides an interactive quiz experience with practice and exam simulator modes.

## Features

### Core Functionality
- **Question Bank Library**: Import and manage multiple JSON-based exam question banks
- **Dual Mode Testing**:
  - **Practice Mode**: Untimed sessions with instant feedback
  - **Simulator Mode**: Timed exam sessions that mimic real testing conditions
- **Focus Mode**: Distraction-free interface for concentrated studying
- **Dark/Light Theme**: Toggle between themes for comfortable viewing

### Quiz Features
- **Multiple Question Types**: Support for single-answer, multiple-answer, and sequence-based questions
- **Right-Click to Eliminate**: Strike-through option answers (process of elimination)
- **Step Indicators**: Visual badges for sequence ordering questions
- **Instant Feedback**: Real-time pass/fail indicators after answering
- **Detailed Explanations**: View reasoning for each question after answering
- **Question Navigation Grid**: Jump between questions and see status at a glance
- **Progress Tracking**: Visual progress bar showing exam completion

### Analytics & Review
- **Dashboard Statistics**: Track total banks, attempts, and average accuracy
- **Topic Proficiency**: Visual breakdown of performance by category
- **Exam History Log**: Complete record of all sessions with pass/fail status
- **Audit Tool**: Review every question from past attempts with correct/incorrect answers
- **Retake Errors**: Create custom sessions from incorrectly answered questions

### Data Persistence
- **IndexedDB Storage**: All data stored locally using Dexie.js
- **No Server Required**: Fully client-side application
- **Import/Export**: Load question banks from JSON files

## Project Structure

```
backup/
├── index.html              # Main application HTML
├── assets/
│   ├── css/
│   │   └── styles.css      # Custom CSS variables and styles
│   └── js/
│       ├── app.js          # UI management, navigation, analytics
│       └── quiz.js         # Quiz logic, timer, scoring
└── exams/
    └── *.json              # Question bank files (optional)
```

## Technologies Used

- **HTML5** - Semantic markup
- **Tailwind CSS** (CDN) - Utility-first styling
- **Vanilla JavaScript** - No framework dependencies
- **Dexie.js** (CDN) - IndexedDB wrapper for data persistence
- **Canvas Confetti** (CDN) - Celebration effects for passing scores

## Question Bank Format

Create JSON files with the following structure:

```json
{
  "exam": "Exam Name",
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
    },
    {
      "text": "Select all that apply",
      "options": {
        "A": "Option A",
        "B": "Option B",
        "C": "Option C"
      },
      "answer": ["A", "C"],
      "answer_type": "multiple"
    },
    {
      "text": "Order the steps",
      "options": {
        "A": "Step 1",
        "B": "Step 2",
        "C": "Step 3"
      },
      "answer": ["B", "A", "C"],
      "answer_type": "sequence"
    }
  ]
}
```

### Question Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `text` | string | Yes | The question text |
| `options` | object | Yes | Key-value pairs of answer choices |
| `answer` | string/array | Yes | Correct answer(s) - key(s) from options |
| `answer_type` | string | No | `single`, `multiple`, or `sequence` |
| `category1` | string | No | Category for analytics grouping |
| `explanation` | string | No | Explanation shown after answering |

## Usage

### Running the Application

1. Open `index.html` in any modern web browser
2. No build process or server required

### Importing Question Banks

1. Navigate to the **Library** view
2. Click **Import JSON**
3. Select one or more `.json` files containing questions

### Taking an Exam

1. From the **Home** dashboard, select a question bank
2. Choose **Practice** (untimed) or **Simulator** (timed) mode
3. Configure session settings:
   - Time limit (minutes)
   - Number of questions
   - Randomize questions toggle
4. Answer questions using:
   - **Left-click** to select/deselect answers
   - **Right-click** to strike-through (eliminate) options
5. Click **Confirm** to lock in your answer
6. Review feedback and explanation before proceeding

### Reviewing Results

After completing a session:
- View scaled score (out of 1000)
- See pass/fail status (700+ to pass)
- Review raw score and percentage
- Access **The Lab** for detailed logs
- Use **Audit** to review each question
- **Retake** incorrect questions

## Scoring

Scores are calculated as follows:

```
Scaled Score = (Correct Answers / Total Questions) × 1000
Passing Score = 700 (70%)
```

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Toggle Dark Mode | 🌙 button in navigation |
| Focus Mode | Toggle button during quiz |
| Navigate Questions | Click number in navigation grid |

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

Requires a browser with:
- IndexedDB support
- ES6 JavaScript support
- CSS Custom Properties support

## Data Storage

All data is stored locally in your browser's IndexedDB:

| Store | Purpose |
|-------|---------|
| `examVault` | Imported question banks |
| `examHistory` | Completed exam sessions and results |

To clear all data, open browser dev tools and run:
```javascript
indexedDB.deleteDatabase('SnowProMasteryDB')
```

## Customization

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
```

### Timer Settings

Modify default time in the config modal HTML (line 171):
```html
<input type="number" id="config-time" value="115" ...>
```

### Passing Score Threshold

Change in `quiz.js` line 169:
```javascript
const passed = scaledScore >= 700; // Adjust threshold
```

## License

This project is provided as-is for educational purposes.

## Acknowledgments

- SnowPro is a trademark of Snowflake Inc.
- This application is not affiliated with or endorsed by Snowflake Inc.
