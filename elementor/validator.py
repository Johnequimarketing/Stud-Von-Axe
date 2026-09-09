#!/usr/bin/env python3
"""Checks Elementor JSON before it ships.

From Stal 104 by way of Gugler and Stoeterij van Kleef, with three additions:
  - the template type must be one Elementor actually recognises
  - every ACF field an element binds to must exist in the importer plugin
  - the h2 cap is dropped: this design uses one h2 per section by intent

Usage: python3 elementor/validator.py file.json [...]
"""
import json, sys, re, os, urllib.parse

VALID_TYPES = ("page", "header", "footer", "loop-item", "archive", "single", "popup")

_ACF = os.path.join(os.path.dirname(os.path.abspath(__file__)), "acf.json")


def plugin_field_keys():
    """Every ACF field key the importer actually creates.

    Read from elementor/acf.json, which elementor/dump-acf.php produces by
    running the plugin's own structure class. The keys are assembled at runtime
    ('field_sva_' . $prefix . '_' . $name), so a regex over the PHP source
    cannot read them honestly — and on the previous build a regex over source
    is exactly what skipped a field nobody then noticed.

    A binding to a field that does not exist renders as nothing on the live
    site and is invisible in the JSON, which is the sort of thing nobody finds
    until the client does.
    """
    if not os.path.exists(_ACF):
        return None
    data = json.load(open(_ACF, encoding="utf-8"))
    return {f["key"] for g in data["groups"].values() for f in g["fields"].values()}


def check_acf_bindings(doc):
    known = plugin_field_keys()
    if not known:
        return ["elementor/acf.json not found — run php elementor/dump-acf.php > elementor/acf.json"]
    errs, seen = [], set()

    def walk_dyn(el, path):
        for key, tag in (el.get("settings", {}).get("__dynamic__") or {}).items():
            for enc in re.findall(r'settings="([^"]*)"', tag):
                blob = urllib.parse.unquote(enc)
                for fk in re.findall(r'"key"\s*:\s*"([^":]+)', blob):
                    if fk.startswith("field_") and fk not in known and fk not in seen:
                        seen.add(fk)
                        errs.append(f"{path}: binds {key} to {fk}, which the plugin does not create")
        for n, child in enumerate(el.get("elements", []) or []):
            walk_dyn(child, f"{path}.elements[{n}]")

    for n, el in enumerate(doc.get("content", [])):
        walk_dyn(el, f"content[{n}]")
    return errs

CONTAINER_KEYS = ["id", "settings", "elements", "isInner", "elType"]
WIDGET_KEYS = ["id", "settings", "elements", "isInner", "widgetType", "elType"]

