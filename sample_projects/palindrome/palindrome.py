import re

def is_palindrome(s: str) -> bool:
    """
    Check if a string is a palindrome.
    Ignores non-alphanumeric characters and case differences.
    """
    if not isinstance(s, str):
        return False
    clean = re.sub(r"[^a-zA-Z0-9]", "", s).lower()
    return clean == clean[::-1]
