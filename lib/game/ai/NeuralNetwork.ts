// Feedforward MLP: (prevX, prevY) → shot type probabilities
// Output index order: 0=left-top 1=left-bottom 2=centre-top 3=centre-bottom 4=right-top 5=right-bottom

function randn(): number {
  return Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random())
}

function initWeights(rows: number, cols: number): number[][] {
  const scale = Math.sqrt(2 / (rows + cols))
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => randn() * scale)
  )
}

export class NeuralNetwork {
  private W1 = initWeights(16, 2)
  private b1 = new Array(16).fill(0) as number[]
  private W2 = initWeights(6, 16)
  private b2 = new Array(6).fill(0) as number[]

  forward(x: number, y: number): { h: number[]; probs: number[] } {
    const h = this.W1.map((row, i) =>
      Math.tanh(row[0] * x + row[1] * y + this.b1[i])
    )
    const logits = this.W2.map((row, j) =>
      row.reduce((s, w, k) => s + w * h[k], 0) + this.b2[j]
    )
    const maxL = Math.max(...logits)
    const exp = logits.map(l => Math.exp(l - maxL))
    const sum = exp.reduce((a, b) => a + b, 0)
    return { h, probs: exp.map(e => e / sum) }
  }

  train(x: number, y: number, targetIdx: number, lr: number): void {
    const { h, probs } = this.forward(x, y)
    const dOut = probs.map((p, i) => p - (i === targetIdx ? 1 : 0))

    const dH = new Array(16).fill(0) as number[]
    for (let j = 0; j < 6; j++) {
      for (let k = 0; k < 16; k++) {
        dH[k] += dOut[j] * this.W2[j][k]
        this.W2[j][k] -= lr * dOut[j] * h[k]
      }
      this.b2[j] -= lr * dOut[j]
    }
    for (let k = 0; k < 16; k++) {
      const g = dH[k] * (1 - h[k] * h[k])
      this.W1[k][0] -= lr * g * x
      this.W1[k][1] -= lr * g * y
      this.b1[k]    -= lr * g
    }
  }

  predict(x: number, y: number): number[] {
    return this.forward(x, y).probs
  }
}
