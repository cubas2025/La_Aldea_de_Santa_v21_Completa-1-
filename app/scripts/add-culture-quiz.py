"""Append exactly 500 authored general-knowledge questions; preserve the existing bank."""
from pathlib import Path
import json,unicodedata,collections
root=Path(__file__).resolve().parents[1];folder=root/'scripts/culture-general';path=root.parent/'quiz-data.js'
existing=json.loads(path.read_text().split('=',1)[1].strip().rstrip(';'));existing=[q for q in existing if not q['id'].startswith('culture-')];new=[]
sources={
 'capitales':'https://ungegn.un.org/dashboard/cities/index',
 'quimica':'https://www.nist.gov/pml/periodic-table-elements',
 'espacio':'https://science.nasa.gov/solar-system/planets/',
 'peru':'https://whc.unesco.org/en/statesparties/pe',
}
def add(question,answer,wrong,explanation,topic,level):
 assert len(set([answer,*wrong]))==3,(question,answer,wrong)
 new.append(dict(id=f'culture-{len(new)+1:04}',category='cultura',topic=topic,level=level,question=question,answer=answer,wrong=wrong,explanation=explanation,**({'source':sources[topic]} if topic in sources else {})))
def wrongs(pool,index):
 correct=pool[index];result=[]
 for offset in [7,13,1,2,3,4,5]:
  candidate=pool[(index+offset)%len(pool)]
  if candidate!=correct and candidate not in result:result.append(candidate)
  if len(result)==2:return result
 raise ValueError('Not enough different alternatives')
caps=[l.split('|') for l in (folder/'capitals.tsv').read_text().splitlines() if l.strip()];assert len(caps)==50
countries=[c[0] for c in caps];cities=[c[1] for c in caps]
for i,(country,capital) in enumerate(caps):
 e=f'{capital} es la capital de {country}.'
 add(f'En el mapa político, ¿cuál es la capital de {country}?',capital,wrongs(cities,i),e,'capitales',1 if i<21 else 2)
 add(f'¿De qué país es capital la ciudad de {capital}?',country,wrongs(countries,i),e,'capitales',2 if i<21 else 3)
elements=[l.split('|') for l in (folder/'elements.tsv').read_text().splitlines() if l.strip()];assert len(elements)==50
names=[e[0] for e in elements];symbols=[e[1] for e in elements]
for i,(name,symbol) in enumerate(elements):
 e=f'El símbolo de {name.lower()} es {symbol}. La mayúscula inicial y las minúsculas de los símbolos químicos importan.'
 add(f'En la tabla periódica, ¿cuál es el símbolo del elemento {name.lower()}?',symbol,wrongs(symbols,i),e,'quimica',2 if i<20 else 3)
 add(f'¿Qué elemento químico se representa exactamente con el símbolo {symbol}?',name,wrongs(names,i),e,'quimica',2 if i<20 else 3)
topic='';groups=collections.defaultdict(list)
for line in (folder/'facts.tsv').read_text().splitlines():
 if line.startswith('# '):topic=line[2:]
 elif line.strip():groups[topic].append(line.split('|'))
assert len(groups)==10 and all(len(rows)==30 for rows in groups.values())
for topic,rows in groups.items():
 answers=[r[1] for r in rows]
 for i,(question,answer,explanation) in enumerate(rows):add(question,answer,wrongs(answers,i),explanation,topic,1+i%3)
assert len(existing)==1000,len(existing);assert len(new)==500
allq=existing+new
normalize=lambda s:unicodedata.normalize('NFC',s).casefold().strip()
assert len({q['id'] for q in allq})==1500
assert len({normalize(q['question']) for q in allq})==1500,'Repeated question stem'
for q in allq:assert q['level'] in [1,2,3] and len({normalize(a) for a in [q['answer'],*q['wrong']]})==3
path.write_text('window.SANTA_QUIZ = '+json.dumps(allq,ensure_ascii=False,indent=2)+';\n')
print(json.dumps({'total':len(allq),'added':len(new),'topics':dict(collections.Counter(q['topic'] for q in new))},ensure_ascii=False))
