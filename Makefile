build:
	cp .env.local_dev .env
	rm -rf apps/OpenSign/public/mfbuild
	cd microfrontends/SignDocuments && npm install && npm run build
	docker compose up --build --force-recreate

run:
	cp .env.local_dev .env
	docker compose up -d