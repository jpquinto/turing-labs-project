# Turing Labs Take-Home Project

This project is a basic demo/POC of a web app where formulators can log user feedback for recipe trials to be processed.

Proctors can login and collect user feedback, scoring attributes of each of the recipes for the trial. They can add text notes, or choose to create voice memos.

## Storage
DynamoDB was used for storing data on participants, users, recipes, trials, and submissions. Each entity has its own table with varying primary/sort keys depending on access patterns.

S3 was used for storing voice memos.

## Auth

An Auth0 tenant was used for user management.
- An Auth0 action automatically fires when a user signs up, calling the webhook API and creating a user in the DynamoDB database

## Frontend
The frontend was created with Next.js + Tailwind.
- Uses shadcn components
- next-auth used for managing authentication state
- Uses Next.js v15.x.x

## Backend
The backend API is built using API Gateway + Lambda. It has endpoints for each entity, but not *all* CRUD endpoints are implemented yet (some are missing PATCH endpoints as I didn't implement the pages on the frontend)

Each entity has its own lambda handler (e.g. recipes, trials). Each lambda handler has a controller layer that handles the HTTP request, and a service layer that handles interacting with DynamoDB.

There are also endpoints for uploading voice memos, and starting transcription jobs.

The Auth0 webhook is also built into the API Gateway.

There are two custom lambda authorizers for the API Gateway.
- For the CRUD endpoints, there is a JavaScript lambda function that verifies the signing key of the access token
- For the Auth0 webhook, it just checks that the expected secret was passed as a header

### Backend API Docs
There is a hosted site containing documentation for each of the implemented backend API endpoints. It uses zudoku, which is a framework that converts OpenAPI YAML docs into a website.

There is no authentication yet on the docs, but it is hosted.

## Voice Memos
In a testing session, users can record their own voice memos as an alternative to typing out notes.

The frontend will hit the backend for a pre-signed URL to upload the voice memo to S3. Once uploaded to S3, a transcription job will start via AWS Transcribe, and the user will be able to see their transcripted voice memo (after a few seconds). This flow would likely change in an actual implementation.

## CICD
The only thing implemented for CICD so far is a GitHub Actions workflow that will deploy the Terraform configuration on pushes to main.

## Infrastructure + Hosting
Most of the infrastructure is hosted on AWS. Terraform was used to deploy everything except a secret in Secrets Manager, which I manually set up.

The Terraform /infra folder has a component modules folder that has re-usable module for different AWS services. They handle building, packaging and uploading lambda function code (in Python and JavaScript) to S3, and deploying new API Gateway stages from one `terraform apply`.

The frontend is hosted on Vercel, as I've found that more reliable for hosting Next.js projects in the past.

The backend API docs are hosted on AWS Amplify.


