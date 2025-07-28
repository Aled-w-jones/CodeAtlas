#!/usr/bin/env python3
"""
File Management Utilities

A collection of utility functions for file and directory operations.
Demonstrates advanced Python concepts including:
- Path manipulation with pathlib
- Context managers
- Error handling
- Type hints
- Docstrings
"""

import os
import shutil
from pathlib import Path
from typing import List, Optional, Union
import json
import hashlib


class FileManager:
    """A utility class for file and directory operations."""
    
    def __init__(self, base_path: Union[str, Path] = "."):
        """
        Initialize FileManager with a base directory.
        
        Args:
            base_path: The base directory for operations
        """
        self.base_path = Path(base_path).resolve()
        self.ensure_directory_exists(self.base_path)
    
    def ensure_directory_exists(self, path: Union[str, Path]) -> Path:
        """
        Ensure a directory exists, creating it if necessary.
        
        Args:
            path: Directory path to create
            
        Returns:
            Path object of the created/existing directory
        """
        path_obj = Path(path)
        path_obj.mkdir(parents=True, exist_ok=True)
        return path_obj
    
    def list_files(self, pattern: str = "*", recursive: bool = False) -> List[Path]:
        """
        List files matching a pattern.
        
        Args:
            pattern: Glob pattern to match files
            recursive: Whether to search recursively
            
        Returns:
            List of matching file paths
        """
        if recursive:
            return list(self.base_path.rglob(pattern))
        else:
            return list(self.base_path.glob(pattern))
    
    def copy_file(self, source: Union[str, Path], destination: Union[str, Path]) -> bool:
        """
        Copy a file from source to destination.
        
        Args:
            source: Source file path
            destination: Destination file path
            
        Returns:
            True if successful, False otherwise
        """
        try:
            source_path = Path(source)
            dest_path = Path(destination)
            
            # Ensure destination directory exists
            self.ensure_directory_exists(dest_path.parent)
            
            shutil.copy2(source_path, dest_path)
            return True
        except Exception as e:
            print(f"Error copying file: {e}")
            return False
    
    def get_file_hash(self, file_path: Union[str, Path], algorithm: str = "md5") -> Optional[str]:
        """
        Calculate hash of a file.
        
        Args:
            file_path: Path to the file
            algorithm: Hash algorithm (md5, sha1, sha256)
            
        Returns:
            Hexadecimal hash string or None if error
        """
        try:
            hasher = hashlib.new(algorithm)
            with open(file_path, 'rb') as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hasher.update(chunk)
            return hasher.hexdigest()
        except Exception as e:
            print(f"Error calculating hash: {e}")
            return None
    
    def save_json(self, data: dict, filename: str) -> bool:
        """
        Save data as JSON file.
        
        Args:
            data: Dictionary to save as JSON
            filename: Output filename
            
        Returns:
            True if successful, False otherwise
        """
        try:
            file_path = self.base_path / filename
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"Error saving JSON: {e}")
            return False
    
    def load_json(self, filename: str) -> Optional[dict]:
        """
        Load data from JSON file.
        
        Args:
            filename: JSON filename to load
            
        Returns:
            Loaded dictionary or None if error
        """
        try:
            file_path = self.base_path / filename
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading JSON: {e}")
            return None


def demo_file_operations():
    """Demonstrate the FileManager capabilities."""
    # Create a FileManager instance
    fm = FileManager("./temp_demo")
    
    # Create some demo data
    demo_data = {
        "project": "PythonMap MK2",
        "version": "2.0.0",
        "features": ["Performance", "Line Alignment", "Reliability"],
        "technologies": ["Astro", "Svelte", "Tailwind"]
    }
    
    # Save JSON data
    if fm.save_json(demo_data, "project_info.json"):
        print("✅ JSON data saved successfully")
    
    # Load JSON data
    loaded_data = fm.load_json("project_info.json")
    if loaded_data:
        print("✅ JSON data loaded successfully:")
        print(f"   Project: {loaded_data['project']}")
        print(f"   Version: {loaded_data['version']}")
    
    # List files
    json_files = fm.list_files("*.json")
    print(f"✅ Found {len(json_files)} JSON files")
    
    # Calculate file hash
    if json_files:
        file_hash = fm.get_file_hash(json_files[0])
        print(f"✅ File hash (MD5): {file_hash}")


if __name__ == "__main__":
    print("🚀 FileManager Demo - PythonMap MK2")
    print("=" * 40)
    demo_file_operations()