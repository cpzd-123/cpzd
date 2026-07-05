import os
import subprocess
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter

router = APIRouter()

CURRENT_API_DIR = Path(__file__).resolve().parent
MANAGER_ROOT = CURRENT_API_DIR.parents[1]
REPO_ROOT = MANAGER_ROOT.parent
SITE_ROOT = Path(os.environ.get("CPZD_SITE_ROOT", REPO_ROOT / "XHBlogs")).resolve()
TARGET_REMOTE = "https://github.com/cpzd-123/cpzd.git"


def run_git(args: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", *args],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )


@router.get("/config")
async def get_deploy_config():
    return {
        "blogPath": str(SITE_ROOT),
        "sourceRepoUrl": TARGET_REMOTE,
        "sourceBranch": "main",
        "staticRepoUrl": "",
        "staticBranch": "",
    }


@router.post("/config")
async def save_deploy_config():
    return {
        "success": True,
        "message": "CPZD Admin 使用固定安全发布配置：cpzd-123/cpzd.git main。",
    }


@router.post("/check")
async def check_git_env():
    remote = run_git(["remote", "get-url", "origin"])
    branch = run_git(["branch", "--show-current"])
    status = run_git(["status", "--short"])
    return {
        "success": remote.returncode == 0,
        "message": "Git 环境检测完成。",
        "remote": remote.stdout.strip(),
        "branch": branch.stdout.strip(),
        "status": status.stdout,
    }


@router.post("/init")
async def init_deploy_env():
    remote = run_git(["remote", "get-url", "origin"])
    if remote.returncode != 0:
        result = run_git(["remote", "add", "origin", TARGET_REMOTE])
    else:
        result = run_git(["remote", "set-url", "origin", TARGET_REMOTE])

    if result.returncode != 0:
        return {"success": False, "message": result.stderr}
    return {"success": True, "message": "origin 已设置为 CPZD GitHub 仓库。"}


@router.post("/publish")
async def publish_to_github_pages():
    return await sync_source_to_vercel()


@router.post("/source")
async def sync_source_to_vercel():
    remote = run_git(["remote", "get-url", "origin"])
    if remote.returncode != 0:
        add_remote = run_git(["remote", "add", "origin", TARGET_REMOTE])
        if add_remote.returncode != 0:
            return {"success": False, "message": add_remote.stderr}
    elif remote.stdout.strip() != TARGET_REMOTE:
        set_remote = run_git(["remote", "set-url", "origin", TARGET_REMOTE])
        if set_remote.returncode != 0:
            return {"success": False, "message": set_remote.stderr}

    branch = run_git(["branch", "--show-current"])
    if branch.stdout.strip() != "main":
        return {"success": False, "message": f"当前分支是 {branch.stdout.strip()}，请切换到 main 后再发布。"}

    status = run_git(["status", "--short"])
    if status.returncode != 0:
        return {"success": False, "message": status.stderr}
    if not status.stdout.strip():
        return {"success": True, "message": "没有需要发布的改动。"}

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
