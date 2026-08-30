"""Fetch Merriam-Webster Elementary Dictionary entries as a reference for rewriting kid meanings.

The Elementary Dictionary (reference code `sd2`) is written for grades 3-5, ages 8-11 —
the same reader this app is for — so its wording is a far better model for our kidMeaning
field than WordNet's, which is written for adults.

IMPORTANT — nothing this script downloads may be committed. Merriam-Webster's terms forbid
reproducing or distributing their content, so the cache lives outside the repo and MW text
is only ever a reference for writing our own wording. Only our own rewritten meanings get
committed.

Setup (one time):
  1. Register at https://dictionaryapi.com/register/index — request the "Elementary
     Dictionary" reference. The free non-commercial tier allows 1000 queries/day/reference.
  2. Put the key in a file the repo ignores:  echo "YOUR-KEY" > .mw-key
     (or export MW_API_KEY, or pass --key)

Usage:
  python scripts/fetch_mw.py --words band3,band5 --cache /tmp/mw-cache --report /tmp/mw.json
  python scripts/fetch_mw.py --words all --limit 900        # stay inside a day's quota
"""
import argparse, json, os, re, sys, time, urllib.parse, urllib.request

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = os.path.join(REPO, "src", "content")
ENDPOINT = "https://www.dictionaryapi.com/api/v3/references/sd2/json/{word}?key={key}"
obj_re = re.compile(r"\{\s*word:\s*\"(?P<word>[^\"]*)\".*?\},", re.S)


def read_key(explicit):
    if explicit:
        return explicit.strip()
    if os.environ.get("MW_API_KEY"):
        return os.environ["MW_API_KEY"].strip()
    path = os.path.join(REPO, ".mw-key")
    if os.path.exists(path):
        return open(path).read().strip()
    sys.exit("No API key. See the setup notes at the top of this script.")


def load_entries(which):
    files = {"words": "words.ts"}
    files.update({f"band{i}": os.path.join("words-extra", f"band{i}.ts") for i in range(1, 8)})
    chosen = list(files) if which == "all" else [w.strip() for w in which.split(",")]
    out = []
    for name in chosen:
        if name not in files:
            sys.exit(f"unknown word file: {name} (pick from {', '.join(files)} or 'all')")
        text = open(os.path.join(CONTENT, files[name]), encoding="utf-8").read()
        for m in obj_re.finditer(text):
            block = m.group(0)
            def field(f):
                g = re.search(rf'{f}:\s*"((?:[^"\\]|\\.)*)"', block)
                return g.group(1) if g else None
            out.append({"file": name, "word": m.group("word"), "pos": field("pos"),
                        "kidMeaning": field("kidMeaning")})
    return out


def fetch(word, key, cache_dir, pause):
    """Cached so a re-run costs no quota; the cache must stay outside the repo."""
    safe = re.sub(r"[^a-z0-9]+", "_", word.lower())
    path = os.path.join(cache_dir, f"{safe}.json")
    if os.path.exists(path):
        return json.load(open(path, encoding="utf-8")), True
    url = ENDPOINT.format(word=urllib.parse.quote(word), key=key)
    with urllib.request.urlopen(url, timeout=30) as r:
        body = r.read().decode("utf-8", "replace")
    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        # an invalid key comes back as plain text, not JSON
        raise RuntimeError(f"non-JSON response: {body[:80]}")
    json.dump(data, open(path, "w", encoding="utf-8"))
    time.sleep(pause)
    return data, False


def shortdefs(data, word):
    """The 'shortdef' strings for entries whose headword actually matches the word."""
    out = []
    if not isinstance(data, list):
        return out
    for entry in data:
        if not isinstance(entry, dict):
            continue                      # a list of strings = MW's spelling suggestions
        head = (entry.get("meta", {}).get("id", "") or "").split(":")[0]
        if head.lower().replace("*", "") != word.lower():
            continue
        out.append({"pos": entry.get("fl"), "defs": entry.get("shortdef", [])})
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--words", default="band3,band5", help="content files to cover, or 'all'")
    ap.add_argument("--cache", required=True, help="directory for cached responses — MUST be outside the repo")
    ap.add_argument("--report", help="write the ours-vs-MW comparison here (also keep outside the repo)")
    ap.add_argument("--key")
    ap.add_argument("--limit", type=int, default=900, help="max NEW lookups this run (free tier is 1000/day)")
    ap.add_argument("--pause", type=float, default=0.35, help="seconds between live requests")
    args = ap.parse_args()

    if os.path.abspath(args.cache).startswith(REPO + os.sep):
        sys.exit("refusing to cache Merriam-Webster content inside the repo — pick a path outside it")
    os.makedirs(args.cache, exist_ok=True)
    key = read_key(args.key)

    entries = load_entries(args.words)
    rows, fetched, cached, missing, failed = [], 0, 0, [], []
    attempts = 0
    for e in entries:
        if fetched >= args.limit:
            break
        try:
            data, was_cached = fetch(e["word"], key, args.cache, args.pause)
        except Exception as exc:
            failed.append((e["word"], str(exc)[:80]))
            attempts += 1
            # a bad key fails on every word — stop rather than burn the whole list
            if attempts >= 3 and not rows:
                sys.exit(f"first {attempts} lookups all failed, giving up. Check the API key.\n"
                         f"  last error: {failed[-1][1]}")
            continue
        attempts += 1
        cached += was_cached
        fetched += (not was_cached)
        sd = shortdefs(data, e["word"])
        if not sd:
            missing.append(e["word"])
            continue
        rows.append({"file": e["file"], "word": e["word"], "pos": e["pos"],
                     "ours": e["kidMeaning"],
                     "mw": [{"pos": s["pos"], "defs": s["defs"]} for s in sd]})

    print(f"words considered : {len(entries)}")
    print(f"new lookups      : {fetched}   (cached hits: {cached})")
    print(f"with MW entry    : {len(rows)}")
    print(f"no MW entry      : {len(missing)}  {missing[:12]}")
    if failed:
        print(f"request failures : {len(failed)}  {failed[:5]}")
    if args.report:
        if os.path.abspath(args.report).startswith(REPO + os.sep):
            sys.exit("refusing to write the MW comparison inside the repo")
        json.dump(rows, open(args.report, "w", encoding="utf-8"), indent=1)
        print(f"report           : {args.report}")


if __name__ == "__main__":
    main()
