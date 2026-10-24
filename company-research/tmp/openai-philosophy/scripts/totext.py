import sys, html, re
from html.parser import HTMLParser
class P(HTMLParser):
    def __init__(s):
        super().__init__(); s.out=[]; s.skip=0
    def handle_starttag(s,t,a):
        if t in ('script','style','noscript','svg'): s.skip+=1
        if t in ('p','br','h1','h2','h3','h4','li','div','tr'): s.out.append('\n')
    def handle_endtag(s,t):
        if t in ('script','style','noscript','svg') and s.skip: s.skip-=1
    def handle_data(s,d):
        if not s.skip: s.out.append(d)
p=P(); p.feed(open(sys.argv[1],encoding='utf-8',errors='replace').read())
t=re.sub(r'\n\s*\n+','\n\n',''.join(p.out))
open(sys.argv[2],'w').write(t)
print(len(t.split()))
