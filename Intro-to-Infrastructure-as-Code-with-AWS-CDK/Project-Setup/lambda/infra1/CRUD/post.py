import json
import boto3 # type: ignore
import os
import uuid

dynamodb = boto3.resource('dynamodb')
table_name = os.environ['DYNAMODB_TABLE_NAME']
table = dynamodb.Table(table_name)

def handler(event, context):
    # Parse the body of the incoming request
    if event['httpMethod'] == 'POST':
        try:
            body = json.loads(event['body'])
            # Generate a unique ID for the item
            item_id = str(uuid.uuid4())
            # Insert the item into the DynamoDB table
            table.put_item(
                Item={
                    'id': item_id,
                    'data': body  # Assuming the entire body is what you want to store
                }
            )
            return {
                'statusCode': 200,
                'body': json.dumps({'message': 'Data added successfully!', 'id': item_id})
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'body': json.dumps({'message': 'Error adding data', 'error': str(e)})
            }
    else:
        return {
            'statusCode': 401,
            'body': 'Invalid Request'
        }
