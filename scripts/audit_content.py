import re, json, sys, io
from collections import defaultdict, Counter

import os, glob

# Resolve content relative to this script so the audit runs anywhere (it used to hardcode
# one machine's Windows path and crashed everywhere else).
BASE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src", "content")
FILES = {"words.ts": os.path.join(BASE, "words.ts")}
for _band in sorted(glob.glob(os.path.join(BASE, "words-extra", "band*.ts"))):
    FILES[os.path.basename(_band)] = _band

# Regex to capture one word object roughly - objects are like:
# {
#   word: "huge",
#   pos: "adjective",
#   kidMeaning: "...",
#   examples: ["...", "..."],
#   emoji: "...",
#   spellingTip?: "...",
#   confusedWith?: "...",
#   distractorGroup: "...",
#   syllables?: "...",
# },
obj_re = re.compile(r"\{\s*word:\s*\"(?P<word>[^\"]*)\".*?\}", re.S)

def parse_field(block, field):
    m = re.search(rf'{field}:\s*"((?:[^"\\]|\\.)*)"', block)
    if m:
        return m.group(1).replace('\\"', '"')
    return None

def parse_examples(block):
    m = re.search(r'examples:\s*\[(.*?)\]', block, re.S)
    if not m:
        return []
    inner = m.group(1)
    # extract quoted strings
    return [x.replace('\\"', '"') for x in re.findall(r'"((?:[^"\\]|\\.)*)"', inner)]

def parse_words(path):
    text = io.open(path, encoding="utf-8-sig").read()
    entries = []
    for m in obj_re.finditer(text):
        block = m.group(0)
        word = m.group("word")
        pos = parse_field(block, "pos")
        kidMeaning = parse_field(block, "kidMeaning")
        emoji = parse_field(block, "emoji")
        spellingTip = parse_field(block, "spellingTip")
        confusedWith = parse_field(block, "confusedWith")
        syllables = parse_field(block, "syllables")
        distractorGroup = parse_field(block, "distractorGroup")
        examples = parse_examples(block)
        entries.append(dict(word=word, pos=pos, kidMeaning=kidMeaning, emoji=emoji,
                             spellingTip=spellingTip, confusedWith=confusedWith,
                             syllables=syllables, distractorGroup=distractorGroup,
                             examples=examples))
    return entries

# ---- American spelling detector ----
AMERICAN_WORDS = [
    "color","colors","colored","coloring","favor","favors","favorite","favorable",
    "honor","honors","honored","honoring","humor","humors","humorous","neighbor","neighbors","neighborhood",
    "center","centers","centered","theater","theaters","meter","meters","liter","liters","fiber","fibers",
    "defense","defenses","defensive","offense","offenses","offensive","aluminum",
    "behavior","behaviors","labor","labored","laboring","rumor","rumors","vapor","armor","armored",
    "flavor","flavors","flavored","candor","valor","splendor","harbor","harbors","harbored",
    "endeavor","endeavors","clamor","vigor","rigor","parlor","odor","odors","tumor","tumors",
    "traveled","traveling","traveler","canceled","canceling","modeling","modeled","labeled","labeling",
    "jeweler","jewelry","signaling","signaled","fueled","fueling","dialed","dialing","marveled","marveling",
    "quarreled","quarreling","gray","mold","molds","molded","plow","plows","plowed",
    "curb","curbs","tire","tires","donut","donuts","mustache","mustaches",
    "pajamas","cozy","cosier","skeptic","skeptical","artifact","fulfill","fulfilled","fulfillment",
    "enrollment","installment","skillful","willful","apologize","apologizes","apologized","apologizing",
    "organize","organizes","organized","organizing","organization","realize","realizes","realized",
    "recognize","recognizes","recognized","practice", # ambiguous but per spec include word 'practice' only if verb; noted
    "check","program","math","specialty","gotten",
    "colorful","colorless","flavorful","flavorless","odorless","humorless","favorable","neighborly",
    "behavioral","colorfully","honorable","laborer","laborers",
    "airplane","flashlight","candy","cookie","sidewalk","truck","vacation","soccer","mom","costume","diaper",
    "sneakers","garbage","trash","faucet","elevator","apartment","yard","zip code","license plate",
    "spelled","spelt", # spelt is British actually - skip, minor
]
# remove ambiguous entries that are legit British too
AMBIGUOUS_REMOVE = {"check","program","practice","spelled"}
AMERICAN_WORDS = [w for w in AMERICAN_WORDS if w not in AMBIGUOUS_REMOVE]
american_re = re.compile(r'\b(' + '|'.join(sorted(set(AMERICAN_WORDS), key=len, reverse=True)) + r')\b', re.IGNORECASE)

