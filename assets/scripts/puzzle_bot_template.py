#!/usr/bin/python3

import socket
import requests
import json
import threading

from puzzle_bot_api import *

## Configuration

PUZZLE_ID = "<PUZZLE_ID_HERE>"

## Event listeners

def onActivate(body):
    print(f'Puzzle {PUZZLE_ID} activated')

def onReset(body):
    print(f'Puzzle {PUZZLE_ID} reset')

def onSolve(body):
    print(f'Puzzle {PUZZLE_ID} solved')

def onHeartBeat(body):
    print(f'Heartbeat')

def loop():
    pass

mainEventLoop(PUZZLE_ID, {
    'onActivate': onActivate,
    'onReset': onReset,
    'onSolve': onSolve,
    'onHeartBeat': onHeartBeat,
    'loop': loop
})