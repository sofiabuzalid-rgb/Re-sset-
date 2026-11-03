"""Tráfico en movimiento sobre la foto de Reforma.

Los coches de la foto se recortan (GrabCut dentro de su caja), el asfalto donde estaban se rellena (inpaint) y cada coche
se mueve por su carril alejándose hacia el Ángel (en la foto se les ve la parte trasera: circulan hacia el fondo).
Perspectiva de plano de suelo: un coche a profundidad Z está en y = horizonte + K/Z y su escala es proporcional a (y - horizonte).
Entran coches nuevos por abajo a lo largo del video. Coordenadas de la foto en fracciones (sirven a cualquier resolución).
"""
import math

import cv2
import numpy as np

# measured on the full Reforma plate (1014x1800), stored as fractions
PW, PH = 1014, 1800
HORIZON_Y = 1462 / PH
VP_X = 230 / PW
# moving cars: box (x0, y0, x1, y1); the bottom edge is where the tyres touch the road. Each car drives along its own
# lane (the line from the vanishing point through its bottom-centre).
CARS = {
    "taxi": (632 / PW, 1455 / PH, 953 / PW, 1645 / PH),
    "taxi2": (419 / PW, 1460 / PH, 528 / PW, 1532 / PH),
    "suv": (509 / PW, 1452 / PH, 635 / PW, 1544 / PH),
    "dark": (253 / PW, 1452 / PH, 348 / PW, 1532 / PH),
    "white": (348 / PW, 1456 / PH, 395 / PW, 1499 / PH),
}
# right kerb of the avenue (sidewalk edge), two points on it; below the line = road
KERB = ((630 / PW, 1520 / PH), (1000 / PW, 1585 / PH))
# free lanes (slope dx/dy from the vanishing point) where new cars drive in from behind the camera
LANE_SLOPES = {"mid": 2.1, "left": 1.62}
# the foreground taxi is stopped at the kerb with its hazard lights blinking (tail-light boxes)
HAZARDS = [(780 / PW, 1539 / PH, 830 / PW, 1558 / PH), (911 / PW, 1539 / PH, 946 / PW, 1558 / PH)]
# hand-traced outline of the foreground taxi (plate px), refined with GrabCut
TAXI_OUTLINE = [(480 + cx / 1.6, 1430 + cy / 1.6) for cx, cy in [
    (395, 72), (470, 60), (490, 45), (540, 45), (560, 62), (628, 78), (662, 108), (700, 146), (742, 158), (753, 178), (754, 270),
    (740, 336), (600, 336), (440, 305), (285, 300), (255, 275), (248, 215), (262, 175), (300, 148), (340, 110), (370, 85)]]
# distant cars stay where they are (queued far down the avenue); only their lanes are used
STATIC = {"dark", "white", "taxi", "suv"}
# (sprite, lane = whose lane, t_enter, depth at t_enter, speed in depth units/s); depth 1 = the foreground taxi's spot
SCHEDULE = [   # cars that drive in from behind the camera start below the frame (depth < 0.45) and pass by
    ("taxi2", "taxi2", 0.0, 178 / 70, 0.30),
    ("car_white", "mid", 0.0, 0.62, 0.40),
    ("taxi", "left", 1.6, 0.44, 0.40),
    ("car_silver", "mid", 3.3, 0.44, 0.46),
    ("car_white", "left", 5.4, 0.44, 0.38),
    ("taxi", "mid", 7.0, 0.44, 0.44),
    ("car_silver", "left", 8.9, 0.44, 0.41),
    ("car_white", "mid", 10.5, 0.44, 0.45),
]


