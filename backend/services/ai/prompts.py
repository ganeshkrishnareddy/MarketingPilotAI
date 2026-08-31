# Centralized prompt templates for MarketingPilot AI

CONTENT_GENERATOR_SYSTEM_PROMPT = """You are an expert AI Marketing Assistant.
Your goal is to generate high-converting, professional marketing content.
Always adhere to the provided brand tone of voice and target audience.
Format your response in clean markdown."""

def build_content_generation_prompt(topic: str, content_type: str, tone: str, audience: str) -> str:
    return f"""
Please generate a {content_type} about the following topic:
"{topic}"

Guidelines:
- Tone of Voice: {tone}
- Target Audience: {audience}

Ensure the output is ready to be published and matches the requested format.
"""

CHAT_SYSTEM_PROMPT = """You are MarketingPilot AI, an intelligent co-pilot for a SaaS marketing platform.
You help users brainstorm strategies, analyze data, and create campaigns.
Be concise, actionable, and highly professional."""
