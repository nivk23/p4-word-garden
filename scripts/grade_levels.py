#!/usr/bin/env python3
"""Assign a Primary level (1-6) to every word in src/content.

Levels drive which words a child is taught: a child set to P4 learns every word
graded 1-4, easiest first, so a struggling reader still picks up the P1-P3
vocabulary she is missing.

The grade is a difficulty score turned into levels by cumulative quantiles, so
the pool sizes stay stable as content is added:

    score = frequency (how common the word is in everyday English)
          + syllable count + letter length + part of speech
          - a large bonus for the ~300 knownWords base list

Hard rules applied on top of the score:
  * every word in words.ts is a P4 book word -> capped at level 4
  * knownWords members -> capped at level 2
  * scripts/level_overrides.json (word -> level) wins over everything

Frequency data (OpenSubtitles 2018, 50k words) is not vendored. Download once:

    curl -sL -o scripts/data/en_50k.txt \
      https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/en/en_50k.txt

Usage:
    python scripts/grade_levels.py                 # report only, writes nothing
    python scripts/grade_levels.py --write         # write level: N into the .ts files
    python scripts/grade_levels.py --sample 12     # show N words per level
"""
import argparse
import io
import json
import math
import os
import re
import sys
from collections import Counter

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = os.path.join(BASE, "src", "content")
FREQ_PATH = os.path.join(BASE, "scripts", "data", "en_50k.txt")
OVERRIDES_PATH = os.path.join(BASE, "scripts", "level_overrides.json")

# Cumulative pool size at each level. A P4 child sees the first 1600 words.
CUMULATIVE_TARGETS = [350, 700, 1100, 1600, 2050, 10 ** 9]

# A picture carries a concrete noun a long way: a P2 child knows "cheetah" even
# though it is rare in an adult corpus. Abstract words run the other way - they
# are common in print but late to be *understood*, which is what this app teaches.
CONCRETE_GROUPS = {
    "nature", "animal", "animals", "object", "objects", "food", "body", "home",
    "transport", "weather", "place", "places", "school", "clothes", "size", "colour",
}
ABSTRACT_GROUPS = {
    "ideas", "abstract", "thinking", "manner", "condition", "civic", "media",
    "money", "qualities", "quality", "property", "personal",
}
GROUP_COST = dict(
    [(g, -0.45) for g in CONCRETE_GROUPS] + [(g, 0.45) for g in ABSTRACT_GROUPS]
)

POS_COST = {
    "noun": 0.0,
    "verb": 0.05,
    "adjective": 0.15,
    "adverb": 0.30,
    "preposition": 0.20,
    "pronoun": 0.10,
}

obj_re = re.compile(r"\{\s*word:\s*\"(?P<word>[^\"]*)\".*?\}", re.S)


def content_files():
    files = [os.path.join(CONTENT, "words.ts")]
    extra = os.path.join(CONTENT, "words-extra")
    files += [os.path.join(extra, f) for f in sorted(os.listdir(extra)) if f.startswith("band")]
    return files


def read(path):
    return io.open(path, encoding="utf-8-sig").read()


def load_freq():
    if not os.path.exists(FREQ_PATH):
        sys.exit("Missing %s - see the download command in this script's header." % FREQ_PATH)
    ranks = {}
    for i, line in enumerate(io.open(FREQ_PATH, encoding="utf-8"), start=1):
        parts = line.split()
        if parts and parts[0] not in ranks:
            ranks[parts[0]] = i
    return ranks


def load_known():
    text = read(os.path.join(CONTENT, "knownWords.ts"))
    return {w.lower() for w in re.findall(r'"([^"]+)"', text)}


def load_overrides():
    if not os.path.exists(OVERRIDES_PATH):
        return {}
    raw = json.load(io.open(OVERRIDES_PATH, encoding="utf-8"))
    return {k.lower(): int(v) for k, v in raw.items() if not k.startswith("_")}


def base_forms(word):
    """Crude de-inflection so 'carried' scores near 'carry', not as unknown."""
    w = word.lower()
    yield w
    for suffix, repl in (
        ("ies", "y"), ("ied", "y"), ("ier", "y"), ("iest", "y"),
        ("es", ""), ("s", ""), ("ed", ""), ("ing", ""), ("ly", ""),
        ("er", ""), ("est", ""),
    ):
        if w.endswith(suffix) and len(w) - len(suffix) >= 3:
            yield w[: len(w) - len(suffix)] + repl
    if len(w) > 4 and w[-1] == w[-2]:  # stopped -> stop
        yield w[:-1]
    for suffix in ("ed", "ing"):
        if w.endswith(suffix) and len(w) - len(suffix) >= 3:
            stem = w[: len(w) - len(suffix)]
            yield stem + "e"                       # hoped -> hope
            if len(stem) > 2 and stem[-1] == stem[-2]:
                yield stem[:-1]                    # stopped -> stop


