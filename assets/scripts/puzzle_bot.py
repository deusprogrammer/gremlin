#!/usr/bin/python3

from gremlin.assets.scripts.puzzle_bot_api import activatePuzzle, solvePuzzle
from puzzle_bot_api import *

## Configuration

PUZZLE_ID = "microscope"

## Event listeners

def onActivate(body):
    print(f'Puzzle {PUZZLE_ID} activated')
    activatePuzzle(PUZZLE_ID)

def onReset(body):
    print(f'Puzzle {PUZZLE_ID} reset')

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