import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class CRDStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a DynamoDB table
    const table = new dynamodb.Table(this, "crudTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      tableName: "crud_table",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda function to retrieve all data from DynamoDB
    const readData = new lambda.Function(this, "readData", {
      runtime: lambda.Runtime.PYTHON_3_12,
      code: lambda.Code.fromAsset("lambda"),
      handler: "infra1/CRUD/read.handler",
      functionName: "Get-All-Data-lambda",
      description: "This lambda retrieves all items from the DynamoDB table",
      memorySize: 1024,
      ephemeralStorageSize: cdk.Size.mebibytes(512),
      timeout: cdk.Duration.seconds(5),
      environment: {
        DYNAMODB_TABLE_NAME: table.tableName,
      },
    });

    // Lambda function to retrieve all data from DynamoDB
    const postData = new lambda.Function(this, "postData", {
      runtime: lambda.Runtime.PYTHON_3_12,
      code: lambda.Code.fromAsset("lambda"),
      handler: "infra1/CRUD/post.handler",
      functionName: "Post-Data-lambda",
      description: "This lambda POSTs a new item to the DynamoDB table",
      memorySize: 1024,
      ephemeralStorageSize: cdk.Size.mebibytes(512),
      timeout: cdk.Duration.seconds(5),
      environment: {
        DYNAMODB_TABLE_NAME: table.tableName,
      },
    });

    // Lambda function to retrieve all data from DynamoDB
    const deleteData = new lambda.Function(this, "deleteData", {
      runtime: lambda.Runtime.PYTHON_3_12,
      code: lambda.Code.fromAsset("lambda"),
      handler: "infra1/CRUD/delete.handler",
      functionName: "delete-Data-lambda",
      description: "This lambda deletes an item by id from the DynamoDB table",
      memorySize: 1024,
      ephemeralStorageSize: cdk.Size.mebibytes(512),
      timeout: cdk.Duration.seconds(5),
      environment: {
        DYNAMODB_TABLE_NAME: table.tableName,
      },
    });

    // Grant read permissions to the readData function
    table.grantReadData(readData);
    table.grantWriteData(postData);
    table.grantReadWriteData(deleteData);

    // API Gateway for the 'Get All Data' lambda
    const crudApi = new apigateway.LambdaRestApi(this, "infra1-api", {
      handler: readData,
      restApiName: "Get All Data API",
      proxy: false,
    });
    const dataResource = crudApi.root.addResource("data");
    dataResource.addMethod("GET", new apigateway.LambdaIntegration(readData));
    dataResource.addMethod("POST", new apigateway.LambdaIntegration(postData));
    dataResource.addMethod(
      "DELETE",
      new apigateway.LambdaIntegration(deleteData)
    );
  }
}