def rank_of(word, ranks):
    best = None
    for form in base_forms(word):
        r = ranks.get(form)
        if r and (best is None or r < best):
            best = r
    if best is None:
        best = compound_rank(word, ranks)
    return best


def compound_rank(word, ranks):
    """'classroom' is missing from the frequency list but is not a hard word.

    A compound of two common words is only as hard as its harder half, so grade
    it that way instead of treating it as unknown."""
    w = word.lower()
    if len(w) < 7:
        return None
    best = None
    for i in range(3, len(w) - 2):
        left, right = ranks.get(w[:i]), ranks.get(w[i:])
        if left and right and left <= 8000 and right <= 8000:
            worse = max(left, right)
            if best is None or worse < best:
                best = worse
    return best


def score(entry, ranks, known):
    word = entry["word"]
    rank = rank_of(word, ranks)
    log_rank = math.log10(rank if rank else 80000)
    syllables = entry["syllables"].count("-") + 1 if entry.get("syllables") else 1
    is_compound = rank is not None and not any(f in ranks for f in base_forms(word))
    length_penalty = 0.0 if is_compound else 0.10 * max(0, len(word) - 6)
    s = (
        2.20 * log_rank
        + 0.55 * (syllables - 1)
        + length_penalty
        + POS_COST.get(entry.get("pos") or "noun", 0.0)
        + GROUP_COST.get((entry.get("group") or "").lower(), 0.0)
    )
    if word.lower() in known:
        s -= 1.60
    return s


def parse_entries():
    entries = []
    for path in content_files():
        text = read(path)
        for m in obj_re.finditer(text):
            block = m.group(0)
            pos = re.search(r'pos:\s*"([^"]*)"', block)
            syl = re.search(r'syllables:\s*"([^"]*)"', block)
            grp = re.search(r'distractorGroup:\s*"([^"]*)"', block)
            entries.append(
                dict(
                    word=m.group("word"),
                    pos=pos.group(1) if pos else None,
                    syllables=syl.group(1) if syl else None,
                    group=grp.group(1) if grp else None,
                    file=os.path.basename(path),
                )
            )
    return entries


def assign_levels(entries, ranks, known, overrides):
    # de-duplicate the way allWords.ts does: first occurrence wins
    seen, unique = set(), []
    for e in entries:
        key = e["word"].lower()
        if key not in seen:
            seen.add(key)
            unique.append(e)

    for e in unique:
        e["score"] = score(e, ranks, known)

    ordered = sorted(unique, key=lambda e: (e["score"], e["word"].lower()))
    for i, e in enumerate(ordered):
        level = next(lv for lv, cap in enumerate(CUMULATIVE_TARGETS, start=1) if i < cap)
        if e["word"].lower() in known:
            level = min(level, 2)
        level = overrides.get(e["word"].lower(), level)
        # Last, so nothing above can break it: words.ts holds her P4 book words,
        # and a P4 child has to be able to reach every one of them.
        if e["file"] == "words.ts":
            level = min(level, 4)
        e["level"] = max(1, min(6, level))
    return {e["word"].lower(): e for e in ordered}


LEVEL_FIELD_RE = re.compile(r"\s*level:\s*\d\s*,")


def write_levels(levels):
    """Insert `level: N,` after each entry's `pos` field, matching its layout."""
    changed = 0
    for path in content_files():
        text = read(path)
        out, cursor = [], 0
        for m in obj_re.finditer(text):
            block = LEVEL_FIELD_RE.sub("", m.group(0), count=1)
            word = m.group("word").lower()
            level = levels.get(word, {}).get("level")
            if level is None:
                out.append(text[cursor:m.end()])
                cursor = m.end()
                continue
            pos_m = re.search(r'pos:\s*"[^"]*",', block)
            if not pos_m:
                out.append(text[cursor:m.end()])
                cursor = m.end()
                continue
            tail = block[pos_m.end():]
            indent_m = re.match(r"\n(\s*)", tail)
            insert = ("\n%slevel: %d," % (indent_m.group(1), level)) if indent_m else (" level: %d," % level)
            block = block[: pos_m.end()] + insert + tail
            out.append(text[cursor:m.start()])
            out.append(block)
            cursor = m.end()
            changed += 1
        out.append(text[cursor:])
        io.open(path, "w", encoding="utf-8", newline="\n").write("".join(out))
    return changed


