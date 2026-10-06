"""Execute every SQL-result problem, including cardinality and age-range scenarios."""
import json,pathlib,sqlite3,re
root=pathlib.Path(__file__).resolve().parents[1]
questions=[]
for f in ['questions','reconstructed-extra','normalized']:
    d=json.loads((root/f'data/practical/{f}.json').read_text(encoding='utf8'))
    questions.extend(d['questions'] if isinstance(d,dict) else d)
counts={
    'R-SQL-0011':[('컴퓨터과',50),('인터넷과',100),('사무자동화과',50)],
    'R-SQL-0025':[('컴퓨터과',50),('인터넷과',100),('사무자동화과',50)],
    'R-IND-SQL-0008':[('전기과',50),('전산과',100),('전자과',50)]
}
ranges={'R-SQL-0006':('인사팀','이름','나이',20,3,6,35),'T-SQL-0006':('staff','name','age',24,4,8,38)}
def setup(db,tables):
    for t in tables:
        db.execute('CREATE TABLE "'+t['name']+'" ('+','.join('"'+c+'"' for c in t['columns'])+')')
        db.executemany('INSERT INTO "'+t['name']+'" VALUES ('+','.join('?' for c in t['columns'])+')',t['rows'])
def normalize(s):return re.sub(r'\s+','',str(s))
checked=0
for q in questions:
    if q['questionType']!='sql_result':continue
    if q['id'] in ranges:
        table,name,age,total,twenties,thirties,lower=ranges[q['id']]
        assert all(str(n) in q['question'] for n in [total,twenties,thirties]),q['id']+' scenario counts'
        assert re.search(r'BETWEEN\s+'+str(lower)+r'\s+AND\s+49',q['code'],re.I),q['id']+' bounds'
        actual=[]
        for a30 in [30,39]:
            rows=[[str(i),a] for i,a in enumerate([20]*twenties+[a30]*thirties+[40]*(total-twenties-thirties))]
            with sqlite3.connect(':memory:') as db:
                setup(db,[{'name':table,'columns':[name,age],'rows':rows}])
                actual.append(str(len(db.execute(q['code']).fetchall())))
        result=' '.join(actual)
    else:
        tables=q.get('tables')
        if q['id'] in counts:
            groups=counts[q['id']]
            assert all(str(n) in q['question'] for _,n in groups),q['id']+' scenario counts'
            tables=[{'name':'STUDENT','columns':['DEPT'],'rows':[[dept] for dept,n in groups for _ in range(n)]}]
        assert tables,q['id']+' missing source data'
        with sqlite3.connect(':memory:') as db:
            setup(db,tables)
            statements=[s.strip() for s in q['code'].split(';') if s.strip()]
            rows=[db.execute(s).fetchall() for s in statements]
            if q['id'] in counts:
                result=' '.join(str(len(r)) if i<2 else str(r[0][0]) for i,r in enumerate(rows))
            else:
                assert len(rows)==1,q['id']+' unclassified multi-query result'
                delim=q.get('sqlResultDelimiters') or {'row':'\n','column':' '}
                result=delim['row'].join(delim['column'].join('' if v is None else str(v) for v in row) for row in rows[0])
    assert normalize(result)==normalize(q['answer']),(q['id'],result,q['answer'])
    checked+=1
    print('PASS',q['id'])
assert checked==23
print('SQL RUNTIME: 23/23 passed; 0 failed (18 queries; 3 cardinality scenarios; 2 interval scenarios).')
