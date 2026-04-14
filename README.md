# Adivina el Impostor

**[Jugar ahora → https://impostor-game-5de48.web.app](https://impostor-game-5de48.web.app)**

Juego de palabras para grupos en el que un jugador (el impostor) recibe una pista diferente a la del resto y debe intentar pasar desapercibido durante la discusión.

## Cómo se juega

1. Cada jugador ve su palabra secreta en privado.
2. Por turnos, todos dan pistas relacionadas con su palabra sin decirla directamente.
3. Al terminar la ronda de pistas, el grupo vota quién creen que es el impostor.
4. Se revela el resultado: ¿fue descubierto o logró escapar?

**Ganan los jugadores** si votan mayoritariamente al impostor.  
**Gana el impostor** si los votos recaen sobre otra persona.

## Modos de juego

### Local
Todos los jugadores comparten el mismo dispositivo. Cada uno ve su palabra en privado y pasa el móvil al siguiente.

### Online
Cada jugador usa su propio dispositivo. El anfitrión crea una sala y comparte el código de 6 caracteres. Los demás se unen con ese código. Requiere conexión a internet.

## Configuración de partida

El anfitrión puede configurar antes de empezar:

- **Jugadores**: de 3 a 8 jugadores.
- **Pista para el impostor**: qué información recibe el impostor al ver su carta.
  - *Sin pista* — el impostor solo ve `???`. Máxima dificultad.
  - *Categoría* — el impostor ve la categoría de la palabra (ej. `Comida`).
  - *Palabra relacionada* — el impostor ve una palabra del mismo tema (ej. `Hamburguesa` cuando la real es `Pizza`). Opción por defecto.

## Categorías de palabras

El juego incluye más de 35 pares de palabras repartidos en 6 categorías:

| Categoría | Ejemplos |
|---|---|
| Comida | Pizza / Hamburguesa, Sushi / Ramen… |
| Deportes | Fútbol / Rugby, Tenis / Bádminton… |
| Animales | León / Tigre, Delfín / Orca… |
| Lugares | París / Roma, Playa / Piscina… |
| Entretenimiento | Harry Potter / El señor de los anillos… |
| Objetos | Guitarra / Bajo, Telescopio / Microscopio… |

## Tecnologías

- **React 19** + **TypeScript**
- **Vite** como bundler
- **Firebase Realtime Database** para el modo online

## Instalación y desarrollo

```bash
pnpm install
pnpm dev
```

```bash
pnpm build    # compilar para producción
pnpm preview  # previsualizar el build
```

Para el modo online se necesita un proyecto de Firebase con Realtime Database habilitada. Configura las credenciales en `src/firebase.ts`.
