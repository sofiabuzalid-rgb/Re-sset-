# Original soft background bed (synthesised, no third-party samples) - free for commercial use.
# usage: python3 tools/make_music.py public/music.wav 7.2
# Soft, modern lo-fi bed: warm pad + electric-piano arpeggio + gentle pulse. 90 BPM.
import numpy as np, wave, sys
sr=48000; dur=float(sys.argv[2]) if len(sys.argv)>2 else 7.2; bpm=92; beat=60/bpm
t=np.arange(int(sr*dur))/sr
out=np.zeros((len(t),2))
def note(f,start,length,amp,kind):
    n0=int(start*sr); n=int(length*sr)
    if n0>=len(t): return
    n=min(n,len(t)-n0); tt=np.arange(n)/sr
    if kind=='pad':
        s=sum(np.sin(2*np.pi*f*d*tt+ph) for d,ph in [(1,0),(1.003,1),(0.997,2),(2.001,.5)])/4
        env=np.minimum(tt/0.8,1)*np.minimum((length-tt)/0.9,1).clip(0,1)
    elif kind=='ep':
        s=np.sin(2*np.pi*f*tt+0.6*np.exp(-tt*6)*np.sin(2*np.pi*f*tt))+0.25*np.sin(4*np.pi*f*tt)*np.exp(-tt*8)
        env=np.exp(-tt*2.2)*np.minimum(tt/0.005,1)
    elif kind=='bass':
        s=np.sin(2*np.pi*f*tt); env=np.exp(-tt*1.5)*np.minimum(tt/0.01,1)
    elif kind=='kick':
        s=np.sin(2*np.pi*(55+90*np.exp(-tt*30))*tt); env=np.exp(-tt*12)
    elif kind=='hat':
        s=np.random.default_rng(int(start*1000)).standard_normal(n); s=np.diff(s,prepend=0); env=np.exp(-tt*60)
    pan={'pad':0,'ep':0.25*np.sin(start),'bass':0,'kick':0,'hat':0.2}[kind]
    out[n0:n0+n,0]+=s*env*amp*(1-pan); out[n0:n0+n,1]+=s*env*amp*(1+pan)
m=lambda k:440*2**((k-69)/12)
chords=[[53,57,60,64],[57,60,64,67],[50,53,57,60],[46,50,53,57]]  # Fmaj7 Am7 Dm7 Bbmaj7
bar=4*beat; i=0; st=0.0
while st<dur:
    c=chords[i%4]
    for k in c: note(m(k),st,bar+0.4,0.10,'pad')
    note(m(c[0]-12),st,bar,0.18,'bass')
    arp=[c[1]+12,c[2]+12,c[3]+12,c[2]+12,c[3]+12,c[1]+24,c[3]+12,c[2]+12]
    for j,k in enumerate(arp):
        if st+j*beat/2 < dur: note(m(k),st+j*beat/2,1.2,0.07 if j%2==0 else 0.045,'ep')
    for b in range(4):
        if i>=1:
            note(0,st+b*beat,0.4,0.18 if b%2==0 else 0.0,'kick')
        note(0,st+b*beat+beat/2,0.1,0.02,'hat')
    st+=bar; i+=1
# cheap reverb
ir_t=np.arange(int(sr*1.6))/sr; rng=np.random.default_rng(1)
for ch in range(2):
    ir=rng.standard_normal(len(ir_t))*np.exp(-ir_t*3.2); ir/=np.abs(ir).sum()/6
    wet=np.convolve(out[:,ch],ir)[:len(t)]
    out[:,ch]=0.75*out[:,ch]+0.35*wet
# gentle lowpass (one-pole) for warmth
a=np.exp(-2*np.pi*5000/sr)
for ch in range(2):
    y=np.zeros(len(t)); p=0
    x=out[:,ch]
    for n_ in range(len(t)): p=(1-a)*x[n_]+a*p; y[n_]=p
    out[:,ch]=y
fade=np.ones(len(t)); fi=int(0.6*sr); fo=int(1.2*sr)
fade[:fi]=np.linspace(0,1,fi); fade[-fo:]=np.linspace(1,0,fo)
out*=fade[:,None]; out/=np.abs(out).max()*1.12
w=wave.open(sys.argv[1],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr)
w.writeframes((out*32767).astype('<i2').tobytes()); w.close()
