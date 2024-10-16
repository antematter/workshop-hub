import json
import boto3 # type: ignore
import os
from boto3.dynamodb.conditions import Key, Attr # type: ignore

dynamodb = boto3.resource('dynamodb')

def handler(event, context):
    # Retrieve the table name from environment variables or hardcode it
    table_name = os.environ.get('DYNAMODB_TABLE_NAME', 'YourTableName') 

    # Reference the DynamoDB table
    table = dynamodb.Table(table_name)
    if event["httpMethod"] != "GET":
        return {
            'statusCode': 401,
            'body': 'Invalid Request'
        }
    try:
        # Scan the table to retrieve all items
        response = table.scan()
        data = response.get('Items', [])

        # Return the data as a JSON response
        return {
            'statusCode': 200,
            'body': json.dumps(data)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Error retrieving data', 'error': str(e)})
        }
