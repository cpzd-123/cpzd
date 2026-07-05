import json
import os
import socket
import subprocess
import sys
import threading
import time
import webbrowser

import uvicorn

from cms_core.main import app

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_PORT = 4000
frontend_process: subprocess.Popen | None = None


def get_free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def write_backend_config(api_port: int) -> None:
    public_dir = os.path.join(BASE_DIR, "public")
    os.makedirs(public_dir, exist_ok=True)
    with open(os.path.join(public_dir, "backend_config.json"), "w", encoding="utf-8") as file:
        json.dump({"api_port": api_port}, file)


def wait_for_port(port: int, timeout: int = 60) -> bool:
    start = time.time()
    while time.time() - start < timeout:
        try:
            with socket.create_connection(("127.0.0.1", port), timeout=1):
                return True
        except OSError:
            time.sleep(1)
    return False


def stop_existing_frontend() -> None:
    if os.name != "nt":
        return

    safe_dir = BASE_DIR.replace("\\", "\\\\")
    script = (
        "Get-CimInstance Win32_Process | "
        f"Where-Object {{ $_.CommandLine -like '*{safe_dir}*' -and $_.CommandLine -like '*next dev*' }} | "
        "ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"
    )
    subprocess.run(
        ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def stop_frontend_process() -> None:
    if not frontend_process or frontend_process.poll() is not None:
        return

    if os.name == "nt":
        subprocess.run(
            f"taskkill /F /T /PID {frontend_process.pid}",
            shell=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    else:
        frontend_process.terminate()


def run_api(port: int) -> None:
    os.chdir(BASE_DIR)
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="info")


def main() -> int:
    global frontend_process

    os.chdir(BASE_DIR)
    stop_existing_frontend()
    backend_port = get_free_port()
    write_backend_config(backend_port)

    print("CPZD Admin Web")
    print(f"Frontend: http://localhost:{FRONTEND_PORT}/admin")
    print(f"Backend:  http://127.0.0.1:{backend_port}")
    print()

    threading.Thread(target=run_api, args=(backend_port,), daemon=True).start()

    env = os.environ.copy()
    env["PORT"] = str(FRONTEND_PORT)
    frontend_process = subprocess.Popen(
        "npm run dev -- -p 4000",
        cwd=BASE_DIR,
        env=env,
        shell=True,
    )

    if not wait_for_port(backend_port):
        print("Backend failed to start.")
        return 1

    if not wait_for_port(FRONTEND_PORT):
        print("Frontend failed to start.")
        return 1

    url = f"http://localhost:{FRONTEND_PORT}/admin"
    print(f"Open: {url}")
    if os.environ.get("CPZD_ADMIN_NO_BROWSER") != "1":
        webbrowser.open(url)

    try:
        frontend_process.wait()
    except KeyboardInterrupt:
        pass
    finally:
        stop_frontend_process()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
