#!/usr/bin/python3

from gremlin.assets.scripts.puzzle_bot_api import resetPuzzle
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
    activatePuzzle(PUZZLE_ID)

def onReset(body):
    print(f'Puzzle {PUZZLE_ID} reset')
    resetPuzzle(PUZZLE_ID)

def onSolve(body):
    print(f'Puzzle {PUZZLE_ID} solved')
    solvePuzzle(PUZZLE_ID)

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