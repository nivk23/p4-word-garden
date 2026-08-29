"""Generate src/content/dictionary.ts: a real dictionary definition for every word we teach.

Source: Princeton WordNet 3.1 (permissive licence — see the notice written into the
generated file). Download and unpack it first, then point this script at the `dict`
directory:

    curl -sSLO https://wordnetcode.princeton.edu/wn3.1.dict.tar.gz
    tar xzf wn3.1.dict.tar.gz            # creates ./dict
    python scripts/build_dictionary.py --wordnet ./dict

The WordNet files are NOT committed (16 MB); only the generated definitions are.

Sense selection: a word like "escalator" has a sense we do not mean (a clause in a
contract) listed before the one we do. Senses are therefore scored by (a) word overlap
with our own kidMeaning and examples and (b) whether WordNet's lexicographer category
matches the shape of our meaning ("A person who…" -> noun.person, "A place where…" ->
noun.location/artifact). Ties fall back to WordNet's own frequency order.

Definitions are converted to British spelling to match the rest of the content.
"""
import argparse, json, os, re, sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = os.path.join(REPO, "src", "content")
FILES = [os.path.join(CONTENT, "words.ts")] + [
    os.path.join(CONTENT, "words-extra", f"band{i}.ts") for i in range(1, 8)
]

WN_POS = {"noun": "n", "verb": "v", "adjective": "a", "adverb": "r"}

# Our headwords are British; WordNet indexes the American form.
BRIT_AM = {
    "organise": "organize", "realise": "realize", "recognise": "recognize",
    "apologise": "apologize", "analyse": "analyze", "summarise": "summarize",
    "memorise": "memorize", "practise": "practice", "colour": "color",
    "favourite": "favorite", "honour": "honor", "humour": "humor",
    "neighbour": "neighbor", "neighbours": "neighbors", "behaviour": "behavior",
    "flavour": "flavor", "labour": "labor", "labourer": "laborer", "harbour": "harbor",
    "rumour": "rumor", "vapour": "vapor", "odour": "odor", "armour": "armor",
    "saviour": "savior", "centre": "center", "litre": "liter", "metre": "meter",
    "theatre": "theater", "fibre": "fiber", "cheque": "check", "licence": "license",
    "defence": "defense", "offence": "offense", "pretence": "pretense",
    "jeweller": "jeweler", "jewellery": "jewelry", "traveller": "traveler",
    "travelling": "traveling", "marvellous": "marvelous", "woollen": "woolen",
    "skilful": "skillful", "fulfil": "fulfill", "enrol": "enroll",
    "aeroplane": "airplane", "grey": "gray", "cosy": "cozy", "judgement": "judgment",
    "kerb": "curb", "plough": "plow", "storey": "story", "pyjamas": "pajamas",
    "moustache": "mustache", "sceptical": "skeptical", "aluminium": "aluminum",
    "tyre": "tire", "mum": "mom", "maths": "math", "programme": "program",
    "programmes": "programs", "kilometre": "kilometer", "centimetre": "centimeter",
    "millimetre": "millimeter", "organisation": "organization", "dialogue": "dialog",
    "catalogue": "catalog",
}

