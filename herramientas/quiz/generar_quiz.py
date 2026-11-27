# -*- coding: utf-8 -*-
"""Genera quiz-data.js con 10 000 preguntas únicas (todo público).
Uso: python3 herramientas/quiz/generar_quiz.py
- Conserva las preguntas actuales (menos las de los duendes antiguos).
- Añade los guardianes de la Navidad, tablas verificadas, curiosidades y razonamiento numérico.
- Comprueba que no se repita ninguna pregunta ni respuesta dentro de una misma pregunta."""
import json, os, random, re, sys, unicodedata
sys.path.insert(0, os.path.dirname(__file__))
from datos_tablas import *          # noqa
from datos_curiosidades import GUARDIANES, C

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
TOTAL = 10000
R = random.Random(20261127)
OUT, SEEN = [], set()

def norm(s):
    s = unicodedata.normalize('NFD', s.lower())
    return re.sub(r'[^a-z0-9]+', ' ', ''.join(c for c in s if unicodedata.category(c) != 'Mn')).strip()

def add(cat, level, q, ans, wrong, expl, pid):
    ans, wrong = str(ans), [str(w) for w in wrong]
    if len(wrong) != 2 or len({norm(ans), *map(norm, wrong)}) != 3: return False
    k = norm(q)
    if k in SEEN: return False
    SEEN.add(k)
    OUT.append({'category': cat, 'question': q, 'answer': ans, 'wrong': wrong, 'explanation': expl, 'level': level, 'id': f'{pid}-{len(OUT)+1:05d}'})
    return True

FEM = {'vaca', 'oveja', 'jirafa', 'cebra', 'ballena azul', 'foca', 'morsa', 'ardilla', 'nutria', 'llama', 'alpaca', 'gallina', 'paloma',
       'gaviota', 'tortuga marina', 'serpiente', 'iguana', 'lagartija', 'rana', 'salamandra', 'abeja', 'hormiga', 'mariposa', 'mariquita',
       'libélula', 'araña', 'medusa', 'estrella de mar', 'cabra', 'ballena', 'liebre'}
def el(an): return ('el ' if an in ('águila',) else 'la ' if an in FEM else 'el ') + an
def un(an): return ('un ' if an in ('águila',) else 'una ' if an in FEM else 'un ') + an
PL = {'mamífero': 'mamíferos', 'ave': 'aves', 'reptil': 'reptiles', 'pez': 'peces', 'insecto': 'insectos', 'anfibio': 'anfibios'}
ART_CUERPO = {'corazón': 'el', 'pulmones': 'los', 'cerebro': 'el', 'estómago': 'el', 'riñones': 'los', 'hígado': 'el', 'piel': 'la', 'huesos': 'los',
              'músculos': 'los', 'ojos': 'los', 'oídos': 'los', 'nariz': 'la', 'lengua': 'la', 'dientes': 'los', 'intestino delgado': 'el'}
def two(pool, exclude):
    c = [x for x in dict.fromkeys(pool) if norm(x) not in {norm(e) for e in exclude}]
    return R.sample(c, 2) if len(c) >= 2 else None

# 1) Banco actual sin los duendes antiguos
g = {}
exec(open(os.path.join(ROOT, 'quiz-data.js'), encoding='utf-8').read().replace('window.SANTA_QUIZ', 'g["Q"]'), {'g': g})
old_elf = re.compile(r'\b(Nina|Chispa|Tilo|Lumi|Bruno)\b')
for q in g['Q']:
    if q['category'] == 'duendes' or old_elf.search(q['question'] + ' ' + q['answer'] + ' ' + q['explanation']): continue
    add(q['category'], q['level'], q['question'], q['answer'], q['wrong'], q.get('explanation', ''), 'base')
print('banco actual conservado:', len(OUT))

