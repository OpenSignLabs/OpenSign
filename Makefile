build:
	@echo "Building with HOST=${HOST}"
	cp .env.local_dev .env
	cd apps/OpenSign && cp ../../.env.local_dev .env && npm install && npm run build
	HOST=${HOST} docker compose up --build --force-recreate

run:
	@echo "Building with HOST=${HOST}"
	cp .env.local_dev .env
	docker compose up -d
