"""RE:SET · Buen Fin CDMX — pone el espectacular de RE:SET sobre una toma con un espectacular VERDE CROMA (generada con video IA).

El texto nunca lo genera la IA: el diseño (editor/video/src/buenfin/Espectacular.tsx → espectacular.png) se coloca con perspectiva.
1. Cuadro de referencia: el cuadro con más verde visible; ahí se detectan las 4 esquinas del espectacular.
2. Seguimiento de cámara: puntos ORB del edificio (fuera del espectacular y de la tela) → homografía por cuadro respecto a la
   referencia → esquinas en cada cuadro (suavizadas en el tiempo).
3. Máscara: solo donde el píxel es verde croma (la tela blanca, el helicóptero o lo que pase delante lo tapa solo).
4. Iluminación: el diseño se multiplica por la luz del verde (sombras y pliegues de la tela se conservan) y se quita el rebote verde.
Uso: python3 composite.py <toma.mp4> <espectacular.png> <salida.mp4> [--corners x0,y0,x1,y1,x2,y2,x3,y3 en el cuadro de referencia]
"""
import argparse
import json
import subprocess
import sys

import cv2
import numpy as np


def green_mask(bgr):
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    m = cv2.inRange(hsv, (40, 70, 40), (85, 255, 255))
    return cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))


def quad_from_mask(m):
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m)
    if n < 2:
        return None
    k = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    comp = (lab == k).astype(np.uint8) * 255
    hull = cv2.convexHull(cv2.findNonZero(comp))
    eps = 0.02 * cv2.arcLength(hull, True)
    for _ in range(20):
        ap = cv2.approxPolyDP(hull, eps, True)
        if len(ap) == 4:
            break
        eps *= 1.25 if len(ap) > 4 else 0.8
    pts = ap.reshape(-1, 2).astype(np.float32) if len(ap) == 4 else cv2.boxPoints(cv2.minAreaRect(hull))
    s, d = pts.sum(1), np.diff(pts, axis=1).ravel()
    return np.array([pts[np.argmin(s)], pts[np.argmin(d)], pts[np.argmax(s)], pts[np.argmax(d)]], np.float32)  # tl, tr, br, bl


def read_frames(path):
    cap = cv2.VideoCapture(path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    out = []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        out.append(f)
    return out, fps


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("plate")
    ap.add_argument("design")
    ap.add_argument("out")
    ap.add_argument("--corners", help="tl,tr,br,bl en el cuadro de referencia (si la detección automática falla)")
    ap.add_argument("--track", help="guardar esquinas por cuadro en este JSON")
    a = ap.parse_args()

    frames, fps = read_frames(a.plate)
    H, W = frames[0].shape[:2]
    masks = [green_mask(f) for f in frames]
    ref = int(np.argmax([m.sum() for m in masks]))
    q_ref = np.array([float(v) for v in a.corners.split(",")], np.float32).reshape(4, 2) if a.corners else quad_from_mask(masks[ref])
    if q_ref is None:
        sys.exit("no encontré el espectacular verde: pasa --corners")
    print(f"{len(frames)} cuadros {W}x{H} @ {fps:.2f} · referencia {ref} · esquinas {q_ref.round(1).tolist()}")

    # camera tracking on the building, away from the billboard and the cloth
    orb = cv2.ORB_create(3000)
    bm = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)

    def feat_mask(i):
        fm = np.full((H, W), 255, np.uint8)
        x0, y0 = q_ref.min(0) - 40
        x1, y1 = q_ref.max(0) + 40
        fm[int(max(0, y0 - 300)):int(min(H, y1 + 40)), int(max(0, x0 - 260)):int(min(W, x1 + 40))] = 0  # billboard + where the cloth flies
        bright = cv2.inRange(cv2.cvtColor(frames[i], cv2.COLOR_BGR2HSV), (0, 0, 200), (180, 40, 255))  # white cloth anywhere
        fm[cv2.dilate(bright, np.ones((25, 25), np.uint8)) > 0] = 0
        fm[int(H * 0.82):, :] = 0  # street traffic
        return fm

    gref = cv2.cvtColor(frames[ref], cv2.COLOR_BGR2GRAY)
    kr, dr = orb.detectAndCompute(gref, feat_mask(ref))
    quads = []
    for i, f in enumerate(frames):
        if i == ref:
            quads.append(q_ref.copy())
            continue
        k, d = orb.detectAndCompute(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY), feat_mask(i))
        Hm = None
        if d is not None and dr is not None:
            ms = sorted(bm.match(dr, d), key=lambda m: m.distance)[:600]
            if len(ms) >= 12:
                Hm, _ = cv2.findHomography(np.float32([kr[m.queryIdx].pt for m in ms]), np.float32([k[m.trainIdx].pt for m in ms]), cv2.RANSAC, 3.0)
        quads.append(cv2.perspectiveTransform(q_ref[None], Hm)[0] if Hm is not None else (quads[-1] if quads else q_ref.copy()))
    Q = np.array(quads)
    # temporal smoothing (no jitter), keep it locked on the building
    k = 5
    Qs = np.array([Q[max(0, i - k): i + k + 1].mean(0) for i in range(len(Q))])
    if a.track:
        json.dump({"fps": fps, "ref": ref, "corners": Qs.round(2).tolist()}, open(a.track, "w"))

    design = cv2.imread(a.design, cv2.IMREAD_COLOR)
    dh, dw = design.shape[:2]
    src = np.float32([[0, 0], [dw, 0], [dw, dh], [0, dh]])
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", f"{fps}", "-i", "-",
                           "-c:v", "libx264", "-crf", "14", "-pix_fmt", "yuv420p", a.out], stdin=subprocess.PIPE)
    for f, m, q in zip(frames, masks, Qs):
        P = cv2.getPerspectiveTransform(src, q.astype(np.float32))
        warped = cv2.warpPerspective(design, P, (W, H), flags=cv2.INTER_CUBIC)
        inside = cv2.warpPerspective(np.full((dh, dw), 255, np.uint8), P, (W, H))
        alpha = cv2.GaussianBlur(cv2.min(m, inside), (5, 5), 0).astype(np.float32)[..., None] / 255
        # light of the green surface → shading of the design (folds, cloth shadows, sun gradient)
        g = f[..., 1].astype(np.float32)
        ref_g = np.percentile(g[m > 0], 90) if (m > 0).any() else 255
        light = np.clip(cv2.GaussianBlur(g, (0, 0), 3) / max(ref_g, 1), 0.25, 1.15)[..., None]
        comp = warped.astype(np.float32) * light
        # despill the green fringe around the cloth edge
        fo = f.astype(np.float32)
        fo[..., 1] = np.minimum(fo[..., 1], np.maximum(fo[..., 0], fo[..., 2]) * 1.05 + 8)
        out = fo * (1 - alpha) + comp * alpha
        ff.stdin.write(np.clip(out, 0, 255).astype(np.uint8).tobytes())
    ff.stdin.close()
    ff.wait()
    print("listo:", a.out)


if __name__ == "__main__":
    main()
