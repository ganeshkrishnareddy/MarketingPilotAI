from abc import ABC, abstractmethod
from typing import Dict, Any, List

class AIProvider(ABC):
    """Abstract base class for all AI providers."""
    
    @abstractmethod
    def generate_text(self, prompt: str, system_prompt: str = "", max_tokens: int = 1000) -> str:
        """Generate text based on a prompt."""
        pass
        
    @abstractmethod
    def generate_chat(self, messages: List[Dict[str, str]], max_tokens: int = 1000) -> str:
        """Generate chat response based on conversation history."""
        pass
