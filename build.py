# Rebuilds index.html from src/ (single self-contained file for GitHub Pages)
import os
d=os.path.dirname(os.path.abspath(__file__))
src=lambda f:open(os.path.join(d,"src",f),encoding="utf8").read()
js=src("data.js")+"\n"+src("engine.js")+"\n"+src("ui.js")
open(os.path.join(d,"index.html"),"w",encoding="utf8").write(src("shell.html").replace("/*__JS__*/",js))
print("built index.html")
