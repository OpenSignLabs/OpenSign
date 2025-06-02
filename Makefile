build:
	@echo "Building with HOST_URL=${HOST_URL}"
	cp .env.local_dev .env
	cd apps/OpenSign && cp ../../.env.local_dev .env && npm install && npm run build
	HOST_URL=${HOST_URL} docker compose up --build --force-recreate

run:
	@echo "Building with HOST_URL=${HOST_URL}"
	cp .env.local_dev .env
	docker compose up -d
