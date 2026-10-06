#!/usr/bin/env python3
import json, re, sqlite3, subprocess, tempfile, pathlib, sys, os

ROOT=pathlib.Path(__file__).resolve().parents[1]
def load(path):
    return json.loads((ROOT/path).read_text(encoding="utf-8"))

questions=[
    *load(pathlib.Path("data/practical/questions.json")),
    *load(pathlib.Path("data/practical/reconstructed-extra.json")),
    *load(pathlib.Path("data/practical/normalized.json"))["questions"],
]
questions=[q for q in questions if q.get("enabled",True)]

def norm(v):
    s=str(v).replace("\r","").strip()
    s=re.sub(r"[\t ]+"," ",s)
    s=re.sub(r" *\n *","\n",s)
    return s

def accepted(q, out):
    vals=[q.get("answer",""),*(q.get("acceptedAnswers") or [])]
    return any(norm(v)==norm(out) for v in vals)

def run(cmd,cwd,stdin=""):
    return subprocess.run(cmd,cwd=cwd,input=stdin,text=True,encoding="utf-8",capture_output=True,timeout=5)

results={"C":{"checked":0,"skipped":0},"Java":{"checked":0,"skipped":0},"Python":{"checked":0,"skipped":0},"SQL":{"checked":0,"skipped":0}}
failures=[]
compile_failures=[]

