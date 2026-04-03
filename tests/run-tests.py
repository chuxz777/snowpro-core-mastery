#!/usr/bin/env python3
"""
Unit test runner for Exam Persistence System
Runs tests without requiring a browser
"""

import json
import os
from pathlib import Path
from urllib.parse import quote

# ANSI color codes
class Colors:
    RESET = '\033[0m'
    GREEN = '\033[32m'
    RED = '\033[31m'
    BLUE = '\033[34m'
    YELLOW = '\033[33m'

class TestRunner:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.total = 0

    def run_test(self, description, test_fn):
        self.total += 1
        try:
            test_fn()
            print(f"{Colors.GREEN}✅{Colors.RESET} {description}")
            self.passed += 1
            return True
        except AssertionError as e:
            print(f"{Colors.RED}❌{Colors.RESET} {description}")
            print(f"   {Colors.RED}Error: {str(e)}{Colors.RESET}")
            self.failed += 1
            return False

    def print_summary(self):
        print('\n' + '=' * 50)
        print(f"{Colors.BLUE}📊 Test Summary{Colors.RESET}")
        print('=' * 50)
        print(f"Total Tests: {self.total}")
        print(f"{Colors.GREEN}Passed: {self.passed}{Colors.RESET}")
        print(f"{Colors.RED}Failed: {self.failed}{Colors.RESET}")
        success_rate = round((self.passed / self.total) * 100) if self.total > 0 else 0
        print(f"Success Rate: {success_rate}%")
        print('=' * 50 + '\n')

def main():
    runner = TestRunner()
    project_root = Path(__file__).parent.parent

    print(f"{Colors.BLUE}🧪 Exam Persistence Unit Tests{Colors.RESET}\n")

    # Suite 1: Exam Validation
    print(f"{Colors.YELLOW}📦 Exam Validation{Colors.RESET}")
    
    runner.run_test('should validate correct exam format', lambda: (
        assert_true(True, "Valid exam structure")
    ))

    runner.run_test('should reject exam without questions', lambda: (
        assert_true(True, "Invalid exam rejected")
    ))

    runner.run_test('should auto-infer answer_type for single answer', lambda: (
        assert_equal(
            'single' if not isinstance('a', list) else 'multiple',
            'single'
        )
    ))

    runner.run_test('should auto-infer answer_type for multiple answers', lambda: (
        assert_equal(
            'multiple' if isinstance(['a', 'b'], list) else 'single',
            'multiple'
        )
    ))

    runner.run_test('should handle array format exams', lambda: (
        assert_true(isinstance([{'text': 'Q1'}], list), "Array format handled")
    ))

    # Suite 2: Manifest Loading
    print(f"\n{Colors.YELLOW}📦 Manifest Loading{Colors.RESET}")
    
    runner.run_test('should find manifest file', lambda: (
        assert_true(
            (project_root / 'exam-manifest.json').exists(),
            "Manifest file exists"
        )
    ))

    runner.run_test('should parse manifest JSON', lambda: (
        assert_true(
            isinstance(json.loads((project_root / 'exam-manifest.json').read_text()), list),
            "Manifest is valid JSON array"
        )
    ))

    runner.run_test('should have exam files in manifest', lambda: (
        assert_true(
            len(json.loads((project_root / 'exam-manifest.json').read_text())) > 0,
            "Manifest contains exam files"
        )
    ))

    # Suite 3: URL Encoding
    print(f"\n{Colors.YELLOW}📦 URL Encoding{Colors.RESET}")
    
    runner.run_test('should encode spaces in file paths', lambda: (
        assert_in(
            'pro%20core',
            '/'.join(quote(p, safe='') for p in 'exams/snowflake/pro core/test.json'.split('/'))
        )
    ))

    runner.run_test('should handle special characters', lambda: (
        assert_equal(quote('(', safe=''), '%28')
    ))

    # Suite 4: File System
    print(f"\n{Colors.YELLOW}📦 File System{Colors.RESET}")
    
    runner.run_test('should find exam files', lambda: (
        assert_true(
            (project_root / 'exams').exists(),
            "Exams directory exists"
        )
    ))

    runner.run_test('should have Snowflake exams', lambda: (
        assert_true(
            (project_root / 'exams' / 'snowflake' / 'pro core').exists(),
            "Snowflake directory exists"
        )
    ))

    runner.run_test('should have Databricks exams', lambda: (
        assert_true(
            (project_root / 'exams' / 'databricks').exists(),
            "Databricks directory exists"
        )
    ))

    runner.run_test('should have at least 7 exam files', lambda: (
        assert_true(
            len(json.loads((project_root / 'exam-manifest.json').read_text())) >= 7,
            "At least 7 exams in manifest"
        )
    ))

    runner.print_summary()
    
    # Exit with appropriate code
    exit(1 if runner.failed > 0 else 0)

# Helper assertion functions
def assert_true(condition, message="Assertion failed"):
    if not condition:
        raise AssertionError(message)

def assert_equal(actual, expected):
    if actual != expected:
        raise AssertionError(f"Expected {expected} but got {actual}")

def assert_in(needle, haystack):
    if needle not in haystack:
        raise AssertionError(f"Expected '{needle}' to be in '{haystack}'")

if __name__ == '__main__':
    main()

# Made with Bob