# 2) Guardianes de la Navidad (del libro «Los once guardianes de la Navidad»)
names = [x[0] for x in GUARDIANES]
for n, tit, obj, hogar, mision, pers, frase in GUARDIANES:
    others = [x for x in GUARDIANES if x[0] != n]
    add('guardianes', 1, f'¿Quién es {tit} en la aldea de Santa?', n, two(names, [n]), f'{n} es {tit}.', 'guard')
    add('guardianes', 2, f'¿Qué objeto mágico tiene {n}?', obj.capitalize(), [o[2].capitalize() for o in R.sample(others, 2)], f'El objeto mágico de {n} es {obj}.', 'guard')
    up = lambda t: t[0].upper() + t[1:]
    add('guardianes', 2, f'¿Dónde vive {n}, {tit}?', up(hogar), [up(o[3]) for o in R.sample(others, 2)], f'El hogar de {n} es {hogar}.', 'guard')
    add('guardianes', 2, f'¿Cuál es la misión de {n}?', mision.capitalize(), [o[4].capitalize() for o in R.sample(others, 2)], f'La misión de {n} es {mision}.', 'guard')
    add('guardianes', 3, f'¿Qué guardián dice: «{frase}»?', n, two(names, [n]), f'Es la frase de {n}, {tit}.', 'guard')
    add('guardianes', 3, f'¿Qué guardián es {pers}?', n, two(names, [n]), f'{n} es {pers}.', 'guard')
for c in C:
    if 'continentes se suelen' in c[2]: continue
    add(c[0], c[1], c[2], c[3], [c[4], c[5]], c[6], 'cur')
print('con guardianes y curiosidades:', len(OUT))

# 3) Tablas verificadas
caps = [p[1] for p in PAISES]
for pais, cap, cont, gent in PAISES:
    same = [p[1] for p in PAISES if p[2] == cont and p[0] != pais] or caps
    lvl = 1 if cont == 'América' else 2 if cont == 'Europa' else 3
    extra = ' (La Paz es la sede del gobierno.)' if pais == 'Bolivia' else ''
    wr = two([c for c in same if c != 'La Paz'], [cap])
    if wr: add('geografia', lvl, f'¿Cuál es la capital de {pais}?', cap, wr, f'La capital de {pais} es {cap}.{extra}', 'cap')
    wr = two([p[0] for p in PAISES if p[2] == cont and p[0] != pais], [pais])
    if wr and cap != pais: add('geografia', lvl + (1 if lvl < 3 else 0), f'¿De qué país es capital {cap}?', pais, wr, f'{cap} es la capital de {pais}.', 'cap')
    add('geografia', lvl, f'¿En qué continente está {pais}?', cont, two(['América', 'Europa', 'Asia', 'África', 'Oceanía'], [cont]), f'{pais} está en {cont}.', 'cont')
    gw = two([p[3] for p in PAISES if p[3] != gent], [gent])
    add('verbal', lvl, f'¿Cómo se llama a una persona nacida en {pais}?', gent, gw, f'El gentilicio de {pais} es «{gent}».', 'gent')
# país que NO está en un continente
conts = ['América', 'Europa', 'Asia', 'África', 'Oceanía']
for _ in range(1100):
    cont = R.choice(conts); inside = [p[0] for p in PAISES if p[2] == cont]; out = [p for p in PAISES if p[2] != cont]
    a, b = R.sample(inside, 2); o = R.choice(out); opts = [a, b, o[0]]; R.shuffle(opts)
    add('geografia', 2, f'Entre {opts[0]}, {opts[1]} y {opts[2]}, ¿cuál NO está en {cont}?', o[0], [a, b], f'{o[0]} está en {o[2]}; {a} y {b} están en {cont}.', 'odd-cont')
for sym, name in ELEMENTOS:
    add('ciencias', 3, f'¿Qué elemento químico tiene el símbolo «{sym}»?', name.capitalize(), [x.capitalize() for x in two([e[1] for e in ELEMENTOS], [name])], f'«{sym}» es el símbolo del {name}.', 'elem')
    add('ciencias', 3, f'¿Cuál es el símbolo químico del {name}?', sym, two([e[0] for e in ELEMENTOS], [sym]), f'El símbolo del {name} es «{sym}».', 'elem')
