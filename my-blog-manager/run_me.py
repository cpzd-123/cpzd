import os
import sys
import subprocess

def check_node_environment():
    """检查前端环境：是否存在 node_modules，不存在则自动安装"""
    print("🔍 正在检查前端依赖 (Node.js)...")

    # 检查当前目录下是否有 node_modules 文件夹
    if not os.path.exists("node_modules"):
        print("📦 发现缺失前端依赖，正在尝试运行 npm install (请稍候，这可能需要几分钟)...")
        try:
            # shell=True 在 Windows 下运行 npm 必须加上
            subprocess.check_call(["npm", "install"], shell=True)
            print("✅ 前端依赖安装成功！")
        except Exception as e:
            print(f"❌ 前端安装失败！请确保你安装了 Node.js。错误: {e}")
            return False
    else:
        print("✅ 前端依赖已就绪。")
    return True

if __name__ == "__main__":
    # 强制切换到脚本所在目录
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    print("🌟 --- CPZD Admin · 本地控制台 --- 🌟")

    # 只检查 Node 依赖；Python 依赖由 Start.bat 预先检测，避免代理环境下自动 pip 安装失败。
    if check_node_environment():
        print("\n🚀 所有环境准备就绪，正在点火启动...")
        # 启动浏览器网页管理模式，不再依赖 pywebview 桌面壳。
        subprocess.call([sys.executable, "launcher_web.py"])
    else:
        print("\n⚠️ 环境检查未通过，请根据报错信息手动处理。")
        input("按回车键退出...")
