import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";

export class CatsStask extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const catsApiUrl = process.env.CATS_API;
    if (!catsApiUrl) {
      throw new Error("CATS_API environment variable is not set");
    }

    // Create an S3 bucket to store cat images
    const bucket = new s3.Bucket(this, "CatImageBucket", {
      bucketName: "my-cats-bucket",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      publicReadAccess: true, // Enables public read access
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS, // Allow public access at bucket level
    });

    // Create a Lambda layer with the 'requests' package
    const requestsLayer = new lambda.LayerVersion(this, "RequestsLayer", {
      code: lambda.Code.fromAsset("layers"),
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_12],
      description: "A layer that contains the requests package",
    });

    const getCats = new lambda.Function(this, "getCatsLambda", {
      runtime: lambda.Runtime.PYTHON_3_12,
      code: lambda.Code.fromAsset("lambda"),
      handler: "infra2/cats/get_cats.handler",
      functionName: "simple-get-cats-lambda",
      description:
        "This lambda returns cats from a pyhton runtime and stores it in an s3 bucket",
      environment: {
        BUCKET_NAME: bucket.bucketName,
        CATS_API: catsApiUrl,
      },
      layers: [requestsLayer],
    });

    bucket.grantPut(getCats);

    const api = new apigateway.LambdaRestApi(this, "get-cats-api", {
      handler: getCats,
      restApiName: "Get Cats API",
      proxy: false,
    });

    const catsResource = api.root.addResource("cats");
    catsResource.addMethod("GET", new apigateway.LambdaIntegration(getCats));

    // Create an EventBridge rule to trigger the Lambda every 10 minutes
    const rule = new events.Rule(this, "ScheduleRule", {
      schedule: events.Schedule.rate(cdk.Duration.minutes(10)),
    });

    // Add the Lambda function as the target of the rule
    rule.addTarget(new targets.LambdaFunction(getCats));
  }
}

// below is refactored of the above code 

export class LayerStack extends cdk.Stack {
  public readonly requestsLayer: lambda.LayerVersion;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.requestsLayer = new lambda.LayerVersion(this, "RequestsLayer", {
      code: lambda.Code.fromAsset("layers"),
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_12],
      description: "A layer that contains the requests package",
    });
  }
}

export class EventStack extends cdk.Stack {
  public readonly rule: events.Rule;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.rule = new events.Rule(this, "ScheduleRule", {
      schedule: events.Schedule.rate(cdk.Duration.minutes(10)),
    });
  }
}

export class BucketStack extends cdk.Stack {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.bucket = new s3.Bucket(this, "CatImageBucket", {
      bucketName: "my-cats-bucket",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      publicReadAccess: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
    });
  }
}

export class LambdaStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    layerStack: LayerStack,
    eventStack: EventStack,
    bucketStack: BucketStack,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    const catsApiUrl = process.env.CATS_API;
    if (!catsApiUrl) {
      throw new Error("CATS_API environment variable is not set");
    }

    const getCats = new lambda.Function(this, "getCatsLambda", {
      runtime: lambda.Runtime.PYTHON_3_12,
      code: lambda.Code.fromAsset("lambda"),
      handler: "infra2/cats/get_cats.handler",
      functionName: "simple-get-cats-lambda",
      description:
        "This lambda returns cats from a python runtime and stores it in an s3 bucket",
      environment: {
        BUCKET_NAME: bucketStack.bucket.bucketName,
        CATS_API: catsApiUrl,
      },
      layers: [layerStack.requestsLayer],
    });

    bucketStack.bucket.grantPut(getCats);

    new apigateway.LambdaRestApi(this, "get-cats-api", {
      handler: getCats,
      restApiName: "Get Cats API",
      proxy: true,
      deployOptions: {
        stageName: "test",
      },
    });

    // Add the Lambda function as the target of the rule
    eventStack.rule.addTarget(new targets.LambdaFunction(getCats));
  }
}