clases = ['mamífero', 'ave', 'reptil', 'anfibio', 'pez', 'insecto', 'arácnido', 'molusco']
for an, cl, dieta, hab in ANIMALES:
    add('animales', 1 if cl in ('mamífero', 'ave', 'pez') else 2, f'¿Qué tipo de animal es {el(an)}?', cl.capitalize(), [x.capitalize() for x in two(clases, [cl])], f'{el(an).capitalize()} es {"un ave" if cl == "ave" else "un " + cl}.', 'cls')
    add('animales', 2, f'Según lo que come, ¿cómo se clasifica {el(an)}?', dieta.capitalize(), [x.capitalize() for x in two(['herbívoro', 'carnívoro', 'omnívoro'], [dieta])], f'{el(an).capitalize()} es {dieta}: ' + {'herbívoro': 'come plantas.', 'carnívoro': 'come otros animales.', 'omnívoro': 'come plantas y animales.'}[dieta], 'diet')
for _ in range(1300):
    cl = R.choice(['mamífero', 'ave', 'reptil', 'pez', 'insecto', 'anfibio'])
    inside = [a[0] for a in ANIMALES if a[1] == cl]; out = [a for a in ANIMALES if a[1] != cl]
    if len(inside) < 2: continue
    a, b = R.sample(inside, 2); o = R.choice(out); opts = [a, b, o[0]]; R.shuffle(opts)
    nombre = {'mamífero': 'un mamífero', 'ave': 'un ave', 'reptil': 'un reptil', 'pez': 'un pez', 'insecto': 'un insecto', 'anfibio': 'un anfibio'}[cl]
    add('animales', 2, f'Entre {opts[0]}, {opts[1]} y {opts[2]}, ¿cuál NO es {nombre}?', o[0], [a, b], f'{el(o[0]).capitalize()} es {"un ave" if o[1]=="ave" else "un " + o[1]}; {el(a)} y {el(b)} son {PL[cl]}.', 'odd-cls')
pes = list(PESOS.items())
for _ in range(900):
    trio = R.sample(pes, 3)
    if len({round(x[1] / max(1e-9, min(y[1] for y in trio)), 0) for x in trio}) < 3: continue
    trio.sort(key=lambda x: x[1]); ws = [x[1] for x in trio]
    if ws[2] < ws[1] * 1.6 or ws[1] < ws[0] * 1.6: continue
    opts = [x[0] for x in trio]; R.shuffle(opts)
    if R.random() < .5:
        add('animales', 1, f'¿Qué animal pesa más: {opts[0]}, {opts[1]} o {opts[2]}?', trio[2][0], [trio[0][0], trio[1][0]], f'{un(trio[2][0]).capitalize()} adulto pesa mucho más que {un(trio[1][0])} o {un(trio[0][0])}.', 'peso')
    else:
        add('animales', 1, f'¿Qué animal pesa menos: {opts[0]}, {opts[1]} o {opts[2]}?', trio[0][0], [trio[1][0], trio[2][0]], f'De los tres, {el(trio[0][0])} es el que menos pesa.', 'peso')
for an, cr in CRIAS:
    add('animales', 2, f'¿Cómo se llama la cría de {el(an)}?'.replace('de el ', 'del '), cr, two([c[1] for c in CRIAS], [cr]), f'La cría de {el(an)} se llama {cr}.'.replace('de el ', 'del '), 'cria')
    add('animales', 3, f'¿De qué animal es cría un {cr}?' if not cr.endswith('a') else f'¿De qué animal es cría una {cr}?', an, two([c[0] for c in CRIAS], [an]), f'{cr.capitalize()}: así se llama la cría de {el(an)}.'.replace('de el ', 'del '), 'cria')
for an, verbo in SONIDOS:
    add('verbal', 1, f'¿Qué hace {el(an)} cuando emite su sonido?', f'{verbo.capitalize()}', [x.capitalize() for x in two([s[1] for s in SONIDOS], [verbo])], f'{el(an).capitalize()} {verbo}.', 'son')
    add('verbal', 2, f'¿Qué animal {verbo}?', an, two([s[0] for s in SONIDOS], [an]), f'{el(an).capitalize()} {verbo}.', 'son')
