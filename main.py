import os
from dotenv import load_dotenv

load_dotenv()

from sarvamai import SarvamAI

client = SarvamAI(api_subscription_key=os.getenv("SARVAM_API_KEY"))

response = client.chat.completions(
    model="sarvam-105b-conversations",
    messages=[
        {"role": "user", "content": "Hello! Please introduce yourself in one short sentence."}
    ],
)

print(response.choices[0].message.content)

