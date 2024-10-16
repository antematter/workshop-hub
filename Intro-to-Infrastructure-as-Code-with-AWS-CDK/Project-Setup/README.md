# install dependencies 
`npm install`

## Setup the Lambda Layer Locally
* In the root directory, create the layers/python folder.
* Navigate to this directory 
* Run: pip install requests -t .

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
