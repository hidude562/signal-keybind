import { isNoteEvent, NoteEvent } from "@signal-app/core"
import { useStore } from "jotai"
import { useCallback } from "react"
import { MaxNoteNumber } from "../Constants"
import { Selection } from "../entities/selection/Selection"
import { useHistory } from "../hooks/useHistory"
import {
  cursorNoteNumberAtom,
  cursorTickAtom,
  lastNavigatedNoteNumberAtom,
  lastNoteDurationAtom,
  newNoteVelocityAtom,
  selectedNoteIdsAtom,
  selectionAnchorTickAtom,
  usePianoRoll,
  usePianoRollQuantizer,
} from "../hooks/usePianoRoll"
import { usePlayer } from "../hooks/usePlayer"
import { usePreviewNote } from "../hooks/usePreviewNote"
import { useTrack } from "../hooks/useTrack"
import { eventsInSelection, useSelectNote } from "./selection"

const noteNameToSemitone: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
}

// Consolidated hook that shares dependencies across all navigation actions.
// This avoids creating duplicate useTrack/usePianoRoll/useHistory/usePlayer/etc.
// hook instances for each individual action, reducing total hook count significantly.
export const usePianoRollNavigationActions = () => {
  // === Shared dependencies (each called once) ===
  const {
    selectedTrackId,
    setCursorTick,
    setCursorNoteNumber,
    setLastNavigatedNoteNumber,
    setSelectedNoteIds,
    setSelection,
    setMouseMode,
    setSelectionAnchorTick,
  } = usePianoRoll()
  const store = useStore()
  const {
    getEvents,
    getEventById,
    addEvent,
    removeEvents,
    updateEvents,
  } = useTrack(selectedTrackId)
  const { setPosition } = usePlayer()
  const { quantizeUnit } = usePianoRollQuantizer()
  const { pushHistory } = useHistory()
  const selectNote = useSelectNote()
  const { previewNoteOn } = usePreviewNote()

  // === Action callbacks ===

  // Move keyboard cursor by ±1 quantize step (A/D keys)
  const moveCursor = useCallback(
    (direction: 1 | -1) => {
      setCursorTick((prev: number) => {
        const next = Math.max(0, prev + direction * quantizeUnit)
        setPosition(next)
        return next
      })
    },
    [setCursorTick, setPosition, quantizeUnit],
  )

  // Navigate to the nearest note at a different tick, choosing by pitch proximity (Left/Right)
  const selectNoteByProximity = useCallback(
    (direction: 1 | -1) => {
      const selectedNoteIds = store.get(selectedNoteIdsAtom)
      const lastNavigatedNoteNumber = store.get(lastNavigatedNoteNumberAtom)
      const cursorTick = store.get(cursorTickAtom)

      const allNotes = getEvents().filter(isNoteEvent)
      if (allNotes.length === 0) return

      let referenceTick: number
      let referenceNoteNumber: number

      if (selectedNoteIds.length > 0) {
        const selectedNote = allNotes.find((n) => n.id === selectedNoteIds[0])
        if (!selectedNote) return
        referenceTick = selectedNote.tick
        referenceNoteNumber = lastNavigatedNoteNumber
      } else {
        referenceTick = cursorTick
        referenceNoteNumber = lastNavigatedNoteNumber
      }

      const uniqueTicks = [...new Set(allNotes.map((n) => n.tick))].sort(
        (a, b) => a - b,
      )

      let currentTickIndex = uniqueTicks.indexOf(referenceTick)
      if (currentTickIndex === -1) {
        if (direction === 1) {
          currentTickIndex = uniqueTicks.findIndex((t) => t > referenceTick)
          if (currentTickIndex === -1) return
          currentTickIndex -= 1
        } else {
          for (let i = uniqueTicks.length - 1; i >= 0; i--) {
            if (uniqueTicks[i] < referenceTick) {
              currentTickIndex = i + 1
              break
            }
          }
          if (currentTickIndex === -1) return
        }
      }

      const targetTickIndex = currentTickIndex + direction
      if (targetTickIndex < 0 || targetTickIndex >= uniqueTicks.length) return

      const targetTick = uniqueTicks[targetTickIndex]
      const notesAtTick = allNotes.filter((n) => n.tick === targetTick)

      let closest: NoteEvent | undefined
      let closestDistance = Infinity
      for (const note of notesAtTick) {
        const dist = Math.abs(note.noteNumber - referenceNoteNumber)
        if (dist < closestDistance) {
          closestDistance = dist
          closest = note
        }
      }

      if (!closest) return

      selectNote(closest.id)
      setLastNavigatedNoteNumber(closest.noteNumber)
      setCursorTick(closest.tick)
      setPosition(closest.tick)
      previewNoteOn(closest.noteNumber, closest.duration)
    },
    [
      store,
      getEvents,
      selectNote,
      previewNoteOn,
      setCursorTick,
      setPosition,
      setLastNavigatedNoteNumber,
    ],
  )

  // Cycle through notes at the same tick (Ctrl+Up/Ctrl+Down)
  const cycleSameTickNote = useCallback(
    (direction: 1 | -1) => {
      const selectedNoteIds = store.get(selectedNoteIdsAtom)
      if (selectedNoteIds.length === 0) return

      const allNotes = getEvents().filter(isNoteEvent)
      const currentNote = allNotes.find((n) => n.id === selectedNoteIds[0])
      if (!currentNote) return

      const notesAtSameTick = allNotes
        .filter((n) => n.tick === currentNote.tick)
        .sort((a, b) => a.noteNumber - b.noteNumber)

      if (notesAtSameTick.length <= 1) return

      const currentIndex = notesAtSameTick.findIndex(
        (n) => n.id === currentNote.id,
      )
      const nextIndex = currentIndex + direction
      if (nextIndex < 0 || nextIndex >= notesAtSameTick.length) return

      const nextNote = notesAtSameTick[nextIndex]
      selectNote(nextNote.id)
      setLastNavigatedNoteNumber(nextNote.noteNumber)
      setCursorTick(nextNote.tick)
      setPosition(nextNote.tick)
      previewNoteOn(nextNote.noteNumber, nextNote.duration)
    },
    [
      store,
      getEvents,
      selectNote,
      previewNoteOn,
      setLastNavigatedNoteNumber,
      setCursorTick,
      setPosition,
    ],
  )

  // Input a note by letter key (C/D/E/F/G/A/B)
  // advance=true: move cursor forward by the note's duration after placing
  // advance=false (Shift+letter): place note at cursor without advancing
  const inputNoteByKey = useCallback(
    (noteName: string, advance: boolean = true) => {
      const semitone = noteNameToSemitone[noteName]
      if (semitone === undefined) return

      const cursorTick = store.get(cursorTickAtom)
      const cursorNoteNumber = store.get(cursorNoteNumberAtom)
      const newNoteVelocity = store.get(newNoteVelocityAtom)
      const lastNoteDuration = store.get(lastNoteDurationAtom)

      const octave = Math.floor(cursorNoteNumber / 12)
      const noteNumber = Math.min(127, Math.max(0, octave * 12 + semitone))

      pushHistory()

      const duration = lastNoteDuration ?? quantizeUnit
      const newEvent = addEvent({
        type: "channel",
        subtype: "note",
        tick: cursorTick,
        noteNumber,
        velocity: newNoteVelocity,
        duration,
      } as NoteEvent)

      if (newEvent) {
        setSelectedNoteIds([newEvent.id])
        setCursorNoteNumber(noteNumber)
        setLastNavigatedNoteNumber(noteNumber)
        previewNoteOn(noteNumber, duration)
      }

      if (advance) {
        const nextTick = cursorTick + duration
        setCursorTick(nextTick)
        setPosition(nextTick)
      }
    },
    [
      store,
      quantizeUnit,
      pushHistory,
      addEvent,
      setSelectedNoteIds,
      setCursorTick,
      setCursorNoteNumber,
      setLastNavigatedNoteNumber,
      previewNoteOn,
      setPosition,
    ],
  )

  // Change duration of selected notes (Shift+Left/Right when notes selected)
  const changeDuration = useCallback(
    (direction: 1 | -1) => {
      const selectedNoteIds = store.get(selectedNoteIdsAtom)
      if (selectedNoteIds.length === 0) return

      const minDuration = Math.max(1, Math.floor(quantizeUnit / 4))
      pushHistory()

      const updates: { id: number; duration: number }[] = []
      for (const id of selectedNoteIds) {
        const event = getEventById(id)
        if (event && isNoteEvent(event)) {
          updates.push({
            id,
            duration: Math.max(
              minDuration,
              event.duration + direction * quantizeUnit,
            ),
          })
        }
      }
      updateEvents(updates)
    },
    [store, getEventById, updateEvents, pushHistory, quantizeUnit],
  )

  // Expand time selection when nothing is selected (Shift+Left/Right)
  const expandSelection = useCallback(
    (direction: 1 | -1) => {
      const cursorTick = store.get(cursorTickAtom)
      let anchor = store.get(selectionAnchorTickAtom)

      setMouseMode("selection")

      if (anchor === null) {
        anchor = cursorTick
        setSelectionAnchorTick(anchor)
      }

      const newCursorTick = Math.max(0, cursorTick + direction * quantizeUnit)
      setCursorTick(newCursorTick)
      setPosition(newCursorTick)

      const selection = Selection.fromPoints(
        { tick: anchor, noteNumber: MaxNoteNumber },
        { tick: newCursorTick, noteNumber: 0 },
      )
      setSelection(selection)

      setSelectedNoteIds(
        eventsInSelection(getEvents(), selection).map((e) => e.id),
      )
    },
    [
      store,
      setCursorTick,
      setSelection,
      setSelectedNoteIds,
      setMouseMode,
      setSelectionAnchorTick,
      getEvents,
      quantizeUnit,
      setPosition,
    ],
  )

  // Delete selected notes and auto-select the previous note (Delete/Backspace)
  const deleteAndSelectPrevious = useCallback(() => {
    const selectedNoteIds = store.get(selectedNoteIdsAtom)
    const lastNavigatedNoteNumber = store.get(lastNavigatedNoteNumberAtom)
    if (selectedNoteIds.length === 0) return

    const allNotes = getEvents().filter(isNoteEvent)
    const selectedNote = allNotes.find((n) => n.id === selectedNoteIds[0])

    let prevNote: NoteEvent | undefined
    if (selectedNote) {
      const referenceTick = selectedNote.tick
      const selectedSet = new Set(selectedNoteIds)

      const uniqueTicks = [...new Set(allNotes.map((n) => n.tick))].sort(
        (a, b) => a - b,
      )
      const currentTickIndex = uniqueTicks.indexOf(referenceTick)

      if (currentTickIndex > 0) {
        const prevTick = uniqueTicks[currentTickIndex - 1]
        let closestDistance = Infinity
        for (const note of allNotes) {
          if (note.tick === prevTick && !selectedSet.has(note.id)) {
            const dist = Math.abs(note.noteNumber - lastNavigatedNoteNumber)
            if (dist < closestDistance) {
              closestDistance = dist
              prevNote = note
            }
          }
        }
      }

      if (!prevNote) {
        let closestDistance = Infinity
        for (const note of allNotes) {
          if (note.tick === referenceTick && !selectedSet.has(note.id)) {
            const dist = Math.abs(note.noteNumber - lastNavigatedNoteNumber)
            if (dist < closestDistance) {
              closestDistance = dist
              prevNote = note
            }
          }
        }
      }
    }

    pushHistory()
    removeEvents(selectedNoteIds)
    setSelection(null)

    if (prevNote) {
      selectNote(prevNote.id)
      setLastNavigatedNoteNumber(prevNote.noteNumber)
      setCursorTick(prevNote.tick)
      setPosition(prevNote.tick)
      previewNoteOn(prevNote.noteNumber, prevNote.duration)
    } else {
      setSelectedNoteIds([])
    }
  }, [
    store,
    getEvents,
    removeEvents,
    pushHistory,
    selectNote,
    previewNoteOn,
    setSelection,
    setSelectedNoteIds,
    setCursorTick,
    setPosition,
    setLastNavigatedNoteNumber,
  ])

  // Go to the beginning of the piece (Ctrl+Left when nothing selected)
  const goToBeginning = useCallback(() => {
    setCursorTick(0)
    setPosition(0)
    setSelectionAnchorTick(null)
  }, [setCursorTick, setPosition, setSelectionAnchorTick])

  // Jump to the last (most recent) note in the track (Ctrl+Right)
  const goToEnd = useCallback(() => {
    const allNotes = getEvents().filter(isNoteEvent)
    if (allNotes.length === 0) return

    let lastNote = allNotes[0]
    for (const note of allNotes) {
      if (note.tick > lastNote.tick) {
        lastNote = note
      }
    }

    selectNote(lastNote.id)
    setLastNavigatedNoteNumber(lastNote.noteNumber)
    setCursorTick(lastNote.tick)
    setPosition(lastNote.tick)
    setSelectionAnchorTick(null)
    previewNoteOn(lastNote.noteNumber, lastNote.duration)
  }, [
    getEvents,
    selectNote,
    previewNoteOn,
    setCursorTick,
    setPosition,
    setLastNavigatedNoteNumber,
    setSelectionAnchorTick,
  ])

  // Move selected notes by ±1 quantize step (Alt+Left/Right)
  const moveSelectedNotes = useCallback(
    (direction: 1 | -1) => {
      const selectedNoteIds = store.get(selectedNoteIdsAtom)
      if (selectedNoteIds.length === 0) return

      pushHistory()

      const delta = direction * quantizeUnit

      const updates: { id: number; tick: number }[] = []
      for (const id of selectedNoteIds) {
        const event = getEventById(id)
        if (event && isNoteEvent(event)) {
          updates.push({ id, tick: Math.max(0, event.tick + delta) })
        }
      }
      updateEvents(updates)

      setCursorTick((prev: number) => {
        const next = Math.max(0, prev + delta)
        setPosition(next)
        return next
      })
    },
    [
      store,
      getEventById,
      updateEvents,
      pushHistory,
      quantizeUnit,
      setCursorTick,
      setPosition,
    ],
  )

  return {
    moveCursor,
    selectNoteByProximity,
    cycleSameTickNote,
    inputNoteByKey,
    changeDuration,
    expandSelection,
    deleteAndSelectPrevious,
    goToBeginning,
    goToEnd,
    moveSelectedNotes,
  }
}

// Snap cursor to quantized floor (called on playback stop) - kept separate
// as it's used independently in PianoRoll.tsx
export const useSnapCursorToQuantize = () => {
  const { setCursorTick } = usePianoRoll()
  const { setPosition } = usePlayer()
  const { quantizeFloor } = usePianoRollQuantizer()

  return useCallback(() => {
    setCursorTick((prev: number) => {
      const snapped = quantizeFloor(prev)
      setPosition(snapped)
      return snapped
    })
  }, [setCursorTick, setPosition, quantizeFloor])
}