class Traffic:
    def __init__(self, plate):
        """plate: BGR at the working resolution (the cars are taken from it and removed from it)."""
        H, W = plate.shape[:2]
        self.W, self.H = W, H
        self.yh = HORIZON_Y * H
        self.vpx = VP_X * W
        self.lanes = {n: (((x0 + x1) / 2) * W - self.vpx) / (y1 * H - self.yh) for n, (x0, y0, x1, y1) in CARS.items()}
        self.lanes.update(LANE_SLOPES)
        self.sprites = {}
        hole = np.zeros((H, W), np.uint8)
        for name, (x0, y0, x1, y1) in CARS.items():
            r = np.array([x0 * W, y0 * H, x1 * W, y1 * H]).round().astype(int)
            pad = int(0.08 * (r[2] - r[0]))
            rx0, ry0, rx1, ry1 = max(0, r[0] - pad), max(0, r[1] - pad), min(W, r[2] + pad), min(H, r[3] + pad)
            crop = plate[ry0:ry1, rx0:rx1]
            rect = (r[0] - rx0, r[1] - ry0, r[2] - r[0], r[3] - r[1])
            mask = np.zeros(crop.shape[:2], np.uint8)
            if name == "taxi":
                poly = np.array([[x * W / PW - rx0, y * H / PH - ry0] for x, y in TAXI_OUTLINE], np.int32)
                cv2.fillPoly(mask, [poly], 255)
                gm = np.full(crop.shape[:2], cv2.GC_BGD, np.uint8)
                gm[cv2.dilate(mask, np.ones((5, 5), np.uint8)) > 0] = cv2.GC_PR_BGD
                gm[mask > 0] = cv2.GC_PR_FGD
                gm[cv2.erode(mask, np.ones((15, 15), np.uint8)) > 0] = cv2.GC_FGD
                bgm, fgm = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
                cv2.grabCut(crop, gm, None, bgm, fgm, 4, cv2.GC_INIT_WITH_MASK)
                mask = np.where((gm == 1) | (gm == 3), 255, 0).astype(np.uint8)
                mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
                poly_m = np.zeros_like(mask)
                cv2.fillPoly(poly_m, [poly], 255)
                mask = cv2.min(mask, cv2.dilate(poly_m, np.ones((3, 3), np.uint8)))
            else:
                rr = max(2, int(0.18 * rect[3]))
                cv2.rectangle(mask, (rect[0] + rr, rect[1]), (rect[0] + rect[2] - rr, rect[1] + rect[3]), 255, -1)
                cv2.rectangle(mask, (rect[0], rect[1] + rr), (rect[0] + rect[2], rect[1] + rect[3] - rr // 2), 255, -1)
            soft = cv2.GaussianBlur(mask, (0, 0), 1.2 if name == "taxi" else max(1.0, 0.035 * rect[2]))
            bottom = r[3]
            self.sprites[name] = {"rgba": np.dstack([crop, soft]), "anchor": ((r[0] + r[2]) / 2 - rx0, bottom - ry0), "y_ref": bottom}
            if name not in STATIC:
                hole[ry0:ry1, rx0:rx1] = 255
        # colour variants of the sharp foreground taxi for the cars that enter close to the camera
        base = self.sprites["taxi"]
        rgb = base["rgba"][..., :3]
        hsv = cv2.cvtColor(rgb, cv2.COLOR_BGR2HSV).astype(np.float32)
        pink = ((hsv[..., 0] > 140) | (hsv[..., 0] < 8)) & (hsv[..., 1] > 60)
        white = hsv.copy()
        white[pink, 1] *= 0.08
        white[pink, 2] = np.minimum(255, white[pink, 2] * 1.25)
        silver = white.copy()
        silver[..., 2] *= 0.74
        silver[..., 1] *= 0.6
        for nm, v in (("car_white", white), ("car_silver", silver)):
            im = cv2.cvtColor(np.clip(v, 0, 255).astype(np.uint8), cv2.COLOR_HSV2BGR)
            self.sprites[nm] = {**base, "rgba": np.dstack([im, base["rgba"][..., 3]])}
        self.clean = self._fill(plate, hole)

    def _fill(self, plate, hole):
        """Remove the cars. Road: the same avenue scaled about the vanishing point (lane lines stay on their lines,
        the asphalt keeps its grain). Above the kerb (sidewalk, buildings): exemplar inpainting (shift-map)."""
        H, W = hole.shape
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        (ax_, ay_), (bx_, by_) = [(x * W, y * H) for x, y in KERB]
        slope = (by_ - ay_) / (bx_ - ax_)
        road = (yy > ay_ + (xx - ax_) * slope + 2).astype(np.uint8)
        out = plate.astype(np.float32).copy()
        known = (hole == 0) & (road > 0)
        todo = (hole > 0) & (road > 0)
        for _ in range(3):  # a few passes: what got filled can feed the next one
            for k in (1.25, 1.45, 1.7, 2.0, 0.85, 0.75, 0.65, 2.4, 0.55, 0.45):
                if not todo.any():
                    break
                mx = self.vpx + (xx - self.vpx) * k
                my = self.yh + (yy - self.yh) * k
                src = cv2.remap(out, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
                ok = cv2.remap(known.astype(np.uint8), mx, my, cv2.INTER_NEAREST, borderValue=0) > 0
                ok &= (mx >= 0) & (mx < W - 1) & (my >= 0) & (my < H - 1)
                sel = todo & ok
                out[sel] = src[sel]
                todo &= ~sel
                known |= sel
        # above the kerb (out-of-focus sidewalk and shop fronts): smooth fill, no patch blocks
        other = ((hole > 0) & (road == 0)) | todo
        if other.any():
            ys = np.where(other.any(1))[0]
            y0, y1 = max(0, ys.min() - 60), min(H, ys.max() + 20)
            roi = np.clip(out[y0:y1], 0, 255).astype(np.uint8)
            oth = other[y0:y1]
            sm = np.zeros_like(roi)
            cv2.xphoto.inpaint(np.where(oth[..., None], 0, roi).astype(np.uint8), (255 - oth.astype(np.uint8) * 255), sm, cv2.xphoto.INPAINT_FSR_FAST)
            band = out[y0:y1]
            band[oth] = sm[oth]
            out[y0:y1] = band
        a = cv2.GaussianBlur(hole, (0, 0), 2).astype(np.float32)[..., None] / 255
        return np.clip(plate * (1 - a) + out * a, 0, 255).astype(np.uint8)

    def lane_x(self, lane, y):
        return self.vpx + self.lanes[lane] * (y - self.yh)

    def draw(self, frame, t):
        """Draw every car on frame (float32 BGR, same size as the plate), far ones first."""
        cars = []
        for name, lane, t0, z0, v in SCHEDULE:
            if t < t0:
                continue
            z = z0 + v * (t - t0)
            sp = self.sprites[name]
            y_ref = sp["y_ref"]
            K = self.sprites["taxi"]["y_ref"] - self.yh  # depth 1 = the foreground taxi's spot
            y = self.yh + K / z
            s = (y - self.yh) / (y_ref - self.yh)
            if s < 0.06 or y > self.H * 1.25:
                continue
            y_next = self.yh + K / (z + v / 30.0)
            cars.append((y, name, lane, s, y - y_next))
        # hazard lights of the stopped taxi (it sits at depth 1, drawn into the plate)
        if int(t * 3.0) % 2 == 0:
            for x0, y0, x1, y1 in HAZARDS:
                cx_, cy_ = (x0 + x1) / 2 * self.W, (y0 + y1) / 2 * self.H
                rx, ry = (x1 - x0) / 2 * self.W, (y1 - y0) / 2 * self.H
                g = np.zeros((int(ry * 8), int(rx * 8)), np.float32)
                cv2.ellipse(g, (g.shape[1] // 2, g.shape[0] // 2), (int(rx * 1.1), int(ry * 1.1)), 0, 0, 360, 1.0, -1)
                g = cv2.GaussianBlur(g, (0, 0), rx * 0.9)
                g /= g.max()
                ox, oy = int(cx_ - g.shape[1] / 2), int(cy_ - g.shape[0] / 2)
                h_, w_ = g.shape
                xa, ya, xb, yb = max(0, ox), max(0, oy), min(self.W, ox + w_), min(self.H, oy + h_)
                gg = g[ya - oy:yb - oy, xa - ox:xb - ox][..., None]
                frame[ya:yb, xa:xb] += gg * np.array([40, 150, 255], np.float32) * 0.85  # amber glow (BGR)
        for y, name, lane, s, dy in sorted(cars):
            sp = self.sprites[name]
            rgba = sp["rgba"]
            h, w = rgba.shape[:2]
            nw, nh = max(2, int(w * s)), max(2, int(h * s))
            im = cv2.resize(rgba, (nw, nh), interpolation=cv2.INTER_AREA if s < 1 else cv2.INTER_CUBIC).astype(np.float32)
            blur = abs(dy) * 0.6  # px moved this frame → shutter blur along the lane
            if blur > 1.5:
                k = int(min(blur, 40)) | 1
                ang = math.atan2(1.0, self.lanes[lane])
                ker = np.zeros((k, k), np.float32)
                c = k // 2
                cv2.line(ker, (int(c - math.cos(ang) * c), int(c - math.sin(ang) * c)), (int(c + math.cos(ang) * c), int(c + math.sin(ang) * c)), 1, 1)
                ker /= ker.sum()
                pm = im.copy()
                pm[..., :3] *= pm[..., 3:4] / 255
                pm = cv2.filter2D(pm, -1, ker)
                pm[..., :3] /= np.maximum(pm[..., 3:4] / 255, 1e-3)
                im = pm
            ax, ay = sp["anchor"][0] * s, sp["anchor"][1] * s
            x = self.lane_x(lane, y)
            x0, y0 = int(round(x - ax)), int(round(y - ay))
            # contact shadow
            sh = np.zeros((nh + 20, nw + 20), np.float32)
            cv2.ellipse(sh, (int(ax) + 10, int(ay) + 10), (int(nw * 0.46), max(2, int(nh * 0.09))), 0, 0, 360, 0.55, -1)
            sh = cv2.GaussianBlur(sh, (0, 0), max(1.0, nh * 0.05))
            self._blend(frame, None, sh, x0 - 10, y0 - 10)
            self._blend(frame, im[..., :3], im[..., 3] / 255, x0, y0)

    @staticmethod
    def _blend(dst, rgb, a, x0, y0):
        H, W = dst.shape[:2]
        h, w = a.shape[:2]
        xa, ya, xb, yb = max(0, x0), max(0, y0), min(W, x0 + w), min(H, y0 + h)
        if xa >= xb or ya >= yb:
            return
        aa = a[ya - y0:yb - y0, xa - x0:xb - x0][..., None]
        if rgb is None:
            dst[ya:yb, xa:xb] *= 1 - aa
        else:
            dst[ya:yb, xa:xb] = dst[ya:yb, xa:xb] * (1 - aa) + rgb[ya - y0:yb - y0, xa - x0:xb - x0] * aa
