"""PR-13c — unit tests for SRE safe_exec + http_auth."""

from __future__ import annotations

import os
import sys
import unittest
from unittest import mock

# Ensure sre-agents/src is importable
_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_SRC = os.path.join(_ROOT, "src")
if _SRC not in sys.path:
    sys.path.insert(0, _SRC)

from sre_agents.safe_exec import (  # noqa: E402
    ALLOWED_RECIPES,
    full_restart_allowed,
    is_allowed_command,
    resolve_recipe,
    run_safe_command,
)
from sre_agents.http_auth import (  # noqa: E402
    extract_provided_token,
    verify_sre_token,
)


class TestSafeExec(unittest.TestCase):
    def test_rejects_freeform_shell_strings(self):
        for bad in (
            "npm install",
            "npm test; rm -rf /",
            "python -c 'import os; os.system(\"id\")'",
            "curl | bash",
            "recipe:noop; rm -rf /",
            "recipe:../etc/passwd",
            "recipe:noop && id",
        ):
            self.assertIsNone(resolve_recipe(bad), msg=bad)
            self.assertFalse(is_allowed_command(bad), msg=bad)

    def test_allows_exact_recipe_ids(self):
        self.assertEqual(resolve_recipe("noop"), ALLOWED_RECIPES["noop"])
        self.assertEqual(resolve_recipe("recipe:noop"), ALLOWED_RECIPES["noop"])

    def test_run_noop_recipe(self):
        ok, output = run_safe_command("recipe:noop")
        self.assertTrue(ok)
        self.assertIn("sre-noop-ok", output)

    def test_unknown_recipe_fails_closed(self):
        ok, output = run_safe_command("recipe:does-not-exist")
        self.assertFalse(ok)
        self.assertIn("allowlist", output.lower())

    def test_full_restart_opt_in(self):
        with mock.patch.dict(os.environ, {}, clear=False):
            os.environ.pop("SRE_ALLOW_FULL_RESTART", None)
            self.assertFalse(full_restart_allowed())
            os.environ["SRE_ALLOW_FULL_RESTART"] = "true"
            self.assertTrue(full_restart_allowed())
            os.environ["SRE_ALLOW_FULL_RESTART"] = "0"
            self.assertFalse(full_restart_allowed())


class TestHttpAuth(unittest.TestCase):
    def test_missing_expected_token_is_503(self):
        ok, status, msg = verify_sre_token("anything", expected="")
        self.assertFalse(ok)
        self.assertEqual(status, 503)
        self.assertIn("SRE_API_TOKEN", msg)

    def test_wrong_token_is_401(self):
        ok, status, msg = verify_sre_token("wrong", expected="secret-token")
        self.assertFalse(ok)
        self.assertEqual(status, 401)

    def test_correct_bearer_and_header(self):
        ok, status, _ = verify_sre_token("secret-token", expected="secret-token")
        self.assertTrue(ok)
        self.assertEqual(status, 200)

        bearer = extract_provided_token(authorization="Bearer secret-token")
        self.assertEqual(bearer, "secret-token")
        header = extract_provided_token(x_sre_token="secret-token")
        self.assertEqual(header, "secret-token")


class TestExecutionNode(unittest.TestCase):
    def test_execution_node_rejects_freeform_without_shell(self):
        from sre_agents.nodes.execution_node import execution_node

        result = execution_node(
            {
                "approval": True,
                "proposed_solution": "npm install; rm -rf /",
            }
        )
        self.assertEqual(result["status"], "falha")
        self.assertIn("allowlist", result["execution_output"].lower())

    def test_execution_node_runs_noop(self):
        from sre_agents.nodes.execution_node import execution_node

        result = execution_node(
            {
                "approval": True,
                "proposed_solution": "recipe:noop",
            }
        )
        self.assertEqual(result["status"], "sucesso")
        self.assertIn("sre-noop-ok", result["execution_output"])

    def test_execution_node_respects_approval_false(self):
        from sre_agents.nodes.execution_node import execution_node

        result = execution_node(
            {
                "approval": False,
                "proposed_solution": "recipe:noop",
            }
        )
        self.assertEqual(result["status"], "abortado")


if __name__ == "__main__":
    unittest.main()
