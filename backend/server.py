#!/usr/bin/env python3
"""ACCRETION private arena. Python 3.10+, standard library only.

Run: python3 backend/server.py
The offline client needs none of this. Rooms and chat are memory-only.
"""
import argparse
import asyncio
import base64
import hashlib
import hmac
import json
import math
import mimetypes
import os
from pathlib import Path
import random
import re
import ssl
import struct
import time
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent.parent
MAX_FRAME = 150_000
MAX_ROOMS = 16
MAX_PLAYERS = 8
TICK = 1 / 30
ADAPTATIONS = {'pull': 5, 'range': 5, 'capture': 4, 'thrust': 5, 'brake': 3,
               'boost': 3, 'yield': 4, 'armor': 4, 'resist': 3, 'scanner': 3,
               'pulse': 3, 'amplify': 3, 'shield': 3, 'magnet': 4,
               'flow': 4, 'intake': 4, 'disk': 4, 'harmony': 3}
ARENA_ADAPTATIONS = {'pull','range','capture','thrust','brake','boost','yield','armor','resist','scanner','magnet'}

def clamp(x, lo, hi):
    return max(lo, min(hi, x))

def clean_text(s, limit=96):
    return re.sub(r'[\x00-\x1f\x7f<>]', '', str(s))[:limit]

def finite(v):
    return type(v) in (int, float) and math.isfinite(v)

def unit(m):
    return max(1e-6, m) ** .25

def stage(m):
    return int(clamp(math.floor(math.log(max(1, m), 5) + 1e-10), 0, 14))

def radius(m):
    return 12 * max(m, .000001) ** .30

def frame(payload, opcode=1):
    raw = payload.encode('utf8') if isinstance(payload, str) else payload
    n = len(raw)
    header = bytes([128 | opcode, n]) if n < 126 else bytes([128 | opcode, 126]) + struct.pack('!H', n) if n <= 65535 else bytes([128 | opcode, 127]) + struct.pack('!Q', n)
    return header + raw

async def read_frame(reader):
    first, second = await reader.readexactly(2)
    if first & 0x70 or not second & 0x80:
        raise ValueError('Invalid frame flags or missing client mask')
    opcode, final, n = first & 15, bool(first & 128), second & 127
    if opcode not in (0, 1, 8, 9, 10):
        raise ValueError('Unsupported frame opcode')
    if n == 126:
        n = struct.unpack('!H', await reader.readexactly(2))[0]
    elif n == 127:
        n = struct.unpack('!Q', await reader.readexactly(8))[0]
    if n > MAX_FRAME or opcode >= 8 and (not final or n > 125):
        raise ValueError('Frame size limit')
    mask = await reader.readexactly(4)
    raw = await reader.readexactly(n)
    return opcode, final, bytes(v ^ mask[i % 4] for i, v in enumerate(raw))

class Client:
    def __init__(self, reader, writer):
        self.reader, self.writer = reader, writer
        self.room = None
        self.id = 0
        self.queue = asyncio.Queue(maxsize=8)
        self.alive = True
        self.input_at = 0
        self.last_chat = -100
        self.tokens = 90
        self.refill_at = time.monotonic()
        self.sender = None

    def send(self, message):
        if not self.alive:
            return
        raw = frame(json.dumps(message, separators=(',', ':'), allow_nan=False))
        try:
            self.queue.put_nowait(raw)
        except asyncio.QueueFull:
            # A stalled client must not delay the simulation or other players.
            self.alive = False
            self.writer.close()

    async def send_loop(self):
        try:
            while self.alive:
                self.writer.write(await self.queue.get())
                await asyncio.wait_for(self.writer.drain(), timeout=3)
        except (ConnectionError, asyncio.TimeoutError, asyncio.CancelledError):
            self.alive = False
            self.writer.close()

    def allowed(self):
        now = time.monotonic()
        self.tokens = min(90, self.tokens + (now - self.refill_at) * 45)
        self.refill_at = now
        if self.tokens < 1:
            return False
        self.tokens -= 1
        return True