# ...and the glosses come back American, so put them back into British spelling.
AM_BRIT = [
    (r"\bcolor(s|ed|ing|less)?\b", r"colour\1"), (r"\bfavor(s|ed|ing|ite|able)?\b", r"favour\1"),
    (r"\bhonor(s|ed|ing|able)?\b", r"honour\1"), (r"\bhumor(s|ous)?\b", r"humour\1"),
    (r"\bneighbor(s|hood|ing)?\b", r"neighbour\1"), (r"\bbehavior(s|al)?\b", r"behaviour\1"),
    (r"\bflavor(s|ed|ing)?\b", r"flavour\1"), (r"\blabor(s|ed|ing|er|ers)?\b", r"labour\1"),
    (r"\bharbor(s|ed)?\b", r"harbour\1"), (r"\brumor(s)?\b", r"rumour\1"),
    (r"\bvapor(s)?\b", r"vapour\1"), (r"\bodor(s|less)?\b", r"odour\1"),
    (r"\barmor(s|ed)?\b", r"armour\1"), (r"\bcenter(s|ed)?\b", r"centre\1"),
    (r"\bliter(s)?\b", r"litre\1"), (r"\bmeter(s)?\b", r"metre\1"),
    (r"\btheater(s)?\b", r"theatre\1"), (r"\bfiber(s)?\b", r"fibre\1"),
    (r"\bdefense(s|less)?\b", r"defence\1"), (r"\boffense(s)?\b", r"offence\1"),
    (r"\bgray(ish|er|est)?\b", r"grey\1"), (r"\bjewelry\b", "jewellery"),
    (r"\btraveler(s)?\b", r"traveller\1"), (r"\btraveling\b", "travelling"),
    (r"\bmarvelous\b", "marvellous"), (r"\bskillful\b", "skilful"),
    (r"\bairplane(s)?\b", r"aeroplane\1"), (r"\bpajamas\b", "pyjamas"),
    (r"\bmustache(s)?\b", r"moustache\1"), (r"\bskeptical\b", "sceptical"),
    (r"\baluminum\b", "aluminium"), (r"\bkilometer(s)?\b", r"kilometre\1"),
    (r"\bcentimeter(s)?\b", r"centimetre\1"), (r"\bmillimeter(s)?\b", r"millimetre\1"),
    (r"\bmath\b", "maths"),
    (r"\borganiz(e|es|ed|ing|ation|ations)\b", r"organis\1"),
    (r"\brecogniz(e|es|ed|ing)\b", r"recognis\1"),
    (r"\bapologiz(e|es|ed|ing)\b", r"apologis\1"),
    (r"\banalyz(e|es|ed|ing)\b", r"analys\1"),
    (r"\bmemoriz(e|es|ed|ing)\b", r"memoris\1"),
]

# WordNet lexicographer categories worth steering towards, keyed by how our own
# kid-friendly meaning is phrased.
LEX = {"person": 18, "location": 15, "artifact": 6, "animal": 5, "plant": 20, "food": 13,
       "possession": 21, "feeling": 12, "attribute": 7, "group": 14, "shape": 25,
       "time": 28, "communication": 10, "act": 4, "substance": 27, "body": 8,
       "quantity": 23, "state": 26, "cognition": 9}

CATEGORY_HINTS = [
    (r"^(a |an |the )?(person|someone|somebody|people|worker|man|woman|child|player|leader)\b|^(a |an )?\w+ who\b|\bperson who\b|\bpeople who\b", {LEX["person"]}),
    (r"^(a |an |the )?(place|area|building|room|shop|land|country|town|city)\b|\bplace where\b", {LEX["location"], LEX["artifact"]}),
    (r"\b(machine|tool|device|vehicle|box|bag|paper|book|card|cloth|stick|pole|tube|wire|seat|toy|coin|slip|sheet|screen|bar|pipe)\b", {LEX["artifact"]}),
    (r"^(an? )?(animal|bird|insect|fish|creature)\b|\banimal (that|with|which)\b", {LEX["animal"]}),
    (r"^(an? )?(plant|flower|tree|bush)\b", {LEX["plant"]}),
    (r"\b(food|drink|fruit|dish|meal)\b|\bto eat\b|\byou eat\b", {LEX["food"]}),
    (r"^money\b|\bmoney (you|that|paid|for)\b|\bpays?\b", {LEX["possession"]}),
    (r"^(a |an )?(feeling|felt)\b|\bfeeling (of|that|when)\b", {LEX["feeling"], LEX["attribute"]}),
    (r"^(a |an |the )?(group|team|set) of\b", {LEX["group"]}),
    (r"^(a |an )?(shape|solid)\b|\bshape (with|that)\b", {LEX["shape"]}),
    (r"^(a |the )?(time|day|month|year|period)\b|\bhow long\b", {LEX["time"]}),
    (r"^(a |an )?(rule|law|message|note|word|story|report|list)\b|\bwords? (that|you)\b", {LEX["communication"]}),
    (r"^how (much|many|hot|cold|loud|big|long|wide|far|good|bad)\b", {LEX["attribute"], LEX["quantity"]}),
    (r"\bbody part\b|\bpart of (your|the) body\b", {LEX["body"]}),
]

