// Local Whisper (small, q8 ONNX) with word-level timestamps, fully offline.
// Usage: node transcribe.mjs <audio-or-video> <out.json> [language=es]
import { pipeline, env } from "@huggingface/transformers";
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

env.allowRemoteModels = false;
env.localModelPath = "/home/user/whisper-models/package/models/";

const [input, out, language = "es"] = process.argv.slice(2);
// ffmpeg -> 16 kHz mono float32 PCM
const pcm = execFileSync("ffmpeg", ["-v", "error", "-i", input, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], { maxBuffer: 1 << 30 });
const audio = new Float32Array(pcm.buffer, pcm.byteOffset, pcm.byteLength / 4);

const asr = await pipeline("automatic-speech-recognition", "Xenova/whisper-small", { dtype: "q8" });
const r = await asr(audio, { language, task: "transcribe", return_timestamps: "word", chunk_length_s: 30, stride_length_s: 5 });
const words = r.chunks.map((c) => ({ word: c.text.trim(), start: +c.timestamp[0].toFixed(3), end: +(c.timestamp[1] ?? c.timestamp[0]).toFixed(3) }));
writeFileSync(out, JSON.stringify({ text: r.text.trim(), words }, null, 2));
console.log(r.text.trim());
for (const w of words) console.log(`${w.start.toFixed(2)}-${w.end.toFixed(2)} ${w.word}`);