class Room:
    def __init__(self, name, start_stage=4, seed=None):
        self.name, self.start_stage = name, start_stage
        self.rng = random.Random(seed)
        self.clients = {}
        self.players = {}
        self.rocks = {}
        self.shots = []
        self.serial = 100
        self.time = 0
        self.snapshot_clock = 0
        self.respawn_clock = 0
        self.empty_since = time.monotonic()

    def body(self, m, x=0, y=0, kind='rock'):
        self.serial += 1
        return dict(id=self.serial, x=x, y=y, m=m, r=radius(m), vx=0., vy=0.,
                    hp=100., name='', kind=kind, seed=self.rng.randrange(1, 100000),
                    stage=stage(m), grace=0., material='rock')

    def join(self, client, name):
        if len(self.clients) >= MAX_PLAYERS:
            return False
        m = 5 ** self.start_stage
        angle = len(self.players) * 2.4
        b = self.body(m, math.cos(angle) * 420 * unit(m), math.sin(angle) * 420 * unit(m), 'player')
        b.update(name=clean_text(name, 24) or 'Pilot', grace=8, levels={'outpost':1, 'turret':1, 'boost':1}, points=3,
                 boost=1., captures=0, defeats=0, claims=set(), input={}, fire_in=0., input_at=0.)
        self.clients[b['id']] = client
        self.players[b['id']] = b
        client.id, client.room = b['id'], self
        if not self.rocks:
            for _ in range(170):
                self.spawn_rock()
        client.send({'type':'welcome', 'id':b['id'], **self.snapshot(client.id)})
        self.broadcast({'type':'event', 'title':'PILOT JOINED', 'text':b['name']+' entered the arena.'})
        return True

    def leave(self, client):
        self.clients.pop(client.id, None)
        self.players.pop(client.id, None)
        if not self.clients:
            self.empty_since = time.monotonic()

    def spawn_rock(self):
        if len(self.rocks) >= 210 or not self.players:
            return
        p = self.rng.choice(list(self.players.values()))
        u = unit(p['m'])
        angle, distance = self.rng.random()*math.tau, self.rng.uniform(190, 1100)*u
        b = self.body(p['m']*self.rng.uniform(.006, .055), p['x']+math.cos(angle)*distance, p['y']+math.sin(angle)*distance)
        b['vx'], b['vy'] = self.rng.uniform(-5, 5)*u, self.rng.uniform(-5, 5)*u
        b['material'] = 'ice' if self.rng.random() < .15 else 'rock'
        self.rocks[b['id']] = b

    def broadcast(self, msg):
        for c in list(self.clients.values()):
            c.send(msg)

    def handle(self, client, msg):
        p = self.players.get(client.id)
        if not p or not isinstance(msg, dict):
            return
        kind = msg.get('type')
        if kind == 'input':
            if not all(finite(msg.get(k)) for k in ('x','y','aim')):
                return
            x, y = clamp(msg['x'], -1, 1), clamp(msg['y'], -1, 1)
            d = max(1, math.hypot(x,y))
            p['input'] = dict(x=x/d, y=y/d, aim=msg['aim']%math.tau, fire=msg.get('fire') is True,
                              brake=msg.get('brake') is True, boost=msg.get('boost') is True)
            p['input_at'] = self.time
        elif kind == 'upgrade':
            key = msg.get('id')
            if key not in ARENA_ADAPTATIONS or p['points'] < 1 or p['levels'].get(key, 0) >= ADAPTATIONS[key]:
                client.send({'type':'event','title':'ARENA ADAPTATIONS','text':'Choose movement, gravity, growth, survey or armor. Offline-only abilities are unavailable here.'})
                return
            p['levels'][key] = p['levels'].get(key, 0)+1
            p['points'] -= 1
        elif kind == 'taunt' and self.time-client.last_chat >= 3:
            client.last_chat = self.time
            media = msg.get('media', '')
            if not isinstance(media,str) or len(media)>132000 or media and not re.fullmatch(r'data:image/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+',media):
                media = ''
            shape = msg.get('shape') if msg.get('shape') in ('speech','angular','banner','circle') else 'speech'
            self.broadcast({'type':'taunt','id':client.id,'text':clean_text(msg.get('text','')),'shape':shape,'media':media})

    def grow(self, p, amount):
        previous = p['m']
        p['m'] = min(5**14 * 4.99, p['m']+amount)
        p['r'], p['stage'] = radius(p['m']), stage(p['m'])
        for level in range(1,15):
            for label, threshold in [('half', 3*5**(level-1)), ('full', 5**level)]:
                key = (level, label)
                if previous < threshold <= p['m'] and key not in p['claims']:
                    p['claims'].add(key)
                    p['points'] = min(100,p['points']+1)

    def respawn(self, p, reason):
        client = self.clients.get(p['id'])
        if client:
            client.send({'type':'event','title':'CORE DISRUPTED','text':reason+' Respawned with five seconds of protection.'})
        m=5**self.start_stage
        p.update(m=m,r=radius(m),stage=self.start_stage,hp=100.,vx=0.,vy=0.,grace=5.,boost=1.)
        p['x'] += self.rng.uniform(-800,800)*unit(m)
        p['y'] += self.rng.uniform(-800,800)*unit(m)

    def damage(self, p, amount, owner=None):
        if p['grace']>0:
            return
        p['hp'] -= amount*(1-.18*p['levels'].get('armor',0))
        if p['hp']<=0:
            if owner is not None and owner in self.players:
                winner=self.players[owner]
                winner['defeats']+=1
                self.grow(winner,p['m']*.25)
            self.respawn(p,'An impact broke your cohesion.')

    def step(self, dt=TICK):
        self.time += dt
        players=list(self.players.values())
        for p in players:
            u=unit(p['m']);i=p['input'] if self.time-p['input_at']<.4 else {};levels=p['levels']
            x,y=i.get('x',0),i.get('y',0)
            boost=i.get('boost') and p['boost']>.03
            accel=48*u*(1+.2*levels.get('thrust',0))*(3.5 if boost else 1)
            p['vx']+=x*accel*dt;p['vy']+=y*accel*dt
            if i.get('brake'):
                p['vx']*=math.exp(-dt*(1.1+.5*levels.get('brake',0)));p['vy']*=math.exp(-dt*(1.1+.5*levels.get('brake',0)))
            p['boost']=clamp(p['boost']+dt*(-.35 if boost and (x or y) else .105),0,1)
            p['grace']=max(0,p['grace']-dt)
            p['hp']=min(100,p['hp']+dt*.7)
            speed=math.hypot(p['vx'],p['vy']);limit=(275 if boost else 155)*u*(1+.1*levels.get('thrust',0))
            if speed>limit:
                p['vx']*=limit/speed;p['vy']*=limit/speed
            p['x']+=p['vx']*dt;p['y']+=p['vy']*dt
            p['fire_in']-=dt
            if i.get('fire') and p['fire_in']<=0 and len(self.shots)<100:
                angle=i.get('aim',0);p['fire_in']=.7
                self.shots.append(dict(x=p['x']+math.cos(angle)*(p['r']+5*u),y=p['y']+math.sin(angle)*(p['r']+5*u),vx=p['vx']+math.cos(angle)*240*u,vy=p['vy']+math.sin(angle)*240*u,owner=p['id'],ttl=2.5))
        for b in list(self.rocks.values()):
            for p in players:
                dx,dy=p['x']-b['x'],p['y']-b['y'];d2=dx*dx+dy*dy;u=unit(p['m']);reach=440*u*(1+.2*p['levels'].get('range',0))
                if d2>reach*reach:
                    continue
                mu=18000*p['m']/u*(1+.22*p['levels'].get('pull',0));soft=d2+(p['r']*.4)**2;k=mu/max(1,soft**1.5)
                b['vx']+=dx*k*dt;b['vy']+=dy*k*dt
                if d2<(p['r']+b['r'])**2 and p['m']>b['m']*1.58:
                    self.grow(p,b['m']*(.86+.04*p['levels'].get('yield',0)));p['captures']+=1;self.rocks.pop(b['id'],None);break
            else:
                b['x']+=b['vx']*dt;b['y']+=b['vy']*dt
                if players and all(math.hypot(b['x']-p['x'],b['y']-p['y'])>1800*unit(p['m']) for p in players):self.rocks.pop(b['id'],None)
        for n,p in enumerate(players):
            for other in players[n+1:]:
                dx,dy=other['x']-p['x'],other['y']-p['y'];d=math.hypot(dx,dy) or 1
                for body,source,sign in [(p,other,1),(other,p,-1)]:
                    u=unit(body['m'])
                    if d<600*u and source['m']>body['m']*1.3 and body['grace']<=0:
                        k=18000*source['m']/u/(d*d+source['r']**2)*(1-.2*body['levels'].get('resist',0))
                        body['vx']+=sign*dx/d*k*dt;body['vy']+=sign*dy/d*k*dt
                if d<p['r']+other['r'] and p['grace']<=0 and other['grace']<=0:
                    big,small=(p,other) if p['m']>=other['m'] else (other,p)
                    self.damage(small,20,big['id']);self.damage(big,6,small['id']);small['grace']=1.5;big['grace']=1.5
                    push=80*unit(small['m']);sign=1 if small is other else -1;small['vx']+=sign*dx/d*push;small['vy']+=sign*dy/d*push
        for shot in self.shots:
            x,y=shot['x'],shot['y'];shot['x']+=shot['vx']*dt;shot['y']+=shot['vy']*dt;shot['ttl']-=dt
            dx,dy=shot['x']-x,shot['y']-y
            for b in players+list(self.rocks.values()):
                if b['id']==shot['owner']:continue
                along=clamp(((b['x']-x)*dx+(b['y']-y)*dy)/(dx*dx+dy*dy or 1),0,1)
                if math.hypot(b['x']-x-dx*along,b['y']-y-dy*along)<b['r']:
                    if b['kind']=='player':self.damage(b,12,shot['owner'])
                    else:
                        b['hp']-=40
                        if b['hp']<=0:
                            p=self.players.get(shot['owner'])
                            if p:self.grow(p,b['m']*.75);p['captures']+=1
                            self.rocks.pop(b['id'],None)
                    shot['ttl']=0;break
        self.shots=[s for s in self.shots if s['ttl']>0]
        self.respawn_clock-=dt
        if self.respawn_clock<=0:
            self.respawn_clock=.2
            for _ in range(3):self.spawn_rock()

    def snapshot(self, client_id):
        p=self.players.get(client_id)
        keys=('id','x','y','m','r','vx','vy','hp','name','kind','seed','stage','grace','material')
        return dict(bodies=[{k:b[k] for k in keys} for b in list(self.players.values())+list(self.rocks.values())],
                    you={k:p[k] for k in ('points','levels','boost','captures','defeats')} if p else None,
                    shots=[{k:s[k] for k in ('x','y','vx','vy')} for s in self.shots],tickRate=30,time=self.time)

