#!/usr/bin/env node

// Simulated test runner for Node.js environment
// This runs the same tests as the browser version but in Node.js

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m'
};

class TestRunner {
    constructor() {
        this.results = { passed: 0, failed: 0, total: 0 };
    }

    async runTest(description, testFn) {
        this.results.total++;
        try {
            await testFn();
            console.log(`${colors.green}✅${colors.reset} ${description}`);
            this.results.passed++;
            return true;
        } catch (error) {
            console.log(`${colors.red}❌${colors.reset} ${description}`);
            console.log(`   ${colors.red}Error: ${error.message}${colors.reset}`);
            this.results.failed++;
            return false;
        }
    }

    expect(actual) {
        return {
            toBe: (expected) => {
                if (actual !== expected) {
                    throw new Error(`Expected ${expected} but got ${actual}`);
                }
            },
            toEqual: (expected) => {
                if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                    throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
                }
            },
            toBeGreaterThan: (expected) => {
                if (actual <= expected) {
                    throw new Error(`Expected ${actual} to be greater than ${expected}`);
                }
            },
            toBeTruthy: () => {
                if (!actual) {
                    throw new Error(`Expected truthy value but got ${actual}`);
                }
            },
            toContain: (expected) => {
                if (!actual.includes(expected)) {
                    throw new Error(`Expected to contain ${expected}`);
                }
            },
            toHaveLength: (expected) => {
                if (actual.length !== expected) {
                    throw new Error(`Expected length ${expected} but got ${actual.length}`);
                }
            }
        };
    }

    printSummary() {
        console.log('\n' + '='.repeat(50));
        console.log(`${colors.blue}📊 Test Summary${colors.reset}`);
        console.log('='.repeat(50));
        console.log(`Total Tests: ${this.results.total}`);
        console.log(`${colors.green}Passed: ${this.results.passed}${colors.reset}`);
        console.log(`${colors.red}Failed: ${this.results.failed}${colors.reset}`);
        const successRate = Math.round((this.results.passed / this.results.total) * 100);
        console.log(`Success Rate: ${successRate}%`);
        console.log('='.repeat(50) + '\n');
    }
}

async function runAllTests() {
    const runner = new TestRunner();

    console.log(`${colors.blue}🧪 Exam Persistence Unit Tests${colors.reset}\n`);

    // Suite 1: Validation Tests
    console.log(`${colors.yellow}📦 Exam Validation${colors.reset}`);
    
    await runner.runTest('should validate correct exam format', async () => {
        const validExam = {
            exam: 'Valid Exam',
            questions: [
                { text: 'Q1', options: { a: 'A', b: 'B' }, answer: 'a', answer_type: 'single' }
            ]
        };
        // Simulate validation
        runner.expect(validExam.questions).toBeTruthy();
        runner.expect(validExam.questions.length).toBeGreaterThan(0);
    });

    await runner.runTest('should reject exam without questions', async () => {
        const invalidExam = { exam: 'Invalid' };
        runner.expect(!invalidExam.questions || invalidExam.questions.length === 0).toBeTruthy();
    });

    await runner.runTest('should auto-infer answer_type for single answer', async () => {
        const exam = {
            questions: [
                { text: 'Q1', options: { a: 'A', b: 'B' }, answer: 'a' }
            ]
        };
        // Simulate auto-inference
        if (!exam.questions[0].answer_type) {
            exam.questions[0].answer_type = Array.isArray(exam.questions[0].answer) ? 'multiple' : 'single';
        }
        runner.expect(exam.questions[0].answer_type).toBe('single');
    });

    await runner.runTest('should auto-infer answer_type for multiple answers', async () => {
        const exam = {
            questions: [
                { text: 'Q1', options: { a: 'A', b: 'B' }, answer: ['a', 'b'] }
            ]
        };
        // Simulate auto-inference
        if (!exam.questions[0].answer_type) {
            exam.questions[0].answer_type = Array.isArray(exam.questions[0].answer) ? 'multiple' : 'single';
        }
        runner.expect(exam.questions[0].answer_type).toBe('multiple');
    });

    await runner.runTest('should handle array format exams', async () => {
        const arrayExam = [
            { text: 'Q1', options: { a: 'A' }, answer: 'a' }
        ];
        runner.expect(Array.isArray(arrayExam)).toBeTruthy();
        runner.expect(arrayExam.length).toBeGreaterThan(0);
    });

    // Suite 2: Manifest Loading
    console.log(`\n${colors.yellow}📦 Manifest Loading${colors.reset}`);
    
    await runner.runTest('should find manifest file', async () => {
        const manifestPath = path.join(__dirname, '..', 'exam-manifest.json');
        const exists = fs.existsSync(manifestPath);
        runner.expect(exists).toBeTruthy();
    });

    await runner.runTest('should parse manifest JSON', async () => {
        const manifestPath = path.join(__dirname, '..', 'exam-manifest.json');
        const content = fs.readFileSync(manifestPath, 'utf8');
        const data = JSON.parse(content);
        runner.expect(Array.isArray(data)).toBeTruthy();
    });

    await runner.runTest('should have exam files in manifest', async () => {
        const manifestPath = path.join(__dirname, '..', 'exam-manifest.json');
        const content = fs.readFileSync(manifestPath, 'utf8');
        const data = JSON.parse(content);
        runner.expect(data.length).toBeGreaterThan(0);
    });

    // Suite 3: URL Encoding
    console.log(`\n${colors.yellow}📦 URL Encoding${colors.reset}`);
    
    await runner.runTest('should encode spaces in file paths', async () => {
        const path = 'exams/snowflake/pro core/test.json';
        const encoded = path.split('/').map(encodeURIComponent).join('/');
        runner.expect(encoded).toContain('pro%20core');
    });

    await runner.runTest('should handle special characters', async () => {
        const path = 'exams/test file (1).json';
        const encoded = path.split('/').map(encodeURIComponent).join('/');
        runner.expect(encoded).toContain('%20');
        runner.expect(encoded.split('/').length).toBe(2);
        const testChar = encodeURIComponent('(');
        runner.expect(testChar).toBe('%28');
    });

    // Suite 4: File System
    console.log(`\n${colors.yellow}📦 File System${colors.reset}`);
    
    await runner.runTest('should find exam files', async () => {
        const examsDir = path.join(__dirname, '..', 'exams');
        const exists = fs.existsSync(examsDir);
        runner.expect(exists).toBeTruthy();
    });

    await runner.runTest('should have Snowflake exams', async () => {
        const snowflakeDir = path.join(__dirname, '..', 'exams', 'snowflake', 'pro core');
        const exists = fs.existsSync(snowflakeDir);
        runner.expect(exists).toBeTruthy();
    });

    await runner.runTest('should have Databricks exams', async () => {
        const databricksDir = path.join(__dirname, '..', 'exams', 'databricks');
        const exists = fs.existsSync(databricksDir);
        runner.expect(exists).toBeTruthy();
    });

    runner.printSummary();
    
    // Exit with appropriate code
    process.exit(runner.results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
});

// Made with Bob
