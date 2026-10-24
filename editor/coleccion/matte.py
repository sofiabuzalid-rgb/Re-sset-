"""RE:SET New Collection — recorte de la modelo con BiRefNet (matting por IA) y composición sobre fondo blanco de estudio.

Uso: python3 editor/coleccion/matte.py <modelo.onnx> <clip> <inicio_s> <dur_s> <salida_base>
Lee editor/video/public/tonos/IMG_<clip>.mp4 (1080×1920), estima el alfa por cuadro (1024², ImageNet norm) y guarda
  <salida_base>.fg.mp4 (los cuadros originales del tramo) y <salida_base>.alpha.mp4 (alfa en gris, casi sin pérdida),
para componer el fondo después con compose.py sin volver a correr la IA.
"""
import subprocess, sys, time
from pathlib import Path
import cv2
import numpy as np
import onnxruntime as ort

model, clip, t0, dur, out = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), sys.argv[5]
ROOT = Path(__file__).resolve().parents[2]
src = ROOT / f"editor/video/public/tonos/IMG_{clip}.mp4"
W, H, FPS = 1080, 1920, 30

so = ort.SessionOptions(); so.intra_op_num_threads = 4; so.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
sess = ort.InferenceSession(model, so, providers=["CPUExecutionProvider"])
inp = sess.get_inputs()[0].name
mean = np.array([0.485, 0.456, 0.406], np.float32); std = np.array([0.229, 0.224, 0.225], np.float32)

cap = cv2.VideoCapture(str(src)); cap.set(cv2.CAP_PROP_POS_MSEC, t0 * 1000)
def writer(path, pix):
    return subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", pix, "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                             "-c:v", "libx264", "-preset", "slow", "-crf", "8" if pix == "gray" else "12", "-pix_fmt", "yuv420p" if pix != "gray" else "gray", "-g", "1", path], stdin=subprocess.PIPE)
fgw, aw = writer(out + ".fg.mp4", "bgr24"), writer(out + ".alpha.mp4", "gray")
n = round(dur * FPS); prev = None; t = time.time()
for i in range(n):
    ok, fr = cap.read()
    if not ok:
        break
    x = cv2.resize(cv2.cvtColor(fr, cv2.COLOR_BGR2RGB), (1024, 1024), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
    x = ((x - mean) / std).transpose(2, 0, 1)[None]
    a = 1 / (1 + np.exp(-sess.run(None, {inp: x})[0][0, 0]))  # logits → alpha
    a = cv2.resize(a, (W, H), interpolation=cv2.INTER_CUBIC).clip(0, 1)
    a = ((a - 0.08) / 0.88).clip(0, 1)  # drop the faint wall haze the model leaves at low alpha
    if prev is not None:  # light temporal smoothing against edge flicker
        a = 0.75 * a + 0.25 * prev
    prev = a
    fgw.stdin.write(fr.tobytes()); aw.stdin.write((a * 255).astype(np.uint8).tobytes())
for w_ in (fgw, aw):
    w_.stdin.close(); w_.wait()
print(f"{clip} {t0}+{dur}s: {i + 1} cuadros, {(time.time() - t) / (i + 1):.2f} s/cuadro")
