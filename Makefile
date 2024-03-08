build:
	cp .env.local_dev .env
	cd apps/OpenSign && npm install && npm run build
	docker compose up --build --force-recreate

run:
	cp .env.local_dev .env
	docker compose up -d