"""Reconstruye los picos recortados (clipping) de la nota de voz: cada tramo recortado se rellena con una curva cúbica
ajustada a las muestras sanas de alrededor (solo puede crecer hacia afuera, nunca aplana más)."""
import numpy as np
from scipy.interpolate import CubicSpline


def declip(x, level=0.92, ctx=6):
    pk = np.abs(x).max()
    y = x.astype(np.float64).copy()
    m = np.abs(x) >= level * pk
    i, n, runs = 0, len(x), 0
    while i < n:
        if not m[i]:
            i += 1
            continue
        j = i
        while j < n and m[j]:
            j += 1
        a, b = max(0, i - ctx), min(n, j + ctx)
        xs = np.r_[np.arange(a, i), np.arange(j, b)]
        if len(xs) >= 4:
            cs = CubicSpline(xs, y[xs])
            seg = cs(np.arange(i, j))
            s = np.sign(x[i:j])
            y[i:j] = np.where(np.abs(seg) > np.abs(y[i:j]), np.abs(seg), np.abs(y[i:j])) * s
            runs += 1
        i = j
    return y, runs
