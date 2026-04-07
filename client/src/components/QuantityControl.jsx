import { useEffect, useState } from 'react'

export function QuantityControl({
  disabled = false,
  onDecrease,
  onIncrease,
  onCommit,
  value,
}) {
  const [draft, setDraft] = useState(String(value))

  useEffect(() => {
    setDraft(String(value))
  }, [value])

  function commitValue() {
    const nextValue = Number.parseInt(draft, 10)

    if (Number.isNaN(nextValue)) {
      setDraft(String(value))
      return
    }

    onCommit(nextValue)
  }

  return (
    <div className="quantity-control">
      <button disabled={disabled} type="button" onClick={onDecrease}>
        -
      </button>
      <input
        aria-label="Số lượng"
        disabled={disabled}
        inputMode="numeric"
        min="0"
        pattern="[0-9]*"
        type="text"
        value={draft}
        onBlur={commitValue}
        onChange={(event) => setDraft(event.target.value.replace(/[^\d]/g, ''))}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            commitValue()
          }
        }}
      />
      <button disabled={disabled} type="button" onClick={onIncrease}>
        +
      </button>
    </div>
  )
}
