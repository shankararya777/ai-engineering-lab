from google import genai

client = genai.Client()

code = """
def greet(name):
    return "Hello " + name
"""

prompt = f"""
Review this Python code and tell me if it is correct.

Python code:
{code}

Explain any problems in simple English.
"""

response = client.models.generate_content(
    model="gemini-flash-lite-latest",
    contents=prompt
)

print(response.text)