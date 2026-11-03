import time
from typing import Dict, Any, Optional
import os
from app.core.config import settings

class SarvamIntegration:
    """Gateway for Sarvam AI interactions."""

    @classmethod
    def get_client(cls):
        api_key = settings.SARVAM_API_KEY or os.getenv("SARVAM_API_KEY")
        if not api_key:
            raise ValueError("SARVAM_API_KEY is not configured in environment.")
        
        # Import lazily so lack of key/package doesn't break app boot
        from sarvamai import SarvamAI
        return SarvamAI(api_subscription_key=api_key)

    @classmethod
    def smoke_test(cls) -> Dict[str, Any]:
        """Runs a minimal chat completion check using sarvam-105b-conversations."""
        start_time = time.time()
        try:
            client = cls.get_client()
            response = client.chat.completions(
                model="sarvam-105b-conversations",
                messages=[
                    {"role": "user", "content": "Namaste. Respond with 'READY' if active."}
                ]
            )
            elapsed_ms = round((time.time() - start_time) * 1000, 2)
            
            content = ""
            if response.choices and len(response.choices) > 0:
                content = response.choices[0].message.content or ""
            
            return {
                "status": "success",
                "model": "sarvam-105b-conversations",
                "latency_ms": elapsed_ms,
                "configured": True,
                "response_snippet": content.strip()[:100]
            }
        except ValueError as ve:
            return {
                "status": "unconfigured",
                "model": "sarvam-105b-conversations",
                "latency_ms": 0,
                "configured": False,
                "error": "SARVAM_API_KEY not configured"
            }
        except Exception as exc:
            elapsed_ms = round((time.time() - start_time) * 1000, 2)
            return {
                "status": "error",
                "model": "sarvam-105b-conversations",
                "latency_ms": elapsed_ms,
                "configured": True,
                "error_type": type(exc).__name__,
                "error": str(exc)[:200]
            }

