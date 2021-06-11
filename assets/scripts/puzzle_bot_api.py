import socket
import requests
import json
import threading

serverData = {} 

def notifyServer(status, puzzleId):
    requests.post(f'http://{serverData.get("ipAddress")}:{serverData.get("port")}/puzzles/{puzzleId}/events', data = {
        'eventType': status
    })

def pingServer(puzzleId):
    requests.post(f'http://{serverData.get("ipAddress")}:{serverData.get("port")}/puzzles/{puzzleId}/ping')

def solvePuzzle(puzzleId):
    notifyServer("complete")

def failPuzzle(puzzleId):
    notifyServer("fail")

def activatePuzzle(puzzleId):
    notifyServer("activate", puzzleId)

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
        if body['type'] == "ping":
            heartbeat(body, addr, puzzleId)
            eventListeners['onHeartBeat'](body)
        elif body['type'] == "activate" and body['puzzle'] == puzzleId:
            eventListeners['onActivate'](body)
        elif body['type'] == "reset" and body['puzzle'] == puzzleId:
            eventListeners['onReset'](body)
        elif body['type'] == "solve" and body['puzzle'] == puzzleId:
            eventListeners['onReset'](body)