for pl, pos, dato in PLANETAS:
    ords = ['primero', 'segundo', 'tercero', 'cuarto', 'quinto', 'sexto', 'séptimo', 'octavo']
    pln = 'la Tierra' if pl == 'Tierra' else pl
    add('espacio', 2, f'¿Qué planeta {dato}?', pl, two([p[0] for p in PLANETAS], [pl]), f'{pl} {dato}.', 'plan')
    add('espacio', 3, f'¿Qué lugar ocupa {pln} en orden desde el Sol?', f'El {ords[pos-1]}', [f'El {o}' for o in two(ords, [ords[pos-1]])], f'{pln[0].upper()+pln[1:]} es el planeta número {pos} desde el Sol.', 'plan')
for i, (pa, pb) in enumerate([(a, b) for a in PLANETAS for b in PLANETAS if a[1] < b[1]]):
    c = R.choice([p for p in PLANETAS if p not in (pa, pb)])
    trio = sorted([pa, pb, c], key=lambda x: x[1]); opts = [x[0] for x in trio]; R.shuffle(opts)
    add('espacio', 2, f'¿Cuál de estos planetas está más cerca del Sol: {opts[0]}, {opts[1]} o {opts[2]}?', trio[0][0], [trio[1][0], trio[2][0]], f'El orden desde el Sol es Mercurio, Venus, Tierra, Marte, Júpiter, Saturno, Urano y Neptuno.', 'plan2')
fam = {'cuerda': 'cuerda', 'viento': 'viento', 'percusión': 'percusión'}
for ins, f in INSTRUMENTOS:
    add('arte', 2, f'¿A qué familia de instrumentos pertenece el instrumento {ins}?', f'De {fam[f]}', [f'De {x}' for x in two(list(fam.values()), [f])], f'El instrumento {ins} es de {f}.', 'ins')
for _ in range(400):
    f = R.choice(list(fam)); inside = [i[0] for i in INSTRUMENTOS if i[1] == f]; out = [i for i in INSTRUMENTOS if i[1] != f]
    a, b = R.sample(inside, 2); o = R.choice(out); opts = [a, b, o[0]]; R.shuffle(opts)
    add('arte', 2, f'Entre {opts[0]}, {opts[1]} y {opts[2]}, ¿cuál NO es un instrumento de {f}?', o[0], [a, b], f'El instrumento {o[0]} es de {o[1]}; los otros son de {f}.', 'odd-ins')
for _ in range(400):
    if R.random() < .5: a, b = R.sample(FRUTAS, 2); o = R.choice(VERDURAS); kind, other = 'una fruta', 'una verdura'
    else: a, b = R.sample(VERDURAS, 2); o = R.choice(FRUTAS); kind, other = 'una verdura', 'una fruta'
    opts = [a, b, o]; R.shuffle(opts)
    add('vida', 1, f'Entre {opts[0]}, {opts[1]} y {opts[2]}, ¿cuál NO es {kind}?', o, [a, b], f'{o.capitalize()} es {other}; {a} y {b} son {kind.split()[1]}s.', 'odd-fv')
allw = [w for p in ANTONIMOS for w in p]
for a, b in ANTONIMOS:
    add('verbal', 1, f'¿Cuál es lo contrario de «{a}»?', b, two(allw, [a, b]), f'Lo contrario de «{a}» es «{b}».', 'ant')
    add('verbal', 1, f'¿Cuál es lo contrario de «{b}»?', a, two(allw, [a, b]), f'Lo contrario de «{b}» es «{a}».', 'ant')
alls = [w for p in SINONIMOS for w in p]
for a, b in SINONIMOS:
    add('verbal', 2, f'¿Qué palabra significa lo mismo que «{a}»?', b, two(alls, [a, b]), f'«{a}» y «{b}» son sinónimos.', 'sin')
    add('verbal', 2, f'¿Qué palabra es sinónimo de «{b}»?', a, two(alls, [a, b]), f'«{b}» y «{a}» son sinónimos.', 'sin')
