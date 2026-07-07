import os
import subprocess
import sys


BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def check_node_environment() -> bool:
    print("正在检查 CPZD Admin 前端依赖...")
    if os.path.exists(os.path.join(BASE_DIR, "node_modules")):
        print("前端依赖已就绪。")
        return True

    print("未发现 node_modules，正在运行 npm install。")
    print("如果网络较慢，这一步可能需要几分钟。")
    try:
        subprocess.check_call(["npm.cmd", "install"], cwd=BASE_DIR)
        print("前端依赖安装成功。")
        return True
    except Exception as exc:
        print("前端依赖安装失败，请确认已安装 Node.js，并检查网络。")
        print(f"错误信息：{exc}")
        return False


def main() -> int:
    os.chdir(BASE_DIR)
    print("CPZD Admin · 本地控制台")
    print("后台只绑定本机地址，不部署到公网。")

    if not check_node_environment():
        input("按回车键退出...")
        return 1

    print("环境检查完成，正在启动本地网页后台...")
    return subprocess.call([sys.executable, "launcher_web.py"], cwd=BASE_DIR)


if __name__ == "__main__":
    raise SystemExit(main())
