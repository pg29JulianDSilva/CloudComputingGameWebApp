import json, io, base64
import matplotlib
matplotlib.use('agg') 
import matplotlib.pyplot as plt
from js import document, window

# We get data from the window context (in react code) as we learned in class :).
data = json.loads(window.__pyodideData)

names = [d['playerName'] for d in data]
scores = [d['highScoreore'] for d in data]
durations = [d['CreatedAt'] for d in data]

fig, ax = plt.subplots(1, 2, figsize=(12, 4))
ax[0].bar(names, scores, color='skyblue', edgecolor='blue')
ax[0].set_title('Player Scores')
ax[0].set_ylabel('Scores')

ax[1].hist(durations, bins=50)
ax[1].set_title('Duration of players on screen')
ax[1].set_xlabel('Time on game (Minutes)')
ax[1].set_ylabel('# of players')
plt.tight_layout()


buf = io.BytesIO()
fig.savefig(buf, format='png')
buf.seek(0)
img_b64 = base64.b64encode(buf.read()).decode('utf-8')
plt.close(fig)


target = document.getElementById('pyodide-target')
target.innerHTML = f'<img src="data:image/png;base64,{img_b64}" alt="Chart" />'