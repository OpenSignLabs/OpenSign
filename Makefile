build:
	cp .env.local_dev .env
	rm -rf apps/OpenSign/public/mfbuild/*
	cd microfrontends/SignDocuments && npm install && npm run build
	docker compose up -d