import { Fn, PromiseFn } from '../../@types/methods'
import { logSuccess } from '../../utility/logger'
import { Tracker, TrackerData } from '../../@types/tracker'
import { TrackerModel } from './trackerSchema'

let activeTrackers: Tracker[] = []

export const getActiveTrackers: Fn<void, Tracker[]> = () => {
  return activeTrackers
}

export const loadActiveTrackers: PromiseFn<void, void> = async () => {
  const loadedTrackers: Tracker[] = []
  const trackerCollection = await TrackerModel.find({})
  trackerCollection.forEach(tracker => {
    loadedTrackers.push(tracker)
  })
  activeTrackers = loadedTrackers
  logSuccess(`Loaded ${activeTrackers.length} trackers`, 'Database')
  return
}

export const saveActiveAccounts: PromiseFn<void, void> = async () => {
  const bulkOps = activeTrackers.map(tracker => {
    return {
      updateOne: {
        filter: { _id: tracker._id },
        update: tracker.toObject(),
        upsert: true,
      },
    }
  })
  await TrackerModel.bulkWrite(bulkOps)
  logSuccess(`Saved ${activeTrackers.length} trackers`, 'Database')
  return
}

export const createTracker: PromiseFn<TrackerData, Tracker> =
  async trackerData => {
    const newTracker = new TrackerModel(trackerData)
    activeTrackers.push(newTracker)
    await newTracker.save()

    return newTracker
  }

export const deleteTracker: PromiseFn<TrackerData, void> =
  async trackerData => {
    const index = activeTrackers.findIndex(
      tracker => tracker.targetId === trackerData.targetId
    )
    if (!index) return
    const tracker = activeTrackers[index]
    tracker.delete()
    activeTrackers.slice(index, 1)
  }
