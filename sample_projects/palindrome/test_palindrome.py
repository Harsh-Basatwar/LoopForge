import pytest
from palindrome import is_palindrome

def test_palindrome_simple():
    assert is_palindrome("radar") is True
    assert is_palindrome("hello") is False

def test_palindrome_with_spaces_and_punctuation():
    assert is_palindrome("A man, a plan, a canal: Panama") is True
    assert is_palindrome("No 'x' in Nixon") is True

def test_palindrome_empty():
    assert is_palindrome("") is True
