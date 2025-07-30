# Adding Content to CodeAtlas

This guide shows how to add scripts, directories, and notepads with annotations to your CodeAtlas installation.

## Adding Scripts & Directories

### 1. Basic File Structure
Add your files to the `scripts/` directory:

```
scripts/
├── your_script.py
├── config.json
├── README.md
├── project_folder/
│   ├── main.py
│   ├── utils.py
│   └── README.md
```

### 2. README Files
- Add `README.md` files to directories for automatic documentation
- READMEs are displayed in split-view with code files
- Use standard markdown syntax for formatting

## Adding Notepads

### 1. Update Notepads Registry
Edit `data/notepads.json` to add your script:

```json
{
  "id": "your_script_id",
  "title": "Your Script Title",
  "description": "Brief description of what the script does",
  "filePath": "scripts/your_script.py",
  "readmeFile": "scripts/your_script_README.md",
  "tags": ["tag1", "tag2", "category"],
  "dependencies": ["requests", "pandas"],
  "lastUpdated": "2024-01-01"
}
```

### 2. Create Annotations (Optional)
Create `data/annotations/your_script_id.json` for interactive features:

```json
{
  "annotations": [
    {
      "id": "import_section",
      "lines": "1-5",
      "title": "Import Section",
      "content": "Essential imports for the script functionality",
      "type": "info"
    },
    {
      "id": "main_function",
      "line": 15,
      "title": "Main Function",
      "content": "The core logic of the script",
      "type": "important"
    }
  ],
  "walkthrough": {
    "title": "Script Walkthrough",
    "description": "Step-by-step guide through the code",
    "steps": [
      {
        "title": "Setup",
        "focus": "import_section",
        "content": "First, we import the required libraries..."
      },
      {
        "title": "Main Logic", 
        "focus": "main_function",
        "content": "The main function processes the data..."
      }
    ]
  }
}
```

## Annotation Types

### Line References
- Single line: `"line": 10`
- Multiple lines: `"lines": "5-15"`
- Line range: `"lines": "1-5"`

### Annotation Types
- `"info"` - General information (blue highlight)
- `"important"` - Key sections (yellow highlight)
- `"warning"` - Important notes (orange highlight)
- `"error"` - Potential issues (red highlight)

## File Organization Tips

1. **Group Related Files**: Keep scripts and their READMEs together
2. **Use Descriptive Names**: Clear file and folder names improve navigation
3. **Add Documentation**: README files enhance the browsing experience
4. **Consistent Structure**: Follow the same patterns across projects

## Building & Testing

After adding content:

```bash
npm run build    # Build the project
npm run dev      # Test locally
```

Your new content will be automatically indexed and available in both the file browser and notepads section.