# ---- Mojibake detector: UTF-8 bytes misinterpreted, common markers ----
# Covers classic "UTF-8 read as CP1252 then re-encoded" byte sequences (Ã©, â€œ, ð...), AND stray
# C1 control-picture / Latin-1-supplement codepoints (U+0080-U+009F, plus common re-encoding
# artefacts like U+0178, U+2018-U+201E) that show up as lone "junk" characters inside otherwise
# emoji/ASCII fields -- the pattern this project's words.ts mojibake actually took (e.g. a broken
# emoji rendering as characters like '\x8f', '\x90', 'Ÿ').
mojibake_re = re.compile(
    r'(Ã.|â€.|ð[\x80-\xbf].|\\u00[89a-fA-F][0-9a-fA-F]'
    r'|[\x80-\x9f]'
    r'|[ŸŒœˆ˜–—‘’‚“”„†‡•…‰‹›€])'
)

# ---- subject-verb agreement heuristic ----
# ~150 common base-form verbs (no trailing -s) that a 3rd-person-singular subject would need to
# take with an -s ending. Used both for the original He/She/It pattern and the newer noun-phrase
# and proper-name patterns below.
BASE_VERBS = ["love","want","need","like","have","go","grow","walk","run","jump","come","look",
    "watch","wash","catch","throw","kick","help","clean","cook","read","write","learn","teach",
    "explain","whisper","shout","collect","carry","climb","wave","smile","cry","hike","flow",
    "live","work","play","sit","stand","hide","ask","tell","feel","think","know","believe","seem",
    "appear","remain","stay","keep","hold","bring","take","give","make","do","say","see","hear",
    "eat","drink","sleep","wake","open","close","start","stop","wait","hope","plan","try",
    "study","build","fix","pack","pick","drop","push","pull","sing","dance","paint","draw","bake",
    "pat","hug","fall","find","get","enjoy","share","chase","spin","skip","dig","pour",
    "mix","bend","stretch","reach","touch","taste","smell","listen","speak","whistle","laugh",
    "wonder","worry","dream","imagine","remember","forget","decide","choose","accept","refuse",
    "agree","disagree","complain","admire","respect","trust","doubt","fear","hate","adore",
    "serve","cause","create","produce","reduce","increase","decrease","affect","improve","develop",
    "change","move","turn","spin","shake","tremble","shine","sparkle","glow","burn","melt","freeze",
    "boil","become","bring","send","receive","offer","suggest","occur","happen","protect",
    "provide","contain","celebrate","describe","borrow","lend","measure","cover","cost","cross",
    "deliver","display","fold","tie","stir","wipe","lift","repair","postpone","advise","migrate",
    "resemble","struggle","tremble","persevere","whistle"]
BASE_VERBS = sorted(set(BASE_VERBS))

# Original narrow heuristic: only catches He/She/It + bare verb. Kept for before/after comparison.
sva_re_old = re.compile(r'\b(She|He|It)\s+(' + '|'.join(BASE_VERBS) + r')\b')

# Irregular nouns that are already plural (or invariant) without a trailing -s, so a following bare
# verb is NOT an SVA error. Used to suppress false positives in the noun-phrase / number patterns.
INVARIANT_OR_IRREGULAR_PLURALS = {
    "children", "people", "men", "women", "feet", "teeth", "mice", "geese",
    "fish", "sheep", "deer", "series", "species", "aircraft", "reindeer", "oxen",
}

