# Unit Tests

This directory contains unit tests for the Exam Persistence System.

## Running Tests

1. **Start the server** (from project root):
   ```bash
   bash start.sh
   ```

2. **Open test page** in browser:
   ```
   http://localhost:8080/tests/test-exam-persistence.html
   ```

3. **Click "Run All Tests"** button

## Test Suites

### 1. Database Operations
Tests IndexedDB functionality:
- ✅ Database connection
- ✅ Adding exams
- ✅ Retrieving exams
- ✅ Finding exams by name

### 2. Exam Validation
Tests the validation system:
- ✅ Valid exam format detection
- ✅ Invalid exam rejection
- ✅ Auto-inference of `answer_type` for single answers
- ✅ Auto-inference of `answer_type` for multiple answers
- ✅ Array format exam handling

### 3. Manifest Loading
Tests manifest file operations:
- ✅ Fetching manifest file
- ✅ Parsing JSON
- ✅ Verifying exam files exist

### 4. URL Encoding
Tests path encoding:
- ✅ Encoding spaces in paths
- ✅ Handling special characters

## Test Results

The test page shows:
- ✅ **Pass** - Test succeeded
- ❌ **Fail** - Test failed (with error message)
- ⏳ **Pending** - Test not yet run

## Summary Statistics

After running tests, you'll see:
- Total number of tests
- Number passed
- Number failed
- Success rate percentage

## Utilities

- **Clear Database** - Removes all data from IndexedDB
- **Refresh** - Reloads the test page
- **Run All Tests** - Executes all test suites

## Adding New Tests

To add new tests, edit `test-exam-persistence.html` and add a new suite:

```javascript
suites.push(runner.describe('Your Test Suite', () => {
    runner.it('should do something', async () => {
        // Your test code
        runner.expect(actual).toBe(expected);
    });
}));
```

## Assertions Available

- `toBe(expected)` - Strict equality
- `toEqual(expected)` - Deep equality
- `toBeGreaterThan(expected)` - Numeric comparison
- `toBeTruthy()` - Truthy check
- `toContain(expected)` - Array/string contains
- `toHaveLength(expected)` - Length check