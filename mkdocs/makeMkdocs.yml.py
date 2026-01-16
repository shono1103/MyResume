from pathlib import Path
from dotenv import load_dotenv
import os
import yaml


load_dotenv()

SITE_NAME = os.getenv("SITE_NAME")
SITE_URL = os.getenv("SITE_URL")
REPO_URL = os.getenv("REPO_URL")
THEME_NAME = os.getenv("THEME_NAME")
THEME_LANGUAGE = os.getenv("THEME_LANGUAGE")
THEME_FEATURES = os.getenv("THEME_FEATURES", "").split(",")
MARKDOWN_EXTENSIONS = os.getenv("MARKDOWN_EXTENSIONS", "").split(",")
PLUGINS = os.getenv("PLUGINS", "").split(",")

DOCS_DIR = Path("docs")
TITLE_OVERRIDES = {
    "index": "Home"
}


def title_from_name(name: str) -> str:
    override = TITLE_OVERRIDES.get(name)
    if override:
        return override
    normalized = name.replace("_", " ").replace("-", " ")
    return normalized.title()


def build_nav_entries(base_dir: Path, current_dir: Path) -> list[dict]:
    entries: list[dict] = []
    md_files = sorted(
        (p for p in current_dir.iterdir() if p.is_file() and p.suffix == ".md"),
        key=lambda p: (p.stem != "index", p.name),
    )
    for md_file in md_files:
        title = title_from_name(md_file.stem)
        rel_path = md_file.relative_to(base_dir).as_posix()
        entries.append({title: rel_path})

    subdirs = sorted((p for p in current_dir.iterdir() if p.is_dir()), key=lambda p: p.name)
    for subdir in subdirs:
        child_entries = build_nav_entries(base_dir, subdir)
        if child_entries:
            entries.append({title_from_name(subdir.name): child_entries})

    return entries


NAV_LIST = build_nav_entries(DOCS_DIR, DOCS_DIR)



mkdocsConfig={
 "site_name": SITE_NAME,
 "site_url": SITE_URL,
 "repo_url": REPO_URL,
 "theme":{
  "name": THEME_NAME,
  "language": THEME_LANGUAGE,
  "features": THEME_FEATURES
 },
 "markdown_extensions": MARKDOWN_EXTENSIONS,
 "plugins": PLUGINS,
 "nav": NAV_LIST
}

with open("mkdocs.yml", "w", encoding="utf-8") as mkdocsYamlFile:
    yaml.safe_dump(mkdocsConfig, mkdocsYamlFile, sort_keys=False, allow_unicode=True)
