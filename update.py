import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))


def run(command: list[str], cwd: str = ROOT) -> int:
    print("\n> " + " ".join(command))
    return subprocess.call(command, cwd=cwd)


def main() -> int:
    os.chdir(ROOT)
    print("=" * 40)
    print("        CPZD 管理启动器辅助脚本")
    print("=" * 40)
    print()
    print("原作者升级逻辑已禁用。")
    print("本脚本不会连接原作者仓库，也不会覆盖你的代码。")
    print()
    print("1. 启动前台网站")
    print("2. 启动 CPZD Admin 后台")
    print("3. 一键上传并发布")
    print("4. 查看 Git 状态")
    print("5. 退出")
    choice = input("\n请选择操作：").strip()

    if choice == "1":
        return run(["npm.cmd", "run", "dev"], os.path.join(ROOT, "XHBlogs"))
    if choice == "2":
        admin_dir = os.path.join(ROOT, "my-blog-manager")
        start_bat = os.path.join(admin_dir, "Start.bat")
        if os.path.exists(start_bat):
            return run(["cmd", "/c", "Start.bat"], admin_dir)
        return run(["npm.cmd", "run", "dev"], admin_dir)
    if choice == "3":
        return run(["cmd", "/c", "publish.bat"], ROOT)
    if choice == "4":
        run(["git", "remote", "-v"], ROOT)
        run(["git", "branch"], ROOT)
        return run(["git", "status", "--short"], ROOT)

    print("已退出。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
