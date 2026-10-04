import pytest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from math_utils import fibonacci

def test_fibonacci_base_cases():
    assert fibonacci(0) == 0
    assert fibonacci(1) == 1

def test_fibonacci_positive():
    assert fibonacci(2) == 1
    assert fibonacci(5) == 5
    assert fibonacci(10) == 55

def test_fibonacci_negative_error():
    with pytest.raises(ValueError):
        fibonacci(-1)
