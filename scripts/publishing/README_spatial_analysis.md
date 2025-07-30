# Spatial Analysis - Hotspot Detection

Perform hotspot analysis on point feature layers using ArcGIS spatial analysis tools. This script demonstrates how to programmatically submit and monitor spatial analysis jobs.

## Overview

This utility runs the Find Hot Spots analysis tool, which identifies statistically significant clusters of high values (hot spots) and low values (cold spots) in your point data. It's designed for analyzing patterns in geographic data such as crime incidents, sales locations, or any point phenomena with numeric attributes.

## Features

- **Automated Analysis**: Submit hotspot analysis jobs programmatically  
- **Job Monitoring**: Track analysis progress with status polling
- **Result Retrieval**: Automatically find and return analysis results
- **Error Handling**: Detect and report analysis failures
- **Flexible Parameters**: Configurable analysis settings

## Requirements

- Python 3.7+
- ArcGIS Python API (`arcgis`)
- `requests` library
- ArcGIS Online or Enterprise with spatial analysis capabilities
- Point feature layer with numeric attributes

## Installation

```bash
pip install arcgis requests
```

## Usage

### Basic Example

```python
from arcgis import GIS
from spatial_analysis import run_hotspot_analysis

# Connect to your portal
gis = GIS("https://your-portal.com", "username", "password")

# Get your feature layer
feature_layer = gis.content.get("your_feature_layer_id")

# Run hotspot analysis
result = run_hotspot_analysis(gis, feature_layer, "Crime_Hotspots_2024")

if result:
    print(f"Analysis completed: {result.title}")
```

### Advanced Configuration

```python
# Custom analysis with specific parameters
result = run_hotspot_analysis(
    gis=gis,
    feature_layer=my_layer,
    output_name="CustomHotspots",
    shape_type="hexagon"  # Default shape type
)
```

## Data Requirements

### Input Feature Layer
Your point feature layer should have:
- **Point geometry**: Geographic point locations
- **Numeric attributes**: Values to analyze for clustering
- **Sufficient data**: At least 30 points for meaningful results
- **Proper distribution**: Points should be reasonably spread out

### Example Data Structure
```
Point ID | Latitude | Longitude | Incident_Count | Severity
---------|----------|-----------|----------------|----------
1        | 40.7128  | -74.0060  | 15            | High
2        | 40.7589  | -73.9851  | 8             | Medium
3        | 40.6782  | -73.9442  | 22            | High
```

## Analysis Parameters

### Shape Types
- **hexagon** (default): Creates hexagonal bins for analysis
- **square**: Uses square bins
- **fishnet**: Creates a fishnet grid

### Output Properties
The analysis creates:
- **Hot spots**: Areas with statistically high values (red)
- **Cold spots**: Areas with statistically low values (blue)  
- **Confidence levels**: 90%, 95%, and 99% confidence intervals
- **Z-scores**: Statistical significance measures

## Configuration

### Connection Setup
```python
# ArcGIS Online
gis = GIS("https://www.arcgis.com", "username", "password")

# Enterprise Portal  
gis = GIS("https://your-enterprise.com/portal", "username", "password")

# Using environment variables (recommended)
import os
gis = GIS(
    url=os.getenv("ARCGIS_URL"),
    username=os.getenv("ARCGIS_USERNAME"), 
    password=os.getenv("ARCGIS_PASSWORD")
)
```

### Analysis Settings
```python
# Default settings
TIMEOUT = 300  # 5 minutes
CHECK_INTERVAL = 5  # seconds
SHAPE_TYPE = "hexagon"
```

## Error Handling

Common issues and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| "No hosting server found" | Missing spatial analysis server | Check Enterprise configuration |
| "Analysis job failed" | Invalid input data | Verify point layer has numeric fields |
| "Job timed out" | Large dataset or server load | Increase timeout or retry |
| "No valid token" | Authentication issue | Check credentials and permissions |

## Monitoring Analysis Jobs

The script provides real-time status updates:

```
Job status: esriJobSubmitted
Job status: esriJobExecuting  
Job status: esriJobSucceeded
Analysis completed successfully: Crime_Hotspots_2024
```

## Result Interpretation

### Hot Spot Classification
- **Hot Spot - 99% Confidence**: Statistically significant high values
- **Hot Spot - 95% Confidence**: Moderately significant high values  
- **Hot Spot - 90% Confidence**: Somewhat significant high values
- **Not Significant**: No statistical clustering
- **Cold Spot**: Statistically significant low values (90%, 95%, 99%)

### Z-Score Interpretation
- **Z > 2.58**: 99% confidence hot spot
- **Z > 1.96**: 95% confidence hot spot
- **Z > 1.65**: 90% confidence hot spot
- **-1.65 < Z < 1.65**: Not significant
- **Z < -1.65**: Cold spot (90%, 95%, 99%)

## Limitations

- **Credits**: Analysis consumes ArcGIS Online credits
- **Server Requirements**: Needs hosting server with spatial analysis
- **Data Size**: Large datasets may require longer processing times
- **Point Data Only**: Works only with point feature layers
- **Numeric Fields**: Requires numeric attributes for analysis

## Related Scripts

- **csv_publisher.py**: Publish CSV data as point feature layers
- **arcgis_utils.py**: Enterprise connection management

## Support

This script is part of the CodeAtlas project. For advanced spatial analysis workflows, consider the enterprise-grade tools in the main utilities collection.