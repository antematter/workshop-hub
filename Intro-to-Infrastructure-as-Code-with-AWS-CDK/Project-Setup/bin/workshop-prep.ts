#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import * as dotenv from "dotenv";
import {
  BucketStack,
  EventStack,
  LambdaStack,
  LayerStack,
} from "../lib/infra2-stack";
import { CRDStack } from "../lib/infra1-stack";

dotenv.config();



const app = new cdk.App();

new CRDStack(app, "CRDStack");
const layerStack = new LayerStack(app, "LayerStack");
const eventStack = new EventStack(app, "EventStack");
const bucketStack = new BucketStack(app, "BucketStack");

new LambdaStack(app, "LambdaStack", layerStack, eventStack, bucketStack);
