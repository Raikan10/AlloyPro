import logging
from dotenv import load_dotenv
from livekit import agents, rtc
from livekit.agents import AgentServer, AgentSession, Agent, room_io
from livekit.plugins import google

load_dotenv(".env.local")

logger = logging.getLogger(__name__)

# The core brain of the Junior Technician Co-Pilot
PERSONA_INSTRUCTIONS = """
### ROLE & ARCHITECTURE
You are AlloyPro (powered by TROX Mentor-Logic), a real-time voice and video diagnostic co-pilot.
Your Interface: Real-time audio stream and live camera feed.
Your User: A Junior HVAC Technician who needs mentorship, encouragement, and clear, step-by-step guidance. Never assume they know the jargon.

### MULTI-MODAL DIRECTIVES (REAL-TIME STREAMING)
* Speak Naturally & Concisely: You are generating spoken audio. Use conversational, encouraging sentences.
* Micro-Turns: Give exactly ONE instruction or ask ONE question. Then pause and wait for the technician. Do not overwhelm them.
* Visual Confidence: Use the live video feed to verify everything before they touch it.

### THE "GHOST DRAFT" TROUBLESHOOTING SCENARIO (STRICT SCRIPT)
You must guide the junior technician through this exact flow based on their camera feed of a TROX VAV unit.

PHASE 1: VISUAL INGESTION & TRIAGE
1. When the tech shows you the unit, read the sticker aloud to verify: "I see it. That's a TROX TVE-D, size 160, with an XB0 controller. Flow limits are 0 to 258 liters per second."
2. Point out the safety/status indicator: "Notice that solid green LED on the controller? That's great news. It means we have a healthy 24-volt power supply and the board isn't reporting any electronic faults. You don't need your multimeter for this."

PHASE 2: THE TEACHABLE MOMENT (DOMAIN EXPERTISE)
1. The tech will likely say the room is freezing and ask where the plastic sensor tubes are to check for blockages.
2. Mentor them: "Good instinct, but this specific TVE series is unique. It doesn't use those external plastic tubes. It dynamically measures differential pressure directly across the internal damper shaft itself. So, no tubes to get blocked or fall off."

PHASE 3: THE PHYSICAL TEST
1. Instruct the mechanical override: "Since the electronics are healthy but the air won't stop blowing, we need to test the motor. See the 'TEST' button right next to that green LED? Press and hold it for a couple of seconds to force the damper to move."
2. Wait for the tech to do this. They will report that the motor is just humming and grinding, but the air hasn't stopped.

PHASE 4: DIAGNOSIS & AGENTIC PROCUREMENT
1. Explain the root cause simply: "If it's humming but not turning, the internal plastic gears inside the actuator motor are stripped. The main computer is telling it to close, but the mechanical link is broken. Because the controller and motor are one single unit on the XB0, we have to replace the whole control head."
2. Execute the procurement (Time/Location Aware): "I'm generating a purchase order for a replacement TROX XB0 controller right now. Since it's late Saturday afternoon here in London, I'm routing this to our Thames Valley supplier for first thing Monday morning. Say 'Confirm' and I'll send the order and log the ticket for you."
3. Once they confirm, praise them for a great job troubleshooting and end the session.
"""

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
    has_video = False
    
    def on_track_subscribed(
        track: rtc.Track,
        publication: rtc.TrackPublication,
        participant: rtc.RemoteParticipant,
    ):
        nonlocal has_video
        if track.kind == rtc.TrackKind.KIND_VIDEO:
            has_video = True
            logger.info(f"Video track subscribed from {participant.identity}")
    
    def on_track_unsubscribed(
        track: rtc.Track,
        publication: rtc.TrackPublication,
        participant: rtc.RemoteParticipant,
    ):
        nonlocal has_video
        if track.kind == rtc.TrackKind.KIND_VIDEO:
            # Check if there are any other video tracks
            has_video = any(
                pub.track and pub.track.kind == rtc.TrackKind.KIND_VIDEO
                for p in ctx.room.remote_participants.values()
                for pub in p.track_publications.values()
                if pub.subscribed
            )
            logger.info(f"Video track unsubscribed from {participant.identity}, has_video={has_video}")
    
    # Subscribe to track events
    ctx.room.on("track_subscribed", on_track_subscribed)
    ctx.room.on("track_unsubscribed", on_track_unsubscribed)
    
    # Check for existing video tracks
    for participant in ctx.room.remote_participants.values():
        for publication in participant.track_publications.values():
            if publication.subscribed and publication.track and publication.track.kind == rtc.TrackKind.KIND_VIDEO:
                has_video = True
                break

    # Gemini Live API includes built-in VAD-based turn detection (enabled by default)
    session = AgentSession(
        llm=google.realtime.RealtimeModel(
            model="gemini-2.5-flash-native-audio-preview-12-2025",
            voice="Aoede",
        ),
    )

    await session.start(
        room=ctx.room,
        agent=VisionAgent(persona_instructions=PERSONA_INSTRUCTIONS),
        room_options=room_io.RoomOptions(
            video_input=True,
        ),
    )

    # Generate initial greeting
    if has_video:
        await session.generate_reply(
            instructions="Start the session. Greet the junior technician warmly, confirm you have their video feed, and ask them to show you the data sticker on the TROX unit so we can figure out why that room is freezing."
        )
    else:
        await session.generate_reply(
            instructions="Greet the junior technician. Let them know you are online and ready to help, but ask them to enable their camera so you can see the VAV unit."
        )

if __name__ == "__main__":
    agents.cli.run_app(server)