class Server:
    def __init__(self,args):
        self.args=args;self.rooms={};self.connections=set();self.running=True

    async def static(self,writer,path):
        path=unquote(urlsplit(path).path)
        file=(ROOT/path.lstrip('/')).resolve() if path!='/' else ROOT/'index.html'
        allowed=file.is_relative_to(ROOT) and file.suffix in ('.html','.js','.css','.svg','.ico','.png','.gif','.jpg','.txt','.xml') and 'backend' not in file.relative_to(ROOT).parts
        if not allowed or not file.is_file():
            raw=(ROOT/'404.html').read_bytes();status='404 Not Found';mime='text/html'
        else:raw=file.read_bytes();status='200 OK';mime=mimetypes.guess_type(file)[0] or 'application/octet-stream'
        writer.write((f'HTTP/1.1 {status}\r\nContent-Type: {mime}\r\nContent-Length: {len(raw)}\r\nX-Content-Type-Options: nosniff\r\nConnection: close\r\n\r\n').encode()+raw)
        await writer.drain()

    async def connection(self,reader,writer):
        client=None
        try:
            raw=await asyncio.wait_for(reader.readuntil(b'\r\n\r\n'),8)
            if len(raw)>8192 or len(self.connections)>=128:raise ValueError('Connection limit')
            lines=raw.decode('latin1').split('\r\n');method,path,_=lines[0].split(' ',2)
            if method!='GET':raise ValueError('GET required')
            headers={k.strip().lower():v.strip() for k,v in (line.split(':',1) for line in lines[1:] if ':' in line)}
            if headers.get('upgrade','').lower()!='websocket':await self.static(writer,path);return
            if 'upgrade' not in headers.get('connection','').lower() or headers.get('sec-websocket-version')!='13':raise ValueError('Unsupported WebSocket version')
            key=headers.get('sec-websocket-key','')
            if len(base64.b64decode(key,validate=True))!=16:raise ValueError('Invalid key')
            origin=headers.get('origin','null')
            if self.args.origin and origin not in self.args.origin:raise ValueError('Origin is not allowed')
            accept=base64.b64encode(hashlib.sha1((key+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').encode()).digest()).decode()
            writer.write(f'HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: {accept}\r\n\r\n'.encode());await writer.drain()
            client=Client(reader,writer);self.connections.add(client);client.sender=asyncio.create_task(client.send_loop());parts=bytearray();fragmented=False
            while client.alive:
                opcode,final,payload=await asyncio.wait_for(read_frame(reader),30)
                if opcode==8:
                    writer.write(frame(payload[:125],8));await writer.drain();break
                if opcode==9:
                    client.queue.put_nowait(frame(payload,10));continue
                if opcode==10:continue
                if opcode==1:
                    if fragmented:raise ValueError('Unexpected new message')
                    parts=bytearray(payload);fragmented=not final
                elif opcode==0:
                    if not fragmented:raise ValueError('Unexpected continuation')
                    parts.extend(payload);fragmented=not final
                if len(parts)>MAX_FRAME:raise ValueError('Message limit')
                if not final:continue
                if not client.allowed():raise ValueError('Rate limit')
                try:msg=json.loads(parts.decode('utf8'),parse_constant=lambda _:None)
                except (ValueError,UnicodeError):raise ValueError('Invalid JSON')
                if not isinstance(msg,dict):continue
                if client.room:client.room.handle(client,msg);continue
                if msg.get('type')!='hello' or msg.get('version')!=1:raise ValueError('Hello protocol required')
                if self.args.key and not hmac.compare_digest(str(msg.get('key','')),self.args.key):
                    client.send({'type':'error','message':'Incorrect server access key.'});await asyncio.sleep(.05);break
                room=str(msg.get('room','')).upper()
                if not re.fullmatch('[A-Z0-9_-]{1,24}',room):raise ValueError('Invalid room')
                if room not in self.rooms:
                    if len(self.rooms)>=MAX_ROOMS:raise ValueError('Room limit')
                    self.rooms[room]=Room(room,self.args.start_stage)
                if not self.rooms[room].join(client,msg.get('name','Pilot')):
                    client.send({'type':'error','message':'This room is full (eight players).'});await asyncio.sleep(.05);break
        except (ValueError,ConnectionError,asyncio.IncompleteReadError,asyncio.LimitOverrunError,asyncio.TimeoutError,asyncio.QueueFull):
            pass
        finally:
            if client:
                client.alive=False
                if client.room:client.room.leave(client)
                if client.sender:client.sender.cancel()
                self.connections.discard(client)
            writer.close()
            try:await writer.wait_closed()
            except (ConnectionError,asyncio.CancelledError):pass

    async def tick_loop(self):
        deadline=time.monotonic()
        while self.running:
            for name,room in list(self.rooms.items()):
                if not room.clients:
                    if time.monotonic()-room.empty_since>30:self.rooms.pop(name,None)
                    continue
                room.step();room.snapshot_clock+=TICK
                if room.snapshot_clock>=1/15:
                    room.snapshot_clock=0
                    for client in list(room.clients.values()):client.send({'type':'snapshot',**room.snapshot(client.id)})
            deadline+=TICK
            if deadline<time.monotonic()-.2:deadline=time.monotonic()
            await asyncio.sleep(max(0,deadline-time.monotonic()))

async def main(args):
    tls=None
    if args.cert or args.private_key:
        if not (args.cert and args.private_key):raise SystemExit('Use --cert and --private-key together.')
        tls=ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER);tls.load_cert_chain(args.cert,args.private_key)
    game=Server(args)
    server=await asyncio.start_server(game.connection,args.host,args.port,limit=MAX_FRAME+8192,ssl=tls)
    print(f'ACCRETION arena: {"https" if tls else "http"}://{args.host}:{args.port}',flush=True)
    print('Offline launch is still index.html. Ctrl+C stops the optional backend.',flush=True)
    task=asyncio.create_task(game.tick_loop())
    try:
        async with server:await server.serve_forever()
    finally:game.running=False;task.cancel()

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--host',default='127.0.0.1')
    parser.add_argument('--port',type=int,default=8765)
    parser.add_argument('--start-stage',type=int,choices=range(0,15),default=4,metavar='0..14')
    parser.add_argument('--origin',action='append',default=[],help='Allowed browser Origin. Repeat; use null for file:// clients.')
    parser.add_argument('--cert');parser.add_argument('--private-key')
    args=parser.parse_args();args.key=os.environ.get('ACCRETION_ACCESS_KEY','')
    try:asyncio.run(main(args))
    except KeyboardInterrupt:pass
