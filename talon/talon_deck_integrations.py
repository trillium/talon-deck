from talon import Module, actions, registry, cron, app
import tempfile
import json
import os
import time
from pathlib import Path

STALE_REQUEST_MS = 10_000


def get_communication_dir() -> Path:
    suffix = f"-{os.getuid()}" if hasattr(os, "getuid") else ""
    return Path(tempfile.gettempdir()) / f"talon-deck{suffix}"


comm_dir = get_communication_dir()
state_path = comm_dir / "state.json"
state_tmp_path = comm_dir / "state.json.tmp"
heartbeat_path = comm_dir / "heartbeat"
requests_dir = comm_dir / "requests"
responses_dir = comm_dir / "responses"

current_state_content = ""

mod = Module()


@mod.action_class
class Actions:
    def talon_deck_get_buttons() -> list[dict]:
        """Return buttons for Talon Deck"""
        return []

    def talon_deck_update():
        """Update Talon Deck. This will trigger a call to `talon_deck_get_buttons()`"""
        update_signal()


def ensure_dirs():
    """Create communication directories if they don't exist"""
    requests_dir.mkdir(parents=True, exist_ok=True)
    responses_dir.mkdir(parents=True, exist_ok=True)


def cleanup_stale_files():
    """Remove leftover request/response files from previous sessions"""
    for d in (requests_dir, responses_dir):
        if d.exists():
            for f in d.iterdir():
                if f.suffix == ".json":
                    f.unlink(missing_ok=True)


def update_file():
    """Write state file atomically"""
    global _update_job, current_state_content
    _update_job = None
    state = {
        "version": 1,
        "timestamp": int(time.time() * 1000),
        "buttons": actions.user.talon_deck_get_buttons(),
    }
    content = json.dumps(state)
    if content != current_state_content:
        state_tmp_path.write_text(content)
        os.replace(state_tmp_path, state_path)
        current_state_content = content


_update_job = None


def update_signal():
    """Debounced signal to update state file"""
    global _update_job
    if _update_job:
        cron.cancel(_update_job)
    _update_job = cron.after("10ms", update_file)


def heartbeat():
    """Touch heartbeat file for liveness detection"""
    heartbeat_path.touch()


def poll_requests():
    """Check for pending action requests and execute them"""
    try:
        files = sorted(requests_dir.iterdir())
    except OSError:
        return

    for f in files:
        if f.suffix != ".json":
            continue

        try:
            content = f.read_text()
            request = json.loads(content)
        except (OSError, json.JSONDecodeError):
            f.unlink(missing_ok=True)
            continue

        # Skip stale requests
        age_ms = int(time.time() * 1000) - request.get("timestamp", 0)
        if age_ms > STALE_REQUEST_MS:
            f.unlink(missing_ok=True)
            continue

        uuid = request["uuid"]
        action = request["action"]

        # Execute the action
        success = True
        error = None
        try:
            # Parse and execute: "user.talon_sleep()" -> actions.user.talon_sleep()
            exec(f"actions.{action}")
        except Exception as e:
            success = False
            error = str(e)

        # Write response with trailing newline
        response = {
            "uuid": uuid,
            "success": success,
            "error": error,
            "timestamp": int(time.time() * 1000),
        }
        response_path = responses_dir / f"{uuid}.json"
        response_tmp = responses_dir / f"{uuid}.json.tmp"
        response_tmp.write_text(json.dumps(response) + "\n")
        os.replace(response_tmp, response_path)

        # Delete the request file
        f.unlink(missing_ok=True)

        # Process one request per tick to avoid blocking Talon
        break


def on_ready():
    ensure_dirs()
    cleanup_stale_files()
    registry.register("update_contexts", update_signal)
    cron.interval("1s", heartbeat)
    cron.interval("100ms", poll_requests)


app.register("ready", on_ready)
