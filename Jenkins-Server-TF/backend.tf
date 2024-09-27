terraform {
  backend "s3" {
    bucket         = "athena-quiz-app-bucket"
    region         = "ap-southeast-2"
    key            = "quiz-app-image-links/Jenkins-Server-TF/terraform.tfstate"
    dynamodb_table = "Lock-Files"
    encrypt        = true
  }
  required_version = ">=0.13.0"
  required_providers {
    aws = {
      version = ">= 2.7.0"
      source  = "hashicorp/aws"
    }
  }
}