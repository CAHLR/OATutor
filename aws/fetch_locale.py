import json
import boto3

s3 = boto3.client('s3')

def lambda_handler(event, context):
    BUCKET_NAME = 'oatutor-locales'
    locale = event['queryStringParameters']['locale']
    key = f"{locale}.json"

    try:
        response = s3.get_object(Bucket=BUCKET_NAME, Key=key)
        body = response['Body'].read().decode('utf-8')
        json_body = json.loads(body)

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*', 
                'Access-Control-Allow-Methods': 'GET,OPTIONS',  
                'Access-Control-Allow-Headers': '*', 
            },
            'body': json.dumps(json_body)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*', 
                'Access-Control-Allow-Methods': 'GET,OPTIONS',  
                'Access-Control-Allow-Headers': '*', 
            },
            'body': json.dumps({'message': 'Could not fetch the JSON file', 'error': str(e)}),

        }
