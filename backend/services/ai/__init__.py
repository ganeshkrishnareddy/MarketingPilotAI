import os
from .provider import AIProvider
from .nvidia_provider import NvidiaProvider
from .openai_provider import OpenAIProvider

def get_ai_provider() -> AIProvider:
    """
    Factory to get the configured AI provider based on priority.
    Priority:
      1. NVIDIA NIM (confirmed working)
      2. OpenCode / OpenAI-compatible (once credits are added at opencode.ai/billing)
    """
    
    # Priority 1: NVIDIA NIM
    if os.getenv("NVIDIA_API_KEY"):
        try:
            return NvidiaProvider()
        except Exception as e:
            print(f"Warning: NvidiaProvider failed: {e}")

    # Priority 2: OpenCode or OpenAI direct
    if os.getenv("OPENAI_API_KEY"):
        try:
            return OpenAIProvider()
        except Exception as e:
            print(f"Warning: OpenAIProvider failed: {e}")

    raise ValueError("No valid AI provider API keys found. Check your .env file.")
