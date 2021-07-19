import socket
import requests
import json
import threading
import os
import hashlib
import hmac
import base64
import time

serverData = {
}

status = "up"

def make_digest(message, key):
    key = bytes(key, 'UTF-8')
    message = bytes(message, 'UTF-8')
    digester = hmac.new(key, message, hashlib.sha1)
    signature1 = digester.digest()
    signature2 = base64.b64encode(signature1)

    return str(signature2, 'UTF-8')

def notifyServer(status, puzzleId):
    payload = {
        'eventType': status,
        'ts': time.time()
    }
    payload['sig'] = make_digest(payload['eventType'] + str(payload['ts']), os.getenv('SHARED_SECRET_KEY'))
    requests.post(f'http://{serverData.get("ipAddress")}:{serverData.get("port")}/puzzles/{puzzleId}/events', data = payload)

def pingServer(puzzleId):
    requests.post(f'http://{serverData.get("ipAddress")}:{serverData.get("port")}/puzzles/{puzzleId}/ping', data = {
        "status": status
    })

def getStatus():
    return status

def solvePuzzle(puzzleId):
    global status
    notifyServer("complete", puzzleId)
    status = "completed"

def failPuzzle(puzzleId):
    global status
    notifyServer("fail", puzzleId)
    status = "failed"

def activatePuzzle(puzzleId):
    global status
    notifyServer("activate", puzzleId)
    status = "activated"

def resetPuzzle(puzzleId):
    global status
    notifyServer("reset", puzzleId)
    status = "up"

def heartbeat(body, addr, puzzleId):
    serverData['ipAddress'] = addr[0]
    serverData['port'] = body.get("port")
    pingServer(puzzleId)

def mainEventLoop(puzzleId, eventListeners):
    running = True
    listener = threading.Thread(target=listenForBroadcast, args=(puzzleId, eventListeners))
    listener.start()

    while running:
        eventListeners['loop']()

# Networking setup
def listenForBroadcast(puzzleId, eventListeners):
    running = True

    UDP_IP = "0.0.0.0"
    UDP_PORT = 6234
    sock = socket.socket(socket.AF_INET, # Internet
                        socket.SOCK_DGRAM) # UDP
    sock.bind((UDP_IP, UDP_PORT))

    while running:
        data, addr = sock.recvfrom(1024) # buffer size is 1024 bytes
        body = json.loads(data)
        sig = make_digest(body['type'] + str(body['ts']), os.getenv('SHARED_SECRET_KEY'))

        print(sig, 'vs', body['sig'])

        if body['sig'] != sig:
            print("Invalid signature, dropping message")
            continue

        if body['type'] == "ping":
            heartbeat(body, addr, puzzleId)
            eventListeners['onHeartBeat'](body)
        elif body['type'] == "activate" and body['puzzle'] == puzzleId:
            eventListeners['onActivate'](body)
        elif body['type'] == "reset" and body['puzzle'] == puzzleId:
            eventListeners['onReset'](body)
        elif body['type'] == "solve" and body['puzzle'] == puzzleId:
            eventListeners['onReset'](body)