#!/usr/bin/env python3
"""Explicit developer refresh only; runtime never accesses the network."""
from pathlib import Path
from urllib.request import Request,urlopen
from concurrent.futures import ThreadPoolExecutor,as_completed
import hashlib,json,time
import argparse,gzip
ap=argparse.ArgumentParser();ap.add_argument('--cache',type=Path,required=True);ap.add_argument('--output-dir',type=Path,default=Path(__file__).resolve().parents[1]);ap.add_argument('--retrieved',default='2026-10-21');opts=ap.parse_args();root=opts.cache;root.mkdir(parents=True,exist_ok=True)
(opts.output_dir/'vendor').mkdir(parents=True,exist_ok=True);(opts.output_dir/'test').mkdir(parents=True,exist_ok=True)
def get(year):
 p=root/f'T{year}c.txt';url=f'https://www.hko.gov.hk/tc/gts/time/calendar/text/files/T{year}c.txt'
 if p.exists():return year,len(p.read_bytes())
 for attempt in range(3):
  try:
   raw=urlopen(Request(url,headers={'User-Agent':'Aide calendar verification'}),timeout=25).read();assert str(year).encode() in raw and len(raw)>10000;p.write_bytes(raw);return year,len(raw)
  except Exception:
   if attempt==2:raise
   time.sleep(1)
with ThreadPoolExecutor(max_workers=4) as pool:
 for i,future in enumerate(as_completed([pool.submit(get,y) for y in range(1901,2101)]),1):
  y,n=future.result()
  if i%25==0 or i==200:print('downloaded',i,'/200; latest year',y,flush=True)

import re,json,hashlib,datetime
from pathlib import Path
monthNames={'正月':1,'二月':2,'三月':3,'四月':4,'五月':5,'六月':6,'七月':7,'八月':8,'九月':9,'十月':10,'十一月':11,'十二月':12}
digits={'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10,'二十':20,'三十':30}
def day(s):
 if s in digits:return digits[s]
 if s.startswith('初'):return digits[s[1:]]
 if s.startswith('十'):return 10+digits[s[1:]]
 if s.startswith('廿'):return 20+digits[s[1:]]
 raise ValueError(s)
year,month,leap=1900,11,False;rows=[];sources=[];starts=[];terms={}
for gy in range(1901,2101):
 p=root/f'T{gy}c.txt';raw=p.read_bytes();text=raw.decode('utf-8-sig');sources.append({'year':gy,'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)})
 count=0
 for line in text.splitlines():
  m=re.match(r'^(\d+)年(\d+)月(\d+)日\s+(\S+)\s+星期\S+(?:\s+(\S+))?',line)
  if not m:continue
  y,mo,d=map(int,m.group(1,2,3));date=datetime.date(y,mo,d);lunar=m[4];term=m[5];ld=1
  if '月' in lunar:
   leap=lunar.startswith(('閏','闰'));name=lunar[1:] if leap else lunar;month=monthNames[name]
   if month==1 and not leap:year=y
  else:ld=day(lunar)
  epoch=(date-datetime.date(1970,1,1)).days
  if ld==1 or not rows:starts.append([epoch,year,-month if leap else month,ld])
  if term:terms[date.isoformat()]=term
  rows.append([date.isoformat(),year,-month if leap else month,ld,term or '']);count+=1
 assert count==(366 if gy%4==0 and (gy%100!=0 or gy%400==0) else 365),(gy,count)
rows=[r for r in rows if r[0]<='2099-12-31']
assert len(rows)==72684,len(rows)
for a,b in zip(rows,rows[1:]):
 assert datetime.date.fromisoformat(b[0])-datetime.date.fromisoformat(a[0])==datetime.timedelta(days=1)
 if b[3]!=1:assert a[1:3]==b[1:3] and b[3]==a[3]+1,(a,b)
assert all(29<=starts[i+1][0]-s[0]<=30 for i,s in enumerate(starts[1:-1],1))
out={'schemaVersion':1,'range':['1901-01-01','2099-12-31'],'timeZone':'Asia/Shanghai','source':'Hong Kong Observatory Gregorian-Lunar Calendar Conversion Tables','url':'https://www.hko.gov.hk/tc/gts/time/conversion.htm','retrieved':opts.retrieved,'anchorSource':'https://www.hko.gov.hk/tc/gts/time/calendar/text/files/T1901c.txt','anchor':{'date':'1901-01-01','lunarYear':1900,'month':11,'day':11,'note':'首个不完整月份按1901表后续十二月月序恢复，另与ICU和lunar-javascript校验；API不可用。'},'monthStarts':starts,'solarTerms':terms,'uncertaintyYears':[2021,2051,2057,2083,2084,2089,2097],'files':sources}

reference=opts.output_dir/'vendor/hko-reference.json';reference.write_text(json.dumps(out,ensure_ascii=False,separators=(',',':'))+'\n')
fixture=opts.output_dir/'test/hko-days.json.gz';fixture.write_bytes(gzip.compress((json.dumps(rows,ensure_ascii=False,separators=(',',':'))+'\n').encode(),mtime=0))
provenance={'source':out['url'],'terms':'https://data.gov.hk/en/terms-and-conditions','attribution':'©香港特别行政区政府／香港天文台；离线提取日期事实，非官方认证产品。','retrieved':opts.retrieved,'sha256':hashlib.sha256(reference.read_bytes()).hexdigest(),'referenceDaysSha256':hashlib.sha256(fixture.read_bytes()).hexdigest(),'sourceFiles':len(sources),'comparedDays':len(rows)}
(opts.output_dir/'vendor/hko-provenance.json').write_text(json.dumps(provenance,ensure_ascii=False,indent=2)+'\n')
print('PASS',len(rows),'reference days;',len(starts),'month anchors;',len(sources),'source hashes')
