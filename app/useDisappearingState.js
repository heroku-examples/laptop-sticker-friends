import { useState, useRef, useEffect } from 'react'

export default (initial, delay, max) => {
  const [items, setItems] = useState(initial)

  const ref = useRef(
    items.reduce((acc, [k, v], i) => {
      acc[k] = { index: i, value: v }
      return acc
    }, {})
  )

  const deleteRef = useRef([])

  const removeItem = (k) => {
    if (ref.current[k]) {
      // Mark it as deleted in a ref so we can access and clear the timeout later
      deleteRef.current.push(k)
      const index = ref.current[k].index
      setItems((prev) => [...prev.slice(0, index), ...prev.slice(index + 1)])
    }
  }

  const removeAll = () => {
    Object.keys(ref.current).forEach((k) => deleteRef.current.push(k))
    setItems([])
  }

  const updateItem = ([k, v]) => {
    if (ref.current[k]) {
      // Update an existing item
      const index = ref.current[k].index
      setItems((prev) => [
        ...prev.slice(0, index),
        [k, v],
        ...prev.slice(index + 1)
      ])
    }
  }

  const addItem = ([k, v]) => {
    if (ref.current[k]) {
      updateItem([k, v])
    } else if (items.length >= max) {
      // Too many items, remove from the beginning
      setItems((prev) => {
        deleteRef.current.push(
          ...prev.slice(0, prev.length - max + 1).map(([k]) => k)
        )
        return [...prev.slice(prev.length - max + 1), [k, v]]
      })
    } else {
      // Add an item
      setItems((prev) => [...prev, [k, v]])
    }
  }

  // When items change, add a new timeout for any that dont have one
  useEffect(() => {
    // Go through each current item and handle its timeout to clear it
    items.forEach(([key, value], index) => {
      if (!ref.current[key]) {
        // New key so create a new timeout
        ref.current[key] = {
          timeout: setTimeout(() => removeItem(key), delay),
          index,
          value
        }
      } else if (ref.current[key].timeout && ref.current[key].value !== value) {
        // The value of a key changed so reset the timeout
        clearTimeout(ref.current[key].timeout)
        ref.current[key] = {
          timeout: setTimeout(() => removeItem(key), delay),
          index,
          value
        }
      } else {
        // Otherwise keep the index updated
        ref.current[key].index = index
      }
    })

    deleteRef.current.forEach((key) => {
      clearTimeout(ref.current[key].timeout)
      delete ref.current[key]
    })
    deleteRef.current = []
  }, [items])

  // On final unmount cleanup any remaining timeouts
  useEffect(
    () => () =>
      Object.keys(ref.current).forEach((k) =>
        clearTimeout(ref.current[k].timeout)
      ),
    []
  )

  return [
    items,
    { add: addItem, remove: removeItem, update: updateItem, removeAll }
  ]
}
