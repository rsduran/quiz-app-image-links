provider "aws" {
  region = "ap-southeast-1"
}

resource "aws_s3_bucket" "app_bucket" {
  bucket = "your-app-bucket-name"
  acl    = "private"
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name = "ecsTaskExecutionRole"
  assume_role_policy = jsonencode({
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "sts:AssumeRole",
        "Effect": "Allow",
        "Principal": {
          "Service": "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  managed_policy_arns = [
    "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
  ]
}

resource "aws_ecs_cluster" "cluster" {
  name = "my-cluster"
}

resource "aws_ecs_task_definition" "app_task" {
  family                   = "my-app-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "my-app"
      image     = "my-dockerhub-username/my-app:latest"
      essential = true
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
        }
      ]
    }
  ])
}

resource "aws_ecs_service" "app_service" {
  name            = "my-app-service"
  cluster         = aws_ecs_cluster.cluster.name
  task_definition = aws_ecs_task_definition.app_task.arn
  desired_count   = 1

  network_configuration {
    subnets         = ["subnet-xxxxxxxx", "subnet-xxxxxxxx"]
    security_groups = ["sg-xxxxxxxx"]
  }
}