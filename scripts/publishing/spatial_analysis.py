"""
Simple Spatial Analysis on Feature Layer
Simplified version of hotspot analysis from Enterprise Testing Tool
"""

from arcgis import GIS
import requests
import json
import urllib.parse
import time

def run_hotspot_analysis(gis, feature_layer, output_name="HotSpotAnalysis"):
    """
    Run hotspot analysis on a feature layer.
    
    Args:
        gis: GIS connection object
        feature_layer: The feature layer to analyze
        output_name: Name for the output analysis layer
        
    Returns:
        Analysis result item if successful, None if failed
    """
    try:
        print("Starting hotspot analysis...")
        
        # Get the hosting server URL
        hosting_server = None
        for server in gis.servers['servers']:
            if server['serverRole'] == 'HOSTING_SERVER':
                hosting_server = server['url']
                break
                
        if not hosting_server:
            print("No hosting server found")
            return None

        # Get token
        token = gis._con.token
        if not token:
            print("No valid token available")
            return None
        
        # Set up analysis parameters
        service_url = feature_layer.url if feature_layer.url.endswith("/0") else f"{feature_layer.url}/0"
        
        output_props = urllib.parse.quote(json.dumps({
            "serviceProperties": {"name": output_name},
            "itemProperties": {
                "description": "Feature layer generated from running the Find Hot Spots analysis tool.",
                "snippet": "Feature layer generated from Find Hot Spots",
                "title": output_name,
                "folderId": ""
            }
        }), safe='')
        
        analysis_layer = urllib.parse.quote(json.dumps({
            "url": service_url, 
            "itemId": feature_layer.id
        }), safe='')
        
        # Submit analysis job
        submit_url = (f"{hosting_server}/rest/services/System/SpatialAnalysisTools/GPServer/FindHotSpots/submitJob?"
                     f"shapeType=hexagon&"
                     f"outputName={output_props}&"
                     f"analysisLayer={analysis_layer}&"
                     f"f=json&"
                     f"token={token}")
        
        response = requests.get(submit_url)
        response.raise_for_status()
        job_info = response.json()

        if 'jobId' not in job_info:
            print(f"No jobId in response: {job_info}")
            return None

        job_id = job_info['jobId']
        job_url = f"{hosting_server}/rest/services/System/SpatialAnalysisTools/GPServer/FindHotSpots/jobs/{job_id}"

        # Monitor job status
        print("Monitoring analysis job...")
        start_time = time.time()
        while time.time() - start_time < 300:  # 5-minute timeout
            status_response = requests.get(
                job_url, 
                params={'f': 'json', 'token': token}
            )
            status = status_response.json()
            job_status = status.get('jobStatus')
            print(f"Job status: {job_status}")

            if job_status == 'esriJobFailed':
                error_message = status.get('messages', [{}])[0].get('description', 'Unknown error')
                print(f"Analysis job failed: {error_message}")
                return None
            
            elif job_status == 'esriJobSucceeded':
                # Wait for the item to be created
                time.sleep(2)
                
                # Search for the result
                results = gis.content.search(f"title:{output_name}")
                if results:
                    print(f"Analysis completed successfully: {results[0].title}")
                    return results[0]
                else:
                    print("Analysis completed but result item not found")
                    return None
            
            time.sleep(5)
        
        print("Analysis job timed out")
        return None
        
    except Exception as e:
        print(f"Error during analysis: {str(e)}")
        return None

def main():
    """
    Example usage of spatial analysis
    """
    # Connect to GIS
    gis = GIS("https://your-portal.com", "username", "password")
    
    # Get a feature layer to analyze (replace with your feature layer item ID)
    feature_layer = gis.content.get("your_feature_layer_id")
    
    if feature_layer:
        # Run hotspot analysis
        analysis_result = run_hotspot_analysis(gis, feature_layer, "MyHotSpotAnalysis")
        
        if analysis_result:
            print(f"Analysis completed: {analysis_result.title}")
        else:
            print("Analysis failed")
    else:
        print("Feature layer not found")

if __name__ == "__main__":
    main()