# Words that follow a modal/infinitive "to" and should not be treated as the finite verb of a
# singular subject (e.g. "The dog wants to run fast" -- "run" is not a 3rd-person-singular slot).
PRECEDING_EXCLUDE = {"can", "will", "must", "should", "may", "might", "shall", "would", "could", "to", "did", "does"}

# Pronouns/relative words that can slot into the "noun" position grammatically but are not real
# noun subjects for this pattern (e.g. "A class you take" -- "you" is the relative clause's own
# subject, not the head noun; "take" is not a 3rd-person-singular-agreement slot at all).
NOT_A_NOUN_SUBJECT = {"i", "you", "we", "they", "he", "she", "it", "this", "that", "these", "those",
                       "who", "which", "there", "here", "to", "will", "can", "must", "should", "may",
                       "might", "shall", "would", "could", "is", "was", "are", "were", "am", "of",
                       "for", "with", "in", "on", "at", "by", "from", "as", "not", "so", "than"}

def _word_looks_singular(w):
    """Heuristic: treat a noun as singular if it doesn't end in -s and isn't a known irregular plural."""
    if not w:
        return False
    wl = w.lower()
    if wl in INVARIANT_OR_IRREGULAR_PLURALS:
        return False
    if wl in NOT_A_NOUN_SUBJECT:
        return False
    if wl.endswith("s") and not wl.endswith("ss"):
        return False
    return True

# New pattern 1: determiner + (one) noun + bare verb, e.g. "The rainbow appear", "A blizzard make".
# Only the immediate noun before the verb is checked (matches the spec's \s+\w+\s+ shape); an
# optional single adjective may sit between the determiner and that noun ("The mischievous boy play").
_DETERMINERS = r'(?:The|A|An|My|His|Her|Our|Their|This|That)'
sva_noun_phrase_re = re.compile(
    r'\b' + _DETERMINERS + r'\s+(?:([A-Za-z]+)\s+)?([A-Za-z]+)\s+(' + '|'.join(BASE_VERBS) + r')\b'
)

# New pattern 2: bare have/do/go (or other base verbs) after a singular proper-name subject commonly
# used in this app's example sentences (Tom, Ali, Siti, Mum, Dad, Grandma, ...).
PROPER_NAME_SUBJECTS = ["Tom", "Ali", "Siti", "Mum", "Dad", "Grandma", "Grandpa", "Mei", "Sam",
                         "Raj", "Wei", "Ben", "Amy", "John", "Mary"]
sva_proper_name_re = re.compile(
    r'\b(' + '|'.join(PROPER_NAME_SUBJECTS) + r')\s+(have|do|go|' + '|'.join(BASE_VERBS) + r')\b'
)