def walk(el, path, errs, ids, headings):
    keys = list(el.keys())
    if el.get("elType") == "container":
        if keys != CONTAINER_KEYS:
            errs.append(f"{path}: container key-volgorde fout: {keys}")
        if "widgetType" in el:
            errs.append(f"{path}: container heeft widgetType")
    elif el.get("elType") == "widget":
        if keys != WIDGET_KEYS:
            errs.append(f"{path}: widget key-volgorde fout: {keys}")
        wt = el.get("widgetType")
        if el.get("elements") and wt not in ("nested-tabs", "nested-accordion"):
            errs.append(f"{path}: widget {wt} heeft niet-lege elements")
        s = el.get("settings", {})
        # typografie-paren
        for k in s:
            m = re.match(r"(.+)_font_family$", k)
            if m and s.get(f"{m.group(1)}_typography") != "custom":
                errs.append(f"{path}: {k} zonder {m.group(1)}_typography=custom")
        # button-paren
        if wt == "button":
            for a, b in [("background_color", "button_background_color"),
                         ("text_padding", "button_padding")]:
                if (a in s) != (b in s):
                    errs.append(f"{path}: button mist paar {a}/{b}")
            if "hover_animation" not in s:
                errs.append(f"{path}: button zonder hover_animation")
            if "button_background_hover_color" not in s:
                errs.append(f"{path}: button zonder button_background_hover_color")
            lk = s.get("link", {})
            if lk.get("is_external") not in ("", "yes", None):
                errs.append(f"{path}: link is_external='{lk.get('is_external')}' (moet ''/'yes')")
        # theme-post-title renders the same tag as a heading and is where a
        # single template's h1 actually lives. Counting only "heading" said
        # every one of the six singles had no h1 at all, which is the check
        # failing rather than the template.
        if wt in ("heading", "theme-post-title", "theme-archive-title"):
            headings.append(s.get("header_size", "h2"))
        if wt == "html":
            code = s.get("html", "")
            headings.extend(["h1"] * len(re.findall(r"<h1[\s>]", code)))
            headings.extend(["h2"] * len(re.findall(r"<h2[\s>]", code)))
        # image id numeriek
        for k, v in s.items():
            if isinstance(v, dict) and "url" in v and "id" in v and not isinstance(v["id"], int):
                errs.append(f"{path}: {k}.id niet numeriek")
            # font-size units
            if k.endswith("_font_size") and isinstance(v, dict) and v.get("unit") not in ("px", None):
                errs.append(f"{path}: {k} unit={v.get('unit')} (moet px)")
    # id
    i = el.get("id", "")
    if not re.fullmatch(r"[0-9a-f]{8}", i):
        errs.append(f"{path}: ongeldig id '{i}'")
    if i in ids:
        errs.append(f"{path}: dubbel id '{i}'")
    ids.add(i)
    for n, child in enumerate(el.get("elements", [])):
        walk(child, f"{path}/{n}", errs, ids, headings)

def validate(fp):
    doc = json.load(open(fp, encoding="utf-8"))
    errs, ids, headings = [], set(), []

    # A kit is Site Settings, not a template: it carries page_settings and no content.
    if doc.get("type") == "kit":
        for k in ("page_settings", "version", "title", "type"):
            if k not in doc:
                errs.append(f"kit envelope is missing '{k}'")
        ps = doc.get("page_settings", {})
        if not ps.get("system_colors"):
            errs.append("kit has no system_colors")
        if not ps.get("system_typography"):
            errs.append("kit has no system_typography")
        for k, v in ps.items():
            if k.endswith("font_size") and isinstance(v, dict) and v.get("unit") != "px":
                errs.append(f"kit {k} uses {v.get('unit')} instead of px")
        return errs

    for k in ("content", "page_settings", "version", "title", "type"):
        if k not in doc: errs.append(f"envelope mist '{k}'")
    for n, el in enumerate(doc.get("content", [])):
        if el.get("isInner") is not False:
            errs.append(f"content[{n}]: top-level moet isInner=false")
        if "content_width" in el.get("settings", {}):
            errs.append(f"content[{n}]: top-level mag geen content_width hebben")
        walk(el, f"content[{n}]", errs, ids, headings)
    t = doc.get("type")
    if t not in VALID_TYPES:
        errs.append(f"unknown template type {t!r}, expected one of {', '.join(VALID_TYPES)}")
    # one h1 per document, except the parts that live inside another page
    if t in ("page", "single", "archive"):
        h1 = headings.count("h1")
        if h1 != 1:
            errs.append(f"h1 count = {h1} (must be exactly 1)")
    if t in ("header", "footer", "loop-item", "popup") and headings.count("h1"):
        errs.append(f"{t} contains an h1; that belongs to the page, not the part")
    errs.extend(check_acf_bindings(doc))
    return errs

if __name__ == "__main__":
    fail = False
    for fp in sys.argv[1:]:
        errs = validate(fp)
        if errs:
            fail = True
            print(f"✗ {fp}")
            for e in errs[:20]: print(f"   - {e}")
        else:
            print(f"✓ {fp}")
    sys.exit(1 if fail else 0)
