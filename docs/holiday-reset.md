# RE:SET — "Your Holiday RE:SET" · Meta Ads (9:16)

23 s ad: Christmas + Hanukkah collections, built from the rack video IMG_1526 (two parts, 14.3 s + 20.8 s, 1080×1920 HEVC), and four product photos.
Composition `HolidayReset`. Edit in `src/holiday/edit.json`; graphics in `src/holiday/HolidayAd.tsx`.

## Structure (120 BPM, every cut on a beat)

| Out | Content | Text |
|---|---|---|
| 0.0–2.0 | She pulls the reindeer set off the rack → Hanukkah bear detail → green print → bear set (½-beat cuts) | **¿NAVIDAD O HANUKKAH?** (word by word, rose / blue rule) |
| 2.0–3.0 | She presents the green set | **TENEMOS TU PIJAMA PARA CELEBRAR.** |
| 3.0–10.0 | Red photo pan · neckline detail · green set as a catalogue print · video · reindeer band close-up · green print pan | **CHRISTMAS COLLECTION** tag |
| 10.0 | Navy panel sweep (navy from the print) + impact | |
| 10.0–16.0 | Bear set push-in · print pan · both sizes as a catalogue print · close-up of the menorah-sweater bear | **HANUKKAH COLLECTION** tag (blue) |
| 16.0–19.0 | She points at the rack · triptych 01/02/03 | **¿CUÁL ES TU FAVORITA?** |
| 19.0–20.0 | Her hand on the reindeer set | **ENCUENTRA TU HOLIDAY RE:SET** |
| 20.0–23.0 | Split: reindeer (Christmas) / bears (Hanukkah) behind the official logo | YOUR HOLIDAY · logo · **DESCUBRE LA COLECCIÓN** |

Christmas and Hanukkah are kept apart: the bear/menorah print appears only in the Hanukkah section, labelled 03 · HANUKKAH in the triptych, and never with Christmas graphics. No religious symbols were added. The only blue-and-white used is the navy taken from the print.

## Material decisions

- **Photos**: used untouched (`public/holiday/*.jpg`), so prints and colours are exact. Movement comes only from crop, pan and zoom.
- **IMG_8508 (Grinch print) is not used**: it is a licensed character (Dr. Seuss), which is a risk in a paid ad. Close-ups of the white prints on the rack were also avoided.
- **IMG_1336 / IMG_1338 (folding into the gift bag)** are not used: they are top-down shots on a workbench, a different look.
- **Voice**: she speaks for almost the entire video. This cut uses no voice and no subtitles because no transcription was available in this environment, and adding subtitles without an exact transcript is not acceptable. To add her voice: transcribe it, choose phrases, and add them to `edit.json` as voice segments with subtitles.

## Audio

An original instrumental (`scripts/build-holiday-media.py`; no samples, no carol melodies, no third-party material), so it is safe for Meta Ads. It is upbeat holiday fashion pop at 120 BPM in D major, moving to B minor under Hanukkah, with an impact at 0 s and 10 s, risers into 10 s and 20 s, a soft tick on each collection tag, and a Dmaj9 ending under the CTA. −14 LUFS.
To use a licensed track, replace `public/holiday/music.wav` (23 s, beat 1 at 0.0 s).

## Type

Montserrat 400/700 stands in for Gotham Book/Bold (commercial font, files not in the repo). Brand colours: rose #B07E7F (Christmas accent), blue #7B95AB (Hanukkah accent), lime #E2EC95 (brand stripe). Text is kept between y 285 and 1450 px (Reels safe area).

## Rebuild

```bash
python3 scripts/build-holiday-media.py <folder with 1526a.mov (20.8 s), 1526b.mov (14.3 s), red/green/bear/bear_detail/bear_rack.jpg>
npx remotion render src/index.ts HolidayReset out/RESET_YourHolidayReset_1080x1920.mp4 --crf=16 --audio-codec=aac --audio-bitrate=256k
```
