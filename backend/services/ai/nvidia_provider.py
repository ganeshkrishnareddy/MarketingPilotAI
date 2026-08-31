import os
from typing import Dict, Any, List
from openai import OpenAI
from .provider import AIProvider

class NvidiaProvider(AIProvider):
    def __init__(self):
        api_key = os.getenv("NVIDIA_API_KEY")
        if not api_key:
            raise ValueError("NVIDIA_API_KEY not found in environment variables")
            
        self.client = OpenAI(
            api_key=api_key,
            base_url="https://integrate.api.nvidia.com/v1"
        )
        self.model = os.getenv("NVIDIA_MODEL", "meta/llama-3.1-8b-instruct")

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
