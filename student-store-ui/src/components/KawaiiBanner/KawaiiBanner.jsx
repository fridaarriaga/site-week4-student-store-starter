import "./KawaiiBanner.css"

function KawaiiBanner() {
  const confetti = [
    { emoji: "✨", top: "10%", left: "6%" },
    { emoji: "🧁", top: "18%", left: "18%" },
    { emoji: "💖", top: "13%", left: "33%" },
    { emoji: "🍓", top: "22%", left: "48%" },
    { emoji: "✨", top: "12%", left: "63%" },
    { emoji: "🧁", top: "19%", left: "79%" },
    { emoji: "💖", top: "14%", left: "91%" },
    { emoji: "🍬", top: "70%", left: "10%" },
    { emoji: "✨", top: "78%", left: "23%" },
    { emoji: "🧁", top: "74%", left: "39%" },
    { emoji: "💗", top: "81%", left: "54%" },
    { emoji: "✨", top: "72%", left: "69%" },
    { emoji: "🍰", top: "80%", left: "82%" },
    { emoji: "💖", top: "73%", left: "94%" }
  ]

  return (
    <header className="KawaiiBanner">
      <div className="sprinkles" aria-hidden="true">
        {confetti.map((item, index) => (
          <span
            key={`${item.emoji}-${index}`}
            style={{ top: item.top, left: item.left }}
          >
            {item.emoji}
          </span>
        ))}
      </div>

      <h1>Frida&apos;s Tiendita</h1>
    </header>
  )
}

export default KawaiiBanner
