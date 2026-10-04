"""
LLM Factory providing configurable model access (Mistral, OpenAI, or intelligent offline runner).
"""

import os
from typing import Optional, Any
from pydantic import BaseModel, Field


class CodeSolution(BaseModel):
    """Structured code solution schema directly compatible with original prototype."""
    prefix: str = Field(description="Description of the problem and approach")
    imports: str = Field(default="", description="Code block import statements")
    code: str = Field(description="Code block not including import statements")


def get_llm():
    """
    Instantiate appropriate LangChain chat model based on environment configuration.
    """
    if os.getenv("MISTRAL_API_KEY"):
        try:
            from langchain_mistralai import ChatMistralAI
            model = os.getenv("MISTRAL_MODEL", "mistral-large-latest")
            return ChatMistralAI(model=model, temperature=0)
        except Exception:
            pass

    if os.getenv("OPENAI_API_KEY"):
        try:
            from langchain_openai import ChatOpenAI
            model = os.getenv("OPENAI_MODEL", "gpt-4o")
            return ChatOpenAI(model=model, temperature=0)
        except Exception:
            pass

    return None
