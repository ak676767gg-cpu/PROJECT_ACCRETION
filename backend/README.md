# ACCRETION private multiplayer arena

The full single-player game still works by opening `index.html`. It never starts a server or opens a network connection unless you explicitly select Multiplayer and Connect.

The optional backend uses **Python 3.10 or newer and its standard library**. No pip packages, Node.js, npm, accounts, database or paid service are required. Python is needed only on the computer hosting the arena.

## Same computer

1. Extract the complete game folder.
2. Open a terminal in that folder and run `python3 backend/server.py`. On Windows with the Python launcher, use `py -3 backend/server.py`.
3. Open `index.html`, choose Game modes, then Multiplayer arena.
4. Use `ws://127.0.0.1:8765`, choose a room code and player name, then Connect.
5. Open another browser window with the same room code to join the same arena.

If your browser blocks a connection from a local file, open `http://127.0.0.1:8765` instead. The optional server serves the same local game files. This fallback changes nothing about the offline single-player launch.

## Friends on the same network

Run `python3 backend/server.py --host 0.0.0.0 --port 8765` on the host. Permit that port through the host firewall for your private network. Friends open `http://HOST-LAN-IP:8765` and use `ws://HOST-LAN-IP:8765` in Multiplayer. Replace HOST-LAN-IP with the host computer's actual LAN address. Everyone must use the same room code. Stop the process with Ctrl+C when finished.

Room codes separate arenas; they are not passwords. Optionally set `ACCRETION_ACCESS_KEY` in the host's environment before starting. Share that key privately with players, who enter it in the Access key field. Do not put credentials into a WebSocket URL. The server does not save the key, rooms or chat to a database.

## Public hosting and encrypted connections

This release does not deploy anything. For a public server, provide a reachable host, domain, trusted TLS certificate and firewall configuration. The server accepts `--cert /path/to/certificate.pem --private-key /path/to/key.pem` and then serves HTTPS and WSS. Clients use `wss://YOUR-HOST:8765`. An HTTPS game page requires a secure WSS connection. A trusted reverse proxy that forwards WebSocket upgrades is another option.

Restrict browser origins with repeated `--origin` arguments, for example `--origin https://YOUR-DOMAIN --origin null`. The literal `null` permits local file clients. Origin checks are a browser restriction, not user authentication; use the access key for a private server. Plain `ws://` does not encrypt chat or the access key. Use WSS outside a trusted private network.

## Arena rules and boundaries

- Up to eight pilots per room, sixteen rooms, authoritative 30 Hz physics and 15 Hz snapshots.
- Shared finite asteroid fields, gravity, thrust, braking, boost, aimed turret combat, mass growth, collisions, respawn and text/image signals.
- Start at Moon scale by default. `--start-stage 0` through `--start-stage 14` changes the room's starting class.
- The server supplies a turret and validates mass, movement, combat, adaptation purchases and rewards. A client cannot grant itself arbitrary mass or resources.
- Original arena adaptations: pull, range, capture, thrust, brake, boost, yield, armor, resist, scanner and magnet. The seven orbit/ability adaptations and the engineering tree are disabled in this mode.
- This is a shared arena, not synchronized full campaign progression. Pets, engineering construction, remnant paths, nebula systems, boss runs and campaign save slots stay in the offline modes.
- Menus do not pause the shared world. Leaving disconnects your pilot; multiplayer has no persistent character account. Empty rooms expire after thirty seconds.
- Local quick signals accept PNG, JPEG, WebP or GIF files up to 96 KB and 2048 pixels per side. Other players' media is hidden by default. Text is limited to 96 characters and signals to one per three seconds.
- Messages, connections, room sizes and outbound queues are bounded. This small private-play backend has not undergone an independent security audit or a large-scale hosting load test.

## Troubleshooting

- Connection refused: check that the backend is running and that the host/port is correct.
- A friend cannot connect: `127.0.0.1` refers to their own machine. Use the host's LAN address and listen on `0.0.0.0`.
- Origin rejected: include the actual page origin in `--origin`, or `null` for a file-launched page.
- Secure-page connection blocked: use WSS with a browser-trusted certificate.
- Room full: select another room code. A room has eight slots.
- Performance: lower the game resolution, CPU budget and shader detail. Unlimited FPS cannot exceed your display/browser scheduling or hardware capacity.

Protocol and implementation references: [MDN WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket), [MDN client guide](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications), [Python asyncio streams](https://docs.python.org/3/library/asyncio-stream.html), [RFC 6455](https://www.rfc-editor.org/rfc/rfc6455).
