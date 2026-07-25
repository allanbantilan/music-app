import sqlite3, json

db_path = r'C:\Users\allan\.local\share\mimocode\mimocode.db'
conn = sqlite3.connect(db_path)
c = conn.cursor()

# Get all music-app sessions
session_ids = [
    'ses_06790233dffe233LmrlQDkSnqZ',  # Implement plan
    'ses_0678ff37dffeoSf9BH0aNjibYd',  # checkpoint-writer
]

for sid in session_ids:
    print(f"\n{'='*60}")
    print(f"Session: {sid}")
    print(f"{'='*60}")
    c.execute('SELECT id, agent_id, data FROM message WHERE session_id = ? ORDER BY time_created', (sid,))
    rows = c.fetchall()
    print(f"Total messages: {len(rows)}")
    for r in rows:
        msg_id, agent_id, data = r
        role = json.loads(data).get('role', '?')
        agent_label = agent_id if agent_id else 'main'
        # Get all parts for this message
        c2 = conn.cursor()
        c2.execute('SELECT data FROM part WHERE message_id = ? ORDER BY time_created', (msg_id,))
        parts = c2.fetchall()
        for p in parts:
            pd = json.loads(p[0])
            ptype = pd.get('type', '?')
            if ptype == 'text':
                text = pd.get('text', '')[:200].replace('\n', ' ')
                print(f"  [{role:10}] [{agent_label:10}] TEXT: {text}")
            elif ptype == 'tool':
                tool = pd.get('tool', '?')
                state = pd.get('state', {})
                inp = str(state.get('input', ''))[:100]
                out = str(state.get('output', ''))[:100]
                print(f"  [{role:10}] [{agent_label:10}] TOOL:{tool} input={inp}")
                if out:
                    print(f"             output={out}")
            elif ptype in ('step-start', 'step-finish'):
                tokens = pd.get('tokens', '')
                print(f"  [{role:10}] [{agent_label:10}] [{ptype}] tokens={tokens}")
            else:
                print(f"  [{role:10}] [{agent_label:10}] [{ptype}]")

conn.close()