for q in questions:
    lang=q.get("language")
    code=q.get("code") or ""
    qtype=q.get("questionType")
    stdin=q.get("inputData") or ""

    if lang=="C" and qtype=="output":
        if "main(" not in code or not re.search(r"\b(?:printf|puts|putchar)\s*\(",code):
            results[lang]["skipped"]+=1; continue
        if re.search(r"\bscanf\s*\(",code) and not stdin.strip():
            results[lang]["skipped"]+=1; continue
        src=code
        # Restored pre-standard exam code uses void main. Its exit status is
        # unspecified on Windows; only the harness uses the standard entry point.
        if re.search(r"\bvoid\s+main\s*\(",src):
            src=re.sub(r"\bvoid\s+main\s*\(","int main(",src)
            last=src.rfind("}")
            src=src[:last]+"\nreturn 0;\n"+src[last:]
        if "#include <stdio.h>" not in src:
            src="#include <stdio.h>\n"+src
        if ("strlen(" in src or "strcmp(" in src or "strcpy(" in src) and "#include <string.h>" not in src:
            src="#include <string.h>\n"+src
        with tempfile.TemporaryDirectory() as td:
            p=pathlib.Path(td)
            (p/"main.c").write_text(src,encoding="utf-8")
            c=run(["gcc","-std=c11","-O0","-w","main.c","-lm","-o","main"],p)
            if c.returncode!=0:
                compile_failures.append((q["id"],"C compile",c.stderr[-1000:])); continue
            try:r=run([str(p/"main")],p,stdin)
            except subprocess.TimeoutExpired:
                failures.append((q["id"],"C timeout","")); continue
            if r.returncode!=0:
                failures.append((q["id"],"C runtime",r.stderr[-1000:])); continue
            results[lang]["checked"]+=1
            if not accepted(q,r.stdout):
                failures.append((q["id"],"C answer mismatch",f"expected={q.get('answer')!r} actual={norm(r.stdout)!r}"))

    elif lang=="Java" and qtype=="output":
        if "static void main" not in code or "System.out" not in code:
            results[lang]["skipped"]+=1; continue
        if re.search(r"\bScanner\b|System\.in",code) and not stdin.strip():
            results[lang]["skipped"]+=1; continue
        public=re.search(r"public\s+class\s+([A-Za-z_$][\w$]*)",code)
        mainclass=public.group(1) if public else (re.search(r"class\s+Main\b",code) and "Main")
        if not mainclass:
            results[lang]["skipped"]+=1; continue
        with tempfile.TemporaryDirectory() as td:
            p=pathlib.Path(td)
            (p/(mainclass+".java")).write_text(code,encoding="utf-8")
            c=run(["javac","-encoding","UTF-8",mainclass+".java"],p)
            if c.returncode!=0:
                compile_failures.append((q["id"],"Java compile",c.stderr[-1000:])); continue
            try:r=run(["java","-Dstdout.encoding=UTF-8","-Dstderr.encoding=UTF-8",mainclass],p,stdin)
            except subprocess.TimeoutExpired:
                failures.append((q["id"],"Java timeout","")); continue
            if r.returncode!=0:
                failures.append((q["id"],"Java runtime",r.stderr[-1000:])); continue
            results[lang]["checked"]+=1
            if not accepted(q,r.stdout):
                failures.append((q["id"],"Java answer mismatch",f"expected={q.get('answer')!r} actual={norm(r.stdout)!r}"))

    elif lang=="Python" and qtype=="output":
        if "print(" not in code:
            results[lang]["skipped"]+=1; continue
        if "input(" in code and not stdin.strip():
            results[lang]["skipped"]+=1; continue
        with tempfile.TemporaryDirectory() as td:
            p=pathlib.Path(td)
            try:r=run([sys.executable,"-I","-c",code],p,stdin)
            except subprocess.TimeoutExpired:
                failures.append((q["id"],"Python timeout","")); continue
            if r.returncode!=0:
                compile_failures.append((q["id"],"Python execute",r.stderr[-1000:])); continue
            results[lang]["checked"]+=1
            if not accepted(q,r.stdout):
                failures.append((q["id"],"Python answer mismatch",f"expected={q.get('answer')!r} actual={norm(r.stdout)!r}"))

    elif lang=="SQL" and qtype=="sql_result" and q.get("tables") and code.strip():
        upper=code.upper()
        if any(token in upper for token in ["NVL(","DECODE(","SYSDATE","ROWNUM","CONNECT BY","MERGE INTO"]):
            results[lang]["skipped"]+=1; continue
        db=sqlite3.connect(":memory:")
        try:
            for table in q["tables"]:
                cols=table.get("columns") or []
                rows=table.get("rows") or []
                if not cols: continue
                def coltype(idx):
                    vals=[r[idx] for r in rows if idx<len(r) and r[idx] is not None]
                    return "INTEGER" if vals and all(isinstance(v,int) and not isinstance(v,bool) for v in vals) else "REAL" if vals and all(isinstance(v,(int,float)) and not isinstance(v,bool) for v in vals) else "TEXT"
                coldefs=", ".join('"'+str(c).replace('"','""')+'" '+coltype(i) for i,c in enumerate(cols))
                db.execute('CREATE TABLE "'+table["name"].replace('"','""')+'" ('+coldefs+')')
                if rows:
                    db.executemany('INSERT INTO "'+table["name"].replace('"','""')+'" VALUES ('+','.join("?" for _ in cols)+')',rows)
            cur=db.execute(code)
            rows=cur.fetchall()
            delimiters=q.get("sqlResultDelimiters") or {"row":"\n","column":" "}
            actual=delimiters["row"].join(delimiters["column"].join("" if v is None else str(v) for v in row) for row in rows)
            results[lang]["checked"]+=1
            if not accepted(q,actual):
                failures.append((q["id"],"SQL result mismatch",f"expected={q.get('answer')!r} actual={norm(actual)!r}"))
        except sqlite3.Error:
            results[lang]["skipped"]+=1
        finally:
            db.close()
    elif lang=="SQL" and qtype=="sql_result":
        results[lang]["skipped"]+=1

print("RUNTIME SUMMARY",json.dumps(results,ensure_ascii=False))
if compile_failures:
    print("\nCOMPILE/EXECUTION FAILURES")
    for item in compile_failures: print(" | ".join(item))
if failures:
    print("\nANSWER FAILURES")
    for item in failures: print(" | ".join(item))

checked=sum(v["checked"] for v in results.values())
print(f"CHECKED={checked} SKIPPED={sum(v['skipped'] for v in results.values())} COMPILE_FAIL={len(compile_failures)} ANSWER_FAIL={len(failures)}")
if compile_failures or failures:
    sys.exit(1)
