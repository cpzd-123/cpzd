import os
import re
import json
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Any

import yaml
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

CURRENT_API_DIR = Path(__file__).resolve().parent
MANAGER_ROOT = CURRENT_API_DIR.parents[1]
REPO_ROOT = MANAGER_ROOT.parent
SITE_ROOT = Path(os.environ.get("CPZD_SITE_ROOT", REPO_ROOT / "XHBlogs")).resolve()
TARGET_REMOTE = "https://github.com/cpzd-123/cpzd.git"


def ensure_inside_site(path: Path) -> Path:
    resolved = path.resolve()
    if SITE_ROOT not in resolved.parents and resolved != SITE_ROOT:
        raise HTTPException(status_code=400, detail="Invalid site path")
    return resolved


def slugify(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    return value or f"post-{int(datetime.now().timestamp())}"


def read_frontmatter(path: Path) -> tuple[dict[str, Any], str]:
    raw = path.read_text(encoding="utf-8")
    if raw.lstrip().startswith("---"):
        parts = raw.split("---", 2)
        if len(parts) >= 3:
            data = yaml.safe_load(parts[1]) or {}
            return data, parts[2].strip()
    return {}, raw


def write_markdown(path: Path, data: dict[str, Any], content: str) -> None:
    frontmatter = yaml.safe_dump(data, allow_unicode=True, sort_keys=False).strip()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(f"---\n{frontmatter}\n---\n\n{content.strip()}\n", encoding="utf-8")


def read_ts_array(path: Path, export_name: str) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    raw = path.read_text(encoding="utf-8")
    match = re.search(rf"export\s+const\s+{export_name}[^=]*=\s*(\[.*?\]);", raw, re.S)
    if not match:
        return []
    json_like = re.sub(r",\s*([}}\]])", r"\1", match.group(1))
    try:
        return json.loads(json_like)
    except json.JSONDecodeError:
        return []


def write_projects_file(projects: list[dict[str, Any]]) -> None:
    projects_file = ensure_inside_site(SITE_ROOT / "data" / "projects.ts")
    projects_file.parent.mkdir(parents=True, exist_ok=True)
    json_str = json.dumps(projects, ensure_ascii=False, indent=2)
    projects_file.write_text(
        "// 🛡️ 本文件由 CPZD Admin 自动生成\n\n"
        "export type Project = {\n"
        "  id: string;\n"
        "  name: string;\n"
        "  description: string;\n"
        "  icon: string;\n"
        "  githubUrl: string;\n"
        "  tags: string[];\n"
        "};\n\n"
        f"export const projectsData: Project[] = {json_str};\n",
        encoding="utf-8",
    )


def write_friends_file(friends: list[dict[str, Any]]) -> None:
    friends_file = ensure_inside_site(SITE_ROOT / "data" / "friends.ts")
    friends_file.parent.mkdir(parents=True, exist_ok=True)
    json_str = json.dumps(friends, ensure_ascii=False, indent=2)
    friends_file.write_text(
        "// 🛡️ 本文件由 CPZD Admin 自动生成\n\n"
        "export interface Friend {\n"
        "  id: string;\n"
        "  name: string;\n"
        "  url: string;\n"
        "  description: string;\n"
        "  avatar: string;\n"
        "  themeColor: string;\n"
        "}\n\n"
        f"export const friendsData: Friend[] = {json_str};\n",
        encoding="utf-8",
    )


def write_albums_file(albums: list[dict[str, Any]]) -> None:
    albums_file = ensure_inside_site(SITE_ROOT / "data" / "albums.ts")
    albums_file.parent.mkdir(parents=True, exist_ok=True)
    json_str = json.dumps(albums, ensure_ascii=False, indent=2)
    albums_file.write_text(
        "// 🛡️ 本文件由 CPZD Admin 自动生成\n"
        "export interface Photo { url: string; caption?: string; }\n"
        "export interface Album { id: string; title: string; description: string; cover: string; date: string; photos: Photo[]; }\n\n"
        f"export const albums: Album[] = {json_str};\n",
        encoding="utf-8",
    )


def run_git(args: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", *args],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )


class PostPayload(BaseModel):
    slug: str | None = None
    title: str
    date: str | None = None
    category: str | None = "Records"
    tags: list[str] | str | None = None
    description: str | None = ""
    cover: str | None = ""
    content: str | None = "这里写正文。"


class ProjectPayload(BaseModel):
    id: str | None = None
    name: str
    description: str | None = ""
    icon: str | None = "✨"
    githubUrl: str | None = ""
    tags: list[str] | str | None = None


class MomentPayload(BaseModel):
    id: str | None = None
    date: str | None = None
    location: str | None = ""
    images: list[str] | str | None = None
    content: str | None = ""


class FriendPayload(BaseModel):
    id: str | None = None
    name: str
    url: str | None = ""
    description: str | None = ""
    avatar: str | None = ""
    themeColor: str | None = "#6366f1"


class AlbumPayload(BaseModel):
    id: str | None = None
    title: str
    description: str | None = ""
    cover: str | None = ""
    date: str | None = ""
    photos: list[str] | str | None = None


class ConfigPayload(BaseModel):
    title: str
    bio: str
    blogUrl: str = "https://blog.cpzd.top"


@router.get("/overview")
async def overview():
    posts_dir = SITE_ROOT / "posts"
    assets_dir = SITE_ROOT / "public" / "assets" / "images"
    projects_file = SITE_ROOT / "data" / "projects.ts"

    return {
        "success": True,
        "siteRoot": str(SITE_ROOT),
        "repoRoot": str(REPO_ROOT),
        "site": {
            "name": "CPZD",
            "title": "CPZD の Space",
            "url": "https://cpzd.top",
            "blogUrl": "https://blog.cpzd.top",
            "repo": TARGET_REMOTE,
        },
        "counts": {
            "posts": len(list(posts_dir.glob("*.md"))) if posts_dir.exists() else 0,
            "assets": len([p for p in assets_dir.iterdir() if p.is_file()]) if assets_dir.exists() else 0,
            "projectsFile": projects_file.exists(),
        },
        "plugins": {
            "musicPlayer": False,
            "cyberCat": False,
            "chatter": True,
            "gallery": True,
            "friends": True,
            "search": True,
        },
    }


@router.get("/posts")
async def list_posts():
    posts_dir = ensure_inside_site(SITE_ROOT / "posts")
    posts: list[dict[str, Any]] = []
    if posts_dir.exists():
        for path in sorted(posts_dir.glob("*.md")):
            data, content = read_frontmatter(path)
            posts.append({
                "slug": path.stem,
                "file": path.name,
                "title": data.get("title", path.stem),
                "date": str(data.get("date", "")),
                "category": data.get("category", ""),
                "tags": data.get("tags", []),
                "description": data.get("description", content[:120]),
                "cover": data.get("cover", ""),
            })
    posts.sort(key=lambda item: item.get("date", ""), reverse=True)
    return {"success": True, "posts": posts}


@router.get("/posts/{slug}")
async def get_post(slug: str):
    safe_slug = slugify(slug)
    path = ensure_inside_site(SITE_ROOT / "posts" / f"{safe_slug}.md")
    if not path.exists():
        raise HTTPException(status_code=404, detail="Post not found")
    data, content = read_frontmatter(path)
    return {"success": True, "post": {"slug": safe_slug, **data, "content": content}}


@router.post("/posts")
async def save_post(payload: PostPayload):
    slug = slugify(payload.slug or payload.title)
    path = ensure_inside_site(SITE_ROOT / "posts" / f"{slug}.md")
    tags = payload.tags or []
    if isinstance(tags, str):
        tags = [tag.strip() for tag in tags.split(",") if tag.strip()]

    data = {
        "title": payload.title,
        "date": payload.date or datetime.now().strftime("%Y-%m-%d"),
        "category": payload.category or "Records",
        "tags": tags,
        "description": payload.description or "",
        "cover": payload.cover or "",
    }
    write_markdown(path, data, payload.content or "")
    return {"success": True, "message": "文章已保存到 XHBlogs/posts", "slug": slug, "path": str(path)}


@router.delete("/posts/{slug}")
async def delete_post(slug: str):
    safe_slug = slugify(slug)
    path = ensure_inside_site(SITE_ROOT / "posts" / f"{safe_slug}.md")
    if not path.exists():
        raise HTTPException(status_code=404, detail="Post not found")
    path.unlink()
    return {"success": True, "message": "文章已删除", "slug": safe_slug}


@router.get("/projects")
async def list_projects():
    projects_file = ensure_inside_site(SITE_ROOT / "data" / "projects.ts")
    projects = read_ts_array(projects_file, "projectsData")
    return {"success": True, "projects": projects}


@router.post("/projects")
async def save_project(payload: ProjectPayload):
    projects_file = ensure_inside_site(SITE_ROOT / "data" / "projects.ts")
    projects = read_ts_array(projects_file, "projectsData")
    project_id = slugify(payload.id or payload.name)
    tags = payload.tags or []
    if isinstance(tags, str):
        tags = [tag.strip() for tag in tags.split(",") if tag.strip()]

    project = {
        "id": project_id,
        "name": payload.name,
        "githubUrl": payload.githubUrl or "",
        "description": payload.description or "",
        "icon": payload.icon or "✨",
        "tags": tags,
    }
    projects = [item for item in projects if item.get("id") != project_id]
    projects.insert(0, project)
    write_projects_file(projects)
    return {"success": True, "message": "项目已保存。", "project": project}


@router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    projects_file = ensure_inside_site(SITE_ROOT / "data" / "projects.ts")
    projects = read_ts_array(projects_file, "projectsData")
    safe_id = slugify(project_id)
    next_projects = [item for item in projects if item.get("id") != safe_id]
    write_projects_file(next_projects)
    return {"success": True, "message": "项目已删除。", "id": safe_id}


@router.get("/moments")
async def list_moments():
    moments_dir = ensure_inside_site(SITE_ROOT / "moments")
    moments: list[dict[str, Any]] = []
    if moments_dir.exists():
        for path in sorted(moments_dir.glob("*.md")):
            data, content = read_frontmatter(path)
            moments.append({
                "id": path.stem,
                "date": str(data.get("date", "")),
                "location": data.get("location", ""),
                "images": data.get("images", []),
                "content": content,
            })
    moments.sort(key=lambda item: item.get("date", ""), reverse=True)
    return {"success": True, "moments": moments}


@router.get("/moments/{moment_id}")
async def get_moment(moment_id: str):
    safe_id = slugify(moment_id)
    path = ensure_inside_site(SITE_ROOT / "moments" / f"{safe_id}.md")
    if not path.exists():
        raise HTTPException(status_code=404, detail="Moment not found")
    data, content = read_frontmatter(path)
    return {"success": True, "moment": {"id": safe_id, **data, "content": content}}


@router.post("/moments")
async def save_moment(payload: MomentPayload):
    moment_id = slugify(payload.id or f"moment-{datetime.now().strftime('%Y%m%d-%H%M%S')}")
    path = ensure_inside_site(SITE_ROOT / "moments" / f"{moment_id}.md")
    images = payload.images or []
    if isinstance(images, str):
        images = [image.strip() for image in images.split(",") if image.strip()]

    data = {
        "date": payload.date or datetime.now().isoformat(timespec="seconds"),
        "location": payload.location or "",
        "images": images,
    }
    write_markdown(path, data, payload.content or "")
    return {"success": True, "message": "动态已保存。", "id": moment_id}


@router.delete("/moments/{moment_id}")
async def delete_moment(moment_id: str):
    safe_id = slugify(moment_id)
    path = ensure_inside_site(SITE_ROOT / "moments" / f"{safe_id}.md")
    if not path.exists():
        raise HTTPException(status_code=404, detail="Moment not found")
    path.unlink()
    return {"success": True, "message": "动态已删除。", "id": safe_id}


@router.get("/friends")
async def list_friends():
    friends_file = ensure_inside_site(SITE_ROOT / "data" / "friends.ts")
    friends = read_ts_array(friends_file, "friendsData")
    return {"success": True, "friends": friends}


@router.post("/friends")
async def save_friend(payload: FriendPayload):
    friends_file = ensure_inside_site(SITE_ROOT / "data" / "friends.ts")
    friends = read_ts_array(friends_file, "friendsData")
    friend_id = slugify(payload.id or payload.name)
    friend = {
        "id": friend_id,
        "name": payload.name,
        "url": payload.url or "",
        "description": payload.description or "",
        "avatar": payload.avatar or "",
        "themeColor": payload.themeColor or "#6366f1",
    }
    friends = [item for item in friends if item.get("id") != friend_id]
    friends.insert(0, friend)
    write_friends_file(friends)
    return {"success": True, "message": "友链已保存。", "friend": friend}


@router.delete("/friends/{friend_id}")
async def delete_friend(friend_id: str):
    friends_file = ensure_inside_site(SITE_ROOT / "data" / "friends.ts")
    friends = read_ts_array(friends_file, "friendsData")
    safe_id = slugify(friend_id)
    write_friends_file([item for item in friends if item.get("id") != safe_id])
    return {"success": True, "message": "友链已删除。", "id": safe_id}


@router.get("/albums")
async def list_albums():
    albums_file = ensure_inside_site(SITE_ROOT / "data" / "albums.ts")
    albums = read_ts_array(albums_file, "albums")
    return {"success": True, "albums": albums}


@router.post("/albums")
async def save_album(payload: AlbumPayload):
    albums_file = ensure_inside_site(SITE_ROOT / "data" / "albums.ts")
    albums = read_ts_array(albums_file, "albums")
    album_id = slugify(payload.id or payload.title)
    photos = payload.photos or []
    if isinstance(photos, str):
        photos = [{"url": photo.strip(), "caption": ""} for photo in photos.split(",") if photo.strip()]
    else:
        photos = [{"url": str(photo), "caption": ""} for photo in photos if str(photo).strip()]

    album = {
        "id": album_id,
        "title": payload.title,
        "description": payload.description or "",
        "cover": payload.cover or (photos[0]["url"] if photos else ""),
        "date": payload.date or datetime.now().strftime("%Y.%m"),
        "photos": photos,
    }
    albums = [item for item in albums if item.get("id") != album_id]
    albums.insert(0, album)
    write_albums_file(albums)
    return {"success": True, "message": "相册已保存。", "album": album}


@router.delete("/albums/{album_id}")
async def delete_album(album_id: str):
    albums_file = ensure_inside_site(SITE_ROOT / "data" / "albums.ts")
    albums = read_ts_array(albums_file, "albums")
    safe_id = slugify(album_id)
    write_albums_file([item for item in albums if item.get("id") != safe_id])
    return {"success": True, "message": "相册已删除。", "id": safe_id}


@router.get("/assets")
async def list_assets():
    assets_dir = ensure_inside_site(SITE_ROOT / "public" / "assets" / "images")
    allowed = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"}
    assets: list[dict[str, str | int]] = []
    if assets_dir.exists():
        for path in sorted(assets_dir.iterdir()):
            if path.is_file() and path.suffix.lower() in allowed:
                assets.append({
                    "name": path.name,
                    "path": f"/assets/images/{path.name}",
                    "size": path.stat().st_size,
                })
    return {"success": True, "assets": assets}


@router.post("/config")
async def save_basic_config(payload: ConfigPayload):
    config_path = ensure_inside_site(SITE_ROOT / "siteConfig.ts")
    if not config_path.exists():
        raise HTTPException(status_code=404, detail="siteConfig.ts not found")
    content = config_path.read_text(encoding="utf-8")
    replacements = {
        "title": payload.title,
        "bio": payload.bio,
    }
    for key, value in replacements.items():
        content = re.sub(
            rf'({key}:\s*")[^"]*(")',
            lambda match, v=value: f"{match.group(1)}{v}{match.group(2)}",
            content,
            count=1,
        )
    content = re.sub(
        r'(url:\s*")[^"]*(")',
        lambda match: f"{match.group(1)}{payload.blogUrl}{match.group(2)}",
        content,
        count=1,
    )
    config_path.write_text(content, encoding="utf-8")
    return {"success": True, "message": "基础配置已保存"}


@router.get("/deploy/status")
async def deploy_status():
    remote = run_git(["remote", "get-url", "origin"])
    status = run_git(["status", "--short"])
    branch = run_git(["branch", "--show-current"])
    return {
        "success": remote.returncode == 0,
        "remote": remote.stdout.strip(),
        "branch": branch.stdout.strip(),
        "status": status.stdout,
    }


@router.post("/deploy/run")
async def deploy_run():
    remote = run_git(["remote", "get-url", "origin"])
    if remote.returncode != 0:
        add_remote = run_git(["remote", "add", "origin", TARGET_REMOTE])
        if add_remote.returncode != 0:
            return {"success": False, "message": add_remote.stderr}
    elif remote.stdout.strip() != TARGET_REMOTE:
        set_remote = run_git(["remote", "set-url", "origin", TARGET_REMOTE])
        if set_remote.returncode != 0:
            return {"success": False, "message": set_remote.stderr}

    status = run_git(["status", "--short"])
    if status.returncode != 0:
        return {"success": False, "message": status.stderr}
    if not status.stdout.strip():
        return {"success": True, "message": "没有需要发布的改动。"}

    branch = run_git(["branch", "--show-current"])
    if branch.stdout.strip() != "main":
        return {"success": False, "message": f"当前分支是 {branch.stdout.strip()}，请切换到 main 后再发布。"}

    add = run_git(["add", "."])
    if add.returncode != 0:
        return {"success": False, "message": add.stderr}

    commit_message = f"Update CPZD site {datetime.now().strftime('%Y-%m-%d %H:%M')}"
    commit = run_git(["commit", "-m", commit_message])
    if commit.returncode != 0:
        return {"success": False, "message": commit.stderr or commit.stdout}

    push = run_git(["push", "origin", "main"])
    if push.returncode != 0:
        return {"success": False, "message": push.stderr or push.stdout}

    return {
        "success": True,
        "message": "发布成功，Vercel 将自动部署。请稍后访问 https://cpzd.top",
        "commit": commit_message,
    }
