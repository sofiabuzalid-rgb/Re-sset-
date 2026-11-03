"""RE:SET · Buen Fin CDMX — escena del helicóptero a partir de una FOTO de Reforma con el espectacular en verde croma.

No hay toma de video: la acción se construye aquí (2.5D):
- el diseño de RE:SET se coloca con perspectiva sobre el verde (el texto nunca lo genera la IA);
- una tela blanca simulada con física (partículas + restricciones) cubre el espectacular, sujeta arriba;
- el helicóptero (recorte de una foto) la jala con dos cables: la tela se pela hacia arriba y a la izquierda y se va colgando;
- sombreado de la tela por normales, sombra de la tela sobre la fachada, rotor girando, desenfoque de movimiento,
  cámara casi fija con un empuje lento, grano.
Uso: python3 heli_scene.py <foto.png> <helicoptero.png> <diseño.png> <salida.mp4> [--seconds 12] [--frames 0,75,160] [--size 1080x1920]
"""
import argparse
import math
import os
import subprocess
import sys

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from composite import green_mask, quad_from_mask  # noqa: E402
from traffic import Traffic  # noqa: E402

FPS = 30
OUT_W, OUT_H = 1080, 1920
OVER = 1.1                       # the scene canvas is 10% larger than the frame (room for the camera push)
SW, SH = int(OUT_W * OVER), int(OUT_H * OVER)

# timeline (s) — reveal lands at ~5.3 s, on the music's big accent
T_PULL, T_REVEAL, T_GONE = 2.9, 5.3, 8.8
PULL_TAIL, ROPE_TAIL = float(os.environ.get("PULL_TAIL", 1.0)), float(os.environ.get("ROPE_TAIL", 0.9))


