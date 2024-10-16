import os
import requests
import boto3 # type: ignore
import json

s3 = boto3.client('s3')
BUCKET_NAME = os.environ['BUCKET_NAME']
CATS_API = os.environ['CATS_API']

def handler(event, context):
    try:
        # Call the API
        response = requests.get(CATS_API)
        response.raise_for_status()
        
        # Extract image URL and ID
        data = response.json()[0]
        image_url = data['url']
        image_id = data['id']
        
        # Download the image
        image_response = requests.get(image_url)
        image_response.raise_for_status()
        
        # Upload the image to S3
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=f"{image_id}.jpg",
            Body=image_response.content,
            ContentType='image/jpeg'
        )
        
        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": f"Image {image_id} uploaded successfully.",
                "imageId": image_id
            }),
            "headers": {
                "Content-Type": "application/json"
            }
        }
    except Exception as e:
        return {"statusCode": 500, "body": str(e)}