# WordNet has no entry for these (closed-class words, and compounds it never listed),
# so the definitions below are written for this app in the same register.
MANUAL = {
    # prepositions
    "in": "inside something, or within a place or period",
    "on": "resting upon the top or surface of something",
    "at": "in or near a particular place or point in time",
    "to": "in the direction of, or as far as, a place or thing",
    "from": "starting at a place, person, time or thing",
    "with": "in the company of, or by means of, something",
    "for": "intended to belong to, help or be used by someone",
    "over": "above something, or across the top of it",
    "under": "below or beneath something",
    "underneath": "directly below or covered by something",
    "between": "in the space or time separating two things",
    "before": "earlier than a time or ahead of a place",
    "after": "later than a time or following behind something",
    "during": "throughout the whole of a period of time",
    "through": "in at one side or end of something and out at the other",
    "across": "from one side of something to the other",
    "along": "following the length or course of something",
    "behind": "at or towards the back of something",
    "beside": "at the side of, or next to, someone or something",
    "besides": "in addition to something already mentioned",
    # pronouns
    "i": "the person who is speaking or writing",
    "you": "the person or people being spoken to",
    "he": "the male person or animal already mentioned",
    "she": "the female person or animal already mentioned",
    "it": "the thing or animal already mentioned",
    "we": "the speaker together with one or more other people",
    "they": "the people, animals or things already mentioned",
    "me": "the speaker, as the object of a verb or preposition",
    "him": "the male already mentioned, as the object of a verb",
    "her": "the female already mentioned, or belonging to her",
    "us": "the speaker and others, as the object of a verb",
    "them": "the people or things already mentioned, as the object of a verb",
    "my": "belonging to the person speaking",
    "your": "belonging to the person being spoken to",
    "his": "belonging to the male already mentioned",
    "our": "belonging to the speaker and others",
    "their": "belonging to the people or things already mentioned",
    "mine": "the one or ones belonging to the person speaking",
    "this": "the thing or person here, or the one just mentioned",
    "that": "the thing or person over there, or the one already mentioned",
    "these": "the things or people here, or the ones just mentioned",
    "those": "the things or people over there, or the ones already mentioned",
    "what": "which thing or things; used to ask about something",
    "who": "which person or people; used to ask about a person",
    "which": "what particular one or ones out of a set",
    "myself": "the speaker, when the speaker is also the object",
    "yourself": "the person spoken to, when they are also the object",
    "himself": "that male, when he is also the object",
    "herself": "that female, when she is also the object",
    "themselves": "those people, when they are also the object",
    # compounds WordNet never listed
    "whiteboard": "a smooth white panel written on with special pens",
    "crunchy": "making a sharp cracking noise when bitten or crushed",
    "carpark": "an area or building set aside for parking cars",
    "shophouse": "a building with a shop at street level and a home above",
    "barcode": "a pattern of printed lines that a scanner reads as a number",
    "breaktime": "a short rest between lessons or periods of work",
    "boardgame": "a game played by moving pieces on a marked board",
    "app": "a program written for a phone, tablet or computer",
    "podcast": "a spoken programme published online to listen to or download",
    # WordNet's only sense is about sound spikes, not shape
    "spiky": "having sharp points sticking out",
    # WordNet is American and lacks the British "study again" sense
    "revise": "read work through again in order to remember it, especially before an exam",
}