# New pattern 3: number/many/several + a noun that is not plural, e.g. "many question", "two apple".
NUMBER_WORDS = ["two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "many", "several"]
number_plural_re = re.compile(r'\b(' + '|'.join(NUMBER_WORDS) + r')\s+([A-Za-z]+)\b', re.IGNORECASE)


def find_sva_errors(text):
    """Run the combined (new) SVA heuristic over a chunk of plain text and return a list of
    (matched_text, reason) tuples. Designed to catch noun-phrase subjects and proper-name subjects,
    not just He/She/It, while keeping false positives low (plural subjects, modal/infinitive
    contexts, and I/You/We/They sentences are excluded)."""
    hits = []

    # He/She/It + bare verb (original heuristic, still included in the combined total)
    for m in sva_re_old.finditer(text):
        hits.append((m.group(0), "pronoun"))

    # Determiner + [adjective] + noun + bare verb
    for m in sva_noun_phrase_re.finditer(text):
        noun = m.group(2)
        if not _word_looks_singular(noun):
            continue
        start = m.start()
        preceding = text[:start].rstrip().split()
        if preceding and preceding[-1].strip(".,!?;:\"'").lower() in PRECEDING_EXCLUDE:
            continue
        hits.append((m.group(0), "noun_phrase"))

    # Proper name + bare verb
    for m in sva_proper_name_re.finditer(text):
        start = m.start()
        preceding = text[:start].rstrip().split()
        if preceding and preceding[-1].strip(".,!?;:\"'").lower() in PRECEDING_EXCLUDE:
            continue
        hits.append((m.group(0), "proper_name"))

    return hits


def find_plural_after_number_errors(text):
    """number/many/several + singular-looking noun, e.g. 'many question', 'two apple'."""
    hits = []
    for m in number_plural_re.finditer(text):
        noun = m.group(2)
        if not _word_looks_singular(noun):
            continue
        hits.append(m.group(0))
    return hits


# Backwards-compatible name used by the word-list scan below: the *combined* (new) heuristic.
def sva_hits_in(text):
    return find_sva_errors(text)

# ---- advanced word blacklist (seed) ----
ADVANCED_SEED = {"isotope","quantum","cervix","purloin","cogitate","languorously","harbinger",
    "archipelago","photosynthesis","mitochondria","paradigm","epistemology","juxtaposition",
    "quintessential","obfuscate","perfunctory","ubiquitous","ephemeral","surreptitious",
    "vicissitude","idiosyncrasy","antediluvian","cacophony","obsequious","pusillanimous",
    "sycophant","perspicacious","recalcitrant","obstreperous","effervescent","magnanimous"}

def hard_word(w):
    if not w: return False
    wl = w.lower()
    if wl in ADVANCED_SEED: return True
    if len(wl) >= 12: return True
    if re.search(r'(ology|osis|itis|emia|algia|ectomy|otomy|ization|ological)$', wl): return True
    return False

report = {}
all_words_seen = Counter()

for label, path in FILES.items():
    entries = parse_words(path)
    n = len(entries)
    missing_syll = [e['word'] for e in entries if not e.get('syllables')]
    missing_emoji = [e['word'] for e in entries if not e.get('emoji')]
    missing_kidmeaning = [e['word'] for e in entries if not e.get('kidMeaning')]
    missing_examples = [e['word'] for e in entries if len(e.get('examples') or []) < 2]

    examples_missing_word = []
    for e in entries:
        w = (e['word'] or "").lower()
        stem = w[:max(3,len(w)-2)]  # crude stem to allow inflection
        for ex in e.get('examples') or []:
            if stem not in ex.lower():
                examples_missing_word.append((e['word'], ex))

    american_hits = []
    for e in entries:
        text_blob = " ".join([e.get('kidMeaning') or ""] + (e.get('examples') or []))
        for m in american_re.finditer(text_blob):
            american_hits.append((e['word'], m.group(0)))

    mojibake_hits = []
    for e in entries:
        for field in ['emoji','kidMeaning']:
            val = e.get(field) or ""
            if mojibake_re.search(val):
                mojibake_hits.append((e['word'], field, val[:20]))

    sva_hits = []
    sva_hits_old = []
    plural_after_number_hits = []
    for e in entries:
        fields_to_check = (e.get('examples') or []) + [e.get('kidMeaning') or ""]
        for ex in fields_to_check:
            for matched, reason in find_sva_errors(ex):
                sva_hits.append((e['word'], matched, reason))
            if sva_re_old.search(ex):
                sva_hits_old.append((e['word'], ex))
            for matched in find_plural_after_number_errors(ex):
                plural_after_number_hits.append((e['word'], matched))

    hard_kidmeaning = []
    for e in entries:
        w = e['word'] or ""
        km = e.get('kidMeaning') or ""
        for tok in re.findall(r"[A-Za-z']+", km):
            if hard_word(tok) and tok.lower() != w.lower():
                hard_kidmeaning.append((e['word'], tok))

    hard_headword = [e['word'] for e in entries if hard_word(e['word'])]

    dupes_in_file = [w for w, c in Counter(e['word'].lower() for e in entries).items() if c > 1]

    for e in entries:
        all_words_seen[e['word'].lower()] += 1

    report[label] = dict(
        count=n,
        missing_syllables=len(missing_syll),
        missing_syllables_sample=missing_syll[:10],
        missing_emoji=len(missing_emoji),
        missing_kidmeaning=len(missing_kidmeaning),
        missing_examples=len(missing_examples),
        examples_missing_word_count=len(examples_missing_word),
        examples_missing_word_sample=examples_missing_word[:8],
        american_spelling_count=len(american_hits),
        american_spelling_sample=american_hits[:10],
        mojibake_count=len(mojibake_hits),
        mojibake_sample=mojibake_hits[:6],
        sva_error_count=len(sva_hits),
        sva_error_sample=sva_hits[:10],
        sva_error_count_old_heuristic=len(sva_hits_old),
        sva_error_sample_old_heuristic=sva_hits_old[:10],
        plural_after_number_count=len(plural_after_number_hits),
        plural_after_number_sample=plural_after_number_hits[:10],
        hard_kidmeaning_count=len(hard_kidmeaning),
        hard_kidmeaning_sample=hard_kidmeaning[:10],
        hard_headword_count=len(hard_headword),
        hard_headword_sample=hard_headword[:15],
        dupes_in_file=dupes_in_file[:10],
        dupes_in_file_count=len(dupes_in_file),
    )

# cross-file duplicates
cross_dupes = [w for w, c in all_words_seen.items() if c > 1]

# ---- Old-vs-new SVA heuristic, before/after comparison for the three hand-edited content files ----
# "Old" = the original He/She/It-only regex (sva_re_old). "New" = the combined heuristic covering
# noun-phrase subjects (The/A/An/... + noun + bare verb), proper-name subjects (Tom/Ali/... +
# have/do/go/...), and number/many/several + singular-noun plural errors. Run directly against the
# quoted string literals in each file (not just parsed Word objects), so it also covers passages.ts
# and grammar.ts, which have a different shape (prose text, question/option strings).
THREE_FILES = {
    "words.ts": os.path.join(BASE, "words.ts"),
    "passages.ts": os.path.join(BASE, "passages.ts"),
    "grammar.ts": os.path.join(BASE, "grammar.ts"),
}

string_lit_re = re.compile(r'"((?:[^"\\]|\\.)*)"')

three_file_report = {}
for label, path in THREE_FILES.items():
    text = io.open(path, encoding="utf-8-sig").read()
    strings = string_lit_re.findall(text)

    old_hits = []
    new_hits = []
    plural_hits = []
    for s in strings:
        if sva_re_old.search(s):
            old_hits.append(s)
        found = find_sva_errors(s)
        if found:
            new_hits.append((s, found))
        pn = find_plural_after_number_errors(s)
        if pn:
            plural_hits.append((s, pn))

    mojibake_in_file = [s for s in strings if mojibake_re.search(s)]

    three_file_report[label] = dict(
        sva_old_heuristic_count=len(old_hits),
        sva_new_heuristic_count=len(new_hits),
        sva_new_heuristic_sample=[{"text": t, "hits": h} for t, h in new_hits[:10]],
        plural_after_number_count=len(plural_hits),
        plural_after_number_sample=plural_hits[:10],
        mojibake_count=len(mojibake_in_file),
        mojibake_sample=mojibake_in_file[:10],
    )

print("\n=== Before/after: old (He/She/It only) vs new (noun-phrase + proper-name + number) SVA heuristic ===")
for label, r in three_file_report.items():
    print(f"{label}: old_heuristic_hits={r['sva_old_heuristic_count']}  "
          f"new_heuristic_hits={r['sva_new_heuristic_count']}  "
          f"plural_after_number_hits={r['plural_after_number_count']}  "
          f"mojibake_hits={r['mojibake_count']}")

with open("audit_report.json", "w", encoding="utf-8") as f:
    json.dump(report, f, indent=2, ensure_ascii=False)
    f.write("\n\n=== CROSS-FILE DUPLICATE WORDS (case-insensitive) ===\n")
    f.write(str(len(cross_dupes)) + " duplicates\n")
    f.write(str(cross_dupes[:40]))
    f.write("\n\n=== THREE-FILE SVA HEURISTIC BEFORE/AFTER (words.ts, passages.ts, grammar.ts) ===\n")
    f.write(json.dumps(three_file_report, indent=2, ensure_ascii=False))
