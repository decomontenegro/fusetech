#!/usr/bin/env python3
"""
Simple HTTP Server for testing port connectivity
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import sys
import os

class CustomHTTPRequestHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        """Handle GET requests"""
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            
            html_content = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Python Test Server</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        max-width: 800px;
                        margin: 50px auto;
                        padding: 20px;
                        background-color: #f5f5f5;
                    }
                    .container {
                        background-color: white;
                        padding: 30px;
                        border-radius: 10px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    h1 {
                        color: #333;
                        text-align: center;
                    }
                    .info {
                        background-color: #e7f3ff;
                        padding: 15px;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    .success {
                        color: #27ae60;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🐍 Python HTTP Server</h1>
                    <div class="info">
                        <p class="success">✅ Server is running successfully!</p>
                        <p><strong>Port:</strong> 8000</p>
                        <p><strong>Python Version:</strong> """ + sys.version + """</p>
                        <p><strong>Current Directory:</strong> """ + os.getcwd() + """</p>
                    </div>
                    <p>This is a simple Python HTTP server for testing purposes.</p>
                </div>
            </body>
            </html>
            """
            self.wfile.write(html_content.encode())
        else:
            super().do_GET()
    
    def log_message(self, format, *args):
        """Custom log format"""
        sys.stdout.write("%s - - [%s] %s\n" %
                         (self.client_address[0],
                          self.log_date_time_string(),
                          format%args))

def main():
    PORT = 8000
    
    print(f"🐍 Starting Python HTTP Server on port {PORT}...")
    print(f"📁 Serving from: {os.getcwd()}")
    print(f"🌐 Access at: http://localhost:{PORT}")
    print("\nPress Ctrl+C to stop the server\n")
    
    try:
        with HTTPServer(('', PORT), CustomHTTPRequestHandler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()