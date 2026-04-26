.PHONY: dev seed train build clean test

dev:
	cd backend && uvicorn main:app --reload --port 8000

seed:
	cd backend && python ../data/scripts/generate_hospitals.py
	cd backend && python ../data/scripts/generate_symptoms.py
	cd backend && python ../data/scripts/generate_costs.py
	cd backend && python ../data/scripts/seed_database.py
	cd backend && python ../data/scripts/build_vectorstore.py

train:
	cd backend && python ml/train_models.py

setup: seed train
	@echo "✓ HEALIX AI ready — run: make dev"

test:
	cd backend && pytest tests/ -v

clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete 2>/dev/null || true

frontend:
	cd frontend && npm run dev

install:
	pip install -r backend/requirements.txt
	cd frontend && npm install
