import os
import sys
import socket
import subprocess
import time

def get_local_ip():
    """
    Finds the active local network IP address of the host PC.
    """
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # Connecting to a public UDP address (doesn't send any packets) 
        # to determine the correct interface and local routing IP.
        s.connect(('10.255.255.255', 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

def main():
    local_ip = get_local_ip()
    
    # Elegant and clear terminal banner
    banner = f"""
======================================================================
  🚀 REGISTRE NATIONAL DU CANCER - SERVEUR CENTRAL ACTIF
======================================================================

  [✓] IP Locale Détectée : \033[1;32m{local_ip}\033[0m
  [✓] Statut du Serveur  : En cours de démarrage...

  ------------------------------------------------------------------
  💡 ACCÈS ET PARTAGE RÉSEAU :
  ------------------------------------------------------------------
  👉 Pour les ordinateurs Clients (Tauri Desktop App) :
     Saisissez ce code dans les paramètres réseau (icône engrenage) :
     👉 \033[1;36m{local_ip}\033[0m

  👉 Pour les Smartphones des Patients (Questionnaires) :
     Les QR codes générés redirigeront vers :
     👉 \033[1;34mhttp://{local_ip}:5050/habit/[token]\033[0m

  👉 Pour l'Administration Locale Directe :
     Accédez à l'API Django :
     👉 \033[1;35mhttp://localhost:8000/api/\033[0m
======================================================================
"""
    # Clean screen on Windows / Linux
    os.system('cls' if os.name == 'nt' else 'clear')
    print(banner)
    
    # Run the Django server bound to all network interfaces (0.0.0.0) on port 8000
    try:
        cmd = [sys.executable, 'manage.py', 'runserver', '0.0.0.0:8000']
        subprocess.run(cmd)
    except KeyboardInterrupt:
        print("\n[!] Serveur arrêté par l'utilisateur.")
    except Exception as e:
        print(f"\n[X] Erreur lors du lancement du serveur : {e}")

if __name__ == '__main__':
    main()