for l, pais in LUGARES:
    add('geografia', 2, f'¿En qué país está {l}?', pais, two([x[1] for x in LUGARES] + [p[0] for p in PAISES[:40]], [pais]), f'{l[0].upper() + l[1:]} está en {pais}.', 'lug')
for inv, quien in INVENTOS:
    add('historia', 3, f'¿A quién se atribuye {inv}?', quien, two([x[1] for x in INVENTOS], [quien]), f'{inv[0].upper() + inv[1:]} se atribuye a {quien}.', 'inv')
for dep, n in DEPORTES_JUGADORES:
    add('deportes', 2, f'¿Cuántos jugadores tiene en el campo cada equipo de {dep}?', n, [n + 1, n - 2 if n > 3 else n + 3], f'En {dep} juegan {n} por equipo.', 'dep')
for obra, autor in PINTORES:
    add('arte', 2, f'¿Quién pintó «{obra}»?', autor, two([x[1] for x in PINTORES], [autor]), f'«{obra}» es obra de {autor}.', 'pint')
for obra, autor in COMPOSITORES:
    add('arte', 3, f'¿Quién compuso {obra}?' if obra.startswith('la ') or obra.startswith('el ') else f'¿Quién compuso «{obra}»?', autor, two([x[1] for x in COMPOSITORES], [autor]), f'Esa obra es de {autor}.', 'comp')
for pais, trad in NAVIDAD_PAISES:
    add('tradiciones', 2, f'¿En qué país es típica esta costumbre navideña: {trad}?', pais, two([x[0] for x in NAVIDAD_PAISES], [pais]), f'En {pais} es tradición {trad}.', 'navp')
for org, fn in CUERPO:
    ao = ART_CUERPO[org]; verbo = 'sirven' if ao == 'los' else 'sirve'
    add('ciencias', 2, f'¿Para qué {verbo} {ao} {org}?', fn.capitalize(), [x.capitalize() for x in two([c[1] for c in CUERPO], [fn])], f'{ao.capitalize()} {org} {verbo} para {fn}.', 'cuerpo')
    add('ciencias', 2, f'¿Qué parte del cuerpo sirve para {fn}?', f'{ao.capitalize()} {org}', [f'{ART_CUERPO[x].capitalize()} {x}' for x in two([c[0] for c in CUERPO], [org])], f'{ao.capitalize()} {org} {verbo} para {fn}.', 'cuerpo')
meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
dias_mes = [31, '28 o 29', 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
for i, m in enumerate(meses):
    add('vida', 1, f'¿Qué mes del año es {m}?', f'El número {i+1}', [f'El número {x}' for x in R.sample([n for n in range(1, 13) if n != i + 1], 2)], f'{m.capitalize()} es el mes número {i+1}.', 'mes')
    add('vida', 1, f'¿Qué mes viene después de {m}?', meses[(i + 1) % 12], two(meses, [meses[(i + 1) % 12], m]), f'Después de {m} viene {meses[(i+1)%12]}.', 'mes')
    add('vida', 2, f'¿Cuántos días tiene el mes de {m}?', dias_mes[i], ['29' if dias_mes[i] != '28 o 29' else '30', '32' if i % 2 else '27'], f'{m.capitalize()} tiene {dias_mes[i]} días.', 'mes')
print('con tablas:', len(OUT))

# 4) Razonamiento numérico y lógica (hasta completar 10 000)
cosas = ['regalos', 'galletas', 'estrellas', 'cartas', 'renos', 'bastones de caramelo', 'juguetes', 'adornos', 'velas', 'campanas']
quien = ['Santa', 'Sabelina', 'Tinkarel', 'Estelvia', 'Nivarel', 'Melodina', 'Zafiriel', 'Nortelius', 'Boreal', 'Luminara']
def near(n, k=2):
    s = set()
    while len(s) < k:
        d = R.choice([-10, -5, -3, -2, -1, 1, 2, 3, 5, 10]); v = n + d
        if v >= 0 and v != n: s.add(v)
    return list(s)
def roman(n):
    v = [(1000, 'M'), (900, 'CM'), (500, 'D'), (400, 'CD'), (100, 'C'), (90, 'XC'), (50, 'L'), (40, 'XL'), (10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')]
    r = ''
    for a, s in v:
        while n >= a: r += s; n -= a
    return r
gens = []
def g_sum():
    a, b = R.randint(5, 400), R.randint(5, 400); w = R.choice(quien); c = R.choice(cosas)
    return 'matematico', 1 if a + b < 100 else 2, f'{w} tenía {a} {c} y recibió {b} más. ¿Cuántos {c} tiene ahora?', a + b, near(a + b), f'Se suman: {a} + {b} = {a+b}.'
def g_res():
    a = R.randint(30, 500); b = R.randint(5, a - 1); w = R.choice(quien); c = R.choice(cosas)
    return 'matematico', 1 if a < 100 else 2, f'{w} tenía {a} {c} y repartió {b}. ¿Cuántos le quedan?', a - b, near(a - b), f'Se restan: {a} − {b} = {a-b}.'
def g_mul():
    a, b = R.randint(2, 15), R.randint(2, 15); c = R.choice(cosas)
    return 'matematico', 1 if a * b < 50 else 2, f'Hay {a} cajas con {b} {c} cada una. ¿Cuántos {c} hay en total?', a * b, near(a * b), f'Se multiplica: {a} × {b} = {a*b}.'
def g_div():
    b, q = R.randint(2, 12), R.randint(2, 15); a = b * q; c = R.choice(cosas)
    return 'matematico', 2, f'Se reparten {a} {c} en partes iguales entre {b} niños. ¿Cuántos recibe cada uno?', q, near(q), f'Se divide: {a} ÷ {b} = {q}.'
def g_seq():
    a, d, n = R.randint(1, 60), R.randint(2, 15), 4
    s = [a + d * i for i in range(n)]
    return 'matematico', 2, f'¿Qué número sigue en la serie {", ".join(map(str, s))}…?', s[-1] + d, near(s[-1] + d), f'Cada número suma {d}: {s[-1]} + {d} = {s[-1]+d}.'
def g_seq2():
    a, r = R.randint(1, 6), R.choice([2, 3]); s = [a * r ** i for i in range(4)]
    return 'matematico', 3, f'¿Qué número sigue en la serie {", ".join(map(str, s))}…?', s[-1] * r, near(s[-1] * r), f'Cada número se multiplica por {r}: {s[-1]} × {r} = {s[-1]*r}.'
def g_rom():
    n = R.randint(1, 2026)
    return 'historia', 1 if n < 40 else 2 if n < 400 else 3, f'¿Qué número representa «{roman(n)}» en números romanos?', n, near(n), f'{roman(n)} = {n}.'
def g_rom2():
    n = R.randint(1, 1000); w = [roman(x) for x in near(n)]
    return 'historia', 1 if n < 40 else 2 if n < 400 else 3, f'¿Cómo se escribe {n} en números romanos?', roman(n), w, f'{n} se escribe {roman(n)}.'
def g_time():
    h = R.randint(2, 48)
    return 'matematico', 1, f'¿Cuántos minutos hay en {h} horas?', h * 60, near(h * 60), f'{h} × 60 = {h*60} minutos.'
def g_time2():
    d = R.randint(2, 60)
    return 'matematico', 1, f'¿Cuántas horas hay en {d} días?', d * 24, near(d * 24), f'{d} × 24 = {d*24} horas.'
def g_weeks():
    w = R.randint(2, 52)
    return 'matematico', 1, f'¿Cuántos días hay en {w} semanas?', w * 7, near(w * 7), f'{w} × 7 = {w*7} días.'
def g_money():
    p, q = R.randint(2, 25), R.randint(2, 9); pay = (p * q // 10 + 1) * 10 + R.choice([0, 10, 50])
    return 'matematico', 2, f'Compras {q} adornos de {p} monedas cada uno y pagas con {pay}. ¿Cuánto vuelto recibes?', pay - p * q, near(pay - p * q), f'Gastas {q} × {p} = {p*q}; vuelto: {pay} − {p*q} = {pay-p*q}.'
def g_half():
    n = R.randint(2, 300) * 2
    return 'matematico', 1, f'¿Cuánto es la mitad de {n}?', n // 2, near(n // 2), f'{n} ÷ 2 = {n//2}.'
def g_pct():
    p = R.choice([10, 20, 25, 50, 75]); n = R.randint(2, 40) * 20
    return 'matematico', 3, f'¿Cuánto es el {p} % de {n}?', n * p // 100, near(n * p // 100), f'El {p} % de {n} es {n} × {p} ÷ 100 = {n*p//100}.'
def g_peri():
    a, b = R.randint(2, 40), R.randint(2, 40)
    return 'matematico', 2, f'Un rectángulo mide {a} cm de largo y {b} cm de ancho. ¿Cuál es su perímetro?', f'{2*(a+b)} cm', [f'{x} cm' for x in near(2 * (a + b))], f'Perímetro = 2 × ({a} + {b}) = {2*(a+b)} cm.'
def g_area():
    a, b = R.randint(2, 30), R.randint(2, 30)
    return 'matematico', 2, f'¿Cuál es el área de un rectángulo de {a} m por {b} m?', f'{a*b} m²', [f'{x} m²' for x in near(a * b)], f'Área = {a} × {b} = {a*b} m².'
def g_double():
    n = R.randint(3, 500); k = R.choice([('doble', 2), ('triple', 3)])
    return 'matematico', 1, f'¿Cuál es el {k[0]} de {n}?', n * k[1], near(n * k[1]), f'El {k[0]} de {n} es {n} × {k[1]} = {n*k[1]}.'
def g_age():
    a, b = R.randint(5, 12), R.randint(2, 30)
    w = R.choice(quien)
    return 'matematico', 2, f'Hoy {w} cumple {a} años. ¿Cuántos años tendrá dentro de {b} años?', a + b, near(a + b), f'{a} + {b} = {a+b} años.'
def g_legs():
    n, m = R.randint(1, 20), R.randint(1, 20)
    return 'matematico', 3, f'En el establo hay {n} renos y {m} gallinas. ¿Cuántas patas hay en total?', 4 * n + 2 * m, near(4 * n + 2 * m), f'Renos: {n} × 4 = {4*n}; gallinas: {m} × 2 = {2*m}; total {4*n+2*m}.'
def g_clock():
    h, add_ = R.randint(1, 10), R.randint(1, 8)
    e = h + add_; e12 = (e - 1) % 12 + 1
    return 'matematico', 2, f'Si son las {h}:00 y pasan {add_} horas, ¿qué hora marcará un reloj de 12 horas?', f'Las {e12}:00', [f'Las {(e12 + d - 1) % 12 + 1}:00' for d in (1, 2)], f'{h} + {add_} = {e}; en un reloj de 12 horas son las {e12}:00.'
gens = [g_sum, g_res, g_mul, g_div, g_seq, g_seq2, g_rom, g_rom2, g_time, g_time2, g_weeks, g_money, g_half, g_pct, g_peri, g_area, g_double, g_age, g_legs, g_clock]
tries = 0
while len(OUT) < TOTAL and tries < 400000:
    tries += 1
    cat, lvl, q, a, w, e = R.choice(gens)()
    add(cat, lvl, q, a, w, e, 'num')
print('total:', len(OUT))

# 5) Validación y escritura
assert len(OUT) == TOTAL, len(OUT)
assert len({norm(q['question']) for q in OUT}) == TOTAL
for q in OUT:
    assert q['answer'] not in q['wrong'] and len(set(q['wrong'])) == 2 and q['level'] in (1, 2, 3)
cats = {}
for q in OUT: cats[q['category']] = cats.get(q['category'], 0) + 1
print(json.dumps(cats, ensure_ascii=False))
with open(os.path.join(ROOT, 'quiz-data.js'), 'w', encoding='utf-8') as f:
    f.write('window.SANTA_QUIZ = ' + json.dumps(OUT, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('quiz-data.js escrito:', os.path.getsize(os.path.join(ROOT, 'quiz-data.js')) // 1024, 'KB')
