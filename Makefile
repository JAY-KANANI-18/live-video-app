.PHONY: help install dev up down logs clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install all dependencies
	npm install

dev: ## Start development environment
	docker-compose up -d postgres redis
	npm run start:dev

up: ## Start all services with Docker Compose
	docker-compose up -d

down: ## Stop all services
	docker-compose down

logs: ## View logs from all services
	docker-compose logs -f

clean: ## Clean up containers, volumes, and dependencies
	docker-compose down -v
	npm run clean

db-migrate: ## Run database migrations
	npm run prisma:migrate

db-seed: ## Seed the database
	npm run prisma:seed

db-studio: ## Open Prisma Studio
	npm run prisma:studio

test: ## Run tests
	npm test

lint: ## Run linter
	npm run lint

lint-fix: ## Fix linting issues
	npm run lint:fix
