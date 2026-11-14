# server.py
import http.server
import socketserver
import os
import json
import time
import secrets
import hmac
import hashlib
import base64
import urllib.parse
from builder import rebuild_site

# 1. Load Configuration from .env
ENV_FILE = '.env'
CONFIG = {
    'ADMIN_USER': 'mugur',
    'ADMIN_PASS': '',
    'SECRET_KEY': '',
    'SERVER_PORT': 3757,
    'HOST': '127.0.0.1'
}

def load_env():
    if os.path.exists(ENV_FILE):
        with open(ENV_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    k = k.strip()
                    v = v.strip().strip("'").strip('"')
                    if k in CONFIG:
                        if k == 'SERVER_PORT':
                            CONFIG[k] = int(v)
                        else:
                            CONFIG[k] = v

    # Check OS environment variables (Docker & Proxmox Production overrides)
    for k in CONFIG:
        if os.environ.get(k):
            if k == 'SERVER_PORT':
                CONFIG[k] = int(os.environ[k])
            else:
                CONFIG[k] = os.environ[k]
    if os.environ.get('PORT'):
        CONFIG['SERVER_PORT'] = int(os.environ['PORT'])

    if not CONFIG['ADMIN_PASS']:
        import string
        chars = string.ascii_letters + string.digits + '!@#$%&*+='
        CONFIG['ADMIN_PASS'] = ''.join(secrets.choice(chars) for _ in range(20))
        CONFIG['SECRET_KEY'] = secrets.token_hex(32)
        with open(ENV_FILE, 'w', encoding='utf-8') as f:
            f.write(f"ADMIN_USER={CONFIG['ADMIN_USER']}\n")
            f.write(f"ADMIN_PASS={CONFIG['ADMIN_PASS']}\n")
            f.write(f"SECRET_KEY={CONFIG['SECRET_KEY']}\n")
            f.write(f"SERVER_PORT={CONFIG['SERVER_PORT']}\n")
            f.write(f"HOST={CONFIG['HOST']}\n")

load_env()

# In-memory rate limiting: IP -> [timestamp, timestamp, ...]
LOGIN_ATTEMPTS = {}
MAX_ATTEMPTS = 6
LOCKOUT_TIME = 60 # seconds

def is_rate_limited(ip):
    now = time.time()
    attempts = [t for t in LOGIN_ATTEMPTS.get(ip, []) if now - t < LOCKOUT_TIME]
    LOGIN_ATTEMPTS[ip] = attempts
    return len(attempts) >= MAX_ATTEMPTS

def record_attempt(ip):
    now = time.time()
    attempts = [t for t in LOGIN_ATTEMPTS.get(ip, []) if now - t < LOCKOUT_TIME]
    attempts.append(now)
    LOGIN_ATTEMPTS[ip] = attempts

# 2. Token Utilities (HMAC-SHA256 Signed Tokens)
def create_token(username):
    payload = {
        'u': username,
        'exp': int(time.time()) + (86400 * 7), # 7 days
        'nonce': secrets.token_hex(8)
    }
    payload_json = json.dumps(payload, separators=(',', ':')).encode('utf-8')
    payload_b64 = base64.urlsafe_b64encode(payload_json).decode('utf-8').rstrip('=')
    sig = hmac.new(CONFIG['SECRET_KEY'].encode('utf-8'), payload_b64.encode('utf-8'), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{sig}"

def verify_token(token_str):
    if not token_str or '.' not in token_str:
        return None
    try:
        payload_b64, sig = token_str.split('.', 1)
        expected_sig = hmac.new(CONFIG['SECRET_KEY'].encode('utf-8'), payload_b64.encode('utf-8'), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            return None
        
        # Add padding back
        pad = len(payload_b64) % 4
        if pad:
            payload_b64 += '=' * (4 - pad)
        payload_json = base64.urlsafe_b64decode(payload_b64.encode('utf-8'))
        payload = json.loads(payload_json)
        
        if payload.get('exp', 0) < time.time():
            return None # Expired
            
        if payload.get('u') != CONFIG['ADMIN_USER']:
            return None
            
        return payload.get('u')
    except Exception:
        return None

# 3. HTTP Request Handler
import mimetypes
mimetypes.init()
mimetypes.add_type('image/webp', '.webp')

class LuxuryAdminHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = http.server.SimpleHTTPRequestHandler.extensions_map.copy()
    extensions_map.update({
        '.webp': 'image/webp',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.svg': 'image/svg+xml'
    })

    def end_headers(self):
        # Security headers
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')

        # Cache control for static assets (images, css, js, fonts)
        req_path = getattr(self, 'path', '')
        clean_path = req_path.split('?')[0]
        if clean_path.startswith('/data/web-images/') or clean_path.endswith(('.webp', '.jpg', '.jpeg', '.png', '.svg', '.woff2', '.ttf', '.css', '.js')):
            self.send_header('Cache-Control', 'public, max-age=2592000, immutable')
        elif clean_path in ['/', '/index.html']:
            self.send_header('Cache-Control', 'public, max-age=60, must-revalidate')

        super().end_headers()

    def get_client_ip(self):
        return self.client_address[0] if self.client_address else '127.0.0.1'

    def get_auth_user(self):
        # 1. Check Authorization header
        auth_hdr = self.headers.get('Authorization', '')
        if auth_hdr.startswith('Bearer '):
            token = auth_hdr[7:].strip()
            user = verify_token(token)
            if user:
                return user
                
        # 2. Check Cookie header
        cookie_hdr = self.headers.get('Cookie', '')
        if 'session_757=' in cookie_hdr:
            for part in cookie_hdr.split(';'):
                part = part.strip()
                if part.startswith('session_757='):
                    token = part[12:].strip()
                    user = verify_token(token)
                    if user:
                        return user
        return None

    def send_json(self, status_code, data, cookies=None):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        if cookies:
            for c in cookies:
                self.send_header('Set-Cookie', c)
        self.end_headers()
        self.wfile.write(body)

    def do_HEAD(self):
        self.do_GET()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # Route: Healthcheck (GitOps Gate & Docker)
        if path == '/api/health':
            self.send_json(200, {
                'status': 'ok',
                'tenant': '757',
                'env': 'production',
                'service': '757-prinpreajma-gallery'
            })
            return

        # Route: Admin UI
        if path in ['/admin', '/admin/']:
            self.send_response(302)
            self.send_header('Location', '/admin.html')
            self.end_headers()
            return

        # Route: API Session Check
        if path == '/api/session':
            user = self.get_auth_user()
            if user:
                self.send_json(200, {'authenticated': True, 'user': user})
            else:
                self.send_json(200, {'authenticated': False})
            return

        # Route: API Data Bundle (Requires Auth)
        if path == '/api/data':
            user = self.get_auth_user()
            if not user:
                self.send_json(401, {'error': 'Neautorizat. Vă rugăm să vă autentificați.'})
                return
                
            try:
                with open('data/collection-index.json', 'r', encoding='utf-8') as f:
                    artworks = json.load(f)
                with open('data/categories/taxonomy.json', 'r', encoding='utf-8') as f:
                    categories = json.load(f)
                with open('data/site-content.json', 'r', encoding='utf-8') as f:
                    site_content = json.load(f)
                
                restoration_log = {}
                if os.path.exists('data/restoration-log.json'):
                    with open('data/restoration-log.json', 'r', encoding='utf-8') as f:
                        restoration_log = json.load(f)

                self.send_json(200, {
                    'ok': True,
                    'user': user,
                    'artworks': artworks,
                    'categories': categories,
                    'site_content': site_content,
                    'restoration_log_count': len(restoration_log),
                    'total_artworks': len(artworks)
                })
            except Exception as e:
                self.send_json(500, {'error': f'Eroare la citirea datelor: {str(e)}'})
            return

        # Static file handling
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        ip = self.get_client_ip()

        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length) if content_length > 0 else b'{}'
        try:
            req_data = json.loads(body.decode('utf-8'))
        except Exception:
            req_data = {}

        # Route: POST /api/login
        if path == '/api/login':
            if is_rate_limited(ip):
                self.send_json(429, {'error': 'Prea multe încercări eșuate. Așteptați 1 minut.'})
                return

            username = req_data.get('username', '').strip()
            password = req_data.get('password', '')

            user_match = hmac.compare_digest(username.encode('utf-8'), CONFIG['ADMIN_USER'].encode('utf-8'))
            pass_match = hmac.compare_digest(password.encode('utf-8'), CONFIG['ADMIN_PASS'].encode('utf-8'))

            if user_match and pass_match:
                token = create_token(username)
                cookie = f"session_757={token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800"
                self.send_json(200, {
                    'ok': True,
                    'user': username,
                    'token': token,
                    'message': 'Autentificare reușită.'
                }, cookies=[cookie])
            else:
                record_attempt(ip)
                self.send_json(401, {'error': 'Nume de utilizator sau parolă incorectă.'})
            return

        # Route: POST /api/logout
        if path == '/api/logout':
            cookie = "session_757=deleted; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
            self.send_json(200, {'ok': True, 'message': 'Deconectat cu succes.'}, cookies=[cookie])
            return

        # ALL OTHER POST ROUTES REQUIRE AUTHENTICATION
        user = self.get_auth_user()
        if not user:
            self.send_json(401, {'error': 'Neautorizat. Vă rugăm să vă autentificați.'})
            return

        # Route: POST /api/site-content
        if path == '/api/site-content':
            try:
                new_content = req_data.get('site_content')
                if not new_content or not isinstance(new_content, dict):
                    self.send_json(400, {'error': 'Date invalide.'})
                    return
                with open('data/site-content.json', 'w', encoding='utf-8') as f:
                    json.dump(new_content, f, indent=2, ensure_ascii=False)
                
                rebuild_site()
                self.send_json(200, {'ok': True, 'message': 'Textele site-ului au fost salvate și publicate!'})
            except Exception as e:
                self.send_json(500, {'error': f'Eroare la salvare: {str(e)}'})
            return

        # Route: POST /api/categories
        if path == '/api/categories':
            try:
                new_categories = req_data.get('categories')
                if not new_categories or not isinstance(new_categories, list):
                    self.send_json(400, {'error': 'Lista de categorii invalidă.'})
                    return
                with open('data/categories/taxonomy.json', 'w', encoding='utf-8') as f:
                    json.dump(new_categories, f, indent=2, ensure_ascii=False)
                
                rebuild_site()
                self.send_json(200, {'ok': True, 'message': 'Categoriile au fost actualizate și publicate!'})
            except Exception as e:
                self.send_json(500, {'error': f'Eroare la salvare: {str(e)}'})
            return

        # Route: POST /api/artwork
        if path == '/api/artwork':
            try:
                art_id = req_data.get('id')
                if not art_id:
                    self.send_json(400, {'error': 'ID operă lipsă.'})
                    return
                
                with open('data/collection-index.json', 'r', encoding='utf-8') as f:
                    artworks = json.load(f)
                
                target = None
                for it in artworks:
                    if it['id'] == art_id:
                        target = it
                        break
                        
                if not target:
                    self.send_json(404, {'error': f'Opera {art_id} nu a fost găsită.'})
                    return

                # Update editable fields
                if 'title' in req_data: target['title'] = req_data['title'].strip()
                if 'category_name' in req_data: target['category_name'] = req_data['category_name'].strip()
                if 'categories' in req_data and isinstance(req_data['categories'], list): target['categories'] = req_data['categories']
                if 'curatorial_note' in req_data: target['curatorial_note'] = req_data['curatorial_note'].strip()
                if 'critic_note' in req_data: target['critic_note'] = req_data['critic_note'].strip()
                if 'medium_hypothesis' in req_data: target['medium_hypothesis'] = req_data['medium_hypothesis'].strip()
                if 'visual_tags' in req_data:
                    tags = req_data['visual_tags']
                    if isinstance(tags, str):
                        tags = [t.strip().lstrip('#') for t in tags.split(',') if t.strip()]
                    target['visual_tags'] = tags
                if 'dimensions' in req_data: target['dimensions'] = req_data['dimensions'].strip()
                if 'date_created' in req_data: target['date_created'] = req_data['date_created'].strip()

                # 1. Save collection index
                with open('data/collection-index.json', 'w', encoding='utf-8') as f:
                    json.dump(artworks, f, indent=2, ensure_ascii=False)

                # 2. Update markdown file
                md_path = f'data/metadata/{art_id}.md'
                if os.path.exists(md_path):
                    with open(md_path, 'r', encoding='utf-8') as f:
                        lines = f.read().splitlines()
                    new_lines = []
                    in_curator = False
                    in_critic = False
                    for line in lines:
                        if line.startswith('title:'):
                            new_lines.append(f'title: "{target["title"]}"')
                        elif line.startswith('categories:'):
                            new_lines.append(f'categories: {json.dumps(target["categories"])}')
                        elif line.startswith('medium_hypothesis:'):
                            new_lines.append(f'medium_hypothesis: "{target["medium_hypothesis"]}"')
                        elif line.startswith('visual_tags:'):
                            new_lines.append(f'visual_tags: {json.dumps(target["visual_tags"])}')
                        elif line.startswith('## Curatorial Note'):
                            in_curator = True
                            in_critic = False
                            new_lines.append(line)
                            new_lines.append('')
                            new_lines.append(target['curatorial_note'])
                            new_lines.append('')
                        elif line.startswith('## Independent Critic Note'):
                            in_curator = False
                            in_critic = True
                            new_lines.append(line)
                            new_lines.append('')
                            new_lines.append(target['critic_note'])
                            new_lines.append('')
                        elif line.startswith('## ') or line.startswith('---'):
                            in_curator = False
                            in_critic = False
                            new_lines.append(line)
                        elif not in_curator and not in_critic:
                            new_lines.append(line)

                    with open(md_path, 'w', encoding='utf-8') as f:
                        f.write('\n'.join(new_lines) + '\n')

                # 3. Rebuild site html
                rebuild_site()
                self.send_json(200, {
                    'ok': True,
                    'item': target,
                    'message': f'Opera {art_id} a fost actualizată și publicată în galerie!'
                })
            except Exception as e:
                self.send_json(500, {'error': f'Eroare la actualizarea operei: {str(e)}'})
            return

        # Route: POST /api/rebuild
        if path == '/api/rebuild':
            try:
                rebuild_site()
                self.send_json(200, {'ok': True, 'message': 'Galeria a fost reconstruită integral din fișierele de date!'})
            except Exception as e:
                self.send_json(500, {'error': f'Eroare la reconstrucție: {str(e)}'})
            return

        self.send_json(404, {'error': 'Ruta API nu a fost găsită.'})

class ThreadingServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True

def run_server():
    preferred_port = CONFIG['SERVER_PORT']
    host = CONFIG['HOST']

    # Try preferred port (8080), fallback to 3757 or 8081 if occupied
    ports_to_try = [preferred_port, 8080, 3757, 8081]
    seen = set()
    unique_ports = [p for p in ports_to_try if not (p in seen or seen.add(p))]

    httpd = None
    bound_port = None
    for p in unique_ports:
        try:
            httpd = ThreadingServer((host, p), LuxuryAdminHandler)
            bound_port = p
            break
        except OSError as e:
            print(f"Port {p} nu a putut fi utilizat ({e}), încerc portul următor...")

    if not httpd:
        raise RuntimeError(f"Nu s-a putut deschide serverul pe niciunul din porturile: {unique_ports}")

    with httpd:
        print(f"==================================================")
        print(f"  757 — MUGUREL EMANUEL MANEA — SERVER ACTIV (MULTITHREADED)")
        print(f"  URL Galerie Publică:   http://localhost:{bound_port}/")
        print(f"  URL Panou Admin:       http://localhost:{bound_port}/admin")
        print(f"  Utilizator Admin:      {CONFIG['ADMIN_USER']}")
        print(f"  Parolă Generată:       {CONFIG['ADMIN_PASS']}")
        print(f"  Port Conectat:         {bound_port}")
        print(f"  Configurare:           .env")
        print(f"==================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServerul a fost oprit.")

if __name__ == '__main__':
    run_server()
