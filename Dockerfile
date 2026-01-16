FROM python:3.12-slim AS build

ENV SITE_NAME="My Resume" \
    SITE_URL="http://localhost:8000/" \
    REPO_URL="https://github.com/shono1103/MyResume/"


WORKDIR /app/mkdocs
COPY mkdocs /app/mkdocs

RUN pip install -r ./requirements.txt \
&& python3 makeMkdocs.yml.py \
&& mkdocs build -f ./mkdocs.yml -d /site --clean

FROM nginx:alpine AS publish

COPY --from=build /site /usr/share/nginx/html