GRAMMAR_LEVELS_PATH = os.path.join(BASE, "scripts", "grammar_levels.json")
GRAMMAR_PATH = os.path.join(CONTENT, "grammar.ts")
PASSAGES_PATH = os.path.join(CONTENT, "passages.ts")


def write_grammar_levels():
    """Grammar levels are hand-mapped onto the MOE progression, not scored."""
    raw = json.load(io.open(GRAMMAR_LEVELS_PATH, encoding="utf-8"))
    wanted = {k: int(v) for k, v in raw.items() if not k.startswith("_")}
    text = read(GRAMMAR_PATH)
    ids = re.findall(r'id: "(lesson_\d+)"', text)
    missing = [i for i in ids if i not in wanted]
    if missing:
        sys.exit("No level for grammar lesson(s): %s - add them to %s"
                 % (", ".join(missing), os.path.basename(GRAMMAR_LEVELS_PATH)))

    def repl(m):
        return '%s\n%slevel: %d,' % (m.group(0), m.group("indent"), wanted[m.group("id")])

    text = re.sub(r'\n(?P<indent>\s*)level:\s*\d,(?=\n\s*title:)', "", text)
    text, n = re.subn(r'(?P<indent2>[ \t]*)id: "(?P<id>lesson_\d+)",', 
                      lambda m: '%sid: "%s",\n%slevel: %d,' % (m.group("indent2"), m.group("id"),
                                                               m.group("indent2"), wanted[m.group("id")]),
                      text)
    io.open(GRAMMAR_PATH, "w", encoding="utf-8", newline="\n").write(text)
    return n


PASSAGE_RE = re.compile(r'\{\s*id:\s*"(?P<id>passage_\d+)".*?\n  \},', re.S)


def passage_level(block, word_levels):
    """A passage is as hard as the words in it.

    Take the 90th percentile of its graded words rather than the single hardest
    one, so a passage is not pushed to P6 by one rare noun - then never let it
    sit below the words it is meant to practise."""
    text_m = re.search(r'text:\s*"((?:[^"\\]|\\.)*)"', block)
    body = text_m.group(1) if text_m else ""
    found = sorted(word_levels[w]["level"]
                   for w in (t.lower().strip("'") for t in re.findall(r"[A-Za-z']+", body))
                   if w in word_levels)
    level = found[int(0.9 * (len(found) - 1))] if found else 1
    targets = re.search(r'targetWords:\s*\[(.*?)\]', block, re.S)
    if targets:
        for w in re.findall(r'"([^"]+)"', targets.group(1)):
            if w.lower() in word_levels:
                level = max(level, word_levels[w.lower()]["level"])
    return max(1, min(6, level))


def write_passage_levels(word_levels):
    text = read(PASSAGES_PATH)
    out, cursor, n = [], 0, 0
    for m in PASSAGE_RE.finditer(text):
        block = re.sub(r'\n\s*level:\s*\d,(?=\n)', "", m.group(0), count=1)
        lv = passage_level(block, word_levels)
        block = re.sub(r'(id:\s*"passage_\d+",)', r'\1\n    level: %d,' % lv, block, count=1)
        out.append(text[cursor:m.start()])
        out.append(block)
        cursor = m.end()
        n += 1
    out.append(text[cursor:])
    io.open(PASSAGES_PATH, "w", encoding="utf-8", newline="\n").write("".join(out))
    return n


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true", help="write level: N into the .ts files")
    ap.add_argument("--sample", type=int, default=0, help="print N sample words per level")
    ap.add_argument("--json", help="dump word -> level to this path")
    args = ap.parse_args()

    ranks, known, overrides = load_freq(), load_known(), load_overrides()
    levels = assign_levels(parse_entries(), ranks, known, overrides)

    counts = Counter(e["level"] for e in levels.values())
    total = 0
    print("level  words  cumulative")
    for lv in range(1, 7):
        total += counts[lv]
        print("  P%d   %5d  %9d" % (lv, counts[lv], total))

    if args.sample:
        for lv in range(1, 7):
            words = [e["word"] for e in sorted(levels.values(), key=lambda e: e["score"]) if e["level"] == lv]
            step = max(1, len(words) // args.sample)
            print("\nP%d (%d): %s" % (lv, len(words), ", ".join(words[::step][: args.sample])))

    if args.json:
        json.dump({w: e["level"] for w, e in levels.items()}, io.open(args.json, "w", encoding="utf-8"), indent=0)

    if args.write:
        print("\nwrote level to %d words, %d grammar lessons, %d passages"
              % (write_levels(levels), write_grammar_levels(), write_passage_levels(levels)))


if __name__ == "__main__":
    main()