def smooth(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


def lerp(a, b, t):
    return a + (b - a) * t


# ---------------------------------------------------------------- plate + design
def billboard_plate(plate, design, quad=None):
    """Plate resized to the scene canvas with the design pinned on the green panel."""
    pl = cv2.resize(plate, (SW, SH), interpolation=cv2.INTER_CUBIC)
    m = green_mask(pl)
    q = quad if quad is not None else quad_from_mask(m)
    # pre-shrink to ~1.5x the on-screen size (clean downsampling), then warp
    ph = float(max(np.linalg.norm(q[3] - q[0]), np.linalg.norm(q[2] - q[1])))
    k = min(1.0, 1.5 * ph / design.shape[0])
    design = cv2.resize(design, None, fx=k, fy=k, interpolation=cv2.INTER_AREA)
    dh, dw = design.shape[:2]
    P = cv2.getPerspectiveTransform(np.float32([[0, 0], [dw, 0], [dw, dh], [0, dh]]), q.astype(np.float32))
    warped = cv2.warpPerspective(design, P, (SW, SH), flags=cv2.INTER_CUBIC)
    inside = cv2.warpPerspective(np.full((dh, dw), 255, np.uint8), P, (SW, SH))
    # everything green near the panel becomes billboard (edges included), outside stays plate
    mm = cv2.dilate(m, np.ones((5, 5), np.uint8))
    alpha = cv2.GaussianBlur(cv2.min(cv2.max(mm, cv2.erode(inside, np.ones((3, 3), np.uint8))), inside), (3, 3), 0).astype(np.float32)[..., None] / 255
    g = pl[..., 1].astype(np.float32)
    ref = np.percentile(g[m > 0], 90) if (m > 0).any() else 255
    light = np.clip(cv2.GaussianBlur(g, (0, 0), 6) / max(ref, 1), 0.6, 1.08)[..., None]
    fo = pl.astype(np.float32)
    fo[..., 1] = np.minimum(fo[..., 1], np.maximum(fo[..., 0], fo[..., 2]) * 1.05 + 8)  # despill the panel edge
    out = fo * (1 - alpha) + warped.astype(np.float32) * light * alpha
    return np.clip(out, 0, 255).astype(np.uint8), q, P


# ---------------------------------------------------------------- helicopter cutout
def heli_cutout(img):
    """Key the sky out of a helicopter photo; drop the (frozen) rotor blades, they're redrawn spinning."""
    h, w = img.shape[:2]
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float32)
    border = np.concatenate([lab[:6].reshape(-1, 3), lab[-6:].reshape(-1, 3), lab[:, :6].reshape(-1, 3), lab[:, -6:].reshape(-1, 3)])
    sky = np.median(border, 0)
    # the sky is a gradient: fit it per row from the borders
    rows = np.concatenate([lab[:, :8], lab[:, -8:]], 1).mean(1)
    d = np.linalg.norm(lab - rows[:, None, :], axis=2)
    fg = (d > 22).astype(np.uint8) * 255
    k = max(3, int(round(w * 0.012)) | 1)  # blades are thinner than this, the fuselage and tail boom are not
    body = cv2.morphologyEx(fg, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k)))
    n, lab_, st, _ = cv2.connectedComponentsWithStats(body)
    keep = np.zeros_like(body)
    if n > 1:
        big = 1 + np.argsort(st[1:, cv2.CC_STAT_AREA])[::-1]
        for i in big[:3]:
            if st[i, cv2.CC_STAT_AREA] > 0.08 * st[big[0], cv2.CC_STAT_AREA]:
                keep[lab_ == i] = 255
    keep = cv2.morphologyEx(keep, cv2.MORPH_CLOSE, np.ones((k, k), np.uint8))
    # thin parts below the rotor plane (landing skids, antennas) come back; only the frozen blades stay out
    ys_ = np.where(keep.any(1))[0]
    if len(ys_):
        cols = keep[:, keep.shape[1] // 3: 2 * keep.shape[1] // 3]
        top_body = int(np.where(cols.any(1))[0].min()) if cols.any() else int(ys_.min())
        below = np.zeros_like(fg)
        below[top_body + int(0.12 * (ys_.max() - top_body)):, :] = 255
        near = cv2.dilate(keep, np.ones((k * 4, k * 4), np.uint8))
        keep = cv2.max(keep, cv2.min(cv2.min(fg, below), near))
    x, y, bw, bh = cv2.boundingRect(keep)
    rgba = np.dstack([img, cv2.GaussianBlur(keep, (3, 3), 0)])[y:y + bh, x:x + bw]
    a = rgba[..., 3]
    cols = range(bw // 3, 2 * bw // 3)
    tops = [(np.argmax(a[:, c] > 128), c) for c in cols if (a[:, c] > 128).any()]
    my, mx = min(tops) if tops else (0, bw // 2)
    _ = sky
    return rgba, (mx, my)


# ---------------------------------------------------------------- cloth
class Cloth:
    NX, NY = -0.30, 0.06          # screen direction of the facade normal (the panel faces camera-left)

    def __init__(self, H, nu=24, nv=82, mu=0.045, mv=0.03):
        us = np.linspace(-mu, 1 + mu, nu)
        vs = np.linspace(-mv, 1 + mv, nv)
        U, V = np.meshgrid(us, vs)
        uv = np.stack([U.ravel(), V.ravel()], 1).astype(np.float32)
        xy = cv2.perspectiveTransform(uv[None], H)[0]
        self.nu, self.nv = nu, nv
        self.p = np.concatenate([xy, np.full((len(xy), 1), 2.0, np.float32)], 1).astype(np.float64)
        self.p[:, 2] += np.random.RandomState(3).rand(len(xy)) * 3
        self.prev = self.p.copy()
        self.rest_top = self.p[:nu].copy()
        self.uv = uv
        idx = np.arange(nu * nv).reshape(nv, nu)
        pairs = [
            (idx[:, :-1], idx[:, 1:]), (idx[:-1, :], idx[1:, :]),            # structural
            (idx[:-1, :-1], idx[1:, 1:]), (idx[:-1, 1:], idx[1:, :-1]),      # shear
            (idx[:, :-2], idx[:, 2:]), (idx[:-2, :], idx[2:, :]),            # bending
        ]
        a = np.concatenate([p[0].ravel() for p in pairs])
        b = np.concatenate([p[1].ravel() for p in pairs])
        self.a, self.b = a, b
        self.rest = np.linalg.norm(self.p[a] - self.p[b], axis=1)
        self.stiff = np.concatenate([np.full(p[0].size, s) for p, s in zip(pairs, [1, 1, .7, .7, .45, .45])])
        self.idx = idx
        self.pinned = np.zeros(len(self.p), bool)
        self.pinned[idx[0]] = True
        self.pin_pos = self.p.copy()
        # gathered top: the pins hold the fabric 9% narrower than it is, so it buckles into vertical folds
        top = idx[0]
        cx = self.p[top, :2].mean(0)
        self.pin_pos[top, :2] = cx + (self.p[top, :2] - cx) * 0.93
        self.p[top] = self.pin_pos[top]
        self.prev[top] = self.pin_pos[top]
        # a few gentle ripples so it never starts as a flat sheet
        self.p[:, 2] += 6 * (1 + np.sin(uv[:, 0] * 31 + uv[:, 1] * 4)) * (0.4 + uv[:, 1])
        self.prev[:, 2] = self.p[:, 2]
        self.attach = [idx[0, 0], idx[0, nu // 2], idx[0, -1]]

    def proj(self, p=None):
        p = self.p if p is None else p
        return np.stack([p[:, 0] + p[:, 2] * self.NX, p[:, 1] + p[:, 2] * self.NY], 1)

    def step(self, dt, t, hooks, L, wall_poly, on_wall, wind):
        """hooks: one 3D point per attach point (the ends and middle of the spreader bar under the helicopter)."""
        p, prev = self.p, self.prev
        acc = np.zeros_like(p)
        # aerodynamic drag on the fabric's normal: it catches air like a sail (billows instead of falling like a rope)
        n = self.normals()
        vn = np.einsum("ij,ij->i", (p - prev) / dt, n)
        acc -= (5.5 * vn)[:, None] * n
        acc[:, 1] += 520.0                                                 # gravity (px/s²)
        # rotor wash + breeze: traveling waves pushing the fabric off the wall
        u, v = self.uv[:, 0], self.uv[:, 1]
        acc[:, 2] += wind * (np.sin(7 * v - 5.3 * t + 3 * u) * 0.6 + np.sin(13 * u + 9 * v - 8.1 * t) * 0.4 + 0.35)
        acc[:, 0] += wind * 0.25 * np.sin(5 * v - 4 * t)
        if on_wall:
            acc[:, 2] -= 14.0 * p[:, 2]                                    # draped: pressed against the panel
        vel = (p - prev) * 0.992                                           # air drag
        new = p + vel + acc * dt * dt
        self.prev = p.copy()
        p = new
        for _ in range(14):
            d = p[self.b] - p[self.a]
            ln = np.linalg.norm(d, axis=1) + 1e-9
            corr = ((ln - self.rest) / ln * 0.5 * self.stiff)[:, None] * d
            delta = np.zeros_like(p)
            cnt = np.zeros(len(p))
            np.add.at(delta, self.a, corr)
            np.add.at(delta, self.b, -corr)
            np.add.at(cnt, self.a, 1)
            np.add.at(cnt, self.b, 1)
            p += delta / np.maximum(cnt, 1)[:, None] * 1.6
            # ropes: the attach points can't get farther than L from the hook (inextensible, slack allowed)
            if hooks is not None:
                for i, h in zip(self.attach, hooks):
                    r = p[i] - h
                    dist = np.linalg.norm(r)
                    if dist > L:
                        p[i] = h + r / dist * L
            p[self.pinned] = self.pin_pos[self.pinned]
            # the building: no going through the facade
            xy = self.proj(p)
            inside = cv2.pointPolygonTest  # noqa
            wall = (xy[:, 0] > wall_poly) & (p[:, 2] < 0)
            p[wall, 2] = 0.0
        # friction where it rubs on the facade
        touching = (p[:, 2] < 1.0) & (self.proj(p)[:, 0] > wall_poly)
        self.prev[touching, :2] = lerp(self.prev[touching, :2], p[touching, :2], 0.25)
        self.p = p

    def normals(self, P=None):
        P = (self.p if P is None else P).reshape(self.nv, self.nu, 3) if P is None else P
        du = np.gradient(P, axis=1)
        dv = np.gradient(P, axis=0)
        n = np.cross(du, dv)
        n /= np.linalg.norm(n, axis=2, keepdims=True) + 1e-9
        n[n[..., 2] < 0] *= -1                                              # two-sided fabric: face the camera
        return n.reshape(-1, 3) if P.ndim == 3 and P.shape[:2] == (self.nv, self.nu) else n


def render_cloth(cloth, canvas_shape, shadow_offset=None, sub=3):
    """Return (color float32 HxWx3, alpha HxW, shadow alpha HxW). The particle grid is subdivided (bicubic) so the
    fabric shades smoothly; light = wrapped sun + sky fill; folds darken by curvature; cream canvas with weave and hem."""
    H, W = canvas_shape
    nu, nv = cloth.nu, cloth.nv
    P = cloth.p.reshape(nv, nu, 3).astype(np.float32)
    fu, fv = (nu - 1) * sub + 1, (nv - 1) * sub + 1
    F = cv2.resize(P, (fu, fv), interpolation=cv2.INTER_CUBIC)
    du = np.gradient(F, axis=1)
    dv = np.gradient(F, axis=0)
    n = np.cross(du, dv)
    n /= np.linalg.norm(n, axis=2, keepdims=True) + 1e-9
    n[n[..., 2] < 0] *= -1
    L = np.array([-0.45, -0.55, 0.70], np.float32)
    L /= np.linalg.norm(L)
    lam = (n @ L)
    wrap = np.clip((lam + 0.35) / 1.35, 0, 1)
    sky = np.clip(0.5 + 0.5 * n[..., 2], 0, 1)
    # folds: concave (valley) areas get less light
    lap = cv2.Laplacian(F[..., 2], cv2.CV_32F, ksize=3)
    ao = np.clip(1.0 + 0.012 * np.clip(lap, -40, 0) * 1.0, 0.72, 1.0)
    weave = cloth._weave if hasattr(cloth, "_weave") and cloth._weave.shape == wrap.shape else None
    if weave is None:
        rs = np.random.RandomState(11)
        weave = 1 + 0.035 * cv2.GaussianBlur(rs.randn(fv, fu).astype(np.float32), (0, 0), 0.8)
        cloth._weave = weave
    hem = np.ones_like(wrap)
    hem[:2], hem[-2:], hem[:, :2], hem[:, -2:] = 0.88, 0.88, 0.88, 0.88
    lit = (0.36 * sky + 0.74 * wrap) * ao * weave * hem
    sun_col = np.array([200, 222, 240], np.float32)     # cream canvas in sunlight (BGR)
    shade_col = np.array([178, 182, 190], np.float32)   # cooler in shadow (sky bounce)
    mix = np.clip(wrap, 0, 1)[..., None]
    col_v = (shade_col * (1 - mix) + sun_col * mix) * lit[..., None]
    sx_, sy_ = F[..., 0] + F[..., 2] * cloth.NX, F[..., 1] + F[..., 2] * cloth.NY
    pts = np.round(np.stack([sx_, sy_], -1) * 16).astype(np.int32)
    q00, q01, q11, q10 = pts[:-1, :-1], pts[:-1, 1:], pts[1:, 1:], pts[1:, :-1]
    quads = np.stack([q00, q01, q11, q10], 2).reshape(-1, 4, 2)
    cq = ((col_v[:-1, :-1] + col_v[1:, 1:] + col_v[:-1, 1:] + col_v[1:, :-1]) / 4).reshape(-1, 3)
    zq = ((F[:-1, :-1, 2] + F[1:, 1:, 2]) / 2).ravel()
    order = np.argsort(zq)
    col = np.zeros((H, W, 3), np.float32)
    alpha = np.zeros((H, W), np.uint8)
    for k in order:
        c = cq[k]
        cv2.fillConvexPoly(col, quads[k], (float(c[0]), float(c[1]), float(c[2])), shift=4)
        cv2.fillConvexPoly(alpha, quads[k], 255, shift=4)
    shadow = np.zeros((H, W), np.uint8)
    if shadow_offset is not None:
        sx, sy = shadow_offset
        z = cloth.p[:, 2]
        xy = cloth.proj()
        I = cloth.idx
        cq_ = np.stack([I[:-1, :-1].ravel(), I[:-1, 1:].ravel(), I[1:, 1:].ravel(), I[1:, :-1].ravel()], 1)
        zc = z[cq_].mean(1)
        spts = np.round(np.stack([xy[:, 0] + z * sx, xy[:, 1] + z * sy], 1) * 16).astype(np.int32)
        for k in np.where(zc > 4)[0]:
            cv2.fillConvexPoly(shadow, spts[cq_[k]], 255, shift=4)
    a = alpha > 0
    blur = cv2.GaussianBlur(col, (0, 0), 1.0)
    wb = cv2.GaussianBlur(a.astype(np.float32), (0, 0), 1.0)[..., None]
    col = np.where(a[..., None], blur / np.maximum(wb, 1e-3), 0)
    return col, cv2.GaussianBlur(alpha, (3, 3), 0), cv2.GaussianBlur(shadow, (0, 0), 7)


# ---------------------------------------------------------------- helicopter drawing
def draw_heli(dst, heli, mast, center, width, tilt, t, vel):
    rgba = heli
    s = width / rgba.shape[1]
    hh, ww = int(rgba.shape[0] * s), int(width)
    im = cv2.resize(rgba, (ww, hh), interpolation=cv2.INTER_AREA if s < 1 else cv2.INTER_CUBIC)
    im = im[:, ::-1]                                                        # nose to the left (it leaves to the left)
    mx, my = (rgba.shape[1] - mast[0]) * s, mast[1] * s
    pad = int(width * 0.8)
    layer = np.zeros((hh + 2 * pad, ww + 2 * pad, 4), np.float32)
    layer[pad:pad + hh, pad:pad + ww] = im.astype(np.float32)
    # spinning main rotor: motion-blurred disc + a faint blade streak
    disc = np.zeros(layer.shape[:2], np.float32)
    cx, cy = pad + mx, pad + my - 0.02 * width
    ax, ay = width * 0.62, width * 0.035
    cv2.ellipse(disc, (int(cx), int(cy)), (int(ax), max(2, int(ay))), 0, 0, 360, 0.22, -1, cv2.LINE_AA)
    th = (t * 31.0) % math.pi
    ex, ey = ax * math.cos(th), ay * math.sin(th)
    cv2.line(disc, (int(cx - ex), int(cy - ey)), (int(cx + ex), int(cy + ey)), 0.45, max(2, int(width * 0.012)), cv2.LINE_AA)
    disc = cv2.GaussianBlur(disc, (0, 0), max(1.0, width * 0.004))
    cv2.line(disc, (int(cx), int(cy)), (int(cx), int(cy + width * 0.04)), 0.9, max(2, int(width * 0.012)), cv2.LINE_AA)  # mast
    # tail rotor (right end after the flip → left? the tail is on the right of the flipped image)
    tx, ty = pad + ww * 0.96, pad + hh * 0.45
    tr = np.zeros_like(disc)
    cv2.circle(tr, (int(tx), int(ty)), int(width * 0.06), 0.25, -1, cv2.LINE_AA)
    disc = np.maximum(disc, cv2.GaussianBlur(tr, (0, 0), 1.5))
    rot = np.dstack([np.full_like(disc, 38), np.full_like(disc, 38), np.full_like(disc, 40), disc * 255])
    a0 = layer[..., 3:4] / 255
    layer[..., :3] = layer[..., :3] * a0 + rot[..., :3] * (1 - a0)
    layer[..., 3] = np.maximum(layer[..., 3], rot[..., 3])
    # tilt + motion blur
    M = cv2.getRotationMatrix2D((layer.shape[1] / 2, layer.shape[0] / 2), tilt, 1.0)
    layer = cv2.warpAffine(layer, M, (layer.shape[1], layer.shape[0]), flags=cv2.INTER_LINEAR)
    sp = math.hypot(*vel) / FPS
    if sp > 1.5:
        k = int(min(sp, 40)) | 1
        ker = np.zeros((k, k), np.float32)
        ang = math.atan2(vel[1], vel[0])
        c = k // 2
        cv2.line(ker, (int(c - math.cos(ang) * c), int(c - math.sin(ang) * c)), (int(c + math.cos(ang) * c), int(c + math.sin(ang) * c)), 1, 1)
        ker /= ker.sum()
        prem = layer.copy()
        prem[..., :3] *= prem[..., 3:4] / 255
        prem = cv2.filter2D(prem, -1, ker)
        layer = prem
        layer[..., :3] /= np.maximum(layer[..., 3:4] / 255, 1e-3)
    # paste
    x0 = int(center[0] - layer.shape[1] / 2)
    y0 = int(center[1] - layer.shape[0] / 2)
    H, W = dst.shape[:2]
    xa, ya, xb, yb = max(0, x0), max(0, y0), min(W, x0 + layer.shape[1]), min(H, y0 + layer.shape[0])
    if xa >= xb or ya >= yb:
        return
    L = layer[ya - y0:yb - y0, xa - x0:xb - x0]
    a = L[..., 3:4] / 255
    dst[ya:yb, xa:xb] = dst[ya:yb, xa:xb] * (1 - a) + L[..., :3] * a


# ---------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("plate")
    ap.add_argument("heli")
    ap.add_argument("design")
    ap.add_argument("out")
    ap.add_argument("--seconds", type=float, default=12.0)
    ap.add_argument("--frames", help="solo estos cuadros como PNG (vista previa), p.ej. 0,75,160")
    ap.add_argument("--quad", help="esquinas del verde en la foto: x0,y0,x1,y1,x2,y2,x3,y3 (tl,tr,br,bl)")
    a = ap.parse_args()

    plate = cv2.imread(a.plate, cv2.IMREAD_COLOR)
    design = cv2.imread(a.design, cv2.IMREAD_COLOR)
    q = None
    if a.quad:
        sx, sy = SW / plate.shape[1], SH / plate.shape[0]
        q = (np.array([float(v) for v in a.quad.split(",")], np.float32).reshape(4, 2) * [sx, sy]).astype(np.float32)
    bg, q, _ = billboard_plate(plate, design, q)
    print("panel (escena):", q.round(1).tolist())
    traffic = Traffic(bg)            # cars lifted off the photo; they drive away along their lanes
    bg = traffic.clean
    heli, mast = heli_cutout(cv2.imread(a.heli, cv2.IMREAD_COLOR))
    Hunit = cv2.getPerspectiveTransform(np.float32([[0, 0], [1, 0], [1, 1], [0, 1]]), q.astype(np.float32))
    cloth = Cloth(Hunit)
    wall_x = float(q[:, 0].min() - 40)                                      # facade starts a bit left of the panel

    tl, tr = q[0], q[1]
    heli_w = SW * 0.27
    # helicopter path (scene px): hover top-left → climbs pulling up-left → leaves to the left
    P0 = np.array([tl[0] - SW * 0.34, SH * 0.11])
    P1 = np.array([SW * 0.19, SH * 0.085])
    P2 = np.array([-SW * 0.55, -SH * 0.06])
    Z_HOOK = 260.0

    def heli_pos(t):
        bob = np.array([math.sin(t * 2.1) * 4, math.sin(t * 5.0) * 3])
        if t < T_PULL:
            return P0 + bob
        if t < T_REVEAL:
            return lerp(P0, P1, smooth((t - T_PULL) / (T_REVEAL + PULL_TAIL - T_PULL))) + bob
        if t < T_REVEAL + PULL_TAIL:
            return lerp(P0, P1, smooth((t - T_PULL) / (T_REVEAL + PULL_TAIL - T_PULL))) + bob
        k = (t - T_REVEAL - PULL_TAIL) / (T_GONE - T_REVEAL - PULL_TAIL)
        return lerp(P1, P2, min(1.0, k) ** 1.8) + bob * 0.5

    def hook_of(c):
        return np.array([c[0] + heli_w * 0.02, c[1] + heli_w * 0.2])

    # spreader bar under the hook keeps the top edge open (the fabric hangs as a sheet, not a rope)
    top_w = float(np.linalg.norm(cloth.proj()[cloth.attach[0]] - cloth.proj()[cloth.attach[-1]]))
    BAR_W, BAR_DROP = top_w * 0.5, heli_w * 0.36

    def bar_of(t):
        h = hook_of(heli_pos(t))
        return np.array([[h[0] + dx, h[1] + BAR_DROP] for dx in (-BAR_W / 2, 0, BAR_W / 2)])

    def hooks3_of(t):
        return np.array([[b[0] - Z_HOOK * Cloth.NX, b[1] - Z_HOOK * Cloth.NY, Z_HOOK] for b in bar_of(t)])

    L0 = max(np.linalg.norm(cloth.p[i] - h) for i, h in zip(cloth.attach, hooks3_of(0))) * 1.02
    L_end = 90.0

    def rope(t):
        return lerp(L0, L_end, smooth((t - T_PULL) / (T_REVEAL + ROPE_TAIL - T_PULL)))

    n_frames = int(round(a.seconds * FPS))
    want = set(int(v) for v in a.frames.split(",")) if a.frames else None
    ff = None
    if want is None:
        ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{OUT_W}x{OUT_H}", "-r", str(FPS), "-i", "-",
                               "-c:v", "libx264", "-crf", "15", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", a.out], stdin=subprocess.PIPE)
    sub = 6
    rng = np.random.RandomState(7)
    yy, xx = np.mgrid[0:OUT_H, 0:OUT_W]
    vign = (1 - 0.22 * (((xx - OUT_W / 2) / (OUT_W * 0.75)) ** 2 + ((yy - OUT_H * 0.45) / (OUT_H * 0.8)) ** 2)).astype(np.float32)[..., None]
    released = False
    cover_log = []
    panel_mask = np.zeros((SH, SW), np.uint8)
    cv2.fillConvexPoly(panel_mask, q.astype(np.int32), 255)
    panel_small = cv2.resize(panel_mask, (SW // 4, SH // 4), interpolation=cv2.INTER_NEAREST)
    for f in range(n_frames):
        t = f / FPS
        for s in range(sub):
            ts = t + s / (FPS * sub)
            if not released and ts >= T_PULL:
                cloth.pinned[:] = False
                released = True
            wind = 260.0 if ts < T_PULL else 900.0 * (1 - smooth((ts - T_REVEAL) / 3.0)) + 200
            cloth.step(1.0 / (FPS * sub), ts, hooks3_of(ts), rope(ts), wall_x, not released, wind)
        xyq = (cloth.proj() / 4 * 16).astype(np.int32)
        cm = np.zeros((SH // 4, SW // 4), np.uint8)
        I = cloth.idx
        for qd in np.stack([I[:-1, :-1].ravel(), I[:-1, 1:].ravel(), I[1:, 1:].ravel(), I[1:, :-1].ravel()], 1):
            cv2.fillConvexPoly(cm, xyq[qd], 255, shift=4)
        cover_log.append(float((cm[panel_small > 0] > 0).mean()))
        if want is not None and f not in want and f < max(want):
            continue
        if want is not None and f > max(want) and not os.environ.get("FULL_SIM"):
            break
        frame = bg.astype(np.float32)
        traffic.draw(frame, t)
        col, alpha, shadow = render_cloth(cloth, (SH, SW), shadow_offset=(0.55, 0.45))
        sh = (shadow.astype(np.float32) / 255 * 0.42) * (cv2.GaussianBlur(panel_mask, (0, 0), 25).astype(np.float32) / 255 * 1.6).clip(0, 1)
        frame *= (1 - sh)[..., None]
        al = alpha.astype(np.float32)[..., None] / 255
        frame = frame * (1 - al) + col * al
        # cables
        c = heli_pos(t)
        hk = hook_of(c)
        xy = cloth.proj()
        bar = bar_of(t)
        P16 = lambda v: (int(v[0] * 16), int(v[1] * 16))  # noqa: E731
        for e in (bar[0], bar[-1]):
            cv2.line(frame, P16(hk), P16(e), (34, 34, 36), 2, cv2.LINE_AA, shift=4)
        cv2.line(frame, P16(bar[0]), P16(bar[-1]), (30, 30, 32), 5, cv2.LINE_AA, shift=4)
        for i, b in zip(cloth.attach, bar):
            cv2.line(frame, P16(b), P16(xy[i]), (40, 40, 42), 2, cv2.LINE_AA, shift=4)
        vel = (heli_pos(t + 1 / FPS) - c) * FPS
        tilt = float(np.clip(-vel[0] * 0.012, -14, 14)) * 1.0 + math.sin(t * 1.7) * 0.8
        draw_heli(frame, heli, mast, c, heli_w, tilt, t, vel)
        # camera: locked off, slow push towards the billboard + a breath of drift
        z = 1.0 + 0.055 * smooth(t / a.seconds)
        cw, ch = SW / OVER / z * 1.0, SH / OVER / z
        cx = lerp(SW / 2, SW * 0.56, smooth(t / a.seconds)) + math.sin(t * 0.7) * 2.5
        cy = lerp(SH / 2, SH * 0.47, smooth(t / a.seconds)) + math.sin(t * 0.9 + 1) * 2.0
        s = OUT_W / cw
        M = np.float32([[s, 0, -(cx - cw / 2) * s], [0, s, -(cy - ch / 2) * s]])
        out = cv2.warpAffine(np.clip(frame, 0, 255).astype(np.uint8), M, (OUT_W, OUT_H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
        o = out.astype(np.float32) * vign
        o += rng.normal(0, 3.2, (OUT_H // 2, OUT_W // 2, 1)).repeat(2, 0).repeat(2, 1).astype(np.float32)  # grain
        out = np.clip(o, 0, 255).astype(np.uint8)
        if want is not None:
            cv2.imwrite(os.path.splitext(a.out)[0] + f"_{f:03d}.jpg", out, [cv2.IMWRITE_JPEG_QUALITY, 90])
        else:
            ff.stdin.write(out.tobytes())
        if f % 30 == 0:
            print(f"t={t:4.1f}s  tela sobre el panel {cover_log[-1] * 100:5.1f}%", flush=True)
    if ff:
        ff.stdin.close()
        ff.wait()
    print("cobertura cada 0.5 s:", " ".join(f"{cover_log[i] * 100:.0f}" for i in range(0, len(cover_log), 15)))
    rev = next((i for i, v in enumerate(cover_log) if v < 0.02), None)
    print("panel libre desde", None if rev is None else f"{rev / FPS:.2f}s", "· listo:", a.out)


if __name__ == "__main__":
    main()
