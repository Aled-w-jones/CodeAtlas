#!/usr/bin/env python3
"""
A simple Hello World example demonstrating basic Python syntax.

This script shows:
- Basic print statements
- String formatting
- Variable assignment
- Function definition
"""

def greet(name: str) -> str:
    """
    Generate a personalized greeting message.
    
    Args:
        name: The name of the person to greet
        
    Returns:
        A formatted greeting string
    """
    return f"Hello, {name}! Welcome to PythonMap MK2! 🚀"

def main():
    """Main function that demonstrates the greeting functionality."""
    # Simple greeting
    print("Hello, World!")
    
    # Personalized greetings
    names = ["Alice", "Bob", "Charlie"]
    
    for name in names:
        greeting = greet(name)
        print(greeting)
    
    # Interactive greeting
    user_name = input("What's your name? ")
    if user_name:
        print(greet(user_name))
    else:
        print("Hello, Anonymous User!")

if __name__ == "__main__":
    main()