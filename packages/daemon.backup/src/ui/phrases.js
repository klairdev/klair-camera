const pools = {
  startup: [
    'Waking up the workspace…',
    'Aligning context…',
    'Opening the loop…',
    'Preparing your environment…',
    'Getting things into focus…',
    'Connecting the pieces…',
    'Warming up the session…',
    'Setting up your observation post…',
    'Preparing the lens…',
    'Calibrating the frame…',
  ],
  thinking: [
    'Following the thread…',
    'Mapping the problem space…',
    'Looking for the cleanest path…',
    'Tracing dependencies…',
    'Reading through the context…',
    'Finding the signal…',
    'Piecing things together…',
  ],
  capture: [
    'Noticing a change…',
    'Reading the diff…',
    'Recording what shifted…',
    'Updating the timeline…',
    ' Capturing your agent\'s every move…',
    '🎬 Watching like a hawk. Or a very focused frame.',
    '📸 Got it. Logged and filed.',
    ' Caught that. Adding to the timeline.',
    ' Isolating the moment…',
    ' Making the invisible visible.',
  ],
  success: [
    'Ready.',
    'All set.',
    'Synced.',
    'Workspace looks good.',
    'Good to go.',
    'Frame is clear.',
    'Observation complete.',
  ],
  warning: [
    'Something feels off here.',
    'That may need another pass.',
    'There\'s a mismatch in the config.',
    'Signal\'s noisy. Worth a look.',
  ],
  error: [
    'Couldn\'t resolve that.',
    'That path doesn\'t exist.',
    'Something interrupted the flow.',
    'Ran into a dead end there.',
    'The frame went dark.',
  ],
  idle: [
    'Waiting for the next move…',
    'Standing by.',
    'Ready when you are.',
    'Listening…',
    'Frame is open. Watching.',
  ],
  goodbye: [
    'Frame closed. See you next time.',
    'Lens capped. Goodbye.',
    'Observation paused. Until next time.',
    'Standing down.',
  ],
};

let seq = 0;

export function phrase(category, fallback = '') {
  const list = pools[category];
  if (!list?.length) return fallback;
  seq += 1;
  return list[seq % list.length];
}

export function phraseRandom(category, fallback = '') {
  const list = pools[category];
  if (!list?.length) return fallback;
  return list[Math.floor(Math.random() * list.length)];
}