# WordNet's first sense is not always the one we teach ("escalator" leads with a clause in a
# contract). These were picked by reading the sense list; the number is WordNet's own sense
# order, so the definition still comes from WordNet.
SENSE_OVERRIDE = {
    "receipt": 2,       # not "the act of receiving"
    "pranks": 2,        # not "acting like a clown"
    "voucher": 2,       # not "someone who vouches"
    "germ": 3,          # not "anything that provides inspiration"
    "dolphin": 2,       # the whale, not the game fish
    "escalator": 2,     # the moving stairway, not the contract clause
    "judgement": 2,     # an opinion formed, not the legal document
    "licence": 3,       # the document, not "excessive freedom"
    "online": 2,        # connected to a network, not a railway route
    "promotion": 2,     # a rise in rank, not an advertising message
    "trophy": 2,        # a token of victory, not a hunting award
    "footboard": 2,     # the foot of a bed, not a platform to stand on
    "recognise": 7,     # perceive to be the same, not "show approval of"
    "practice": 2,      # learn by repetition, not "carry out a profession"
    "favourite": 2,     # preferred above all others, not "popular"
    "ferret": 2,        # the domesticated one, not the near-extinct wild species
}

# Words WordNet indexes under a different lemma than the sense we teach.
ALIAS = {"jam": "traffic jam"}

obj_re = re.compile(r"\{\s*word:\s*\"(?P<word>[^\"]*)\".*?\},", re.S)
STOP = set(
    "a an the of to in on at for with and or is are was were be been being that this those "
    "these you your it its he she his her they them their we our us as by from not no so if "
    "then than such very more most some any all one two who whom which what when where how "
    "someone something somebody person people thing things act state quality make made makes "
    "making used use uses usually especially often can could would should may might will".split()
)


def parse_entries():
    entries = []
    for path in FILES:
        text = open(path, encoding="utf-8").read()
        for m in obj_re.finditer(text):
            block = m.group(0)
            def field(name):
                f = re.search(rf'{name}:\s*"((?:[^"\\]|\\.)*)"', block)
                return f.group(1) if f else None
            ex_block = re.search(r"examples:\s*\[(.*?)\]", block, re.S)
            examples = re.findall(r'"((?:[^"\\]|\\.)*)"', ex_block.group(1)) if ex_block else []
            entries.append(dict(file=os.path.basename(path), word=m.group("word"),
                                pos=field("pos"), kidMeaning=field("kidMeaning"),
                                examples=examples))
    return entries


def tokens(text):
    out = set()
    for tok in re.findall(r"[a-z]+", (text or "").lower()):
        if tok in STOP or len(tok) < 3:
            continue
        for suffix in ("ing", "ed", "es", "s"):
            if tok.endswith(suffix) and len(tok) - len(suffix) >= 3:
                tok = tok[: len(tok) - len(suffix)]
                break
        out.add(tok)
    return out


def expected_categories(kid_meaning):
    wanted = set()
    low = (kid_meaning or "").lower()
    for pattern, cats in CATEGORY_HINTS:
        if re.search(pattern, low):
            wanted |= cats
    return wanted


def britishise(text):
    for pattern, repl in AM_BRIT:
        text = re.sub(pattern, repl, text)
    return text


