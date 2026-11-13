import subprocess, sys
U='/root/.claude/uploads/2769b7a6-e8fc-5a54-b491-973204aeb984/'
F={'1805':'ea367c59-IMG_1805.mov','1806':'a166fa7d-IMG_1806.mov','1808':'f0c64a43-IMG_1808.mov',
   '1811':'c7b919a7-IMG_1811.mov','1812':'8c326f22-IMG_1812.mov','1813':'ed74e053-IMG_1813.mov',
   '1814':'0637ebb4-IMG_1814.mov','1821':'1a71a58a-IMG_1821.mov'}
D=0.15
# (clip, timeline start, timeline end, src time shown at timeline start, zoom)
C=[('1806',0.00,2.20,0.20,1.00),('1811',2.20,3.40,0.15,1.00),('1811',3.40,4.75,2.40,1.12),
   ('1808',4.75,6.05,0.15,1.00),('1805',6.05,7.85,4.60,1.00),('1805',7.85,9.55,8.60,1.10),
   ('1812',9.55,11.75,0.60,1.00),('1821',11.75,13.25,0.40,1.00),('1814',13.25,16.10,0.15,1.00)]
grade=("eq=contrast=0.98:brightness=0.012:saturation=0.94:gamma=1.02,"
       "colorbalance=rs=0.02:bs=-0.02:rm=0.012:bm=-0.012,"
       "curves=all='0/0.03 0.5/0.51 1/0.975'")
args=['ffmpeg','-y','-hide_banner','-v','error']
fc=[]
for i,(c,a,b,s,z) in enumerate(C):
    lead=D if i>0 else 0
    ss=s-lead; ln=(b-a)+lead
    args+=['-ss',f'{ss:.3f}','-t',f'{ln:.3f}','-i',U+F[c]]
    zf=f",scale=iw*{z}:ih*{z},crop=1080:1920" if z!=1 else ""
    fc.append(f"[{i}:v]scale=1080:1920:flags=lanczos{zf},fps=30,setsar=1,format=yuv420p,{grade},setpts=PTS-STARTPTS[v{i}]")
prev='v0'
for i in range(1,len(C)):
    off=C[i][1]-D
    fc.append(f"[{prev}][v{i}]xfade=transition=fade:duration={D}:offset={off:.3f}[x{i}]"); prev=f'x{i}'
fc.append(f"[{prev}]ass=work/subs_min.ass:fontsdir=fonts,fade=t=in:st=0:d=0.3[vsub]")
fc.append(f"[{len(C)+2}:v]scale=200:-1,format=rgba,fade=t=in:st=15.1:d=0.4:alpha=1[lg]")
fc.append("[vsub][lg]overlay=x=(W-w)/2:y=230:enable='gte(t,15.1)',format=yuv420p[vout]")
n=len(C)
args+=['-i',U+'45537c07-AUDIO-2026-10-17-17-00-01.m4a','-i','work/music.wav','-loop','1','-t','16.1','-i','/home/user/Re-sset-/public/brand/reset-logo-white.png']
fc.append(f"[{n}:a]aresample=48000,highpass=f=85,afftdn=nf=-28,equalizer=f=3500:t=q:w=1.2:g=2,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,loudnorm=I=-15:TP=-1.5:LRA=7,aformat=channel_layouts=stereo,apad=whole_dur=16.1,asplit=2[vo][sc]")
fc.append(f"[{n+1}:a]atrim=0:16.1,afade=t=out:st=14.8:d=1.3,volume=0.30[mu]")
fc.append("[mu][sc]sidechaincompress=threshold=0.05:ratio=4:attack=40:release=500[mud]")
fc.append("[vo][mud]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.89[aout]")
args+=['-filter_complex',';'.join(fc),'-map','[vout]','-map','[aout]','-t','16.1',
       '-c:v','libx264','-preset','slow','-crf','16','-profile:v','high','-pix_fmt','yuv420p','-r','30',
       '-c:a','aac','-b:a','256k','-ar','48000','-movflags','+faststart',sys.argv[1]]
subprocess.run(args,check=True)
