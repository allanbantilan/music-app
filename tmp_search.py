import sqlite3, json

conn = sqlite3.connect(r'C:\Users\allan\.local\share\mimocode\mimocode.db')
c = conn.cursor()

# Search for user statements with keywords
keywords = ['always', 'never', 'remember', 'rule', 'decision', 'prefer', 'must', 'should not', 'dont', 'plan', 'phase', 'build']
for kw in keywords:
    c.execute(
        "SELECT m.id, p.data FROM message m JOIN part p ON p.message_id = m.id "
        "WHERE json_extract(m.data, '$.role') = 'user' AND json_extract(p.data, '$.type') = 'text' "
        "AND LOWER(json_extract(p.data, '$.text')) LIKE ? LIMIT 3",
        (f'%{kw}%',)
    )
    rows = c.fetchall()
    if rows:
        print(f'=== Keyword: {kw} ===')
        for r in rows:
            pd = json.loads(r[1])
            text = pd.get('text', '')[:300].replace('\n', ' ')
            print(f'  [{r[0][:20]}] {text}')
        print()

conn.close()
