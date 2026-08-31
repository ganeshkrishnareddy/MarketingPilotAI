import os
from typing import Dict, Any, List
from openai import OpenAI
from .provider import AIProvider

class OpenAIProvider(AIProvider):
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        base_url = os.getenv("OPENAI_BASE_URL", None)
        
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
            
        self.client = OpenAI(api_key=api_key, base_url=base_url)
        # Free-model-only policy: default to a free OpenRouter-compatible slug.
        self.model = os.getenv("OPENAI_MODEL", "nvidia/nemotron-3-super-120b-a12b:free")

    def generate_text(self, prompt: str, system_prompt: str = "", max_tokens: int = 1000) -> str:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        return self.generate_chat(messages, max_tokens)

    def generate_chat(self, messages: List[Dict[str, str]], max_tokens: int = 1000) -> str:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content
