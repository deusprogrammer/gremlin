import socket
import requests
import json
import threading

#######TEMPLATE#######

## Configuration

PUZZLE_ID = "microscope"

## Event listeners

def onActivate(body):
    console.log(f'Puzzle {PUZZLE_ID} activated')

def onReset(body):
    console.log(f'Puzzle {PUZZLE_ID} reset')

def onSolve(body):
    console.log(f'Puzzle {PUZZLE_ID} solved')

def loop():
    pass

#######/TEMPLATE######

serverData = {}

def notifyServer(status):
    requests.post(f'http://{addr[0]}:{addr[1]}/puzzles/{PUZZLE_ID}/events', data = {
        'eventType': status
    })

def pingServer():
    requests.post(f'http://{addr[0]}:{addr[1]}/puzzles/{PUZZLE_ID}/ping')

def solvePuzzle():
    notifyServer("complete")

def failPuzzle():
    notifyServer("fail")

def activatePuzzle():
    notifyServer("activate")

def onInitialize(body, addr):
    serverData = {'ipAddress': addr[0], 'port': addr[1]}
    pingServer()

def mainEventLoop():
    running = True

    while running:
        loop()

# Networking setup
def listenForBroadcast():
    running = True

    UDP_IP = "0.0.0.0"
    UDP_PORT = 6234
    sock = socket.socket(socket.AF_INET, # Internet
                        socket.SOCK_DGRAM) # UDP
    sock.bind((UDP_IP, UDP_PORT))

    while running:
        data, addr = sock.recvfrom(1024) # buffer size is 1024 bytes
        body = json.loads(data)
        if body.type == "initialize":
            onInitialize(body, addr)
        elif body.type == "activate":
            onActivate(body)
        elif body.type == "reset":
            onReset(body)
        elif body.type == "solve":
            onReset(body)

listener = threading.Thread(target=listenForBroadcast)
listener.start()

mainEventLoop()