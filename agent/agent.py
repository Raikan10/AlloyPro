import asyncio
import logging
from dotenv import load_dotenv
from livekit import agents, rtc
from livekit.agents import AgentServer, AgentSession, Agent, room_io, voice
from livekit.plugins import google

load_dotenv(".env.local")

logger = logging.getLogger(__name__)

# Customize the agent's persona by modifying this variable
# PERSONA_INSTRUCTIONS = """You are a helpful assistant that can see through the user's camera. Be concise and conversational."""

PERSONA_INSTRUCTIONS = """You are an enthusiastic sports commentator providing strategic game analysis and commentary.

Your commentary approach:
- Provide HIGH-LEVEL strategic analysis rather than play-by-play
- Focus on: team names, current score, overall game situation, key players, and game momentum
- Give periodic updates (every 10-15 seconds) with overview commentary
- Identify and name the teams playing when you first see the game
- Track and mention the score when visible
- Discuss the overall flow and strategy of the game
- Comment on significant moments or turning points, not every single play
- Be energetic and insightful, but measured in your pace
- Continue commentary naturally without waiting for user responses, unless interrupted

Remember: You're analyzing the game at a strategic level, not calling every play. Give viewers context and understanding of what's happening overall."""

class VisionAgent(Agent):
    BASE_VIDEO_AWARENESS = """IMPORTANT: You can only see video when the user enables their camera or screenshare.

When asked to describe what you see:
- If you don't have any visual information in the current context, tell them you need them to enable their camera or start a screenshare first.
- Only describe what you can actually see in the provided video frames.
- Never make up or assume visual details that aren't present.
"""
    
    def __init__(self, persona_instructions: str = "You are a helpful assistant.") -> None:
        full_instructions = f"{self.BASE_VIDEO_AWARENESS}\n\n{persona_instructions}"
        super().__init__(instructions=full_instructions)

server = AgentServer()

@server.rtc_session()
async def entrypoint(ctx: agents.JobContext):
    # Gemini Live API includes built-in VAD-based turn detection (enabled by default)
    session = AgentSession(
        llm=google.realtime.RealtimeModel(
            model="gemini-2.5-flash-native-audio-preview-12-2025",
            voice="Enceladus",
            proactivity=True,
            enable_affective_dialog=True,
            temperature=0.8
        ),
        video_sampler=voice.VoiceActivityVideoSampler(speaking_fps=1.0, silent_fps=1.0),
    )

    await session.start(
        room=ctx.room,
        agent=VisionAgent(persona_instructions=PERSONA_INSTRUCTIONS),
        room_options=room_io.RoomOptions(
            video_input=True,
        ),
    )
    
    await ctx.connect()
    
    # Simple greeting - user speaking will trigger video flow
    await session.generate_reply(instructions="Greet the user briefly and let them know you're ready to provide sports commentary once they share their screen.")

if __name__ == "__main__":
    agents.cli.run_app(server)
