# Customization Guide

## Change the agent's persona

Modify the `PERSONA_INSTRUCTIONS` variable at the top of `agent/agent.py`:

```python
# Customize the agent's persona by modifying this variable
PERSONA_INSTRUCTIONS = """Your custom persona instructions here."""
```

The `VisionAgent` class automatically includes video awareness safeguards, so you don't need to include instructions about checking for video availability. Focus your persona instructions on the role-specific behavior and personality.

### Example personas

**Sports Commentator:**
```python
PERSONA_INSTRUCTIONS = """You are an enthusiastic sports commentator providing live play-by-play commentary.

CRITICAL: You must provide CONTINUOUS commentary without waiting for user responses. Do not stop talking unless the user explicitly interrupts you by speaking.

Your commentary style:
- Generate continuous commentary as video frames arrive
- Process and comment on video frames as fast as they come in
- Analyze action between frames and extrapolate what is happening
- Keep up with the gameplay pace - you don't need to comment on every single frame, but try to parse between frames and maintain a steady flow of commentary
- Be energetic, insightful, and entertaining
- Call out player movements, key plays, and game dynamics
- Only pause or stop when the user speaks to interrupt you

Remember: Your job is to keep talking and providing commentary continuously. The video feed is your primary input - use it actively and continuously."""
```

**Important**: For continuous commentary, you'll also need to configure the RealtimeModel with `proactivity=True` and use constant video frame sampling (see sections below).

**Basketball Coach:**
```python
PERSONA_INSTRUCTIONS = """You are a basketball coach analyzing game footage.
Focus on player positioning, defensive rotations, and offensive sets.
Provide tactical feedback as if coaching from the sideline.
Be specific about what players should do differently."""
```

**Yoga Instructor:**
```python
PERSONA_INSTRUCTIONS = """You are a calm, encouraging yoga instructor.
Watch the student's poses and provide gentle corrections.
Focus on alignment, breathing cues, and safety.
Offer modifications for different skill levels."""
```

**Esports Caster:**
```python
PERSONA_INSTRUCTIONS = """You are a high-energy esports commentator.
Call out plays, highlight mechanical skill, and build hype.
Reference common esports terminology and team strategies.
Keep the energy up during slower moments."""
```

**Fitness Trainer:**
```python
PERSONA_INSTRUCTIONS = """You are a motivating fitness trainer.
Watch the user's form and provide real-time feedback.
Encourage proper technique and suggest adjustments.
Keep the energy high and supportive."""
```

### Advanced: Passing persona instructions programmatically

If you need to pass different persona instructions at runtime (e.g., based on user preferences), you can still pass `persona_instructions` directly to `VisionAgent`:

```python
agent = VisionAgent(
    persona_instructions="""Your custom persona instructions here."""
)
```

### Advanced: Overriding instructions completely

If you need full control over the instructions (not recommended for most use cases), you can override the `__init__` method:

```python
class CustomAgent(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions="""Your complete instructions here."""
        )
```

## Add function calling

Function calling lets the agent interact with external systems or perform actions. Add tools using the `@function_tool` decorator:

```python
from livekit.agents import function_tool

@function_tool
async def save_highlight(
    description: str,
    timestamp: str,
) -> str:
    """Save a highlight moment from the stream.
    
    Args:
        description: What happened in this highlight
        timestamp: When it occurred (e.g., "2:34")
    """
    # In production: save to database, trigger clip creation
    print(f"Highlight saved: {description} at {timestamp}")
    return f"Saved highlight: {description}"

@function_tool
async def lookup_player_stats(
    player_name: str,
    stat_type: str,
) -> str:
    """Look up statistics for a player.
    
    Args:
        player_name: Name of the player
        stat_type: Type of stat (points, rebounds, assists, etc.)
    """
    # In production: call sports API
    return f"{player_name}'s {stat_type}: [mock data]"
```

Then pass the tools to your agent. Note that `VisionAgent` doesn't currently support passing tools directly. For function calling, you'll need to create a custom agent class:

```python
class CustomAgent(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions=VisionAgent.BASE_VIDEO_AWARENESS + "\n\n" + "Your persona instructions",
            tools=[save_highlight, lookup_player_stats],
        )
```

## Adjust video settings

Video input is enabled by default in `room_options`. To customize frame rate:

```python
from livekit.agents import room_io, voice

session = AgentSession(
    llm=google.realtime.RealtimeModel(...),
    # Customize video sampling
    video_sampler=voice.VoiceActivityVideoSampler(
        speaking_fps=1.0,  # FPS when user is speaking
        silent_fps=0.3,    # FPS when user is silent
    ),
)

await session.start(
    room=ctx.room,
    agent=VisionAgent(),
    room_options=room_io.RoomOptions(
        video_input=True,
    ),
)
```

**For continuous commentary** (like sports commentators), use constant frame rate regardless of voice activity:

```python
session = AgentSession(
    llm=google.realtime.RealtimeModel(...),
    video_sampler=voice.VoiceActivityVideoSampler(speaking_fps=1.0, silent_fps=1.0),
)
```

This ensures the model receives video frames at Gemini's maximum supported rate (1 FPS at 768x768 resolution) even when the user is silent, providing consistent visual context for continuous commentary.

To disable video entirely, set `video_input=False` in `RoomOptions` or remove the `video_input` parameter.

## Swap voice/model

### Change voice

Modify the `voice` parameter in the `RealtimeModel`:

```python
session = AgentSession(
    llm=google.realtime.RealtimeModel(
        model="gemini-2.5-flash-native-audio-preview-12-2025",
        voice="Aoede",  # Options: Aoede, Charon, Fenrir, Kore, Puck
    ),
)
```

**Note**: Use `google.beta.realtime.RealtimeModel` (not `google.realtime.RealtimeModel`) to access advanced features like `proactivity` and `enable_affective_dialog`.

### Enable continuous/proactive responses

For personas that need to speak continuously without waiting for user input (like sports commentators), configure the model with proactive response parameters:

```python
session = AgentSession(
    llm=google.beta.realtime.RealtimeModel(
        model="gemini-2.5-flash-native-audio-preview-12-2025",
        voice="Aoede",
        proactivity=True,  # KEY: Model generates responses without user prompting
        enable_affective_dialog=True,  # More natural, expressive responses
        temperature=0.8,  # Response variation (0.6-1.2 valid range)
        max_output_tokens=2048,  # Allow longer response segments
    ),
)
```

**Key parameters**:
- `proactivity: bool` - Enables the model to generate responses without waiting for user input. Critical for continuous commentary.
- `enable_affective_dialog: bool` - Makes responses more expressive and natural.
- `temperature: float` - Controls response variation. Valid range is 0.6-1.2. Higher values (0.8-1.0) create more varied commentary.
- `max_output_tokens: int` - Maximum length of each response. Increase for longer commentary segments.

Available models are listed in the [Gemini API documentation](https://ai.google.dev/gemini-api/docs/live).
