PROJECT_ROOT := $(shell pwd)
VENV_PATH := $(PROJECT_ROOT)/.venv
PYTHON := $(VENV_PATH)/bin/python
PIP := $(VENV_PATH)/bin/pip
ALEMBIC := $(PYTHON) -m alembic

.PHONY: env setup install db-revision db-upgrade db-downgrade seed run up test

env:
	@if [ ! -f $(PROJECT_ROOT)/.env ]; then \
		echo "Creating .env from example"; \
		cp $(PROJECT_ROOT)/.env.example $(PROJECT_ROOT)/.env; \
	else \
		echo ".env already exists"; \
	fi

setup:
	@if [ ! -d $(VENV_PATH) ]; then \
		echo "Creating virtual environment"; \
		python3 -m venv $(VENV_PATH); \
	else \
		echo "Virtual environment already exists"; \
	fi

install: setup
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements.txt

run:
	$(PYTHON) -m src.wsgi

db-revision:
	@if [ -z "$(MSG)" ]; then \
		echo "Usage: make db-revision MSG=\"message\""; \
		exit 1; \
	fi
	$(ALEMBIC) revision --autogenerate -m "$(MSG)"

db-upgrade:
	$(ALEMBIC) upgrade head

db-downgrade:
	$(ALEMBIC) downgrade -1

seed:
	$(PYTHON) -m src.seed

test:
	$(PYTHON) -m pytest

up:
	$(MAKE) env
	$(MAKE) install
	$(MAKE) db-upgrade
	$(MAKE) seed
	$(MAKE) run
