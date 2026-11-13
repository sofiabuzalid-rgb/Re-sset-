"""
Word-timed "pop" captions for the RE:SET Buen Fin ads (style of the client's reference reel): each subtitle block of
<edit>.subs.json is split into short chunks, every word appears as she says it, and key words (RE:SET, 15%, descuento…)
sit on their own line in bold italic. Word times come from the Whisper words of the edit's voice segments
(docs/*/transcripts.json); the text itself stays the hand-checked literal block text.
Output: <edit>.captions.json = [{from, to, top, words: [{f, w, em}]}]  (f = frames from the chunk start)
Usage: python3 scripts/caption-words.py <path/to/edit.json>
"""
import difflib, json, os, re, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
EP = sys.argv[1]
e = json.load(open(EP))
FPS = e["fps"]
TR = json.load(open(os.path.join(ROOT, e["transcripts"])))
TR = {k: v["segments"] if isinstance(v, dict) else v for k, v in TR.items()}
subs = json.load(open(EP[:-5] + ".subs.json"))
KEY = {"re:set", "15%", "descuento", "increíbles", "navidad", "familia", "regalo", "calientitas"}
KEY |= {k.lower() for k in e.get("captionKeys", [])}
TOP = e.get("captionTop", 940)

starts, t = [], 0
for s in e["shots"]:
    starts.append((t, s))
    t += s["frames"]


def shot_at(fr):
    cur = starts[0][1]
    for a, s in starts:
        if a <= fr:
            cur = s
    return cur


def norm(w):
    return re.sub(r"^[¿¡\"“]+|[,.?!:;\"”]+$", "", w).lower()


out = []
for blk in subs:
    v = next(v for v in e["voice"] if v["at"] <= blk["from"] < v["at"] + (v["b"] - v["a"]) * FPS + 2)
    s0 = v["a"] + (blk["from"] - v["at"]) / FPS
    s1 = v["a"] + (blk["to"] - v["at"]) / FPS
    Wd = [w for seg in TR[v["src"]] for w in seg["words"] if s0 - 0.15 <= w[0] < s1 - 0.12]
    T = blk["text"].replace("*", "").split()
    # align her literal text to Whisper's words; unmatched tokens are spaced between their matched neighbours
    times = [None] * len(T)
    sm = difflib.SequenceMatcher(a=[norm(x) for x in T], b=[norm(w[2]) for w in Wd], autojunk=False)
    for i, j, n in sm.get_matching_blocks():
        for k in range(n):
            times[i + k] = Wd[j + k][0]
    anchors = [(-1, s0)] + [(i, x) for i, x in enumerate(times) if x is not None] + [(len(T), s1 - 0.1)]
    for (i0, t0), (i1, t1) in zip(anchors, anchors[1:]):
        for i in range(i0 + 1, i1):
            times[i] = t0 + (t1 - t0) * (i - i0) / (i1 - i0) if i0 >= 0 else s0 + (t1 - s0) * i / max(1, i1)
    frames = [max(blk["from"], min(blk["to"] - 3, round(v["at"] + (x - v["a"]) * FPS))) for x in times]
    frames = [max(frames[:i + 1]) for i in range(len(frames))]  # monotonic
    frames[0] = blk["from"]
    # chunks: close after a key word, at sentence punctuation, on a pause, or when line one gets long
    chunks, cur = [], []
    for i, w in enumerate(T):
        cur.append(i)
        nxt = T[i + 1] if i + 1 < len(T) else None
        chars = len(" ".join(T[j] for j in cur))
        rest = len(" ".join(T[i + 1:]))
        last = rest <= 12  # never leave the block's last word or two alone on screen
        brk = (nxt is None or norm(w) in KEY or (re.search(r"[.?!,]$", w) and chars > 6)
               or (frames[i + 1] - frames[i] > 0.5 * FPS and chars > 6)
               or (chars + 1 + len(nxt) > (42 if last else 28) and norm(nxt) not in KEY))
        if brk:
            chunks.append(cur)
            cur = []
    # a lone filler word ("tenemos") joins the chunk after it instead of flashing on its own
    k = 0
    while k < len(chunks) - 1:
        c = chunks[k]
        if len(c) == 1 and norm(T[c[0]]) not in KEY and not re.search(r"[.?!,]$", T[c[0]]):
            chunks[k + 1] = c + chunks[k + 1]
            del chunks[k]
        else:
            k += 1
    for k, c in enumerate(chunks):
        a = frames[c[0]] if k else blk["from"]
        b = frames[chunks[k + 1][0]] if k + 1 < len(chunks) else blk["to"]
        top = blk.get("capTop", shot_at(a).get("capTop", TOP))
        out.append({"from": a, "to": b, "top": top,
                    "words": [{"f": frames[j] - a, "w": T[j], "em": norm(T[j]) in KEY} for j in c]})
json.dump(out, open(EP[:-5] + ".captions.json", "w"), indent=1, ensure_ascii=False)
for c in out:
    print(c["from"], c["to"], " ".join(("*" + x["w"] + "*") if x["em"] else x["w"] for x in c["words"]))
