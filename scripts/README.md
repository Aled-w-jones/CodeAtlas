# Python Scripts Collection

This directory contains various Python scripts that demonstrate different programming concepts and utilities.

## 📁 Directory Structure

### `/examples`
- **hello_world.py** - Basic Python syntax demonstration
- More example scripts coming soon...

### `/utilities`
- **file_manager.py** - Advanced file and directory operations
- More utility scripts coming soon...

## 🚀 Features Demonstrated

### Basic Python Concepts
- Variable assignment and string formatting
- Function definitions with type hints
- Control flow (loops, conditionals)
- Error handling with try-except blocks

### Advanced Python Features
- Object-oriented programming with classes
- Context managers and file operations
- Path manipulation with `pathlib`
- JSON serialization and deserialization
- Hash calculation and file integrity

### Code Quality Practices
- Comprehensive docstrings
- Type hints for better code documentation
- Proper error handling
- Clean code structure and organization

## 📋 Usage Examples

### Running Individual Scripts

```bash
# Run the hello world example
python scripts/examples/hello_world.py

# Run the file manager utility
python scripts/utilities/file_manager.py
```

### Import as Modules

```python
# Import specific functions
from scripts.utilities.file_manager import FileManager

# Use the FileManager class
fm = FileManager("./my_project")
files = fm.list_files("*.py", recursive=True)
```

## 🎯 Learning Objectives

These scripts are designed to help you learn:

1. **Python Fundamentals** - Basic syntax, data types, and control structures
2. **Advanced Features** - OOP, type hints, context managers
3. **File Operations** - Reading, writing, and manipulating files
4. **Error Handling** - Proper exception handling and recovery
5. **Code Documentation** - Writing clear docstrings and comments
6. **Best Practices** - Following Python coding standards (PEP 8)

## 🔍 Code Browser Integration

These scripts are optimized for viewing in the CodeAtlas code browser:

- **Syntax Highlighting** - Full Python syntax highlighting
- **Line Numbers** - Perfect alignment with code content
- **File Navigation** - Easy browsing between related files
- **Markdown Support** - This README renders beautifully
- **Copy Functionality** - Easy code copying for testing

## 📚 Additional Resources

- [Python Official Documentation](https://docs.python.org/3/)
- [PEP 8 Style Guide](https://pep8.org/)
- [Python Type Hints](https://docs.python.org/3/library/typing.html)
- [Pathlib Guide](https://docs.python.org/3/library/pathlib.html)

---

*Built with ❤️ for CodeAtlas - High-performance code browser*