def tidy(definition):
    """One clause, no trailing parentheticals, capped so it stays readable."""
    text = definition.strip()
    text = re.sub(r"^\((?:[^)]*)\)\s*", "", text)   # leading "(sports)" style labels
    if len(text) > 110:
        cut = text[:110]
        for sep in ("; ", ", "):
            if sep in cut:
                cut = cut.rsplit(sep, 1)[0]
                break
        text = cut.rstrip(" ;,")
    return britishise(text.strip().rstrip("."))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--wordnet", required=True, help="path to the unpacked WordNet 3.1 `dict` directory")
    ap.add_argument("--report", help="write an unmatched/low-confidence report here as JSON")
    args = ap.parse_args()

    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from wordnet_reader import WordNet
    wn = WordNet(args.wordnet)

    entries = parse_entries()
    definitions, report = {}, {"manual": [], "no_entry": [], "weak_match": []}

    for entry in entries:
        key = entry["word"].lower()
        if key in MANUAL:
            definitions[key] = MANUAL[key]
            report["manual"].append(entry["word"])
            continue

        wnpos = WN_POS.get(entry["pos"])
        candidates = []
        for pos in ([wnpos] if wnpos else []) + [p for p in "nvar" if p != wnpos]:
            for lookup in (ALIAS.get(key), key, BRIT_AM.get(key), key.replace("-", " ")):
                if not lookup:
                    continue
                senses = wn.senses(lookup, pos)
                if senses:
                    candidates.append((pos, senses))
                    break
            if candidates and candidates[0][0] == wnpos:
                break   # our own part of speech wins outright

        if not candidates:
            report["no_entry"].append({"word": entry["word"], "file": entry["file"],
                                       "kidMeaning": entry["kidMeaning"]})
            continue

        pos, senses = candidates[0]
        ours = tokens(entry["kidMeaning"]) | tokens(" ".join(entry["examples"]))
        kid = tokens(entry["kidMeaning"])
        wanted = expected_categories(entry["kidMeaning"])

        best, best_score, best_idx = None, -99, 0
        for idx, (definition, examples, lexnum) in enumerate(senses):
            gloss = tokens(definition) | tokens(" ".join(examples))
            score = len(gloss & ours) + 2 * len(gloss & kid)
            if wanted:
                score += 3 if lexnum in wanted else 0
            score -= 0.05 * idx      # nudge towards WordNet's own frequency order
            if score > best_score:
                best, best_score, best_idx = definition, score, idx

        if key in SENSE_OVERRIDE and SENSE_OVERRIDE[key] <= len(senses):
            best, best_idx, best_score = senses[SENSE_OVERRIDE[key] - 1][0], SENSE_OVERRIDE[key] - 1, 99

        definitions[key] = tidy(best)
        if best_score <= 0:
            report["weak_match"].append({"word": entry["word"], "file": entry["file"],
                                         "pos": entry["pos"], "kidMeaning": entry["kidMeaning"],
                                         "chosen": tidy(best), "sense": best_idx + 1,
                                         "of": len(senses)})

    out = [
        "/**",
        " * Dictionary definitions for every word we teach — the grown-up meaning behind each",
        " * kid-friendly one. Generated by scripts/build_dictionary.py; do not edit by hand.",
        " *",
        " * Source: Princeton WordNet 3.1. WordNet is distributed under the WordNet Licence:",
        " * Copyright 2011 The Trustees of Princeton University. All rights reserved. WordNet",
        " * is provided \"as is\" without warranty of any kind. Definitions have been converted",
        " * to British spelling and trimmed to a single clause. Where WordNet has no entry",
        " * (pronouns, prepositions and a few compounds) the definition was written for this app.",
        " */",
        "export const dictionaryMeanings: Record<string, string> = {",
    ]
    for word in sorted(definitions):
        value = definitions[word].replace("\\", "\\\\").replace('"', '\\"')
        out.append(f'  "{word}": "{value}",')
    out += [
        "};",
        "",
        "/** The dictionary definition for a word, if we have one. Case-insensitive. */",
        "export function getDictionaryMeaning(word: string): string | undefined {",
        "  return dictionaryMeanings[word.toLowerCase()];",
        "}",
        "",
    ]
    target = os.path.join(CONTENT, "dictionary.ts")
    with open(target, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(out))

    print(f"words: {len(entries)}  defined: {len(definitions)}  "
          f"(WordNet {len(definitions) - len(report['manual'])}, written here {len(report['manual'])})")
    print(f"no entry anywhere: {len(report['no_entry'])}  weak match: {len(report['weak_match'])}")
    if args.report:
        json.dump(report, open(args.report, "w"), indent=1)


if __name__ == "__main__":
    main()
