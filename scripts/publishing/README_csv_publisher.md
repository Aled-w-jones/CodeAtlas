# CSV to Feature Layer Publisher

A simple utility for publishing CSV files as hosted feature layers in ArcGIS Online or Enterprise Portal.

## Overview

This script provides a streamlined approach to publishing CSV files as point feature layers, handling the asynchronous publishing process and monitoring job status. It's based on enterprise-grade workflows but simplified for ease of use.

## Features

- **Asynchronous Publishing**: Uses future-based publishing for better performance
- **Job Monitoring**: Tracks publishing progress with configurable timeouts
- **Error Handling**: Basic error reporting and cleanup
- **Simple Interface**: Minimal setup required

## Requirements

- Python 3.7+
- ArcGIS Python API (`arcgis`)
- Valid ArcGIS Online or Enterprise credentials

## Installation

```bash
pip install arcgis
```

## Usage

### Basic Example

```python
from arcgis import GIS
from csv_publisher import publish_csv_as_feature_layer

# Connect to your portal
gis = GIS("https://your-portal.com", "username", "password")

# Get your CSV item
csv_item = gis.content.get("your_csv_item_id")

# Publish as feature layer
feature_layer = publish_csv_as_feature_layer(gis, csv_item)

if feature_layer:
    print(f"Successfully published: {feature_layer.title}")
```

### CSV Requirements

Your CSV file must include:
- **Coordinate columns**: `latitude` and `longitude` columns with decimal degrees
- **OR Address fields**: Address information for geocoding
- **Data columns**: Any additional attributes you want in the feature layer

### Example CSV Format

```csv
latitude,longitude,name,category,value
40.7128,-74.0060,New York,City,100
34.0522,-118.2437,Los Angeles,City,85
41.8781,-87.6298,Chicago,City,75
```

## Configuration

### Connection Options

```python
# ArcGIS Online
gis = GIS("https://www.arcgis.com", "username", "password")

# Enterprise Portal
gis = GIS("https://your-enterprise.com/portal", "username", "password")

# Using token
gis = GIS("https://your-portal.com", token="your_token")
```

### Publishing Parameters

The script uses default publishing parameters:
- **Publishing timeout**: 5 minutes
- **Status check interval**: 5 seconds
- **Asynchronous processing**: Enabled

## Error Handling

Common issues and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| "No valid token" | Authentication failed | Check credentials |
| "Publishing timeout" | Large file or server load | Try smaller files or retry later |
| "Invalid CSV format" | Missing coordinate data | Ensure lat/lon columns exist |

## Limitations

- **File size**: Large CSV files (>100MB) may timeout
- **Coordinate system**: Assumes WGS84 decimal degrees
- **Credits**: Publishing consumes ArcGIS Online credits
- **Permissions**: Requires content creation privileges

## Related Scripts

- **spatial_analysis.py**: Perform hotspot analysis on published layers
- **arcgis_utils.py**: Enterprise-grade connection management

## Support

This script is part of the CodeAtlas project. For issues or improvements, please refer to the main project documentation.