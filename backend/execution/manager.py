"""
Execution Manager for safe, isolated execution of tests and code checks.
"""

import os
import subprocess
import time
import re
from typing import Dict, Any, Optional


class ExecutionManager:
    """
    Manages controlled subprocess execution with timeouts, output capturing,
    and structured error parsing.
    """

    def __init__(self, timeout_seconds: int = 15):
        self.default_timeout = timeout_seconds

    def _get_safe_env(self) -> Dict[str, str]:
        """
        Produce a sanitized environment without leaking sensitive host secrets.
        """
        safe_keys = {
            "PATH", "HOME", "USER", "LANG", "LC_ALL", "TERM",
            "PYTHONPATH", "VIRTUAL_ENV"
        }
        env = {k: v for k, v in os.environ.items() if k in safe_keys or k.startswith("PY_")}
        env["PYTHONDONTWRITEBYTECODE"] = "1"
        return env

    def run_command(
        self,
        command: str,
        cwd: str,
        timeout: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Execute a shell command safely in a dedicated directory with a timeout.
        """
        timeout = timeout or self.default_timeout
        start_time = time.time()
        
        try:
            process = subprocess.run(
                command,
                shell=True,
                cwd=cwd,
                capture_output=True,
                text=True,
                timeout=timeout,
                env=self._get_safe_env()
            )
            duration_ms = int((time.time() - start_time) * 1000)
            
            output = process.stdout + ("\n" + process.stderr if process.stderr else "")
            return {
                "command": command,
                "exit_code": process.returncode,
                "status": "passed" if process.returncode == 0 else "failed",
                "output": output.strip(),
                "duration_ms": duration_ms
            }
        except subprocess.TimeoutExpired:
            duration_ms = int((time.time() - start_time) * 1000)
            return {
                "command": command,
                "exit_code": -1,
                "status": "error",
                "output": f"Execution timed out after {timeout} seconds",
                "duration_ms": duration_ms
            }
        except Exception as e:
            duration_ms = int((time.time() - start_time) * 1000)
            return {
                "command": command,
                "exit_code": -1,
                "status": "error",
                "output": f"Execution error: {str(e)}",
                "duration_ms": duration_ms
            }

    def check_python_code(self, code_str: str, imports_str: str = "") -> Dict[str, Any]:
        """
        Check python code for syntax and execution soundness.
        Preserves the prototype's core validation while executing in a separated subprocess.
        """
        full_code = f"{imports_str}\n\n{code_str}".strip()
        start_time = time.time()
        
        # Test 1: Syntax check via python -m py_compile
        try:
            compile(full_code, "<string>", "exec")
        except SyntaxError as e:
            return {
                "command": "python syntax check",
                "exit_code": 1,
                "status": "failed",
                "passed": 0,
                "failed": 1,
                "total": 1,
                "output": f"SyntaxError: {e.msg} at line {e.lineno}",
                "duration_ms": int((time.time() - start_time) * 1000)
            }
            
        # Test 2: Execution in an isolated python subprocess
        try:
            process = subprocess.run(
                ["python3", "-c", full_code],
                capture_output=True,
                text=True,
                timeout=5,
                env=self._get_safe_env()
            )
            duration_ms = int((time.time() - start_time) * 1000)
            output = process.stdout + ("\n" + process.stderr if process.stderr else "")
            
            if process.returncode == 0:
                return {
                    "command": "python execution check",
                    "exit_code": 0,
                    "status": "passed",
                    "passed": 1,
                    "failed": 0,
                    "total": 1,
                    "output": output.strip() or "Code executed without errors.",
                    "duration_ms": duration_ms
                }
            else:
                return {
                    "command": "python execution check",
                    "exit_code": process.returncode,
                    "status": "failed",
                    "passed": 0,
                    "failed": 1,
                    "total": 1,
                    "output": output.strip(),
                    "duration_ms": duration_ms
                }
        except subprocess.TimeoutExpired:
            return {
                "command": "python execution check",
                "exit_code": -1,
                "status": "error",
                "passed": 0,
                "failed": 1,
                "total": 1,
                "output": "Execution timed out after 5 seconds",
                "duration_ms": int((time.time() - start_time) * 1000)
            }

    def run_pytest(self, cwd: str, test_file_or_dir: Optional[str] = None) -> Dict[str, Any]:
        """
        Run pytest in the project directory and parse structured results.
        """
        cmd = "pytest -v --tb=short"
        if test_file_or_dir:
            cmd = f"pytest -v --tb=short {test_file_or_dir}"
            
        res = self.run_command(cmd, cwd=cwd)
        output = res["output"]
        
        # Parse pytest summary: e.g. "2 passed, 1 failed in 0.12s"
        passed = 0
        failed = 0
        
        passed_match = re.search(r'(\d+)\s+passed', output)
        if passed_match:
            passed = int(passed_match.group(1))
            
        failed_match = re.search(r'(\d+)\s+failed', output)
        if failed_match:
            failed = int(failed_match.group(1))
            
        error_match = re.search(r'(\d+)\s+error', output)
        if error_match:
            failed += int(error_match.group(1))

        total = passed + failed
        status = "passed" if res["exit_code"] == 0 and failed == 0 else "failed"
        
        return {
            "command": cmd,
            "exit_code": res["exit_code"],
            "status": status,
            "passed": passed,
            "failed": failed,
            "total": total,
            "output": output,
            "duration_ms": res["duration_ms"]
        }
