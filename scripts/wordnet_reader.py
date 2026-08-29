"""Minimal WordNet 3.1 reader: lemma+pos -> ordered senses (gloss, examples)."""
import os, re

class WordNet:
    POS_FILES = {"n": "noun", "v": "verb", "a": "adj", "r": "adv"}

    def __init__(self, dictdir):
        self.dir = dictdir
        self.index = {}       # (lemma, pos) -> [offsets in sense order]
        self.data = {}        # (pos, offset) -> (gloss, [examples])
        self.exc = {}         # pos -> {inflected: base}
        for pos, name in self.POS_FILES.items():
            self._load_index(pos, name)
            self._load_data(pos, name)
            self._load_exc(pos, name)

    def _load_index(self, pos, name):
        with open(os.path.join(self.dir, f"index.{name}"), encoding="utf-8", errors="replace") as f:
            for line in f:
                if line.startswith("  "):
                    continue
                parts = line.split()
                if len(parts) < 6:
                    continue
                lemma, p, synset_cnt, p_cnt = parts[0], parts[1], int(parts[2]), int(parts[3])
                rest = parts[4 + p_cnt:]          # skip the pointer symbols
                offsets = rest[2:2 + synset_cnt]  # sense_cnt, tagsense_cnt, then offsets
                self.index[(lemma.replace("_", " "), pos)] = offsets

    def _load_data(self, pos, name):
        with open(os.path.join(self.dir, f"data.{name}"), encoding="utf-8", errors="replace") as f:
            for line in f:
                if line.startswith("  "):
                    continue
                head, _, gloss = line.partition("|")
                fields = head.split()
                offset, lexnum = fields[0], int(fields[1])
                gloss = gloss.strip()
                examples = re.findall(r'"([^"]*)"', gloss)
                definition = re.split(r';\s*"', gloss)[0].strip().rstrip(";").strip()
                self.data[(pos, offset)] = (definition, examples, lexnum)

    def _load_exc(self, pos, name):
        path = os.path.join(self.dir, f"{name}.exc")
        table = {}
        if os.path.exists(path):
            with open(path, encoding="utf-8", errors="replace") as f:
                for line in f:
                    parts = line.split()
                    if len(parts) >= 2:
                        table[parts[0]] = parts[1]
        self.exc[pos] = table

    RULES = {
        "n": [("s", ""), ("ses", "s"), ("xes", "x"), ("zes", "z"), ("ches", "ch"), ("shes", "sh"),
              ("men", "man"), ("ies", "y")],
        "v": [("s", ""), ("ies", "y"), ("es", "e"), ("es", ""), ("ed", "e"), ("ed", ""),
              ("ing", "e"), ("ing", "")],
        "a": [("er", ""), ("est", ""), ("er", "e"), ("est", "e")],
        "r": [],
    }

    def forms(self, lemma, pos):
        """Candidate base forms, most likely first (WordNet's morphy, simplified)."""
        w = lemma.lower()
        out = [w]
        if w in self.exc.get(pos, {}):
            out.append(self.exc[pos][w])
        for suffix, repl in self.RULES.get(pos, []):
            if w.endswith(suffix) and len(w) - len(suffix) >= 2:
                out.append(w[: len(w) - len(suffix)] + repl)
        if w.endswith("ly"):
            out.append(w[:-2])
        seen, uniq = set(), []
        for f in out:
            if f and f not in seen:
                seen.add(f)
                uniq.append(f)
        return uniq

    def senses(self, lemma, pos):
        """[(definition, [examples], lexnum)] in WordNet sense order (most common first)."""
        for form in self.forms(lemma, pos):
            offsets = self.index.get((form, pos))
            if offsets:
                return [self.data[(pos, o)] for o in offsets if (pos, o) in self.data]
        return []

    def any_pos(self, lemma):
        return [p for p in "nvar" if self.senses(lemma, p)]
